---
applyTo: '**'
---

# Project Context
This is a React-based web application that integrates with the Model Context Protocol (MCP) for advanced AI interactions. The application supports multiple AI chatbots, tool integrations, and features a modular architecture.

**⚠️ Current State**: The UI for MCP tools is implemented but the actual MCP server connection is not functional. The application uses mock responses when MCP tools are unavailable.

### My Documentation Updates: 
- `/workspaces/webapp/.github/docs/archon-integration-summary.md` - Added detailed analysis of the Archon MCP-RAG integration, including architecture, services, environment setup, and integration steps.

# Project Structure

## Core Dependencies
- **React**: 18.3.1 - UI framework
- **Vite**: 6.0.3 - Build tool and dev server
- **React Router**: 6.26.1 - Client-side routing
- **Jotai**: 2.9.3 - State management
- **@modelcontextprotocol/sdk**: 1.17.3 - MCP integration (installed but not implemented)
- **Tailwind CSS**: 3.4.10 - Styling framework

## Key Paths and Files

### Configuration Files
- `/workspaces/webapp/vite.config.js` - Vite configuration with path aliases
- `/workspaces/webapp/tailwind.config.js` - Tailwind CSS configuration
- `/workspaces/webapp/package.json` - Project dependencies and scripts
- `/workspaces/webapp/eslint.config.js` - ESLint rules for code quality

### Source Structure
- `/workspaces/webapp/src/main.jsx` - Application entry point
- `/workspaces/webapp/src/bots/` - Bot implementations for different AI models
- `/workspaces/webapp/src/components/` - Reusable React components
- `/workspaces/webapp/src/pages/` - Page components for routing
- `/workspaces/webapp/src/config/` - Configuration modules
- `/workspaces/webapp/src/lib/` - Utility libraries and helpers
- `/workspaces/webapp/src/hooks/` - Custom React hooks
- `/workspaces/webapp/src/assets/` - Static assets (icons, styles)

## Key Components and Their Relationships

### Layout Components
- `AppLayout.jsx` - Main application layout wrapper
- `Layout.jsx` - Google OAuth and analytics provider wrapper
- `Sidebar/index.jsx` - Navigation sidebar component

### Page Components
- `HomePage.jsx` - Redirects to home.combochat.ai (lines 1-11)
- `ChatPage.jsx` - Main chat interface page (lines 1-12)
- `SingleBotChatPanel.jsx` - Individual bot chat panel (530+ lines)
- `MultiBotChatPanel.jsx` - Multiple bot comparison panel (400+ lines)
- `SettingsPage.jsx` - User settings and preferences (400+ lines)
- `VerifyMagicLink.jsx` - Magic link authentication handler (lines 1-33)

### Tool Integration (Currently Non-Functional)
- `/workspaces/webapp/src/config/tools.js` - Tool definitions and management
  - `AVAILABLE_TOOLS` array (line 5) - List of available MCP tools
  - `selectedToolsAtom` (line 41) - Jotai atom for selected tools
  - `getToolById()` function (line 44) - Tool lookup by ID
  - `getEnabledTools()` function (line 49) - Get enabled tools
  - `getToolsAsOpenAIFunctions()` (line 54) - OpenAI function format converter
  
- `/workspaces/webapp/src/lib/tool-manager.js` - Tool execution manager
  - `ToolManager` class (line 8) - Handles tool execution and MCP integration
  - `initializeMCPTools()` (line 18) - Placeholder for MCP initialization
  - `executeTool()` method (line 29) - Main tool execution entry point
  - `executeBraveSearch()` (line 54) - Brave search implementation
  - `executeMCPBraveSearch()` (line 74) - MCP-based search (requires window.mcpTools)
  - `mockBraveSearch()` (line 94) - Fallback mock implementation
  - `processToolCalls()` (line 107) - Process OpenAI function calls
  - `setMCPTools()` (line 148) - Set MCP tools (for testing)

