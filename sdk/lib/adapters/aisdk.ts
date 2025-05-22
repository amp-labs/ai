/**
 * This file contains Vercel AI SDK compatible tools for integrating with Ampersand.
 * Each tool is designed to work with the Vercel AI SDK's tool system.
 */

import "./ampersand/core/instrument";
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
  CheckConnectionInputType,
  CheckConnectionOutputType,
  CreateInstallationInputType,
  CreateInstallationOutputType,
  CheckInstallationInputType,
  CheckInstallationOutputType,
  OAuthInputType,
  OAuthOutputType,
  ProxyInputType,
  ProxyOutputType,
  WriteOutputType
} from "./common";

/**
 * Creates a new record in the Ampersand system using Vercel AI SDK.
 * @remarks
 * Requires the 'ai' package to be installed via npm.
 * 
 * @param provider - The provider to create the record in
 * @param objectName - The name of the object to create
 * @param type - The type of operation (create)
 * @param record - The record data to write
 * @param groupRef - The group reference for the target SaaS instance
 * @param associations - Optional associations for the record
 * @returns Object containing status, recordId, and response from Ampersand
 */
export const createRecordTool = tool({
  description: createRecordToolDescription,
  parameters: createActionSchema,
  execute: async ({ provider, objectName, type, record, groupRef, associations }: CreateParams) => {
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      groupRef: process.env.AMPERSAND_GROUP_REF || groupRef,
      associations,
    });
    return {
      status: result.status,
      recordId: result.recordId,
      response: result.response,
    };
  },
});

/**
 * Updates an existing record in the Ampersand system using Vercel AI SDK.
 * @remarks
 * 
 * @param provider - The provider to update the record in
 * @param objectName - The name of the object to update
 * @param type - The type of operation (update)
 * @param record - The updated record data
 * @param groupRef - The group reference for the target SaaS instance
 * @param associations - Optional associations for the record
 * @returns Object containing status, recordId, and response from Ampersand
 */
export const updateRecordTool = tool({
  description: updateRecordToolDescription,
  parameters: updateActionSchema,
  execute: async ({ provider, objectName, type, record, groupRef, associations }: UpdateParams) => {
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      groupRef: process.env.AMPERSAND_GROUP_REF || groupRef,
      associations,
    });
    return {
      status: result.status,
      recordId: result.recordId,
      response: result.response,
    };
  },
});

/**
 * Checks if there is an active connection for a provider using Vercel AI SDK.
 * @param provider - The provider to check connection for
 * @returns Connection status and details if found
 */
export const checkConnectionTool = tool({
  description: checkConnectionToolDescription,
  parameters: checkConnectionInputSchema,
  execute: async (params: CheckConnectionInputType): Promise<CheckConnectionOutputType> => {
    const { provider } = params;
    const res = await checkConnection({ provider });
    return res;
  },
});

/**
 * Creates a new installation for a provider using Vercel AI SDK.
 * @param provider - The provider to create installation for
 * @param connectionId - The ID of the connection
 * @param groupRef - The group reference
 * @returns Installation creation status and details
 */
export const createInstallationTool = tool({
  description: createInstallationToolDescription,
  parameters: createInstallationInputSchema,
  execute: async (params: CreateInstallationInputType): Promise<CreateInstallationOutputType> => {
    const { provider, connectionId, groupRef } = params;
    const res = await createInstallation({ provider, connectionId, groupRef: process.env.AMPERSAND_GROUP_REF || groupRef });
    return res;
  },
});

/**
 * Checks if there is an active installation for a provider using Vercel AI SDK.
 * @param provider - The provider to check installation for
 * @returns Installation status and details if found
 */
export const checkInstallationTool = tool({
  description: checkInstallationToolDescription,
  parameters: checkInstallationInputSchema,
  execute: async (params: CheckInstallationInputType): Promise<CheckInstallationOutputType> => {
    const { provider } = params;
    const res = await checkInstallation({ provider });
    return res;
  },
});

/**
 * Initiates OAuth flow for a provider using Vercel AI SDK.
 * @param provider - The provider to authenticate with
 * @param query - The search query
 * @param groupRef - Optional group reference
 * @param consumerRef - Optional consumer reference
 * @returns Object containing the OAuth URL for authentication
 */
export const oauthTool = tool({
  description: oauthToolDescription,
  parameters: oauthInputSchema,
  execute: async (params: OAuthInputType): Promise<OAuthOutputType> => {
    const { provider, query, groupRef, consumerRef } = params;
    const projectId = process.env.AMPERSAND_PROJECT_ID || "";
    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        consumerRef,
        groupRef: process.env.AMPERSAND_GROUP_REF || groupRef,
        projectId,
      }),
    };

    const response = await fetch("https://api.withampersand.com/v1/oauth-connect", options);
    const url = await response.text();
    return { url };
  },
});

/**
 * Makes proxy API calls to Ampersand services using Vercel AI SDK.
 * @param provider - The provider to make the API call to
 * @param body - The request body
 * @param suffix - The API endpoint suffix
 * @param method - The HTTP method
 * @param headers - Optional additional headers
 * @param installationId - Optional installation ID
 * @returns Object containing status and response from the API call
 */
export const proxyTool = tool({
  description: proxyToolDescription,
  parameters: proxyInputSchema,
  execute: async (params: ProxyInputType): Promise<ProxyOutputType> => {
    const { provider, body, suffix, method, headers = {}, installationId } = params;
    const projectId = process.env.AMPERSAND_PROJECT_ID || "";
    const apiKey = process.env.AMPERSAND_API_KEY || "";
    const integrationName = process.env.AMPERSAND_INTEGRATION_NAME || "";
    const finalInstallationId = installationId ?? (await ensureInstallationExists(provider, apiKey, projectId, integrationName));

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
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json();
    return {
      status: response.status,
      response: responseData,
    };
  },
});

