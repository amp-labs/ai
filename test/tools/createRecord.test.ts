/**
 * E2E Test: createRecord Tool
 *
 * Tests the createRecord tool which creates new records in SaaS platforms.
 *
 * Prerequisites: Active connection and installation for the provider
 * Uses OpenAI: Yes
 * NOTE: This test creates real records - may need cleanup
 */

import { generateText } from 'ai';
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

  // Test 1: Create a Contact in Salesforce
  await runner.test('createRecord: Create Contact in Salesforce', async () => {
    log.info('Calling AI to create a Contact in Salesforce...');

    const result = await generateText({
      model: openai('o3-mini'),
      tools: { createRecord },
      maxSteps: 5,
      prompt:
        'Create a new contact in Salesforce with name "Test User E2E" and email "teste2e@example.com"',
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
  await runner.test('createRecord: Create Lead in Salesforce', async () => {
    log.info('Calling AI to create a Lead in Salesforce...');

    const result = await generateText({
      model: openai('o3-mini'),
      tools: { createRecord },
      maxSteps: 5,
      prompt:
        'Create a new lead in Salesforce with company "Test Company E2E", last name "Smith", and email "testlead@example.com"',
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
    assert('recordId' in toolResult, 'Result should have recordId');

    log.success(`Lead created with ID: ${toolResult.recordId}`);
  });

  runner.summarize();
}

main();
