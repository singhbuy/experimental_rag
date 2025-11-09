/**
 * Split text into chunks with overlap for better context preservation
 */
export interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

export function chunkText(
  text: string,
  options: ChunkOptions = {}
): string[] {
  const { chunkSize = 512, overlap = 50 } = options;

  // Clean the text
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  // Split by sentences first (better semantic boundaries)
  const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText];

  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    // If adding this sentence exceeds chunk size, save current chunk
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());

      // Start new chunk with overlap from previous chunk
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-overlap);
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  // Add the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(chunk => chunk.length > 0);
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
