import Link from 'next/link';

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
        <p className="text-gray-600">
          Complete API reference for the RAG Knowledge Search System
        </p>
      </div>

      {/* Overview */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="text-gray-700 mb-4">
          Base URL: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code>
        </p>
        <p className="text-gray-700 mb-4">
          All API endpoints accept and return JSON data. Make sure to set the{' '}
          <code className="bg-gray-100 px-2 py-1 rounded">Content-Type: application/json</code> header.
        </p>
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This API uses HuggingFace embeddings (free, local) and OpenAI GPT-3.5-turbo for answer generation.
          </p>
        </div>
      </section>

      {/* Upload Endpoints */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">📤 Upload Endpoints</h2>

        {/* POST /api/upload */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <span className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium mr-3">
              POST
            </span>
            <code className="text-lg font-mono">/api/upload</code>
          </div>
          <p className="text-gray-700 mb-4">Upload and index a document</p>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Request (multipart/form-data)</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
{`FormData:
  file: File (required) - Document file (.txt, .md, .json)
  title: string (optional) - Document title`}
            </pre>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Response (200 OK)</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "success": true,
  "documentId": "clx123abc...",
  "chunksCount": 6,
  "message": "Document uploaded and indexed successfully"
}`}
            </pre>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">cURL Example</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
{`curl -X POST http://localhost:3000/api/upload \\
  -F "file=@document.txt" \\
  -F "title=My Document"`}
            </pre>
          </div>
        </div>

        {/* GET /api/upload */}
        <div>
          <div className="flex items-center mb-2">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium mr-3">
              GET
            </span>
            <code className="text-lg font-mono">/api/upload</code>
          </div>
          <p className="text-gray-700 mb-4">Get list of uploaded documents</p>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Response (200 OK)</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "documents": [
    {
      "id": "clx123abc...",
      "title": "Machine Learning Guide",
      "source": "local",
      "status": "indexed",
      "createdAt": "2025-11-08T...",
      "_count": {
        "chunks": 6
      }
    }
  ]
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Search Endpoints */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">🔍 Search Endpoints</h2>

        <div>
          <div className="flex items-center mb-2">
            <span className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium mr-3">
              POST
            </span>
            <code className="text-lg font-mono">/api/search</code>
          </div>
          <p className="text-gray-700 mb-4">Search for relevant document chunks using semantic similarity</p>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Request Body</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "query": "What is machine learning?",
  "limit": 5  // Optional, default: 5
}`}
            </pre>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Response (200 OK)</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "results": [
    {
      "chunkId": "clx456def...",
      "content": "Machine learning is a subset...",
      "chunkIndex": 0,
      "similarity": 0.92,
      "distance": 0.16,
      "document": {
        "id": "clx123abc...",
        "title": "ML Guide",
        "source": "local",
        "url": null,
        "createdAt": "2025-11-08T..."
      }
    }
  ],
  "query": "What is machine learning?",
  "count": 5,
  "executionTime": 187,
  "timing": {
    "embedding": 142,
    "search": 45,
    "total": 187
  }
}`}
            </pre>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">JavaScript Example</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
{`const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'What is machine learning?',
    limit: 5
  })
});

const data = await response.json();
console.log(data.results);`}
            </pre>
          </div>
        </div>
      </section>

      {/* Ask (RAG) Endpoints */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">💬 RAG Q&A Endpoints</h2>

        <div>
          <div className="flex items-center mb-2">
            <span className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium mr-3">
              POST
            </span>
            <code className="text-lg font-mono">/api/ask</code>
          </div>
          <p className="text-gray-700 mb-4">
            Ask a question and get an AI-generated answer using Retrieval Augmented Generation (RAG)
          </p>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Request Body</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "question": "How does RAG work?",
  "limit": 3  // Optional, default: 3
}`}
            </pre>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Response (200 OK)</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "answer": "Retrieval Augmented Generation (RAG) works by...",
  "sources": [
    {
      "number": 1,
      "documentTitle": "ML Guide",
      "documentId": "clx123abc...",
      "chunkIndex": 3,
      "similarity": 0.94,
      "content": "Retrieval Augmented Generation..."
    }
  ],
  "question": "How does RAG work?",
  "executionTime": 1423,
  "timing": {
    "embedding": 156,
    "search": 42,
    "llm": 1225,
    "total": 1423
  }
}`}
            </pre>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">cURL Example</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
{`curl -X POST http://localhost:3000/api/ask \\
  -H "Content-Type: application/json" \\
  -d '{"question": "How does RAG work?"}'`}
            </pre>
          </div>
        </div>
      </section>

      {/* Error Responses */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">⚠️ Error Responses</h2>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">400 Bad Request</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "error": "Query is required"
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">500 Internal Server Error</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "error": "Failed to process document",
  "details": "Error message..."
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Models & Technologies */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">🤖 Models & Technologies</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Embedding Model</h3>
            <p className="text-sm text-gray-700">
              <strong>Model:</strong> Xenova/all-MiniLM-L6-v2
            </p>
            <p className="text-sm text-gray-700">
              <strong>Dimensions:</strong> 384
            </p>
            <p className="text-sm text-gray-700">
              <strong>Cost:</strong> Free (local)
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Language Model</h3>
            <p className="text-sm text-gray-700">
              <strong>Model:</strong> GPT-3.5-turbo (OpenAI)
            </p>
            <p className="text-sm text-gray-700">
              <strong>Temperature:</strong> 0.3
            </p>
            <p className="text-sm text-gray-700">
              <strong>Max Tokens:</strong> 500
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Vector Database</h3>
            <p className="text-sm text-gray-700">
              <strong>Database:</strong> ChromaDB
            </p>
            <p className="text-sm text-gray-700">
              <strong>Distance:</strong> Cosine similarity
            </p>
            <p className="text-sm text-gray-700">
              <strong>URL:</strong> http://localhost:8000
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Metadata Database</h3>
            <p className="text-sm text-gray-700">
              <strong>Database:</strong> PostgreSQL
            </p>
            <p className="text-sm text-gray-700">
              <strong>ORM:</strong> Prisma
            </p>
            <p className="text-sm text-gray-700">
              <strong>Port:</strong> 5432
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
