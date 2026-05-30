/**
 * Integration Tests: MCP Adapter
 *
 * Tests the MCP adapter tool factory functions for:
 * - Tool factory function structure
 * - ClientSettings parameter handling
 * - MCPResponse format
 */

import { describe, it, expect } from 'bun:test';
import { http, HttpResponse } from 'msw';

// Import MCP tool factory functions
import {
  createWriteActionTool,
  createCheckConnectionTool,
  createCreateInstallationTool,
  createCheckInstallationTool,
  createStartOAuthTool,
  createSendRequestTool,
} from '../../lib/adapters/mcp';

// Shared MSW server setup
import { setupMocks, mockServer as mswServer } from '../setup';
setupMocks();

// Types for mock MCP server
interface MCPContent {
  type: string;
  text: string;
}

interface MCPResponse {
  content: MCPContent[];
  isError?: boolean;
}

interface MockTool {
  name: string;
  description: string;
  schema: Record<string, unknown>;
  handler: (params: Record<string, unknown>) => Promise<MCPResponse>;
}

// Mock MCP Server for testing tool registration
class MockMCPServer {
  tools: Map<string, MockTool> = new Map();

  tool(
    name: string,
    description: string,
    schema: Record<string, unknown>,
    handler: (params: Record<string, unknown>) => Promise<MCPResponse>,
  ): MockTool {
    const toolDef: MockTool = { name, description, schema, handler };
    this.tools.set(name, toolDef);
    return toolDef;
  }
}

// Helper to cast mock server to the expected type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asMCPServer(mock: MockMCPServer): any {
  return mock;
}

describe('MCP Adapter - Tool Factory Functions', () => {
  it('exports createWriteActionTool factory', () => {
    expect(typeof createWriteActionTool).toBe('function');
  });

  it('exports createCheckConnectionTool factory', () => {
    expect(typeof createCheckConnectionTool).toBe('function');
  });

  it('exports createCreateInstallationTool factory', () => {
    expect(typeof createCreateInstallationTool).toBe('function');
  });

  it('exports createCheckInstallationTool factory', () => {
    expect(typeof createCheckInstallationTool).toBe('function');
  });

  it('exports createStartOAuthTool factory', () => {
    expect(typeof createStartOAuthTool).toBe('function');
  });

  it('exports createSendRequestTool factory', () => {
    expect(typeof createSendRequestTool).toBe('function');
  });
});

describe('MCP Adapter - ClientSettings type', () => {
  const validSettings = {
    project: 'test-project',
    integrationName: 'test-integration',
    apiKey: 'test-api-key',
    groupRef: 'test-group',
  };

  const settingsWithWorkspace = {
    ...validSettings,
    providerWorkspaceRef: 'mycompany',
  };

  it('settings object has required fields', () => {
    expect(validSettings.project).toBeDefined();
    expect(validSettings.integrationName).toBeDefined();
    expect(validSettings.apiKey).toBeDefined();
    expect(validSettings.groupRef).toBeDefined();
  });

  it('settings can include optional providerWorkspaceRef', () => {
    expect(settingsWithWorkspace.providerWorkspaceRef).toBe('mycompany');
  });
});

describe('MCP Adapter - Tool Registration', () => {
  const mockServer = new MockMCPServer();
  const testSettings = {
    project: 'test-project',
    integrationName: 'test-integration',
    apiKey: 'test-api-key',
    groupRef: 'test-group',
  };

  it('createCheckConnectionTool registers check-connection tool', async () => {
    await createCheckConnectionTool(asMCPServer(mockServer), testSettings);

    expect(mockServer.tools.has('check-connection')).toBe(true);

    const tool = mockServer.tools.get('check-connection');
    expect(tool?.name).toBe('check-connection');
    expect(typeof tool?.description).toBe('string');
    expect(tool?.description).toContain('connection');
    expect(typeof tool?.handler).toBe('function');
  });

  it('createCreateInstallationTool registers create-installation tool', async () => {
    await createCreateInstallationTool(asMCPServer(mockServer), testSettings);

    expect(mockServer.tools.has('create-installation')).toBe(true);

    const tool = mockServer.tools.get('create-installation');
    expect(tool?.name).toBe('create-installation');
    expect(typeof tool?.description).toBe('string');
    expect(typeof tool?.handler).toBe('function');
  });

  it('createCheckInstallationTool registers check-installation tool', async () => {
    await createCheckInstallationTool(asMCPServer(mockServer), testSettings);

    expect(mockServer.tools.has('check-installation')).toBe(true);

    const tool = mockServer.tools.get('check-installation');
    expect(tool?.name).toBe('check-installation');
    expect(typeof tool?.handler).toBe('function');
  });

  it('createStartOAuthTool registers start-oauth tool', async () => {
    await createStartOAuthTool(asMCPServer(mockServer), testSettings);

    expect(mockServer.tools.has('start-oauth')).toBe(true);

    const tool = mockServer.tools.get('start-oauth');
    expect(tool?.name).toBe('start-oauth');
    expect(typeof tool?.description).toBe('string');
    expect(tool?.description).toContain('OAuth');
    expect(typeof tool?.handler).toBe('function');
  });

  it('createSendRequestTool registers send-request tool', async () => {
    await createSendRequestTool(asMCPServer(mockServer), testSettings);

    expect(mockServer.tools.has('send-request')).toBe(true);

    const tool = mockServer.tools.get('send-request');
    expect(tool?.name).toBe('send-request');
    expect(typeof tool?.description).toBe('string');
    expect(typeof tool?.handler).toBe('function');
  });

  it('createWriteActionTool registers tools with custom names', async () => {
    await createWriteActionTool(
      asMCPServer(mockServer),
      'create',
      'amp-create-record',
      testSettings,
    );
    await createWriteActionTool(
      asMCPServer(mockServer),
      'update',
      'amp-update-record',
      testSettings,
    );

    expect(mockServer.tools.has('amp-create-record')).toBe(true);
    expect(mockServer.tools.has('amp-update-record')).toBe(true);

    const createTool = mockServer.tools.get('amp-create-record');
    expect(createTool?.description).toContain('create');

    const updateTool = mockServer.tools.get('amp-update-record');
    expect(updateTool?.description).toContain('update');
  });
});

