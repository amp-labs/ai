/**
 * E2E Test: sendReadRequest Tool
 *
 * Tests the sendReadRequest tool which makes authenticated GET requests to providers.
 *
 * Prerequisites: Active connection and installation
 * Uses OpenAI: Yes
 */

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { sendReadRequest } from '@amp-labs/ai/aisdk';
import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: sendReadRequest');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  // Test 1: Read Salesforce objects
  await runner.test(
    'sendReadRequest: Fetch Salesforce object metadata',
    async () => {
      log.info('Calling AI to fetch Salesforce object metadata...');

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { sendReadRequest },
        maxSteps: 5,
        prompt:
          'Use sendReadRequest to fetch the list of available objects from Salesforce API endpoint v60.0/sobjects',
      });

      log.debug(`AI Response: ${result.text}`);

      // Verify tool was called
      const toolCalls = result.steps[0]?.toolCalls;
      assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');
      assert(
        toolCalls[0].toolName === 'sendReadRequest',
        'Should call sendReadRequest tool',
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
      assert(toolResult.status === 200, 'Request should return 200 status');

      log.success(`Read request successful with status: ${toolResult.status}`);
    },
  );

  // Test 2: Read specific Contact details
  await runner.test(
    'sendReadRequest: Fetch specific Contact details',
    async () => {
      log.info('Calling AI to fetch Contact details...');
      log.warn(
        'NOTE: You need to provide a valid contact ID for this test to work',
      );

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { sendReadRequest },
        maxSteps: 5,
        prompt:
          'Use sendReadRequest to get details of the contact with ID "003xx000004TmiQAAS" from Salesforce endpoint v60.0/sobjects/Contact/003xx000004TmiQAAS',
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

      log.success(`Contact details fetched with status: ${toolResult.status}`);
    },
  );

  runner.summarize();
}

main();
