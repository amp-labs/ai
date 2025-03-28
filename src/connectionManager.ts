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
                text: `Connection found for ${provider}`,
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
}
