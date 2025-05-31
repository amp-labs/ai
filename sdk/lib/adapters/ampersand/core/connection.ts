import { SDKNodePlatform } from "@amp-labs/sdk-node-platform";
import { AmpersandConfig, amp } from "../../../config";
import * as Sentry from "@sentry/node";
interface CheckConnectionParams {
  provider: string;
  config?: Partial<AmpersandConfig>;
}

export interface CheckConnectionResult {
  found: boolean;
  connectionId?: string;
  groupRef?: string;
  data?: any;
}

/**
 * Helper that calls the Ampersand Platform API and determines whether a
 * connection already exists for the supplied provider.
 */
export async function checkConnection({
  provider,
  config: configOverride,
}: CheckConnectionParams): Promise<CheckConnectionResult> {
  try {
    const config = configOverride ? amp.init(configOverride) : amp.get();

    const client = new SDKNodePlatform({
      apiKeyHeader: config.apiKey,
    });

    const connections = await client.connections.list({
      projectIdOrName: config.projectId,
      provider,
    });

    // @ts-ignore – SDK typing for `connections.list` result is loose
    if (connections.length > 0) {
      // @ts-ignore – access first connection object directly
      const connection = connections[0];
      return {
        found: true,
        connectionId: connection.id,
        groupRef: connection.group?.groupRef,
        data: connection,
      };
    }

    return { found: false };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[Ampersand] Error while checking connection:", error);
    throw error;
  }
} 