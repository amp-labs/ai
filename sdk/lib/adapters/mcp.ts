/**
 * This file contains Model Context Protocol (MCP) compatible tools for integrating with Ampersand.
 */

import "./ampersand/core/instrument";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import * as Sentry from "@sentry/node";
import { 
  providerSchema, 
  associationsSchema,
  executeAmpersandWrite,
  checkConnectionInputSchema,
  createInstallationInputSchema,
  checkInstallationInputSchema,
  oauthInputSchema,
  checkConnection,
  createInstallation,
  checkInstallation,
  ensureInstallationExists,
  checkConnectionToolDescription,
  createInstallationToolDescription,
  checkInstallationToolDescription,
  oauthToolDescription,
  CreateActionType,
  UpdateActionType,
  CheckConnectionInputType,
  CreateInstallationInputType,
  CheckInstallationInputType,
  OAuthInputType,
  sendRequestToolDescription,
  sendRequestInputSchema,
  SendRequestInputType,
  startOauthToolDescription,
  startOauthInputSchema,
  StartOauthInputType,
  StartOauthOutputType,
} from "./common";

type MCPResponse = {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
};

type ClientSettings = {
  project: string;
  integrationName: string;
  apiKey: string;
  groupRef: string;
};

/**
 * Creates a write action tool for the MCP server.
 * This is a factory function that creates either a create or update tool based on the type parameter.
 * 
 * @param server - The MCP server instance
 * @param type - The type of write action ("create" or "update")
 * @param name - The name of the tool
 * @returns A configured MCP tool for performing write operations
 */