describe('MCP Adapter - startOAuth handler with MSW', () => {
  it('startOAuth handler returns MCPResponse format', async () => {
    const mockServer = new MockMCPServer();
    const testSettings = {
      project: 'test-project',
      integrationName: 'test-integration',
      apiKey: 'test-api-key',
      groupRef: 'test-group',
    };

    await createStartOAuthTool(asMCPServer(mockServer), testSettings);

    const tool = mockServer.tools.get('start-oauth');
    expect(tool).toBeDefined();

    // Call the handler
    const result = await tool!.handler({
      provider: 'salesforce',
      groupRef: 'group-123',
      consumerRef: 'user-456',
    });

    // Verify MCPResponse format
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    // Each content item should have type and text
    result.content.forEach((item) => {
      expect(item.type).toBe('text');
      expect(typeof item.text).toBe('string');
    });

    // Should contain OAuth URL
    const hasOAuthUrl = result.content.some((item) =>
      item.text.toLowerCase().includes('oauth'),
    );
    expect(hasOAuthUrl).toBe(true);
  });

  it('startOAuth handler uses settings for groupRef fallback', async () => {
    const mockServer = new MockMCPServer();
    const testSettings = {
      project: 'test-project',
      integrationName: 'test-integration',
      apiKey: 'test-api-key',
      groupRef: 'settings-group', // Should be used as fallback
    };

    await createStartOAuthTool(asMCPServer(mockServer), testSettings);

    const tool = mockServer.tools.get('start-oauth');

    // Call without groupRef - should use settings.groupRef
    const result = await tool!.handler({
      provider: 'hubspot',
      consumerRef: 'user-789',
    });

    expect(result.content).toBeDefined();
    expect(result.isError).toBeUndefined();
  });

  it('startOAuth handler supports providerWorkspaceRef from settings', async () => {
    const mockServer = new MockMCPServer();
    const testSettings = {
      project: 'test-project',
      integrationName: 'test-integration',
      apiKey: 'test-api-key',
      groupRef: 'test-group',
      providerWorkspaceRef: 'mycompany', // Should be included in request
    };

    await createStartOAuthTool(asMCPServer(mockServer), testSettings);

    const tool = mockServer.tools.get('start-oauth');

    const result = await tool!.handler({
      provider: 'salesforce',
      groupRef: 'group-123',
      consumerRef: 'user-456',
    });

    expect(result.content).toBeDefined();
  });
});

describe('MCP Adapter - MCPResponse error format', () => {
  it('error responses from network failures include isError flag', async () => {
    // Override the handler to throw a network error
    mswServer.use(
      http.post('https://api.withampersand.com/v1/oauth-connect', () => {
        return HttpResponse.error();
      }),
    );

    const mockServer = new MockMCPServer();
    const testSettings = {
      project: 'test-project',
      integrationName: 'test-integration',
      apiKey: 'test-api-key',
      groupRef: 'test-group',
    };

    await createStartOAuthTool(asMCPServer(mockServer), testSettings);

    const tool = mockServer.tools.get('start-oauth');

    const result = await tool!.handler({
      provider: 'salesforce',
      groupRef: 'group-123',
      consumerRef: 'user-456',
    });

    // Error responses should have isError: true
    expect(result.isError).toBe(true);
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
    // Error message should be in content
    expect(result.content[0].text).toContain('Error');
  });
});

describe('MCP Adapter - All factory functions are async', () => {
  const mockServer = new MockMCPServer();
  const testSettings = {
    project: 'test-project',
    integrationName: 'test-integration',
    apiKey: 'test-api-key',
    groupRef: 'test-group',
  };

  it('createWriteActionTool returns Promise', () => {
    const result = createWriteActionTool(
      asMCPServer(mockServer),
      'create',
      'test-create',
      testSettings,
    );
    expect(result).toBeInstanceOf(Promise);
  });

  it('createCheckConnectionTool returns Promise', () => {
    const result = createCheckConnectionTool(
      asMCPServer(mockServer),
      testSettings,
    );
    expect(result).toBeInstanceOf(Promise);
  });

  it('createCreateInstallationTool returns Promise', () => {
    const result = createCreateInstallationTool(
      asMCPServer(mockServer),
      testSettings,
    );
    expect(result).toBeInstanceOf(Promise);
  });

  it('createCheckInstallationTool returns Promise', () => {
    const result = createCheckInstallationTool(
      asMCPServer(mockServer),
      testSettings,
    );
    expect(result).toBeInstanceOf(Promise);
  });

  it('createStartOAuthTool returns Promise', () => {
    const result = createStartOAuthTool(asMCPServer(mockServer), testSettings);
    expect(result).toBeInstanceOf(Promise);
  });

  it('createSendRequestTool returns Promise', () => {
    const result = createSendRequestTool(asMCPServer(mockServer), testSettings);
    expect(result).toBeInstanceOf(Promise);
  });
});
