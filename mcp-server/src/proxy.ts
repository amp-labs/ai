import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ensureConnectionExists } from "./connectionManager";
import { providerSchema } from "./schemas";
import { ClientSettings } from ".";

async function callAmpersandProxy({
  provider,
  suffix,
  method = "GET",
  headers = {},
  installationId,
  settings,
  body,
}: {
  provider: string;
  suffix: string;
  method?: string;
  headers?: Record<string, string>;
  installationId?: string;
  settings?: ClientSettings;
  body?: Record<string, any>;
}) {
  try {
    installationId = installationId || (await ensureConnectionExists(provider, settings));
    const fetchOptions: any = {
      method,
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "x-amp-project-id": settings?.project || "",
        "x-api-key": settings?.apiKey || "",
        "x-amp-proxy-version": "1",
        "x-amp-installation-id": installationId,
      },
    };
    if (body && method !== "GET" && Object.keys(body).length > 0) {
      fetchOptions.body = JSON.stringify(body);
    }
    const response = await fetch(
      `https://proxy.withampersand.com/${suffix}`,
      fetchOptions
    );
    const data = await response.text();
    return {
      content: [
        {
          type: "text",
          text: `${method === "GET" ? "SendReadRequest" : "SendRequest"} to ${provider} returned ${JSON.stringify(data)}`,
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
    console.error(`Error in ${method === "GET" ? "sendReadRequest" : "sendRequest"} tool`, error);
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
      suffix: z.string().describe("Suffix of the request URL, without the leading slash."),
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
      return callAmpersandProxy({
        provider,
        suffix,
        method,
        headers,
        installationId,
        settings,
        body,
      });
    }
  );
}

export async function createSendReadRequestTool(
  server: Server,
  settings?: ClientSettings
): Promise<void> {
  // @ts-ignore
  server.tool(
    "send-read-request",
    `Call provider APIs via the Ampersand sendReadRequest tool`,
    {
      provider: providerSchema,
      suffix: z.string().describe("Suffix of the request URL, without the leading slash."),
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
      suffix,
      headers,
      installationId,
      provider,
    }: {
      suffix: string;
      headers: Record<string, string>;
      installationId: string;
      provider: string;
    }) => {
      return callAmpersandProxy({
        provider,
        suffix,
        method: "GET",
        headers,
        installationId,
        settings,
      });
    }
  );
}
