#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools } from "./tools.js";

class FivetranServer {
  private mcpServer: McpServer;

  constructor() {
    this.mcpServer = new McpServer({
      name: "Fivetran Server",
      version: "1.1.0",
    });

    this.registerTools();
  }

  private registerTools() {
    for (const tool in tools) {
      this.mcpServer.registerTool(
        tool,
        tools[tool].config,
        tools[tool].handler
      );
    }
  }

  public async run() {
    const transport = new StdioServerTransport();
    await this.mcpServer.connect(transport);
  }
}

const server = new FivetranServer();
server.run().catch(console.error);
