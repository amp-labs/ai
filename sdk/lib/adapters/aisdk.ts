import { tool } from "ai";
import { 
  createActionSchema, 
  updateActionSchema,
  executeAmpersandWrite,
  CreateParams,
  UpdateParams,
  createRecordToolDescription,
  updateRecordToolDescription,
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

/**
 * Vercel AI SDK compatible version of the Ampersand create record tool
 * 
 * Note: You'll need to install the 'ai' package:
 * npm install ai
 */
export const createRecordTool = tool({
  description: createRecordToolDescription,
  parameters: createActionSchema,
  execute: async ({ provider, objectName, type, record, groupRef, associations }: CreateParams) => {
    
    // Use the common function from mcp-server
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      groupRef,
      associations,
    });
    
    // Return the results (AI SDK doesn't require a specific format)
    return {
      status: result.status,
      recordId: result.recordId,
      response: result.response,
    };
  },
});

/**
 * Vercel AI SDK compatible version of the Ampersand update record tool
 * 
 * Note: You'll need to install the 'ai' package:
 * npm install ai
 */
export const updateRecordTool = tool({
  description: updateRecordToolDescription,
  parameters: updateActionSchema,
  execute: async ({ provider, objectName, type, record, groupRef, associations }: UpdateParams) => {
    
    // Use the common function from mcp-server
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      groupRef: groupRef,
      associations,
    });
    
    // Return the results
    return {
      status: result.status,
      recordId: result.recordId,
      response: result.response,
    };
  },
});

// Check Connection Tool
export const checkConnectionTool = tool({
  description: checkConnectionToolDescription,
  parameters: checkConnectionInputSchema,
  execute: async ({ provider }: { provider: string }) => {
    const res = await checkConnection({ provider });
    return res;
  },
});

// Create Installation Tool
export const createInstallationTool = tool({
  description: createInstallationToolDescription,
  parameters: createInstallationInputSchema,
  execute: async ({ provider, connectionId, groupRef }: { provider: string; connectionId: string; groupRef: string }) => {
    const res = await createInstallation({ provider, connectionId, groupRef });
    return res;
  },
});

// Check Installation Tool
export const checkInstallationTool = tool({
  description: checkInstallationToolDescription,
  parameters: checkInstallationInputSchema,
  execute: async ({ provider }: { provider: string }) => {
    const res = await checkInstallation({ provider });
    return res;
  },
});

// OAuth Tool – returns a URL string
export const oauthTool = tool({
  description: oauthToolDescription,
  parameters: oauthInputSchema,
  execute: async ({ provider, query }: { provider: string; query: string }) => {
    const _query = query; // currently unused but accepted by schema
    const consumerRef = (globalThis as any).crypto?.randomUUID?.() ?? Math.random().toString(36).substring(2, 15);
    const groupRef = process.env.AMPERSAND_GROUP_REF || "";
    const projectId = process.env.AMPERSAND_PROJECT_ID || "";

    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        consumerRef,
        groupRef,
        projectId,
      }),
    };

    const response = await fetch("https://api.withampersand.com/v1/oauth-connect", options);
    const url = await response.text();
    return { url };
  },
});

// Proxy Call Tool
export const proxyTool = tool({
  description: proxyToolDescription,
  parameters: proxyInputSchema,
  execute: async ({ provider, body, suffix, method, headers = {}, installationId }: any) => {
    const finalInstallationId = installationId ?? (await ensureInstallationExists(provider));

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
    return { status: response.status, response: data };
  },
});

