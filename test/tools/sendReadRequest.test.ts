/**
 * E2E Test: sendReadRequest Tool
 *
 * Tests the sendReadRequest tool which makes authenticated GET requests to providers.
 *
 * Prerequisites: Active connection and installation
 * Uses OpenAI: Yes
 */

import { generateText, stepCountIs } from 'ai';
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

  const SALESFORCE_ENDPOINT = `services/data/v56.0/sobjects`;
  const INSTALLATION_ID = '60e8efe5-aa48-4c3d-8e83-1755dffc24f0'; // should fetch from check installation tool

  // Test 1: Read Salesforce objects
  await runner.test(
    'sendReadRequest: Fetch Salesforce object metadata',
    async () => {
      const prompt = `Use sendReadRequest to fetch the list of available objects from Salesforce API endpoint ${SALESFORCE_ENDPOINT} and installation ID ${INSTALLATION_ID}`;

      log.info('Calling AI to fetch Salesforce object metadata...');

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { sendReadRequest },
        stopWhen: stepCountIs(5),
        prompt,
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
  // await runner.test(
  //   'sendReadRequest: Fetch specific Contact details',
  //   async () => {
  //     log.info('Calling AI to fetch Contact details...');
  //     log.warn(
  //       'NOTE: You need to provide a valid contact ID for this test to work',
  //     );

  //     const result = await generateText({
  //       model: openai('gpt-4o-mini'),
  //       tools: { sendReadRequest },
  //       maxSteps: 5,
  //       prompt:
  //         'Use sendReadRequest to get details of the contact with name "John Doe" from Salesforce',
  //     });

  //     const toolCalls = result.steps[0]?.toolCalls;
  //     assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');

  //     // Access tool results (AI SDK v4+ structure)
  //     const toolResults = result.steps[0]?.toolResults;
  //     assert(
  //       toolResults && toolResults.length > 0,
  //       'Tool should have returned results',
  //     );

  //     const toolResult = toolResults[0].result;
  //     assert('status' in toolResult, 'Result should have "status" field');

  //     log.success(`Contact details fetched with status: ${toolResult.status}`);
  //     log.info(`Contact details: ${JSON.stringify(toolResult.response, null, 2)}`);
  //   },
  // );

  runner.summarize();
}

main();
