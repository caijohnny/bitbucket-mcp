import { BitbucketClient } from '../bitbucket-client.js';

export function registerRepositoryTools(client: BitbucketClient) {
  return {
    list_projects: {
      description: 'List all projects in Bitbucket',
      inputSchema: {
        type: 'object' as const,
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of projects to return (default: 25)',
          },
          start: {
            type: 'number',
            description: 'Start index for pagination (default: 0)',
          },
        },
      },
      handler: async (args: { limit?: number; start?: number }) => {
        const result = await client.listProjects(args.limit, args.start);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  projects: result.values.map((p) => ({
                    key: p.key,
                    name: p.name,
                    description: p.description,
                    public: p.public,
                  })),
                  pagination: {
                    size: result.size,
                    limit: result.limit,
                    isLastPage: result.isLastPage,
                    nextPageStart: result.nextPageStart,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      },
    },

    list_repositories: {
      description: 'List repositories in a project',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectKey: {
            type: 'string',
            description: 'Project key (e.g., "PROJ")',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of repositories to return (default: 25)',
          },
          start: {
            type: 'number',
            description: 'Start index for pagination (default: 0)',
          },
        },
        required: ['projectKey'],
      },
      handler: async (args: { projectKey: string; limit?: number; start?: number }) => {
        const result = await client.listRepositories(args.projectKey, args.limit, args.start);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  repositories: result.values.map((r) => ({
                    slug: r.slug,
                    name: r.name,
                    description: r.description,
                    public: r.public,
                    cloneUrls: r.links.clone,
                  })),
                  pagination: {
                    size: result.size,
                    limit: result.limit,
                    isLastPage: result.isLastPage,
                    nextPageStart: result.nextPageStart,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      },
    },

    get_repository: {
      description: 'Get details of a specific repository',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectKey: {
            type: 'string',
            description: 'Project key (e.g., "PROJ")',
          },
          repoSlug: {
            type: 'string',
            description: 'Repository slug (e.g., "my-repo")',
          },
        },
        required: ['projectKey', 'repoSlug'],
      },
      handler: async (args: { projectKey: string; repoSlug: string }) => {
        const repo = await client.getRepository(args.projectKey, args.repoSlug);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  slug: repo.slug,
                  name: repo.name,
                  description: repo.description,
                  public: repo.public,
                  forkable: repo.forkable,
                  project: {
                    key: repo.project.key,
                    name: repo.project.name,
                  },
                  cloneUrls: repo.links.clone,
                },
                null,
                2
              ),
            },
          ],
        };
      },
    },

    browse_repository: {
      description: 'Browse files and directories in a repository',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectKey: {
            type: 'string',
            description: 'Project key (e.g., "PROJ")',
          },
          repoSlug: {
            type: 'string',
            description: 'Repository slug (e.g., "my-repo")',
          },
          path: {
            type: 'string',
            description: 'Path to browse (default: root)',
          },
          at: {
            type: 'string',
            description: 'Branch, tag, or commit to browse at (default: default branch)',
          },
        },
        required: ['projectKey', 'repoSlug'],
      },
      handler: async (args: {
        projectKey: string;
        repoSlug: string;
        path?: string;
        at?: string;
      }) => {
        const result = await client.browseRepository(
          args.projectKey,
          args.repoSlug,
          args.path || '',
          args.at
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  path: result.path.toString,
                  revision: result.revision,
                  children: result.children.values.map((c) => ({
                    name: c.path.name,
                    path: c.path.toString,
                    type: c.type,
                    size: c.size,
                  })),
                  pagination: {
                    size: result.children.size,
                    isLastPage: result.children.isLastPage,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      },
    },

    get_file_content: {
      description: 'Get the content of a file in a repository',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectKey: {
            type: 'string',
            description: 'Project key (e.g., "PROJ")',
          },
          repoSlug: {
            type: 'string',
            description: 'Repository slug (e.g., "my-repo")',
          },
          path: {
            type: 'string',
            description: 'Path to the file',
          },
          at: {
            type: 'string',
            description: 'Branch, tag, or commit (default: default branch)',
          },
        },
        required: ['projectKey', 'repoSlug', 'path'],
      },
      handler: async (args: {
        projectKey: string;
        repoSlug: string;
        path: string;
        at?: string;
      }) => {
        const content = await client.getFileContent(
          args.projectKey,
          args.repoSlug,
          args.path,
          args.at
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: content,
            },
          ],
        };
      },
    },

    search_code: {
      description: 'Search for code across repositories',
      inputSchema: {
        type: 'object' as const,
        properties: {
          query: {
            type: 'string',
            description: 'Search query',
          },
          projectKey: {
            type: 'string',
            description: 'Limit search to a specific project (optional)',
          },
          repoSlug: {
            type: 'string',
            description: 'Limit search to a specific repository (requires projectKey)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default: 25)',
          },
        },
        required: ['query'],
      },
      handler: async (args: {
        query: string;
        projectKey?: string;
        repoSlug?: string;
        limit?: number;
      }) => {
        const result = await client.searchCode(
          args.query,
          args.projectKey,
          args.repoSlug,
          args.limit
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  count: result.code?.count || 0,
                  results:
                    result.code?.values.map((v) => ({
                      file: v.file.path,
                      repository: `${v.repository.project.key}/${v.repository.slug}`,
                      matches: v.hitContexts.map((ctx) =>
                        ctx.context.map((c) => ({
                          line: c.line.line,
                          text: c.line.text,
                          highlight: c.highlight,
                        }))
                      ),
                    })) || [],
                },
                null,
                2
              ),
            },
          ],
        };
      },
    },
  };
}
