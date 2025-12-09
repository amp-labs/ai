/**
 * Reusable helper functions for Ampersand AI tools
 *
 * These helpers provide a consistent interface for calling Ampersand tools
 * and extracting results using the AI SDK v5 response structure.
 */

import { generateText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  checkConnection,
  checkInstallation,
  createInstallation,
  sendRequest,
  sendReadRequest,
  createRecord,
  updateRecord,
} from '@amp-labs/ai/aisdk';
import { assert } from './test-utils';

/**
 * Extract tool result from AI SDK v5 response
 */
function extractToolResult(result: any, toolName: string) {
  const firstStep = result.steps[0];
  assert(!!firstStep, 'Should have at least one step');

  const content = firstStep.content;
  assert(content && content.length > 0, 'Step should have content');

  // Find tool-call in content
  const toolCalls = content.filter((item: any) => item.type === 'tool-call');
  assert(toolCalls.length > 0, `${toolName} tool should have been called`);
  assert(toolCalls[0].toolName === toolName, `Should call ${toolName} tool`);

  // Find tool-result in content
  const toolResults = content.filter(
    (item: any) => item.type === 'tool-result',
  );
  assert(
    toolResults && toolResults.length > 0,
    `${toolName} should have returned results`,
  );

  return toolResults[0].output;
}

/**
 * Check if a connection exists for a provider
 */
export async function checkConnectionHelper(provider: string) {
  const prompt = `Use checkConnection to check if there is an active connection for provider "${provider}"`;

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    tools: { checkConnection },
    stopWhen: stepCountIs(5),
    prompt,
  });

  return extractToolResult(result, 'checkConnection');
}

/**
 * Check if an installation exists for a provider
 */
export async function checkInstallationHelper(provider: string) {
  const prompt = `Use checkInstallation to check if there is an active installation for provider "${provider}"`;

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    tools: { checkInstallation },
    stopWhen: stepCountIs(5),
    prompt,
  });

  return extractToolResult(result, 'checkInstallation');
}

/**
 * Create a new installation for a provider
 */
export async function createInstallationHelper(
  provider: string,
  connectionId: string,
  groupRef: string,
) {
  const prompt = `Use createInstallation with these exact parameters:
provider: "${provider}"
connectionId: "${connectionId}"
groupRef: "${groupRef}"`;

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    tools: { createInstallation },
    stopWhen: stepCountIs(5),
    prompt,
  });

  return extractToolResult(result, 'createInstallation');
}

/**
 * Send a read request (GET) to a provider
 */
export async function sendReadRequestHelper(
  provider: string,
  endpoint: string,
  installationId: string,
) {
  const prompt = `Use sendReadRequest with these exact parameters:
- provider: "${provider}"
- endpoint: "${endpoint}"
- installationId: "${installationId}"

Do not modify the endpoint path - use it exactly as provided.`;

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    tools: { sendReadRequest },
    stopWhen: stepCountIs(5),
    prompt,
  });

  return extractToolResult(result, 'sendReadRequest');
}

/**
 * Send a request to a provider (any HTTP method)
 */
export async function sendRequestHelper(
  provider: string,
  endpoint: string,
  method: string,
  installationId: string,
  body?: Record<string, any>,
) {
  const bodyParam = body ? `\n- body: ${JSON.stringify(body)}` : '';
  const prompt = `Use sendRequest to make a ${method} request using these exact parameters:
- provider: "${provider}"
- endpoint: "${endpoint}"
- installationId: "${installationId}"
- method: "${method}"${bodyParam}

Do not modify the endpoint path - use it exactly as provided.`;

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    tools: { sendRequest },
    stopWhen: stepCountIs(5),
    prompt,
  });

  return extractToolResult(result, 'sendRequest');
}

/**
 * Create a record in a SaaS platform
 */
export async function createRecordHelper(
  objectName: string,
  record: Record<string, any>,
  groupRef: string,
) {
  const prompt = `Use the createRecord tool with these EXACT parameters (do not modify or interpret them):

objectName: "${objectName}"
type: "create"
record: ${JSON.stringify(record)}
groupRef: "${groupRef}"

The record parameter MUST be passed exactly as shown above. Do not parse or interpret the data.`;

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    tools: { createRecord },
    stopWhen: stepCountIs(5),
    prompt,
  });

  return extractToolResult(result, 'createRecord');
}

/**
 * Update a record in a SaaS platform
 */
export async function updateRecordHelper(
  objectName: string,
  record: Record<string, any>,
  groupRef: string,
) {
  const prompt = `Use the updateRecord tool with these EXACT parameters (do not modify or interpret them):

objectName: "${objectName}"
type: "update"
record: ${JSON.stringify(record)}
groupRef: "${groupRef}"

The record parameter MUST be an object. Do not parse or interpret the data - pass it exactly as shown above.`;

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    tools: { updateRecord },
    stopWhen: stepCountIs(5),
    prompt,
  });

  return extractToolResult(result, 'updateRecord');
}
