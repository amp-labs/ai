import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { providerSchema } from "./schemas";
import { ClientSettings } from ".";

export async function createStartOAuthTool(
  server: Server,
  settings?: ClientSettings
): Promise<void> {
  // @ts-ignore
  server.tool(
    "start-oauth",
    `Connect to a SaaS tool provider using the Ampersand OAuth flow. The tool will return a clickable link to the OAuth flow for the user to click.`,
    {
      provider: providerSchema,
    },
    async ({ provider }: { query: string, provider: string }) => {
      let oAuthUrl = "";
      const consumerRef = crypto.randomUUID();
      const groupRef = settings?.groupRef || process.env.AMPERSAND_GROUP_REF;
      console.log("[OAUTH] call: ", provider, groupRef, settings);
      const projectId = settings?.project || process.env.AMPERSAND_PROJECT_ID;
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
