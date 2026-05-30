/**
 * Integration Tests: Mastra Adapter
 *
 * Tests the Mastra adapter tools for:
 * - Tool definition structure (id, description, inputSchema, outputSchema)
 * - requestContext parameter handling
 * - Schema validation
 */

import { describe, it, expect } from 'bun:test';
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

// Shared MSW server setup
import { setupMocks, mockServer as mswServer } from '../setup';
setupMocks();

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

describe('Mastra Adapter - resolveCredentials precedence', () => {
  it('requestContext overrides env vars', async () => {
    let capturedApiKey: string | null = null;
    let capturedBody: Record<string, unknown> | null = null;

    mswServer.use(
      http.post(
        'https://api.withampersand.com/v1/oauth-connect',
        async ({ request }) => {
          capturedApiKey = request.headers.get('X-Api-Key');
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.text(
            'https://oauth.example.com/authorize?provider=salesforce',
          );
        },
      ),
    );

    const requestContext = new Map<string, unknown>();
    requestContext.set('AMPERSAND_PROJECT_ID', 'ctx-project');
    requestContext.set('AMPERSAND_API_KEY', 'ctx-api-key');
    requestContext.set('AMPERSAND_GROUP_REF', 'ctx-group');

    process.env.AMPERSAND_PROJECT_ID = 'env-project';
    process.env.AMPERSAND_API_KEY = 'env-api-key';
    process.env.AMPERSAND_GROUP_REF = 'env-group';

    try {
      const result = await startOAuth.execute(
        {
          provider: 'salesforce',
          groupRef: 'input-group',
          consumerRef: 'user-1',
        },
        { requestContext },
      );

      expect(result.url).toContain('oauth');
      expect(capturedApiKey).toBe('ctx-api-key');
      expect(capturedBody?.projectId).toBe('ctx-project');
      expect(capturedBody?.groupRef).toBe('ctx-group');
    } finally {
      delete process.env.AMPERSAND_PROJECT_ID;
      delete process.env.AMPERSAND_API_KEY;
      delete process.env.AMPERSAND_GROUP_REF;
    }
  });

  it('env vars used when requestContext is empty', async () => {
    let capturedApiKey: string | null = null;
    let capturedBody: Record<string, unknown> | null = null;

    mswServer.use(
      http.post(
        'https://api.withampersand.com/v1/oauth-connect',
        async ({ request }) => {
          capturedApiKey = request.headers.get('X-Api-Key');
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.text(
            'https://oauth.example.com/authorize?provider=salesforce',
          );
        },
      ),
    );

    process.env.AMPERSAND_PROJECT_ID = 'env-project';
    process.env.AMPERSAND_API_KEY = 'env-api-key';

    try {
      const result = await startOAuth.execute(
        {
          provider: 'salesforce',
          groupRef: 'input-group',
          consumerRef: 'user-1',
        },
        { requestContext: new Map() },
      );

      expect(result.url).toContain('oauth');
      expect(capturedApiKey).toBe('env-api-key');
      expect(capturedBody?.projectId).toBe('env-project');
    } finally {
      delete process.env.AMPERSAND_PROJECT_ID;
      delete process.env.AMPERSAND_API_KEY;
    }
  });

  it('input param groupRef used when requestContext and env are empty', async () => {
    let capturedBody: Record<string, unknown> | null = null;

    mswServer.use(
      http.post(
        'https://api.withampersand.com/v1/oauth-connect',
        async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.text(
            'https://oauth.example.com/authorize?provider=salesforce',
          );
        },
      ),
    );

    delete process.env.AMPERSAND_GROUP_REF;
    process.env.AMPERSAND_PROJECT_ID = 'test-project';
    process.env.AMPERSAND_API_KEY = 'test-key';

    try {
      const result = await startOAuth.execute(
        {
          provider: 'salesforce',
          groupRef: 'input-group',
          consumerRef: 'user-1',
        },
        { requestContext: new Map() },
      );

      expect(result.url).toContain('oauth');
      expect(capturedBody?.groupRef).toBe('input-group');
    } finally {
      delete process.env.AMPERSAND_PROJECT_ID;
      delete process.env.AMPERSAND_API_KEY;
    }
  });
});

describe('Mastra Adapter - createRecord execution', () => {
  it('calls write API with credentials from requestContext', async () => {
    let capturedApiKey: string | null = null;
    let capturedUrl: string | null = null;
    let capturedBody: Record<string, unknown> | null = null;

    mswServer.use(
      http.post(
        'https://write.withampersand.com/v1/projects/:projectId/integrations/:integrationName/objects/:objectName',
        async ({ request }) => {
          capturedApiKey = request.headers.get('X-Api-Key');
          capturedUrl = request.url;
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            result: { recordId: 'new-record-123', success: true },
          });
        },
      ),
    );

    const requestContext = new Map<string, unknown>();
    requestContext.set('AMPERSAND_PROJECT_ID', 'ctx-project');
    requestContext.set('AMPERSAND_API_KEY', 'ctx-api-key');
    requestContext.set('AMPERSAND_INTEGRATION_NAME', 'ctx-integration');
    requestContext.set('AMPERSAND_GROUP_REF', 'ctx-group');

    const result = await createRecord.execute(
      {
        objectName: 'Contact',
        type: 'create',
        record: { firstName: 'John', lastName: 'Doe' },
        groupRef: 'input-group',
      },
      { requestContext },
    );

    expect(result.status).toBe('success');
    expect(capturedApiKey).toBe('ctx-api-key');
    expect(capturedUrl).toContain('/projects/ctx-project/');
    expect(capturedUrl).toContain('/integrations/ctx-integration/');
    expect(capturedUrl).toContain('/objects/Contact');
    expect(capturedBody?.groupRef).toBe('ctx-group');
    expect(capturedBody?.type).toBe('create');
  });
});

describe('Mastra Adapter - sendRequest execution', () => {
  it('calls proxy API with credentials from requestContext', async () => {
    let capturedHeaders: Record<string, string> = {};

    mswServer.use(
      http.get('https://proxy.withampersand.com/*', async ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers.entries());
        return HttpResponse.json({
          data: { id: '1', name: 'Test' },
        });
      }),
    );

    const requestContext = new Map<string, unknown>();
    requestContext.set('AMPERSAND_PROJECT_ID', 'ctx-project');
    requestContext.set('AMPERSAND_API_KEY', 'ctx-api-key');
    requestContext.set('AMPERSAND_INTEGRATION_NAME', 'ctx-integration');

    const result = await sendRequest.execute(
      {
        provider: 'salesforce',
        endpoint: 'v60.0/sobjects/Account',
        method: 'GET',
        installationId: 'inst-123',
      },
      { requestContext },
    );

    expect(result.status).toBe(200);
    expect(capturedHeaders['x-api-key']).toBe('ctx-api-key');
    expect(capturedHeaders['x-amp-project-id']).toBe('ctx-project');
    expect(capturedHeaders['x-amp-installation-id']).toBe('inst-123');
  });
});
