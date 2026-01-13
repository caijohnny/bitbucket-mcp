import { BitbucketClient } from '../bitbucket-client.js';
export declare function registerRepositoryTools(client: BitbucketClient): {
    list_projects: {
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                limit: {
                    type: string;
                    description: string;
                };
                start: {
                    type: string;
                    description: string;
                };
            };
        };
        handler: (args: {
            limit?: number;
            start?: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    list_repositories: {
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                projectKey: {
                    type: string;
                    description: string;
                };
                limit: {
                    type: string;
                    description: string;
                };
                start: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            limit?: number;
            start?: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    get_repository: {
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
    browse_repository: {
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
                path: {
                    type: string;
                    description: string;
                };
                at: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            path?: string;
            at?: string;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    get_file_content: {
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
                path: {
                    type: string;
                    description: string;
                };
                at: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            path: string;
            at?: string;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    search_code: {
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                query: {
                    type: string;
                    description: string;
                };
                projectKey: {
                    type: string;
                    description: string;
                };
                repoSlug: {
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
            query: string;
            projectKey?: string;
            repoSlug?: string;
            limit?: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
};
