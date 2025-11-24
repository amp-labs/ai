# How to Test the Ampersand AI SDK

## Summary

The Ampersand AI SDK is successfully installed and working! We created test files to demonstrate its usage.

## Test Files Created

1. **`examples/test-sdk.ts`** - Comprehensive test suite showing how to use the SDK
2. **`run-test.sh`** - Convenient script to run tests with environment variables
3. **`examples/simple-test.ts`** - Simple import verification test
4. **`examples/test-vercel.ts`** - Test using the existing vercel-agent example

## Status

✅ SDK is built and installed correctly
✅ Imports work properly (`createRecord`, `updateRecord` from `@amp-labs/ai/aisdk`)
❌ OpenAI API key has exceeded quota - need a valid OpenAI API key to run full tests

## How to Run Tests

### Option 1: Using the run script
```bash
./run-test.sh
```

### Option 2: Direct command
```bash
export $(cat .env | grep -v '^#' | xargs) && npx tsx examples/test-sdk.ts
```

### Option 3: Test a specific file
```bash
export $(cat .env | grep -v '^#' | xargs) && npx tsx examples/simple-test.ts
```

## Environment Variables Required

The `.env` file at the root contains:
- `AMPERSAND_API_KEY` - Your Ampersand API key ✅
- `AMPERSAND_PROJECT_ID` - Your Ampersand project ID ✅
- `AMPERSAND_INTEGRATION_NAME` - Integration name (e.g., "readAndWriteSalesforce-oct") ✅
- `AMPERSAND_GROUP_REF` - Group reference ✅
- `OPENAI_API_KEY` - Your OpenAI API key ❌ (quota exceeded)

## Next Steps

To fully test the SDK with AI agents:

1. **Get a valid OpenAI API key** with available quota
2. Update the `OPENAI_API_KEY` in `.env`
3. Run the tests

## How the SDK Works

The SDK provides pre-built tools for AI frameworks:

```typescript
import { createRecord, updateRecord } from '@amp-labs/ai/aisdk';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const { text } = await generateText({
  model: openai('gpt-4o-mini'),
  prompt: 'Create a contact in Salesforce',
  tools: {
    createRecord,
    updateRecord,
  },
});
```

The tools integrate seamlessly with:
- Vercel AI SDK (import from `@amp-labs/ai/aisdk`)
- Mastra (import from `@amp-labs/ai/mastra`)
- MCP (Model Context Protocol)

## Repository Structure

```
ai/
├── sdk/                          # Main SDK package
│   ├── lib/adapters/
│   │   ├── aisdk.ts             # Vercel AI SDK adapter
│   │   ├── mastra.ts            # Mastra adapter
│   │   └── mcp.ts               # MCP adapter
│   └── dist/                    # Built files
├── examples/                     # Example implementations
│   ├── vercel-agent.ts          # Vercel AI example
│   ├── mastra-agent.ts          # Mastra example
│   ├── test-sdk.ts              # Our test suite
│   └── simple-test.ts           # Import verification
├── mcp-server/                   # MCP server implementation
├── .env                          # Environment variables
└── run-test.sh                   # Test runner script
```

## Troubleshooting

If imports are undefined:
1. Rebuild the SDK: `pnpm --filter @amp-labs/ai build`
2. Reinstall dependencies: `pnpm install`
3. Check that `sdk/dist/` exists and contains built files

If OpenAI errors occur:
1. Check your API key is valid
2. Ensure you have quota available
3. Consider using a different model (gpt-3.5-turbo is cheaper)
