/**
 * E2E Test: startOAuth Tool
 *
 * Tests the startOAuth tool which initiates an OAuth flow for a provider.
 *
 * Prerequisites: Valid API key and project ID
 * Uses OpenAI: Yes (minimal usage)
 */

import { generateText } from 'ai';
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

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      tools: { startOAuth },
      maxSteps: 5,
      prompt: 'Get the OAuth URL to connect to salesforce',
    });

    log.debug(`AI Response: ${result.text}`);

    // Verify tool was called
    const toolCalls = result.steps[0]?.toolCalls;
    assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');
    assert(
      toolCalls[0].toolName === 'startOAuth',
      'Should call startOAuth tool',
    );

    // Verify result structure
    // Access tool results (AI SDK v4+ structure)
    const toolResults = result.steps[0]?.toolResults;
    assert(
      toolResults && toolResults.length > 0,
      'Tool should have returned results',
    );

    const toolResult = toolResults[0].result;
    assert('url' in toolResult, 'Result should have "url" field');
    assert(typeof toolResult.url === 'string', '"url" should be string');
    assert(toolResult.url.startsWith('http'), '"url" should be valid URL');

    log.success(`OAuth URL generated: ${toolResult.url.substring(0, 50)}...`);
  });

  // Test 2: Get OAuth URL for HubSpot
  await runner.test('startOAuth: Get OAuth URL for HubSpot', async () => {
    log.info('Calling AI to get HubSpot OAuth URL...');

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      tools: { startOAuth },
      maxSteps: 5,
      prompt: 'Generate an OAuth URL for hubspot',
    });

    const toolCalls = result.steps[0]?.toolCalls;
    assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');

    // Access tool results (AI SDK v4+ structure)
    const toolResults = result.steps[0]?.toolResults;
    assert(
      toolResults && toolResults.length > 0,
      'Tool should have returned results',
    );

    const toolResult = toolResults[0].result;
    assert('url' in toolResult, 'Result should have "url" field');
    assert(toolResult.url.startsWith('http'), '"url" should be valid URL');

    log.success(`HubSpot OAuth URL generated`);
  });

  runner.summarize();
}

main();
