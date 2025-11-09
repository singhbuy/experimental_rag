import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          RAG Knowledge Search System
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Your intelligent document search powered by HuggingFace embeddings!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-6">
          <Link
            href="/upload"
            className="p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            <h2 className="text-2xl font-bold mb-2">📤 Upload</h2>
            <p className="text-sm">Add documents to your knowledge base</p>
          </Link>

          <Link
            href="/search"
            className="p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
          >
            <h2 className="text-2xl font-bold mb-2">🔍 Search</h2>
            <p className="text-sm">Find relevant chunks</p>
          </Link>

          <Link
            href="/ask"
            className="p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            <h2 className="text-2xl font-bold mb-2">💬 Ask AI</h2>
            <p className="text-sm">Get answers with RAG</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link
            href="/jira"
            className="p-6 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-center"
          >
            <h2 className="text-2xl font-bold mb-2">📋 JIRA</h2>
            <p className="text-sm">Sync JIRA issues</p>
          </Link>

          <Link
            href="/confluence"
            className="p-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
          >
            <h2 className="text-2xl font-bold mb-2">📄 Confluence</h2>
            <p className="text-sm">Sync Confluence pages</p>
          </Link>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>✅ HuggingFace all-MiniLM-L6-v2 (Free, Local)</p>
          <p>✅ PostgreSQL + Prisma</p>
          <p>✅ Chroma Vector Database</p>

          <div className="mt-6">
            <Link href="/api-docs" className="text-blue-600 hover:text-blue-800 font-medium">
              📖 View API Documentation →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
