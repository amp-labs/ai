/**
 * E2E Test: checkInstallation Tool
 *
 * Tests the checkInstallation tool which checks if there is an active
 * installation for a provider on Ampersand.
 *
 * Prerequisites: None (read-only operation)
 * Uses OpenAI: Yes (minimal usage)
 */

import { generateText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { checkInstallation } from '@amp-labs/ai/aisdk';
import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: checkInstallation');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  const SALESFORCE_PROVIDER = 'salesforce';
  const HUBSPOT_PROVIDER = 'hubspot';

  // Test 1: Check installation exists
  await runner.test(
    'checkInstallation: Verify Salesforce installation exists',
    async () => {
      const prompt = `Use checkInstallation to check if there is an active installation for provider "${SALESFORCE_PROVIDER}"`;

      log.info('Calling AI to check Salesforce installation...');

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { checkInstallation },
        stopWhen: stepCountIs(5),
        prompt,
      });

      log.debug(`AI Response: ${result.text}`);

      // Verify tool was called
      const toolCalls = result.steps[0]?.toolCalls;
      assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');
      assert(
        toolCalls[0].toolName === 'checkInstallation',
        'Should call checkInstallation tool',
      );

      // Verify result structure
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

      log.success(`Installation found: ${toolResult.found}`);
      if (toolResult.found) {
        log.info(`Installation ID: ${toolResult.installationId}`);
      }
    },
  );

  // Test 2: Check multiple providers
  await runner.test(
    'checkInstallation: Check HubSpot installation',
    async () => {
      const prompt = `Use checkInstallation to check if there is an active installation for provider "${HUBSPOT_PROVIDER}"`;

      log.info('Calling AI to check HubSpot installation...');

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { checkInstallation },
        stopWhen: stepCountIs(5),
        prompt,
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

      log.success(`HubSpot installation found: ${toolResult.found}`);
    },
  );

  runner.summarize();
}

main();
