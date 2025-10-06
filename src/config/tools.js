import { atomWithStorage } from "jotai/utils";
import pplxLogo from "@/assets/icons/pplx.png";

// Available tools that can be used by models
export const AVAILABLE_TOOLS = [
{
toolId: "rag-search",
name: "Knowledge Base Search",
description: "Search through uploaded documents and crawled websites using RAG",
icon: pplxLogo,
category: "search",
mcpServer: "archon",
enabled: true,
functionDef: {
name: "perform_rag_query",
description: "Perform a RAG query on stored content",
parameters: {
type: "object",
properties: {
query: {
type: "string",
description: "The search query"
},
source: {
type: "string",
description: "Optional source domain to filter results (e.g., 'example.com')"
},
match_count: {
    type: "number",
    description: "Maximum number of results to return",
      default: 5
      }
      },
      required: ["query"]
  }
}
},
{
toolId: "code-search",
name: "Code Examples Search",
description: "Search for code examples in the knowledge base",
icon: pplxLogo,
category: "search",
mcpServer: "archon",
enabled: false,
functionDef: {
name: "search_code_examples",
description: "Search for code examples relevant to the query",
parameters: {
type: "object",
properties: {
query: {
type: "string",
description: "The search query"
},
source_id: {
    type: "string",
    description: "Optional source ID to filter results"
    },
      match_count: {
          type: "number",
          description: "Maximum number of results to return",
        default: 5
      }
    },
    required: ["query"]
  }
}
},
{
toolId: "sources-list",
name: "Available Sources",
description: "Get list of available sources in the knowledge base",
icon: pplxLogo,
category: "info",
mcpServer: "archon",
enabled: false,
functionDef: {
name: "get_available_sources",
description: "Get list of available sources in the knowledge base",
parameters: {
type: "object",
properties: {},
required: []
}
}
}
];

// Atom to store selected tools for the current session
export const selectedToolsAtom = atomWithStorage("selectedTools", []);

// Get tool by ID
export function getToolById(toolId) {
  return AVAILABLE_TOOLS.find(tool => tool.toolId === toolId);
}

// Get enabled tools
export function getEnabledTools(selectedTools) {
  return AVAILABLE_TOOLS.filter(tool => selectedTools.includes(tool.toolId));
}

// Convert tools to OpenAI function format
export function getToolsAsOpenAIFunctions(selectedTools) {
  const enabledTools = getEnabledTools(selectedTools);
  return enabledTools.map(tool => ({
    type: "function",
    function: tool.functionDef
  }));
}