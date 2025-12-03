/**
 * E2E Test: updateRecord Tool
 *
 * Tests the updateRecord tool which updates existing records in SaaS platforms.
 *
 * Prerequisites: Active connection, installation, and existing record to update
 * Uses OpenAI: Yes
 * NOTE: This test modifies real records
 */

import { generateText } from 'ai';
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

  // Test 1: Update a Contact in Salesforce
  await runner.test(
    'updateRecord: Update Contact email in Salesforce',
    async () => {
      log.info('Calling AI to update a Contact in Salesforce...');
      log.warn(
        'NOTE: You need to provide a valid contact ID for this test to work',
      );

      const result = await generateText({
        model: openai('o3-mini'),
        tools: { updateRecord },
        maxSteps: 5,
        prompt:
          'Update the contact with ID "003xx000004TmiQAAS" in Salesforce to change the email to "updated@example.com"',
      });

      log.debug(`AI Response: ${result.text}`);

      // Verify tool was called
      const toolCalls = result.steps[0]?.toolCalls;
      assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');
      assert(
        toolCalls[0].toolName === 'updateRecord',
        'Should call updateRecord tool',
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
      assert('recordId' in toolResult, 'Result should have "recordId" field');

      log.success(`Record updated: ${toolResult.recordId}`);
      log.info(`Status: ${toolResult.status}`);
    },
  );

  runner.summarize();
}

main();
