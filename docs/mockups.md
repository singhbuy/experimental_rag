# RAG Application - ASCII Mockups

## 1. Main Search Interface

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                          🔍 KNOWLEDGE SEARCH                                   ║
╠════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║  ┌──────────────────────────────────────────────────────────────────────────┐ ║
║  │ 🔍  What authentication approach did we use for the mobile app...      │ ║
║  │                                                                        [🎤]│ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                ║
║  💡 Try asking:                                                                ║
║     • "Show me our Q3 sales strategy documents"                               ║
║     • "What were the design decisions for the checkout flow?"                 ║
║     • "Find research on customer retention from last year"                    ║
║                                                                                ║
║  ┌─ RECENT SEARCHES ─────────────────────────────────────────────────────────┐║
║  │  🕐 API security best practices                              2 hours ago  │║
║  │  🕐 Marketing campaign results Q2                            Yesterday    │║
║  │  🕐 Technical architecture microservices                     3 days ago   │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
║  ┌─ QUICK FILTERS ───────────────────────────────────────────────────────────┐║
║  │  [All Sources ▾]  [Any Date ▾]  [All Types ▾]  [All Departments ▾]       │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
║                                   [🔍 Search]                                  ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

## 2. Search Results Interface

```
╔════════════════════════════════════════════════════════════════════════════════╗
║  🔍 "What authentication approach did we use for the mobile app last year?"    ║
╠════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║  ⚡ AI SUMMARY                                                   [📋 Copy]    ║
║  ┌────────────────────────────────────────────────────────────────────────────┐║
║  │ Your mobile app uses OAuth 2.0 with JWT tokens for authentication. The    │║
║  │ implementation was completed in Q2 2024 and includes biometric support    │║
║  │ (Face ID/Touch ID). Key decisions were documented in the Tech Spec and    │║
║  │ security review from March 2024.                                          │║
║  │                                                                            │║
║  │ 📄 Sources: Mobile_Auth_Spec.pdf, Security_Review_Q2.docx, API_Docs.md   │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
║  📊 Found 12 results across 5 sources                    Relevance: 94%       ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                                ║
║  1. 📄 Mobile Authentication Technical Specification                          ║
║     Engineering Docs • Modified: Mar 15, 2024 • By: Sarah Chen               ║
║     ┌──────────────────────────────────────────────────────────────────────┐ ║
║     │ ...implemented OAuth 2.0 protocol with JWT token-based authentication│ ║
║     │ for the mobile application. The system supports refresh tokens and   │ ║
║     │ biometric authentication (Face ID/Touch ID) as secondary factors...  │ ║
║     └──────────────────────────────────────────────────────────────────────┘ ║
║     Confidence: ████████████████████ 98%     [View Full Doc] [Add to Notes] ║
║                                                                                ║
║  2. 📊 Q2 2024 Security Architecture Review                                   ║
║     Security Reports • Modified: Apr 2, 2024 • By: James Rodriguez            ║
║     ┌──────────────────────────────────────────────────────────────────────┐ ║
║     │ ...mobile authentication implementation passed security audit. OAuth  │ ║
║     │ 2.0 flows properly implemented with PKCE extension. Token rotation   │ ║
║     │ mechanism validated. Biometric fallback provides secure alternative..│ ║
║     └──────────────────────────────────────────────────────────────────────┘ ║
║     Confidence: ███████████████████░ 95%     [View Full Doc] [Add to Notes] ║
║                                                                                ║
║  3. 💻 Authentication Service API Documentation                               ║
║     Developer Docs • Modified: May 10, 2024 • By: Dev Team                   ║
║     ┌──────────────────────────────────────────────────────────────────────┐ ║
║     │ Mobile Auth Endpoints: POST /auth/mobile/login - Accepts OAuth 2.0   │ ║
║     │ credentials. Returns JWT access token (1hr expiry) and refresh token │ ║
║     │ (30 days). Supports biometric challenge flow via /auth/biometric...  │ ║
║     └──────────────────────────────────────────────────────────────────────┘ ║
║     Confidence: ██████████████████░░ 92%     [View Full Doc] [Add to Notes] ║
║                                                                                ║
║  [Load More Results...]                                                        ║
║                                                                                ║
║  ┌─ RELATED TOPICS ──────────────────────────────────────────────────────────┐║
║  │  • API Security Best Practices  • Mobile SDK Documentation                │║
║  │  • User Session Management      • Two-Factor Authentication Setup         │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

## 3. Admin Dashboard - Data Source Management

```
╔════════════════════════════════════════════════════════════════════════════════╗
║  🛠️  RAG SYSTEM - ADMIN DASHBOARD                            👤 Admin         ║
╠════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║  ┌─ NAVIGATION ────────────┐  ┌─ DATA SOURCES ─────────────────────────────┐ ║
║  │                          │  │                                            │ ║
║  │  📊 Dashboard            │  │  Status: ● 8 Active  ○ 2 Syncing  ⚠ 1 Error│ ║
║  │  🗂️  Data Sources    ◀── │  │                                            │ ║
║  │  🔄 Sync Status          │  │  ┌──────────────────────────────────────┐ │ ║
║  │  📈 Usage Analytics      │  │  │ Source Name        Type      Status   │ │ ║
║  │  👥 User Management      │  │  ├──────────────────────────────────────┤ │ ║
║  │  ⚙️  System Settings     │  │  │ Confluence Wiki    Wiki      ● Active│ │ ║
║  │  📝 Audit Logs           │  │  │ Google Drive       Cloud     ● Active│ │ ║
║  │                          │  │  │ SharePoint         Cloud     ● Active│ │ ║
║  └──────────────────────────┘  │  │ GitHub Repos       Code      ● Active│ │ ║
║                                │  │ Jira Projects      PM Tool   ● Active│ │ ║
║                                │  │ Slack Archives     Chat      ● Active│ │ ║
║                                │  │ Internal Docs      File Sys  ⟳ Sync  │ │ ║
║                                │  │ Design Files       Cloud     ● Active│ │ ║
║                                │  │ Customer CRM       Database  ● Active│ │ ║
║                                │  │ Legacy Wiki        Wiki      ⚠ Error │ │ ║
║                                │  └──────────────────────────────────────┘ │ ║
║                                │                                            │ ║
║                                │  [+ Add New Source]  [⟳ Sync All]         │ ║
║                                └────────────────────────────────────────────┘ ║
║                                                                                ║
║  ┌─ SYNC STATISTICS ──────────────────────────────────────────────────────────┐║
║  │                                                                            │║
║  │  Total Documents: 145,892    Last Full Sync: 2 hours ago                 │║
║  │  Total Size: 87.3 GB         Next Scheduled: Today at 2:00 AM            │║
║  │  Indexed Today: 234          Avg Sync Time: 45 minutes                   │║
║  │                                                                            │║
║  │  Document Type Breakdown:                                                 │║
║  │  PDF: ████████░░ 42%  |  DOCX: ██████░░░░ 28%  |  MD: ████░░░░░ 18%     │║
║  │  CODE: ██░░░░░░░ 8%   |  Other: █░░░░░░░░ 4%                             │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
║  ┌─ RECENT ACTIVITY ──────────────────────────────────────────────────────────┐║
║  │  ✓ Google Drive sync completed - 234 docs updated        2 mins ago      │║
║  │  ⚠ Legacy Wiki connection timeout - retrying             15 mins ago     │║
║  │  ✓ Confluence Wiki sync completed - 45 docs added         1 hour ago     │║
║  │  ✓ GitHub Repos sync completed - 12 files updated         2 hours ago    │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