### State Management (Jotai)
- `selectedToolsAtom` - Stores selected tools (tools.js:41)
- `currentUserAtom` - Current user state (state.js:56)
- `showAuthModalAtom` - Auth modal visibility (state.js:65)
- `themeAtom` - Application theme (state.js:46)
- `layoutAtom` - Multi-panel layout setting (state.js:43)
- `twoPanelBotsAtom` - Two-panel bot configuration (state.js:77)
- `threePanelBotsAtom` - Three-panel bot configuration (state.js:78)
- `fourPanelBotsAtom` - Four-panel bot configuration (state.js:79)
- `sixPanelBotsAtom` - Six-panel bot configuration (state.js:80)

## Import Patterns
- Absolute imports using `@/` alias mapped to `src/` directory
- Example: `import Button from "@/components/Button"`
- Static assets imported directly: `import logo from "@/assets/icons/pplx.png"`

## MCP Integration Gaps

### Missing Implementation
1. **MCP Client Initialization**
   - No import or usage of `@modelcontextprotocol/sdk` despite being installed
   - Need to create MCP client instance and connect to servers

2. **Tool Registration**
   - `window.mcpTools` is referenced but never populated
   - Need to register MCP tools from connected servers

3. **Server Connection**
   - No code to connect to MCP servers (e.g., brave-search server)
   - Need server connection configuration and management

### Current Workarounds
- `mockBraveSearch()` provides fake responses when MCP is unavailable
- Tools UI shows but doesn't execute real functions
- `selectedTools` are passed to bots but not utilized

## Bot Implementations
- `/workspaces/webapp/src/bots/chatgpt/bot.js` - ChatGPT implementation
  - Has `selectedTools` property (line 10)
  - Has `setSelectedTools()` method (line 147)
  - `getToolsForAPI()` method returns tool functions (line 134)
  - Tool calls are prepared but not executed (line 48)

## Key Functions and Hooks
- `useTools()` hook (`/src/hooks/use-tools.js`) - Tool selection management
  - `toggleTool()` - Toggle tool selection
  - `enableTool()` - Enable a specific tool
  - `disableTool()` - Disable a specific tool
  - `isToolSelected()` - Check if tool is selected
- `useAuth()` hook (`/src/hooks/useAuth.js`) - Authentication management
- `useChat()` hook (`/src/hooks/use-chat.js`) - Chat state management
- `increaseUsage()` (`/src/lib/increaseUsage.js`) - Usage tracking utility

## Markdown and Content Rendering
- `Markdown/index.jsx` - Markdown renderer with LaTeX support
- ThinkBlock component for AI reasoning display
- Code highlighting with `rehype-highlight`
- Math rendering with KaTeX

## Build and Development
- Development server: `npm run dev`
- Production build: `npm run build`
- Linting: `npm run lint`
- Preview: `npm run preview`

# Archon MCP-RAG Integration

## External Repository: mcp-crawl4ai-rag
**Repository**: https://github.com/coleam00/mcp-crawl4ai-rag (dev branch)  
**Purpose**: Knowledge base management with web crawling, document upload, and RAG capabilities

### Docker Services (4 microservices)
1. **Archon-Server** (FastAPI + Socket.IO)
   - Port: 8080
   - Features: Web crawling, document processing, Socket.IO for real-time updates
   - Health Check: http://localhost:8080/health

2. **Archon-MCP** (Lightweight MCP Server)
   - Port: 8051 (external) → 8000 (internal)
   - Transport: SSE (Server-Sent Events)
   - Purpose: MCP protocol interface for AI agents
   - Depends on: archon-server, archon-agents

3. **Archon-Agents** (AI/ML Service)
   - Port: 8052
   - Features: ML operations, reranking, AI agent tasks
   - Health Check: http://localhost:8052/health

4. **Archon-UI** (Frontend)
   - Port: 3737
   - Features: Knowledge base management, settings, document upload
   - API URL: http://localhost:8080

