/**
 * E2E Test: createInstallation Tool
 *
 * Tests the createInstallation tool which creates a new installation
 * for a provider on Ampersand.
 *
 * Prerequisites: An active connection must exist for the provider
 * Uses OpenAI: Yes (minimal usage)
 */

import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';
import {
  checkConnectionHelper,
  checkInstallationHelper,
  createInstallationHelper,
} from '../helpers/ampersand-tools';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: createInstallation');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  const PROVIDER = 'salesforce';

  // Test 1: Create installation for Salesforce
  await runner.test(
    'createInstallation: Create installation for Salesforce',
    async () => {
      // Step 1: Check for existing connection
      log.info('Checking for existing Salesforce connection...');
      const connectionData = await checkConnectionHelper(PROVIDER);

      if (!connectionData.found) {
        log.error('No Salesforce connection found');
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

      // Step 2: Check if installation already exists
      log.info('Checking if installation already exists...');
      const installationData = await checkInstallationHelper(PROVIDER);

      if (installationData.found) {
        log.warn('Installation already exists - skipping creation');
        log.info(
          `Existing installation ID: ${installationData.installationId}`,
        );
        log.success(
          'Test passed: Installation exists (either pre-existing or previously created)',
        );
        log.info(
          'To test creation, delete the installation from Ampersand Dashboard and run again',
        );
        return;
      }

      // Step 3: Create new installation
      const connectionId = connectionData.connectionId;
      const groupRef = connectionData.groupRef;

      log.info(
        `Creating Salesforce installation with connectionId: ${connectionId}, groupRef: ${groupRef}...`,
      );

      const result = await createInstallationHelper(
        PROVIDER,
        connectionId,
        groupRef,
      );

      assert('created' in result, 'Result should have "created" field');
      assert(
        typeof result.created === 'boolean',
        '"created" should be boolean',
      );

      log.success(`Installation created: ${result.created}`);
      if (result.installationId) {
        log.info(`Installation ID: ${result.installationId}`);
        log.info(
          'To run the test again, delete installation from Ampersand Dashboard',
        );
      }
    },
  );

  runner.summarize();
}

main();
