import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express, { Request, Response } from 'express';

export async function connectServer(server: Server, useStdioTransport: boolean, settings: any): Promise<express.Application | undefined> {
    if (useStdioTransport) {
        console.log('Connecting to MCP server over stdio');
        const transport = new StdioServerTransport();
        await server.connect(transport);
        return;
    }

    const app = express();
    const port = 3001;
    let currentTransport: SSEServerTransport | null = null;

    app.get('/sse', async (req: Request, res: Response) => {
        if (req.query.project) {
            settings.project = req.query.project;
        }
        if (req.query.integrationName) {
            settings.integrationName = req.query.integrationName;
        }
        if (req.query.apiKey) {
            settings.apiKey = req.query.apiKey;
        }
        if (req.query.groupRef) {
            settings.groupRef = req.query.groupRef;
        }
        currentTransport = new SSEServerTransport('/messages', res);
        await server.connect(currentTransport);
    });

    app.post('/messages', async (req: Request, res: Response) => {
        // Note: In a production environment, you would need to implement
        // proper transport routing for multiple connections
        if (currentTransport) {
            try {
                await currentTransport.handlePostMessage(req, res);
            } catch (error) {
                console.error('Error handling POST message:', error);
                res.status(500).json({ error: 'Error handling POST message' });
            }
        } else {
            res.status(400).json({ error: 'No active SSE connection' });
        }
    });

    app.listen(port, () => {
        console.error(`MCP Server running on SSE at http://localhost:${port}`);
    });

    return app;
} 