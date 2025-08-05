import { z } from "zod";

export const providerSchema = z
  .string()
  .describe(
    `The SaaS API provider to connect to. Always use camelCase (e.g. "monday", "hubspot", "salesforce").`,
  );

export const endpointSchema = z
  .string()
  .describe(
    `The endpoint to call on the provider, without the base URL, and including the version. (e.g. If the full URL is "my-workspace.my.salesforce.com/services/data/v60.0/sobjects/Account", the endpoint is "v60.0/sobjects/Account")`,
  );

export const installationIdSchema = z
  .string()
  .optional()
  .describe(
    `The ID of the installation. If you don't know it, use the check-installation tool.`,
  );
