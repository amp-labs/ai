import { z } from "zod";

// Tool descriptions
export const createRecordToolDescription = "Create a record in a SaaS platform (e.g. create a new Contact in Salesforce)";
export const updateRecordToolDescription = "Update a record in a SaaS platform (e.g. update a contact's email address in Hubspot)";
export const checkConnectionToolDescription = "Check if there is an active connection for a provider on Ampersand";
export const createInstallationToolDescription = "Create a new installation for a provider on Ampersand";
export const checkInstallationToolDescription = "Check if an installation exists for a provider on Ampersand";
export const oauthToolDescription = "Connect to a SaaS provider using the Ampersand OAuth flow and obtain a connection URL";
export const sendRequestToolDescription = "Call provider APIs via the Ampersand sendRequest tool";

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

// Schema for check connection input
export const checkConnectionInputSchema = z.object({
  provider: providerSchema,
});

// Schema for check connection output
export const checkConnectionOutputSchema = z.object({
  found: z.boolean(),
  connectionId: z.string().optional(),
  groupRef: z.string().optional(),
  data: z.any().optional(),
});

// Schema for create installation input
export const createInstallationInputSchema = z.object({
  provider: providerSchema,
  connectionId: z.string(),
  groupRef: z.string(),
});

export const createInstallationOutputSchema = z.object({
  created: z.boolean(),
  installationId: z.string().optional(),
  data: z.any().optional(),
});

// Schema for check installation input
export const checkInstallationInputSchema = z.object({
  provider: providerSchema,
});

export const checkInstallationOutputSchema = z.object({
  found: z.boolean(),
  installationId: z.string().optional(),
  data: z.any().optional(),
});

// OAuth tool schemas
export const oauthInputSchema = z.object({
  query: z.string(),
  provider: providerSchema,
  groupRef: z.string().optional().describe("The group reference for Ampersand"),
  consumerRef: z.string().optional().describe("The consumer reference for Ampersand"),
});

export const oauthOutputSchema = z.object({
  url: z.string(),
});

// Proxy call tool schemas
export const sendRequestInputSchema = z.object({
  provider: providerSchema,
  body: z.record(z.any()).optional().describe("Body of the request"),
  suffix: z.string().describe("Suffix of the request URL. without the leading slash."),
  method: z.string().describe("HTTP method to use"),
  headers: z.record(z.string()).optional().describe("Headers to send with the request"),
  installationId: z.string().optional().describe("The installation ID to use for the API call."),
});

export const sendRequestOutputSchema = z.object({
  status: z.number(),
  response: z.any(),
});

// Infered type definitions
export type AssociationsType = z.infer<typeof associationsSchema>;
export type ProviderType = z.infer<typeof providerSchema>;
export type CreateActionType = z.infer<typeof createActionSchema>;
export type UpdateActionType = z.infer<typeof updateActionSchema>;
export type WriteOutputType = z.infer<typeof writeOutputSchema>;
export type CheckConnectionInputType = z.infer<typeof checkConnectionInputSchema>;
export type CheckConnectionOutputType = z.infer<typeof checkConnectionOutputSchema>;
export type CreateInstallationInputType = z.infer<typeof createInstallationInputSchema>;
export type CreateInstallationOutputType = z.infer<typeof createInstallationOutputSchema>;
export type CheckInstallationInputType = z.infer<typeof checkInstallationInputSchema>;
export type CheckInstallationOutputType = z.infer<typeof checkInstallationOutputSchema>;
export type OAuthInputType = z.infer<typeof oauthInputSchema>;
export type OAuthOutputType = z.infer<typeof oauthOutputSchema>;
export type SendRequestInputType = z.infer<typeof sendRequestInputSchema>;
export type SendRequestOutputType = z.infer<typeof sendRequestOutputSchema>; 