import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { connectServer } from './connect';
import { initialize } from './initialize';
import { createProxyTool } from './proxy';
import { createAuthTool } from './oAuth';
import { createCreateTool, createUpdateTool } from './write';
import express from 'express';
import { createConnectionManagerTools } from './connectionManager';
import { createSearchTool } from './search';

async function main(): Promise<express.Application> {
    // @ts-ignore
    const server = initialize() as Server;
    await createSearchTool(server);
    await createAuthTool(server, 'hubspot');
    await createProxyTool(server, 'hubspot');
    await createConnectionManagerTools(server, 'hubspot');
    await createCreateTool(server, 'hubspot');
    await createUpdateTool(server, 'hubspot');
    const app = connectServer(server);
    return app;
}

let mcpApp: Promise<express.Application> | null = null;

try {
    mcpApp = main();
} catch (error: any) {
    console.error('Fatal error in trying to initialize MCP server: ', error);
    process.exit(1);
}

export { mcpApp };