// Create JIRA Epics for RAG Project
require('dotenv').config({ path: '.env.local' });

const epics = [
  {
    name: 'Document Management & Upload System',
    summary: 'Build document upload and processing pipeline',
    description: `Implement a comprehensive document management system that allows users to upload documents (txt, md, json) and process them for RAG retrieval.

**Key Features:**
- File upload interface with drag-and-drop support
- Document chunking with configurable chunk size and overlap
- Metadata extraction and storage in PostgreSQL
- Document status tracking (pending, processing, indexed)
- List view of uploaded documents with chunk counts

**Technical Components:**
- Next.js upload API endpoint
- Prisma ORM for document metadata
- Text chunking algorithm with sentence-aware splitting
- Integration with vector database for embedding storage`,
  },
  {
    name: 'Vector Database & Embedding Infrastructure',
    summary: 'Set up ChromaDB and HuggingFace embeddings',
    description: `Build the vector database infrastructure for semantic search using ChromaDB and HuggingFace embeddings.

**Key Features:**
- ChromaDB vector database setup and configuration
- HuggingFace Transformers.js integration (all-MiniLM-L6-v2)
- 384-dimensional embeddings generation
- Batch embedding processing for efficiency
- Cosine similarity search implementation

**Technical Components:**
- ChromaDB client library integration
- Embedding generation pipeline
- Vector storage and retrieval functions
- Distance-to-similarity score conversion
- Collection management and indexing`,
  },
  {
    name: 'Semantic Search System',
    summary: 'Implement semantic search with similarity ranking',
    description: `Build a semantic search system that allows users to find relevant document chunks using natural language queries.

**Key Features:**
- Natural language query processing
- Vector similarity search with ChromaDB
- Similarity score calculation and ranking
- Configurable result limits
- Performance timing metrics
- Beautiful search results UI with highlighting

**Technical Components:**
- Search API endpoint with query embedding
- Result ranking and filtering
- Metadata enrichment from PostgreSQL
- Performance optimization
- React-based search interface`,
  },
  {
    name: 'RAG Question Answering System',
    summary: 'Build RAG-powered Q&A with OpenAI GPT-3.5',
    description: `Implement Retrieval Augmented Generation (RAG) for answering questions based on uploaded documents.

**Key Features:**
- Natural language question processing
- Context retrieval from vector database
- OpenAI GPT-3.5-turbo integration
- Source attribution and citation
- Answer generation with context awareness
- Question history tracking

**Technical Components:**
- RAG pipeline (retrieve → augment → generate)
- OpenAI API integration
- Prompt engineering for accurate answers
- Source tracking and display
- Interactive Q&A interface with history`,
  },
  {
    name: 'JIRA Integration for Issue Sync',
    summary: 'Sync JIRA issues into RAG knowledge base',
    description: `Build JIRA integration to automatically sync and index JIRA issues into the RAG system for searchability.

**Key Features:**
- JIRA Cloud API integration with Basic Auth
- JQL query support for flexible filtering
- Automatic issue chunking and embedding
- Issue metadata preservation (status, assignee, priority)
- Incremental sync with update detection
- Direct links to JIRA issues

**Technical Components:**
- JIRA API client with authentication
- Issue-to-document conversion
- Sync API endpoint with batch processing
- JIRA sync UI with status tracking
- Error handling and retry logic`,
  },
  {
    name: 'API Documentation & Developer Experience',
    summary: 'Create comprehensive API documentation',
    description: `Build complete API documentation for all RAG system endpoints with examples and integration guides.

**Key Features:**
- Endpoint documentation with request/response examples
- cURL and JavaScript code examples
- Error response documentation
- Technology stack overview
- Interactive documentation page

**Technical Components:**
- API documentation page
- Code examples for all endpoints
- Response schema documentation
- Authentication guides
- Performance metrics documentation`,
  },
];

async function createEpic(epic, projectKey) {
  const domain = process.env.JIRA_DOMAIN;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_TOKEN;

  const credentials = Buffer.from(`${email}:${token}`).toString('base64');
  const url = `https://${domain}/rest/api/3/issue`;

  const issueData = {
    fields: {
      project: {
        key: projectKey,
      },
      summary: epic.summary,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: epic.description,
              },
            ],
          },
        ],
      },
      issuetype: {
        id: '10001', // Epic
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issueData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to create epic "${epic.name}"`);
      console.error('Status:', response.status);
      console.error('Error:', errorText);
      return null;
    }

    const createdIssue = await response.json();
    console.log(`✅ Created: ${createdIssue.key} - ${epic.name}`);
    console.log(`   URL: https://${domain}/browse/${createdIssue.key}`);
    return createdIssue;

  } catch (error) {
    console.error(`❌ Error creating epic "${epic.name}":`, error.message);
    return null;
  }
}

async function main() {
  console.log('Creating JIRA Epics for RAG Project...\n');

  const projectKey = 'SCRUM';
  const createdEpics = [];

  for (const epic of epics) {
    const result = await createEpic(epic, projectKey);
    if (result) {
      createdEpics.push(result);
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Successfully created ${createdEpics.length} out of ${epics.length} epics`);

  if (createdEpics.length > 0) {
    console.log('\nCreated Epics:');
    createdEpics.forEach((epic, i) => {
      console.log(`${i + 1}. ${epic.key} - https://${process.env.JIRA_DOMAIN}/browse/${epic.key}`);
    });
  }
}

main();
