import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { 
  providerSchema, 
  associationsSchema,
  executeAmpersandWrite 
} from "./common";

export const createWriteActionTool = async (
  server: Server,
  type: string,
  name: string
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
        .describe("The group reference for the SaaS instance that should be written to"),
      associations: associationsSchema,
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
      const result = await executeAmpersandWrite({
        objectName,
        type,
        record,
        groupRef,
        associations,
      });

      if (result.success) {
        console.log(`${type} operation on provider succeeded:`, result.response);
        return {
          content: [
            {
              type: "text",
              text: `Successfully performed ${type} operation on ${objectName}`,
            },
            {
              type: "text",
              text: `Record ID: ${result.recordId || "N/A"}`,
            },
            {
              type: "text",
              text: `Response: ${JSON.stringify(result.response)}`,
            },
          ],
        };
      } else {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error performing write operation: ${result.response}`,
            },
          ],
        };
      }
    }
  );
}; 