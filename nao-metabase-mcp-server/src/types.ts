import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { CallToolResult, ServerNotification, ServerRequest } from '@modelcontextprotocol/sdk/types.js';

export type ToolConfig = {
    title: string;
    description: string;
    inputSchema: any;
    outputSchema: any;
};

export type ToolHandler = (
    args: any,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
) => CallToolResult | Promise<CallToolResult>;


export type Tool = {
    config: ToolConfig;
    handler: ToolHandler;
};