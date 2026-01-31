/**
 * MSW HTTP Mock Handlers
 *
 * Default handlers for mocking Ampersand API endpoints during tests.
 * These handlers simulate successful API responses for integration testing.
 */

import { http, HttpResponse } from 'msw';

// Mock data
export const mockConnection = {
  id: 'conn-mock-123',
  provider: 'salesforce',
  groupRef: 'test-group-ref',
  createTime: '2024-01-01T00:00:00Z',
};

export const mockInstallation = {
  id: 'inst-mock-456',
  connectionId: 'conn-mock-123',
  provider: 'salesforce',
  groupRef: 'test-group-ref',
};

export const mockWriteResponse = {
  result: {
    id: 'record-mock-789',
    success: true,
  },
};

export const handlers = [
  // ============================================
  // Ampersand API Endpoints
  // ============================================

  // List connections
  http.get(
    'https://api.withampersand.com/v1/projects/:projectId/connections',
    () => {
      return HttpResponse.json({
        connections: [mockConnection],
      });
    },
  ),

  // Check connection by provider
  http.get(
    'https://api.withampersand.com/v1/projects/:projectId/provider/:provider/connections',
    () => {
      return HttpResponse.json({
        connections: [mockConnection],
      });
    },
  ),

  // List installations
  http.get(
    'https://api.withampersand.com/v1/projects/:projectId/installations',
    () => {
      return HttpResponse.json({
        installations: [mockInstallation],
      });
    },
  ),

  // Check installation
  http.get(
    'https://api.withampersand.com/v1/projects/:projectId/integrations/:integrationName/installations',
    () => {
      return HttpResponse.json({
        installations: [mockInstallation],
      });
    },
  ),

  // Create installation
  http.post(
    'https://api.withampersand.com/v1/projects/:projectId/integrations/:integrationName/installations',
    () => {
      return HttpResponse.json(mockInstallation, { status: 201 });
    },
  ),

  // OAuth connect
  http.post(
    'https://api.withampersand.com/v1/oauth-connect',
    async ({ request }) => {
      const body = (await request.json()) as { provider: string };
      return HttpResponse.text(
        `https://oauth.withampersand.com/authorize?provider=${body.provider}&redirect_uri=https://example.com`,
      );
    },
  ),

  // ============================================
  // Ampersand Write API (sdk-node-write)
  // ============================================

  // Write operations (create/update records)
  http.post(
    'https://write.withampersand.com/v1/projects/:projectId/write',
    () => {
      return HttpResponse.json(mockWriteResponse);
    },
  ),

  // ============================================
  // Ampersand Proxy Endpoints
  // ============================================

  // Proxy all requests
  http.all('https://proxy.withampersand.com/*', async ({ request }) => {
    // Return mock data based on method
    if (request.method === 'GET') {
      return HttpResponse.json({
        data: { id: 'mock-id', name: 'Mock Record' },
        success: true,
      });
    }

    if (
      request.method === 'POST' ||
      request.method === 'PUT' ||
      request.method === 'PATCH'
    ) {
      return HttpResponse.json({
        id: 'created-mock-id',
        success: true,
      });
    }

    if (request.method === 'DELETE') {
      return HttpResponse.json({ success: true });
    }

    return HttpResponse.json({ success: true });
  }),

  // ============================================
  // Error Handlers (for testing error scenarios)
  // ============================================

  // Use these by adding them at runtime:
  // mockServer.use(errorHandlers.connectionNotFound)
];

// Error response handlers - use with mockServer.use() for specific tests
export const errorHandlers = {
  connectionNotFound: http.get(
    'https://api.withampersand.com/v1/projects/:projectId/provider/:provider/connections',
    () => {
      return HttpResponse.json({ connections: [] });
    },
  ),

  installationNotFound: http.get(
    'https://api.withampersand.com/v1/projects/:projectId/integrations/:integrationName/installations',
    () => {
      return HttpResponse.json({ installations: [] });
    },
  ),

  serverError: http.all('https://api.withampersand.com/*', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }),

  unauthorized: http.all('https://api.withampersand.com/*', () => {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),

  proxyError: http.all('https://proxy.withampersand.com/*', () => {
    return HttpResponse.json({ error: 'Proxy Error' }, { status: 502 });
  }),
};
