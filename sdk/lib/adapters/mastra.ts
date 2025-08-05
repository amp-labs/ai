/**
 * This file contains Mastra compatible tools for integrating with Ampersand.
 * Each tool is designed to work with the Mastra's tool system.
 */

import { createTool } from "@mastra/core";
import {
  createActionSchema,
  updateActionSchema,
  writeOutputSchema,
  executeAmpersandWrite,
  createRecordToolDescription,
  updateRecordToolDescription,
  checkConnectionInputSchema,
  checkConnectionOutputSchema,
  checkConnectionHelper,
  createInstallationInputSchema,
  createInstallationOutputSchema,
  checkInstallationInputSchema,
  checkInstallationOutputSchema,
  createInstallationHelper,
  checkInstallationHelper,
  checkConnectionToolDescription,
  createInstallationToolDescription,
  checkInstallationToolDescription,
  CreateActionType,
  UpdateActionType,
  WriteOutputType,
  CheckConnectionInputType,
  CheckConnectionOutputType,
  CreateInstallationInputType,
  CreateInstallationOutputType,
  CheckInstallationInputType,
  CheckInstallationOutputType,
  sendRequestToolDescription,
  sendRequestInputSchema,
  sendRequestOutputSchema,
  SendRequestInputType,
  SendRequestOutputType,
  sendReadRequestToolDescription,
  sendReadRequestInputSchema,
  startOAuthToolDescription,
  startOAuthInputSchema,
  startOAuthOutputSchema,
  getOAuthURL,
} from "./common";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { callAmpersandProxy } from "./ampersand/core/request";

/**
 * This file contains shared schemas and tools for integrating with Ampersand
 * from a Mastra-based project. These components can be reused across different
 * framework implementations.
 */

/**
 * Creates a new record in the Ampersand system using Mastra.
 * @remarks
 * Uses the common executeAmpersandWrite function to perform the operation.
 *
 * @param objectName - The name of the object to create
 * @param type - The type of operation (create)
 * @param record - The record data to write
 * @param groupRef - The group reference for the target SaaS instance
 * @param associations - Optional associations for the record
 * @returns Object containing status, recordId, and response from Ampersand
 */
export const createRecord = createTool({
  id: "create-record",
  description: createRecordToolDescription,
  inputSchema: createActionSchema,
  outputSchema: writeOutputSchema,
  execute: async ({
    context,
    runtimeContext,
  }: {
    context: CreateActionType;
    runtimeContext: RuntimeContext;
  }): Promise<WriteOutputType> => {
    const { objectName, type, record, groupRef, associations } = context;
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      groupRef:
        runtimeContext.get("AMPERSAND_GROUP_REF") ||
        process.env.AMPERSAND_GROUP_REF ||
        groupRef,
      associations,
      apiKey: runtimeContext.get("AMPERSAND_API_KEY"),
      projectId: runtimeContext.get("AMPERSAND_PROJECT_ID"),
      integrationName: runtimeContext.get("AMPERSAND_INTEGRATION_NAME"),
    });
    return {
      status: result.status,
      recordId: result.recordId,
      response: result.response,
    };
  },
});

/**
 * Updates an existing record in the Ampersand system using Mastra.
 * @remarks
 * Uses the common executeAmpersandWrite function to perform the operation.
 *
 * @param objectName - The name of the object to update
 * @param type - The type of operation (update)
 * @param record - The updated record data
 * @param groupRef - The group reference for the target SaaS instance
 * @param associations - Optional associations for the record
 * @returns Object containing status, recordId, and response from Ampersand
 */
export const updateRecord = createTool({
  id: "update-record",
  description: updateRecordToolDescription,
  inputSchema: updateActionSchema,
  outputSchema: writeOutputSchema,
  execute: async ({
    context,
    runtimeContext,
  }: {
    context: UpdateActionType;
    runtimeContext: RuntimeContext;
  }): Promise<WriteOutputType> => {
    const { objectName, type, record, groupRef, associations } = context;
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      groupRef:
        runtimeContext.get("AMPERSAND_GROUP_REF") ||
        process.env.AMPERSAND_GROUP_REF ||
        groupRef,
      associations,
      apiKey: runtimeContext.get("AMPERSAND_API_KEY"),
      projectId: runtimeContext.get("AMPERSAND_PROJECT_ID"),
      integrationName: runtimeContext.get("AMPERSAND_INTEGRATION_NAME"),
    });
    return {
      status: result.status,
      recordId: result.recordId,
      response: result.response,
    };
  },
});

/**
 * Checks if there is an active connection for a provider using Mastra.
 * @remarks
 * Uses the common checkConnection function to verify the connection status.
 *
 * @param provider - The provider to check connection for
 * @returns Connection status and details if found
 */
export const checkConnection = createTool({
  id: "check-connection",
  description: checkConnectionToolDescription,
  inputSchema: checkConnectionInputSchema,
  outputSchema: checkConnectionOutputSchema,
  execute: async ({
    context,
    runtimeContext,
  }: {
    context: CheckConnectionInputType;
    runtimeContext: RuntimeContext;
  }): Promise<CheckConnectionOutputType> => {
    const { provider } = context;
    const result = await checkConnectionHelper({
      provider,
      apiKey: runtimeContext.get("AMPERSAND_API_KEY"),
      projectId: runtimeContext.get("AMPERSAND_PROJECT_ID"),
    });
    return result;
  },
});

/**
 * Creates a new installation for a provider using Mastra.
 * @remarks
 * Uses the common createInstallation function to set up the installation.
 *
 * @param provider - The provider to create installation for
 * @param connectionId - The ID of the connection
 * @param groupRef - The group reference
 * @returns Installation creation status and details
 */
