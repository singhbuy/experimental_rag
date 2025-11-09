import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding } from '@/lib/embeddings';
import { searchDocuments } from '@/lib/chroma';

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 5 } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log(`Searching for: "${query}"`);

    // Generate embedding for the search query
    const startEmbed = Date.now();
    const queryEmbedding = await generateEmbedding(query);
    const embedTime = Date.now() - startEmbed;
    console.log(`Embedding generated in ${embedTime}ms`);

    // Search in Chroma for similar chunks
    const startSearch = Date.now();
    const chromaResults = await searchDocuments({
      queryEmbedding,
      limit,
    });
    const searchTime = Date.now() - startSearch;
    console.log(`Chroma search completed in ${searchTime}ms`);

    // Get chunk IDs from results
    const chunkIds = chromaResults.ids[0] || [];
    const distances = chromaResults.distances[0] || [];
    const documents = chromaResults.documents[0] || [];

    if (chunkIds.length === 0) {
      return NextResponse.json({
        results: [],
        message: 'No results found',
        executionTime: embedTime + searchTime,
      });
    }

    // Fetch chunk details from PostgreSQL
    const chunks = await prisma.chunk.findMany({
      where: {
        vectorId: { in: chunkIds },
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            source: true,
            url: true,
            createdAt: true,
          },
        },
      },
    });

    // Create a map for quick lookup
    const chunkMap = new Map(chunks.map(c => [c.vectorId, c]));

    // Build results with proper ordering and similarity scores
    const results = chunkIds.map((chunkId, index) => {
      const chunk = chunkMap.get(chunkId);
      if (!chunk) return null;

      // Convert distance to similarity score (0-1, higher is better)
      // Cosine distance ranges from 0 (identical) to 2 (opposite)
      const similarity = Math.max(0, 1 - (distances[index] / 2));

      return {
        chunkId: chunk.id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        similarity: similarity,
        distance: distances[index],
        document: {
          id: chunk.document.id,
          title: chunk.document.title,
          source: chunk.document.source,
          url: chunk.document.url,
          createdAt: chunk.document.createdAt,
        },
      };
    }).filter(r => r !== null);

    console.log(`Found ${results.length} results`);

    return NextResponse.json({
      results,
      query,
      count: results.length,
      executionTime: embedTime + searchTime,
      timing: {
        embedding: embedTime,
        search: searchTime,
        total: embedTime + searchTime,
      },
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
