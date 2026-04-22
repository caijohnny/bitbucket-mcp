#!/usr/bin/env node

import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { BitbucketClient } from './bitbucket-client.js';
import { registerRepositoryTools } from './tools/repository.js';
import { registerPullRequestTools } from './tools/pullrequest.js';
import { registerBranchTools } from './tools/branch.js';
import { registerReviewPrompts } from './prompts/review.js';

// Configuration from environment variables
const DEFAULT_BITBUCKET_URL = process.env.BITBUCKET_URL || 'https://code.fineres.com';
const DEFAULT_BITBUCKET_TOKEN = process.env.BITBUCKET_TOKEN;
const MCP_HOST = process.env.MCP_HOST || '127.0.0.1';
const MCP_PATH = process.env.MCP_PATH || '/mcp';
const MCP_PORT = parsePort(process.env.MCP_PORT, 51666);
const MCP_TLS_KEY_PATH = getRequiredEnv('MCP_TLS_KEY_PATH');
const MCP_TLS_CERT_PATH = getRequiredEnv('MCP_TLS_CERT_PATH');
const MCP_TLS_CA_PATH = process.env.MCP_TLS_CA_PATH;

const sessions = new Map<string, Session>();

type Session = {
  server: Server;
  transport: StreamableHTTPServerTransport;
};

type BitbucketConfig = {
  baseUrl: string;
  token: string;
};

function createMcpServer(bitbucketConfig: BitbucketConfig) {
  const bitbucketClient = new BitbucketClient({
    baseUrl: bitbucketConfig.baseUrl,
    token: bitbucketConfig.token,
  });

  const allTools = {
    ...registerRepositoryTools(bitbucketClient),
    ...registerPullRequestTools(bitbucketClient),
    ...registerBranchTools(bitbucketClient),
  };

  const allPrompts = registerReviewPrompts(bitbucketClient);
  const server = new Server(
    {
      name: 'bitbucket-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
      },
    }
  );

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

    const tool = allTools[name as keyof typeof allTools];
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await tool.handler(args as any);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text' as const,
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

    const prompt = allPrompts[name as keyof typeof allPrompts];
    if (!prompt) {
      throw new Error(`Unknown prompt: ${name}`);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await prompt.handler((args as any) || {});
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: `Error: ${message}`,
            },
          },
        ],
      };
    }
  });

  return server;
}

function parsePort(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`Error: invalid MCP_PORT value "${value}"`);
    process.exit(1);
  }

  return port;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    console.error(`Error: ${name} environment variable is required`);
    process.exit(1);
  }

  return value;
}

function writeTextResponse(
  res: ServerResponse,
  statusCode: number,
  body: string,
  headers: Record<string, string> = {}
) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body).toString(),
    ...headers,
  });
  res.end(body);
}

async function handleMcpRequest(req: IncomingMessage, res: ServerResponse) {
  const sessionId = getSessionId(req);
  const existingSession = sessionId ? sessions.get(sessionId) : undefined;
  const requestUrl = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);

  if (sessionId && !existingSession) {
    writeTextResponse(res, 404, 'Session not found');
    return;
  }

  const currentSession = existingSession || createSession(requestUrl);
  if (!currentSession) {
    writeTextResponse(
      res,
      400,
      'BITBUCKET_TOKEN is required in the MCP URL query string or environment variables'
    );
    return;
  }

  const isNewSession = !existingSession;

  try {
    if (isNewSession) {
      await currentSession.server.connect(currentSession.transport);
    }

    await currentSession.transport.handleRequest(req, res);

    if (isNewSession && !currentSession.transport.sessionId) {
      await closeSession(currentSession);
    }
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      writeTextResponse(res, 500, 'Internal server error');
    }

    if (isNewSession) {
      if (currentSession.transport.sessionId) {
        sessions.delete(currentSession.transport.sessionId);
      }
      await closeSession(currentSession);
    }
  }
}

async function routeRequest(req: IncomingMessage, res: ServerResponse) {
  const requestUrl = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);

  if (requestUrl.pathname !== MCP_PATH) {
    writeTextResponse(res, 404, 'Not found');
    return;
  }

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    writeTextResponse(res, 405, 'Method not allowed', {
      Allow: 'POST, DELETE',
    });
    return;
  }

  if (req.method === 'DELETE' && !getSessionId(req)) {
    writeTextResponse(res, 400, 'MCP session id is required for DELETE requests');
    return;
  }

  await handleMcpRequest(req, res);
}

function createSession(requestUrl: URL): Session | null {
  const bitbucketConfig = getBitbucketConfig(requestUrl);
  if (!bitbucketConfig) {
    return null;
  }

  const server = createMcpServer(bitbucketConfig);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: randomUUID,
    enableJsonResponse: true,
    onsessioninitialized: (sessionId) => {
      sessions.set(sessionId, { server, transport });
    },
    onsessionclosed: async (sessionId) => {
      const session = sessions.get(sessionId);
      if (session) {
        sessions.delete(sessionId);
        await closeSession(session);
      }
    },
  });

  return { server, transport };
}

function getBitbucketConfig(requestUrl: URL): BitbucketConfig | null {
  const baseUrl =
    getQueryParam(requestUrl, 'BITBUCKET_URL', 'bitbucket_url') || DEFAULT_BITBUCKET_URL;
  const token =
    getQueryParam(requestUrl, 'BITBUCKET_TOKEN', 'bitbucket_token') || DEFAULT_BITBUCKET_TOKEN;

  if (!token) {
    return null;
  }

  return {
    baseUrl,
    token,
  };
}

function getQueryParam(requestUrl: URL, ...names: string[]) {
  for (const name of names) {
    const value = requestUrl.searchParams.get(name);
    if (value) {
      return value;
    }
  }

  return undefined;
}

async function closeSession(session: Session) {
  await Promise.allSettled([session.transport.close(), session.server.close()]);
}

function getSessionId(req: IncomingMessage) {
  const sessionId = req.headers['mcp-session-id'];
  return Array.isArray(sessionId) ? sessionId[0] : sessionId;
}

// Start the server
async function main() {
  const httpsServer = createHttpsServer(
    {
      key: readFileSync(MCP_TLS_KEY_PATH),
      cert: readFileSync(MCP_TLS_CERT_PATH),
      ...(MCP_TLS_CA_PATH ? { ca: readFileSync(MCP_TLS_CA_PATH) } : {}),
    },
    (req, res) => {
      void routeRequest(req, res).catch((error) => {
        console.error('Unhandled HTTPS request error:', error);
        if (!res.headersSent) {
          writeTextResponse(res, 500, 'Internal server error');
        }
      });
    }
  );

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      httpsServer.off('error', onError);
      reject(error);
    };

    httpsServer.once('error', onError);
    httpsServer.listen(MCP_PORT, MCP_HOST, () => {
      httpsServer.off('error', onError);
      resolve();
    });
  });

  const shutdown = () => {
    void Promise.allSettled(Array.from(sessions.values()).map((session) => closeSession(session))).finally(() => {
      httpsServer.close((error) => {
        if (error) {
          console.error('Failed to shut down HTTPS server:', error);
          process.exit(1);
        }

        process.exit(0);
      });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.error(`Bitbucket MCP HTTPS server listening on https://${MCP_HOST}:${MCP_PORT}${MCP_PATH}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
