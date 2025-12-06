/**
 * E2E Test: sendRequest Tool
 *
 * Tests the sendRequest tool which makes authenticated API calls to providers.
 *
 * Prerequisites: Active connection and installation
 * Uses OpenAI: Yes
 */

import { generateText, stepCountIs } from 'ai';
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

  const SALESFORCE_ENDPOINT = `services/data/v56.0/sobjects`;
  const INSTALLATION_ID = '60e8efe5-aa48-4c3d-8e83-1755dffc24f0'; // should fetch from check installation tool

  // Test 1: GET request to fetch Salesforce objects
  await runner.test(
    'sendRequest: GET request to list Salesforce objects',
    async () => {
      const prompt = `Use sendRequest to make a GET request using these exact parameters:
- provider: "salesforce"
- endpoint: "${SALESFORCE_ENDPOINT}"
- installationId: "${INSTALLATION_ID}"
- method: "GET"

Do not modify the endpoint path - use it exactly as provided.`;

      log.info('Calling AI to make GET request to Salesforce...');

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { sendRequest },
        stopWhen: stepCountIs(5),
        prompt,
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
  // NOTE: Commented out by default as it creates actual data in Salesforce
  // Uncomment to test POST functionality
  // await runner.test(
  //   'sendRequest: POST request to create Salesforce Contact',
  //   async () => {
  //     const CONTACT_ENDPOINT = `services/data/v56.0/sobjects/Contact`;
  //     const contactData = {
  //       FirstName: 'API',
  //       LastName: 'Test',
  //     };
  //
  //     const prompt = `Use sendRequest to make a POST request to Salesforce endpoint ${CONTACT_ENDPOINT} with installation ID ${INSTALLATION_ID} and request body ${JSON.stringify(contactData)} to create a new contact`;
  //
  //     log.info('Calling AI to make POST request to Salesforce...');
  //     log.warn('This will create an actual Contact record in Salesforce');
  //
  //     const result = await generateText({
  //       model: openai('gpt-4o-mini'),
  //       tools: { sendRequest },
  //       maxSteps: 5,
  //       prompt,
  //     });
  //
  //     const toolCalls = result.steps[0]?.toolCalls;
  //     assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');
  //
  //     // Access tool results (AI SDK v4+ structure)
  //     const toolResults = result.steps[0]?.toolResults;
  //     assert(
  //       toolResults && toolResults.length > 0,
  //       'Tool should have returned results',
  //     );
  //
  //     const toolResult = toolResults[0].result;
  //     assert('status' in toolResult, 'Result should have "status" field');
  //     assert(
  //       toolResult.status === 201 || toolResult.status === 200,
  //       'POST request should return 200/201 status',
  //     );
  //
  //     log.success(`Record created via API with status: ${toolResult.status}`);
  //     if (toolResult.response?.id) {
  //       log.info(`Created Contact ID: ${toolResult.response.id}`);
  //     }
  //   },
  // );

  runner.summarize();
}

main();
