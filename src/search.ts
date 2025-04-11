import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { TrieveSDK, ChunkMetadata } from 'trieve-ts-sdk';
import { z } from 'zod';

export const SUBDOMAIN: string = 'ampersand-24eb5c1a';
export const SERVER_URL: string = 'https://leaves.mintlify.com'; 

interface SearchConfig {
    trieveApiKey: string;
    trieveDatasetId: string;
    name: string;
}

interface SearchResult {
    title: string;
    content: string;
    link: string;
}

const DEFAULT_BASE_URL = 'https://api.mintlifytrieve.com';

export async function fetchSearchConfigurationAndOpenApi(subdomain: string): Promise<SearchConfig> {
    try {
        const url = `${SERVER_URL}/api/mcp/cli/${subdomain}`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            let msg = '';
            try {
                const json = await response.json();
                msg = json.error ?? String(response.status) + ' ' + response.statusText;
            } catch {
                msg = String(response.status) + ' ' + response.statusText;
            }
            throw new Error(`HTTP Error: ${msg}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON');
        }

        return await response.json();
    } catch (error) {
        throw new Error('Failed to initialize: ' + error);
    }
}

async function search(query: string, config: SearchConfig): Promise<SearchResult[]> {
    const trieve = new TrieveSDK({
        apiKey: config.trieveApiKey,
        datasetId: config.trieveDatasetId,
        baseUrl: DEFAULT_BASE_URL,
    });

    const data = await trieve.autocomplete({
        page_size: 10,
        query,
        search_type: 'fulltext',
        extend_results: true,
        score_threshold: 1,
    });

    if (data.chunks === undefined || data.chunks.length === 0) {
        throw new Error('No results found');
    }

    return data.chunks.map((result) => {
        const chunk = result.chunk as ChunkMetadata & {
            metadata: { title: string };
            chunk_html: string;
            link: string;
        };
        
        return {
            title: chunk.metadata.title,
            content: chunk.chunk_html,
            link: chunk.link,
        };
    });
}

export async function createSearchTool(server: Server): Promise<void> {
    try {
        const config = await fetchSearchConfigurationAndOpenApi(SUBDOMAIN);
        // @ts-ignore
        server.tool('search', `Search across the ${config.name} documentation to fetch relevant context for a given query`, {
        query: z.string(),
    }, async ({ query }: { query: string }) => {
        const results = await search(query, config);
        const content = results.map((result) => {
            const { title, content, link } = result;
            const text = `Title: ${title}\nContent: ${content}\nLink: ${link}`;
            return {
                type: 'text' as const,
                text,
            };
        });

        return {
            content,
        };
    }); 
    } catch (error) {
        console.warn('Error in registering search tool:', error);
    }
} 