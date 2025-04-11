import { record, z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

export async function createCreateTool(
  server: Server,
  provider: string
): Promise<void> {
  createWriteActionTool(server, provider, "create", "create");
}

export async function createUpdateTool(
  server: Server,
  provider: string
): Promise<void> {
  createWriteActionTool(server, provider, "update", "update");
}



const createWriteActionTool = async (server: Server, provider: string, type: string, name: string) => {
    // @ts-ignore
    return server.tool(
      name,
      `Perform a ${type} action on ${provider}`,
      {
        objectName: z.string().describe("The name of the object to write to"),
        type: z.enum([type]).describe("The type of write operation"),
        record: z.record(z.any()).describe("The record data to write"),
        groupRef: z.string().describe("The group reference for the write operation"),
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
        try {
          const writeEndpoint = `https://write.withampersand.com/v1/projects/${
            process.env.AMPERSAND_PROJECT_ID
          }/integrations/${process.env.AMPERSAND_INTEGRATION_ID}/objects/${objectName}`;
  
          const response = await fetch(writeEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": process.env.AMPERSAND_API_KEY || "",
            },
            body: JSON.stringify({
              groupRef,
              type,
              record,
              ...(associations && { associations }),
            }),
          });
  
          const data = await response.json();
  
          if (!response.ok) {
            console.error("Write operation failed:", data);
            return {
              isError: true,
              content: [
                {
                  type: "text",
                  text: `Write operation failed: ${JSON.stringify(data)}`,
                },
              ],
            };
          }
  
          console.log(`${type} operation on ${provider} succeeded:`, data);
          return {
            content: [
              {
                type: "text",
                text: `Successfully performed ${type} operation on ${objectName}`,
              },
              {
                type: "text",
                text: `Record ID: ${data.recordId || "N/A"}`,
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
}
