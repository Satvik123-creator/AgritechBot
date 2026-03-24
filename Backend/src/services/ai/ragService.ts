import { ChromaClient, Collection } from 'chromadb';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

let client: ChromaClient | null = null;
let collection: Collection | null = null;
let chromaRetryAt = 0;

const CHROMA_RETRY_BACKOFF_MS = 60_000;
const CHROMA_OP_TIMEOUT_MS = 7_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, opName: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${opName} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

function isBackoffActive(): boolean {
  return Date.now() < chromaRetryAt;
}

async function getCollection(): Promise<Collection> {
  if (!env.RAG_ENABLED) {
    throw new Error('RAG disabled via RAG_ENABLED=false');
  }

  if (collection) return collection;

  if (isBackoffActive()) {
    throw new Error('ChromaDB temporarily unavailable; retry backoff active');
  }

  try {
    client = new ChromaClient({ path: env.CHROMA_URL });
    collection = await withTimeout(
      client.getOrCreateCollection({
        name: env.CHROMA_COLLECTION,
        metadata: { description: 'Agricultural knowledge base for Anaaj AI' },
      }),
      CHROMA_OP_TIMEOUT_MS,
      'ChromaDB collection init'
    );
    chromaRetryAt = 0;
    logger.info(`ChromaDB collection '${env.CHROMA_COLLECTION}' ready`);
    return collection;
  } catch (err) {
    client = null;
    collection = null;
    chromaRetryAt = Date.now() + CHROMA_RETRY_BACKOFF_MS;

    logger.warn(
      {
        message: err instanceof Error ? err.message : 'unknown-error',
        retryInMs: CHROMA_RETRY_BACKOFF_MS,
      },
      'Failed to connect to ChromaDB; entering retry backoff'
    );
    throw err;
  }
}

/**
 * Query the vector DB for relevant agricultural context.
 */
export async function retrieveContext(query: string, topK: number = 3): Promise<string> {
  if (!env.RAG_ENABLED) {
    return '';
  }

  if (isBackoffActive()) {
    logger.debug('RAG skipped: ChromaDB retry backoff active');
    return '';
  }

  try {
    const col = await getCollection();

    const results = await withTimeout(
      col.query({
        queryTexts: [query],
        nResults: topK,
      }),
      CHROMA_OP_TIMEOUT_MS,
      'ChromaDB query'
    );

    if (!results.documents || !results.documents[0] || results.documents[0].length === 0) {
      return '';
    }

    // Combine relevant documents
    const context = results.documents[0]
      .filter((doc): doc is string => doc !== null)
      .join('\n\n---\n\n');

    logger.debug({ query, docsFound: results.documents[0].length }, 'RAG context retrieved');
    return context;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-error';

    if (message.includes('retry backoff active')) {
      logger.debug('RAG skipped: ChromaDB retry backoff active');
      return '';
    }

    client = null;
    collection = null;
    chromaRetryAt = Date.now() + CHROMA_RETRY_BACKOFF_MS;

    logger.warn(
      { message, retryInMs: CHROMA_RETRY_BACKOFF_MS },
      'RAG retrieval failed, proceeding without context'
    );
    return '';
  }
}

/**
 * Add documents to the vector DB knowledge base.
 */
export async function addDocuments(
  documents: string[],
  ids: string[],
  metadata?: Array<Record<string, string>>
): Promise<void> {
  try {
    const col = await getCollection();
    await col.upsert({
      documents,
      ids,
      metadatas: metadata,
    });
    logger.info(`Upserted ${documents.length} documents to vector DB`);
  } catch (err) {
    logger.error({ err }, 'Failed to add documents to vector DB');
    throw err;
  }
}