export const createInstallation = createTool({
  id: "create-installation",
  description: createInstallationToolDescription,
  inputSchema: createInstallationInputSchema,
  outputSchema: createInstallationOutputSchema,
  execute: async ({
    context,
    runtimeContext,
  }: {
    context: CreateInstallationInputType;
    runtimeContext: RuntimeContext;
  }): Promise<CreateInstallationOutputType> => {
    const { provider, connectionId, groupRef } = context;
    const res = await createInstallationHelper({
      provider,
      connectionId,
      groupRef:
        runtimeContext.get("AMPERSAND_GROUP_REF") ||
        process.env.AMPERSAND_GROUP_REF ||
        groupRef,
      apiKey: runtimeContext.get("AMPERSAND_API_KEY"),
      projectId: runtimeContext.get("AMPERSAND_PROJECT_ID"),
      integrationName: runtimeContext.get("AMPERSAND_INTEGRATION_NAME"),
    });
    return res;
  },
});

/**
 * Checks if there is an active installation for a provider using Mastra.
 * @remarks
 * Uses the common checkInstallation function to verify the installation status.
 *
 * @param provider - The provider to check installation for
 * @returns Installation status and details if found
 */
export const checkInstallation = createTool({
  id: "check-installation",
  description: checkInstallationToolDescription,
  inputSchema: checkInstallationInputSchema,
  outputSchema: checkInstallationOutputSchema,
  execute: async ({
    context,
    runtimeContext,
  }: {
    context: CheckInstallationInputType;
    runtimeContext: RuntimeContext;
  }): Promise<CheckInstallationOutputType> => {
    const { provider } = context;
    const res = await checkInstallationHelper({
      provider,
      apiKey: runtimeContext.get("AMPERSAND_API_KEY"),
      projectId: runtimeContext.get("AMPERSAND_PROJECT_ID"),
      integrationName: runtimeContext.get("AMPERSAND_INTEGRATION_NAME"),
    });
    return res;
  },
});

/**
 * Initiates OAuth flow for a provider using Mastra.
 * @remarks
 * Makes a direct API call to Ampersand's OAuth endpoint.
 *
 * @param provider - The provider to authenticate with
 * @param groupRef - Optional group reference
 * @param consumerRef - Optional consumer reference
 * @returns Object containing the OAuth URL for authentication
 */
export const startOAuth = createTool({
  id: "start-oauth",
  description: startOAuthToolDescription,
  inputSchema: startOAuthInputSchema,
  outputSchema: startOAuthOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    const { provider, groupRef, consumerRef } = context;
    const projectId = process.env.AMPERSAND_PROJECT_ID || "";
    const apiKey = process.env.AMPERSAND_API_KEY || "";
    const url = await getOAuthURL({
      provider,
      groupRef:
        runtimeContext.get("AMPERSAND_GROUP_REF") ||
        process.env.AMPERSAND_GROUP_REF ||
        groupRef,
      consumerRef,
      projectId,
      apiKey,
    });
    return { url };
  },
});

/**
 * Making authenticated API calls to providers using Mastra.
 * @remarks
 * Ensures installation exists before making the API call.
 *
 * @param provider - The provider to make the API call to
 * @param body - The request body
 * @param endpoint - The API endpoint
 * @param method - The HTTP method
 * @param headers - Optional additional headers
 * @param installationId - Optional installation ID
 * @returns Object containing status and response from the API call
 */
export const sendRequest = createTool({
  id: "send-request",
  description: sendRequestToolDescription,
  inputSchema: sendRequestInputSchema,
  outputSchema: sendRequestOutputSchema,
  execute: async ({
    context,
    runtimeContext,
  }: {
    context: SendRequestInputType;
    runtimeContext: RuntimeContext;
  }): Promise<SendRequestOutputType> => {
    const {
      provider,
      body,
      endpoint,
      method,
      headers = {},
      installationId,
    } = context;
    const apiKey =
      String(runtimeContext.get("AMPERSAND_API_KEY")) ||
      String(process.env.AMPERSAND_API_KEY) ||
      "";
    const projectId =
      String(runtimeContext.get("AMPERSAND_PROJECT_ID")) ||
      String(process.env.AMPERSAND_PROJECT_ID) ||
      "";
    const integrationName =
      String(runtimeContext.get("AMPERSAND_INTEGRATION_NAME")) ||
      String(process.env.AMPERSAND_INTEGRATION_NAME) ||
      "";
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
 * Making authenticated GET API calls to the providers using Mastra SDK.
 * @param provider - The provider to make the API call to
 * @param endpoint - The API endpoint
 * @param headers - Optional additional headers
 * @param installationId - Optional installation ID
 * @returns Object containing status and response from the API call
 */
export const sendReadRequest = createTool({
  id: "send-read-request",
  description: sendReadRequestToolDescription,
  inputSchema: sendReadRequestInputSchema,
  outputSchema: sendRequestOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    const { provider, endpoint, headers = {}, installationId } = context;
    const apiKey =
      (
        runtimeContext.get("AMPERSAND_API_KEY") ?? process.env.AMPERSAND_API_KEY
      )?.toString() || "";
    const projectId =
      (
        runtimeContext.get("AMPERSAND_PROJECT_ID") ??
        process.env.AMPERSAND_PROJECT_ID
      )?.toString() || "";
    const integrationName =
      (
        runtimeContext.get("AMPERSAND_INTEGRATION_NAME") ??
        process.env.AMPERSAND_INTEGRATION_NAME
      )?.toString() || "";
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
