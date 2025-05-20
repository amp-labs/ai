import { SDKNodePlatform } from "@amp-labs/sdk-node-platform";
import { checkConnection } from "./connection";

interface CheckInstallationParams {
  provider: string;
  apiKey?: string;
  projectId?: string;
  integrationIdOrName?: string;
}

export interface CheckInstallationResult {
  found: boolean;
  installationId?: string;
  data?: any;
}

interface CreateInstallationParams {
  provider: string;
  connectionId: string;
  groupRef: string;
  apiKey?: string;
  projectId?: string;
  integrationIdOrName?: string;
}

export interface CreateInstallationResult {
  created: boolean;
  installationId?: string;
  data?: any;
}

/**
 * List/installations for provider and determine if one already exists.
 */
export async function checkInstallation({
  provider,
  apiKey = process.env.AMPERSAND_API_KEY || "",
  projectId = process.env.AMPERSAND_PROJECT_ID || "",
  integrationIdOrName = process.env.AMPERSAND_INTEGRATION_ID_OR_NAME || "",
}: CheckInstallationParams): Promise<CheckInstallationResult> {
  try {
    const client = new SDKNodePlatform({
      apiKeyHeader: apiKey,
    });

    const installations = await client.installations.list({
      projectIdOrName: projectId,
      integrationId: integrationIdOrName,
    });

    // @ts-ignore – Filter by provider (Ampersand lower-cases internally)
    const filtered = installations.filter((inst: any) => inst.connection?.provider === provider.toLowerCase());

    if (filtered.length > 0) {
      const installation = filtered[0];
      return { found: true, installationId: installation.id, data: installation };
    }

    return { found: false };
  } catch (error) {
    console.error("[Ampersand] Error while checking installation:", error);
    throw error;
  }
}

/**
 * Create a new installation tied to an existing connection.
 */
export async function createInstallation({
  provider,
  connectionId,
  groupRef,
  apiKey = process.env.AMPERSAND_API_KEY || "",
  projectId = process.env.AMPERSAND_PROJECT_ID || "",
  integrationIdOrName = process.env.AMPERSAND_INTEGRATION_ID_OR_NAME || "",
}: CreateInstallationParams): Promise<CreateInstallationResult> {
  try {
    const client = new SDKNodePlatform({
      apiKeyHeader: apiKey,
    });

    const data = await client.installations.create({
      projectIdOrName: projectId,
      integrationId: integrationIdOrName,
      requestBody: {
        connectionId,
        groupRef,
        config: {
          createdBy: "sdk:create-installation",
          content: {
            provider,
            proxy: { enabled: true },
          },
        },
      },
    });

    // @ts-ignore – vary depending on SDK version
    const installationId = data.installation?.id ?? data.id;
    return { created: !!installationId, installationId, data };
  } catch (error) {
    console.error("[Ampersand] Error while creating installation:", error);
    throw error;
  }
}

/**
 * Ensure an installation exists, creating one if necessary. Returns the installationId.
 */
export async function ensureInstallationExists(provider: string): Promise<string> {
  // First, verify a connection exists and grab its identifiers
  const connection = await checkConnection({ provider });
  if (!connection.found || !connection.connectionId || !connection.groupRef) {
    throw new Error(`No existing connections found for ${provider}. Please connect using OAuth.`);
  }

  // Check existing installation list
  const installation = await checkInstallation({ provider });
  if (installation.found && installation.installationId) {
    return installation.installationId;
  }

  // Otherwise create installation
  const createRes = await createInstallation({
    provider,
    connectionId: connection.connectionId,
    groupRef: connection.groupRef,
  });

  if (!createRes.created || !createRes.installationId) {
    throw new Error(`Failed to create installation for ${provider}.`);
  }

  return createRes.installationId;
} 