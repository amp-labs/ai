/**
 * Simple test file to demonstrate the Ampersand AI SDK
 *
 * This file shows how to use the Ampersand SDK with the Vercel AI SDK
 * to create and update records in connected SaaS applications.
 */

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { createRecord, updateRecord } from '@amp-labs/ai/aisdk';

/**
 * Example 1: Basic tool usage
 * This shows how to use createRecord and updateRecord tools in an AI agent
 */
async function testBasicToolUsage() {
  console.log('\n=== Test 1: Basic Tool Usage ===\n');

  const model = openai('gpt-4o-mini');

  try {
    const { text: response } = await generateText({
      model,
      system:
        'You are a helpful assistant. Just acknowledge when the user asks you to create records.',
      prompt: 'Say hello and confirm you can help with Salesforce records.',
      tools: {
        createRecord,
        updateRecord,
      },
    });

    console.log('Agent Response:', response);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 2: Structured interaction
 * This shows a more realistic customer service scenario
 */
async function testCustomerServiceScenario() {
  console.log('\n=== Test 2: Customer Service Scenario ===\n');

  const model = openai('gpt-4o-mini');

  const customerQuery = 'Can you help me manage my Salesforce contacts?';

  try {
    const { text: response } = await generateText({
      model,
      system: `You are a customer service agent. You can:
      1. Create new records in CRM systems
      2. Update existing records

      When asked about capabilities, explain what you can do.`,
      prompt: customerQuery,
      tools: {
        createRecord,
        updateRecord,
      },
    });

    console.log('Customer Query:', customerQuery);
    console.log('Agent Response:', response);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 3: Display available tools
 * This shows what tools are available
 */
function displayAvailableTools() {
  console.log('\n=== Available Tools ===\n');

  console.log('1. createRecord');
  console.log('   - Tool Type: Ampersand AI SDK tool for creating records');
  console.log(
    '   - Use case: Create new records in connected SaaS apps (Salesforce, HubSpot, etc.)',
  );

  console.log('\n2. updateRecord');
  console.log('   - Tool Type: Ampersand AI SDK tool for updating records');
  console.log('   - Use case: Update existing records in connected SaaS apps');

  console.log(
    '\nThese tools are automatically configured for use with AI agents.',
  );
}

/**
 * Main test runner
 */
async function main() {
  console.log('========================================');
  console.log('Ampersand AI SDK Test Suite');
  console.log('========================================');

  // Check for required environment variables
  const requiredEnvVars = [
    'AMPERSAND_API_KEY',
    'AMPERSAND_PROJECT_ID',
    'AMPERSAND_INTEGRATION_NAME',
    'AMPERSAND_GROUP_REF',
    'OPENAI_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missingVars.forEach((varName) => console.error(`   - ${varName}`));
    console.error('\nPlease set these in your .env file or environment.\n');
    console.log('Example .env file:');
    console.log('AMPERSAND_API_KEY=your_api_key');
    console.log('AMPERSAND_PROJECT_ID=your_project_id');
    console.log('AMPERSAND_INTEGRATION_NAME=salesforce');
    console.log('AMPERSAND_GROUP_REF=your_group_ref');
    console.log('OPENAI_API_KEY=your_openai_key\n');
    return;
  }

  // Display available tools
  displayAvailableTools();

  // Run tests
  await testBasicToolUsage();
  await testCustomerServiceScenario();

  console.log('========================================');
  console.log('Test Suite Complete');
  console.log('========================================\n');
}

// Run the tests
main().catch(console.error);
