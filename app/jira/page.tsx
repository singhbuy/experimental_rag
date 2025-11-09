'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JiraDocument {
  id: string;
  title: string;
  url: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    chunks: number;
  };
}

interface SyncResult {
  success: boolean;
  message: string;
  synced: number;
  total: number;
  totalChunks: number;
  executionTime: number;
  timing: {
    fetch: number;
    processing: number;
    total: number;
  };
  issues?: Array<{
    key: string;
    title: string;
    chunks: number;
  }>;
  errors?: Array<{
    key: string;
    error: string;
  }>;
}

interface DocumentsResponse {
  success: boolean;
  documents: JiraDocument[];
  summary: {
    total: number;
    indexed: number;
    processing: number;
    totalChunks: number;
  };
}

export default function JiraPage() {
  const [jql, setJql] = useState('order by updated DESC');
  const [maxResults, setMaxResults] = useState(50);
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [documents, setDocuments] = useState<DocumentsResponse | null>(null);
  const [error, setError] = useState('');

  // Load existing documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/jira/sync');
      const data = await res.json();

      if (res.ok) {
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jql.trim()) {
      setError('Please enter a JQL query');
      return;
    }

    setLoading(true);
    setError('');
    setSyncResult(null);

    try {
      const res = await fetch('/api/jira/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jql: jql.trim(),
          maxResults,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSyncResult(data);
        // Reload documents after successful sync
        await loadDocuments();
      } else {
        setError(data.error || 'Failed to sync JIRA issues');
        if (data.details) {
          setError(`${data.error}: ${data.details}`);
        }
      }
    } catch (err: any) {
      setError('Failed to sync JIRA issues. Please check your configuration.');
      console.error('Sync error:', err);
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
        <h1 className="text-3xl font-bold mb-2">JIRA Integration</h1>
        <p className="text-gray-600">
          Sync JIRA issues into your RAG knowledge base
        </p>
      </div>

      {/* Configuration Notice */}
      <div className="bg-blue-50 p-4 rounded-lg mb-8">
        <h3 className="font-semibold text-blue-900 mb-2">Configuration Required</h3>
        <p className="text-sm text-blue-800 mb-2">
          Make sure you have set the following environment variables in your <code className="bg-blue-100 px-1 rounded">.env.local</code> file:
        </p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• <code className="bg-blue-100 px-1 rounded">JIRA_DOMAIN</code> - Your JIRA domain (e.g., yourcompany.atlassian.net)</li>
          <li>• <code className="bg-blue-100 px-1 rounded">JIRA_EMAIL</code> - Your JIRA account email</li>
          <li>• <code className="bg-blue-100 px-1 rounded">JIRA_TOKEN</code> - Your JIRA API token</li>
        </ul>
      </div>

      {/* Sync Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Sync JIRA Issues</h2>
        <form onSubmit={handleSync} className="space-y-4">
          <div>
            <label
              htmlFor="jql"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              JQL Query
            </label>
            <input
              id="jql"
              type="text"
              value={jql}
              onChange={(e) => setJql(e.target.value)}
              placeholder="order by updated DESC"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Examples: "project = PROJ", "status = 'In Progress'", "assignee = currentUser()"
            </p>
          </div>

          <div>
            <label
              htmlFor="maxResults"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Maximum Results
            </label>
            <input
              id="maxResults"
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              min="1"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !jql.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Syncing...' : '🔄 Sync JIRA Issues'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className="bg-green-50 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold text-green-900 mb-4">
            ✓ Sync Complete
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-4 rounded-md">
              <div className="text-2xl font-bold text-green-600">
                {syncResult.synced}
              </div>
              <div className="text-sm text-gray-600">Issues Synced</div>
            </div>
            <div className="bg-white p-4 rounded-md">
              <div className="text-2xl font-bold text-blue-600">
                {syncResult.totalChunks}
              </div>
              <div className="text-sm text-gray-600">Chunks Created</div>
            </div>
            <div className="bg-white p-4 rounded-md">
              <div className="text-2xl font-bold text-purple-600">
                {syncResult.total}
              </div>
              <div className="text-sm text-gray-600">Total Available</div>
            </div>
            <div className="bg-white p-4 rounded-md">
              <div className="text-2xl font-bold text-orange-600">
                {syncResult.executionTime}ms
              </div>
              <div className="text-sm text-gray-600">Execution Time</div>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            Fetch: {syncResult.timing.fetch}ms | Processing: {syncResult.timing.processing}ms
          </p>

          {syncResult.issues && syncResult.issues.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Synced Issues:</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {syncResult.issues.map((issue, index) => (
                  <div key={index} className="bg-white p-3 rounded-md text-sm">
                    <span className="font-medium">{issue.key}</span>
                    <span className="text-gray-600 ml-2">- {issue.chunks} chunks</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {syncResult.errors && syncResult.errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <h3 className="font-semibold text-red-900 mb-2">Errors:</h3>
              <div className="space-y-1">
                {syncResult.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-800">
                    {error.key}: {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Synced Documents */}
      {documents && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Synced JIRA Issues</h2>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-2xl font-bold text-gray-900">
                {documents.summary.total}
              </div>
              <div className="text-sm text-gray-600">Total Issues</div>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <div className="text-2xl font-bold text-green-600">
                {documents.summary.indexed}
              </div>
              <div className="text-sm text-gray-600">Indexed</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md">
              <div className="text-2xl font-bold text-yellow-600">
                {documents.summary.processing}
              </div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="text-2xl font-bold text-blue-600">
                {documents.summary.totalChunks}
              </div>
              <div className="text-sm text-gray-600">Total Chunks</div>
            </div>
          </div>

          {/* Documents List */}
          {documents.documents.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {documents.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border rounded-md p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {doc.title}
                      </h3>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View in JIRA →
                        </a>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        Updated: {new Date(doc.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          doc.status === 'indexed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                      <div className="text-sm text-gray-600 mt-2">
                        {doc._count.chunks} chunks
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No JIRA issues synced yet</p>
              <p className="text-sm mt-1">Use the form above to sync your first issues</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
