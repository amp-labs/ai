/**
 * E2E Test: sendRequest Tool
 *
 * Tests the sendRequest tool which makes authenticated API calls to providers.
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
  sendRequestHelper,
} from '../helpers/ampersand-tools';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: sendRequest');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  const PROVIDER = 'salesforce';
  const SALESFORCE_ENDPOINT = 'services/data/v56.0/sobjects';

  // Test 1: GET request to fetch Salesforce objects
  await runner.test(
    'sendRequest: GET request to list Salesforce objects',
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
      const result = await sendRequestHelper(
        PROVIDER,
        SALESFORCE_ENDPOINT,
        'GET',
        installationId,
      );

      assert('status' in result, 'Result should have "status" field');
      assert('response' in result, 'Result should have "response" field');
      assert(typeof result.status === 'number', 'Status should be a number');

      log.success(`Request completed with status: ${result.status}`);

      if (result.status === 200) {
        const sobjects = result.response?.sobjects;
        if (sobjects && Array.isArray(sobjects)) {
          log.info(`Retrieved ${sobjects.length} Salesforce object types`);
        }
      }
    },
  );

  // Test 2: POST request to create a record
  // NOTE: Commented out by default as it creates actual data in Salesforce
  // Uncomment to test POST functionality
  // await runner.test(
  //   'sendRequest: POST request to create Salesforce Contact',
  //   async () => {
  //     const CONTACT_ENDPOINT = 'services/data/v56.0/sobjects/Contact';
  //     const contactData = {
  //       FirstName: 'API',
  //       LastName: 'Test',
  //     };
  //
  //     // Get installation ID dynamically
  //     const installationData = await checkInstallationHelper(PROVIDER);
  //     const installationId = installationData.installationId!;
  //
  //     log.info('Making POST request to Salesforce...');
  //     log.warn('This will create an actual Contact record in Salesforce');
  //
  //     const result = await sendRequestHelper(
  //       PROVIDER,
  //       CONTACT_ENDPOINT,
  //       'POST',
  //       installationId,
  //       contactData,
  //     );
  //
  //     assert('status' in result, 'Result should have "status" field');
  //     assert(
  //       result.status === 201 || result.status === 200,
  //       'POST request should return 200/201 status',
  //     );
  //
  //     log.success(`Record created via API with status: ${result.status}`);
  //     if (result.response?.id) {
  //       log.info(`Created Contact ID: ${result.response.id}`);
  //     }
  //   },
  // );

  runner.summarize();
}

main();
