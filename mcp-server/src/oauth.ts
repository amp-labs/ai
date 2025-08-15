import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { providerSchema } from './schemas';
import { ClientSettings } from '.';
import crypto from 'crypto';

export async function createStartOAuthTool(
  server: Server,
  settings?: ClientSettings,
): Promise<void> {
  // @ts-ignore
  server.tool(
    'start-oauth',
    `Connect to a SaaS tool provider using the Ampersand OAuth flow. The tool will return a clickable link to the OAuth flow for the user to click.`,
    {
      provider: providerSchema,
    },
    async ({ provider }: { provider: string }) => {
      let oAuthUrl = '';
      try {
        const consumerRef = crypto.randomUUID();
        const groupRef = settings?.groupRef || process.env.AMPERSAND_GROUP_REF;
        const projectId = settings?.project || process.env.AMPERSAND_PROJECT_ID;
        const apiKey = settings?.apiKey || '';
        const options: RequestInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
          },
          body: JSON.stringify({ provider, consumerRef, groupRef, projectId }),
        };
        console.log(
          '[START-OAUTH] API request to oauthConnect: ',
          options.body,
        );

        const response = await fetch(
          'https://api.withampersand.com/v1/oauth-connect',
          options,
        );
        const data = await response.text();
        console.log('[START-OAUTH] API response from oauthConnect: ', data);
        oAuthUrl = data;
      } catch (err) {
        console.error(err);
      }

      return {
        content: [
          {
            type: 'text',
            text: oAuthUrl,
          },
        ],
      };
    },
  );
}
