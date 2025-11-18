#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios, { AxiosInstance } from "axios";
import { tools } from "./tools.js";
import dotenv from "dotenv";

dotenv.config();

const METABASE_URL = process.env.METABASE_URL;
const METABASE_API_KEY = process.env.METABASE_API_KEY;

if (!METABASE_URL || !METABASE_API_KEY) {
    throw new Error("METABASE_URL and METABASE_API_KEY must be set in environment variables.");
}

class MetabaseServer {
    private mcpServer: McpServer;
    private axiosInstance: AxiosInstance;

    constructor() {
        this.mcpServer = new McpServer({
            name: "Metabase Server",
            version: "1.0.0",
        });

        this.axiosInstance = axios.create({
            baseURL: process.env.METABASE_URL,
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (METABASE_API_KEY) {
            this.axiosInstance.defaults.headers.common['X-API-Key'] = METABASE_API_KEY;
        } else {
            throw new Error("METABASE_API_KEY is not set.");
        }

        this.registerTools();
    }


    private registerTools () {
        for (const tool in tools) {
            this.mcpServer.registerTool(tool, tools[tool].config, tools[tool].handler);
        }
    }


    public async run() {
        const transport = new StdioServerTransport();
        await this.mcpServer.connect(transport);
    }
}

const server = new MetabaseServer();
server.run().catch(console.error);