/**
 * This file contains Vercel AI SDK compatible tools for integrating with Ampersand.
 * Each tool is designed to work with the Vercel AI SDK's tool system.
 */

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
  checkConnection,
  createInstallation,
  checkInstallation,
  ensureInstallationExists,
  checkConnectionToolDescription,
  createInstallationToolDescription,
  checkInstallationToolDescription,
  CheckConnectionInputType,
  CheckConnectionOutputType,
  CreateInstallationInputType,
  CreateInstallationOutputType,
  CheckInstallationInputType,
  CheckInstallationOutputType,
  WriteOutputType,
  sendRequestToolDescription,
  sendRequestInputSchema,
  sendRequestOutputSchema,
  SendRequestInputType,
  SendRequestOutputType,
  sendReadRequestToolDescription,
  sendReadRequestInputSchema,
  SendReadRequestInputType,
  startOAuthToolDescription,
  startOAuthInputSchema,
  StartOAuthInputType,
  StartOAuthOutputType,
  getOAuthURL,
} from "./common";
import { z } from "zod";
import { callAmpersandProxy } from "./ampersand/core/request";

/**
 * Creates a new record in the Ampersand system using Vercel AI SDK.
 * @remarks
 * Requires the 'ai' package to be installed via npm.
 * 
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
  execute: async ({ objectName, type, record, groupRef, associations }: CreateParams) => {
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
  execute: async ({ objectName, type, record, groupRef, associations }: UpdateParams) => {
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
 * @param groupRef - Optional group reference
 * @param consumerRef - Optional consumer reference
 * @returns Object containing the OAuth URL for authentication
 */
export const startOAuthTool = tool({
  description: startOAuthToolDescription,
  parameters: startOAuthInputSchema,
  execute: async (params: StartOAuthInputType): Promise<StartOAuthOutputType> => {
    const { provider, groupRef, consumerRef } = params;
    const projectId = process.env.AMPERSAND_PROJECT_ID || "";
    const apiKey = process.env.AMPERSAND_API_KEY || "";
    const url = await getOAuthURL({ provider, groupRef: process.env.AMPERSAND_GROUP_REF || groupRef, consumerRef, projectId, apiKey });
    return { url };
  },
});

/**
 * Making authenticated API calls to the providers using Vercel AI SDK.
 * @param provider - The provider to make the API call to
 * @param body - The request body
 * @param endpoint - The API endpoint
 * @param method - The HTTP method
 * @param headers - Optional additional headers
 * @param installationId - Optional installation ID
 * @returns Object containing status and response from the API call
 */
export const sendRequestTool = tool({
  description: sendRequestToolDescription,
  parameters: sendRequestInputSchema,
  execute: async (params: SendRequestInputType): Promise<SendRequestOutputType> => {
    const { provider, body, endpoint, method, headers = {}, installationId } = params;
    const projectId = process.env.AMPERSAND_PROJECT_ID || "";
    const apiKey = process.env.AMPERSAND_API_KEY || "";
    const integrationName = process.env.AMPERSAND_INTEGRATION_NAME || "";
    return callAmpersandProxy({
      provider,
      endpoint,
      method,
      headers,
      installationId,
      apiKey,
      projectId,
      integrationName,
      body,
    });
  },
});

/**
 * Making authenticated GET API calls to the providers using Vercel AI SDK.
 * @param provider - The provider to make the API call to
 * @param endpoint - The API endpoint
 * @param headers - Optional additional headers
 * @param installationId - Optional installation ID
 * @returns Object containing status and response from the API call
 */
export const sendReadRequestTool = tool({
  description: sendReadRequestToolDescription,
  parameters: sendReadRequestInputSchema,
  execute: async (params: SendReadRequestInputType): Promise<SendRequestOutputType> => {
    const { provider, endpoint, headers = {}, installationId } = params;
    const projectId = process.env.AMPERSAND_PROJECT_ID || "";
    const apiKey = process.env.AMPERSAND_API_KEY || "";
    const integrationName = process.env.AMPERSAND_INTEGRATION_NAME || "";
    return callAmpersandProxy({
      provider,
      endpoint,
      method: "GET",
      headers,
      installationId,
      apiKey,
      projectId,
      integrationName,
    });
  },
});
