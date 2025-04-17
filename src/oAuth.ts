import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SERVER_AMPERSAND_PROJECT_ID } from "./settings.js";
import { providerSchema } from "./schemas";

export async function createAuthTool(
  server: Server,
): Promise<void> {
  // @ts-ignore
  server.tool(
    "oauth",
    `Connect to a SaaS tool provider using the Ampersand OAuth flow. The tool will return a clickablelink to the OAuth flow for the user to click.`,
    {
      query: z.string(),
      provider: providerSchema,
    },
    async ({ query, provider }: { query: string, provider: string }) => {
      let oAuthUrl = "";
      const consumerRef = crypto.randomUUID();
      const groupRef = "mcp_server_client_" + process.env.AMPERSAND_GROUP_REF;
      console.log("[DEBUG] groupRef", groupRef);
      const projectId = SERVER_AMPERSAND_PROJECT_ID;
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `{"provider":"${provider}","consumerRef":"${consumerRef}","groupRef":"${groupRef}","projectId":"${projectId}"}`,
      };

      try {
        const response = await fetch(
          "https://api.withampersand.com/v1/oauth-connect",
          options
        );
        const data = await response.text();
        console.log("[DEBUG] oauth response", data);
        oAuthUrl = data;
      } catch (err) {
        console.error(err);
      }

      return {
        content: [
          {
            type: "text",
            text: oAuthUrl,
          }
        ],
      };
    }
  );
}
