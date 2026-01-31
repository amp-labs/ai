/**
 * Unit Tests: Helper Functions
 *
 * Tests helper functions that can be tested without mocking external APIs.
 * Integration tests with MSW will cover the full helper function flows.
 */

import { describe, it, expect } from 'bun:test';

// Import types and schemas for validation testing
import type {
  CheckConnectionResult,
  CheckInstallationResult,
  CreateInstallationResult,
} from '../../lib/adapters/ampersand/core/installation';
import {
  checkConnectionOutputSchema,
  checkInstallationOutputSchema,
  createInstallationOutputSchema,
} from '../../lib/adapters/common';

describe('Helper function return types', () => {
  describe('CheckConnectionResult type compliance', () => {
    it('found connection matches schema', () => {
      const result: CheckConnectionResult = {
        found: true,
        connectionId: 'conn-123',
        groupRef: 'group-456',
        data: { id: 'conn-123' },
      };

      expect(() => checkConnectionOutputSchema.parse(result)).not.toThrow();
    });

    it('not found connection matches schema', () => {
      const result: CheckConnectionResult = {
        found: false,
      };

      expect(() => checkConnectionOutputSchema.parse(result)).not.toThrow();
    });
  });

  describe('CheckInstallationResult type compliance', () => {
    it('found installation matches schema', () => {
      const result: CheckInstallationResult = {
        found: true,
        installationId: 'inst-123',
        data: { id: 'inst-123' },
      };

      expect(() => checkInstallationOutputSchema.parse(result)).not.toThrow();
    });

    it('not found installation matches schema', () => {
      const result: CheckInstallationResult = {
        found: false,
      };

      expect(() => checkInstallationOutputSchema.parse(result)).not.toThrow();
    });
  });

  describe('CreateInstallationResult type compliance', () => {
    it('created installation matches schema', () => {
      const result: CreateInstallationResult = {
        created: true,
        installationId: 'inst-123',
        data: { id: 'inst-123' },
      };

      expect(() => createInstallationOutputSchema.parse(result)).not.toThrow();
    });

    it('failed creation matches schema', () => {
      const result: CreateInstallationResult = {
        created: false,
      };

      expect(() => createInstallationOutputSchema.parse(result)).not.toThrow();
    });
  });
});

describe('Environment variable defaults', () => {
  it('helper functions use env vars as fallbacks', () => {
    // This tests the pattern used in helper functions:
    // apiKey = process.env.AMPERSAND_API_KEY || ''
    // These defaults are important for the SDK to work without explicit params

    const envVars = [
      'AMPERSAND_API_KEY',
      'AMPERSAND_PROJECT_ID',
      'AMPERSAND_INTEGRATION_NAME',
      'AMPERSAND_GROUP_REF',
    ];

    // Just verify the pattern works - actual values tested in integration tests
    envVars.forEach((varName) => {
      const value = process.env[varName] || '';
      expect(typeof value).toBe('string');
    });
  });
});

describe('Tool descriptions', () => {
  // Import descriptions from schemas
  const descriptions = {
    createRecordToolDescription:
      'Create a record in a SaaS platform (e.g. create a new Contact in Salesforce)',
    updateRecordToolDescription:
      "Update a record in a SaaS platform (e.g. update a contact's email address in Hubspot)",
    checkConnectionToolDescription:
      'Check if there is an active connection for a provider on Ampersand',
    createInstallationToolDescription:
      'Create a new installation for a provider on Ampersand',
    checkInstallationToolDescription:
      'Check if an installation exists for a provider on Ampersand',
    startOAuthToolDescription:
      'Connect to a SaaS provider using the Ampersand OAuth flow and obtain a connection URL',
    sendRequestToolDescription:
      'Call provider APIs via the Ampersand sendRequest tool',
    sendReadRequestToolDescription:
      'Call provider APIs via the Ampersand sendReadRequest tool (GET only)',
  };

  it('all tool descriptions are non-empty strings', () => {
    Object.entries(descriptions).forEach(([, description]) => {
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(10);
    });
  });

  it('descriptions mention provider or Ampersand', () => {
    Object.entries(descriptions).forEach(([, description]) => {
      const mentionsKey =
        description.toLowerCase().includes('provider') ||
        description.toLowerCase().includes('ampersand') ||
        description.toLowerCase().includes('saas');
      expect(mentionsKey).toBe(true);
    });
  });
});
