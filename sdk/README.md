<br/>
<div align="center">
    <a href="https://www.withampersand.com/?utm_source=github&utm_medium=readme&utm_campaign=ai-sdk&utm_content=logo">
    <img src="https://res.cloudinary.com/dycvts6vp/image/upload/v1723671980/ampersand-logo-black.svg" height="30" align="center" alt="Ampersand logo" >
    </a>
<br/>
<br/>

<div align="center">

[![Star us on GitHub](https://img.shields.io/github/stars/amp-labs/connectors?color=FFD700&label=Stars&logo=Github)](https://github.com/amp-labs/connectors) [![Discord](https://img.shields.io/badge/Join%20The%20Community-black?logo=discord)](https://discord.gg/BWP4BpKHvf) [![Documentation](https://img.shields.io/badge/Read%20our%20Documentation-black?logo=book)](https://docs.withampersand.com) ![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) <img src="https://img.shields.io/static/v1?label=license&message=MIT&color=white" alt="License">
</div>

</div>

# Ampersand AI SDK

This SDK enables AI agents to seamlessly perform operations on connected SaaS tools through Ampersand's platform.

## Installation

```bash
npm install @amp-labs/ai
# or
yarn add @amp-labs/ai
# or
pnpm add @amp-labs/ai
```

## Usage

The SDK provides several modules that can be used depending on your framework preference:

### Using with Vercel AI SDK

```typescript
import { createRecordTool, updateRecordTool } from "@amp-labs/ai/aisdk";

// Use in your AI agent configuration
const tools = [createRecordTool, updateRecordTool];
```

### Using with Mastra

```typescript
import { createRecordTool, updateRecordTool } from "@amp-labs/ai/mastra";

// Use in your Mastra workflow
const tools = [createRecordTool, updateRecordTool];
```
`

## Debugging & Troubleshooting

If you encounter issues, ensure that:

1. All required environment variables are set correctly
2. You have an active Ampersand account with the necessary permissions & scopes
3. The SaaS tool (say HubSpot) connection (with OAuth or apiKey) with your Agent is properly established & is still active. 

For further assistance, join our [Discord community](https://discord.gg/BWP4BpKHvf). 