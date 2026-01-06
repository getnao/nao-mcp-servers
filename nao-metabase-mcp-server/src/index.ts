#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools } from "./tools.js";

class MetabaseServer {
  private mcpServer: McpServer;

  constructor() {
    this.mcpServer = new McpServer({
      name: "Metabase Server",
      version: "0.4.2",
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

const server = new MetabaseServer();
server.run().catch(console.error);
