/**
 * Test Setup - MSW Server Configuration
 *
 * This file sets up the Mock Service Worker (MSW) server for intercepting
 * HTTP requests during tests. Import and use in test files.
 */

import { afterAll, afterEach, beforeAll } from 'bun:test';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Create the MSW server with default handlers
export const server = setupServer(...handlers);

/**
 * Setup function to be called in test files that need HTTP mocking.
 * Call this at the top of your test file.
 *
 * @example
 * import { setupMocks } from '../setup';
 * setupMocks();
 */
export function setupMocks() {
  // Start server before all tests
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
  });

  // Reset handlers after each test (removes any runtime handlers)
  afterEach(() => {
    server.resetHandlers();
  });

  // Clean up after all tests
  afterAll(() => {
    server.close();
  });
}

// Export server for adding runtime handlers in specific tests
export { server as mockServer };
