import { SDKNodePlatform } from "@amp-labs/sdk-node-platform";
import { checkConnection } from "./connection";
import { AmpersandConfig, amp } from "../../../config";

interface CheckInstallationParams {
  provider: string;
  config?: Partial<AmpersandConfig>;
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
  config?: Partial<AmpersandConfig>;
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
  config: configOverride,
}: CheckInstallationParams): Promise<CheckInstallationResult> {
  try {
    const config = configOverride ? amp.init(configOverride) : amp.get();

    const client = new SDKNodePlatform({
      apiKeyHeader: config.apiKey,
    });

    const installations = await client.installations.list({
      projectIdOrName: config.projectId,
      integrationId: config.integrationName,
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
  config: configOverride,
}: CreateInstallationParams): Promise<CreateInstallationResult> {
  try {
    const config = configOverride ? amp.init(configOverride) : amp.get();

    const client = new SDKNodePlatform({
      apiKeyHeader: config.apiKey,
    });

    const data = await client.installations.create({
      projectIdOrName: config.projectId,
      integrationId: config.integrationName,
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
export async function ensureInstallationExists(
  provider: string,
  config?: Partial<AmpersandConfig>
): Promise<string> {
  const finalConfig = config ? amp.init(config) : amp.get();

  // First, verify a connection exists and grab its identifiers
  const connection = await checkConnection({ provider, config: finalConfig });
  if (!connection.found || !connection.connectionId || !connection.groupRef) {
    throw new Error(`No existing connections found for ${provider}. Please connect using OAuth.`);
  }

  // Check existing installation list
  const installation = await checkInstallation({ provider, config: finalConfig });
  if (installation.found && installation.installationId) {
    return installation.installationId;
  }

  // Otherwise create installation
  const createRes = await createInstallation({
    provider,
    connectionId: connection.connectionId,
    groupRef: connection.groupRef,
    config: finalConfig,
  });

  if (!createRes.created || !createRes.installationId) {
    throw new Error(`Failed to create installation for ${provider}.`);
  }

  return createRes.installationId;
} 