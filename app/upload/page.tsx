'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Success! Document indexed with ${data.chunksCount} chunks`);
        setFile(null);
        setTitle('');
        // Reset file input
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        // Refresh documents list
        fetchDocuments();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/upload');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // Fetch documents on component mount
  useState(() => {
    fetchDocuments();
  });

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Upload</h1>
        <p className="text-gray-600">
          Upload documents to add them to your RAG knowledge base
        </p>
      </div>

      {/* Upload Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Document Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter document title"
            />
          </div>

          <div>
            <label
              htmlFor="fileInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select File
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              accept=".txt,.md,.json"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: .txt, .md, .json
            </p>
          </div>

          {file && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">
                <span className="font-medium">Selected:</span> {file.name} (
                {(file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Processing...' : 'Upload and Index Document'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-4 rounded-md ${
              message.includes('✅')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Uploaded Documents</h2>

        {documents.length === 0 ? (
          <p className="text-gray-500">No documents uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{doc.title}</h3>
                    <p className="text-sm text-gray-500">
                      {doc._count.chunks} chunks • {doc.source} •{' '}
                      <span
                        className={
                          doc.status === 'indexed'
                            ? 'text-green-600'
                            : doc.status === 'processing'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }
                      >
                        {doc.status}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(doc.createdAt).toLocaleDateString()} at{' '}
                      {new Date(doc.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={fetchDocuments}
          className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Refresh List
        </button>
      </div>
    </main>
  );
}
