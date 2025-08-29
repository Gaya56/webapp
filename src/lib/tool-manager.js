import { getToolById } from "@/config/tools";

/**
 * ToolManager handles execution of selected tools
 * Acts as a bridge between OpenAI function calling and MCP tools
 * Updated to use direct MCP tool integration
 */
export class ToolManager {
  constructor() {
    this.mcpTools = new Map(); // Cache for MCP tool functions
    this.initializeMCPTools();
  }

  /**
   * Initialize MCP tool functions
   * These will be injected based on available MCP capabilities
   */
  initializeMCPTools() {
    // MCP tools will be injected here when available
    // For now, we'll handle this in the execution methods
  }

  /**
   * Execute a tool function call
   * @param {string} toolId - ID of the tool to execute
   * @param {Object} parameters - Parameters for the tool function
   * @returns {Promise<string>} - Tool execution result
   */
  async executeTool(toolId, parameters) {
    const tool = getToolById(toolId);
    if (!tool) {
      throw new Error(`Tool ${toolId} not found`);
    }

    try {
      switch (toolId) {
        case "brave-search":
          return await this.executeBraveSearch(parameters);
        
        default:
          throw new Error(`Tool execution not implemented for ${toolId}`);
      }
    } catch (error) {
      console.error(`Error executing tool ${toolId}:`, error);
      return `Error executing ${tool.name}: ${error.message}`;
    }
  }

  /**
   * Execute Brave Search tool using MCP tools
   * @param {Object} parameters - Search parameters
   * @returns {Promise<string>} - Search results
   */
  async executeBraveSearch(parameters) {
    const { query, type = "web", count = 5 } = parameters;
    
    try {
      // Check if MCP tools are available globally
      if (typeof window !== 'undefined' && window.mcpTools) {
        return await this.executeMCPBraveSearch(window.mcpTools, query, type, count);
      }
      
      // Fallback to mock implementation for testing
      return this.mockBraveSearch(query, type, count);
    } catch (error) {
      console.error("Brave Search execution error:", error);
      throw error;
    }
  }

  /**
   * Execute MCP Brave Search tools
   */
  async executeMCPBraveSearch(mcpTools, query, type, count) {
    switch (type) {
      case "web":
        return await mcpTools.brave_web_search({ query, count });
      case "news":
        return await mcpTools.brave_news_search({ query, count });
      case "images":
        return await mcpTools.brave_image_search({ searchTerm: query, count: Math.min(count, 3) });
      case "videos":
        return await mcpTools.brave_video_search({ query, count });
      case "local":
        return await mcpTools.brave_local_search({ query, count });
      default:
        return await mcpTools.brave_web_search({ query, count });
    }
  }

  /**
   * Mock Brave Search for testing when MCP tools not available
   */
  mockBraveSearch(query, type, count) {
    return `Mock ${type} search results for "${query}" (${count} results requested):\n\n` +
           `🔍 Search Type: ${type}\n` +
           `📝 Query: ${query}\n` +
           `📊 Count: ${count}\n\n` +
           `This is a mock response. In production, this would return actual search results from Brave Search API.`;
  }

  /**
   * Process OpenAI function calls
   * @param {Array} toolCalls - Array of function calls from OpenAI
   * @returns {Promise<Array>} - Array of tool execution results
   */
  async processToolCalls(toolCalls) {
    const results = [];
    
    for (const toolCall of toolCalls) {
      try {
        const { function: func } = toolCall;
        const toolId = this.mapFunctionNameToToolId(func.name);
        const parameters = JSON.parse(func.arguments);
        
        const result = await this.executeTool(toolId, parameters);
        
        results.push({
          tool_call_id: toolCall.id,
          content: result
        });
      } catch (error) {
        console.error("Error processing tool call:", error);
        results.push({
          tool_call_id: toolCall.id,
          content: `Error: ${error.message}`
        });
      }
    }
    
    return results;
  }

  /**
   * Map OpenAI function name to internal tool ID
   */
  mapFunctionNameToToolId(functionName) {
    const mapping = {
      "brave_search": "brave-search"
    };
    return mapping[functionName] || functionName;
  }

  /**
   * Set MCP tools for testing
   * @param {Object} mcpTools - MCP tool functions
   */
  setMCPTools(mcpTools) {
    if (typeof window !== 'undefined') {
      window.mcpTools = mcpTools;
    }
    this.mcpTools.set('brave-search', mcpTools);
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.mcpTools.clear();
    if (typeof window !== 'undefined' && window.mcpTools) {
      delete window.mcpTools;
    }
  }
}

// Singleton instance
export const toolManager = new ToolManager();