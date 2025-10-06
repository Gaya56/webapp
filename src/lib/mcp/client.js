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
            console.log(`Streamable HTTP connection to ${name} failed, falling back to SSE transport:`, error.message);
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