import { createRecordTool as createRecordToolMastra, updateRecordTool as updateRecordToolMastra } from "@amp-labs/ai/mastra";
import { createRecordTool as createRecordToolAISDK, updateRecordTool as updateRecordToolAISDK } from "@amp-labs/ai/aisdk";  

// Use in your AI agent configuration
const toolsVercel = [createRecordToolAISDK, updateRecordToolAISDK];

// Use in your Mastra workflow
const toolsMastra = [createRecordToolMastra, updateRecordToolMastra];