import { z } from "zod";

export const providerSchema = z.string().describe(`The provider to connect to. Typically a SaaS tool like Monday, Hubspot, Salesforce, etc. Always use lowercase.`);
