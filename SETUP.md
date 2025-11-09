# Simple Setup Guide - No Docker
## For macOS (EC2 deployment ready)

---

## What You'll Install

1. **PostgreSQL** - Main database for metadata
2. **Chroma DB** - Vector database (runs via Python)
3. **Redis** - Cache and job queue (optional for MVP)
4. **Node.js packages** - Next.js and dependencies

---

## Step 1: Install PostgreSQL

```bash
# Install PostgreSQL using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify it's running
psql postgres -c "SELECT version();"
```

### Create Database & User

```bash
# Access PostgreSQL
psql postgres

# In the PostgreSQL prompt, run:
```

```sql
CREATE DATABASE ragdb;
CREATE USER raguser WITH ENCRYPTED PASSWORD 'ragpassword';
GRANT ALL PRIVILEGES ON DATABASE ragdb TO raguser;
ALTER DATABASE ragdb OWNER TO raguser;
\q
```

### Test Connection

```bash
psql postgresql://raguser:ragpassword@localhost:5432/ragdb -c "SELECT 'Connected!';"
```

**Expected output:** `Connected!`

---

## Step 2: Install Python & Chroma

```bash
# Check if Python 3 is installed
python3 --version  # Should be 3.9+

# If not installed:
brew install python3

# Install Chroma DB
pip3 install chromadb
```

### Start Chroma Server

```bash
# Create directory for Chroma data
mkdir -p chroma_data

# Run Chroma server (keep this terminal open)
chroma run --path ./chroma_data --port 8000
```

### Test Chroma (in a new terminal)

```bash
curl http://localhost:8000/api/v1/heartbeat
```

**Expected output:** JSON with heartbeat data

---

## Step 3: Install Redis (Optional - for later)

For MVP, you can skip Redis. Add it later when you need:
- Session management
- Job queues for document processing
- Rate limiting

```bash
# Install (optional)
brew install redis

# Start (if needed)
brew services start redis

# Test
redis-cli ping  # Should return PONG
```

---

## Step 4: Setup Next.js Project

### Install Dependencies

```bash
cd /Users/yogendrabundela/Documents/AIProjects/ModernAIProjects/rag-frontend

# Install all packages
npm install
```

If you don't have a package.json yet, I'll create one for you.

### Create Environment File

```bash
# Create environment file
touch .env.local
```

**Edit `.env.local` with these values:**

```env
# Database
DATABASE_URL="postgresql://raguser:ragpassword@localhost:5432/ragdb?schema=public"

# Chroma DB
CHROMA_URL="http://localhost:8000"

# OpenAI API (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY="your-api-key-here"

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-secret-with-openssl-rand-base64-32"

# Optional: Redis (if you installed it)
# REDIS_URL="redis://localhost:6379"

# Environment
NODE_ENV="development"
```

### Generate NextAuth Secret

```bash
# Generate secure secret
openssl rand -base64 32

# Copy the output and paste in .env.local as NEXTAUTH_SECRET
```

---

## Step 5: Setup Prisma & Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

Prisma Studio opens at: http://localhost:5555

---

## Step 6: Start the Application

### Terminal Setup (you'll need 2-3 terminals)

**Terminal 1: Chroma DB**
```bash
cd /Users/yogendrabundela/Documents/AIProjects/ModernAIProjects/rag-frontend
chroma run --path ./chroma_data --port 8000
```

**Terminal 2: Next.js**
```bash
cd /Users/yogendrabundela/Documents/AIProjects/ModernAIProjects/rag-frontend
npm run dev
```

**PostgreSQL** runs as a background service, so no terminal needed.

---

## Verification Checklist

Run these commands to verify everything works:

```bash
# 1. PostgreSQL
psql postgresql://raguser:ragpassword@localhost:5432/ragdb -c "SELECT 'DB OK';"

# 2. Chroma
curl http://localhost:8000/api/v1/heartbeat

# 3. Next.js (in browser)
open http://localhost:3000
```

---

## Quick Start Script

Create a file `start.sh`:

```bash
#!/bin/bash

# Start Chroma in background
echo "Starting Chroma DB..."
chroma run --path ./chroma_data --port 8000 &
CHROMA_PID=$!

# Wait for Chroma to start
sleep 2

# Start Next.js
echo "Starting Next.js..."
npm run dev

# Cleanup on exit
trap "kill $CHROMA_PID" EXIT
```

Make it executable:
```bash
chmod +x start.sh
./start.sh
```

---

## For EC2 Deployment Later

This setup translates easily to EC2:

### On EC2 Ubuntu/Amazon Linux:

```bash
# PostgreSQL
sudo apt install postgresql postgresql-contrib

# Python & Chroma
sudo apt install python3-pip
pip3 install chromadb

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Setup as systemd services for production
```

Same code, same setup - just different package manager (apt instead of brew).

---

## Troubleshooting

### PostgreSQL won't start
```bash
# Check status
brew services list | grep postgresql

# Restart
brew services restart postgresql@15

# View logs
tail -f /usr/local/var/log/postgresql@15.log
```

### Chroma connection refused
```bash
# Make sure it's running on correct port
ps aux | grep chroma

# Kill if needed
pkill -f "chroma run"

# Restart
chroma run --path ./chroma_data --port 8000
```

### Port 3000 already in use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Prisma errors
```bash
# Regenerate client
npx prisma generate

# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Or just push schema again
npx prisma db push
```

---

## Daily Workflow

### Starting Development

```bash
# 1. Make sure PostgreSQL is running (it should auto-start)
brew services list | grep postgresql

# 2. Start Chroma (Terminal 1)
chroma run --path ./chroma_data --port 8000

# 3. Start Next.js (Terminal 2)
npm run dev
```

### Stopping Development

```bash
# Stop Next.js: Ctrl+C in Terminal 2
# Stop Chroma: Ctrl+C in Terminal 1
# PostgreSQL keeps running in background (that's OK)
```

---

## What's Running Where

| Service | Port | URL | Auto-start? |
|---------|------|-----|-------------|
| PostgreSQL | 5432 | `localhost:5432` | Yes (brew service) |
| Chroma DB | 8000 | `http://localhost:8000` | No (manual) |
| Next.js | 3000 | `http://localhost:3000` | No (npm run dev) |
| Prisma Studio | 5555 | `http://localhost:5555` | No (npx prisma studio) |

---

## Next Steps

1. ✅ Verify all services are running
2. ✅ Visit http://localhost:3000
3. 📝 Check if you need package.json and Prisma schema files
4. 🔨 Start building!

**Need the config files?** Let me know and I'll create:
- `package.json` with all dependencies
- `prisma/schema.prisma` with database schema
- `tsconfig.json` for TypeScript
- Basic API routes
