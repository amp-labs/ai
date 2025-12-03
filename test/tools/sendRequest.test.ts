/**
 * E2E Test: sendRequest Tool
 *
 * Tests the sendRequest tool which makes authenticated API calls to providers.
 *
 * Prerequisites: Active connection and installation
 * Uses OpenAI: Yes
 */

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { sendRequest } from '@amp-labs/ai/aisdk';
import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: sendRequest');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  // Test 1: GET request to fetch Salesforce objects
  await runner.test(
    'sendRequest: GET request to list Salesforce objects',
    async () => {
      log.info('Calling AI to make GET request to Salesforce...');

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { sendRequest },
        maxSteps: 5,
        prompt:
          'Make a GET request to Salesforce API endpoint v60.0/sobjects to list available objects',
      });

      log.debug(`AI Response: ${result.text}`);

      // Verify tool was called
      const toolCalls = result.steps[0]?.toolCalls;
      assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');
      assert(
        toolCalls[0].toolName === 'sendRequest',
        'Should call sendRequest tool',
      );

      // Verify result structure
      // Access tool results (AI SDK v4+ structure)
      const toolResults = result.steps[0]?.toolResults;
      assert(
        toolResults && toolResults.length > 0,
        'Tool should have returned results',
      );

      const toolResult = toolResults[0].result;
      assert('status' in toolResult, 'Result should have "status" field');
      assert('response' in toolResult, 'Result should have "response" field');
      assert(toolResult.status === 200, 'GET request should return 200 status');

      log.success(`Request successful with status: ${toolResult.status}`);
    },
  );

  // Test 2: POST request to create a record
  await runner.test(
    'sendRequest: POST request to create Salesforce Contact',
    async () => {
      log.info('Calling AI to make POST request to Salesforce...');

      const result = await generateText({
        model: openai('o3-mini'),
        tools: { sendRequest },
        maxSteps: 5,
        prompt:
          'Make a POST request to Salesforce endpoint v60.0/sobjects/Contact with body containing FirstName "API" and LastName "Test"',
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
      assert('status' in toolResult, 'Result should have "status" field');
      assert(
        toolResult.status === 201 || toolResult.status === 200,
        'POST request should return 200/201 status',
      );

      log.success(`Record created via API with status: ${toolResult.status}`);
    },
  );

  runner.summarize();
}

main();
