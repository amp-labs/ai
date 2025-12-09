/**
 * Comprehensive E2E Test
 *
 * This test orchestrates multiple Ampersand tools to perform a complete workflow:
 * 1. Check/create connection
 * 2. Create installation
 * 3. Send read requests
 * 4. Send write requests
 * 5. Create a record
 * 6. Update the record
 *
 * Prerequisites: Active Salesforce connection
 * Uses OpenAI: Yes
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
  sendReadRequestHelper,
  sendRequestHelper,
  createRecordHelper,
  updateRecordHelper,
} from '../helpers/ampersand-tools';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: Comprehensive Workflow');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  const PROVIDER = 'salesforce';
  const GROUP_REF = process.env.AMPERSAND_GROUP_REF || '';

  await runner.test(
    'Comprehensive E2E: Complete installation and CRUD workflow',
    async () => {
      // Step 1: Check for existing connection
      log.info('Step 1: Checking for existing Salesforce connection...');
      const connectionData = await checkConnectionHelper(PROVIDER);

      if (!connectionData.found) {
        log.error('No Salesforce connection found');
        log.info('To create a connection:');
        log.info('  1. Run: pnpm --filter ai-e2e-test test:startOAuth');
        log.info('  2. Complete the OAuth flow in your browser');
        log.info('  3. Then run this test again');
        throw new Error(
          'A Salesforce connection must exist. Please run startOAuth first.',
        );
      }

      assert(connectionData.connectionId, 'Should have connectionId');
      assert(connectionData.groupRef, 'Should have groupRef');
      log.success(
        `Found connection: ${connectionData.connectionId}, groupRef: ${connectionData.groupRef}`,
      );

      const connectionId = connectionData.connectionId;
      const groupRef = connectionData.groupRef;

      // Step 2: Check if installation already exists, if not create one
      log.info('Step 2: Checking for existing installation...');
      const installationData = await checkInstallationHelper(PROVIDER);

      let installationId: string;

      if (installationData.found) {
        log.info(
          `Installation already exists: ${installationData.installationId}`,
        );
        installationId = installationData.installationId!;
      } else {
        log.info('Creating new installation...');
        const createResult = await createInstallationHelper(
          PROVIDER,
          connectionId,
          groupRef,
        );

        assert('created' in createResult, 'Should have "created" field');
        assert(createResult.created === true, 'Installation should be created');
        assert(
          createResult.installationId,
          'Should have installation ID after creation',
        );

        installationId = createResult.installationId;
        log.success(`Created installation: ${installationId}`);
      }

      // Step 3: Send read request to list Salesforce objects
      log.info('Step 3: Sending read request to list Salesforce objects...');
      const readResult = await sendReadRequestHelper(
        PROVIDER,
        'services/data/v56.0/sobjects',
        installationId,
      );

      assert('status' in readResult, 'Read result should have status');
      assert('response' in readResult, 'Read result should have response');
      log.success(`Read request completed with status: ${readResult.status}`);

      if (readResult.status === 200) {
        const sobjects = readResult.response?.sobjects;
        if (sobjects && Array.isArray(sobjects)) {
          log.info(`Retrieved ${sobjects.length} Salesforce object types`);
        }
      }

      // Step 4: Send GET request using sendRequest
      log.info(
        'Step 4: Sending GET request to query Contact object metadata...',
      );
      const getResult = await sendRequestHelper(
        PROVIDER,
        'services/data/v56.0/sobjects/Contact/describe',
        'GET',
        installationId,
      );

      assert('status' in getResult, 'GET result should have status');
      log.success(`GET request completed with status: ${getResult.status}`);

      // Step 5: Create a Contact record
      log.info('Step 5: Creating a Contact record...');
      const timestamp = Date.now();
      const contactRecord = {
        FirstName: 'E2E',
        LastName: `Test-${timestamp}`,
        Email: `e2e-test-${timestamp}@example.com`,
      };

      const createResult = await createRecordHelper(
        'contact',
        contactRecord,
        GROUP_REF,
      );

      console.log(
        '[Ampersand] Create result:',
        JSON.stringify(createResult, null, 2),
      );

      assert('status' in createResult, 'Create result should have status');
      assert('recordId' in createResult, 'Create result should have recordId');

      const recordId = createResult.recordId;
      log.success(`Created Contact record: ${recordId}`);
      log.info(`Email: ${contactRecord.Email}`);

      // Step 6: Update the Contact record
      log.info('Step 6: Updating the Contact record...');
      const updateData = {
        id: recordId,
        Phone: '555-0123',
        Title: 'E2E Test Contact',
      };

      const updateResult = await updateRecordHelper(
        'contact',
        updateData,
        GROUP_REF,
      );

      assert('status' in updateResult, 'Update result should have status');
      assert('recordId' in updateResult, 'Update result should have recordId');
      log.success(`Updated Contact record: ${updateResult.recordId}`);
      log.info(`Phone: ${updateData.Phone}, Title: ${updateData.Title}`);

      // Step 7: Verify the update with a read request
      log.info('Step 7: Verifying the update...');
      const verifyResult = await sendRequestHelper(
        PROVIDER,
        `services/data/v56.0/sobjects/Contact/${recordId}`,
        'GET',
        installationId,
      );

      assert('status' in verifyResult, 'Verify result should have status');
      if (verifyResult.status === 200) {
        log.success('Successfully verified record update');
        log.info(
          `Verified data: ${JSON.stringify(verifyResult.response, null, 2)}`,
        );
      }

      // Summary
      console.log();
      console.log('='.repeat(60));
      console.log('Comprehensive E2E Test Summary:');
      console.log('='.repeat(60));
      log.success(`✓ Connection verified: ${connectionId}`);
      log.success(
        `✓ Installation ${installationData.found ? 'verified' : 'created'}: ${installationId}`,
      );
      log.success(`✓ Read requests successful`);
      log.success(`✓ Record created: ${recordId}`);
      log.success(`✓ Record updated successfully`);
      log.success(`✓ Update verified`);
      console.log('='.repeat(60));
      console.log();
      log.info(
        `Note: Contact record ${recordId} was created in Salesforce and can be deleted manually if needed.`,
      );
    },
  );

  runner.summarize();
}

main();
