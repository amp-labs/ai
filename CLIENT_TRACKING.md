# Client Tracking and Usage Analytics

This document explains how to add customer headers to track usage with client and version information in the Ampersand AI SDK.

## Overview

The Ampersand AI SDK now includes built-in client tracking capabilities that automatically add headers to all API requests for usage analytics and monitoring. This helps you:

- **Track usage patterns** across different clients and versions
- **Monitor performance** by client type
- **Debug issues** with specific client implementations
- **Analytics and reporting** on SDK usage

## Headers Added

The SDK automatically adds the following headers to all requests:

| Header | Description | Example |
|--------|-------------|---------|
| `x-amp-client` | Client name/identifier | `my-ai-agent` |
| `x-amp-client-version` | Client version | `1.0.0` |
| `x-amp-sdk` | SDK identifier | `@amp-labs/ai` |
| `x-amp-sdk-version` | SDK version | `0.1.0` |
| `x-amp-integration` | Integration name | `my-integration` |
| `x-amp-project` | Project ID | `proj_123` |
| `User-Agent` | Custom user agent | `MyApp/1.0.0` |

## Configuration Methods

### 1. Environment Variables (Recommended)

Set these environment variables for automatic configuration:

```bash
# Required
AMPERSAND_API_KEY=your_api_key
AMPERSAND_PROJECT_ID=your_project_id
AMPERSAND_INTEGRATION_NAME=your_integration_name

# Optional - Client tracking
AMPERSAND_CLIENT_NAME=my-ai-agent
AMPERSAND_CLIENT_VERSION=1.0.0
AMPERSAND_USER_AGENT=MyAIAgent/1.0.0
```

### 2. Global Configuration

Set global configuration that applies to all requests:

```typescript
import { setGlobalClientConfig } from "@amp-labs/ai/aisdk";

setGlobalClientConfig({
  clientName: "my-ai-agent",
  clientVersion: "1.0.0",
  userAgent: "MyAIAgent/1.0.0",
  apiKey: process.env.AMPERSAND_API_KEY || "",
  projectId: process.env.AMPERSAND_PROJECT_ID,
  integrationName: process.env.AMPERSAND_INTEGRATION_NAME,
});
```

### 3. Per-Request Configuration

Override configuration for specific requests:

```typescript
import { createClientConfig } from "@amp-labs/ai/aisdk";

const customConfig = createClientConfig({
  clientName: "special-operation",
  clientVersion: "2.0.0",
  userAgent: "SpecialOperation/2.0.0"
});

// Use in specific requests (if supported by the tool)
const result = await someTool({ 
  // ... other params
  clientConfig: customConfig 
});
```

## Usage Examples

### Vercel AI SDK Integration

```typescript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { 
  createRecord, 
  checkConnection,
  setGlobalClientConfig 
} from "@amp-labs/ai/aisdk";

// Configure client tracking
setGlobalClientConfig({
  clientName: "my-vercel-agent",
  clientVersion: "1.0.0",
  userAgent: "MyVercelAgent/1.0.0",
  apiKey: process.env.AMPERSAND_API_KEY || "",
  projectId: process.env.AMPERSAND_PROJECT_ID,
  integrationName: process.env.AMPERSAND_INTEGRATION_NAME,
});

// Use tools - they will automatically include tracking headers
const { text } = await generateText({
  model: openai('gpt-4'),
  prompt: 'Create a contact in Salesforce',
  tools: {
    createRecord,
    checkConnection
  }
});
```

### Mastra Integration

```typescript
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { 
  createRecordTool, 
  updateRecordTool,
  setGlobalClientConfig 
} from "@amp-labs/ai/mastra";

// Configure client tracking
setGlobalClientConfig({
  clientName: "my-mastra-agent",
  clientVersion: "1.0.0",
  userAgent: "MyMastraAgent/1.0.0",
  apiKey: process.env.AMPERSAND_API_KEY || "",
  projectId: process.env.AMPERSAND_PROJECT_ID,
  integrationName: process.env.AMPERSAND_INTEGRATION_NAME,
});

// Create agent with tools
export const agent: Agent = new Agent({
  name: "Mastra Tools Agent",
  instructions: "You can use tools defined in Mastra.",
  model: openai("gpt-4o-mini"),
  tools: {
    createRecordTool,
    updateRecordTool,
  },
});
```

### MCP Server Integration

