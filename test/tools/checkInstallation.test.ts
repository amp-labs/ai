/**
 * E2E Test: checkInstallation Tool
 *
 * Tests the checkInstallation tool which checks if there is an active
 * installation for a provider on Ampersand.
 *
 * Prerequisites: None (read-only operation)
 * Uses OpenAI: Yes (minimal usage)
 */

import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';
import { checkInstallationHelper } from '../helpers/ampersand-tools';

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
      log.info('Checking Salesforce installation...');

      const result = await checkInstallationHelper(SALESFORCE_PROVIDER);

      assert('found' in result, 'Result should have "found" field');
      assert(typeof result.found === 'boolean', '"found" should be boolean');

      log.success(`Installation found: ${result.found}`);
      if (result.found) {
        log.info(`Installation ID: ${result.installationId}`);
      }
    },
  );

  // Test 2: Check multiple providers
  await runner.test(
    'checkInstallation: Check HubSpot installation',
    async () => {
      log.info('Checking HubSpot installation...');

      const result = await checkInstallationHelper(HUBSPOT_PROVIDER);

      assert('found' in result, 'Result should have "found" field');

      log.success(`HubSpot installation found: ${result.found}`);
    },
  );

  runner.summarize();
}

main();
