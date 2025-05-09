import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { createRecordTool, updateRecordTool } from "@amp-labs/ai/aisdk";  
import { createActionTool, updateActionTool } from "@amp-labs/ai/mastra";
 

// Mastra Agent with AI SDK tools 
export const aiSDKToolsAgent: Agent = new Agent({
  name: "AI SDK Tools Agent",
  instructions:
    "You can use tools defined in AI SDK.",
  model: openai("gpt-4o-mini"),
  tools: {
    createRecordTool,
    updateRecordTool,
  },
});



// Mastra Agent with Mastra tools 
export const mastraToolsAgent: Agent = new Agent({
  name: "Mastra Tools Agent",
  instructions:
    "You can use tools defined in Mastra.",
  model: openai("gpt-4o-mini"),
  tools: {
    createActionTool,
    updateActionTool,
  },
});