### Required Environment Variables
```bash
# .env file required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
OPENAI_API_KEY=sk-...  # Optional, managed via UI Settings
LOGFIRE_TOKEN=         # Optional
LOG_LEVEL=INFO         # Optional
```

### MCP Server Integration Points
**File**: `python/src/mcp/mcp_server.py` (12,502 bytes)
- Exposes MCP tools for knowledge base queries
- Uses SSE transport for browser compatibility
- Communicates with other services via HTTP
- Service URLs configured via environment:
  - `API_SERVICE_URL=http://archon-server:8080`
  - `AGENTS_SERVICE_URL=http://archon-agents:8052`

### Database Setup (Supabase)
**Migration Files** (run in order):
1. `migration/1_initial_setup.sql` - Core tables and functions
2. `migration/2_archon_projects.sql` - Project management (optional)
3. `migration/3_mcp_client_management.sql` - MCP client config (optional)

### Connection to Our WebApp

**Option 1: Direct HTTP Connection**
```javascript
// Connect to Archon MCP server via SSE
const mcpServerUrl = 'http://localhost:8051';
const transport = new SSEClientTransport(new URL(mcpServerUrl));
```

**Option 2: Docker Exec (Cursor-style)**
```json
{
  "archon": {
    "command": "docker",
    "args": [
      "exec", "-i",
      "-e", "TRANSPORT=stdio",
      "Archon-MCP",
      "python", "src/mcp/mcp_server.py"
    ]
  }
}
```

### Available RAG Tools (via MCP)
- Document upload and indexing
- Web crawling (sitemaps, docs sites)
- Knowledge base search with RAG
- Project/task management
- Hybrid search (vector + keyword)
- Contextual embeddings
- Reranking with AI agents

### Integration Steps for WebApp

1. **Start Archon Services**
   ```bash
   cd path/to/mcp-crawl4ai-rag
   docker-compose up -d
   ```

2. **Configure WebApp MCP Client**
   - Create `/src/lib/mcp/archon-client.js`
   - Connect to http://localhost:8051 via SSE
   - Register Archon tools in `AVAILABLE_TOOLS`

3. **Add RAG Tools to Tool Manager**
   - Extend `tool-manager.js` with Archon tool execution
   - Map Archon MCP tools to OpenAI function format
   - Handle RAG responses in chat interface

4. **UI Integration**
   - Add "Knowledge Base" toggle in settings
   - Show document upload interface
   - Display RAG sources in chat responses

# Required MCP Implementation Steps

1. **Initialize MCP Client**
   ```javascript
   import { Client } from '@modelcontextprotocol/sdk/client/index.js';
   import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
   ```

2. **Connect to MCP Servers**
   - Create transport for brave-search server
   - Initialize client and connect
   - Register available tools in `window.mcpTools`

3. **Implement Tool Execution**
   - Replace mock implementations with actual MCP tool calls
   - Handle tool responses and errors
   - Update UI to show tool execution status

4. **Integration Points**
   - Initialize MCP in `main.jsx` or a dedicated service
   - Update `ToolManager` to use real MCP tools
   - Connect tool execution to chat flow

# Coding Guidelines

## File Organization
- Components in `/src/components/`
- Pages in `/src/pages/`
- Utilities in `/src/lib/`
- Configuration in `/src/config/`
- Custom hooks in `/src/hooks/`
- Bot implementations in `/src/bots/`

## Import Convention
- Use absolute imports with `@/` prefix
- Group imports: React → External libs → Internal components → Assets

## State Management
- Use Jotai atoms for global state
- Local state with React hooks for component-specific data
- Persist important state with `atomWithStorage`

## Component Structure
- Functional components with hooks
- Memoize expensive computations
- Use proper prop validation
- Export as default for pages, named exports for utilities

## Error Handling
- Try-catch blocks for async operations
- Toast notifications for user feedback
- Proper error boundaries for component failures

## Testing Approach
- Unit tests for utilities and hooks
- Component testing with React Testing Library
- Integration tests for critical user flows