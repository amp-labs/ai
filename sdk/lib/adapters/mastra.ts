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
  checkConnection,
  createInstallationInputSchema,
  createInstallationOutputSchema,
  checkInstallationInputSchema,
  checkInstallationOutputSchema,
  oauthInputSchema,
  oauthOutputSchema,
  createInstallation,
  checkInstallation,
  ensureInstallationExists,
  checkConnectionToolDescription,
  createInstallationToolDescription,
  checkInstallationToolDescription,
  oauthToolDescription,
  CreateActionType,
  UpdateActionType,
  WriteOutputType,
  CheckConnectionInputType,
  CheckConnectionOutputType,
  CreateInstallationInputType,
  CreateInstallationOutputType,
  CheckInstallationInputType,
  CheckInstallationOutputType,
  OAuthInputType,
  OAuthOutputType,
  sendRequestToolDescription,
  sendRequestInputSchema,
  sendRequestOutputSchema,
  SendRequestInputType,
  SendRequestOutputType,
  sendReadRequestToolDescription,
  sendReadRequestInputSchema,
} from "./common";
import { RuntimeContext } from "@mastra/core/runtime-context";

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
 * @param provider - The provider to create the record in
 * @param objectName - The name of the object to create
 * @param type - The type of operation (create)
 * @param record - The record data to write
 * @param groupRef - The group reference for the target SaaS instance
 * @param associations - Optional associations for the record
 * @returns Object containing status, recordId, and response from Ampersand
 */
export const createRecordTool = createTool({
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
    const { provider, objectName, type, record, groupRef, associations } =
      context;
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
 * @param provider - The provider to update the record in
 * @param objectName - The name of the object to update
 * @param type - The type of operation (update)
 * @param record - The updated record data
 * @param groupRef - The group reference for the target SaaS instance
 * @param associations - Optional associations for the record
 * @returns Object containing status, recordId, and response from Ampersand
 */
export const updateRecordTool = createTool({
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
    const { provider, objectName, type, record, groupRef, associations } =
      context;
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
export const checkConnectionTool = createTool({
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
    const result = await checkConnection({
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
export const createInstallationTool = createTool({
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
    const res = await createInstallation({
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
export const checkInstallationTool = createTool({
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
    const res = await checkInstallation({
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
 * @param query - The search query
 * @param groupRef - Optional group reference
 * @param consumerRef - Optional consumer reference
 * @returns Object containing the OAuth URL for authentication
 */
export const oauthTool = createTool({
  id: "oauth",
  description: oauthToolDescription,
  inputSchema: oauthInputSchema,
  outputSchema: oauthOutputSchema,
  execute: async ({
    context,
    runtimeContext,
  }: {
    context: OAuthInputType;
    runtimeContext: RuntimeContext;
  }): Promise<OAuthOutputType> => {
    const { provider, query, groupRef, consumerRef } = context;
    const projectId = process.env.AMPERSAND_PROJECT_ID || "";

    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        consumerRef,
        groupRef:
          runtimeContext.get("AMPERSAND_GROUP_REF") ||
          process.env.AMPERSAND_GROUP_REF ||
          groupRef,
        projectId,
      }),
    };

    let url = "";
    try {
      const response = await fetch(
        "https://api.withampersand.com/v1/oauth-connect",
        options
      );
      url = await response.text();
    } catch (err) {
      console.error("[Ampersand] OAuth error", err);
      throw err;
    }

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
 * @param suffix - The API endpoint suffix
 * @param method - The HTTP method
 * @param headers - Optional additional headers
 * @param installationId - Optional installation ID
 * @returns Object containing status and response from the API call
 */
export const sendRequestTool = createTool({
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
      suffix,
      method,
      headers = {},
      installationId,
    } = context;
    const apiKey = String(runtimeContext.get("AMPERSAND_API_KEY")) || String(process.env.AMPERSAND_API_KEY) || "";
    const projectId = String(runtimeContext.get("AMPERSAND_PROJECT_ID")) || String(process.env.AMPERSAND_PROJECT_ID) || "";
    const integrationName = String(runtimeContext.get("AMPERSAND_INTEGRATION_NAME")) || String(process.env.AMPERSAND_INTEGRATION_NAME) || "";
    const finalInstallationId =
      installationId ??
      (await ensureInstallationExists(
        provider,
        apiKey,
        projectId,
        integrationName
      ));

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

export const sendReadRequestTool = createTool({
  id: "send-read-request",
  description: sendReadRequestToolDescription,
  inputSchema: sendReadRequestInputSchema,
  outputSchema: sendRequestOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    const { provider, suffix, headers = {}, installationId } = context;
    const apiKey = String(runtimeContext.get("AMPERSAND_API_KEY")) || String(process.env.AMPERSAND_API_KEY) || "";
    const projectId = String(runtimeContext.get("AMPERSAND_PROJECT_ID")) || String(process.env.AMPERSAND_PROJECT_ID) || "";
    const integrationName = String(runtimeContext.get("AMPERSAND_INTEGRATION_NAME")) || String(process.env.AMPERSAND_INTEGRATION_NAME) || "";
    const finalInstallationId =
      installationId ??
      (await ensureInstallationExists(
        provider,
        apiKey,
        projectId,
        integrationName
      ));

    const response = await fetch(`https://proxy.withampersand.com/${suffix}`, {
      method: "GET",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "x-amp-project-id": projectId,
        "x-api-key": apiKey,
        "x-amp-proxy-version": "1",
        "x-amp-installation-id": finalInstallationId,
      },
    });

    const responseData = await response.json();
    return {
      status: response.status,
      response: responseData,
    };
  },
});
