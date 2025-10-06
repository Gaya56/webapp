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
        case "rag-search":
          return await this.executeRagSearch(parameters);
        case "code-search":
          return await this.executeCodeSearch(parameters);
        case "sources-list":
          return await this.executeSourcesList(parameters);

        default:
          throw new Error(`Tool execution not implemented for ${toolId}`);
      }
    } catch (error) {
      console.error(`Error executing tool ${toolId}:`, error);
      return `Error executing ${tool.name}: ${error.message}`;
    }
  }

  /**
   * Execute RAG Search tool using MCP tools
   * @param {Object} parameters - Search parameters
   * @returns {Promise<string>} - Search results
   */
  async executeRagSearch(parameters) {
  const { query, source, match_count = 5 } = parameters;
  
  try {
  if (window.mcpTools) {
    const result = await window.mcpTools.callTool('perform_rag_query', {
    query,
    source,
      match_count
    });
    
    if (result.content && result.content[0]) {
        const content = result.content[0];
      const data = JSON.parse(content.text);
      
        if (data.success && data.results) {
            return `RAG Search Results:\n\n${data.results.map(r => 
              `• ${r.content}\n  Source: ${r.metadata?.source || 'Unknown'}\n`
            ).join('\n')}`;
         }
       }
      }
    
  return `Mock RAG search for "${query}" - MCP not available`;
  } catch (error) {
  console.error('RAG search execution error:', error);
  return `Error executing RAG search: ${error.message}`;
  }
  }

  async executeCodeSearch(parameters) {
  const { query, source_id, match_count = 5 } = parameters;
  
  try {
  if (window.mcpTools) {
      const result = await window.mcpTools.callTool('search_code_examples', {
          query,
          source_id,
          match_count
      });
    
    if (result.content && result.content[0]) {
      const content = result.content[0];
      const data = JSON.parse(content.text);
    
    if (data.success && data.results) {
      return `Code Search Results:\n\n${data.results.map(r => 
          `• ${r.content}\n  Source: ${r.metadata?.source || 'Unknown'}\n`
            ).join('\n')}`;
      }
  }
  }
  
  return `Mock code search for "${query}" - MCP not available`;
  } catch (error) {
  console.error('Code search execution error:', error);
  return `Error executing code search: ${error.message}`;
  }
  }

  async executeSourcesList(parameters) {
  try {
  if (window.mcpTools) {
      const result = await window.mcpTools.callTool('get_available_sources', {});
    
    if (result.content && result.content[0]) {
        const content = result.content[0];
          const data = JSON.parse(content.text);
          
          if (data.success && data.sources) {
          return `Available Sources (${data.count}):\n\n${data.sources.map(s => 
            `• ${s.name || s.domain || s}\n`
          ).join('')}`;
      }
  }
  }
  
  return `Mock sources list - MCP not available`;
  } catch (error) {
  console.error('Sources list execution error:', error);
  return `Error getting sources list: ${error.message}`;
  }
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
      "perform_rag_query": "rag-search",
      "search_code_examples": "code-search",
      "get_available_sources": "sources-list"
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