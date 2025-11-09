'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Source {
  number: number;
  documentTitle: string;
  documentId: string;
  chunkIndex: number;
  similarity: number;
  content: string;
}

interface RAGResponse {
  answer: string;
  sources: Source[];
  question: string;
  executionTime: number;
  timing: {
    embedding: number;
    search: number;
    llm: number;
    total: number;
  };
}

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RAGResponse | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<RAGResponse[]>([]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          limit: 3,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
        setHistory((prev) => [data, ...prev]);
        setQuestion('');
      } else {
        setError(data.error || 'Failed to get answer');
      }
    } catch (err: any) {
      setError('Failed to get answer. Please try again.');
      console.error('Ask error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Ask Questions (RAG)</h1>
        <p className="text-gray-600">
          Ask questions and get AI-generated answers from your documents
        </p>
      </div>

      {/* Question Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleAsk} className="space-y-4">
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              What would you like to know?
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What is retrieval augmented generation and how does it work?"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {loading ? 'Thinking...' : '💬 Ask Question'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Current Answer */}
      {response && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg shadow-lg mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Q: {response.question}
            </h2>
            <div className="text-sm text-gray-600">
              Answered in {response.executionTime}ms (Embedding:{' '}
              {response.timing.embedding}ms | Search: {response.timing.search}ms | AI:{' '}
              {response.timing.llm}ms)
            </div>
          </div>

          <div className="bg-white p-6 rounded-md mb-4">
            <div className="flex items-start">
              <span className="text-3xl mr-3">🤖</span>
              <div className="flex-1">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {response.answer}
                </p>
              </div>
            </div>
          </div>

          {/* Sources */}
          {response.sources.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                📚 Sources ({response.sources.length})
              </h3>
              <div className="space-y-3">
                {response.sources.map((source) => (
                  <div
                    key={source.number}
                    className="bg-white p-4 rounded-md border-l-4 border-green-500"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium mr-2">
                          [{source.number}]
                        </span>
                        <span className="font-medium text-gray-900">
                          {source.documentTitle}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          (Chunk {source.chunkIndex + 1})
                        </span>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        {(source.similarity * 100).toFixed(0)}% match
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">
                      {source.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Previous Questions</h2>
          <div className="space-y-4">
            {history.slice(1).map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setResponse(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {item.question}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.answer.substring(0, 150)}...
                    </p>
                  </div>
                  <div className="ml-4 text-sm text-gray-500">
                    {item.sources.length} sources
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !response && history.length === 0 && (
        <div className="bg-gray-50 p-12 rounded-lg text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Ask Your First Question</h3>
          <p className="text-gray-600 mb-6">
            Try asking questions about your uploaded documents
          </p>
          <div className="space-y-2 max-w-md mx-auto text-left">
            <p className="text-sm text-gray-700">
              <strong>Example questions:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• What is machine learning?</li>
              <li>• How does RAG work?</li>
              <li>• Explain vector databases</li>
              <li>• What are the applications of AI?</li>
            </ul>
          </div>
          <Link
            href="/upload"
            className="inline-block mt-6 text-blue-600 hover:text-blue-800 font-medium"
          >
            Upload documents first →
          </Link>
        </div>
      )}
    </main>
  );
}
