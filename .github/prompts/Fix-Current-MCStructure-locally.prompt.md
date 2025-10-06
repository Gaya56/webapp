---
mode: agent
---
Define the task to achieve, including specific requirements, constraints, and success criteria.
 
 # main rule: use all your tools carefully and double check before and after with official docs crossreference with repositorys and official docs
 # main rule: do not make up any code, only use existing code
  
# Current Infrastructure Analysis

### 1. Does the existing infrastructure work?
Partially functional with critical gaps:

- **✅ Working Components:**
    - **selectedToolsAtom (line 41)** - Properly stores tool selections using Jotai's atomWithStorage
    - **useTools() hook** - Correctly manages tool state with all necessary methods
    - **AVAILABLE_TOOLS array** - Well-structured tool definitions with OpenAI function format
    - **ToolManager class** - Has proper structure but relies on mocks
- **❌ Not Working:**
    - **No MCP SDK imports** - Despite having @modelcontextprotocol/sdk@1.17.3 installed, it's never imported
    - **window.mcpTools never populated** - Referenced at lines 58 & 77 but never initialized
    - **Falls back to mocks** - mockBraveSearch() always executes in production

### 2. Identify missing MCP SDK integration:
1. **Tool registration mismatch:**

Archon exposes: crawl_single_page, smart_crawl_url, perform_rag_query, get_available_sources

