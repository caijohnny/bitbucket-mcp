#!/usr/bin/env node

import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from 'node:http';
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
const MCP_TLS_KEY_PATH = process.env.MCP_TLS_KEY_PATH;
const MCP_TLS_CERT_PATH = process.env.MCP_TLS_CERT_PATH;
const MCP_TLS_CA_PATH = process.env.MCP_TLS_CA_PATH;
const MCP_PROTOCOL = resolveProtocol({
  protocol: process.env.MCP_PROTOCOL,
  tlsKeyPath: MCP_TLS_KEY_PATH,
  tlsCertPath: MCP_TLS_CERT_PATH,
});

const sessions = new Map<string, Session>();

type SupportedProtocol = 'http' | 'https';

type Session = {
  server: Server;
  transport: StreamableHTTPServerTransport;
};

type BitbucketConfig = {
  baseUrl: string;
  token: string;
};

type ProtocolConfig = {
  protocol?: string;
  tlsKeyPath?: string;
  tlsCertPath?: string;
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

function parseProtocol(value: string): SupportedProtocol {
  const protocol = value.toLowerCase();
  if (protocol !== 'http' && protocol !== 'https') {
    console.error(`Error: invalid MCP_PROTOCOL value "${value}"`);
    process.exit(1);
  }

  return protocol;
}

function resolveProtocol(config: ProtocolConfig): SupportedProtocol {
  const { protocol, tlsKeyPath, tlsCertPath } = config;

  if (protocol) {
    return parseProtocol(protocol);
  }

  if (tlsKeyPath && tlsCertPath) {
    return 'https';
  }

  if (tlsKeyPath || tlsCertPath) {
    console.error(
      'Error: MCP_TLS_KEY_PATH and MCP_TLS_CERT_PATH must both be provided to enable HTTPS automatically'
    );
    process.exit(1);
  }

  return 'http';
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
  const requestUrl = getRequestUrl(req);

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
  const requestUrl = getRequestUrl(req);

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

function getRequestUrl(req: IncomingMessage) {
  const host = req.headers.host || `${MCP_HOST}:${MCP_PORT}`;
  return new URL(req.url || '/', `${getRequestProtocol(req)}://${host}`);
}

function getRequestProtocol(req: IncomingMessage): SupportedProtocol {
  const forwardedProtoHeader = req.headers['x-forwarded-proto'];
  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader?.split(',')[0];
  const normalizedProto = forwardedProto?.trim().toLowerCase();

  if (normalizedProto === 'http' || normalizedProto === 'https') {
    return normalizedProto;
  }

  return MCP_PROTOCOL;
}

function getSessionId(req: IncomingMessage) {
  const sessionId = req.headers['mcp-session-id'];
  return Array.isArray(sessionId) ? sessionId[0] : sessionId;
}

// Start the server
async function main() {
  const requestHandler = (req: IncomingMessage, res: ServerResponse) => {
    void routeRequest(req, res).catch((error) => {
      console.error('Unhandled MCP request error:', error);
      if (!res.headersSent) {
        writeTextResponse(res, 500, 'Internal server error');
      }
    });
  };

  const server =
    MCP_PROTOCOL === 'https'
      ? createHttpsServer(
          {
            key: readFileSync(getRequiredEnv('MCP_TLS_KEY_PATH')),
            cert: readFileSync(getRequiredEnv('MCP_TLS_CERT_PATH')),
            ...(MCP_TLS_CA_PATH ? { ca: readFileSync(MCP_TLS_CA_PATH) } : {}),
          },
          requestHandler
        )
      : createHttpServer(requestHandler);

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      server.off('error', onError);
      reject(error);
    };

    server.once('error', onError);
    server.listen(MCP_PORT, MCP_HOST, () => {
      server.off('error', onError);
      resolve();
    });
  });

  const shutdown = () => {
    void Promise.allSettled(Array.from(sessions.values()).map((session) => closeSession(session))).finally(() => {
      server.close((error) => {
        if (error) {
          console.error(`Failed to shut down ${MCP_PROTOCOL.toUpperCase()} server:`, error);
          process.exit(1);
        }

        process.exit(0);
      });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.error(
    `Bitbucket MCP ${MCP_PROTOCOL.toUpperCase()} server listening on ${MCP_PROTOCOL}://${MCP_HOST}:${MCP_PORT}${MCP_PATH}`
  );
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
