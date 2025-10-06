---
mode: integrator-guide
---

# MCP-Archon Integration Verification & Deployment Plan

## 🎯 **TASK DEFINITION**

**Objective**: Integrate Archon MCP-RAG services with the webapp to enable real-time knowledge base search, document processing, and RAG functionality through Model Context Protocol.

**Requirements**:
- ✅ Verify webapp MCP client implementation against official SDK docs
- ✅ Deploy Archon docker services with proper environment configuration
- ✅ Establish MCP connection between webapp and Archon server
- ✅ Test all three RAG tools: knowledge search, code search, sources listing
- ✅ Validate graceful fallback when services unavailable

**Constraints**:
- Must maintain existing webapp functionality
- No breaking changes to current bot implementations
- Must follow official MCP SDK patterns
- Supabase database required for Archon RAG storage

**Success Criteria**:
- Webapp connects to Archon MCP server at `http://localhost:8051`
- All three tools (rag-search, code-search, sources-list) execute successfully
- Browser console shows "MCP initialized successfully"
- Knowledge base search returns actual results from uploaded documents
- System gracefully degrades to mocks when Archon unavailable

---

## 📋 **PRE-INTEGRATION VERIFICATION**

### **A. Webapp MCP Implementation Status**
Cross-reference with official @modelcontextprotocol/sdk documentation:

#### A.1 Verify Dependencies
```bash
cd /workspaces/webapp
cat package.json | grep "@modelcontextprotocol/sdk"
# Expected: "@modelcontextprotocol/sdk": "^1.17.3"
```

#### A.2 Verify MCP Client Implementation
```bash
# Check client implementation follows official patterns
cat src/lib/mcp/client.js
# Verify imports match official docs:
# - import { Client } from '@modelcontextprotocol/sdk/client/index.js'
# - import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
# - import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
```

#### A.3 Verify Tool Definitions
```bash
# Check tools match Archon MCP server capabilities
cat src/config/tools.js
# Expected tools:
# - rag-search (perform_rag_query)
# - code-search (search_code_examples) 
# - sources-list (get_available_sources)
```

#### A.4 Verify Integration Points
```bash
# Check main.jsx initializes MCP
grep -n "mcpManager" src/main.jsx
# Expected: mcpManager.initializeClient('archon', 'http://localhost:8051')

# Check tool-manager.js uses MCP
grep -n "window.mcpTools" src/lib/tool-manager.js
# Expected: Real MCP calls, not just mocks
```

### **B. Archon Repository Verification**
Using existing local Archon installation:

#### B.1 Locate and Verify Existing Archon Installation
```bash
# Navigate to your existing Archon installation directory
# (Update path to match your actual Archon location)
cd /path/to/your/archon-installation
pwd  # Confirm you're in the correct directory
git status  # Verify it's the dev branch
git log --oneline -5  # Verify latest commits
```

#### B.2 Verify Docker Configuration
```bash
# Check docker-compose.yml has required services
cat docker-compose.yml | grep -E "(archon-server|archon-mcp|archon-agents)"
# Expected services:
# - archon-server:8080 (FastAPI + crawling)
# - archon-mcp:8051 (MCP server with SSE transport)
# - archon-agents:8052 (AI/ML service)
# - frontend:3737 (Archon UI)
```

#### B.3 Verify MCP Server Configuration
```bash
# Check MCP server file exists and has SSE transport
find . -name "*mcp_server.py" -exec head -50 {} \;
# Verify TRANSPORT=sse environment variable in docker-compose.yml
grep -A 10 -B 5 "TRANSPORT=sse" docker-compose.yml
```

---

## 🔧 **STEP-BY-STEP INTEGRATION EXECUTION**

### **PHASE 1: Environment Setup**

#### Step 1.1: Verify Existing Archon Installation
```bash
# Navigate to your existing Archon directory
cd /path/to/your/archon-installation

# Verify .env file exists and is configured
ls -la .env
cat .env | grep -E "(SUPABASE_URL|SUPABASE_SERVICE_KEY)"
# Should show your existing Supabase configuration
```

#### Step 1.2: Verify Database Schema (Skip if already done)
```bash
# Only run if you haven't set up the database yet ()
# Check if tables exist in your Supabase dashboard
# If not, run migration files in Supabase SQL editor:
# 1. migration/1_initial_setup.sql
# 2. migration/2_archon_projects.sql (optional)
# 3. migration/3_mcp_client_management.sql (optional)
```

### **PHASE 2: Archon Services Verification**

#### Step 2.1: Check Existing Services Status
```bash
# Navigate to your Archon installation
cd /path/to/your/archon-installation

# Check if services are running
docker-compose ps

# If not running, start them
docker-compose up -d

# Monitor startup logs if needed
docker-compose logs -f archon-mcp
```

