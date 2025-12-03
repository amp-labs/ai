import {
  // Write operation schemas
  createActionSchema,
  updateActionSchema,
  writeOutputSchema,
  // Connection schemas
  checkConnectionInputSchema,
  checkConnectionOutputSchema,
  // Installation schemas
  checkInstallationInputSchema,
  checkInstallationOutputSchema,
  createInstallationInputSchema,
  createInstallationOutputSchema,
  // OAuth schemas
  startOAuthInputSchema,
  startOAuthOutputSchema,
  // Request schemas
  sendRequestInputSchema,
  sendRequestOutputSchema,
  sendReadRequestInputSchema,
  // Shared schemas
  associationsSchema,
  providerSchema,
  endpointSchema,
  installationIdSchema,
} from '@amp-labs/ai/aisdk';

/**
 * Schema Validation Tests
 *
 * This test file validates all Zod schemas in the Ampersand AI SDK.
 * It does NOT make any API calls or use AI models, so it runs fast and free.
 *
 * Test categories:
 * 1. Write Operations (createRecord, updateRecord)
 * 2. Connection Management (checkConnection)
 * 3. Installation Management (checkInstallation, createInstallation)
 * 4. OAuth (startOAuth)
 * 5. API Requests (sendRequest, sendReadRequest)
 */

type TestResult = {
  test: string;
  passed: boolean;
  error?: string;
};

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ test: name, passed: true });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({
      test: name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`❌ ${name}`);
    console.log(
      `   Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function expectValid(schema: any, data: any) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Expected valid but got errors: ${JSON.stringify(result.error.errors)}`,
    );
  }
}

function expectInvalid(schema: any, data: any) {
  const result = schema.safeParse(data);
  if (result.success) {
    throw new Error('Expected invalid but validation passed');
  }
}

console.log('\n=== SCHEMA VALIDATION TESTS ===\n');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================
console.log('--- Shared Schemas ---\n');

test('providerSchema: accepts valid provider names', () => {
  expectValid(providerSchema, 'salesforce');
  expectValid(providerSchema, 'hubspot');
  expectValid(providerSchema, 'monday');
});

test('providerSchema: rejects non-string values', () => {
  expectInvalid(providerSchema, 123);
  expectInvalid(providerSchema, null);
  expectInvalid(providerSchema, {});
});

test('endpointSchema: accepts valid endpoints', () => {
  expectValid(endpointSchema, 'v60.0/sobjects/Account');
  expectValid(endpointSchema, 'api/v1/contacts');
  expectValid(endpointSchema, '/users/me');
});

test('endpointSchema: rejects non-string values', () => {
  expectInvalid(endpointSchema, 123);
  expectInvalid(endpointSchema, null);
});

test('installationIdSchema: accepts valid installation IDs', () => {
  expectValid(installationIdSchema, 'inst_123456');
  expectValid(installationIdSchema, undefined); // optional
});

test('associationsSchema: accepts valid associations', () => {
  expectValid(associationsSchema, [
    {
      to: { id: 'contact_123' },
      types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 1 }],
    },
  ]);
  expectValid(associationsSchema, undefined); // optional
});

test('associationsSchema: rejects invalid associations', () => {
  expectInvalid(associationsSchema, [{ to: { id: 123 } }]); // id should be string
  expectInvalid(associationsSchema, [{ to: {}, types: [] }]); // missing id
});

// ============================================================================
// WRITE OPERATIONS
// ============================================================================
console.log('\n--- Write Operation Schemas ---\n');

test('createActionSchema: accepts valid create action', () => {
  expectValid(createActionSchema, {
    type: 'create',
    objectName: 'Contact',
    record: { firstName: 'John', lastName: 'Doe' },
    groupRef: 'group_123',
  });
});

test('createActionSchema: accepts create action with associations', () => {
  expectValid(createActionSchema, {
    type: 'create',
    objectName: 'Contact',
    record: { firstName: 'John' },
    groupRef: 'group_123',
    associations: [
      {
        to: { id: 'company_456' },
        types: [
          { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 1 },
        ],
      },
    ],
  });
});

test('createActionSchema: rejects missing required fields', () => {
  expectInvalid(createActionSchema, {
    type: 'create',
    objectName: 'Contact',
    // missing record
    groupRef: 'group_123',
  });
});

