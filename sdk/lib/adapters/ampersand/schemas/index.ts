import { z } from "zod";

// Tool descriptions
export const createRecordToolDescription = "Create a record in a SaaS platform (e.g. create a new Contact in Salesforce)";
export const updateRecordToolDescription = "Update a record in a SaaS platform (e.g. update a contact's email address in Hubspot)";

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