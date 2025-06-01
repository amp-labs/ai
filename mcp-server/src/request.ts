import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ensureInstallation } from "./connectionManager";
import { endpointSchema, installationIdSchema, providerSchema } from "./schemas";
import { ClientSettings } from ".";

async function callAmpersandProxy({
  provider,
  endpoint,
  method,
  headers = {},
  installationId,
  settings,
  body,
}: {
  provider: string;
  endpoint: string;
  method: string;
  headers?: Record<string, string>;
  installationId?: string;
  settings?: ClientSettings;
  body?: Record<string, any>;
}) {
  try {
    installationId = installationId || (await ensureInstallation(provider, settings));
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
      `https://proxy.withampersand.com/${endpoint}`,
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
      endpoint: endpointSchema,
      method: z.string().describe("HTTP method to use"),
      headers: z
        .record(z.string(), z.string())
        .describe("Headers to send with the request"),
      installationId: installationIdSchema,
    },
    async ({
      body,
      endpoint,
      method,
      headers,
      installationId,
      provider,
    }: {
      body: Record<string, string>;
      endpoint: string;
      method: string;
      headers: Record<string, string>;
      installationId?: string;
      provider: string;
    }) => {
      return callAmpersandProxy({
        provider,
        endpoint,
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
      endpoint: endpointSchema,
      headers: z
        .record(z.string(), z.string())
        .describe("Headers to send with the request"),
      installationId: installationIdSchema,
    },
    async ({
      endpoint,
      headers,
      installationId,
      provider,
    }: {
      endpoint: string;
      headers: Record<string, string>;
      installationId: string;
      provider: string;
    }) => {
      return callAmpersandProxy({
        provider,
        endpoint,
        method: "GET",
        headers,
        installationId,
        settings,
      });
    }
  );
}
