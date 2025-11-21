import {
  createRecord,
  updateRecord,
  checkConnection,
} from '@amp-labs/ai/aisdk';
import {
  setGlobalClientConfig,
  createClientConfig,
  getEffectiveClientConfig,
} from '@amp-labs/ai/aisdk';

// Example 1: Set global client configuration (applies to all requests)
setGlobalClientConfig({
  clientName: 'my-ai-agent',
  clientVersion: '1.0.0',
  userAgent: 'MyAIAgent/1.0.0',
  apiKey: process.env.AMPERSAND_API_KEY || '',
  projectId: process.env.AMPERSAND_PROJECT_ID,
  integrationName: process.env.AMPERSAND_INTEGRATION_NAME,
});

// Example 2: Use tools with global configuration
async function exampleWithGlobalConfig() {
  // These tools will automatically use the global client configuration
  // Note: In a real Vercel AI SDK setup, these would be used as tools in the agent
  console.log('Tools configured with global client tracking:');
  console.log('- createRecord:', createRecord);
  console.log('- updateRecord:', updateRecord);
  console.log('- checkConnection:', checkConnection);
}

// Example 3: Override global configuration for specific requests
async function exampleWithOverrideConfig() {
  const customConfig = createClientConfig({
    clientName: 'special-operation',
    clientVersion: '2.0.0',
    userAgent: 'SpecialOperation/2.0.0',
  });

  console.log('Custom client config:', customConfig);
}

// Example 4: Environment variable configuration
// Set these environment variables:
// AMPERSAND_CLIENT_NAME=my-app
// AMPERSAND_CLIENT_VERSION=1.2.3
// AMPERSAND_USER_AGENT=MyApp/1.2.3
async function exampleWithEnvVars() {
  // The SDK will automatically pick up environment variables
  const config = getEffectiveClientConfig();
  console.log('Effective config:', config);
}

// Example 5: Framework-specific configuration
async function exampleWithFrameworkConfig() {
  // For Vercel AI SDK, you can configure in your agent setup
  const tools = [createRecord, updateRecord, checkConnection];

  // The tools will automatically include client tracking headers
  // based on your global configuration or environment variables
  console.log('Tools configured with client tracking:', tools);
}

// Example 6: Vercel AI SDK integration
async function exampleVercelAISDKIntegration() {
  // In a real Vercel AI SDK setup, you would do something like:
  /*
  import { openai } from '@ai-sdk/openai';
  import { generateText } from 'ai';
  
  const { text } = await generateText({
    model: openai('gpt-4'),
    prompt: 'Create a contact in Salesforce',
    tools: {
      createRecord,
      checkConnection
    }
  });
  */

  console.log('Vercel AI SDK integration example - tools are ready to use');
}

// Run examples
async function runExamples() {
  console.log('=== Client Tracking Examples ===');

  try {
    await exampleWithGlobalConfig();
    await exampleWithOverrideConfig();
    await exampleWithEnvVars();
    await exampleWithFrameworkConfig();
    await exampleVercelAISDKIntegration();

    console.log('All examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export for use in other files
export {
  exampleWithGlobalConfig,
  exampleWithOverrideConfig,
  exampleWithEnvVars,
  exampleWithFrameworkConfig,
  exampleVercelAISDKIntegration,
  runExamples,
};
