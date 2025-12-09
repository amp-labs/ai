/**
 * E2E Test: startOAuth Tool
 *
 * Tests the startOAuth tool which initiates an OAuth flow for a provider.
 *
 * Prerequisites: Valid API key, project ID, and providerWorkspaceRef
 * Uses OpenAI: Yes (minimal usage)
 *
 * NOTE: This test requires a providerWorkspaceRef which may not be available
 * for all providers. The test may fail if the provider is not properly configured.
 */

import { generateText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { startOAuth } from '@amp-labs/ai/aisdk';
import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: startOAuth');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  // Test 1: Get OAuth URL for Salesforce
  await runner.test('startOAuth: Get OAuth URL for Salesforce', async () => {
    log.info('Calling AI to get Salesforce OAuth URL...');

    const groupRef = process.env.AMPERSAND_GROUP_REF;
    // const today = new Date().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
    const consumerRef = process.env.AMPERSAND_CONSUMER_REF;
    // Note: Salesforce requires providerWorkspaceRef (subdomain)
    // This should be set in .env as SALESFORCE_SUBDOMAIN
    const salesforceSubdomain = process.env.SALESFORCE_SUBDOMAIN;

    if (!salesforceSubdomain) {
      log.warn('SALESFORCE_SUBDOMAIN not set in environment variables');
      log.info(
        'Attempting without providerWorkspaceRef - may fail if required',
      );
    }

    const prompt = salesforceSubdomain
      ? `Get the OAuth URL to connect to Salesforce for group "${groupRef}" and consumer "${consumerRef}". Use providerWorkspaceRef "${salesforceSubdomain}" (the Salesforce subdomain).`
      : `Get the OAuth URL to connect to Salesforce for group "${groupRef}" and consumer "${consumerRef}".`;

    log.info(
      `Using groupRef: ${groupRef}, consumerRef: ${consumerRef}, subdomain: ${salesforceSubdomain || 'none'}`,
    );

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      tools: { startOAuth },
      stopWhen: stepCountIs(5),
      prompt,
    });

    log.debug(`AI Response: ${result.text}`);

    // Verify tool was called (AI SDK v5 structure)
    const firstStep = result.steps[0];
    assert(!!firstStep, 'Should have at least one step');

    const content = firstStep.content;
    assert(content && content.length > 0, 'Step should have content');

    // Find tool-call in content
    const toolCalls = content.filter((item) => item.type === 'tool-call');
    assert(toolCalls.length > 0, 'Tool should have been called');
    assert(
      toolCalls[0].toolName === 'startOAuth',
      'Should call startOAuth tool',
    );

    // Find tool-result in content (AI SDK v5 structure)
    const toolResults = content.filter((item) => item.type === 'tool-result');
    assert(
      toolResults && toolResults.length > 0,
      'Tool should have returned results',
    );

    const toolResult = toolResults[0].output;
    assert('url' in toolResult, 'Result should have "url" field');
    assert(typeof toolResult.url === 'string', '"url" should be string');
    assert(toolResult.url.startsWith('http'), '"url" should be valid URL');

    log.success(`OAuth URL generated: ${toolResult.url.substring(0, 50)}...`);
  });

  // Test 2: Get OAuth URL for HubSpot
  // await runner.test('startOAuth: Get OAuth URL for HubSpot', async () => {
  //   log.info('Calling AI to get HubSpot OAuth URL...');

  //   const groupRef = process.env.AMPERSAND_GROUP_REF;
  //   const consumerRef = process.env.AMPERSAND_CONSUMER_REF;
  //   const result = await generateText({
  //     model: openai('gpt-4o-mini'),
  //     tools: { startOAuth },
  //     stopWhen: stepCountIs(5),
  //     prompt: `Get the OAuth URL to connect to HubSpot for group "${groupRef}" and consumer "${consumerRef}".`,
  //   });

  //   // Access tool results (AI SDK v5 structure)
  //   const firstStep = result.steps[0];
  //   assert(!!firstStep, 'Should have at least one step');

  //   const content = firstStep.content;
  //   assert(content && content.length > 0, 'Step should have content');

  //   const toolCalls = content.filter((item) => item.type === 'tool-call');
  //   assert(toolCalls.length > 0, 'Tool should have been called');

  //   const toolResults = content.filter((item) => item.type === 'tool-result');
  //   assert(
  //     toolResults && toolResults.length > 0,
  //     'Tool should have returned results',
  //   );

  //   const toolResult = toolResults[0].output;
  //   assert('url' in toolResult, 'Result should have "url" field');
  //   assert(toolResult.url.startsWith('http'), '"url" should be valid URL');

  //   log.success(`HubSpot OAuth URL generated`);
  // });

  runner.summarize();
}

main();
