import { ChromaClient, Collection } from 'chromadb';

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const COLLECTION_NAME = 'rag_documents';

let client: ChromaClient | null = null;
let collection: Collection | null = null;

/**
 * Get or create Chroma client
 */
export async function getChromaClient(): Promise<ChromaClient> {
  if (!client) {
    client = new ChromaClient({
      path: CHROMA_URL,
    });
  }
  return client;
}

/**
 * Get or create the documents collection
 */
export async function getCollection(): Promise<Collection> {
  if (!collection) {
    const chromaClient = await getChromaClient();
    collection = await chromaClient.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { 'hnsw:space': 'cosine' },
    });
  }
  return collection;
}

/**
 * Add documents to Chroma
 */
export async function addDocuments(params: {
  ids: string[];
  embeddings: number[][];
  documents: string[];
  metadatas: Record<string, any>[];
}): Promise<void> {
  const coll = await getCollection();

  await coll.add({
    ids: params.ids,
    embeddings: params.embeddings,
    documents: params.documents,
    metadatas: params.metadatas,
  });
}

/**
 * Search for similar documents
 */
export async function searchDocuments(params: {
  queryEmbedding: number[];
  limit?: number;
  filter?: Record<string, any>;
}): Promise<{
  ids: string[][];
  distances: number[][];
  documents: (string | null)[][];
  metadatas: (Record<string, any> | null)[][];
}> {
  const coll = await getCollection();
  const { queryEmbedding, limit = 10, filter } = params;

  const results = await coll.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit,
    where: filter,
  });

  return {
    ids: results.ids,
    distances: results.distances || [],
    documents: results.documents,
    metadatas: results.metadatas,
  };
}

/**
 * Delete documents from Chroma
 */
export async function deleteDocuments(ids: string[]): Promise<void> {
  const coll = await getCollection();
  await coll.delete({
    ids,
  });
}

/**
 * Get collection stats
 */
export async function getCollectionStats(): Promise<{
  count: number;
  name: string;
}> {
  const coll = await getCollection();
  const count = await coll.count();

  return {
    name: COLLECTION_NAME,
    count,
  };
}
