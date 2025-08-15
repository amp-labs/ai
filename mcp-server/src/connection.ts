import { SDKNodePlatform } from '@amp-labs/sdk-node-platform';
import { z } from 'zod';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { providerSchema } from './schemas';
import { ClientSettings } from '.';

export async function createConnectionManagerTools(
  server: Server,
  settings?: ClientSettings,
): Promise<void> {
  // @ts-ignore
  server.tool(
    'check-connection',
    `Check if there is an active connection for provider`,
    {
      provider: providerSchema,
    },
    async ({ provider }: { provider: string }) => {
      try {
        // Instantiate the Ampersand Node Platform Client
        const ampersandClient = new SDKNodePlatform({
          apiKeyHeader: settings?.apiKey || '',
        });
        const body = {
          projectIdOrName:
            settings?.project || process.env.AMPERSAND_PROJECT_ID || '',
          provider: provider,
        };
        const data = await ampersandClient.connections.list(body);
        console.log('[CHECK-CONNECTION] API call to listConnections: ', body);

        // @ts-ignore
        if (data.length > 0) {
          // @ts-ignore
          const connection = data[0];
          console.log(
            '[CHECK-CONNECTION] API response from listConnections:',
            connection,
          );
          return {
            content: [
              {
                type: 'text',
                text: `Connection found for ${provider} connectionId: ${connection.id}, groupRef: ${connection.group?.groupRef}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `No existing connections found for ${provider}`,
              },
            ],
          };
        }
      } catch (err) {
        console.error('Error checking connection:', err);
        return {
          content: [
            {
              type: 'text',
              text: `Error checking connection for ${provider}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            },
          ],
        };
      }
    },
  );

  // @ts-ignore
  server.tool(
    'check-installation',
    `Check if there is an active installation for provider`,
    {
      provider: providerSchema,
    },
    async ({ provider }: { provider: string }) => {
      try {
        // Instantiate the Ampersand Node Platform Client
        const ampersandClient = new SDKNodePlatform({
          apiKeyHeader: settings?.apiKey || '',
        });
        const body = {
          projectIdOrName:
            settings?.project || process.env.AMPERSAND_PROJECT_ID || '',
          integrationId:
            settings?.integrationName ||
            process.env.AMPERSAND_INTEGRATION_NAME ||
            '',
        };
        console.log(
          '[CHECK-INSTALLATION] API call to listInstallations: ',
          body,
        );
        const data = await ampersandClient.installations.list(body);

        console.log(
          '[CHECK-INSTALLATION] API response from listInstallations: ',
          data,
        );
        // @ts-ignore
        const relevantInstallations = data.filter(
          // @ts-ignore
          (inst) => inst.connection?.provider === provider.toLowerCase(),
        );
        console.log(
          '[CHECK-INSTALLATION] filtered installations: ',
          relevantInstallations,
        );

        if (relevantInstallations.length > 0) {
          const installation = relevantInstallations[0];
          return {
            content: [
              {
                type: 'text',
                text: `Installation found for ${provider}`,
              },
              {
                type: 'text',
                text: `Installation ID: ${installation.id}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `No existing installations found for ${provider}`,
              },
            ],
          };
        }
      } catch (err) {
        console.error('Error checking installation:', err);
        return {
          content: [
            {
              type: 'text',
              text: `Error checking installation for ${provider}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            },
          ],
        };
      }
    },
  );

  // @ts-ignore
  server.tool(
    'create-installation',
    `Create a new installation for provider`,
    {
      provider: providerSchema,
      connectionId: z.string(),
      groupRef: z.string(),
    },
    async ({
      provider,
      connectionId,
      groupRef,
    }: {
      provider: string;
      connectionId: string;
      groupRef: string;
    }) => {
      try {
        // Instantiate the Ampersand Node Platform Client
        const ampersandClient = new SDKNodePlatform({
          apiKeyHeader: settings?.apiKey || '',
        });
        const requestBody = {
          connectionId: connectionId,
          groupRef: groupRef,
          config: {
            createdBy: 'mcp:create-installation',
            content: {
              provider: provider,
              proxy: { enabled: true },
            },
          },
        };
        console.log(
          '[CREATE-INSTALLATION] API call to createInstallation: ',
          requestBody,
        );

        const data = await ampersandClient.installations.create({
          projectIdOrName:
            settings?.project || process.env.AMPERSAND_PROJECT_ID || '',
          integrationId:
            settings?.integrationName ||
            process.env.AMPERSAND_INTEGRATION_NAME ||
            '',
          requestBody,
        });

        console.log(
          '[CREATE-INSTALLATION] API response from createInstallation: ',
          data,
        );

        // @ts-ignore
        const created = data.id !== undefined;
        return {
          content: [
            {
              type: 'text',
              text: `Installation was ${created ? 'created' : 'not created'} for ${provider}`,
            },
            ...(created
              ? [
                  {
                    type: 'text' as const,
                    // @ts-ignore
                    text: `Installation ID: ${data.id}`,
                  },
                ]
              : []),
          ],
        };
      } catch (err) {
        console.error('Error creating installation:', err);
        return {
          content: [
            {
              type: 'text',
              text: `Error creating installation for ${provider}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            },
          ],
        };
      }
    },
  );
}

/**
 * Ensures that a connection exists for a given provider, and
 * creates an Installation if one doesn't already exist.
 *
 * @param provider - The SaaS API provider
 * @param settings - The client settings
 * @returns The installation ID
 */
export async function ensureInstallation(
  provider: string,
  settings?: ClientSettings,
): Promise<string> {
  // Instantiate the Ampersand Node Platform Client
  const ampersandClient = new SDKNodePlatform({
    apiKeyHeader: settings?.apiKey || '',
  });
  const body = {
    projectIdOrName:
      settings?.project || process.env.AMPERSAND_PROJECT_ID || '',
    provider: provider,
  };
  console.log('[ENSURE-INSTALLATION] API call to listConnections: ', body);

  const connectionData = await ampersandClient.connections.list(body);

  console.log(
    '[ENSURE-INSTALLATION] API response from listConnections: ',
    connectionData,
  );

  // @ts-ignore
  if (connectionData.length === 0) {
    throw new Error(
      `No existing connections found for ${provider}. Please connect using OAuth.`,
    );
  }

  // @ts-ignore
  const connection = connectionData[0];
  const connectionId = connection.id;
  const groupRef = connection.group?.groupRef;

  if (!groupRef) {
    throw new Error(
      `Connection ${connectionId} for provider ${provider} does not have a groupRef.`,
    );
  }

  const installationData = await ampersandClient.installations.list({
    projectIdOrName:
      settings?.project || process.env.AMPERSAND_PROJECT_ID || '',
    integrationId:
      settings?.integrationName || process.env.AMPERSAND_INTEGRATION_NAME || '',
  });

  // @ts-ignore
  const relevantInstallations = installationData.filter(
    // @ts-ignore
    (inst: any) =>
      inst.connection?.provider === provider &&
      inst.group?.groupRef === groupRef &&
      inst.connection?.id === connectionId,
  );

  console.log(
    '[ENSURE-INSTALLATION] existing installation check',
    relevantInstallations,
    installationData,
  );

  if (relevantInstallations.length === 0) {
    console.log(
      '[ENSURE-INSTALLATION] No existing installation found, creating one for connection:',
      connectionId,
      'group:',
      groupRef,
    );

    const requestBody = {
      connectionId: connectionId,
      groupRef: groupRef,
      config: {
        createdBy: 'mcp:ensure-installation',
        content: {
          provider: provider,
          proxy: { enabled: true },
        },
      },
    };

    console.log(
      '[ENSURE-INSTALLATION] API request to createInstallation',
      requestBody,
    );
    const createData = await ampersandClient.installations.create({
      projectIdOrName:
        settings?.project || process.env.AMPERSAND_PROJECT_ID || '',
      integrationId:
        settings?.integrationName ||
        process.env.AMPERSAND_INTEGRATION_NAME ||
        '',
      requestBody,
    });

    console.log(
      '[ENSURE-INSTALLATION] API response from createInstallation',
      createData,
    );

    // @ts-ignore
    const installationId = createData.installation?.id;
    if (installationId) {
      console.log(
        `[ENSURE-INSTALLATION]Installation created for ${provider}, Installation ID: ${installationId}`,
      );
      return installationId;
    } else {
      throw new Error(
        `Failed to create installation for ${provider}. API response: ${JSON.stringify(createData)}`,
      );
    }
  } else {
    console.log(
      `[ENSURE-INSTALLATION]Installation already exists for ${provider} with ID: ${relevantInstallations[0].id}`,
    );
    return relevantInstallations[0].id;
  }
}
