import { createTool } from "@mastra/core";
import {
  associationsSchema,
  providerSchema,
  createActionSchema,
  updateActionSchema,
  writeOutputSchema,
  executeAmpersandWrite,
  createRecordToolDescription,
  updateRecordToolDescription,
  checkConnectionInputSchema,
  checkConnectionOutputSchema,
  checkConnection,
  createInstallationInputSchema,
  createInstallationOutputSchema,
  checkInstallationInputSchema,
  checkInstallationOutputSchema,
  oauthInputSchema,
  oauthOutputSchema,
  proxyInputSchema,
  proxyOutputSchema,
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
 * This file contains shared schemas and tools for integrating with Ampersand
 * from a Mastra-based project. These components can be reused across different
 * framework implementations.
 */

// Example implementation for mastra's createActionTool
export const createRecordTool = createTool({
  id: "create-record",
  description: createRecordToolDescription,
  inputSchema: createActionSchema,
  outputSchema: writeOutputSchema,
  execute: async ({ context }) => {
    const { provider, objectName, type, record, groupRef, associations } = context;
    
    // Use the common function from mcp-server
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      groupRef,
      associations,
    });
    
    // Return in the format expected by mastra
    return {
      status: result.status,
      recordId: result.recordId,
      response: result.response,
    };
  },
});

// Example implementation for mastra's updateActionTool 
export const updateRecordTool = createTool({
  id: "update-record",
  description: updateRecordToolDescription,
  inputSchema: updateActionSchema,
  outputSchema: writeOutputSchema,
  execute: async ({ context }) => {
    const { provider, objectName, type, record, groupRef, associations } = context;
    
    // Use the common function from mcp-server
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      groupRef,
      associations,
    });
    
    // Return in the format expected by mastra
    return {
      status: result.status,
      recordId: result.recordId,
      response: result.response,
    };
  },
});

// New: Check Connection Tool
export const checkConnectionTool = createTool({
  id: "check-connection",
  description: checkConnectionToolDescription,
  inputSchema: checkConnectionInputSchema,
  outputSchema: checkConnectionOutputSchema,
  execute: async ({ context }) => {
    const { provider } = context;

    const result = await checkConnection({ provider });

    return result;
  },
});

// Create Installation Tool
export const createInstallationTool = createTool({
  id: "create-installation",
  description: createInstallationToolDescription,
  inputSchema: createInstallationInputSchema,
  outputSchema: createInstallationOutputSchema,
  execute: async ({ context }) => {
    const { provider, connectionId, groupRef } = context;

    const res = await createInstallation({ provider, connectionId, groupRef });
    return res;
  },
});

// Check Installation Tool
export const checkInstallationTool = createTool({
  id: "check-installation",
  description: checkInstallationToolDescription,
  inputSchema: checkInstallationInputSchema,
  outputSchema: checkInstallationOutputSchema,
  execute: async ({ context }) => {
    const { provider } = context;
    const res = await checkInstallation({ provider });
    return res;
  },
});

// OAuth Tool – returns OAuth connection URL
export const oauthTool = createTool({
  id: "oauth",
  description: oauthToolDescription,
  inputSchema: oauthInputSchema,
  outputSchema: oauthOutputSchema,
  execute: async ({ context }) => {
    const { provider, query, groupRef, consumerRef } = context;
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

    let url = "";
    try {
      const response = await fetch("https://api.withampersand.com/v1/oauth-connect", options);
      url = await response.text();
    } catch (err) {
      console.error("[Ampersand] OAuth error", err);
      throw err;
    }

    return { url };
  },
});

// Proxy Call Tool
export const proxyTool = createTool({
  id: "call-api",
  description: proxyToolDescription,
  inputSchema: proxyInputSchema,
  outputSchema: proxyOutputSchema,
  execute: async ({ context }) => {
    const { provider, body, suffix, method, headers = {}, installationId } = context;

    // Ensure we have an installation
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

    return {
      status: response.status,
      response: data,
    };
  },
}); 

