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

This is a mono-repo that contains the official Ampersand AI SDK as well as the offical MCP servers for Ampersand.


- `@amp-labs/ai` - Official Ampersand AI SDK that exposes Ampersand tools / functions to your AI agents 
- `@amp-labs/mcp-server` - Official Ampersand MCP server 
- `@amp-labs/examples` - A set of agent examples with the popular agent frameworks. 


## Ampersand AI SDK

This SDK enables AI agents to seamlessly perform operations on connected SaaS tools through Ampersand's platform.

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

## Connecting to the mcp server from an MCP Client

Add the following in your `mcp.json` in cursor IDE or `claude_desktop_config.json` when using Claude desktop.


#### When running the server in SSE mode

```json
{
  "mcpServers": {
    "@amp-labs/mcp-server": {
      "url": "https://mcp.withampersand.com/sse?apiKey=<AMPERSAND_API_KEY>&project=<AMPERSAND_PROJECT_ID>&integrationName=<AMPERSAND_INTEGRATION_NAME>&groupRef=<AMPERSAND_GROUP_REF>"
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

## License

This project is licensed under the MIT license.

See [LICENSE](./LICENSE) for more information.
