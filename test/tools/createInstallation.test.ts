/**
 * E2E Test: createInstallation Tool
 *
 * Tests the createInstallation tool which creates a new installation
 * for a provider on Ampersand.
 *
 * Prerequisites: An active connection must exist for the provider
 * Uses OpenAI: Yes (minimal usage)
 */

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  createInstallation,
  checkConnection,
  checkInstallation,
} from '@amp-labs/ai/aisdk';
import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: createInstallation');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  const SALESFORCE_PROVIDER = 'salesforce';

  // Test 1: Create installation for Salesforce
  await runner.test(
    'createInstallation: Create installation for Salesforce',
    async () => {
      log.info('First checking for existing Salesforce connection...');

      // // First, get the connection details
      const checkPrompt = `Use checkConnection to check if there is an active connection for provider "${SALESFORCE_PROVIDER}"`;

      const checkResult = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { checkConnection },
        maxSteps: 5,
        prompt: checkPrompt,
      });

      const checkToolResults = checkResult.steps[0]?.toolResults;
      assert(
        checkToolResults && checkToolResults.length > 0,
        'Check connection should have returned results',
      );

      const connectionData = checkToolResults[0].result;

      // If no connection exists, provide helpful instructions
      if (!connectionData.found) {
        log.warn('No Salesforce connection found');
        log.info('To create a connection:');
        log.info('  1. Run: pnpm test:startOAuth');
        log.info('  2. Complete the OAuth flow in your browser');
        log.info('  3. Then run this test again');
        throw new Error(
          'A Salesforce connection must exist to create an installation. Please run startOAuth first.',
        );
      }

      assert(
        connectionData.connectionId,
        'Connection should have a connectionId',
      );
      assert(connectionData.groupRef, 'Connection should have a groupRef');

      log.success(
        `Found connection: ${connectionData.connectionId}, groupRef: ${connectionData.groupRef}`,
      );
      console.log(
        'Full connection data:',
        JSON.stringify(connectionData, null, 2),
      );

      // // Check if installation already exists
      log.info('Checking if installation already exists...');

      const checkInstPrompt = `Use checkInstallation to check if there is an active installation for provider "${SALESFORCE_PROVIDER}"`;

      const checkInstResult = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { checkInstallation },
        maxSteps: 5,
        prompt: checkInstPrompt,
      });

      const checkInstToolResults = checkInstResult.steps[0]?.toolResults;
      assert(
        checkInstToolResults && checkInstToolResults.length > 0,
        'Check installation should have returned results',
      );

      const installationData = checkInstToolResults[0].result;

      if (installationData.found) {
        log.warn('Installation already exists - skipping creation');
        log.info(
          `Existing installation ID: ${installationData.installationId}`,
        );
        log.success(
          'Test passed: Installation exists (either pre-existing or previously created)',
        );
        log.info(
          'To run the test by creating a new installation, delete installation from Ampersand Dashboard and run the test again',
        );
        return;
      }

      const connectionId = connectionData.connectionId;
      const groupRef = connectionData.groupRef;

      log.debug(`Using connectionId: ${connectionId}`);
      log.debug(`Using environment groupRef: ${groupRef}`);
      log.debug(`Connection data groupRef: ${groupRef}`);

      // Use the connection's groupRef since it's a known valid group
      const createPrompt = `Use createInstallation with these exact parameters:
          provider: "${SALESFORCE_PROVIDER}"
          connectionId: "${connectionId}"
          groupRef: "${groupRef}"`;

      log.info(
        `Creating Salesforce installation with connectionId: ${connectionId}, groupRef: ${groupRef}...`,
      );

      const createResult = await generateText({
        model: openai('gpt-4o-mini'),
        tools: { createInstallation },
        maxSteps: 5,
        prompt: createPrompt,
      });

      log.debug(`AI Response: ${createResult.text}`);

      // Verify tool was called
      const toolCalls = createResult.steps[0]?.toolCalls;
      assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');
      assert(
        toolCalls[0].toolName === 'createInstallation',
        'Should call createInstallation tool',
      );

      // Verify result structure
      const toolResults = createResult.steps[0]?.toolResults;
      assert(
        toolResults && toolResults.length > 0,
        'Tool should have returned results',
      );

      const toolResult = toolResults[0].result;
      assert('created' in toolResult, 'Result should have "created" field');
      assert(
        typeof toolResult.created === 'boolean',
        '"created" should be boolean',
      );

      log.success(`Installation created: ${toolResult.created}`);
      if (toolResult.installationId) {
        log.info(`Installation ID: ${toolResult.installationId}`);
        log.info(
          'To run the test again, delete installation from Ampersand Dashboard and run the test again',
        );
      }
    },
  );

  runner.summarize();
}

main();
