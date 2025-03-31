import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

export async function createConnectionManagerTools(
  server: Server,
  provider: string
): Promise<void> {
  // @ts-ignore
  server.tool(
    "check-connection",
    `Check if there is an active connection for ${provider}`,
    {
      query: z.string(),
    },
    async ({ query }: { query: string }) => {
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
        console.log("[DEBUG] connection response", data);

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
    `Check if there is an active installation for ${provider}`,
    {
      query: z.string(),
    },
    async ({ query }: { query: string }) => {
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
    `Create a new installation for ${provider}`,
    {
      connectionId: z.string(),
      groupRef: z.string(),
    },
    async ({ connectionId, groupRef }: { connectionId: string, groupRef: string }) => {
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
              provider: "hubspot",
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