#### Step 2.2: Verify Service Health
```bash
# Wait for services to be healthy (2-3 minutes)
docker-compose ps

# Check individual service health
curl -f http://localhost:8080/health  # Archon Server
curl -f http://localhost:8051/health  # MCP Server  
curl -f http://localhost:8052/health  # Agents Service
curl -f http://localhost:3737         # Archon UI
```

#### Step 2.3: Test MCP Server Directly
```bash
# Test MCP server SSE endpoint
curl -N -H "Accept: text/event-stream" http://localhost:8051/sse
# Expected: SSE stream connection established

# Test if tools are available
curl -X POST http://localhost:8051/messages \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

### **PHASE 3: Webapp Integration Testing**

#### Step 3.1: Start Webapp Development Server
```bash
cd /workspaces/webapp

# Install dependencies if needed
npm install

# Start development server
npm run dev
# Expected: Server starts on http://localhost:5173
```

#### Step 3.2: Verify MCP Connection
```bash
# Open browser to http://localhost:5173
# Open developer console (F12)
# Look for these log messages:
# - "Connected to archon using Streamable HTTP transport" OR
# - "Connected to archon using SSE transport"
# - "MCP initialized successfully"
```

#### Step 3.3: Test Tool Discovery
```javascript
// In browser console, verify tools are discovered:
console.log(window.mcpTools);
// Expected: Object with listTools() and callTool() methods

window.mcpTools.listTools().then(console.log);
// Expected: Array of tools including perform_rag_query, search_code_examples, get_available_sources
```

### **PHASE 4: RAG Functionality Testing**

#### Step 4.1: Upload Test Content
```bash
# Open Archon UI: http://localhost:3737
# Navigate to "Upload Documents" or "Web Crawling"
# Upload a test document or crawl a documentation site
# Verify content appears in knowledge base
```

#### Step 4.2: Test RAG Search Tool
```javascript
// In webapp chat interface:
// 1. Enable "Knowledge Base Search" tool in settings
// 2. Send message: "Search for information about [your uploaded content]"
// 3. Verify tool execution in browser console
// 4. Check response contains actual search results, not mock data
```

#### Step 4.3: Test All Three Tools
```javascript
// Test each tool individually in browser console:

// 1. RAG Search
window.mcpTools.callTool('perform_rag_query', {
  query: 'test query',
  match_count: 3
}).then(console.log);

// 2. Code Search  
window.mcpTools.callTool('search_code_examples', {
  query: 'function definition',
  match_count: 3
}).then(console.log);

// 3. Sources List
window.mcpTools.callTool('get_available_sources', {})
  .then(console.log);
```

---

## 🚨 **TROUBLESHOOTING CHECKLIST**

### **Connection Issues**
```bash
# If webapp can't connect to MCP server:
# Navigate to your Archon installation first
cd /path/to/your/archon-installation
docker-compose logs archon-mcp | tail -20
netstat -tlpn | grep 8051
curl -v http://localhost:8051/sse
```

### **Tool Discovery Issues**
```bash
# If tools not discovered:
# Make sure you're in your Archon directory
cd /path/to/your/archon-installation
docker exec -it Archon-MCP python -c "
from src.mcp.mcp_server import list_tools
print(list_tools())
"
```

### **RAG Search Issues**
```bash
# If search returns empty results:
curl -X POST http://localhost:8080/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query":"test","match_count":5}'
```

---

## ✅ **VALIDATION CRITERIA**

### **Technical Validation**
- [ ] Browser console shows "MCP initialized successfully"
- [ ] `window.mcpTools.listTools()` returns 3+ tools
- [ ] All docker services show "healthy" status
- [ ] Archon UI accessible at localhost:3737
- [ ] MCP server responds to SSE connections

### **Functional Validation**  
- [ ] RAG search returns actual results from knowledge base
- [ ] Code search finds relevant examples
- [ ] Sources list shows uploaded/crawled content
- [ ] Tools work through chat interface
- [ ] Graceful fallback when Archon services stopped

### **Integration Validation**
- [ ] No errors in webapp console during normal operation
- [ ] Existing bot functionality unchanged
- [ ] Tool selection UI works correctly
- [ ] OpenAI function calling integration preserved
- [ ] Performance acceptable (tool calls < 5 seconds)

---

## 🎯 **EXPECTED OUTCOMES**

Upon successful completion:
- **Webapp**: Real-time RAG search integrated into chat interface
- **Knowledge Base**: Searchable documents and code examples
- **User Experience**: Enhanced AI responses with factual, sourced information  
- **Architecture**: Scalable MCP integration ready for additional tools
- **Deployment**: Production-ready containerized RAG services

This integration transforms your webapp from mock-based tool responses to a powerful, knowledge-enhanced AI assistant with real-time document search and retrieval capabilities.