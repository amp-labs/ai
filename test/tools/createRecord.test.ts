/**
 * E2E Test: createRecord Tool
 *
 * Tests the createRecord tool which creates new records in SaaS platforms.
 *
 * Prerequisites: Active connection and installation for the provider
 * Uses OpenAI: Yes
 * NOTE: This test creates real records - may need cleanup
 */

import { generateText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createRecord } from '@amp-labs/ai/aisdk';
import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: createRecord');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  const GROUP_REF = process.env.AMPERSAND_GROUP_REF || '';

  // Test 1: Create a Contact in Salesforce
  // NOTE: Commented out by default as it creates actual data in Salesforce
  // Uncomment to test createRecord functionality
  await runner.test('createRecord: Create Contact in Salesforce', async () => {
    const prompt = `Use the createRecord tool with these EXACT parameters (do not modify or interpret them):

objectName: "contact"
type: "create"
record: {"FirstName":"Test User","LastName":"E2E","Email":"teste2e@example.com"}
groupRef: "${GROUP_REF}"

The record parameter MUST be an object with FirstName, LastName, and Email fields. Do not parse or interpret the data - pass it exactly as shown above.`;

    log.info('Calling AI to create a Contact in Salesforce...');
    log.warn('This will create an actual Contact record in Salesforce');

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      tools: { createRecord },
      stopWhen: stepCountIs(5),
      prompt,
    });

    log.debug(`AI Response: ${result.text}`);

    // Verify tool was called
    const toolCalls = result.steps[0]?.toolCalls;
    assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');
    assert(
      toolCalls[0].toolName === 'createRecord',
      'Should call createRecord tool',
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

    log.success(`Record created with ID: ${toolResult.recordId}`);
    log.info(`Status: ${toolResult.status}`);
  });

  // Test 2: Create a Lead in Salesforce
  // NOTE: Commented out by default as it creates actual data in Salesforce
  // Uncomment to test createRecord functionality
  // await runner.test('createRecord: Create Lead in Salesforce', async () => {
  //   const leadData = {
  //     Company: 'Test Company E2E',
  //     LastName: 'Smith',
  //     Email: 'testlead@example.com',
  //   };
  //
  //   const prompt = `Use createRecord to create a new Lead in Salesforce with these exact parameters:
  // - objectName: "lead"
  // - type: "create"
  // - record: ${JSON.stringify(leadData)}
  // - groupRef: "${GROUP_REF}"
  //
  // Make sure to use the exact field names provided.`;
  //
  //   log.info('Calling AI to create a Lead in Salesforce...');
  //   log.warn('This will create an actual Lead record in Salesforce');
  //
  //   const result = await generateText({
  //     model: openai('gpt-4o-mini'),
  //     tools: { createRecord },
  //     maxSteps: 5,
  //     prompt,
  //   });
  //
  //   const toolCalls = result.steps[0]?.toolCalls;
  //   assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');
  //
  //   // Access tool results (AI SDK v4+ structure)
  //   const toolResults = result.steps[0]?.toolResults;
  //   assert(
  //     toolResults && toolResults.length > 0,
  //     'Tool should have returned results',
  //   );
  //
  //   const toolResult = toolResults[0].result;
  //   assert('recordId' in toolResult, 'Result should have recordId');
  //
  //   log.success(`Lead created with ID: ${toolResult.recordId}`);
  // });

  runner.summarize();
}

main();
