import { NextRequest, NextResponse } from 'next/server';
import {
  fetchConfluencePages,
  fetchConfluencePage,
  fetchConfluenceSpaces,
  confluencePageToDocument,
  testConfluenceConnection,
} from '@/lib/confluence';
import { chunkText } from '@/lib/chunking';
import { generateEmbeddingsBatch } from '@/lib/embeddings';
import { addDocuments } from '@/lib/chroma';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/confluence/sync
 * Sync Confluence pages into the RAG system
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { spaceId, limit = 25 } = body;

    // First test connection
    console.log('Testing Confluence connection...');
    const connectionTest = await testConfluenceConnection();

    if (!connectionTest.success) {
      return NextResponse.json(
        { error: 'Confluence connection failed', details: connectionTest.message },
        { status: 500 }
      );
    }

    console.log(`Confluence connection successful: ${connectionTest.message}`);

    // Fetch spaces for metadata enrichment
    console.log('Fetching Confluence spaces...');
    const spacesData = await fetchConfluenceSpaces({ limit: 100 });
    const spaces = spacesData.results;
    const spaceMap = new Map(spaces.map((s) => [s.id, s]));

    // Fetch Confluence pages
    console.log(`Fetching Confluence pages${spaceId ? ` from space ${spaceId}` : ''}...`);
    const fetchStart = Date.now();
    const pagesData = await fetchConfluencePages({ spaceId, limit });
    const fetchTime = Date.now() - fetchStart;

    const pages = pagesData.results;
    console.log(`Fetched ${pages.length} pages`);

    if (pages.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pages found to sync',
        synced: 0,
        total: 0,
        executionTime: Date.now() - startTime,
      });
    }

    // Process each page
    const syncedPages = [];
    const errors = [];
    let totalChunks = 0;

    for (const page of pages) {
      try {
        const pageStart = Date.now();

        // Fetch full page content
        const fullPage = await fetchConfluencePage(page.id);

        // Get space metadata
        const space = spaceMap.get(fullPage.spaceId);

        // Convert Confluence page to document format
        const { title, content, metadata } = confluencePageToDocument(fullPage, space);

        // Check if page already exists
        const existingDoc = await prisma.document.findFirst({
          where: {
            source: 'confluence',
            title: title,
          },
        });

        let document;

        if (existingDoc) {
          // Update existing document
          console.log(`Updating existing Confluence page: ${page.title}`);

          // Delete old chunks from database
          await prisma.chunk.deleteMany({
            where: { documentId: existingDoc.id },
          });

          // Update document
          document = await prisma.document.update({
            where: { id: existingDoc.id },
            data: {
              content,
              status: 'processing',
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new document
          console.log(`Creating new Confluence page: ${page.title}`);
          document = await prisma.document.create({
            data: {
              title,
              content,
              source: 'confluence',
              url: metadata.url,
              status: 'processing',
            },
          });
        }

        // Chunk the content
        const chunks = chunkText(content, {
          chunkSize: 512,
          overlap: 50,
        });

        if (chunks.length === 0) {
          console.log(`⚠️  No content to index for page: ${page.title}`);
          await prisma.document.update({
            where: { id: document.id },
            data: { status: 'indexed' },
          });
          continue;
        }

        totalChunks += chunks.length;

        // Generate embeddings for all chunks
        const embeddingStart = Date.now();
        const embeddings = await generateEmbeddingsBatch(chunks);
        const embeddingTime = Date.now() - embeddingStart;

        // Prepare data for Chroma and Prisma
        const vectorIds = chunks.map((_, index) => `${document.id}-chunk-${index}`);
        const metadatas = chunks.map((chunk, index) => ({
          documentId: document.id,
          chunkIndex: index,
          confluenceId: metadata.confluenceId,
          confluencePageId: metadata.confluencePageId,
          status: metadata.status,
          spaceId: metadata.spaceId,
          spaceName: metadata.spaceName,
          spaceKey: metadata.spaceKey,
          version: metadata.version,
          url: metadata.url,
        }));

        // Add to Chroma vector database
        const chromaStart = Date.now();
        await addDocuments({
          ids: vectorIds,
          embeddings,
          documents: chunks,
          metadatas,
        });
        const chromaTime = Date.now() - chromaStart;

        // Create chunk records in PostgreSQL
        const dbStart = Date.now();
        await prisma.chunk.createMany({
          data: chunks.map((chunk, index) => ({
            documentId: document.id,
            content: chunk,
            chunkIndex: index,
            vectorId: vectorIds[index],
          })),
        });
        const dbTime = Date.now() - dbStart;

        // Mark document as indexed
        await prisma.document.update({
          where: { id: document.id },
          data: { status: 'indexed' },
        });

        const pageTime = Date.now() - pageStart;

        syncedPages.push({
          id: page.id,
          title: page.title,
          chunks: chunks.length,
          timing: {
            embedding: embeddingTime,
            chroma: chromaTime,
            database: dbTime,
            total: pageTime,
          },
        });

        console.log(`✓ Synced ${page.title}: ${chunks.length} chunks in ${pageTime}ms`);
      } catch (error: any) {
        console.error(`✗ Failed to sync ${page.title}:`, error);
        errors.push({
          id: page.id,
          title: page.title,
          error: error.message,
        });
      }
    }

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedPages.length} Confluence pages`,
      synced: syncedPages.length,
      total: pages.length,
      totalChunks,
      errors: errors.length > 0 ? errors : undefined,
      pages: syncedPages,
      executionTime,
      timing: {
        fetch: fetchTime,
        processing: executionTime - fetchTime,
        total: executionTime,
      },
    });
  } catch (error: any) {
    console.error('Confluence sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync Confluence pages',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/confluence/sync
 * Get status of Confluence synced documents
 */
export async function GET() {
  try {
    // Get all Confluence documents
    const confluenceDocuments = await prisma.document.findMany({
      where: {
        source: 'confluence',
      },
      include: {
        _count: {
          select: {
            chunks: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Get summary statistics
    const totalDocuments = confluenceDocuments.length;
    const totalChunks = confluenceDocuments.reduce(
      (sum, doc) => sum + doc._count.chunks,
      0
    );
    const indexedCount = confluenceDocuments.filter(
      (doc) => doc.status === 'indexed'
    ).length;

    return NextResponse.json({
      success: true,
      documents: confluenceDocuments,
      summary: {
        total: totalDocuments,
        indexed: indexedCount,
        processing: totalDocuments - indexedCount,
        totalChunks,
      },
    });
  } catch (error: any) {
    console.error('Failed to get Confluence documents:', error);
    return NextResponse.json(
      {
        error: 'Failed to get Confluence documents',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
