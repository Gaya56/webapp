import { atomWithStorage } from "jotai/utils";
import pplxLogo from "@/assets/icons/pplx.png";

// Available tools that can be used by models
export const AVAILABLE_TOOLS = [
  {
    toolId: "brave-search",
    name: "Brave Search",
    description: "Search the web for current information using Brave Search API",
    icon: pplxLogo,
    category: "search",
    mcpServer: "brave-search", // Reference to MCP server
    enabled: false,
    functionDef: {
      name: "brave_search",
      description: "Search the web for current information",
      parameters: {
        type: "object",
        properties: {
          query: { 
            type: "string", 
            description: "Search query to find information" 
          },
          type: { 
            type: "string", 
            enum: ["web", "news", "local", "images", "videos"],
            description: "Type of search to perform",
            default: "web"
          }
        },
        required: ["query"]
      }
    }
  }
  // Future tools can be added here:
  // { toolId: "calculator", name: "Calculator", ... },
  // { toolId: "weather", name: "Weather", ... },
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