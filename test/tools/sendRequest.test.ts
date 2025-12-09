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
  const INSTALLATION_ID = '459021c7-fb49-47d4-b12b-a65dcdb3a4bc'; // should fetch from check installation tool

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

      // Verify tool was called (AI SDK v5 structure)
      const firstStep = result.steps[0];
      assert(!!firstStep, 'Should have at least one step');

      const content = firstStep.content;
      assert(content && content.length > 0, 'Step should have content');

      // Find tool-call in content
      const toolCalls = content.filter((item) => item.type === 'tool-call');
      assert(toolCalls.length > 0, 'Tool should have been called');
      assert(
        toolCalls[0].toolName === 'sendRequest',
        'Should call sendRequest tool',
      );

      // Find tool-result in content (AI SDK v5 structure)
      const toolResults = content.filter((item) => item.type === 'tool-result');
      assert(
        toolResults && toolResults.length > 0,
        'Tool should have returned results',
      );

      const toolResult = toolResults[0].output;
      assert('status' in toolResult, 'Result should have "status" field');
      assert('response' in toolResult, 'Result should have "response" field');
      assert(
        typeof toolResult.status === 'number',
        'Status should be a number',
      );

      log.success(`Request completed with status: ${toolResult.status}`);
      if (toolResult.status !== 200) {
        log.warn(
          `Non-200 status received (likely invalid installation ID in test)`,
        );
      }
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
  //       stopWhen: stepCountIs(5),
  //       prompt,
  //     });
  //
  //     // Access tool results (AI SDK v5 structure)
  //     const firstStep = result.steps[0];
  //     assert(!!firstStep, 'Should have at least one step');
  //
  //     const content = firstStep.content;
  //     assert(content && content.length > 0, 'Step should have content');
  //
  //     const toolCalls = content.filter((item) => item.type === 'tool-call');
  //     assert(toolCalls.length > 0, 'Tool should have been called');
  //
  //     const toolResults = content.filter((item) => item.type === 'tool-result');
  //     assert(
  //       toolResults && toolResults.length > 0,
  //       'Tool should have returned results',
  //     );
  //
  //     const toolResult = toolResults[0].output;
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
