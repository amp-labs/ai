import { createActionTool, updateActionTool } from "@amp-labs/ai/mastra";
import { createRecordTool, updateRecordTool } from "@amp-labs/ai/aisdk";  

// Use in your AI agent configuration
const toolsVercel = [createRecordTool, updateRecordTool];

// Use in your Mastra workflow
const toolsMastra = [createActionTool, updateActionTool];