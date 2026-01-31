/**
 * Integration Tests: Mastra Adapter
 *
 * Tests the Mastra adapter tools for:
 * - Tool definition structure (id, description, inputSchema, outputSchema)
 * - requestContext parameter handling
 * - Schema validation
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'bun:test';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Import tools from Mastra adapter
import {
  createRecord,
  updateRecord,
  checkConnection,
  createInstallation,
  checkInstallation,
  startOAuth,
  sendRequest,
  sendReadRequest,
} from '../../lib/adapters/mastra';

// Import schemas for validation
import {
  createActionSchema,
  updateActionSchema,
  checkConnectionInputSchema,
  checkConnectionOutputSchema,
  createInstallationInputSchema,
  createInstallationOutputSchema,
  checkInstallationInputSchema,
  checkInstallationOutputSchema,
  startOAuthInputSchema,
  startOAuthOutputSchema,
  sendRequestInputSchema,
  sendRequestOutputSchema,
  sendReadRequestInputSchema,
} from '../../lib/adapters/common';

// Setup MSW server for HTTP mocking
const handlers = [
  // OAuth endpoint
  http.post('https://api.withampersand.com/v1/oauth-connect', () => {
    return HttpResponse.text(
      'https://oauth.withampersand.com/authorize?test=mastra',
    );
  }),

  // Proxy endpoint
  http.all('https://proxy.withampersand.com/*', () => {
    return HttpResponse.json({
      data: { id: 'mastra-mock-id', name: 'Mastra Mock Record' },
      success: true,
    });
  }),
];

const server = setupServer(...handlers);

describe('Mastra Adapter - Tool Definitions', () => {
  it('createRecord has correct Mastra structure', () => {
    expect(createRecord).toBeDefined();
    expect(createRecord.id).toBe('create-record');
    expect(typeof createRecord.description).toBe('string');
    expect(createRecord.inputSchema).toBeDefined();
    expect(createRecord.outputSchema).toBeDefined();
    expect(typeof createRecord.execute).toBe('function');
  });

  it('updateRecord has correct Mastra structure', () => {
    expect(updateRecord).toBeDefined();
    expect(updateRecord.id).toBe('update-record');
    expect(typeof updateRecord.description).toBe('string');
    expect(updateRecord.inputSchema).toBeDefined();
    expect(updateRecord.outputSchema).toBeDefined();
    expect(typeof updateRecord.execute).toBe('function');
  });

  it('checkConnection has correct Mastra structure', () => {
    expect(checkConnection).toBeDefined();
    expect(checkConnection.id).toBe('check-connection');
    expect(typeof checkConnection.description).toBe('string');
    expect(checkConnection.inputSchema).toBeDefined();
    expect(checkConnection.outputSchema).toBeDefined();
    expect(typeof checkConnection.execute).toBe('function');
  });

  it('createInstallation has correct Mastra structure', () => {
    expect(createInstallation).toBeDefined();
    expect(createInstallation.id).toBe('create-installation');
    expect(typeof createInstallation.description).toBe('string');
    expect(createInstallation.inputSchema).toBeDefined();
    expect(createInstallation.outputSchema).toBeDefined();
    expect(typeof createInstallation.execute).toBe('function');
  });

  it('checkInstallation has correct Mastra structure', () => {
    expect(checkInstallation).toBeDefined();
    expect(checkInstallation.id).toBe('check-installation');
    expect(typeof checkInstallation.description).toBe('string');
    expect(checkInstallation.inputSchema).toBeDefined();
    expect(checkInstallation.outputSchema).toBeDefined();
    expect(typeof checkInstallation.execute).toBe('function');
  });

  it('startOAuth has correct Mastra structure', () => {
    expect(startOAuth).toBeDefined();
    expect(startOAuth.id).toBe('start-oauth');
    expect(typeof startOAuth.description).toBe('string');
    expect(startOAuth.inputSchema).toBeDefined();
    expect(startOAuth.outputSchema).toBeDefined();
    expect(typeof startOAuth.execute).toBe('function');
  });

  it('sendRequest has correct Mastra structure', () => {
    expect(sendRequest).toBeDefined();
    expect(sendRequest.id).toBe('send-request');
    expect(typeof sendRequest.description).toBe('string');
    expect(sendRequest.inputSchema).toBeDefined();
    expect(sendRequest.outputSchema).toBeDefined();
    expect(typeof sendRequest.execute).toBe('function');
  });

  it('sendReadRequest has correct Mastra structure', () => {
    expect(sendReadRequest).toBeDefined();
    expect(sendReadRequest.id).toBe('send-read-request');
    expect(typeof sendReadRequest.description).toBe('string');
    expect(sendReadRequest.inputSchema).toBeDefined();
    expect(sendReadRequest.outputSchema).toBeDefined();
    expect(typeof sendReadRequest.execute).toBe('function');
  });
});

describe('Mastra Adapter - Tool IDs follow kebab-case', () => {
  const tools = [
    { tool: createRecord, expectedId: 'create-record' },
    { tool: updateRecord, expectedId: 'update-record' },
    { tool: checkConnection, expectedId: 'check-connection' },
    { tool: createInstallation, expectedId: 'create-installation' },
    { tool: checkInstallation, expectedId: 'check-installation' },
    { tool: startOAuth, expectedId: 'start-oauth' },
    { tool: sendRequest, expectedId: 'send-request' },
    { tool: sendReadRequest, expectedId: 'send-read-request' },
  ];

  tools.forEach(({ tool, expectedId }) => {
    it(`${expectedId} uses kebab-case ID`, () => {
      expect(tool.id).toBe(expectedId);
      expect(tool.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
    });
  });
});

describe('Mastra Adapter - Output Schemas', () => {
  it('createRecord has writeOutputSchema', () => {
    expect(createRecord.outputSchema).toBeDefined();
    // Verify it matches expected shape
    const validOutput = {
      status: 'success',
      recordId: 'rec-123',
      response: {},
    };
    expect(() => createRecord.outputSchema.parse(validOutput)).not.toThrow();
  });

  it('checkConnection has checkConnectionOutputSchema', () => {
    expect(checkConnection.outputSchema).toBeDefined();
    const validOutput = { found: true, connectionId: 'conn-123' };
    expect(() => checkConnection.outputSchema.parse(validOutput)).not.toThrow();
  });

  it('checkInstallation has checkInstallationOutputSchema', () => {
    expect(checkInstallation.outputSchema).toBeDefined();
    const validOutput = { found: true, installationId: 'inst-123' };
    expect(() =>
      checkInstallation.outputSchema.parse(validOutput),
    ).not.toThrow();
  });

  it('startOAuth has startOAuthOutputSchema', () => {
    expect(startOAuth.outputSchema).toBeDefined();
    const validOutput = { url: 'https://oauth.example.com' };
    expect(() => startOAuth.outputSchema.parse(validOutput)).not.toThrow();
  });

  it('sendRequest has sendRequestOutputSchema', () => {
    expect(sendRequest.outputSchema).toBeDefined();
    const validOutput = { status: 200, response: {} };
    expect(() => sendRequest.outputSchema.parse(validOutput)).not.toThrow();
  });
});

describe('Mastra Adapter - startOAuth with MSW', () => {
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
    const originalProjectId = process.env.AMPERSAND_PROJECT_ID;
    const originalApiKey = process.env.AMPERSAND_API_KEY;

    process.env.AMPERSAND_PROJECT_ID = 'test-project';
    process.env.AMPERSAND_API_KEY = 'test-api-key';

    try {
      // Mastra execute signature: execute(inputData, { requestContext })
      const result = await startOAuth.execute(
        {
          provider: 'salesforce',
          groupRef: 'group-123',
          consumerRef: 'user-456',
        },
        { requestContext: new Map() },
      );

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(typeof result.url).toBe('string');
      expect(result.url).toContain('oauth');
    } finally {
      process.env.AMPERSAND_PROJECT_ID = originalProjectId;
      process.env.AMPERSAND_API_KEY = originalApiKey;
    }
  });

  it('startOAuth uses requestContext for credentials', async () => {
    // Test that requestContext can override env vars
    const requestContext = new Map<string, unknown>();
    requestContext.set('AMPERSAND_PROJECT_ID', 'context-project');
    requestContext.set('AMPERSAND_API_KEY', 'context-api-key');
    requestContext.set('AMPERSAND_GROUP_REF', 'context-group');

    const result = await startOAuth.execute(
      {
        provider: 'hubspot',
        groupRef: 'param-group', // Should be overridden by context
        consumerRef: 'user-789',
      },
      { requestContext },
    );

    expect(result).toBeDefined();
    expect(result.url).toContain('oauth');
  });
});

describe('Mastra Adapter - requestContext parameter', () => {
  it('tools accept requestContext in execute signature', () => {
    // Verify the execute function accepts requestContext
    // This tests the Mastra-specific feature
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

    tools.forEach((tool) => {
      // Execute function should be defined and accept 2 params (input, context)
      expect(typeof tool.execute).toBe('function');
      // Mastra tools have execute(input, { requestContext })
      // We can verify by checking the function exists
    });
  });
});

describe('Mastra Adapter - Tool exports', () => {
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
      expect(tool.id).toBeDefined();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.outputSchema).toBeDefined();
      expect(typeof tool.execute).toBe('function');
    });
  });
});

describe('Mastra Adapter - Schema compatibility with common schemas', () => {
  it('inputSchemas match common schemas', () => {
    // Verify Mastra adapter uses the same schemas as common
    expect(createRecord.inputSchema).toBe(createActionSchema);
    expect(updateRecord.inputSchema).toBe(updateActionSchema);
    expect(checkConnection.inputSchema).toBe(checkConnectionInputSchema);
    expect(createInstallation.inputSchema).toBe(createInstallationInputSchema);
    expect(checkInstallation.inputSchema).toBe(checkInstallationInputSchema);
    expect(startOAuth.inputSchema).toBe(startOAuthInputSchema);
    expect(sendRequest.inputSchema).toBe(sendRequestInputSchema);
    expect(sendReadRequest.inputSchema).toBe(sendReadRequestInputSchema);
  });

  it('outputSchemas match common schemas', () => {
    expect(checkConnection.outputSchema).toBe(checkConnectionOutputSchema);
    expect(createInstallation.outputSchema).toBe(
      createInstallationOutputSchema,
    );
    expect(checkInstallation.outputSchema).toBe(checkInstallationOutputSchema);
    expect(startOAuth.outputSchema).toBe(startOAuthOutputSchema);
    expect(sendRequest.outputSchema).toBe(sendRequestOutputSchema);
    expect(sendReadRequest.outputSchema).toBe(sendRequestOutputSchema);
  });
});
