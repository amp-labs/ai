import "./instrument";
import * as Sentry from "@sentry/node";
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { connectServer } from './session';
import { initialize } from './initialize';
import { createSendRequestTool, createSendReadRequestTool } from './request';
import { createStartOAuthTool } from './oauth';
import { createCreateTool, createUpdateTool } from './write';
import express from 'express';
import { createConnectionManagerTools } from './connection';

const args = process.argv.slice(2);
const useStdioTransport = args.includes('--transport') && args[args.indexOf('--transport') + 1] === 'stdio';
const project = args.includes('--project') ? args[args.indexOf('--project') + 1] : process.env.AMPERSAND_PROJECT_ID || "";
const integrationName = args.includes('--integrationName') ? args[args.indexOf('--integrationName') + 1] : process.env.AMPERSAND_INTEGRATION_NAME || "";
const groupRef = args.includes('--groupRef') ? args[args.indexOf('--groupRef') + 1] : process.env.AMPERSAND_GROUP_REF || "";

export const clientSettings = {
    project: project,
    integrationName: integrationName,
    apiKey: process.env.AMPERSAND_API_KEY || "",
    groupRef: groupRef
}


export type ClientSettings = typeof clientSettings;

async function main(): Promise<express.Application | undefined> {
    // @ts-ignore
    const server = initialize() as Server;
    // Hide search tool for now, since we will introduce a searchRecordsTool later
    // await createSearchTool(server);
    await createStartOAuthTool(server, clientSettings);
    await createSendRequestTool(server, clientSettings);
    await createSendReadRequestTool(server, clientSettings);
    await createConnectionManagerTools(server, clientSettings);
    await createCreateTool(server, clientSettings);
    await createUpdateTool(server, clientSettings);
    const app = await connectServer(server, useStdioTransport, clientSettings);
    return app;
}

let mcpApp: Promise<express.Application | undefined> | null = null;

try {
    mcpApp = main();
} catch (error: any) {
    console.error('Fatal error in trying to initialize MCP server: ', error);
    Sentry.captureException(error);
    process.exit(1);
}

export { mcpApp };