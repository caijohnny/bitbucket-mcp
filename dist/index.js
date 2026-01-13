#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { BitbucketClient } from './bitbucket-client.js';
import { registerRepositoryTools } from './tools/repository.js';
import { registerPullRequestTools } from './tools/pullrequest.js';
import { registerBranchTools } from './tools/branch.js';
import { registerReviewPrompts } from './prompts/review.js';
// Configuration from environment variables
const BITBUCKET_URL = process.env.BITBUCKET_URL || 'https://code.fineres.com';
const BITBUCKET_TOKEN = process.env.BITBUCKET_TOKEN;
if (!BITBUCKET_TOKEN) {
    console.error('Error: BITBUCKET_TOKEN environment variable is required');
    process.exit(1);
}
// Initialize Bitbucket client
const bitbucketClient = new BitbucketClient({
    baseUrl: BITBUCKET_URL,
    token: BITBUCKET_TOKEN,
});
// Register all tools
const repositoryTools = registerRepositoryTools(bitbucketClient);
const pullRequestTools = registerPullRequestTools(bitbucketClient);
const branchTools = registerBranchTools(bitbucketClient);
// Combine all tools
const allTools = {
    ...repositoryTools,
    ...pullRequestTools,
    ...branchTools,
};
// Register all prompts
const allPrompts = registerReviewPrompts(bitbucketClient);
// Create MCP server
const server = new Server({
    name: 'bitbucket-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
        prompts: {},
    },
});
// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: Object.entries(allTools).map(([name, tool]) => ({
            name,
            description: tool.description,
            inputSchema: tool.inputSchema,
        })),
    };
});
// Handle call tool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = allTools[name];
    if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await tool.handler(args);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: message }, null, 2),
                },
            ],
            isError: true,
        };
    }
});
// Handle list prompts request
server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
        prompts: Object.entries(allPrompts).map(([, prompt]) => ({
            name: prompt.name,
            description: prompt.description,
            arguments: prompt.arguments,
        })),
    };
});
// Handle get prompt request
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const prompt = allPrompts[name];
    if (!prompt) {
        throw new Error(`Unknown prompt: ${name}`);
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await prompt.handler(args || {});
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Error: ${message}`,
                    },
                },
            ],
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Bitbucket MCP server started');
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
