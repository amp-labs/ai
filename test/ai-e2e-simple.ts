import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  checkConnection as checkConnectionTool,
  checkInstallation as checkInstallationTool,
} from '@amp-labs/ai/aisdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * This test checks the connection and installation of the Salesforce connector.
 * It uses the checkConnection and checkInstallation tools to check the connection and installation.
 * It uses the generateText function to generate the text response.
 *
 * note: this test will use OpenAI credits
 * uncomment various tests to save on OpenAI credits
 */
async function testSimpleToolCall() {
  console.log('Starting simple tool call test...\n');
  console.log('Environment variables:');
  console.log(
    '- AMPERSAND_API_KEY:',
    process.env.AMPERSAND_API_KEY ? 'SET' : 'NOT SET',
  );
  console.log('- AMPERSAND_PROJECT_ID:', process.env.AMPERSAND_PROJECT_ID);
  console.log('- AMPERSAND_GROUP_REF:', process.env.AMPERSAND_GROUP_REF);
  console.log();

  // comment out the following code to test the tool call (will use OpenAI credits)
  // Test 1: Check connection - simple string parameter

  try {
    // Test 1: Check connection - simple string parameter
    console.log('Test 1: Checking connection for Salesforce...');
    const checkResult = await generateText({
      model: openai('gpt-4o-mini'),
      tools: {
        checkConnection: checkConnectionTool,
      },
      maxSteps: 5,
      prompt: 'Check if there is an active connection for salesforce',
    });

    console.log('Check Connection Result:');
    console.log('- Text:', checkResult.text);
    console.log('- Tool Calls:', JSON.stringify(checkResult.steps, null, 2));
    console.log('\n');

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error during test execution:', error);
    process.exit(1);
  }

  // Test 2: Check installation - simple string parameter
  try {
    console.log('Test 2: Checking installation for Salesforce...');
    const checkInstallationResult = await generateText({
      model: openai('gpt-4o-mini'),
      tools: {
        checkInstallation: checkInstallationTool,
      },
      maxSteps: 5,
      prompt: 'Check if there is an active installation for salesforce',
    });

    console.log('Check Installation Result:');
    console.log('- Text:', checkInstallationResult.text);
    console.log(
      '- Tool called:',
      checkInstallationResult.steps[0].toolCalls?.[0]?.toolName,
    );
    console.log(
      '- Tool args:',
      JSON.stringify(checkInstallationResult.steps[0].toolCalls?.[0]?.args),
    );
    console.log('\n');

    console.log('Installation test completed successfully!');
  } catch (error) {
    console.error('Error during installation test execution:', error);
    process.exit(1);
  }
}

// Run the test
testSimpleToolCall();