Webapp expects: brave_search (doesn't match Archon tools)

### 4. Cross-reference with official docs:

MCP SDK Requirements Not Met:

- **Client initialization** - Need to create Client instance
- **Transport setup** - Must use SSE for browser (not stdio)
- **Tool discovery** - Should use client.listTools() not hardcoded tools
- **Tool execution** - Must use client.callTool() not direct function calls

### Summary

The existing infrastructure has the correct React/Jotai structure but lacks actual MCP implementation. It's a well-designed skeleton waiting for real MCP client code. The patterns are correct, but the MCP SDK integration is completely missing.

### Critical Fixes Needed:

- **Import and initialize MCP SDK Client**
- **Create SSE transport to connect to http://localhost:8051/sse**
- **Replace brave-search with Archon's actual RAG tools**
- **Use client.callTool() instead of window.mcpTools**

### Task Definition
# Fix Current MCP Structure - Implementation Guide

## Context Analysis
Based on comprehensive analysis of `/workspaces/webapp`, the MCP integration infrastructure exists but is not functional:

- **Package**: `@modelcontextprotocol/sdk@1.17.3` installed but never imported
- **Tool Manager**: Proper structure but relies on mocks (`mockBraveSearch()` at line 94)
- **UI Integration**: Complete tool selection UI but no backend connection
- **State Management**: Jotai atoms configured correctly but `window.mcpTools` never populated

## Required Fixes

### 1. Create MCP Client Service with SSE Transport
**File**: `/src/lib/mcp/client.js` (new file)

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

class MCPClientManager {
  constructor() {
    this.clients = new Map();
    this.tools = new Map();
  }

  async initializeClient(name, baseUrl) {
    let client;
    
    try {
      // Try modern Streamable HTTP first
      client = new Client({
        name: `webapp-${name}`,
        version: "1.0.0"
      });
      
      const transport = new StreamableHTTPClientTransport(new URL(baseUrl));
      await client.connect(transport);
      console.log(`Connected to ${name} using Streamable HTTP transport`);
    } catch (error) {
      // Fall back to SSE transport for browser compatibility
      console.log(`Streamable HTTP connection to ${name} failed, falling back to SSE transport`);
      client = new Client({
        name: `webapp-${name}-sse`,
        version: "1.0.0"
      });
      
      const sseTransport = new SSEClientTransport(new URL(baseUrl));
      await client.connect(sseTransport);
      console.log(`Connected to ${name} using SSE transport`);
    }
    
    // List and register available tools
    const { tools } = await client.listTools();
    tools.forEach(tool => {
      this.tools.set(tool.name, { client, tool });
    });
    
    this.clients.set(name, client);
    return client;
  }

  async callTool(toolName, args) {
    const toolInfo = this.tools.get(toolName);
    if (!toolInfo) {
      throw new Error(`Tool ${toolName} not found`);
    }

    const { client, tool } = toolInfo;
    return await client.callTool({
      name: tool.name,
      arguments: args
    });
  }

  getAvailableTools() {
    return Array.from(this.tools.values()).map(({ tool }) => tool);
  }

  async disconnect() {
    for (const client of this.clients.values()) {
      try {
        await client.close();
      } catch (error) {
        console.warn('Error disconnecting MCP client:', error);
      }
    }
    this.clients.clear();
    this.tools.clear();
  }
}

export const mcpManager = new MCPClientManager();
```

### 2. Initialize MCP in Main Application
**File**: `/src/main.jsx`
**Action**: Add MCP initialization after line 7

```javascript
// Add import
import { mcpManager } from '@/lib/mcp/client.js';

// Add initialization after ReactDOM.createRoot
async function initializeMCP() {
  try {
    // Initialize Archon MCP server (primary target)
    await mcpManager.initializeClient('archon', 'http://localhost:8051');
    
    // Optionally initialize brave-search for fallback
    // await mcpManager.initializeClient('brave-search', 'http://localhost:8052');
    
    // Populate window.mcpTools for tool-manager.js compatibility
    window.mcpTools = {
      listTools: () => Promise.resolve({
        tools: mcpManager.getAvailableTools()
      }),
      callTool: (name, args) => mcpManager.callTool(name, args)
    };
    
    console.log('MCP initialized successfully');
  } catch (error) {
    console.warn('MCP initialization failed, using mock responses:', error);
  }
}

// Initialize MCP
initializeMCP();
```

### 3. Update Tool Manager to Use Real MCP
**File**: `/src/lib/tool-manager.js`
**Action**: Replace `executeBraveSearch()` method (lines 54-73)

```javascript
async executeBraveSearch(query, args = {}) {
  try {
    // First try MCP Archon tools (RAG-enabled search)
    if (window.mcpTools) {
      const archonResult = await this.executeMCPArchonSearch(query, args);
      if (archonResult) return archonResult;
    }
    
    // Fall back to brave search
    return await this.executeMCPBraveSearch(query, args);
  } catch (error) {
    console.error('Search execution failed:', error);
    return this.mockBraveSearch(query);
  }
}
```

**Action**: Add new method after line 94

```javascript
async executeMCPArchonSearch(query, args = {}) {
  try {
    if (!window.mcpTools) return null;
    
    // Use Archon's knowledge base search
    const result = await window.mcpTools.callTool('search_knowledge_base', {
      query: query,
      max_results: args.count || 5,
      ...args
    });

    if (result.content && result.content[0]) {
      const content = result.content[0];
      return {
        results: content.results || [{ 
          title: "Knowledge Base Result", 
          snippet: content.text,
          url: content.uri || "#"
        }],
        query: query,
        source: 'archon-rag'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Archon search failed:', error);
    return null;
  }
}
```

### 4. Update Tools Configuration for Archon
**File**: `/src/config/tools.js`
**Action**: Replace `AVAILABLE_TOOLS` array (line 5)

```javascript
export const AVAILABLE_TOOLS = [
  {
    id: 'archon-search',
    name: 'Knowledge Base Search',
    description: 'Search through uploaded documents and crawled websites using RAG',
    enabled: true,
    function: {
      name: 'search_knowledge_base',
      description: 'Search the knowledge base with RAG capabilities',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          },
          max_results: {
            type: 'number',
            description: 'Maximum number of results to return',
            default: 5
          }
        },
        required: ['query']
      }
    }
  },
  {
    id: 'web-crawl',
    name: 'Web Crawler',
    description: 'Crawl and index websites for knowledge base',
    enabled: false,
    function: {
      name: 'crawl_website',
      description: 'Crawl a website and add to knowledge base',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'Website URL to crawl'
          },
          max_pages: {
            type: 'number',
            description: 'Maximum pages to crawl',
            default: 10
          }
        },
        required: ['url']
      }
    }
  },
  {
    id: 'brave-search',
    name: 'Web Search',
    description: 'Search the web using Brave Search API',
    enabled: false,
    function: {
      name: 'brave_search',
      description: 'Search the web for current information',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          },
          count: {
            type: 'number',
            description: 'Number of results to return',
            default: 5
          }
        },
        required: ['query']
      }
    }
  }
];
```

### 5. Update Tool Manager Initialization
**File**: `/src/lib/tool-manager.js`
**Action**: Replace `initializeMCPTools()` method (line 18)

```javascript
async initializeMCPTools() {
  try {
    if (window.mcpTools) {
      // Get available tools from MCP
      const { tools } = await window.mcpTools.listTools();
      
      // Map MCP tools to our tool format
      tools.forEach(tool => {
        console.log(`Available MCP tool: ${tool.name}`);
      });
      
      this.mcpInitialized = true;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to initialize MCP tools:', error);
    return false;
  }
}
```

## Archon Integration Steps

### 1. Start Archon Services
```bash
# Clone and start Archon MCP-RAG services
git clone https://github.com/coleam00/mcp-crawl4ai-rag.git -b dev
cd mcp-crawl4ai-rag

# Create .env file with Supabase credentials
echo "SUPABASE_URL=https://your-project.supabase.co" > .env
echo "SUPABASE_SERVICE_KEY=your-service-key" >> .env

# Start all services
docker-compose up -d

# Verify services are running
curl http://localhost:8080/health  # archon-server
curl http://localhost:8051/health  # archon-mcp  
curl http://localhost:8052/health  # archon-agents
```

### 2. Test MCP Connection
Add to `/src/main.jsx` after MCP initialization:

```javascript
// Test MCP connection
setTimeout(async () => {
  if (window.mcpTools) {
    try {
      const tools = await window.mcpTools.listTools();
      console.log('Available MCP tools:', tools);
    } catch (error) {
      console.error('MCP test failed:', error);
    }
  }
}, 2000);
```

### 3. Verify Integration
1. **Start webapp**: `npm run dev`
2. **Open developer tools** and check console for MCP logs
3. **Navigate to Settings** and verify "Knowledge Base Search" tool appears
4. **Enable the tool** and test in chat interface
5. **Check Archon UI** at http://localhost:3737 for document management

## Troubleshooting

### Common Issues

1. **CORS Errors**: Add CORS headers to Archon MCP server
2. **Connection Failures**: Verify Docker services are running and ports are accessible
3. **Tool Not Found**: Check if Archon tools are properly registered in MCP server
4. **SSE Issues**: Ensure browser supports Server-Sent Events

### Debug Commands

```bash
# Check Docker services
docker ps | grep archon

# Check MCP server logs
docker logs Archon-MCP

# Test MCP endpoint directly
curl -X POST http://localhost:8051 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Environment Variables

Ensure these are set in Archon's `.env`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
API_SERVICE_URL=http://archon-server:8080
AGENTS_SERVICE_URL=http://archon-agents:8052
OPENAI_API_KEY=sk-...  # Optional, can be set via UI
LOG_LEVEL=INFO
```

## Expected Results

After implementation:
1. ✅ MCP client successfully connects to Archon services
2. ✅ Knowledge base search tools appear in Settings
3. ✅ Chat interface executes real RAG searches instead of mocks
4. ✅ Results include sources from uploaded documents and crawled sites
5. ✅ Archon UI accessible for document/website management

This implementation replaces the current mock system with a fully functional MCP integration, enabling real knowledge base search and RAG capabilities through the Archon ecosystem.