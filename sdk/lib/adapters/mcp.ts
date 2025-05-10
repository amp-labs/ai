import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { 
  providerSchema, 
  associationsSchema,
  executeAmpersandWrite,
  checkConnectionInputSchema,
  createInstallationInputSchema,
  checkInstallationInputSchema,
  oauthInputSchema,
  proxyInputSchema,
  checkConnection,
  createInstallation,
  checkInstallation,
  ensureInstallationExists,
  checkConnectionToolDescription,
  createInstallationToolDescription,
  checkInstallationToolDescription,
  oauthToolDescription,
  proxyToolDescription,
} from "./common";

export const createWriteActionTool = async (
  server: Server,
  type: string,
  name: string
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
    async ({
      objectName,
      type,
      record,
      groupRef,
      associations,
    }: {
      objectName: string;
      type: "create" | "update";
      record: Record<string, any>;
      groupRef: string;
      associations?: Array<{
        to: { id: string };
        types: Array<{
          associationCategory: string;
          associationTypeId: number;
        }>;
      }>;
    }) => {
      const result = await executeAmpersandWrite({
        objectName,
        type,
        record,
        groupRef,
        associations,
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

export const createCheckConnectionTool = async (server: Server) => {
  // @ts-ignore
  return server.tool(
    "check-connection",
    checkConnectionToolDescription,
    checkConnectionInputSchema.shape,
    async ({ provider }: { provider: string }) => {
      try {
        const res = await checkConnection({ provider });
        if (res.found) {
          return {
            content: [
              {
                type: "text",
                text: `Connection found for ${provider} connectionId: ${res.connectionId}, groupRef: ${res.groupRef}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `No existing connections found for ${provider}`,
              },
            ],
          };
        }
      } catch (err) {
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

export const createCreateInstallationTool = async (server: Server) => {
  // @ts-ignore
  return server.tool(
    "create-installation",
    createInstallationToolDescription,
    createInstallationInputSchema.shape,
    async ({ provider, connectionId, groupRef }: { provider: string; connectionId: string; groupRef: string }) => {
      try {
        const res = await createInstallation({ provider, connectionId, groupRef });
        return {
          content: [
            {
              type: "text",
              text: `Installation ${res.created ? "created" : "not created"} for ${provider}. ID: ${res.installationId}`,
            },
          ],
        };
      } catch (err) {
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

export const createCheckInstallationTool = async (server: Server) => {
  // @ts-ignore
  return server.tool(
    "check-installation",
    checkInstallationToolDescription,
    checkInstallationInputSchema.shape,
    async ({ provider }: { provider: string }) => {
      try {
        const res = await checkInstallation({ provider });
        if (res.found) {
          return {
            content: [
              { type: "text", text: `Installation found for ${provider} ID: ${res.installationId}` },
            ],
          };
        }
        return { content: [ { type: "text", text: `No installation found for ${provider}` } ] };
      } catch (err) {
        return { isError: true, content: [ { type: "text", text: `Error: ${err instanceof Error ? err.message : err}` } ] };
      }
    }
  );
};

export const createOAuthTool = async (server: Server) => {
  // @ts-ignore
  return server.tool(
    "oauth",
    oauthToolDescription,
    oauthInputSchema.shape,
    async ({ query, provider, groupRef, consumerRef }: { query: string; provider: string; groupRef?: string; consumerRef?: string }) => {
      const finalConsumerRef = consumerRef || (crypto as any).randomUUID?.() || Math.random().toString(36).substring(2, 15);
      const finalGroupRef = groupRef || process.env.AMPERSAND_GROUP_REF || "";
      const projectId = process.env.AMPERSAND_PROJECT_ID || "";
      let url = "";
      try {
        const response = await fetch("https://api.withampersand.com/v1/oauth-connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, consumerRef: finalConsumerRef, groupRef: finalGroupRef, projectId }),
        });
        url = await response.text();
      } catch (err) {
        return { isError: true, content: [ { type: "text", text: `Error initiating OAuth: ${err instanceof Error ? err.message : err}` } ] };
      }
      return { content: [ { type: "text", text: url } ] };
    }
  );
};

export const createProxyTool = async (server: Server) => {
  // @ts-ignore
  return server.tool(
    "call-api",
    proxyToolDescription,
    proxyInputSchema.shape,
    async ({ provider, body, suffix, method, headers = {}, installationId }: any) => {
      try {
        const finalInstallationId = installationId || (await ensureInstallationExists(provider));
        const projectId = process.env.AMPERSAND_PROJECT_ID || "";
        const apiKey = process.env.AMPERSAND_API_KEY || "";
        const response = await fetch(`https://proxy.withampersand.com/${suffix}`, {
          method,
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "x-amp-project-id": projectId,
            "x-api-key": apiKey,
            "x-amp-proxy-version": "1",
            "x-amp-installation-id": finalInstallationId,
          },
          body: body && Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
        });
        const data = await response.text();
        return { content: [ { type: "text", text: `Status ${response.status}: ${data}` } ] };
      } catch (err) {
        return { isError: true, content: [ { type: "text", text: `Error in proxy call: ${err instanceof Error ? err.message : err}` } ] };
      }
    }
  );
}; 