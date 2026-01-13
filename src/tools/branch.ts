import { BitbucketClient } from '../bitbucket-client.js';

export function registerBranchTools(client: BitbucketClient) {
  return {
    list_branches: {
      description: 'List branches in a repository',
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
          filterText: {
            type: 'string',
            description: 'Filter branches by name (optional)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of branches to return (default: 25)',
          },
        },
        required: ['projectKey', 'repoSlug'],
      },
      handler: async (args: {
        projectKey: string;
        repoSlug: string;
        filterText?: string;
        limit?: number;
      }) => {
        const result = await client.listBranches(
          args.projectKey,
          args.repoSlug,
          args.filterText,
          args.limit
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  branches: result.values.map((b) => ({
                    name: b.displayId,
                    id: b.id,
                    latestCommit: b.latestCommit,
                    isDefault: b.isDefault,
                  })),
                  pagination: {
                    size: result.size,
                    isLastPage: result.isLastPage,
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

    get_default_branch: {
      description: 'Get the default branch of a repository',
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
        const branch = await client.getDefaultBranch(args.projectKey, args.repoSlug);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  name: branch.displayId,
                  id: branch.id,
                  latestCommit: branch.latestCommit,
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