```typescript
import { MCPClient } from "@mastra/mcp";
import { 
  setGlobalClientConfig 
} from "@amp-labs/ai/mcp";

// Configure client tracking
setGlobalClientConfig({
  clientName: "my-mcp-client",
  clientVersion: "1.0.0",
  userAgent: "MyMCPClient/1.0.0",
  apiKey: process.env.AMPERSAND_API_KEY || "",
  projectId: process.env.AMPERSAND_PROJECT_ID,
  integrationName: process.env.AMPERSAND_INTEGRATION_NAME,
});

// Create MCP client
export const mcp = new MCPClient({
  servers: {
    ampersand: {
      command: "npx",
      args: [
        "-y",
        "@amp-labs/mcp-server@latest",
        "--transport",
        "stdio",
        "--project",
        process.env.AMPERSAND_PROJECT_ID || "",
        "--integrationName",
        process.env.AMPERSAND_INTEGRATION_NAME || "",
        "--groupRef",
        process.env.AMPERSAND_GROUP_REF || "",
      ],
      env: {
        AMPERSAND_API_KEY: process.env.AMPERSAND_API_KEY || "",
      },
    },
  },
});
```

## Configuration Priority

The SDK uses the following priority order for configuration:

1. **Per-request configuration** (highest priority)
2. **Global configuration** (set via `setGlobalClientConfig`)
3. **Environment variables** (fallback)
4. **Default values** (lowest priority)

## Available Configuration Options

### ClientConfig Interface

```typescript
interface ClientConfig {
  apiKey: string;                    // Required: Your Ampersand API key
  projectId?: string;                // Optional: Your project ID
  integrationName?: string;          // Optional: Your integration name
  clientName?: string;               // Optional: Client identifier
  clientVersion?: string;            // Optional: Client version
  userAgent?: string;                // Optional: Custom user agent
}
```

## Utility Functions

### `setGlobalClientConfig(config: ClientConfig)`

Sets global configuration that applies to all requests.

### `createClientConfig(options?: Partial<ClientConfig>)`

Creates a client configuration with defaults and overrides.

### `getEffectiveClientConfig(overrideConfig?: Partial<ClientConfig>)`

Gets the effective configuration (global + defaults + overrides).

### `getGlobalClientConfig()`

Gets the current global configuration.

### `clearGlobalClientConfig()`

Clears the global configuration.

## Best Practices

### 1. Use Environment Variables for Production

```bash
# .env file
AMPERSAND_CLIENT_NAME=production-ai-agent
AMPERSAND_CLIENT_VERSION=1.2.3
AMPERSAND_USER_AGENT=ProductionAIAgent/1.2.3
```

### 2. Use Global Configuration for Development

```typescript
// development.ts
setGlobalClientConfig({
  clientName: "dev-ai-agent",
  clientVersion: "dev",
  userAgent: "DevAIAgent/dev",
  // ... other config
});
```

### 3. Use Per-Request Configuration for Special Cases

```typescript
const specialConfig = createClientConfig({
  clientName: "batch-operation",
  clientVersion: "batch-1.0",
  userAgent: "BatchOperation/1.0"
});

// Use for specific operations that need different tracking
```

### 4. Version Your Clients

Always include version information to track usage across different client versions:

```typescript
setGlobalClientConfig({
  clientName: "my-app",
  clientVersion: "1.0.0", // Use semantic versioning
  // ... other config
});
```

## Monitoring and Analytics

With client tracking enabled, you can now:

- **Track usage by client**: See which clients are using your SDK most
- **Monitor version adoption**: Track which client versions are most popular
- **Debug issues**: Identify problems with specific client implementations
- **Performance analysis**: Compare performance across different clients
- **Usage patterns**: Understand how different clients use your SDK

## Troubleshooting

### Headers Not Appearing

1. Check that you've set the global configuration or environment variables
2. Verify that the SDK is using the latest version
3. Ensure the configuration is set before making any API calls

### Configuration Not Applied

1. Check the priority order (per-request > global > env vars > defaults)
2. Verify that environment variables are properly set
3. Ensure the configuration is set before importing tools

### TypeScript Errors

1. Make sure you're importing from the correct module path
2. Check that the ClientConfig interface is properly imported
3. Verify that all required fields are provided

## Migration Guide

### From Previous Versions

If you're upgrading from a previous version:

1. **No breaking changes**: Existing code will continue to work
2. **Optional enhancement**: Client tracking is opt-in
3. **Gradual adoption**: You can add tracking incrementally

### Adding to Existing Projects

1. Set environment variables or global configuration
2. No changes needed to existing tool usage
3. Headers will be automatically added to all requests

## Support

For questions or issues with client tracking:

1. Check this documentation
2. Review the examples in the `examples/` directory
3. Join our [Discord community](https://discord.gg/BWP4BpKHvf)
4. Open an issue on GitHub 