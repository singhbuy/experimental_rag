import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

// Model configuration
export const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
export const EMBEDDING_DIMENSIONS = 384; // Dimension for all-MiniLM-L6-v2

let embeddingPipeline: any = null;

/**
 * Get or initialize the embedding pipeline
 */
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    console.log('Loading embedding model:', EMBEDDING_MODEL);
    embeddingPipeline = await pipeline('feature-extraction', EMBEDDING_MODEL);
    console.log('Embedding model loaded successfully');
  }
  return embeddingPipeline;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const extractor = await getEmbeddingPipeline();

    // Generate embedding
    const output = await extractor(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Convert to regular array
    const embedding = Array.from(output.data) as number[];
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embeddings for multiple texts (batch processing)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const embeddings: number[][] = [];

    for (const text of texts) {
      const embedding = await generateEmbedding(text);
      embeddings.push(embedding);
    }

    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Generate embeddings in batches
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  batchSize: number = 10
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);

    const batchEmbeddings = await generateEmbeddings(batch);
    embeddings.push(...batchEmbeddings);
  }

  return embeddings;
}

/**
 * Alternative: Use OpenAI if OPENAI_API_KEY is set
 */
export async function generateEmbeddingOpenAI(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI API request failed');
  }

  const data = await response.json();
  return data.data[0].embedding;
}
