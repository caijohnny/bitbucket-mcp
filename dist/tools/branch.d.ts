import { BitbucketClient } from '../bitbucket-client.js';
export declare function registerBranchTools(client: BitbucketClient): {
    list_branches: {
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                projectKey: {
                    type: string;
                    description: string;
                };
                repoSlug: {
                    type: string;
                    description: string;
                };
                filterText: {
                    type: string;
                    description: string;
                };
                limit: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            filterText?: string;
            limit?: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    get_default_branch: {
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                projectKey: {
                    type: string;
                    description: string;
                };
                repoSlug: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
};