## 4. Source Configuration Modal

```
╔════════════════════════════════════════════════════════════════════════════════╗
║  ⚙️  CONFIGURE DATA SOURCE                                         [✕ Close]  ║
╠════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║  Source Type: [Google Drive          ▾]                                       ║
║                                                                                ║
║  ┌─ CONNECTION SETTINGS ─────────────────────────────────────────────────────┐║
║  │                                                                            │║
║  │  Display Name: [Engineering Documents                            ]        │║
║  │                                                                            │║
║  │  Authentication:                                                           │║
║  │    ◉ OAuth 2.0                                                             │║
║  │    ○ Service Account                                                       │║
║  │    ○ API Key                                                               │║
║  │                                                                            │║
║  │  Folder Path: [/Company/Engineering/                              ]        │║
║  │                                                                            │║
║  │  [🔗 Authorize Access]                      Status: ✓ Connected           │║
║  │                                                                            │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
║  ┌─ SYNC SETTINGS ────────────────────────────────────────────────────────────┐║
║  │                                                                            │║
║  │  Sync Frequency:   [Every 6 hours           ▾]                            │║
║  │                                                                            │║
║  │  File Types:       ☑ PDF  ☑ DOCX  ☑ TXT  ☑ MD  ☐ XLSX  ☐ PPTX           │║
║  │                                                                            │║
║  │  Max File Size:    [100] MB                                               │║
║  │                                                                            │║
║  │  Exclude Patterns: [*.tmp, *.log, /archive/*                     ]        │║
║  │                                                                            │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
║  ┌─ INDEXING OPTIONS ─────────────────────────────────────────────────────────┐║
║  │                                                                            │║
║  │  ☑ Enable full-text search                                                │║
║  │  ☑ Extract metadata (author, date, tags)                                  │║
║  │  ☑ Generate embeddings for semantic search                                │║
║  │  ☐ OCR for scanned documents                                              │║
║  │                                                                            │║
║  │  Chunk Size:       [512] tokens      Overlap: [50] tokens                 │║
║  │                                                                            │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
║  ┌─ ACCESS CONTROL ───────────────────────────────────────────────────────────┐║
║  │                                                                            │║
║  │  ☑ Respect source permissions (users only see what they have access to)   │║
║  │                                                                            │║
║  │  Accessible to:    ◉ All employees    ○ Specific departments              │║
║  │                                                                            │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
║                    [Test Connection]  [Cancel]  [Save & Sync]                 ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

## 5. Analytics Dashboard

```
╔════════════════════════════════════════════════════════════════════════════════╗
║  📈 USAGE ANALYTICS                                    Date Range: [Last 30d ▾]║
╠════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║  ┌─ KEY METRICS ──────────────────────────────────────────────────────────────┐║
║  │                                                                            │║
║  │   Total Searches        Avg Response Time      User Satisfaction          │║
║  │      12,847                  1.2 sec               94.3%                   │║
║  │   ↑ 23% vs prev         ↓ 0.3s improvement     ↑ 2.1% improvement         │║
║  │                                                                            │║
║  │   Active Users          Time Saved/User        Sources Queried            │║
║  │      1,234                 2.3 hrs/week            8.2 avg                │║
║  │   ↑ 15% vs prev         ↑ 18% improvement      ↑ 1.2 sources             │║
║  │                                                                            │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
║  ┌─ SEARCH VOLUME TREND ──────────────────────────────────────────────────────┐║
║  │                                                                            │║
║  │  500│                                                        ●             │║
║  │  400│                                          ●         ●                 │║
║  │  300│                        ●             ●         ●                     │║
║  │  200│          ●         ●                                                 │║
║  │  100│    ●                                                                 │║
║  │    0└──────────────────────────────────────────────────────────────────   │║
║  │      Week 1   Week 2   Week 3   Week 4   Week 5   Week 6                  │║
║  │                                                                            │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
║  ┌─ TOP SEARCH QUERIES ───────────────┐  ┌─ MOST ACCESSED SOURCES ──────────┐║
║  │                                    │  │                                   │║
║  │  1. API authentication (234)      │  │  1. Confluence Wiki (2,847)      │║
║  │  2. Design system components (189)│  │  2. Google Drive (2,134)         │║
║  │  3. Customer onboarding (156)     │  │  3. GitHub Repos (1,892)         │║
║  │  4. Security best practices (142) │  │  4. Jira Projects (1,456)        │║
║  │  5. Product roadmap (128)         │  │  5. SharePoint (1,023)           │║
║  │                                    │  │                                   │║
║  └────────────────────────────────────┘  └───────────────────────────────────┘║
║                                                                                ║
║  ┌─ DEPARTMENT USAGE ─────────────────────────────────────────────────────────┐║
║  │                                                                            │║
║  │  Engineering:    ████████████████████░░░░░░░░░ 68% (843 users)           │║
║  │  Product:        ████████████░░░░░░░░░░░░░░░░░ 42% (312 users)           │║
║  │  Sales:          ██████████░░░░░░░░░░░░░░░░░░░ 35% (287 users)           │║
║  │  Marketing:      ████████░░░░░░░░░░░░░░░░░░░░░ 28% (198 users)           │║
║  │  Support:        ██████░░░░░░░░░░░░░░░░░░░░░░░ 22% (156 users)           │║
║  │                                                                            │║
║  └────────────────────────────────────────────────────────────────────────────┘║
║                                                                                ║
║                              [📊 Download Report]  [📧 Email Report]          ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