test('createActionSchema: rejects wrong type value', () => {
  expectInvalid(createActionSchema, {
    type: 'update', // should be 'create'
    objectName: 'Contact',
    record: {},
    groupRef: 'group_123',
  });
});

test('createActionSchema: rejects missing groupRef', () => {
  expectInvalid(createActionSchema, {
    type: 'create',
    objectName: 'Contact',
    record: {},
    // missing groupRef
  });
});

test('updateActionSchema: accepts valid update action', () => {
  expectValid(updateActionSchema, {
    type: 'update',
    objectName: 'Contact',
    record: { id: 'contact_123', email: 'newemail@example.com' },
    groupRef: 'group_123',
  });
});

test('updateActionSchema: rejects wrong type value', () => {
  expectInvalid(updateActionSchema, {
    type: 'create', // should be 'update'
    objectName: 'Contact',
    record: {},
    groupRef: 'group_123',
  });
});

test('writeOutputSchema: accepts valid output', () => {
  expectValid(writeOutputSchema, {
    status: 'success',
    recordId: 'record_123',
    response: { id: 'record_123', created: true },
  });
});

test('writeOutputSchema: rejects missing required fields', () => {
  expectInvalid(writeOutputSchema, {
    status: 'success',
    // missing recordId
    response: {},
  });
});

// ============================================================================
// CONNECTION MANAGEMENT
// ============================================================================
console.log('\n--- Connection Management Schemas ---\n');

test('checkConnectionInputSchema: accepts valid input', () => {
  expectValid(checkConnectionInputSchema, {
    provider: 'salesforce',
  });
});

test('checkConnectionInputSchema: rejects missing provider', () => {
  expectInvalid(checkConnectionInputSchema, {});
});

test('checkConnectionOutputSchema: accepts output with connection found', () => {
  expectValid(checkConnectionOutputSchema, {
    found: true,
    connectionId: 'conn_123',
    groupRef: 'group_456',
    data: { id: 'conn_123', provider: 'salesforce' },
  });
});

test('checkConnectionOutputSchema: accepts output with connection not found', () => {
  expectValid(checkConnectionOutputSchema, {
    found: false,
  });
});

test('checkConnectionOutputSchema: rejects missing found field', () => {
  expectInvalid(checkConnectionOutputSchema, {
    connectionId: 'conn_123',
  });
});

// ============================================================================
// INSTALLATION MANAGEMENT
// ============================================================================
console.log('\n--- Installation Management Schemas ---\n');

test('checkInstallationInputSchema: accepts valid input', () => {
  expectValid(checkInstallationInputSchema, {
    provider: 'hubspot',
  });
});

test('checkInstallationInputSchema: rejects missing provider', () => {
  expectInvalid(checkInstallationInputSchema, {});
});

test('checkInstallationOutputSchema: accepts output with installation found', () => {
  expectValid(checkInstallationOutputSchema, {
    found: true,
    installationId: 'inst_123',
    data: { id: 'inst_123', provider: 'hubspot' },
  });
});

test('checkInstallationOutputSchema: accepts output with installation not found', () => {
  expectValid(checkInstallationOutputSchema, {
    found: false,
  });
});

test('createInstallationInputSchema: accepts valid input', () => {
  expectValid(createInstallationInputSchema, {
    provider: 'salesforce',
    connectionId: 'conn_123',
    groupRef: 'group_456',
  });
});

test('createInstallationInputSchema: rejects missing required fields', () => {
  expectInvalid(createInstallationInputSchema, {
    provider: 'salesforce',
    // missing connectionId and groupRef
  });
});

test('createInstallationOutputSchema: accepts successful creation', () => {
  expectValid(createInstallationOutputSchema, {
    created: true,
    installationId: 'inst_789',
    data: { id: 'inst_789' },
  });
});

test('createInstallationOutputSchema: accepts failed creation', () => {
  expectValid(createInstallationOutputSchema, {
    created: false,
  });
});

test('createInstallationOutputSchema: rejects missing created field', () => {
  expectInvalid(createInstallationOutputSchema, {
    installationId: 'inst_789',
  });
});

// ============================================================================
// OAUTH
// ============================================================================
console.log('\n--- OAuth Schemas ---\n');

