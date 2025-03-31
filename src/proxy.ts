import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

export async function createProxyTool(
  server: Server,
  provider: string
): Promise<void> {
  // @ts-ignore
  server.tool(
    "proxy",
    `Call ${provider} APIs via the Ampersand proxy`,
    {
      body: z
        .record(z.string(), z.string())
        .optional()
        .describe("Body of the request"),
      suffix: z.string().describe("Suffix of the request URL"),
      method: z.string().describe("HTTP method to use"),
      headers: z
        .record(z.string(), z.string())
        .describe("Headers to send with the request"),
      installationId: z
        .string()
        .describe(
          "The installation ID to use for the proxy call. If not provided, get installation ID by getting the connection or creating a new connection."
        ),
    },
    async ({
      body,
      suffix,
      method,
      headers,
      installationId,
    }: {
      body: Record<string, string>;
      suffix: string;
      method: string;
      headers: Record<string, string>;
      installationId: string;
    }) => {
      try {
        console.log(
          "DEBUG",
          installationId,
          body,
          process.env.AMPERSAND_PROJECT_ID,
          process.env.AMPERSAND_INTEGRATION_ID,
          suffix,
          method,
          headers
        );
        const response = await fetch(
          `https://proxy.withampersand.com/${suffix}`,
          {
            method: method,
            headers: {
              ...headers,
              "Content-Type": "application/json",
              "x-amp-project-id": process.env.AMPERSAND_PROJECT_ID || "",
              "x-api-key": process.env.AMPERSAND_API_KEY || "",
              "x-amp-proxy-version": "1",
              "x-amp-installation-id": installationId,
            },
            body: body ? JSON.stringify(body) : undefined,
          }
        );
        const data = await response.text();
        console.log("Proxy call to", provider, "returned", data);
        return {
          content: [
            {
              type: "text",
              text: `Proxy call to ${provider} returned ${JSON.stringify(
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
        console.error("Error in proxy tool", error);
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
