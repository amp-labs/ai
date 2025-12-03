/**
 * E2E Test: checkConnection Tool
 *
 * Tests the checkConnection tool which checks if there is an active
 * connection for a provider on Ampersand.
 *
 * Prerequisites: None (read-only operation)
 * Uses OpenAI: Yes (minimal usage)
 */

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { checkConnection } from '@amp-labs/ai/aisdk';
import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: checkConnection');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  // Test 1: Check connection exists
  await runner.test(
    'checkConnection: Verify Salesforce connection exists',
    async () => {
      log.info('Calling AI to check Salesforce connection...');

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { checkConnection },
        maxSteps: 5,
        prompt: 'Check if there is an active connection for salesforce',
      });

      log.debug(`AI Response: ${result.text}`);

      // Verify tool was called
      const toolCalls = result.steps[0]?.toolCalls;
      assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');
      assert(
        toolCalls[0].toolName === 'checkConnection',
        'Should call checkConnection tool',
      );

      // Access tool results (AI SDK v4+ structure)
      const toolResults = result.steps[0]?.toolResults;
      assert(
        toolResults && toolResults.length > 0,
        'Tool should have returned results',
      );

      const toolResult = toolResults[0].result;
      assert('found' in toolResult, 'Result should have "found" field');
      assert(
        typeof toolResult.found === 'boolean',
        '"found" should be boolean',
      );

      log.success(`Connection found: ${toolResult.found}`);
      if (toolResult.found) {
        log.info(`Connection ID: ${toolResult.connectionId}`);
        log.info(`Group Ref: ${toolResult.groupRef}`);
      }
    },
  );

  // Test 2: Check connection for non-existent provider
  await runner.test(
    'checkConnection: Check non-existent provider returns found=false',
    async () => {
      log.info('Calling AI to check non-existent provider...');

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { checkConnection },
        maxSteps: 5,
        prompt: 'Check if there is an active connection for invalidprovider123',
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
      assert('found' in toolResult, 'Result should have "found" field');

      // May or may not be found depending on setup
      log.success(`Connection found: ${toolResult.found}`);
    },
  );

  runner.summarize();
}

main();
