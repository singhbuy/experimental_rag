import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding } from '@/lib/embeddings';
import { searchDocuments } from '@/lib/chroma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { question, limit = 3 } = await request.json();

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    console.log(`RAG Question: "${question}"`);

    // Step 1: Generate embedding for the question
    const startEmbed = Date.now();
    const queryEmbedding = await generateEmbedding(question);
    const embedTime = Date.now() - startEmbed;
    console.log(`Embedding generated in ${embedTime}ms`);

    // Step 2: Search for relevant context
    const startSearch = Date.now();
    const chromaResults = await searchDocuments({
      queryEmbedding,
      limit,
    });
    const searchTime = Date.now() - startSearch;

    const chunkIds = chromaResults.ids[0] || [];
    const distances = chromaResults.distances[0] || [];

    if (chunkIds.length === 0) {
      return NextResponse.json({
        answer: "I don't have any relevant information in my knowledge base to answer this question. Please upload some documents first.",
        sources: [],
        question,
        executionTime: embedTime + searchTime,
        timing: {
          embedding: embedTime,
          search: searchTime,
          llm: 0,
          total: embedTime + searchTime,
        },
      });
    }

    // Step 3: Fetch full context from PostgreSQL
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
            createdAt: true,
          },
        },
      },
    });

    const chunkMap = new Map(chunks.map(c => [c.vectorId, c]));

    // Build context and sources
    const contextPieces = chunkIds.map((chunkId, index) => {
      const chunk = chunkMap.get(chunkId);
      if (!chunk) return null;

      const similarity = Math.max(0, 1 - (distances[index] / 2));

      return {
        content: chunk.content,
        document: chunk.document,
        similarity,
        chunkIndex: chunk.chunkIndex,
      };
    }).filter(Boolean);

    // Step 4: Build prompt for LLM
    const context = contextPieces
      .map((piece, i) => `[${i + 1}] ${piece!.content}`)
      .join('\n\n');

    const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided context.
Your task is to:
1. Answer the question using ONLY the information from the context below
2. If the context doesn't contain enough information, say so
3. Cite which source numbers [1], [2], etc. you used for each part of your answer
4. Be concise but complete
5. If you're not sure, say "I'm not certain, but based on the context..."`;

    const userPrompt = `Context from knowledge base:
${context}

Question: ${question}

Please provide a clear, accurate answer based on the context above.`;

    // Step 5: Get answer from OpenAI
    const startLLM = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const llmTime = Date.now() - startLLM;
    const answer = completion.choices[0]?.message?.content || 'No answer generated';

    console.log(`LLM response generated in ${llmTime}ms`);

    // Step 6: Prepare sources
    const sources = contextPieces.map((piece, index) => ({
      number: index + 1,
      documentTitle: piece!.document.title,
      documentId: piece!.document.id,
      chunkIndex: piece!.chunkIndex,
      similarity: piece!.similarity,
      content: piece!.content.substring(0, 200) + '...', // Preview
    }));

    return NextResponse.json({
      answer,
      sources,
      question,
      executionTime: embedTime + searchTime + llmTime,
      timing: {
        embedding: embedTime,
        search: searchTime,
        llm: llmTime,
        total: embedTime + searchTime + llmTime,
      },
    });
  } catch (error: any) {
    console.error('RAG error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate answer',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
