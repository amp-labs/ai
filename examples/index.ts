import {
  createRecordTool as createRecordToolMastra,
  updateRecordTool as updateRecordToolMastra,
} from '@amp-labs/ai/mastra';
import {
  createRecordTool as createRecordToolAISDK,
  updateRecordTool as updateRecordToolAISDK,
} from '@amp-labs/ai/aisdk';

// Use in your AI agent configuration
export const toolsVercel = [createRecordToolAISDK, updateRecordToolAISDK];

// Use in your Mastra workflow
export const toolsMastra = [createRecordToolMastra, updateRecordToolMastra];
