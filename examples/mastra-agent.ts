import { MCPClient } from '@mastra/mcp';
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import {
  createRecordTool as createRecordToolAISDK,
  updateRecordTool as updateRecordToolAISDK,
} from '@amp-labs/ai/aisdk';
import { createRecordTool, updateRecordTool } from '@amp-labs/ai/mastra';

// Mastra Agent with AI SDK tools
export const aiSDKToolsAgent: Agent = new Agent({
  name: 'AI SDK Tools Agent',
  instructions: 'You can use tools defined in AI SDK.',
  model: openai('gpt-4o-mini'),
  tools: {
    createRecordToolAISDK,
    updateRecordToolAISDK,
  },
});

// Mastra Agent with Mastra tools
export const mastraToolsAgent: Agent = new Agent({
  name: 'Mastra Tools Agent',
  instructions: 'You can use tools defined in Mastra.',
  model: openai('gpt-4o-mini'),
  tools: {
    createRecordTool,
    updateRecordTool,
  },
});

// MCPClient with Ampersand MCP
export const mcp = new MCPClient({
  servers: {
    filesystem: {
      command: 'npx',
      args: [
        '-y',
        '@amp-labs/mcp-server@latest',
        '--transport',
        'stdio',
        '--project',
        process.env.AMPERSAND_PROJECT_ID || '',
        '--integrationName',
        process.env.AMPERSAND_INTEGRATION_NAME || '',
        '--groupRef',
        process.env.AMPERSAND_GROUP_REF || '',
      ],
      env: {
        AMPERSAND_API_KEY: process.env.AMPERSAND_API_KEY || '',
      },
    },
  },
});

// Mastra Agent with Ampersand MCP tools
export const mcpToolsAgent: Agent = new Agent({
  name: 'MCP Tools Agent',
  instructions: 'You can use tools defined in MCP.',
  model: openai('gpt-4o-mini'),
  tools: await mcp.getTools(),
});
