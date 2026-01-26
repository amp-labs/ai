import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { createRecord, updateRecord } from '@amp-labs/ai/aisdk';

// Define the classification tool inline
const classifyQuery = tool({
  description: 'Classify the customer query',
  inputSchema: z.object({
    reasoning: z.string().describe('Brief reasoning for classification'),
    type: z.enum(['general', 'refund', 'technical']).describe('Query type'),
    complexity: z.enum(['simple', 'complex']).describe('Query complexity'),
  }),
  execute: async (input) => input,
});

const systemPrompts = {
  general:
    'You are an expert customer service agent handling general inquiries.',
  refund:
    'You are a customer service agent specializing in refund requests. Follow company policy and collect necessary information.',
  technical:
    'You are a technical support specialist with deep product knowledge. Focus on clear step-by-step troubleshooting.',
} as const;

// Vercel Agent with AI SDK tools by Ampersand
// This is a simple example of how to use the AI SDK tools by Ampersand in a Vercel AI agent.
export async function handleCustomerQuery(query: string) {
  // First step: Classify the query type using tool calling
  const { toolCalls } = await generateText({
    model: openai('gpt-4o'),
    tools: { classifyQuery },
    toolChoice: 'required',
    prompt: `Classify this customer query and call the classifyQuery tool:
    ${query}

    Determine:
    1. Query type (general, refund, or technical)
    2. Complexity (simple or complex)
    3. Brief reasoning for classification`,
  });

  const classification = toolCalls[0]?.args as {
    reasoning: string;
    type: 'general' | 'refund' | 'technical';
    complexity: 'simple' | 'complex';
  };

  // Route based on classification
  // Set model and system prompt based on query type and complexity
  const { text: response } = await generateText({
    model:
      classification.complexity === 'simple'
        ? openai('gpt-4o-mini')
        : openai('o3-mini'),
    system: systemPrompts[classification.type],
    prompt: query,
    tools: {
      // AI SDK tools by Ampersand being used here
      createRecord,
      updateRecord,
    },
  });

  return { response, classification };
}
