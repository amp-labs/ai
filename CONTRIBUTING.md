# Contributing to Ampersand AI SDK & MCP Server

Thank you for your interest in contributing! This document will help you get started and understand the structure of the codebase.

---

## Codebase Layout

- **`mcp-server/`**  
  The Model Context Protocol (MCP) server. This is where the server logic and tool definitions for connecting to SaaS providers via Ampersand are implemented.
  - **`mcp-server/src/`**  
    - `index.ts`: Entry point for the MCP server.
    - `oauth.ts`: Defines the OAuth tool (`createStartOAuthTool`) for launching OAuth flows.
    - `write.ts`, `request.ts`, `connectionManager.ts`: Define tools for write actions, API requests, and connection management.
    - `schemas.ts`: Zod schemas for validating tool inputs.
    - `session.ts`: Handles server session and transport logic.
    - `search.ts`: (Optional) Search tool logic.
    - `settings.ts`, `initialize.ts`, `instrument.ts`: Server configuration and initialization.

- **`sdk/`**  
  The SDK for integrating with Ampersand from various AI agent frameworks.The is the codebase for the `@amp-labs/ai` package on npm.
  - **`sdk/lib/adapters/`**  
    - `mcp.ts`: Defines MCP-compatible tools for the SDK, such as `createStartOAuthTool`, `createCheckConnectionTool`, etc.
    - `aisdk.ts`, `mastra.ts`: Adapters for specific frameworks (Vercel AI SDK, Mastra).
    - `common.ts`: Shared schemas and types for tool definitions.
    - **`ampersand/`**: Contains additional schemas, types, and core logic for tool definitions.
      - `schemas/`: Zod schemas and descriptions for tool inputs/outputs.
      - `core/`, `types/`: Core logic and type definitions.

- **`examples/`**  
  Example agent configurations and usage.

---

## Where Are Tools Defined?

- **MCP Server Tools:**  
  Implemented in `mcp-server/src/` (e.g., `oauth.ts`, `write.ts`, `connectionManager.ts`).  
  Each tool is registered on the server using the `server.tool()` method.

- **SDK Tools:**  
  Implemented in `sdk/lib/adapters/` (e.g., `mcp.ts`, `aisdk.ts`, `mastra.ts`).  
  These files export functions like `createStartOAuthTool` that register tools for use in AI agent frameworks.

- **Schemas and Types:**  
  Shared schemas for tool inputs/outputs are in `sdk/lib/adapters/ampersand/schemas/`.

---

## Local development workflow

### AI SDK

To build the AI SDK locally, run the following command:

```
pnpm -F @amp-labs/ai build
```

### MCP Server

To build the MCP server locally, run the following command:

```
pnpm -F @amp-labs/mcp-server build
```

Please refer to the [mcp-server README](./mcp-server/README.md) for more information on:

- Starting the MCP server locally.
- Connecting to the local MCP server from an MCP client.

## How to Contribute

0. If it's a large change, please open an issue first to discuss it.
1. **Fork the repository and create a new branch.**
2. **Make your changes.**
   - If adding or modifying a tool, update the relevant file in `mcp-server/src/` or `sdk/lib/adapters/`.
   - Add or update schemas as needed in `sdk/lib/adapters/ampersand/schemas/`.
3. **Test your changes.**
4. **Submit a pull request.**
5. **Join our [Discord community](https://discord.gg/BWP4BpKHvf) for questions or to discuss ideas!**

---

## Additional Resources

- [SDK README](./sdk/README.md)
- [MCP Server README](./mcp-server/README.md)
- [Documentation](https://docs.withampersand.com)
