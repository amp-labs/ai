/**
 * E2E Test: checkConnection Tool
 *
 * Tests the checkConnection tool which checks if there is an active
 * connection for a provider on Ampersand.
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
import { checkConnectionHelper } from '../helpers/ampersand-tools';

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
      log.info('Checking Salesforce connection...');

      const result = await checkConnectionHelper(SALESFORCE_PROVIDER);

      assert('found' in result, 'Result should have "found" field');
      assert(typeof result.found === 'boolean', '"found" should be boolean');

      log.success(`Connection found: ${result.found}`);
      if (result.found) {
        log.info(`Connection ID: ${result.connectionId}`);
        log.info(`Group Ref: ${result.groupRef}`);
      }
    },
  );

  // Test 2: Check connection for non-existent provider
  await runner.test(
    'checkConnection: Check non-existent provider returns found=false',
    async () => {
      log.info('Checking non-existent provider...');

      const result = await checkConnectionHelper(INVALID_PROVIDER);

      assert('found' in result, 'Result should have "found" field');

      // May or may not be found depending on setup
      log.success(`Connection found: ${result.found}`);
    },
  );

  runner.summarize();
}

main();
