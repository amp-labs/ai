import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  checkConnection as checkConnectionTool,
  // checkInstallation as checkInstallationTool,
} from '@amp-labs/ai/aisdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
}

// Run the test
testSimpleToolCall();
