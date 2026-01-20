# Ampersand AI SDK - E2E Tests

Modular end-to-end test suite for the Ampersand AI SDK, optimized for Claude Code workflows.

## 📁 Test Structure

```
test/
├── helpers/
│   └── test-utils.ts           # Shared utilities (TestRunner, assertions, logging)
├── tools/
│   ├── checkConnection.test.ts    # Connection checking tests
│   ├── checkInstallation.test.ts  # Installation checking tests
│   ├── startOAuth.test.ts         # OAuth flow tests
│   ├── createRecord.test.ts       # Record creation tests
│   ├── updateRecord.test.ts       # Record update tests
│   ├── sendRequest.test.ts        # General API request tests
│   └── sendReadRequest.test.ts    # Read-only API request tests
├── ai-e2e-schema-validation.ts # Schema validation (no API calls)
├── ai-e2e-simple.ts            # Legacy simple test
└── README.md                   # This file
```

## 🎯 Design Principles

This test suite is designed to be:

1. **Modular** - One test file per tool, easy to run individually
2. **Maintainable** - Shared utilities, consistent patterns
3. **Readable** - Clear naming, good documentation
4. **Extensible** - Easy to add new tests
5. **Claude Code Friendly** - Optimized for AI-assisted development

## 🚀 Quick Start

### Prerequisites

1. Set up environment variables in `.env`:
```bash
AMPERSAND_API_KEY=your_api_key
AMPERSAND_PROJECT_ID=your_project_id
AMPERSAND_GROUP_REF=your_group_ref
AMPERSAND_INTEGRATION_NAME=your_integration_name  # Required for E2E tests
AMPERSAND_CONSUMER_REF=your_consumer_ref # required for E2E tests
OPENAI_API_KEY=your_openai_key
```

2. Build the SDK:
```bash
pnpm --filter @amp-labs/ai build
```

### Running Tests

```bash
# Run schema validation (fast, no API calls, no OpenAI credits)
pnpm test:schema

# Run individual tool tests
pnpm test:checkConnection
pnpm test:checkInstallation
pnpm test:startOAuth
pnpm test:createRecord
pnpm test:updateRecord
pnpm test:sendRequest
pnpm test:sendReadRequest

# Run multiple tests in sequence
pnpm test:all-tools

# Run legacy simple test
pnpm test:simple
```

## 📊 Test Categories

### 1. Schema Validation (No Cost)
- **File:** `ai-e2e-schema-validation.ts`
- **Tools:** All 8 tools
- **Cost:** Free (no API calls)
- **Duration:** ~1 second
- **Purpose:** Validate all Zod schemas

### 2. Read-Only Tests (Low Cost)
- **Files:** `checkConnection.test.ts`, `checkInstallation.test.ts`, `startOAuth.test.ts`
- **Cost:** Minimal OpenAI credits
- **Purpose:** Test connection/installation status and OAuth URLs

### 3. Write Tests (Medium Cost)
- **Files:** `createRecord.test.ts`, `updateRecord.test.ts`
- **Cost:** Moderate OpenAI credits + creates real data
- **Purpose:** Test CRUD operations
- **⚠️ Warning:** Creates real records in your SaaS platforms

### 4. API Proxy Tests (Medium Cost)
- **Files:** `sendRequest.test.ts`, `sendReadRequest.test.ts`
- **Cost:** Moderate OpenAI credits + API calls
- **Purpose:** Test raw API access through Ampersand proxy

## 🛠️ Adding New Tests

### Template for New Tool Test

