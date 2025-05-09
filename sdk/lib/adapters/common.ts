import { z } from "zod";
import { Ampersand } from "@amp-labs/sdk-node-write";
import { WriteRecordsResponse, WriteRecordsSyncWriteResponseSuccess } from "@amp-labs/sdk-node-write/models/operations";

/**
 * Common schemas, types and functions for Ampersand integrations
 */

// Common schemas that can be reused across different tools
// Schema for associations
export const associationsSchema = z
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
  .describe("Optional associations for the record");

// Base schema for provider
export const providerSchema = z.string().describe(
  `The provider to connect to. Typically a SaaS tool like Monday, Hubspot, Salesforce, etc.`
);

// Base schema for write operations
export const baseWriteSchema = {
  provider: providerSchema,
  objectName: z.string().describe("The name of the object to write to"),
  record: z.record(z.any()).describe("The record data to write"),
  associations: associationsSchema,
};

// Create operation schema
export const createActionSchema = z.object({
  ...baseWriteSchema,
  type: z.enum(["create"]).describe("The type of write operation"),
  groupRef: z
    .string()
    .describe("The group reference for the write operation"),
});

// Update operation schema
export const updateActionSchema = z.object({
  ...baseWriteSchema,
  type: z.enum(["update"]).describe("The type of write operation"),
  groupRef: z
  .string()
  .describe("The group reference for the write operation"),
});

// Common output schema
export const writeOutputSchema = z.object({
  status: z.string(),
  recordId: z.string(),
  response: z.any(),
});

// Type definitions for the parameters
export type CreateParams = {
  provider: string;
  objectName: string;
  type: "create";
  record: Record<string, any>;
  groupRef: string;
  associations?: Array<{
    to: { id: string };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
};

export type UpdateParams = {
  provider: string;
  objectName: string;
  type: "update";
  record: Record<string, any>;
  groupRef: string;
  associations?: Array<{
    to: { id: string };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
};

// Common function that encapsulates the core Ampersand write logic
export async function executeAmpersandWrite({
  objectName,
  type,
  record,
  groupRef,
  associations,
  apiKey = process.env.AMPERSAND_API_KEY || "",
  projectId = process.env.AMPERSAND_PROJECT_ID || "",
  integrationId = process.env.AMPERSAND_INTEGRATION_ID || "",
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
  apiKey?: string;
  projectId?: string;
  integrationId?: string;
}) {
  try {
    const writeSDK = new Ampersand({
      apiKeyHeader: apiKey,
    });
    
    const writeData = {
      projectIdOrName: projectId,
      integrationId: integrationId,
      objectName,
      requestBody: {
        groupRef,
        type,
        record,
        ...(associations && { associations }),
      },
    };

    const data: WriteRecordsResponse = await writeSDK.write.records(writeData);
    
    return {
      success: true,
      status: "success",
      recordId: (data as WriteRecordsSyncWriteResponseSuccess)?.result?.recordId || "",
      response: data,
    };
  } catch (error) {
    console.error("Error in write operation:", error);
    return {
      success: false,
      status: "error",
      recordId: "",
      response: error,
    };
  }
} 