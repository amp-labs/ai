/**
 * Unit Tests: Zod Schema Validation
 *
 * Tests all Zod schemas exported from the SDK to ensure:
 * - Valid inputs pass validation
 * - Invalid inputs fail with appropriate errors
 * - Zod v4 syntax is correct (record with key/value types)
 */

import { describe, it, expect } from 'bun:test';
import {
  providerSchema,
  associationsSchema,
  createActionSchema,
  updateActionSchema,
  writeOutputSchema,
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

describe('providerSchema', () => {
  it('accepts valid provider strings', () => {
    expect(() => providerSchema.parse('salesforce')).not.toThrow();
    expect(() => providerSchema.parse('hubspot')).not.toThrow();
    expect(() => providerSchema.parse('pipedrive')).not.toThrow();
  });

  it('rejects non-string values', () => {
    expect(() => providerSchema.parse(123)).toThrow();
    expect(() => providerSchema.parse(null)).toThrow();
    expect(() => providerSchema.parse(undefined)).toThrow();
  });
});

describe('associationsSchema', () => {
  it('accepts valid associations array', () => {
    const validAssociations = [
      {
        to: { id: 'contact-123' },
        types: [
          { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 1 },
        ],
      },
    ];
    expect(() => associationsSchema.parse(validAssociations)).not.toThrow();
  });

  it('accepts undefined (optional)', () => {
    expect(() => associationsSchema.parse(undefined)).not.toThrow();
  });

  it('accepts empty array', () => {
    expect(() => associationsSchema.parse([])).not.toThrow();
  });

  it('rejects invalid association structure', () => {
    expect(() => associationsSchema.parse([{ invalid: 'data' }])).toThrow();
  });
});

describe('createActionSchema', () => {
  const validCreateAction = {
    objectName: 'Contact',
    type: 'create',
    record: { firstName: 'John', lastName: 'Doe' },
    groupRef: 'group-123',
  };

  it('accepts valid create action', () => {
    expect(() => createActionSchema.parse(validCreateAction)).not.toThrow();
  });

  it('accepts create action with associations', () => {
    const withAssociations = {
      ...validCreateAction,
      associations: [
        {
          to: { id: 'company-456' },
          types: [
            { associationCategory: 'USER_DEFINED', associationTypeId: 2 },
          ],
        },
      ],
    };
    expect(() => createActionSchema.parse(withAssociations)).not.toThrow();
  });

  it('rejects update type in create schema', () => {
    expect(() =>
      createActionSchema.parse({ ...validCreateAction, type: 'update' }),
    ).toThrow();
  });

  it('rejects missing required fields', () => {
    expect(() => createActionSchema.parse({ objectName: 'Contact' })).toThrow();
    expect(() =>
      createActionSchema.parse({ ...validCreateAction, groupRef: undefined }),
    ).toThrow();
  });

  it('validates record as object (Zod v4 record syntax)', () => {
    // Zod v4: z.record(z.string(), z.any()) requires key-value pairs
    expect(() =>
      createActionSchema.parse({
        ...validCreateAction,
        record: { key: 'value' },
      }),
    ).not.toThrow();
  });
});

describe('updateActionSchema', () => {
  const validUpdateAction = {
    objectName: 'Contact',
    type: 'update',
    record: { id: 'contact-123', email: 'new@email.com' },
    groupRef: 'group-123',
  };

  it('accepts valid update action', () => {
    expect(() => updateActionSchema.parse(validUpdateAction)).not.toThrow();
  });

  it('rejects create type in update schema', () => {
    expect(() =>
      updateActionSchema.parse({ ...validUpdateAction, type: 'create' }),
    ).toThrow();
  });
});

describe('writeOutputSchema', () => {
  it('accepts valid write output', () => {
    const validOutput = {
      status: 'success',
      recordId: 'rec-123',
      response: { id: 'rec-123', success: true },
    };
    expect(() => writeOutputSchema.parse(validOutput)).not.toThrow();
  });

  it('rejects missing required fields', () => {
    expect(() => writeOutputSchema.parse({ status: 'success' })).toThrow();
  });
});

describe('checkConnectionInputSchema', () => {
  it('accepts valid provider', () => {
    expect(() =>
      checkConnectionInputSchema.parse({ provider: 'salesforce' }),
    ).not.toThrow();
  });

  it('rejects missing provider', () => {
    expect(() => checkConnectionInputSchema.parse({})).toThrow();
  });
});

describe('checkConnectionOutputSchema', () => {
  it('accepts found connection', () => {
    const found = {
      found: true,
      connectionId: 'conn-123',
      groupRef: 'group-456',
    };
    expect(() => checkConnectionOutputSchema.parse(found)).not.toThrow();
  });

  it('accepts not found connection', () => {
    expect(() =>
      checkConnectionOutputSchema.parse({ found: false }),
    ).not.toThrow();
  });

  it('rejects invalid found type', () => {
    expect(() => checkConnectionOutputSchema.parse({ found: 'yes' })).toThrow();
  });
});

describe('createInstallationInputSchema', () => {
  it('accepts valid installation input', () => {
    const valid = {
      provider: 'hubspot',
      connectionId: 'conn-123',
      groupRef: 'group-456',
    };
    expect(() => createInstallationInputSchema.parse(valid)).not.toThrow();
  });

  it('rejects missing connectionId', () => {
    expect(() =>
      createInstallationInputSchema.parse({ provider: 'hubspot' }),
    ).toThrow();
  });
});

describe('createInstallationOutputSchema', () => {
  it('accepts created installation', () => {
    const created = {
      created: true,
      installationId: 'inst-123',
    };
    expect(() => createInstallationOutputSchema.parse(created)).not.toThrow();
  });

  it('accepts not created response', () => {
    expect(() =>
      createInstallationOutputSchema.parse({ created: false }),
    ).not.toThrow();
  });
});

describe('checkInstallationInputSchema', () => {
  it('accepts valid provider', () => {
    expect(() =>
      checkInstallationInputSchema.parse({ provider: 'pipedrive' }),
    ).not.toThrow();
  });
});

describe('checkInstallationOutputSchema', () => {
  it('accepts found installation', () => {
    expect(() =>
      checkInstallationOutputSchema.parse({
        found: true,
        installationId: 'inst-123',
      }),
    ).not.toThrow();
  });

  it('accepts not found', () => {
    expect(() =>
      checkInstallationOutputSchema.parse({ found: false }),
    ).not.toThrow();
  });
});

describe('startOAuthInputSchema', () => {
  it('accepts minimal OAuth input', () => {
    const valid = {
      provider: 'salesforce',
      groupRef: 'group-123',
      consumerRef: 'user-456',
    };
    expect(() => startOAuthInputSchema.parse(valid)).not.toThrow();
  });

  it('accepts OAuth input with providerWorkspaceRef', () => {
    const valid = {
      provider: 'salesforce',
      groupRef: 'group-123',
      consumerRef: 'user-456',
      providerWorkspaceRef: 'mycompany',
    };
    expect(() => startOAuthInputSchema.parse(valid)).not.toThrow();
  });

  it('providerWorkspaceRef is optional', () => {
    const withoutWorkspace = {
      provider: 'hubspot',
      groupRef: 'group-123',
      consumerRef: 'user-456',
    };
    const result = startOAuthInputSchema.parse(withoutWorkspace);
    expect(result.providerWorkspaceRef).toBeUndefined();
  });

  it('rejects missing required fields', () => {
    expect(() =>
      startOAuthInputSchema.parse({ provider: 'salesforce' }),
    ).toThrow();
  });
});

describe('startOAuthOutputSchema', () => {
  it('accepts valid OAuth URL', () => {
    expect(() =>
      startOAuthOutputSchema.parse({
        url: 'https://oauth.example.com/authorize',
      }),
    ).not.toThrow();
  });

  it('rejects missing url', () => {
    expect(() => startOAuthOutputSchema.parse({})).toThrow();
  });
});

describe('sendRequestInputSchema', () => {
  const minimalRequest = {
    provider: 'salesforce',
    endpoint: 'v60.0/sobjects/Account',
    method: 'GET',
  };

  it('accepts minimal request', () => {
    expect(() => sendRequestInputSchema.parse(minimalRequest)).not.toThrow();
  });

  it('accepts request with body', () => {
    const withBody = {
      ...minimalRequest,
      method: 'POST',
      body: { Name: 'Test Account' },
    };
    expect(() => sendRequestInputSchema.parse(withBody)).not.toThrow();
  });

  it('accepts request with headers (Zod v4 record syntax)', () => {
    const withHeaders = {
      ...minimalRequest,
      headers: { 'X-Custom-Header': 'value' },
    };
    expect(() => sendRequestInputSchema.parse(withHeaders)).not.toThrow();
  });

  it('accepts request with installationId', () => {
    const withInstallation = {
      ...minimalRequest,
      installationId: 'inst-123',
    };
    expect(() => sendRequestInputSchema.parse(withInstallation)).not.toThrow();
  });

  it('rejects missing required fields', () => {
    expect(() =>
      sendRequestInputSchema.parse({ provider: 'salesforce' }),
    ).toThrow();
  });
});

describe('sendRequestOutputSchema', () => {
  it('accepts valid response', () => {
    const valid = {
      status: 200,
      response: { data: [] },
    };
    expect(() => sendRequestOutputSchema.parse(valid)).not.toThrow();
  });

  it('rejects non-number status', () => {
    expect(() =>
      sendRequestOutputSchema.parse({ status: '200', response: {} }),
    ).toThrow();
  });
});

describe('sendReadRequestInputSchema', () => {
  it('accepts valid read request', () => {
    const valid = {
      provider: 'hubspot',
      endpoint: 'crm/v3/objects/contacts',
    };
    expect(() => sendReadRequestInputSchema.parse(valid)).not.toThrow();
  });

  it('accepts with optional headers', () => {
    const withHeaders = {
      provider: 'hubspot',
      endpoint: 'crm/v3/objects/contacts',
      headers: { Accept: 'application/json' },
    };
    expect(() => sendReadRequestInputSchema.parse(withHeaders)).not.toThrow();
  });

  it('does not include body (read-only)', () => {
    const withBody = {
      provider: 'hubspot',
      endpoint: 'crm/v3/objects/contacts',
      body: { invalid: 'field' },
    };
    // Body should be ignored (not in schema) - parse should still succeed
    const result = sendReadRequestInputSchema.parse(withBody);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result as Record<string, unknown>).body).toBeUndefined();
  });
});

describe('Zod v4 record syntax validation', () => {
  it('record fields work with string keys and any values', () => {
    const valid = {
      objectName: 'Account',
      type: 'create',
      record: {
        stringField: 'text',
        numberField: 42,
        booleanField: true,
        nestedObject: { key: 'value' },
        arrayField: [1, 2, 3],
      },
      groupRef: 'group-123',
    };
    expect(() => createActionSchema.parse(valid)).not.toThrow();
  });

  it('headers record accepts string key-value pairs', () => {
    const valid = {
      provider: 'salesforce',
      endpoint: 'v60.0/query',
      method: 'GET',
      headers: {
        Authorization: 'Bearer token',
        'Content-Type': 'application/json',
        'X-Custom': 'custom-value',
      },
    };
    expect(() => sendRequestInputSchema.parse(valid)).not.toThrow();
  });
});
