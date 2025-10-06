---
mode: agent
---
Define the task to achieve, including specific requirements, constraints, and success criteria.

Current situation: 
Current Infrastructure Analysis

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

### 2. Does it follow webapp repo format?

Yes, perfectly aligned:

- **✅ Correct Patterns:**
    - **Uses @/ import aliases consistently**
    - **Follows Jotai atom patterns (atomWithStorage for persistence)**
    - **ES6 module exports/imports match repo style**
    - **Singleton pattern for ToolManager matches other services**
    - **Hook naming convention (use-tools.js) follows React standards**

### 3. Syntax, symbols, imports, functions verification:

Comparing with MCP SDK docs and Archon repo:

**Issues Found:**

1. **Missing MCP Client initialization (Required per SDK docs):**

```jsx
// MISSING in webapp but REQUIRED:
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
```

1. **Incorrect tool execution pattern:**

```jsx
// Current (line 58-60):
if (typeof window !== 'undefined' && window.mcpTools) {
  return await this.executeMCPBraveSearch(window.mcpTools, query, type, count);
}
```

```jsx
// Should be (per SDK):
const result = await this.mcpClient.callTool('tool_name', { params });
```

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