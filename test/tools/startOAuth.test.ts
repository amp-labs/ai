/**
 * E2E Test: startOAuth Tool
 *
 * Tests the startOAuth tool which initiates an OAuth flow for a provider.
 *
 * Prerequisites: Valid API key, project ID, and providerWorkspaceRef
 * Uses OpenAI: Yes (minimal usage)
 *
 * NOTE: This test requires a providerWorkspaceRef which may not be available
 * for all providers. The test may fail if the provider is not properly configured.
 */

import {
  TestRunner,
  checkEnvironmentVariables,
  assert,
  log,
} from '../helpers/test-utils';
import { startOAuthHelper } from '../helpers/ampersand-tools';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: startOAuth');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();

  const groupRef = process.env.AMPERSAND_GROUP_REF;
  const consumerRef = process.env.AMPERSAND_CONSUMER_REF;
  const salesforceSubdomain = process.env.SALESFORCE_SUBDOMAIN;

  // Test 1: Get OAuth URL for Salesforce
  await runner.test('startOAuth: Get OAuth URL for Salesforce', async () => {
    log.info('Getting Salesforce OAuth URL...');

    if (!salesforceSubdomain) {
      log.warn('SALESFORCE_SUBDOMAIN not set in environment variables');
      log.info(
        'Attempting without providerWorkspaceRef - may fail if required',
      );
    }

    log.info(
      `Using groupRef: ${groupRef}, consumerRef: ${consumerRef}, subdomain: ${salesforceSubdomain || 'none'}`,
    );

    const result = await startOAuthHelper(
      'salesforce',
      groupRef,
      consumerRef,
      salesforceSubdomain,
    );

    assert('url' in result, 'Result should have "url" field');
    assert(typeof result.url === 'string', '"url" should be string');
    assert(result.url.startsWith('http'), '"url" should be valid URL');

    log.success(`OAuth URL generated: ${result.url.substring(0, 50)}...`);
    log.info('Open this URL in your browser to complete OAuth flow');
  });

  // Test 2: Get OAuth URL for HubSpot
  // NOTE: Commented out by default - uncomment to test HubSpot OAuth
  // await runner.test('startOAuth: Get OAuth URL for HubSpot', async () => {
  //   log.info('Getting HubSpot OAuth URL...');
  //
  //   const result = await startOAuthHelper(
  //     'hubspot',
  //     groupRef,
  //     consumerRef,
  //   );
  //
  //   assert('url' in result, 'Result should have "url" field');
  //   assert(result.url.startsWith('http'), '"url" should be valid URL');
  //
  //   log.success('HubSpot OAuth URL generated');
  //   log.info('Open the URL in your browser to complete OAuth flow');
  // });

  runner.summarize();
}

main();
