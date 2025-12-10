/**
 * E2E Test: updateRecord Tool
 *
 * Tests the updateRecord tool which updates existing records in SaaS platforms.
 *
 * Prerequisites: Active connection, installation, and existing record to update
 * Uses OpenAI: Yes
 * NOTE: This test modifies real records
 */

import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';
import { updateRecordHelper } from '../helpers/ampersand-tools';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: updateRecord');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  const GROUP_REF = process.env.AMPERSAND_GROUP_REF || '';
  // Update this with your test contact ID (e.g., from createRecord test output)
  const CONTACT_ID = '003Dp00000Sy9SOIAZ';

  // Test 1: Update a Contact in Salesforce
  await runner.test(
    'updateRecord: Update Contact email in Salesforce',
    async () => {
      const updateData = {
        id: CONTACT_ID,
        Email: 'updated-e2e@example.com',
        Phone: '555-1234',
      };

      log.info(`Updating Contact ${CONTACT_ID} in Salesforce...`);
      log.warn(`This will update Contact ${CONTACT_ID} in Salesforce`);

      const result = await updateRecordHelper('contact', updateData, GROUP_REF);

      console.log(
        '[Ampersand] Update result:',
        JSON.stringify(result, null, 2),
      );

      assert('status' in result, 'Result should have "status" field');
      assert('recordId' in result, 'Result should have "recordId" field');

      log.success(`Record updated: ${result.recordId}`);
      log.info(`Status: ${result.status}`);

      if (result.recordId) {
        log.info(`Updated Contact ${result.recordId} with new email and phone`);
      }
    },
  );

  runner.summarize();
}

main();
