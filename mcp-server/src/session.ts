import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { Request, Response } from "express";
import { detect } from "detect-port";

const DEFAULT_PORT = 3001;
const SSE_SERVER_VERSION = "v1";

/**
 * Similar to https://github.com/modelcontextprotocol/typescript-sdk/pull/197/files
 */
class TransportManager {
  private transports: Map<string, SSEServerTransport>;

  constructor() {
    this.transports = new Map();
  }

  addTransport(transport: SSEServerTransport, res: Response): string {
    const sessionId = transport.sessionId;
    this.transports.set(sessionId, transport);

    // Set up cleanup when response ends
    res.on("close", () => {
      this.removeTransport(sessionId);
    });

    return sessionId;
  }

  removeTransport(sessionId: string) {
    if (this.transports.has(sessionId)) {
      this.transports.delete(sessionId);
    }
  }

  getTransport(sessionId: string): SSEServerTransport | undefined {
    return this.transports.get(sessionId);
  }

  getAllTransports(): SSEServerTransport[] {
    return Array.from(this.transports.values());
  }
}

export async function connectServer(
  server: Server,
  useStdioTransport: boolean,
  settings: any
): Promise<express.Application | undefined> {
  if (useStdioTransport) {
    console.log("Connecting to MCP server over stdio");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    return;
  }

  const app = express();
  const port = await detect(DEFAULT_PORT);
  const transportManager = new TransportManager();

  let currentTransport: SSEServerTransport | null = null;

  app.get(`/${SSE_SERVER_VERSION}/sse`, async (req: Request, res: Response) => {
    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (req.query.project) {
      settings.project = req.query.project;
    }
    if (req.query.integrationName) {
      settings.integrationName = req.query.integrationName;
    }
    if (req.query.apiKey) {
      settings.apiKey = req.query.apiKey;
    }
    if (req.query.groupRef) {
      settings.groupRef = req.query.groupRef;
    }
    if (req.headers["x-api-key"]) {
      // if headers are supported by the mcp client, we use that over the query params. The support for headers in limited.
      // VS code supports it for example like this: https://github.com/microsoft/vscode-docs/blob/74c4fd5aa3180b218fc389184659b621f05460ca/docs/copilot/chat/mcp-servers.md#configuration-example
      settings.apiKey = req.headers["x-api-key"];
    }
    console.log("[SESSION] Settings: ", settings);
    currentTransport = new SSEServerTransport("/messages", res);
    const sessionId = transportManager.addTransport(currentTransport, res);
    await server.connect(currentTransport);
  });

  app.post("/messages", async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;

    console.log("[SESSION] Session ID", sessionId);
    if (!sessionId) {
      res.status(400).json({ error: "Missing session ID param" });
      return;
    }

    const transport = transportManager.getTransport(sessionId);

    if (transport) {
      try {
        await transport.handlePostMessage(req, res, req.body);
      } catch (error) {
        console.error(
          "Error handling POST message for sessionId:",
          sessionId,
          error
        );

        // If there's a critical error, clean up the transport
        if (
          error instanceof Error &&
          error.message.includes("session closed")
        ) {
          transportManager.removeTransport(sessionId);
        }
      }
    } else {
      res.status(404).json({ error: "session not found" });
    }
  });

  app.listen(port, () => {
    if (port !== DEFAULT_PORT) {
      console.error(
        `Port ${DEFAULT_PORT} is already in use. Ampersand MCP Server running on SSE at http://localhost:${port}/${SSE_SERVER_VERSION}`
      );
    } else {
      console.error(
        `Ampersand MCP Server running on SSE at http://localhost:${port}/${SSE_SERVER_VERSION}`
      );
    }
  });

  return app;
}
