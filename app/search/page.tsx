'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SearchResult {
  chunkId: string;
  content: string;
  chunkIndex: number;
  similarity: number;
  distance: number;
  document: {
    id: string;
    title: string;
    source: string;
    url: string | null;
    createdAt: string;
  };
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  count: number;
  executionTime: number;
  timing: {
    embedding: number;
    search: number;
    total: number;
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchInfo, setSearchInfo] = useState<SearchResponse | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setSearching(true);
    setError('');
    setResults([]);
    setSearchInfo(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          limit: 5,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
        setSearchInfo(data);
        if (data.results.length === 0) {
          setError('No results found. Try uploading some documents first.');
        }
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err: any) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Semantic Search</h1>
        <p className="text-gray-600">
          Search your documents using natural language
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label
              htmlFor="searchQuery"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              What would you like to find?
            </label>
            <input
              type="text"
              id="searchQuery"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What is machine learning?"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {searching ? 'Searching...' : '🔍 Search'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {searchInfo && !error && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
            <p>
              Found <strong>{searchInfo.count}</strong> results in{' '}
              <strong>{searchInfo.executionTime}ms</strong>
            </p>
            <p className="text-xs mt-1 text-blue-600">
              Embedding: {searchInfo.timing.embedding}ms | Search:{' '}
              {searchInfo.timing.search}ms
            </p>
          </div>
        )}
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">
            Results for "{searchInfo?.query}"
          </h2>

          {results.map((result, index) => (
            <div
              key={result.chunkId}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Result Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {result.document.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Chunk {result.chunkIndex + 1} • {result.document.source}
                  </p>
                </div>
                <div className="ml-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {(result.similarity * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">similarity</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-gray-50 p-4 rounded-md mb-3">
                <p className="text-gray-800 leading-relaxed">
                  {result.content}
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  Uploaded {new Date(result.document.createdAt).toLocaleDateString()}
                </span>
                {result.document.url && (
                  <a
                    href={result.document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Source →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!searching && results.length === 0 && !error && !searchInfo && (
        <div className="bg-gray-50 p-12 rounded-lg text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Start Searching</h3>
          <p className="text-gray-600 mb-4">
            Enter a question or topic to search your knowledge base
          </p>
          <Link
            href="/upload"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Or upload your first document →
          </Link>
        </div>
      )}
    </main>
  );
}
