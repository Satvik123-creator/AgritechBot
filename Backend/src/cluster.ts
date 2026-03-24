import cluster from 'node:cluster';
import os from 'node:os';
import { logger } from './utils/logger';

const WORKER_COUNT = Number(process.env.CLUSTER_WORKERS) || os.cpus().length;
let isShuttingDown = false;

/**
 * Cluster entry point for production.
 * Forks N worker processes (one per CPU core by default).
 * Each worker runs its own Fastify server + BullMQ workers.
 *
 * Usage:
 *   node dist/cluster.js          # Auto-detect CPU count
 *   CLUSTER_WORKERS=4 node dist/cluster.js  # Force 4 workers
 */
if (cluster.isPrimary) {
  logger.info(`Primary process ${process.pid} starting ${WORKER_COUNT} workers`);

  for (let i = 0; i < WORKER_COUNT; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    if (isShuttingDown) {
      logger.info(
        { pid: worker.process.pid, code, signal },
        'Worker exited during shutdown'
      );
      return;
    }

    logger.warn(
      { pid: worker.process.pid, code, signal },
      'Worker died — restarting'
    );
    // Auto-restart crashed workers
    cluster.fork();
  });

  cluster.on('online', (worker) => {
    logger.info({ pid: worker.process.pid }, 'Worker online');
  });

  // Graceful shutdown: tell all workers to close
  const shutdown = (signal: string) => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;

    logger.info(`${signal} — shutting down all workers`);
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill(signal);
    }

    // Exit primary after workers are terminated.
    const timeout = setTimeout(() => {
      logger.warn('Forcing primary exit after shutdown timeout');
      process.exit(0);
    }, 30000);

    timeout.unref();

    cluster.disconnect(() => {
      clearTimeout(timeout);
      logger.info('All workers disconnected. Primary exiting');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
} else {
  // Each worker imports and runs the main server
  import('./server');
}
