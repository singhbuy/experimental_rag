import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chunkText } from '@/lib/chunking';
import { generateEmbeddingsBatch } from '@/lib/embeddings';
import { addDocuments } from '@/lib/chroma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    console.log(`Processing file: ${file.name}`);
    console.log(`Content length: ${fileContent.length} characters`);

    // Create document in database
    const document = await prisma.document.create({
      data: {
        title: title || file.name,
        content: fileContent,
        source: 'local',
        contentType: file.type || 'text/plain',
        status: 'processing',
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`Document created: ${document.id}`);

    // Chunk the content
    const chunks = chunkText(fileContent, {
      chunkSize: 512,
      overlap: 50,
    });

    console.log(`Created ${chunks.length} chunks`);

    // Generate embeddings for all chunks
    console.log('Generating embeddings...');
    const embeddings = await generateEmbeddingsBatch(chunks);
    console.log(`Generated ${embeddings.length} embeddings`);

    // Prepare data for Chroma
    const chunkIds: string[] = [];
    const chunkRecords = chunks.map((chunkContent, index) => {
      const chunkId = `${document.id}_chunk_${index}`;
      chunkIds.push(chunkId);

      return {
        documentId: document.id,
        content: chunkContent,
        chunkIndex: index,
        vectorId: chunkId,
        metadata: {
          documentTitle: document.title,
          chunkIndex: index,
          totalChunks: chunks.length,
        },
      };
    });

    // Store chunks in PostgreSQL
    await prisma.chunk.createMany({
      data: chunkRecords,
    });

    console.log('Chunks saved to database');

    // Store embeddings in Chroma
    await addDocuments({
      ids: chunkIds,
      embeddings: embeddings,
      documents: chunks,
      metadatas: chunkRecords.map(c => ({
        documentId: document.id,
        documentTitle: document.title,
        chunkIndex: c.chunkIndex,
        totalChunks: chunks.length,
      })),
    });

    console.log('Embeddings saved to Chroma');

    // Update document status
    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'indexed' },
    });

    return NextResponse.json({
      success: true,
      documentId: document.id,
      chunksCount: chunks.length,
      message: 'Document uploaded and indexed successfully',
    });
  } catch (error: any) {
    console.error('Upload error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process document',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        source: true,
        status: true,
        createdAt: true,
        _count: {
          select: { chunks: true },
        },
      },
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
