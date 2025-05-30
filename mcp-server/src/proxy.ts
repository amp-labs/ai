import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ensureConnectionExists } from "./connectionManager";
import { providerSchema } from "./schemas";
import { ClientSettings } from ".";

export async function createSendRequestTool(
  server: Server,
  settings?: ClientSettings
): Promise<void> {
  // @ts-ignore
  server.tool(
    "send-request",
    `Call provider APIs via the Ampersand sendRequest tool`,
    {
      provider: providerSchema,
      body: z
        .record(z.string(), z.string())
        .optional()
        .describe("Body of the request"),
      suffix: z.string().describe("Suffix of the request URL. without the leading slash."),
      method: z.string().describe("HTTP method to use"),
      headers: z
        .record(z.string(), z.string())
        .describe("Headers to send with the request"),
      installationId: z
        .string()
        .optional()
        .describe(
          "The installation ID to use for the API call. If not provided, get installation ID by getting the connection or creating a new connection."
        ),
    },
    async ({
      body,
      suffix,
      method,
      headers,
      installationId,
      provider,
    }: {
      body: Record<string, string>;
      suffix: string;
      method: string;
      headers: Record<string, string>;
      installationId: string;
      provider: string;
    }) => {
      try {
        installationId = installationId || (await ensureConnectionExists(provider, settings));
        console.log(
          "[SEND-REQUEST] Call:",
          installationId,
          body,
          settings?.project,
          settings?.integrationName,
          suffix,
          method,
          headers,
          settings
        );
        const response = await fetch(
          `https://proxy.withampersand.com/${suffix}`,
          {
            method: method,
            headers: {
              ...headers,
              "Content-Type": "application/json",
              "x-amp-project-id": settings?.project || "",
              "x-api-key": settings?.apiKey || "",
              "x-amp-proxy-version": "1",
              "x-amp-installation-id": installationId,
            },
            body: body && Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
          }
        );
        const data = await response.text();
        console.log("SendRequest to", provider, "returned", data);
        return {
          content: [
            {
              type: "text",
              text: `SendRequest to ${provider} returned ${JSON.stringify(
                data
              )}`,
            },
            {
              type: "text",
              text: `Status: ${response.status}`,
            },
            {
              type: "text",
              text: `Response: ${JSON.stringify(data)}`,
            },
          ],
        };
      } catch (error) {
        console.error("Error in sendRequest tool", error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error}`,
            },
          ],
        };
      }
    }
  );
}
