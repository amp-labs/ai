import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { createWriteActionTool } from "@amp-labs/ai/mcp";

export async function createCreateTool(server: Server): Promise<void> {
  createWriteActionTool(server, "create", "create");
}

export async function createUpdateTool(server: Server): Promise<void> {
  createWriteActionTool(server, "update", "update");
}
