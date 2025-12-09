/**
 * E2E Test: updateRecord Tool
 *
 * Tests the updateRecord tool which updates existing records in SaaS platforms.
 *
 * Prerequisites: Active connection, installation, and existing record to update
 * Uses OpenAI: Yes
 * NOTE: This test modifies real records
 */

import { generateText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { updateRecord } from '@amp-labs/ai/aisdk';
import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: updateRecord');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  const GROUP_REF = process.env.AMPERSAND_GROUP_REF || '';
  const CONTACT_ID = '003Dp00000Sy9SOIAZ'; // ID from createRecord test - update this with your test contact ID

  // Test 1: Update a Contact in Salesforce
  await runner.test(
    'updateRecord: Update Contact email in Salesforce',
    async () => {
      const prompt = `Use the updateRecord tool with these EXACT parameters (do not modify or interpret them):

objectName: "contact"
type: "update"
record: {"id":"${CONTACT_ID}","Email":"updated-e2e@example.com","Phone":"555-1234"}
groupRef: "${GROUP_REF}"

The record parameter MUST be an object with id, Email, and Phone fields. Do not parse or interpret the data - pass it exactly as shown above.`;

      log.info('Calling AI to update a Contact in Salesforce...');
      log.warn(`This will update Contact ${CONTACT_ID} in Salesforce`);

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { updateRecord },
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
        toolCalls[0].toolName === 'updateRecord',
        'Should call updateRecord tool',
      );

      // Find tool-result in content (AI SDK v5 structure)
      const toolResults = content.filter((item) => item.type === 'tool-result');
      console.log(
        '[Ampersand] Tool results:',
        JSON.stringify(toolResults, null, 2),
      );
      assert(
        toolResults && toolResults.length > 0,
        'Tool should have returned results',
      );

      const toolResult = toolResults[0].output;
      assert('status' in toolResult, 'Result should have "status" field');
      assert('recordId' in toolResult, 'Result should have "recordId" field');

      log.success(`Record updated: ${toolResult.recordId}`);
      log.info(`Status: ${toolResult.status}`);
    },
  );

  runner.summarize();
}

main();
