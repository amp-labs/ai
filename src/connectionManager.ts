import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { providerSchema } from "./schemas";
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
      const options = {
        method: "GET",
        headers: { "X-Api-Key": process.env.AMPERSAND_API_KEY || "" },
      };

      try {
        const response = await fetch(
          `https://api.withampersand.com/v1/projects/${process.env.AMPERSAND_PROJECT_ID}/connections?provider=${provider}`,
          options
        );
        const data = await response.json();

        if (data.length > 0) {
          return {
            content: [
              {
                type: "text",
                text: `Connection found for ${provider} connectionId: ${data[0].id}, groupRef: ${data[0].group?.groupRef}`,
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
        console.error(err);
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
      const options = {
        method: "GET",
        headers: { "X-Api-Key": process.env.AMPERSAND_API_KEY || "" },
      };

      try {
        const response = await fetch(
          `https://api.withampersand.com/v1/projects/${process.env.AMPERSAND_PROJECT_ID}/integrations/${process.env.AMPERSAND_INTEGRATION_ID}/installations`,
          options
        );
        const data = await response.json();
        console.log("[DEBUG] installation response", data);

        if (data.length > 0) {
          return {
            content: [
              {
                type: "text",
                text: `Installation found for ${provider}`,
              },
              {
                type: "text",
                text: `Installation ID: ${data[0].id}`,
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
        console.error(err);
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
      const options = {
        method: "POST",
        headers: {
          "X-Api-Key": process.env.AMPERSAND_API_KEY || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          config: {
            createdBy: "api:create-installation",
            content: {
              provider: provider,
              proxy: { enabled: true }
            }
          },
          groupRef: groupRef,
          connectionId: connectionId
        })
      };

      try {
        console.log("[DEBUG] creating installation", options);
        const response = await fetch(
          `https://api.withampersand.com/v1/projects/${process.env.AMPERSAND_PROJECT_ID}/integrations/${process.env.AMPERSAND_INTEGRATION_ID}/installations`,
          options
        );
        const data = await response.json();
        console.log("[DEBUG] installation response", data);
        const created = data.createTime !== undefined;
        return {
          content: [
            {
              type: "text",
              text: `Installation was ${created ? "created" : "not created"} for ${provider}`,
            },
            {
              type: "text",
              text: `Installation ID: ${data[0].id}`,
            },
          ],
        };
      } catch (err) {
        console.error(err);
      }
    }
  );
}

export async function ensureConnectionExists(provider: string): Promise<string> {
  // Check for existing connection
  const connectionResponse = await fetch(
    `https://api.withampersand.com/v1/projects/${process.env.AMPERSAND_PROJECT_ID}/connections?provider=${provider}`,
    {
      method: "GET",
      headers: { "X-Api-Key": process.env.AMPERSAND_API_KEY || "" },
    }
  );
  const connectionData = await connectionResponse.json();

  if (connectionData.length === 0) {
    throw new Error(`No existing connections found for ${provider}. Please connect using OAuth.`);
  }

  const connectionId = connectionData[0].id;
  const groupRef = connectionData[0].group?.groupRef;

  // Check for existing installation
  const installationResponse = await fetch(
    `https://api.withampersand.com/v1/projects/${process.env.AMPERSAND_PROJECT_ID}/integrations/${process.env.AMPERSAND_INTEGRATION_ID}/installations`,
    {
      method: "GET",
      headers: { "X-Api-Key": process.env.AMPERSAND_API_KEY || "" },
    }
  );
  const installationData = await installationResponse.json();
  console.log("[DEBUG] installation response", installationData);

  if (installationData.length === 0) {
    // Create installation if it doesn't exist
    const createOptions = {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.AMPERSAND_API_KEY || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        config: {
          createdBy: "api:create-installation",
          content: {
            provider: "hubspot",
            proxy: { enabled: true }
          }
        },
        groupRef: groupRef,
        connectionId: connectionId
      })
    };

    const createResponse = await fetch(
      `https://api.withampersand.com/v1/projects/${process.env.AMPERSAND_PROJECT_ID}/integrations/${process.env.AMPERSAND_INTEGRATION_ID}/installations`,
      createOptions
    );
    const createData = await createResponse.json();
    console.log("[DEBUG] installation creation response", createData);

    if (createData.createTime !== undefined) {
      console.log(`Installation created for ${provider}, Installation ID: ${createData[0].id}`);
      return createData[0].id;
    } else {
      throw new Error(`No existing connections found for ${provider}. Please connect using OAuth.`);
    }
  } else {
    console.log(`Installation already exists for ${provider}`);
    return installationData[0].id;
  }
}
