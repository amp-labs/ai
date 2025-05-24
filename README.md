<br/>
<div align="center">
    <a href="https://www.withampersand.com/?utm_source=github&utm_medium=readme&utm_campaign=mcp-docs-server&utm_content=logo">
    <img src="https://res.cloudinary.com/dycvts6vp/image/upload/v1723671980/ampersand-logo-black.svg" height="30" align="center" alt="Ampersand logo" >
    </a>
<br/>
<br/>

<div align="center">

 [![Discord](https://img.shields.io/badge/Join%20The%20Community-black?logo=discord)](https://discord.gg/BWP4BpKHvf) [![Documentation](https://img.shields.io/badge/Read%20our%20Documentation-black?logo=book)](https://docs.withampersand.com) ![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) <img src="https://img.shields.io/static/v1?label=license&message=MIT&color=white" alt="License">
</div>

</div>

# Official Ampersand AI SDKs

This repo contains the official Ampersand AI SDK as well as the offical MCP servers for Ampersand.

- [@amp-labs/ai](https://www.npmjs.com/package/@amp-labs/ai) - Official Ampersand AI SDK that exposes tools for your AI agents to manage and interact with integrations with your customer's SaaS tools.
- [@amp-labs/mcp-server](https://www.npmjs.com/package/@amp-labs/mcp-server) - Official Ampersand MCP server that exposes the tools from the Ampersand AI SDK.

The `examples` directory contains examples of how to use the AI SDK with popular agent frameworks.

To learn more about Ampersand, visit our [website](https://www.withampersand.com).

## Ampersand AI SDK

### Installation

```bash
npm install @amp-labs/ai
# or
yarn add @amp-labs/ai
# or
pnpm add @amp-labs/ai
```

### Usage

The SDK provides several modules that can be used depending on your framework preference:

#### Using with Vercel AI SDK

```typescript
import { createRecordTool, updateRecordTool } from "@amp-labs/ai/aisdk";

// Use in your AI agent configuration
const tools = [createRecordTool, updateRecordTool];
```

#### Using with Mastra

```typescript
import { createRecordTool, updateRecordTool } from "@amp-labs/ai/mastra";

// Use in your Mastra workflow
const tools = [createRecordTool, updateRecordTool];
```

## Ampersand MCP Server

Connect your agents to the 150+ connectors we offer at Ampersand via this multi-tenant MCP server. We expose the primitives we offer on the Ampersand platform as native tools here.

## Connect to the remote MCP server

Add the following in your `mcp.json` in Cursor IDE or `claude_desktop_config.json` when using Claude desktop.


#### When running the server in SSE mode

If your MCP client supports headers:

```json
{
  "mcpServers": {
    "@amp-labs/mcp-server": {
      "url": "https://mcp.withampersand.com/v1/sse?project=<AMPERSAND_PROJECT_ID>&integrationName=<AMPERSAND_INTEGRATION_NAME>&groupRef=<AMPERSAND_GROUP_REF>",
      "headers": {
        "x-api-key": "<AMPERSAND_API_KEY>"
      }
    }
  }
}
```

If your MCP client does not support headers, you can pass the API key in the query param:

```json
{
  "mcpServers": {
    "@amp-labs/mcp-server": {
      "url": "https://mcp.withampersand.com/v1/sse?apiKey=<AMPERSAND_API_KEY>&project=<AMPERSAND_PROJECT_ID>&integrationName=<AMPERSAND_INTEGRATION_NAME>&groupRef=<AMPERSAND_GROUP_REF>"
    }
  }
}
```

#### When running the server in stdio mode

```json
{
  "mcpServers": {
    "@amp-labs/mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "@amp-labs/mcp-server@latest",
        "--transport",
        "stdio",
        "--project",
        "<AMPERSAND_PROJECT_ID>",
        "--integrationName",
        "<AMPERSAND_INTEGRATION_NAME>",
        "--groupRef",
        "<AMPERSAND_GROUP_REF>"
      ],
      "env": {
        "AMPERSAND_API_KEY": "<AMPERSAND_API_KEY>"
      }
    }
  }
}

```

## Connect to the local MCP server

### Install and build

Install dependencies 

`pnpm i`

Building AI SDK 

`pnpm -F @amp-labs/ai build`

Building MCP Server

`pnpm -F @amp-labs/mcp-server build`


### Connect to local server from MCP client

#### SSE mode

If your MCP client supports headers:

```json
  "@amp-labs/mcp-server": {
    "url": "http://localhost:3001/v1/sse?apiKey=<AMPERSAND_API_KEY>&project=<AMPERSAND_PROJECT_ID>&integrationName=<AMPERSAND_INTEGRATION_NAME>&groupRef=<AMPERSAND_GROUP_REF>",
    "headers": {
      "x-api-key": "<AMPERSAND_API_KEY>" // if the MCP Client supports it we pick the api key from here if not, query param.
    }
  }
}
```

If your MCP client does not support headers, you can pass the API key in the query param:

```json
{
  "mcpServers": {
    "@amp-labs/mcp-server": {
      "url": "http://localhost:3001/v1/sse?apiKey=<AMPERSAND_API_KEY>&project=<AMPERSAND_PROJECT_ID>&integrationName=<AMPERSAND_INTEGRATION_NAME>&groupRef=<AMPERSAND_GROUP_REF>"
    }
  }
}
```

#### STDIO mode

```json

    "@amp-labs/mcp-server": {
      "command": "node",
      "args": [
        "<PATH_TO_CODEBASE>/mcp-server/dist/index.js",
        "--transport",
        "stdio",
        "--project",
        "<AMPERSAND_PROJECT_ID>",
        "--integrationName",
        "<AMPERSAND_INTEGRATION_NAME>",
        "--groupRef",
        "<AMPERSAND_GROUP_REF>"
      ],
      "env": {
        "AMPERSAND_API_KEY": "<AMPERSAND_API_KEY>"
      }
    },

```

## License

This project is licensed under the MIT license.

See [LICENSE](./LICENSE) for more information.
