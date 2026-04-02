/**
 * Audio Service
 * Handles audio chunk concatenation and playback
 * Seamlessly merges multiple audio chunks into a single continuous audio
 */

/**
 * Convert base64 audio data to audio blob
 */
export async function base64ToBlob(base64: string, mimeType: string = 'audio/mp3'): Promise<Blob> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

/**
 * Concatenate multiple base64 audio chunks into a single base64 audio
 * Supports seamless merging of audio files
 */
export async function concatenateAudioChunks(
  chunks: Array<{
    audioBase64: string;
    audioMimeType: string;
  }>
): Promise<string> {
  if (!chunks || chunks.length === 0) {
    return '';
  }

  // If only one chunk, return it as-is
  if (chunks.length === 1) {
    return chunks[0].audioBase64;
  }

  try {
    // Convert all base64 chunks to blobs
    const blobs = await Promise.all(
      chunks.map((chunk) => base64ToBlob(chunk.audioBase64, chunk.audioMimeType))
    );

    // Concatenate blobs
    const concatenatedBlob = new Blob(blobs, { type: chunks[0].audioMimeType || 'audio/mp3' });

    // Convert blob back to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(concatenatedBlob);
    });
  } catch (error) {
    console.error('Failed to concatenate audio chunks:', error);
    // Fallback: return first chunk if concatenation fails
    return chunks[0].audioBase64;
  }
}

/**
 * Convert base64 audio to URI for playback
 */
export function base64ToUri(base64: string, mimeType: string = 'audio/mp3'): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Get audio duration from base64 (requires audio decoding)
 * Note: This is a placeholder - actual implementation depends on platform
 */
export async function getAudioDuration(base64: string): Promise<number> {
  // This would require platform-specific implementation
  // For now, returning a default or could use react-native-sound or similar
  return 0;
}
