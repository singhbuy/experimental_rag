import { NextRequest, NextResponse } from 'next/server';
import { fetchJiraIssues, jiraIssueToDocument, testJiraConnection } from '@/lib/jira';
import { chunkText } from '@/lib/chunking';
import { generateEmbedding, generateEmbeddingsBatch } from '@/lib/embeddings';
import { addDocuments } from '@/lib/chroma';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/jira/sync
 * Sync JIRA issues into the RAG system
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const {
      jql = 'order by updated DESC',
      maxResults = 50,
      startAt = 0
    } = body;

    // First test connection
    console.log('Testing JIRA connection...');
    const connectionTest = await testJiraConnection();

    if (!connectionTest.success) {
      return NextResponse.json(
        { error: 'JIRA connection failed', details: connectionTest.message },
        { status: 500 }
      );
    }

    console.log(`JIRA connection successful: ${connectionTest.message}`);

    // Fetch JIRA issues
    console.log(`Fetching JIRA issues with JQL: ${jql}`);
    const fetchStart = Date.now();
    const { issues, total } = await fetchJiraIssues({ jql, maxResults, startAt });
    const fetchTime = Date.now() - fetchStart;

    console.log(`Fetched ${issues.length} issues out of ${total} total`);

    if (issues.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No issues found to sync',
        synced: 0,
        total: 0,
        executionTime: Date.now() - startTime,
      });
    }

    // Process each issue
    const syncedIssues = [];
    const errors = [];
    let totalChunks = 0;

    for (const issue of issues) {
      try {
        const issueStart = Date.now();

        // Convert JIRA issue to document format
        const { title, content, metadata } = jiraIssueToDocument(issue);

        // Check if issue already exists
        const existingDoc = await prisma.document.findFirst({
          where: {
            source: 'jira',
            title: title,
          },
        });

        let document;

        if (existingDoc) {
          // Update existing document
          console.log(`Updating existing JIRA issue: ${issue.key}`);

          // Delete old chunks from Chroma
          const oldChunks = await prisma.chunk.findMany({
            where: { documentId: existingDoc.id },
          });

          if (oldChunks.length > 0) {
            const oldVectorIds = oldChunks.map(chunk => chunk.vectorId);
            // Note: We don't have a deleteDocuments function yet, so we'll just recreate
            // In production, you'd want to implement proper deletion
          }

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
          console.log(`Creating new JIRA issue: ${issue.key}`);
          document = await prisma.document.create({
            data: {
              title,
              content,
              source: 'jira',
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
          jiraKey: metadata.jiraKey,
          jiraId: metadata.jiraId,
          status: metadata.status,
          issueType: metadata.issueType,
          priority: metadata.priority,
          assignee: metadata.assignee,
          projectKey: metadata.projectKey,
          projectName: metadata.projectName,
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

        const issueTime = Date.now() - issueStart;

        syncedIssues.push({
          key: issue.key,
          title: title,
          chunks: chunks.length,
          timing: {
            embedding: embeddingTime,
            chroma: chromaTime,
            database: dbTime,
            total: issueTime,
          },
        });

        console.log(
          `✓ Synced ${issue.key}: ${chunks.length} chunks in ${issueTime}ms`
        );
      } catch (error: any) {
        console.error(`✗ Failed to sync ${issue.key}:`, error);
        errors.push({
          key: issue.key,
          error: error.message,
        });
      }
    }

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedIssues.length} JIRA issues`,
      synced: syncedIssues.length,
      total: total,
      totalChunks,
      errors: errors.length > 0 ? errors : undefined,
      issues: syncedIssues,
      executionTime,
      timing: {
        fetch: fetchTime,
        processing: executionTime - fetchTime,
        total: executionTime,
      },
    });
  } catch (error: any) {
    console.error('JIRA sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync JIRA issues',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jira/sync
 * Get status of JIRA synced documents
 */
export async function GET() {
  try {
    // Get all JIRA documents
    const jiraDocuments = await prisma.document.findMany({
      where: {
        source: 'jira',
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
    const totalDocuments = jiraDocuments.length;
    const totalChunks = jiraDocuments.reduce(
      (sum, doc) => sum + doc._count.chunks,
      0
    );
    const indexedCount = jiraDocuments.filter(
      (doc) => doc.status === 'indexed'
    ).length;

    return NextResponse.json({
      success: true,
      documents: jiraDocuments,
      summary: {
        total: totalDocuments,
        indexed: indexedCount,
        processing: totalDocuments - indexedCount,
        totalChunks,
      },
    });
  } catch (error: any) {
    console.error('Failed to get JIRA documents:', error);
    return NextResponse.json(
      {
        error: 'Failed to get JIRA documents',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
