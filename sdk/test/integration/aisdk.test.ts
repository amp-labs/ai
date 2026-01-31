/**
 * Integration Tests: Vercel AI SDK Adapter
 *
 * Tests the AI SDK adapter tools for:
 * - Tool definition structure (description, inputSchema)
 * - Schema validation
 * - Tool execute functions (with mocked HTTP where possible)
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'bun:test';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Import tools from the built SDK
import {
  createRecord,
  updateRecord,
  checkConnection,
  createInstallation,
  checkInstallation,
  startOAuth,
  sendRequest,
  sendReadRequest,
} from '../../lib/adapters/aisdk';

// Import schemas for validation
import {
  createActionSchema,
  updateActionSchema,
  checkConnectionInputSchema,
  createInstallationInputSchema,
  startOAuthInputSchema,
  sendRequestInputSchema,
  sendReadRequestInputSchema,
} from '../../lib/adapters/common';

// Setup MSW server for HTTP mocking
const handlers = [
  // OAuth endpoint (uses fetch directly)
  http.post('https://api.withampersand.com/v1/oauth-connect', () => {
    return HttpResponse.text(
      'https://oauth.withampersand.com/authorize?test=true',
    );
  }),

  // Proxy endpoint (uses fetch directly)
  http.all('https://proxy.withampersand.com/*', () => {
    return HttpResponse.json({
      data: { id: 'mock-id', name: 'Mock Record' },
      success: true,
    });
  }),
];

const server = setupServer(...handlers);

describe('AI SDK Adapter - Tool Definitions', () => {
  it('createRecord has correct structure', () => {
    expect(createRecord).toBeDefined();
    expect(typeof createRecord.description).toBe('string');
    expect(createRecord.description).toContain('Create');
    // AI SDK tools have parameters/inputSchema
    expect(createRecord.inputSchema || createRecord.parameters).toBeDefined();
  });

  it('updateRecord has correct structure', () => {
    expect(updateRecord).toBeDefined();
    expect(typeof updateRecord.description).toBe('string');
    expect(updateRecord.description).toContain('Update');
    expect(updateRecord.inputSchema || updateRecord.parameters).toBeDefined();
  });

  it('checkConnection has correct structure', () => {
    expect(checkConnection).toBeDefined();
    expect(typeof checkConnection.description).toBe('string');
    expect(checkConnection.description).toContain('connection');
    expect(
      checkConnection.inputSchema || checkConnection.parameters,
    ).toBeDefined();
  });

  it('createInstallation has correct structure', () => {
    expect(createInstallation).toBeDefined();
    expect(typeof createInstallation.description).toBe('string');
    expect(createInstallation.description).toContain('installation');
    expect(
      createInstallation.inputSchema || createInstallation.parameters,
    ).toBeDefined();
  });

  it('checkInstallation has correct structure', () => {
    expect(checkInstallation).toBeDefined();
    expect(typeof checkInstallation.description).toBe('string');
    expect(checkInstallation.description).toContain('installation');
    expect(
      checkInstallation.inputSchema || checkInstallation.parameters,
    ).toBeDefined();
  });

  it('startOAuth has correct structure', () => {
    expect(startOAuth).toBeDefined();
    expect(typeof startOAuth.description).toBe('string');
    expect(startOAuth.description).toContain('OAuth');
    expect(startOAuth.inputSchema || startOAuth.parameters).toBeDefined();
  });

  it('sendRequest has correct structure', () => {
    expect(sendRequest).toBeDefined();
    expect(typeof sendRequest.description).toBe('string');
    expect(sendRequest.description).toContain('API');
    expect(sendRequest.inputSchema || sendRequest.parameters).toBeDefined();
  });

  it('sendReadRequest has correct structure', () => {
    expect(sendReadRequest).toBeDefined();
    expect(typeof sendReadRequest.description).toBe('string');
    expect(sendReadRequest.description).toContain('API');
    expect(
      sendReadRequest.inputSchema || sendReadRequest.parameters,
    ).toBeDefined();
  });
});

describe('AI SDK Adapter - Schema Validation via Tools', () => {
  it('createRecord validates input correctly', () => {
    const validInput = {
      objectName: 'Contact',
      type: 'create',
      record: { firstName: 'John' },
      groupRef: 'group-123',
    };

    expect(() => createActionSchema.parse(validInput)).not.toThrow();
  });

  it('updateRecord validates input correctly', () => {
    const validInput = {
      objectName: 'Contact',
      type: 'update',
      record: { id: '123', firstName: 'Jane' },
      groupRef: 'group-123',
    };

    expect(() => updateActionSchema.parse(validInput)).not.toThrow();
  });

  it('checkConnection validates provider input', () => {
    expect(() =>
      checkConnectionInputSchema.parse({ provider: 'salesforce' }),
    ).not.toThrow();

    expect(() => checkConnectionInputSchema.parse({})).toThrow();
  });

  it('createInstallation validates all required fields', () => {
    const valid = {
      provider: 'hubspot',
      connectionId: 'conn-123',
      groupRef: 'group-456',
    };

    expect(() => createInstallationInputSchema.parse(valid)).not.toThrow();
  });

  it('startOAuth validates required OAuth parameters', () => {
    const valid = {
      provider: 'salesforce',
      groupRef: 'group-123',
      consumerRef: 'user-456',
    };

    expect(() => startOAuthInputSchema.parse(valid)).not.toThrow();

    const withWorkspace = {
      ...valid,
      providerWorkspaceRef: 'mycompany',
    };

    expect(() => startOAuthInputSchema.parse(withWorkspace)).not.toThrow();
  });

  it('sendRequest validates required fields', () => {
    const valid = {
      provider: 'salesforce',
      endpoint: 'v60.0/sobjects/Account',
      method: 'GET',
    };

    expect(() => sendRequestInputSchema.parse(valid)).not.toThrow();
  });

  it('sendReadRequest validates required fields', () => {
    const valid = {
      provider: 'hubspot',
      endpoint: 'crm/v3/objects/contacts',
    };

    expect(() => sendReadRequestInputSchema.parse(valid)).not.toThrow();
  });
});

describe('AI SDK Adapter - startOAuth with MSW', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('startOAuth returns OAuth URL', async () => {
    // Set required env vars for the test
    const originalProjectId = process.env.AMPERSAND_PROJECT_ID;
    const originalApiKey = process.env.AMPERSAND_API_KEY;

    process.env.AMPERSAND_PROJECT_ID = 'test-project';
    process.env.AMPERSAND_API_KEY = 'test-api-key';

    try {
      const result = await startOAuth.execute({
        provider: 'salesforce',
        groupRef: 'group-123',
        consumerRef: 'user-456',
      });

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(typeof result.url).toBe('string');
      expect(result.url).toContain('oauth');
    } finally {
      // Restore env vars
      process.env.AMPERSAND_PROJECT_ID = originalProjectId;
      process.env.AMPERSAND_API_KEY = originalApiKey;
    }
  });

  it('startOAuth handles providerWorkspaceRef', async () => {
    const originalProjectId = process.env.AMPERSAND_PROJECT_ID;
    const originalApiKey = process.env.AMPERSAND_API_KEY;

    process.env.AMPERSAND_PROJECT_ID = 'test-project';
    process.env.AMPERSAND_API_KEY = 'test-api-key';

    try {
      const result = await startOAuth.execute({
        provider: 'salesforce',
        groupRef: 'group-123',
        consumerRef: 'user-456',
        providerWorkspaceRef: 'mycompany',
      });

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
    } finally {
      process.env.AMPERSAND_PROJECT_ID = originalProjectId;
      process.env.AMPERSAND_API_KEY = originalApiKey;
    }
  });
});

describe('AI SDK Adapter - Tool exports', () => {
  it('exports all 8 tools', () => {
    const tools = [
      createRecord,
      updateRecord,
      checkConnection,
      createInstallation,
      checkInstallation,
      startOAuth,
      sendRequest,
      sendReadRequest,
    ];

    expect(tools.length).toBe(8);
    tools.forEach((tool) => {
      expect(tool).toBeDefined();
      expect(typeof tool.execute).toBe('function');
    });
  });

  it('all tools have execute function', () => {
    expect(typeof createRecord.execute).toBe('function');
    expect(typeof updateRecord.execute).toBe('function');
    expect(typeof checkConnection.execute).toBe('function');
    expect(typeof createInstallation.execute).toBe('function');
    expect(typeof checkInstallation.execute).toBe('function');
    expect(typeof startOAuth.execute).toBe('function');
    expect(typeof sendRequest.execute).toBe('function');
    expect(typeof sendReadRequest.execute).toBe('function');
  });
});
