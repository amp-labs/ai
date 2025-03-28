import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

export async function createProxyTool(server: Server, provider: string): Promise<void> {
    // @ts-ignore
    server.tool('proxy', `Call ${provider} APIs via the Ampersand proxy`, {
        body: z.record(z.string(), z.string()),
        suffix: z.string(),
        method: z.string(),
        headers: z.record(z.string(), z.string()),
    }, async ({ body, suffix, method, headers }: { body: Record<string, string>, suffix: string, method: string, headers: Record<string, string> }) => {
        const response = await fetch(`https://proxy.withampersand.com/services/${suffix}`, {
            method: method,
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'x-amp-project-id': process.env.AMPERSAND_PROJECT_ID || '',
                'x-api-key': process.env.AMPERSAND_API_KEY || '',
                'x-amp-proxy-version': '1',
                'x-amp-integration-name': process.env.AMPERSAND_INTEGRATION_ID || '',
                'x-amp-group-ref': process.env.AMPERSAND_GROUP_REF || ''
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        return {
            content:[
                {
                    type: 'text',
                    text: `Proxy call to ${provider} returned ${data}`
                }
            ],
        };
    });
} 