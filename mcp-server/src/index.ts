import "./instrument";
import * as Sentry from "@sentry/node";
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { connectServer } from './session';
import { initialize } from './initialize';
import { 
  createWriteActionTool,
  createCheckConnectionTool,
  createCreateInstallationTool,
  createCheckInstallationTool,
  createStartOAuthTool,
  createSendRequestTool
} from '@amp-labs/ai/mcp';
import { z } from 'zod';
import { providerSchema, endpointSchema, installationIdSchema } from './schemas';
import express from 'express';

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

async function createSendReadRequestTool(
  server: Server,
  settings?: ClientSettings
): Promise<void> {
  // @ts-ignore
  server.tool(
    "send-read-request",
    `Call provider APIs via the Ampersand sendReadRequest tool`,
    {
      provider: providerSchema,
      endpoint: endpointSchema,
      headers: z
        .record(z.string(), z.string())
        .describe("Headers to send with the request"),
      installationId: installationIdSchema,
    },
    async ({
      endpoint,
      headers,
      installationId,
      provider,
    }: {
      endpoint: string;
      headers: Record<string, string>;
      installationId: string;
      provider: string;
    }) => {
      try {
        const fetchOptions: any = {
          method: "GET",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "x-amp-project-id": settings?.project || "",
            "x-api-key": settings?.apiKey || "",
            "x-amp-proxy-version": "1",
            "x-amp-installation-id": installationId,
          },
        };

        const response = await fetch(
          `https://proxy.withampersand.com/${endpoint}`,
          fetchOptions
        );

        const data = await response.text();
        return {
          content: [
            {
              type: "text",
              text: `SendReadRequest to ${provider} returned ${JSON.stringify(data)}`,
            },
            {
              type: "text",
              text: `Status: ${response.status}`,
            },
            {
              type: "text",
              text: `Response: ${JSON.stringify(data)}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error}`,
            },
          ],
        };
      }
    }
  );
}

async function main(): Promise<express.Application | undefined> {
    // @ts-ignore
    const server = initialize() as Server;
    // Hide search tool for now, since we will introduce a searchRecordsTool later
    // await createSearchTool(server);
    await createStartOAuthTool(server, clientSettings);
    await createSendRequestTool(server, clientSettings);
    await createSendReadRequestTool(server, clientSettings);
    await createCheckConnectionTool(server, clientSettings);
    await createCreateInstallationTool(server, clientSettings);
    await createCheckInstallationTool(server, clientSettings);
    await createWriteActionTool(server, "create", "create-record", clientSettings);
    await createWriteActionTool(server, "update", "update-record", clientSettings);
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