export const createWriteActionTool = async (
  server: Server,
  type: "create" | "update",
  name: string,
  settings: ClientSettings
) => {
  // @ts-ignore
  return server.tool(
    name,
    `Perform a ${type} action on provider`,
    {
      provider: providerSchema,
      objectName: z.string().describe("The name of the object to write to"),
      type: z.enum([type]).describe("The type of write operation"),
      record: z.record(z.any()).describe("The record data to write"),
      groupRef: z
        .string()
        .describe("The group reference for the SaaS instance that should be written to"),
      associations: associationsSchema,
    },
    async (params: CreateActionType | UpdateActionType): Promise<MCPResponse> => {
      const { objectName, type, record, groupRef, associations } = params;
      const result = await executeAmpersandWrite({
        objectName,
        type,
        record,
        groupRef: settings.groupRef || groupRef,
        associations,
        apiKey: settings.apiKey || process.env.AMPERSAND_API_KEY || "",
        projectId: settings.project || process.env.AMPERSAND_PROJECT_ID || "",
        integrationName: settings.integrationName || process.env.AMPERSAND_INTEGRATION_NAME || "",
      });

      if (result.success) {
        console.log(`${type} operation on provider succeeded:`, result.response);
        return {
          content: [
            {
              type: "text",
              text: `Successfully performed ${type} operation on ${objectName}`,
            },
            {
              type: "text",
              text: `Record ID: ${result.recordId || "N/A"}`,
            },
            {
              type: "text",
              text: `Response: ${JSON.stringify(result.response)}`,
            },
          ],
        };
      } else {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error performing write operation: ${result.response}`,
            },
          ],
        };
      }
    }
  );
};

/**
 * Creates a connection checking tool for the MCP server.
 * 
 * @param server - The MCP server instance
 * @returns A configured MCP tool for checking provider connections
 */
export const createCheckConnectionTool = async (server: Server, settings: ClientSettings) => {
  // @ts-ignore
  return server.tool(
    "check-connection",
    checkConnectionToolDescription,
    checkConnectionInputSchema.shape,
    async (params: CheckConnectionInputType): Promise<MCPResponse> => {
      try {
        const res = await checkConnection({ ...params, apiKey: settings.apiKey || process.env.AMPERSAND_API_KEY || "", projectId: settings.project || process.env.AMPERSAND_PROJECT_ID || "" });
        if (res.found) {
          return {
            content: [
              {
                type: "text",
                text: `Connection found for ${params.provider} connectionId: ${res.connectionId}, groupRef: ${res.groupRef}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `No existing connections found for ${params.provider}`,
              },
            ],
          };
        }
      } catch (err) {
        Sentry.captureException(err);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error checking connection: ${err instanceof Error ? err.message : err}`,
            },
          ],
        };
      }
    }
  );
};

/**
 * Creates an installation creation tool for the MCP server.
 * 
 * @param server - The MCP server instance
 * @returns A configured MCP tool for creating provider installations
 */
export const createCreateInstallationTool = async (server: Server, settings: ClientSettings) => {
  // @ts-ignore
  return server.tool(
    "create-installation",
    createInstallationToolDescription,
    createInstallationInputSchema.shape,
    async (params: CreateInstallationInputType): Promise<MCPResponse> => {
      try {
        const res = await createInstallation({ ...params, apiKey: settings.apiKey || process.env.AMPERSAND_API_KEY || "", projectId: settings.project || process.env.AMPERSAND_PROJECT_ID || "" });
        return {
          content: [
            {
              type: "text",
              text: `Installation ${res.created ? "created" : "not created"} for ${params.provider}. ID: ${res.installationId}`,
            },
          ],
        };
      } catch (err) {
        Sentry.captureException(err);
        return {
          isError: true,
          content: [
            { type: "text", text: `Error creating installation: ${err instanceof Error ? err.message : err}` },
          ],
        };
      }
    }
  );
};

/**
 * Creates an installation checking tool for the MCP server.
 * 
 * @param server - The MCP server instance
 * @returns A configured MCP tool for checking provider installations
 */
export const createCheckInstallationTool = async (server: Server, settings: ClientSettings) => {
  // @ts-ignore
  return server.tool(
    "check-installation",
    checkInstallationToolDescription,
    checkInstallationInputSchema.shape,
    async (params: CheckInstallationInputType): Promise<MCPResponse> => {
      try {
        const res = await checkInstallation({ ...params, apiKey: settings.apiKey || process.env.AMPERSAND_API_KEY || "", projectId: settings.project || process.env.AMPERSAND_PROJECT_ID || "" });
        if (res.found) {
          return {
            content: [
              { type: "text", text: `Installation found for ${params.provider} ID: ${res.installationId}` },
            ],
          };
        }
        return { content: [ { type: "text", text: `No installation found for ${params.provider}` } ] };
      } catch (err) {
        Sentry.captureException(err);
        return { isError: true, content: [ { type: "text", text: `Error: ${err instanceof Error ? err.message : err}` } ] };
      }
    }
  );
};

/**
 * Creates an OAuth tool for the MCP server.
 * 
 * @param server - The MCP server instance
 * @returns A configured MCP tool for handling OAuth flows
 */
export const createStartOauthTool = async (server: Server, settings: ClientSettings) => {
  // @ts-ignore
  return server.tool(
    "start-oauth",
    startOauthToolDescription,
    startOauthInputSchema.shape,
    async (params: StartOauthInputType): Promise<MCPResponse> => {
      const { query, provider, groupRef, consumerRef } = params;
      const finalConsumerRef = consumerRef || (crypto as any).randomUUID?.() || Math.random().toString(36).substring(2, 15);
      const finalGroupRef = settings?.groupRef || groupRef || "";
      const projectId = settings?.project || process.env.AMPERSAND_PROJECT_ID || "";
      let url = "";
      try {
        const response = await fetch("https://api.withampersand.com/v1/oauth-connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, consumerRef: finalConsumerRef, groupRef: finalGroupRef, projectId }),
        });
        url = await response.text();
        return {
          content: [
            { type: "text", text: `OAuth URL generated for ${provider}: ${url}` },
          ],
        };
      } catch (err) {
        Sentry.captureException(err);
        return {
          isError: true,
          content: [
            { type: "text", text: `Error generating OAuth URL: ${err instanceof Error ? err.message : err}` },
          ],
        };
      }
    }
  );
};

/**
 * Creates a send request tool for the MCP server.
 * 
 * @param server - The MCP server instance
 * @returns A configured MCP tool for making API calls
 */
export const createSendRequestTool = async (server: Server, settings: ClientSettings) => {
  // @ts-ignore
  return server.tool(
    "send-request",
    sendRequestToolDescription,
    sendRequestInputSchema.shape,
    async (params: SendRequestInputType): Promise<MCPResponse> => {
      const { provider, body, endpoint, method, headers = {}, installationId } = params;
      try {
        const projectId = settings?.project || process.env.AMPERSAND_PROJECT_ID || "";
        const apiKey = settings?.apiKey || process.env.AMPERSAND_API_KEY || "";
        const integrationName = settings?.integrationName || process.env.AMPERSAND_INTEGRATION_NAME || "";
        const finalInstallationId = installationId ?? (await ensureInstallationExists(provider, apiKey, projectId, integrationName));

        const response = await fetch(`https://proxy.withampersand.com/${endpoint}`, {
          method,
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "x-amp-project-id": projectId,
            "x-api-key": apiKey,
            "x-amp-proxy-version": "1",
            "x-amp-installation-id": finalInstallationId,
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        const responseData = await response.json();
        return {
          content: [
            { type: "text", text: `API call successful. Status: ${response.status}` },
            { type: "text", text: `Response: ${JSON.stringify(responseData)}` },
          ],
        };
      } catch (err) {
        Sentry.captureException(err);
        return {
          isError: true,
          content: [
            { type: "text", text: `Error making API call: ${err instanceof Error ? err.message : err}` },
          ],
        };
      }
    }
  );
}; 