## 6. System Architecture Overview (ASCII Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RAG SYSTEM ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

                             USER INTERFACE LAYER
  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
  │   Web Client   │  │  Mobile Client │  │  API Gateway   │
  │   (React)      │  │   (Native)     │  │  (REST/GraphQL)│
  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘
           │                   │                   │
           └───────────────────┴───────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Load Balancer      │
                    │  (nginx/AWS ALB)    │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┴───────────────────┐
           │                                       │
  ┌────────▼─────────┐                   ┌────────▼─────────┐
  │  Query Service   │                   │  Auth Service    │
  │  (FastAPI)       │                   │  (OAuth 2.0)     │
  └────────┬─────────┘                   └──────────────────┘
           │
           ├──────────────────┬──────────────────┐
           │                  │                  │
  ┌────────▼─────────┐ ┌─────▼────────┐ ┌──────▼────────┐
  │  Embedding       │ │  Retrieval   │ │  Response     │
  │  Generator       │ │  Engine      │ │  Generator    │
  │  (OpenAI/Local)  │ │  (Vector DB) │ │  (LLM)        │
  └──────────────────┘ └─────┬────────┘ └───────────────┘
                             │
                    ┌────────▼────────┐
                    │  Vector Store   │
                    │  (Pinecone/     │
                    │   Weaviate/     │
                    │   ChromaDB)     │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
  ┌──────▼──────┐   ┌────────▼────────┐  ┌──────▼──────┐
  │  Document   │   │  Metadata DB    │  │  Cache      │
  │  Store      │   │  (PostgreSQL)   │  │  (Redis)    │
  │  (S3/Blob)  │   │                 │  │             │
  └──────┬──────┘   └─────────────────┘  └─────────────┘
         │
         │          DATA INGESTION PIPELINE
         │
  ┌──────▼──────────────────────────────────────────────────┐
  │  Ingestion Orchestrator (Apache Airflow / Prefect)      │
  └──────┬──────────────────────────────────────────────────┘
         │
         ├────────┬────────┬────────┬────────┬────────┐
         │        │        │        │        │        │
    ┌────▼───┐ ┌─▼────┐ ┌─▼────┐ ┌─▼────┐ ┌─▼────┐ ┌─▼────┐
    │Google  │ │Conflu│ │Share │ │GitHub│ │ Jira │ │Slack │
    │Drive   │ │ence  │ │Point │ │      │ │      │ │      │
    │Connector│ │Conn. │ │Conn. │ │Conn. │ │Conn. │ │Conn. │
    └────────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘

                    PROCESSING PIPELINE
         ┌────────────────────────────────────┐
         │  1. Document Extraction            │
         │  2. Text Chunking                  │
         │  3. Embedding Generation           │
         │  4. Metadata Extraction            │
         │  5. Vector Indexing                │
         └────────────────────────────────────┘

                    MONITORING & OBSERVABILITY
         ┌────────────────────────────────────┐
         │  Prometheus + Grafana              │
         │  ELK Stack (Logs)                  │
         │  Distributed Tracing (Jaeger)      │
         └────────────────────────────────────┘
```

## 7. Mobile Interface (Responsive Design)

```
┌─────────────────────┐
│  ☰  Knowledge Search│
├─────────────────────┤
│                     │
│  ┌─────────────────┐│
│  │ 🔍 Search...   🎤││
│  └─────────────────┘│
│                     │
│  💡 Quick Actions   │
│  ┌─────────────────┐│
│  │ 📄 Recent Docs  ││
│  ├─────────────────┤│
│  │ 🔖 Bookmarks    ││
│  ├─────────────────┤│
│  │ 👥 Ask Team     ││
│  └─────────────────┘│
│                     │
│  🕐 Recent          │
│  ┌─────────────────┐│
│  │ API auth...     ││
│  │ 📄 2 hours ago  ││
│  ├─────────────────┤│
│  │ Q2 marketing... ││
│  │ 📊 Yesterday    ││
│  ├─────────────────┤│
│  │ Architecture... ││
│  │ 💻 3 days ago   ││
│  └─────────────────┘│
│                     │
│ [🏠] [🔍] [📊] [⚙️] │
└─────────────────────┘
```

