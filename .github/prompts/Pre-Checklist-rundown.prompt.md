---
mode: integrator-guide
---
Define the task to achieve, including specific requirements, constraints, and success criteria.

### Task: 
- Code Quality: Check syntax, imports, linting, and build integrity
MCP Client Verification: Validate SDK version, official patterns, SSE transport, error handling
Integration Points: Confirm main.jsx setup, window.mcpTools population, initialization flow
Tool Configuration: Verify tool definitions, ID mappings, OpenAI function formats, parameter schemas -> one by one keeping track of what we have done and what is left to do.

- You will review your exact implementation against the provided prompt instructions `/workspaces/webapp/.github/prompts/Fix-Current-MCStructure-locally.prompt.md` using our prompt we have now implemented the MCP client integration for Archon RAG services.
- You will go through a pre-checklist to ensure all aspects of the implementation are correct and complete.
- You will be using all your tools available to you to ensure the implementation is correct and complete matches the repos and official docs.
- You will document any discrepancies or issues found during the review process.
- You will summarize the changes made in the implementation.
- As we go through it we will fix little issues one by one as we find them using official docs and the repo as reference.
- go through pre-checklist and mark them off as we go through them.

## Summary of MCP Implementation Changes

Based on the prompt instructions, I've successfully implemented the core MCP integration fixes:

### ✅ **Completed Implementation Steps**

### 1. **MCP Client Service Created** (client.js)

- Created MCPClientManager class with official SDK patterns
- Implemented Streamable HTTP with SSE fallback (following official docs)
- Added client initialization, tool discovery, and connection management
- Proper error handling and cleanup methods

### 2. **Main Application Integration** (main.jsx)

- Added MCP client import
- Created initializeMCP() function for Archon server connection (port 8051)
- Populated window.mcpTools for backward compatibility
- Added graceful fallback for initialization failures

### 3. **Tool Manager Updates** (tool-manager.js)

- Enhanced executeTool() to handle archon-search and web-crawl
- Added executeArchonSearch() method for knowledge base queries
- Added executeWebCrawl() method for website indexing
- Updated executeBraveSearch() to try Archon first, then fallback
- Enhanced initializeMCPTools() for proper MCP discovery

### 4. **Tools Configuration Modernized** (tools.js)

- Replaced brave-search with archon-search as primary tool (enabled by default)
- Added web-crawl tool for website indexing
- Kept brave-search as fallback option (disabled by default)
- Updated tool definitions to match Archon's MCP API


# Archon MCP-RAG Integration Pre-Checklist

### **A. Code Quality & Syntax**

- [ ]  Run `npm run lint` to check for ESLint errors
- [ ]  Verify all imports resolve correctly
- [ ]  Check that @ alias imports work properly
- [ ]  Ensure no TypeScript/JavaScript syntax errors

### **B. MCP Client Verification**

- [ ]  Verify MCP SDK version is 1.17.3 in package.json
- [ ]  Check client.js follows official SDK patterns from docs
- [ ]  Confirm SSE transport fallback is implemented correctly
- [ ]  Validate error handling in connection logic

### **C. Integration Points**

- [ ]  Verify main.jsx imports and calls mcpManager correctly
- [ ]  Check window.mcpTools is populated for tool-manager.js
- [ ]  Confirm initializeMCP() function is called after React render
- [ ]  Validate graceful fallback when MCP servers are unavailable

### **D. Tool Configuration**

- [ ]  Verify AVAILABLE_TOOLS contains archon-search, web-crawl, brave-search
- [ ]  Check tool IDs match between tools.js and tool-manager.js
- [ ]  Confirm OpenAI function format is correct for each tool
- [ ]  Validate tool parameter schemas are properly defined