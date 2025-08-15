import {
  createRecord as createRecordToolMastra,
  updateRecord as updateRecordToolMastra,
} from '@amp-labs/ai/mastra';
import {
  createRecord as createRecordToolAISDK,
  updateRecord as updateRecordToolAISDK,
} from '@amp-labs/ai/aisdk';

// Use in your AI agent configuration
export const toolsVercel = [createRecordToolAISDK, updateRecordToolAISDK];

// Use in your Mastra workflow
export const toolsMastra = [createRecordToolMastra, updateRecordToolMastra];
