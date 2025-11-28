import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import {
  CallToolResult,
  ServerNotification,
  ServerRequest,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";

const FIVETRAN_BASE_64_API_KEY = process.env.FIVETRAN_BASE_64_API_KEY;

if (!FIVETRAN_BASE_64_API_KEY) {
  throw new Error(
    "FIVETRAN_BASE_64_API_KEY must be set in environment variables."
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
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>
) => CallToolResult | Promise<CallToolResult>;

export type Tool = {
  config: ToolConfig;
  handler: ToolHandler;
};

export const axiosInstance: AxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.defaults.headers.common["x-api-key"] = FIVETRAN_BASE_64_API_KEY;
