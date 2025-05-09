import { tool } from "ai";
import { 
  createActionSchema, 
  updateActionSchema,
  executeAmpersandWrite,
  CreateParams,
  UpdateParams,
  createRecordToolDescription,
  updateRecordToolDescription
} from "./common";

/**
 * Vercel AI SDK compatible version of the Ampersand create record tool
 * 
 * Note: You'll need to install the 'ai' package:
 * npm install ai
 */
export const createRecordTool = tool({
  description: createRecordToolDescription,
  parameters: createActionSchema,
  execute: async ({ provider, objectName, type, record, groupRef, associations }: CreateParams) => {
    
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
  description: updateRecordToolDescription,
  parameters: updateActionSchema,
  execute: async ({ provider, objectName, type, record, groupRef, associations }: UpdateParams) => {
    
    // Use the common function from mcp-server
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      groupRef: groupRef,
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

