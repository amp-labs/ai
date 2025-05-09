import { createTool } from "@mastra/core";
import { 
  associationsSchema, 
  providerSchema, 
  createActionSchema, 
  updateActionSchema, 
  writeOutputSchema,
  executeAmpersandWrite,
  createRecordToolDescription,
  updateRecordToolDescription
} from "./common";

/**
 * This file contains shared schemas and tools for integrating with Ampersand
 * from a Mastra-based project. These components can be reused across different
 * framework implementations.
 */

// Example implementation for mastra's createActionTool
export const createRecordTool = createTool({
  id: "create-record",
  description: createRecordToolDescription,
  inputSchema: createActionSchema,
  outputSchema: writeOutputSchema,
  execute: async ({ context }) => {
    const { provider, objectName, type, record, groupRef, associations } = context;
    
    // Use the common function from mcp-server
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      groupRef,
      associations,
    });
    
    // Return in the format expected by mastra
    return {
      status: result.status,
      recordId: result.recordId,
      response: result.response,
    };
  },
});

// Example implementation for mastra's updateActionTool 
export const updateRecordTool = createTool({
  id: "update-record",
  description: updateRecordToolDescription,
  inputSchema: updateActionSchema,
  outputSchema: writeOutputSchema,
  execute: async ({ context }) => {
    const { provider, objectName, type, record, groupRef, associations } = context;
    
    // Use the common function from mcp-server
    const result = await executeAmpersandWrite({
      objectName,
      type,
      record,
      groupRef,
      associations,
    });
    
    // Return in the format expected by mastra
    return {
      status: result.status,
      recordId: result.recordId,
      response: result.response,
    };
  },
}); 

