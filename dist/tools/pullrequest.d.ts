import { BitbucketClient } from '../bitbucket-client.js';
export declare function registerPullRequestTools(client: BitbucketClient): {
    list_pull_requests: {
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
                state: {
                    type: string;
                    enum: string[];
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
            state?: "OPEN" | "MERGED" | "DECLINED" | "ALL";
            limit?: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    get_pull_request: {
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
                prId: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    create_pull_request: {
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
                title: {
                    type: string;
                    description: string;
                };
                fromBranch: {
                    type: string;
                    description: string;
                };
                toBranch: {
                    type: string;
                    description: string;
                };
                description: {
                    type: string;
                    description: string;
                };
                reviewers: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            title: string;
            fromBranch: string;
            toBranch: string;
            description?: string;
            reviewers?: string[];
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    get_pull_request_diff: {
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
                prId: {
                    type: string;
                    description: string;
                };
                contextLines: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
            contextLines?: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    list_pull_request_activities: {
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
                prId: {
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
            prId: number;
            limit?: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    approve_pull_request: {
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
                prId: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    unapprove_pull_request: {
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
                prId: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    needs_work_pull_request: {
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
                prId: {
                    type: string;
                    description: string;
                };
                username: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
            username: string;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    merge_pull_request: {
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
                prId: {
                    type: string;
                    description: string;
                };
                version: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
            version: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    decline_pull_request: {
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
                prId: {
                    type: string;
                    description: string;
                };
                version: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
            version: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    update_pull_request: {
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
                prId: {
                    type: string;
                    description: string;
                };
                version: {
                    type: string;
                    description: string;
                };
                title: {
                    type: string;
                    description: string;
                };
                description: {
                    type: string;
                    description: string;
                };
                reviewers: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
            version: number;
            title?: string;
            description?: string;
            reviewers?: string[];
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    add_pull_request_reviewers: {
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
                prId: {
                    type: string;
                    description: string;
                };
                version: {
                    type: string;
                    description: string;
                };
                reviewers: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
            version: number;
            reviewers: string[];
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    remove_pull_request_reviewer: {
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
                prId: {
                    type: string;
                    description: string;
                };
                username: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
            username: string;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    add_pull_request_comment: {
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
                prId: {
                    type: string;
                    description: string;
                };
                text: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
            text: string;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    add_pull_request_line_comment: {
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
                prId: {
                    type: string;
                    description: string;
                };
                text: {
                    type: string;
                    description: string;
                };
                filePath: {
                    type: string;
                    description: string;
                };
                line: {
                    type: string;
                    description: string;
                };
                lineType: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                fileType: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                fromHash: {
                    type: string;
                    description: string;
                };
                toHash: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
            text: string;
            filePath: string;
            line: number;
            lineType?: "ADDED" | "REMOVED" | "CONTEXT";
            fileType?: "FROM" | "TO";
            fromHash?: string;
            toHash?: string;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    reply_to_pull_request_comment: {
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
                prId: {
                    type: string;
                    description: string;
                };
                parentCommentId: {
                    type: string;
                    description: string;
                };
                text: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
            parentCommentId: number;
            text: string;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    get_pull_request_comments: {
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
                prId: {
                    type: string;
                    description: string;
                };
                path: {
                    type: string;
                    description: string;
                };
                anchorState: {
                    type: string;
                    enum: string[];
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
            prId: number;
            path?: string;
            anchorState?: "ACTIVE" | "ORPHANED" | "ALL";
            limit?: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    update_pull_request_comment: {
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
                prId: {
                    type: string;
                    description: string;
                };
                commentId: {
                    type: string;
                    description: string;
                };
                text: {
                    type: string;
                    description: string;
                };
                version: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
            commentId: number;
            text: string;
            version: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    delete_pull_request_comment: {
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
                prId: {
                    type: string;
                    description: string;
                };
                commentId: {
                    type: string;
                    description: string;
                };
                version: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: (args: {
            projectKey: string;
            repoSlug: string;
            prId: number;
            commentId: number;
            version: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    list_my_pull_requests_to_review: {
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                limit: {
                    type: string;
                    description: string;
                };
            };
        };
        handler: (args: {
            limit?: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
    list_my_pull_requests: {
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                role: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                state: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                limit: {
                    type: string;
                    description: string;
                };
            };
        };
        handler: (args: {
            role?: "AUTHOR" | "REVIEWER" | "PARTICIPANT";
            state?: "OPEN" | "MERGED" | "DECLINED" | "ALL";
            limit?: number;
        }) => Promise<{
            content: {
                type: "text";
                text: string;
            }[];
        }>;
    };
};