```typescript
/**
 * E2E Test: [toolName] Tool
 *
 * [Description of what the tool does]
 *
 * Prerequisites: [List prerequisites]
 * Uses OpenAI: [Yes/No]
 */

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { yourTool } from '@amp-labs/ai/aisdk';
import {
  TestRunner,
  checkEnvironmentVariables,
  getEnvConfig,
  assert,
  log,
} from '../helpers/test-utils';

async function main() {
  console.log('='.repeat(60));
  console.log('E2E Test: [toolName]');
  console.log('='.repeat(60));
  console.log();

  checkEnvironmentVariables();

  const runner = new TestRunner();
  const config = getEnvConfig();

  // Test 1: [Description]
  await runner.test('[Test name]', async () => {
    log.info('[Action description]...');

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      tools: { yourTool },
      maxSteps: 5,
      prompt: '[Natural language prompt for AI]',
    });

    // Assertions
    const toolCalls = result.steps[0]?.toolCalls;
    assert(toolCalls && toolCalls.length > 0, 'Tool should have been called');

    // Add more assertions...

    log.success('[Success message]');
  });

  runner.summarize();
}

main();
```

### Adding Test to package.json

```json
"test:yourTool": "tsx tools/yourTool.test.ts"
```

## 📖 Test Utilities Reference

### TestRunner

```typescript
const runner = new TestRunner();

// Run a test
await runner.test('Test name', async () => {
  // test code
});

// Print summary and exit
runner.summarize();
```

### Assertions

```typescript
import { assert, assertEquals } from '../helpers/test-utils';

assert(condition, 'Error message');
assertEquals(actual, expected, 'Optional message');
```

### Logging

```typescript
import { log } from '../helpers/test-utils';

log.info('Information message');
log.success('Success message');
log.error('Error message');
log.warn('Warning message');
log.debug('Debug message');
```

### Retry Helper

```typescript
import { retry, wait } from '../helpers/test-utils';

// Retry a flaky operation
const result = await retry(
  async () => {
    // operation that might fail
  },
  maxAttempts = 3,
  delayMs = 1000
);

// Simple delay
await wait(1000); // wait 1 second
```

## 🧪 Test Output Format

Each test produces clear, structured output:

```
============================================================
E2E Test: checkConnection
============================================================

Environment Variables:
  AMPERSAND_API_KEY: ✓ SET
  AMPERSAND_PROJECT_ID: your_project_id
  AMPERSAND_GROUP_REF: your_group_ref
  OPENAI_API_KEY: ✓ SET

🧪 checkConnection: Verify Salesforce connection exists
ℹ️  Calling AI to check Salesforce connection...
✅ PASSED (1234ms)

============================================================
TEST SUMMARY
============================================================

Total: 1 | Passed: 1 | Failed: 0
Duration: 1234ms
Success rate: 100.0%

✅ All tests passed!
```

## 🎓 Best Practices

### For Claude Code

1. **Read the test file first** - Understand what it tests before running
2. **Check prerequisites** - Ensure env vars and data are set up
3. **Run schema tests first** - Validate schemas before integration tests
4. **Run read-only tests** - Test connections before write operations
5. **Be careful with write tests** - They create real data

### For Developers

1. **Keep tests focused** - One tool or concept per file
2. **Use descriptive names** - Clear test descriptions
3. **Add assertions** - Verify behavior, not just execution
4. **Handle cleanup** - Document when tests create data
5. **Update docs** - Keep this README in sync with tests

## 🐛 Troubleshooting

### "Cannot find module '@amp-labs/ai/aisdk'"
- Solution: Build the SDK first: `pnpm --filter @amp-labs/ai build`

### "Missing required environment variables"
- Solution: Create `.env` file with all required variables

### "Tool was not called"
- Solution: Check your OpenAI API key and prompt clarity

### Tests creating unwanted data
- Solution: Use test:schema for validation without side effects
- Consider: Set up dedicated test accounts/sandboxes

## 📝 Notes

- **Schema validation** tests are free and fast - run them often
- **Read-only tests** are safe and cheap - good for CI/CD
- **Write tests** modify real data - use with caution
- All tests use **gpt-4o-mini** by default for cost efficiency
- Write/update tests use **o3-mini** for better accuracy

## 🔗 Related Documentation

- [Ampersand AI SDK Docs](https://docs.withampersand.com/ai-sdk)
- [Contributing Guide](../CONTRIBUTING.md)
- [Main README](../README.md)