test('startOAuthInputSchema: accepts minimal valid input', () => {
  expectValid(startOAuthInputSchema, {
    provider: 'monday',
  });
});

test('startOAuthInputSchema: accepts input with optional fields', () => {
  expectValid(startOAuthInputSchema, {
    provider: 'monday',
    groupRef: 'group_123',
    consumerRef: 'consumer_456',
  });
});

test('startOAuthInputSchema: rejects missing provider', () => {
  expectInvalid(startOAuthInputSchema, {
    groupRef: 'group_123',
  });
});

test('startOAuthOutputSchema: accepts valid output', () => {
  expectValid(startOAuthOutputSchema, {
    url: 'https://oauth.example.com/authorize?client_id=123',
  });
});

test('startOAuthOutputSchema: rejects missing url', () => {
  expectInvalid(startOAuthOutputSchema, {});
});

test('startOAuthOutputSchema: rejects non-string url', () => {
  expectInvalid(startOAuthOutputSchema, {
    url: 123,
  });
});

// ============================================================================
// API REQUESTS
// ============================================================================
console.log('\n--- API Request Schemas ---\n');

test('sendRequestInputSchema: accepts valid POST request', () => {
  expectValid(sendRequestInputSchema, {
    provider: 'salesforce',
    endpoint: 'v60.0/sobjects/Contact',
    method: 'POST',
    body: { firstName: 'Jane', lastName: 'Smith' },
  });
});

test('sendRequestInputSchema: accepts GET request without body', () => {
  expectValid(sendRequestInputSchema, {
    provider: 'salesforce',
    endpoint: 'v60.0/sobjects/Contact/003xx000004TmiQ',
    method: 'GET',
  });
});

test('sendRequestInputSchema: accepts request with custom headers', () => {
  expectValid(sendRequestInputSchema, {
    provider: 'salesforce',
    endpoint: 'v60.0/sobjects/Contact',
    method: 'POST',
    headers: { 'X-Custom-Header': 'value' },
    body: {},
  });
});

test('sendRequestInputSchema: accepts request with installationId', () => {
  expectValid(sendRequestInputSchema, {
    provider: 'salesforce',
    endpoint: 'v60.0/sobjects/Contact',
    method: 'GET',
    installationId: 'inst_123',
  });
});

test('sendRequestInputSchema: rejects missing required fields', () => {
  expectInvalid(sendRequestInputSchema, {
    provider: 'salesforce',
    // missing endpoint and method
  });
});

test('sendReadRequestInputSchema: accepts valid GET request', () => {
  expectValid(sendReadRequestInputSchema, {
    provider: 'hubspot',
    endpoint: 'crm/v3/objects/contacts',
  });
});

test('sendReadRequestInputSchema: accepts request with headers', () => {
  expectValid(sendReadRequestInputSchema, {
    provider: 'hubspot',
    endpoint: 'crm/v3/objects/contacts',
    headers: { 'X-Custom': 'value' },
  });
});

test('sendReadRequestInputSchema: rejects missing endpoint', () => {
  expectInvalid(sendReadRequestInputSchema, {
    provider: 'hubspot',
  });
});

test('sendRequestOutputSchema: accepts valid response', () => {
  expectValid(sendRequestOutputSchema, {
    status: 200,
    response: { id: '123', name: 'Test' },
  });
});

test('sendRequestOutputSchema: accepts error response', () => {
  expectValid(sendRequestOutputSchema, {
    status: 404,
    response: { error: 'Not found' },
  });
});

test('sendRequestOutputSchema: rejects missing status', () => {
  expectInvalid(sendRequestOutputSchema, {
    response: {},
  });
});

test('sendRequestOutputSchema: rejects non-number status', () => {
  expectInvalid(sendRequestOutputSchema, {
    status: '200', // should be number
    response: {},
  });
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n=== TEST SUMMARY ===\n');

const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;
const total = results.length;

console.log(`Total tests: ${total}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Success rate: ${((passed / total) * 100).toFixed(1)}%`);

if (failed > 0) {
  console.log('\n--- Failed Tests ---\n');
  results
    .filter((r) => !r.passed)
    .forEach((r) => {
      console.log(`❌ ${r.test}`);
      console.log(`   ${r.error}\n`);
    });
  process.exit(1);
} else {
  console.log('\n✅ All schema validation tests passed!\n');
  process.exit(0);
}
