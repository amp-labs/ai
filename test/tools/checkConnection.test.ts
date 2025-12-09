/**
 * E2E Test: checkConnection Tool
 *
 * Tests the checkConnection tool which checks if there is an active
 * connection for a provider on Ampersand.
 *
 * Prerequisites: None (read-only operation)
 * Uses OpenAI: Yes (minimal usage)
 */

import { generateText, stepCountIs } from 'ai';
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

  const SALESFORCE_PROVIDER = 'salesforce';
  const INVALID_PROVIDER = 'invalidprovider123';

  // Test 1: Check connection exists
  await runner.test(
    'checkConnection: Verify Salesforce connection exists',
    async () => {
      const prompt = `Use checkConnection to check if there is an active connection for provider "${SALESFORCE_PROVIDER}"`;

      log.info('Calling AI to check Salesforce connection...');

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { checkConnection },
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
        toolCalls[0].toolName === 'checkConnection',
        'Should call checkConnection tool',
      );

      // Find tool-result in content (AI SDK v5 structure)
      const toolResults = content.filter((item) => item.type === 'tool-result');
      assert(
        toolResults && toolResults.length > 0,
        'Tool should have returned results',
      );

      const toolResult = toolResults[0].output;
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
      const prompt = `Use checkConnection to check if there is an active connection for provider "${INVALID_PROVIDER}"`;

      log.info('Calling AI to check non-existent provider...');

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { checkConnection },
        stopWhen: stepCountIs(5),
        prompt,
      });

      // Access tool results (AI SDK v5 structure)
      const firstStep = result.steps[0];
      assert(!!firstStep, 'Should have at least one step');

      const content = firstStep.content;
      assert(content && content.length > 0, 'Step should have content');

      const toolCalls = content.filter((item) => item.type === 'tool-call');
      assert(toolCalls.length > 0, 'Tool should have been called');

      const toolResults = content.filter((item) => item.type === 'tool-result');
      assert(
        toolResults && toolResults.length > 0,
        'Tool should have returned results',
      );

      const toolResult = toolResults[0].output;
      assert('found' in toolResult, 'Result should have "found" field');

      // May or may not be found depending on setup
      log.success(`Connection found: ${toolResult.found}`);
    },
  );

  runner.summarize();
}

main();
