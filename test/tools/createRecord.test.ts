/**
 * E2E Test: createRecord Tool
 *
 * Tests the createRecord tool which creates new records in SaaS platforms.
 *
 * Prerequisites: Active connection and installation for the provider
 * Uses OpenAI: Yes
 * NOTE: This test creates real records - may need cleanup
 */

import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';
import { createRecordHelper } from '../helpers/ampersand-tools';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: createRecord');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  const GROUP_REF = process.env.AMPERSAND_GROUP_REF || '';

  // Test 1: Create a Contact in Salesforce
  // NOTE: Commented out by default as it creates actual data in Salesforce
  // Uncomment to test createRecord functionality
  await runner.test('createRecord: Create Contact in Salesforce', async () => {
    const contactRecord = {
      FirstName: 'Test User',
      LastName: 'E2E',
      Email: 'teste2e@example.com',
    };

    log.info('Creating a Contact in Salesforce...');
    log.warn('This will create an actual Contact record in Salesforce');

    const result = await createRecordHelper(
      'contact',
      contactRecord,
      GROUP_REF,
    );

    console.log('[Ampersand] Create result:', JSON.stringify(result, null, 2));

    assert('status' in result, 'Result should have "status" field');
    assert('recordId' in result, 'Result should have "recordId" field');

    log.success(`Record created with ID: ${result.recordId}`);
    log.info(`Status: ${result.status}`);

    if (result.recordId) {
      log.info(
        `Note: Contact ${result.recordId} was created and can be deleted manually if needed.`,
      );
    }
  });

  // Test 2: Create a Lead in Salesforce
  // NOTE: Commented out by default as it creates actual data in Salesforce
  // Uncomment to test createRecord functionality
  // await runner.test('createRecord: Create Lead in Salesforce', async () => {
  //   const leadData = {
  //     Company: 'Test Company E2E',
  //     LastName: 'Smith',
  //     Email: 'testlead@example.com',
  //   };
  //
  //   log.info('Creating a Lead in Salesforce...');
  //   log.warn('This will create an actual Lead record in Salesforce');
  //
  //   const result = await createRecordHelper('lead', leadData, GROUP_REF);
  //
  //   assert('recordId' in result, 'Result should have recordId');
  //
  //   log.success(`Lead created with ID: ${result.recordId}`);
  // });

  runner.summarize();
}

main();
