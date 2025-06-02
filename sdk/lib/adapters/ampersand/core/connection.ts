import { SDKNodePlatform } from "@amp-labs/sdk-node-platform";
import * as Sentry from "@sentry/node";
interface CheckConnectionParams {
  provider: string;
  apiKey?: string;
  projectId?: string;
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
export async function checkConnectionHelper({
  provider,
  apiKey = process.env.AMPERSAND_API_KEY || "",
  projectId = process.env.AMPERSAND_PROJECT_ID || "",
}: CheckConnectionParams): Promise<CheckConnectionResult> {
  try {
    const client = new SDKNodePlatform({
      apiKeyHeader: apiKey,
    });

    const connections = await client.connections.list({
      projectIdOrName: projectId,
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