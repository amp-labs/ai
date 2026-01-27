/**
 * E2E Test: sendReadRequest Tool
 *
 * Tests the sendReadRequest tool which makes authenticated GET requests to providers.
 *
 * Prerequisites: Active connection and installation
 * Uses OpenAI: Yes
 */

import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';
import {
  checkInstallationHelper,
  sendReadRequestHelper,
} from '../helpers/ampersand-tools';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: sendReadRequest');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  const PROVIDER = 'salesforce';
  const SALESFORCE_ENDPOINT = 'services/data/v56.0/sobjects';

  // Test 1: Read Salesforce objects
  await runner.test(
    'sendReadRequest: Fetch Salesforce object metadata',
    async () => {
      // Get installation ID dynamically
      log.info('Checking for existing installation...');
      const installationData = await checkInstallationHelper(PROVIDER);

      if (!installationData.found) {
        log.error('No Salesforce installation found');
        log.info(
          'Run the comprehensive test first to create an installation: pnpm test:comprehensive',
        );
        throw new Error(
          'A Salesforce installation must exist. Please run test:comprehensive first.',
        );
      }

      const installationId = installationData.installationId!;
      log.success(`Using installation: ${installationId}`);

      log.info('Making GET request to Salesforce...');
      const result = await sendReadRequestHelper(
        PROVIDER,
        SALESFORCE_ENDPOINT,
        installationId,
      );

      assert('status' in result, 'Result should have "status" field');
      assert('response' in result, 'Result should have "response" field');
      assert(typeof result.status === 'number', 'Status should be a number');

      log.success(`Read request completed with status: ${result.status}`);

      if (result.status === 200) {
        const sobjects = result.response?.sobjects;
        if (sobjects && Array.isArray(sobjects)) {
          log.info(`Retrieved ${sobjects.length} Salesforce object types`);
        }
      }
    },
  );

  // Test 2: Read specific Contact details
  // NOTE: Commented out as it requires a valid contact ID
  // await runner.test(
  //   'sendReadRequest: Fetch specific Contact details',
  //   async () => {
  //     const CONTACT_ID = 'REPLACE_WITH_VALID_CONTACT_ID';
  //     const CONTACT_ENDPOINT = `services/data/v56.0/sobjects/Contact/${CONTACT_ID}`;
  //
  //     log.info('Fetching Contact details...');
  //     log.warn(
  //       'NOTE: You need to provide a valid contact ID for this test to work',
  //     );
  //
  //     // Get installation ID dynamically
  //     const installationData = await checkInstallationHelper(PROVIDER);
  //     const installationId = installationData.installationId!;
  //
  //     const result = await sendReadRequestHelper(
  //       PROVIDER,
  //       CONTACT_ENDPOINT,
  //       installationId,
  //     );
  //
  //     assert('status' in result, 'Result should have "status" field');
  //     log.success(`Contact details fetched with status: ${result.status}`);
  //
  //     if (result.status === 200) {
  //       log.info(
  //         `Contact details: ${JSON.stringify(result.response, null, 2)}`,
  //       );
  //     }
  //   },
  // );

  runner.summarize();
}

main();
