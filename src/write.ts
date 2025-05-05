import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { providerSchema } from "./schemas";
import { z } from "zod";
import { SDKNodeWrite } from "@amp-labs/sdk-node-write";
import { ClientSettings } from ".";

export async function createCreateTool(server: Server, settings?: ClientSettings): Promise<void> {
  createWriteActionTool(server, "create", "create", settings);
}

export async function createUpdateTool(server: Server, settings?: ClientSettings): Promise<void> {
  createWriteActionTool(server, "update", "update", settings);
}

const createWriteActionTool = async (
  server: Server,
  type: string,
  name: string,
  settings?: ClientSettings
) => {

  // @ts-ignore
  return server.tool(
    name,
    `Perform a ${type} action on provider`,
    {
      provider: providerSchema,
      objectName: z.string().describe("The name of the object to write to"),
      type: z.enum([type]).describe("The type of write operation"),
      record: z.record(z.any()).describe("The record data to write"),
      groupRef: z
        .string()
        .describe("The group reference for the write operation"),
      associations: z
        .array(
          z.object({
            to: z.object({
              id: z.string(),
            }),
            types: z.array(
              z.object({
                associationCategory: z.string(),
                associationTypeId: z.number(),
              })
            ),
          })
        )
        .optional()
        .describe("Optional associations for the record"),
    },
    async ({
      objectName,
      type,
      record,
      groupRef,
      associations,
    }: {
      objectName: string;
      type: "create" | "update";
      record: Record<string, any>;
      groupRef: string;
      associations?: Array<{
        to: { id: string };
        types: Array<{
          associationCategory: string;
          associationTypeId: number;
        }>;
      }>;
    }) => {
      console.log("[CREATE-WRITE-ACTION-TOOL] call: ", name, type);
      try {
        const writeSDK = new SDKNodeWrite({
          apiKeyHeader: settings?.apiKey || "",
        });
        const writeData = {
          projectIdOrName: settings?.project || process.env.AMPERSAND_PROJECT_ID || "",
          integrationId: settings?.integrationId || process.env.AMPERSAND_INTEGRATION_ID || "",
          objectName,
          requestBody: {
            groupRef,
            type,
            record,
            ...(associations && { associations }),
          },
        };

        const data = await writeSDK.write.records(writeData);

        console.log(`${type} operation on provider succeeded:`, data);
        return {
          content: [
            {
              type: "text",
              text: `Successfully performed ${type} operation on ${objectName}`,
            },
            {
              type: "text", // @ts-ignore
              text: `Record ID: ${data?.result?.recordId || "N/A"}`,
            },
            {
              type: "text",
              text: `Response: ${JSON.stringify(data)}`,
            },
          ],
        };
      } catch (error) {
        console.error("Error in write operation:", error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error performing write operation: ${error}`,
            },
          ],
        };
      }
    }
  );
};
