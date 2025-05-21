import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { createWriteActionTool } from "@amp-labs/ai/mcp";
import { ClientSettings } from ".";

export async function createCreateTool(server: Server, settings: ClientSettings): Promise<void> {
  createWriteActionTool(server, "create", "create", settings);
}

export async function createUpdateTool(server: Server, settings: ClientSettings): Promise<void> {
  createWriteActionTool(server, "update", "update", settings);
}
