import { tool } from "ai";
import { 
  createActionSchema, 
  updateActionSchema,
  executeAmpersandWrite,
  CreateParams,
  UpdateParams
} from "./common";

/**
 * Vercel AI SDK compatible version of the Ampersand create record tool
 * 
 * Note: You'll need to install the 'ai' package:
 * npm install ai
 */
export const createRecordTool = tool({
  description: "Perform a create operation on a provider (e.g. Salesforce, Hubspot)",
  parameters: createActionSchema,
  execute: async ({ provider, objectName, type, record, groupRef, associations }: CreateParams) => {
    console.log("Calling createRecordTool with Vercel AI SDK");
    
    // Use the common function from mcp-server
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      groupRef,
      associations,
    });
    
    // Return the results (AI SDK doesn't require a specific format)
    return {
      status: result.status,
      recordId: result.recordId,
      response: result.response,
    };
  },
});

/**
 * Vercel AI SDK compatible version of the Ampersand update record tool
 * 
 * Note: You'll need to install the 'ai' package:
 * npm install ai
 */
export const updateRecordTool = tool({
  description: "Perform an update operation on a provider (e.g. Salesforce, Hubspot)",
  parameters: updateActionSchema,
  execute: async ({ provider, objectName, type, record, associations }: UpdateParams) => {
    console.log("Calling updateRecordTool with Vercel AI SDK");
    
    // Use the common function from mcp-server
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      // For the update case, use env var for groupRef
      groupRef: process.env.AMPERSAND_GROUP_REF || "",
      associations,
    });
    
    // Return the results
    return {
      status: result.status,
      recordId: result.recordId,
      response: result.response,
    };
  },
});

