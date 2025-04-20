import { SDKNodePlatform } from "@amp-labs/sdk-node-platform";
import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { providerSchema } from "./schemas";
import { Installation, UpdateInstallationConnection } from "@amp-labs/sdk-node-platform/models/operations/updateinstallation";

// Instantiate the Ampersand Node Platform Client
const ampersandClient = new SDKNodePlatform({
  apiKeyHeader: process.env.AMPERSAND_API_KEY || "",
});

export async function createConnectionManagerTools(
  server: Server,
): Promise<void> {
  // @ts-ignore
  server.tool(
    "check-connection",
    `Check if there is an active connection for provider`,
    {
      provider: providerSchema,
    },
    async ({ provider }: { provider: string }) => {
      try {
        const data = await ampersandClient.connections.list({
          projectIdOrName: process.env.AMPERSAND_PROJECT_ID || "",
          provider: provider,
        });

        // @ts-ignore
        if (data.length > 0) {
          // @ts-ignore
          const connection = data[0];
          console.log("[DEBUG] connection response", connection);
          return {
            content: [
              {
                type: "text",
                text: `Connection found for ${provider} connectionId: ${connection.id}, groupRef: ${connection.group?.groupRef}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `No existing connections found for ${provider}`,
              },
            ],
          };
        }
      } catch (err) {
        console.error("Error checking connection:", err);
        return {
          content: [
            {
              type: "text",
              text: `Error checking connection for ${provider}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // @ts-ignore
  server.tool(
    "check-installation",
    `Check if there is an active installation for provider`,
    {
      provider: providerSchema,
    },
    async ({ provider }: { provider: string }) => {
      try {
        const data = await ampersandClient.installations.list({
          projectIdOrName: process.env.AMPERSAND_PROJECT_ID || "",
          integrationId: process.env.AMPERSAND_INTEGRATION_ID || "",
        });

        // @ts-ignore
        const relevantInstallations = data.filter(
          // @ts-ignore
          (inst) => inst.connection?.provider === provider
        );

        console.log("[DEBUG] installation response", relevantInstallations, data);

        if (relevantInstallations.length > 0) {
          const installation = relevantInstallations[0];
          return {
            content: [
              {
                type: "text",
                text: `Installation found for ${provider}`,
              },
              {
                type: "text",
                text: `Installation ID: ${installation.id}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `No existing installations found for ${provider}`,
              },
            ],
          };
        }
      } catch (err) {
        console.error("Error checking installation:", err);
        return {
          content: [
            {
              type: "text",
              text: `Error checking installation for ${provider}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // @ts-ignore
  server.tool(
    "create-installation",
    `Create a new installation for provider`,
    {
      provider: providerSchema,
      connectionId: z.string(),
      groupRef: z.string(),
    },
    async ({ provider, connectionId, groupRef }: { provider: string, connectionId: string, groupRef: string }) => {
      try {
        console.log("[DEBUG] creating installation for connection:", connectionId, "group:", groupRef);
        const data = await ampersandClient.installations.create({
          projectIdOrName: process.env.AMPERSAND_PROJECT_ID || "",
          integrationId: process.env.AMPERSAND_INTEGRATION_ID || "",
          requestBody: {
            connectionId: connectionId,
            groupRef: groupRef,
            config: {
              createdBy: "api:create-installation",
              content: {
                provider: provider,
                proxy: { enabled: true }
              }
            }
          }
        });

        console.log("[DEBUG] installation creation response", data);
        // @ts-ignore
        const created = data.id !== undefined;
        return {
          content: [
            {
              type: "text",
              text: `Installation was ${created ? "created" : "not created"} for ${provider}`,
            },
            ...(created ? [{
              type: "text" as const,
              // @ts-ignore
              text: `Installation ID: ${data.id}`,
            }] : []),
          ],
        };
      } catch (err) {
        console.error("Error creating installation:", err);
        return {
          content: [
            {
              type: "text",
              text: `Error creating installation for ${provider}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
}

export async function ensureConnectionExists(provider: string): Promise<string> {
  const connectionData = await ampersandClient.connections.list({
    projectIdOrName: process.env.AMPERSAND_PROJECT_ID || "",
    provider: provider,
  });

  // @ts-ignore
  if (connectionData.length === 0) {
    throw new Error(`No existing connections found for ${provider}. Please connect using OAuth.`);
  }

  // @ts-ignore
  const connection = connectionData[0];
  const connectionId = connection.id;
  const groupRef = connection.group?.ref;

  if (!groupRef) {
    throw new Error(`Connection ${connectionId} for provider ${provider} does not have a groupRef.`);
  }

  const installationData = await ampersandClient.installations.list({
    projectIdOrName: process.env.AMPERSAND_PROJECT_ID || "",
    integrationId: process.env.AMPERSAND_INTEGRATION_ID || "",
  });

  // @ts-ignore
  const relevantInstallations = installationData.filter(
    // @ts-ignore
    (inst: Installation) => inst.connection?.provider === provider && inst.groupRef === groupRef && inst.connectionId === connectionId
  );

  console.log("[DEBUG] existing installation check", relevantInstallations);

  if (relevantInstallations.length === 0) {
    console.log("[DEBUG] No existing installation found, creating one for connection:", connectionId, "group:", groupRef);
    const createData = await ampersandClient.installations.create({
      projectIdOrName: process.env.AMPERSAND_PROJECT_ID || "",
      integrationId: process.env.AMPERSAND_INTEGRATION_ID || "",
      requestBody: {
        connectionId: connectionId,
        groupRef: groupRef,
        config: {
          createdBy: "api:ensureConnectionExists",
          content: {
            provider: provider,
            proxy: { enabled: true }
          }
        }
      }
    });

    console.log("[DEBUG] installation creation response", createData);

    // @ts-ignore
    if (createData.installation?.id) {
      // @ts-ignore
      console.log(`Installation created for ${provider}, Installation ID: ${createData.installation.id}`);
      // @ts-ignore
      return createData.installation.id;
    } else {
      throw new Error(`Failed to create installation for ${provider}. API response: ${JSON.stringify(createData)}`);
    }
  } else {
    console.log(`Installation already exists for ${provider} with ID: ${relevantInstallations[0].id}`);
    return relevantInstallations[0].id;
  }
}
