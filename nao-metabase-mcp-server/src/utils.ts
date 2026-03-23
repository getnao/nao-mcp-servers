import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import {
  CallToolResult,
  ServerNotification,
  ServerRequest,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";

const METABASE_URL = process.env.METABASE_URL;
const METABASE_API_KEY = process.env.METABASE_API_KEY;

if (!METABASE_URL || !METABASE_API_KEY) {
  throw new Error(
    "METABASE_URL and METABASE_API_KEY must be set in environment variables.",
  );
}

export type ToolConfig = {
  title: string;
  description: string;
  inputSchema: any;
  outputSchema?: any;
};

export type ToolHandler = (
  args: any,
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => CallToolResult | Promise<CallToolResult>;

export type Tool = {
  config: ToolConfig;
  handler: ToolHandler;
};

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: METABASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const useMarkdown = process.argv.includes("--md");

axiosInstance.defaults.headers.common["x-api-key"] = METABASE_API_KEY;
