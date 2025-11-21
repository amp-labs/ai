import { z } from 'zod';

export const providerSchema = z
  .string()
  .describe(
    `The SaaS API provider to connect to. Always use camelCase (e.g. "monday", "hubspot", "salesforce").`,
  );

export const endpointSchema = z
  .string()
  .describe(
    `The endpoint to call on the provider, without the base URL. For Salesforce, include the full path after the instance URL (e.g. "services/data/v58.0/sobjects/Account"). For other providers, use their standard API path format.`,
  );

export const installationIdSchema = z
  .string()
  .optional()
  .describe(
    `The ID of the installation. If you don't know it, use the check-installation tool.`,
  );
