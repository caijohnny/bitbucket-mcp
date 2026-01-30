export function registerPullRequestTools(client) {
    return {
        list_pull_requests: {
            description: 'List pull requests in a repository',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    state: {
                        type: 'string',
                        enum: ['OPEN', 'MERGED', 'DECLINED', 'ALL'],
                        description: 'PR state filter (default: OPEN)',
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum number of PRs to return (default: 25)',
                    },
                },
                required: ['projectKey', 'repoSlug'],
            },
            handler: async (args) => {
                const result = await client.listPullRequests(args.projectKey, args.repoSlug, args.state || 'OPEN', args.limit);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                pullRequests: result.values.map((pr) => ({
                                    id: pr.id,
                                    title: pr.title,
                                    state: pr.state,
                                    author: pr.author.user.displayName,
                                    fromBranch: pr.fromRef.displayId,
                                    toBranch: pr.toRef.displayId,
                                    createdDate: new Date(pr.createdDate).toISOString(),
                                    reviewers: pr.reviewers.map((r) => ({
                                        name: r.user.displayName,
                                        status: r.status,
                                    })),
                                })),
                                pagination: {
                                    size: result.size,
                                    isLastPage: result.isLastPage,
                                },
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        get_pull_request: {
            description: 'Get details of a specific pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId'],
            },
            handler: async (args) => {
                const pr = await client.getPullRequest(args.projectKey, args.repoSlug, args.prId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                id: pr.id,
                                version: pr.version,
                                title: pr.title,
                                description: pr.description,
                                state: pr.state,
                                author: {
                                    name: pr.author.user.displayName,
                                    username: pr.author.user.name,
                                },
                                fromBranch: pr.fromRef.displayId,
                                toBranch: pr.toRef.displayId,
                                createdDate: new Date(pr.createdDate).toISOString(),
                                updatedDate: new Date(pr.updatedDate).toISOString(),
                                reviewers: pr.reviewers.map((r) => ({
                                    name: r.user.displayName,
                                    username: r.user.name,
                                    status: r.status,
                                })),
                                link: pr.links.self[0]?.href,
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        create_pull_request: {
            description: 'Create a new pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    title: {
                        type: 'string',
                        description: 'PR title',
                    },
                    fromBranch: {
                        type: 'string',
                        description: 'Source branch name',
                    },
                    toBranch: {
                        type: 'string',
                        description: 'Target branch name',
                    },
                    description: {
                        type: 'string',
                        description: 'PR description (optional)',
                    },
                    reviewers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of reviewer usernames (optional)',
                    },
                },
                required: ['projectKey', 'repoSlug', 'title', 'fromBranch', 'toBranch'],
            },
            handler: async (args) => {
                const pr = await client.createPullRequest(args.projectKey, args.repoSlug, args.title, args.fromBranch, args.toBranch, args.description, args.reviewers);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                id: pr.id,
                                title: pr.title,
                                link: pr.links.self[0]?.href,
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        get_pull_request_diff: {
            description: 'Get the diff/changes of a pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    contextLines: {
                        type: 'number',
                        description: 'Number of context lines around changes (default: 3)',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId'],
            },
            handler: async (args) => {
                const diff = await client.getPullRequestDiff(args.projectKey, args.repoSlug, args.prId, args.contextLines);
                return {
                    content: [
                        {
                            type: 'text',
                            text: diff,
                        },
                    ],
                };
            },
        },
        list_pull_request_activities: {
            description: 'Get activities/comments on a pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum number of activities to return (default: 25)',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId'],
            },
            handler: async (args) => {
                const result = await client.getPullRequestActivities(args.projectKey, args.repoSlug, args.prId, args.limit);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                activities: result.values.map((a) => ({
                                    id: a.id,
                                    action: a.action,
                                    user: a.user.displayName,
                                    date: new Date(a.createdDate).toISOString(),
                                    comment: a.comment
                                        ? {
                                            text: a.comment.text,
                                            severity: a.comment.severity,
                                            state: a.comment.state,
                                        }
                                        : undefined,
                                })),
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        approve_pull_request: {
            description: 'Approve a pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId'],
            },
            handler: async (args) => {
                await client.approvePullRequest(args.projectKey, args.repoSlug, args.prId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({ success: true, message: 'Pull request approved' }, null, 2),
                        },
                    ],
                };
            },
        },
        unapprove_pull_request: {
            description: 'Remove approval from a pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId'],
            },
            handler: async (args) => {
                await client.unapprovePullRequest(args.projectKey, args.repoSlug, args.prId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({ success: true, message: 'Approval removed' }, null, 2),
                        },
                    ],
                };
            },
        },
        needs_work_pull_request: {
            description: 'Mark a pull request as needing work',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    username: {
                        type: 'string',
                        description: 'Your username (reviewer username)',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId', 'username'],
            },
            handler: async (args) => {
                await client.setReviewerStatus(args.projectKey, args.repoSlug, args.prId, args.username, 'NEEDS_WORK');
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({ success: true, message: 'Pull request marked as needs work' }, null, 2),
                        },
                    ],
                };
            },
        },
        merge_pull_request: {
            description: 'Merge a pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    version: {
                        type: 'number',
                        description: 'Current version of the PR (for optimistic locking)',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId', 'version'],
            },
            handler: async (args) => {
                const pr = await client.mergePullRequest(args.projectKey, args.repoSlug, args.prId, args.version);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                message: 'Pull request merged',
                                state: pr.state,
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        decline_pull_request: {
            description: 'Decline a pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    version: {
                        type: 'number',
                        description: 'Current version of the PR (for optimistic locking)',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId', 'version'],
            },
            handler: async (args) => {
                const pr = await client.declinePullRequest(args.projectKey, args.repoSlug, args.prId, args.version);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                message: 'Pull request declined',
                                state: pr.state,
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        update_pull_request: {
            description: 'Update a pull request (title, description, reviewers)',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    version: {
                        type: 'number',
                        description: 'Current version of the PR (for optimistic locking). Get it from get_pull_request.',
                    },
                    title: {
                        type: 'string',
                        description: 'New title for the PR (optional)',
                    },
                    description: {
                        type: 'string',
                        description: 'New description for the PR (optional)',
                    },
                    reviewers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'New list of reviewer usernames. This will REPLACE all existing reviewers. (optional)',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId', 'version'],
            },
            handler: async (args) => {
                const pr = await client.updatePullRequest(args.projectKey, args.repoSlug, args.prId, args.version, {
                    title: args.title,
                    description: args.description,
                    reviewers: args.reviewers,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                message: 'Pull request updated',
                                id: pr.id,
                                version: pr.version,
                                title: pr.title,
                                description: pr.description,
                                reviewers: pr.reviewers.map((r) => ({
                                    name: r.user.displayName,
                                    username: r.user.name,
                                    status: r.status,
                                })),
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        add_pull_request_reviewers: {
            description: 'Add reviewers to a pull request (existing reviewers will be kept)',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    version: {
                        type: 'number',
                        description: 'Current version of the PR (for optimistic locking). Get it from get_pull_request.',
                    },
                    reviewers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of reviewer usernames to add',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId', 'version', 'reviewers'],
            },
            handler: async (args) => {
                const pr = await client.addPullRequestReviewers(args.projectKey, args.repoSlug, args.prId, args.version, args.reviewers);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                message: 'Reviewers added',
                                reviewers: pr.reviewers.map((r) => ({
                                    name: r.user.displayName,
                                    username: r.user.name,
                                    status: r.status,
                                })),
                                newVersion: pr.version,
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        remove_pull_request_reviewer: {
            description: 'Remove a reviewer from a pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    username: {
                        type: 'string',
                        description: 'Username of the reviewer to remove',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId', 'username'],
            },
            handler: async (args) => {
                await client.removePullRequestReviewer(args.projectKey, args.repoSlug, args.prId, args.username);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                message: `Reviewer '${args.username}' removed from pull request`,
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        add_pull_request_comment: {
            description: 'Add a general comment to a pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    text: {
                        type: 'string',
                        description: 'Comment text',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId', 'text'],
            },
            handler: async (args) => {
                const comment = await client.addPullRequestComment(args.projectKey, args.repoSlug, args.prId, args.text);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                commentId: comment?.id,
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        add_pull_request_line_comment: {
            description: 'Add a comment to a specific line of code in a pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    text: {
                        type: 'string',
                        description: 'Comment text',
                    },
                    filePath: {
                        type: 'string',
                        description: 'Path to the file being commented on (relative to repo root, e.g., "src/application/home/service/HomeService.ts")',
                    },
                    line: {
                        type: 'number',
                        description: 'Line number to comment on. For new files (ADDED), this should be the line number in the destination file. For modified files, use the line number in the diff view.',
                    },
                    lineType: {
                        type: 'string',
                        enum: ['ADDED', 'REMOVED', 'CONTEXT'],
                        description: 'Type of line: ADDED (new line in destination), REMOVED (deleted line from source), CONTEXT (unchanged line). Default: CONTEXT. For new files, use ADDED.',
                    },
                    fileType: {
                        type: 'string',
                        enum: ['FROM', 'TO'],
                        description: 'FROM for the source file, TO for the destination file. Default: TO. For new files, always use TO.',
                    },
                    fromHash: {
                        type: 'string',
                        description: 'Optional: Source commit hash (fromRef.latestCommit). If provided along with toHash, will use COMMIT diffType.',
                    },
                    toHash: {
                        type: 'string',
                        description: 'Optional: Destination commit hash (toRef.latestCommit). If provided along with fromHash, will use COMMIT diffType.',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId', 'text', 'filePath', 'line'],
            },
            handler: async (args) => {
                // 如果没有提供 hash，尝试从 PR 获取（可选优化）
                let fromHash = args.fromHash;
                let toHash = args.toHash;
                // 如果都没有提供，尝试获取 PR 信息来获取 commit hash
                if (!fromHash || !toHash) {
                    try {
                        const pr = await client.getPullRequest(args.projectKey, args.repoSlug, args.prId);
                        if (!fromHash)
                            fromHash = pr.fromRef.latestCommit;
                        if (!toHash)
                            toHash = pr.toRef.latestCommit;
                    }
                    catch (error) {
                        // 如果获取失败，继续使用原有的方式（不提供 hash）
                        console.warn('Could not fetch PR info for commit hashes, using EFFECTIVE diffType');
                    }
                }
                const comment = await client.addPullRequestLineComment(args.projectKey, args.repoSlug, args.prId, args.text, args.filePath, args.line, args.lineType || 'CONTEXT', args.fileType || 'TO', fromHash, toHash);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                commentId: comment?.id,
                                message: `Comment added to ${args.filePath}:${args.line} (lineType: ${args.lineType || 'CONTEXT'}, fileType: ${args.fileType || 'TO'})`,
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        reply_to_pull_request_comment: {
            description: 'Reply to an existing comment on a pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    parentCommentId: {
                        type: 'number',
                        description: 'ID of the comment to reply to',
                    },
                    text: {
                        type: 'string',
                        description: 'Reply text',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId', 'parentCommentId', 'text'],
            },
            handler: async (args) => {
                const comment = await client.replyToPullRequestComment(args.projectKey, args.repoSlug, args.prId, args.parentCommentId, args.text);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                commentId: comment?.id,
                                message: 'Reply added successfully',
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        get_pull_request_comments: {
            description: 'Get all comments on a pull request, optionally filtered by file path',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    path: {
                        type: 'string',
                        description: 'Filter comments by file path (optional)',
                    },
                    anchorState: {
                        type: 'string',
                        enum: ['ACTIVE', 'ORPHANED', 'ALL'],
                        description: 'Filter by anchor state: ACTIVE (current), ORPHANED (outdated), ALL (default: ALL)',
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum number of comments to return (default: 100)',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId'],
            },
            handler: async (args) => {
                const result = await client.getPullRequestComments(args.projectKey, args.repoSlug, args.prId, args.path, args.limit, 0, args.anchorState || 'ALL');
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                comments: result.values.map((c) => ({
                                    id: c?.id,
                                    text: c?.text,
                                    author: c?.author?.displayName,
                                    createdDate: c?.createdDate ? new Date(c.createdDate).toISOString() : undefined,
                                    updatedDate: c?.updatedDate ? new Date(c.updatedDate).toISOString() : undefined,
                                    version: c?.version,
                                    severity: c?.severity,
                                    state: c?.state,
                                })),
                                pagination: {
                                    size: result.size,
                                    isLastPage: result.isLastPage,
                                },
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        update_pull_request_comment: {
            description: 'Update an existing comment on a pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    commentId: {
                        type: 'number',
                        description: 'ID of the comment to update',
                    },
                    text: {
                        type: 'string',
                        description: 'New comment text',
                    },
                    version: {
                        type: 'number',
                        description: 'Current version of the comment (for optimistic locking)',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId', 'commentId', 'text', 'version'],
            },
            handler: async (args) => {
                const comment = await client.updatePullRequestComment(args.projectKey, args.repoSlug, args.prId, args.commentId, args.text, args.version);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                commentId: comment?.id,
                                newVersion: comment?.version,
                                message: 'Comment updated successfully',
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        delete_pull_request_comment: {
            description: 'Delete a comment from a pull request',
            inputSchema: {
                type: 'object',
                properties: {
                    projectKey: {
                        type: 'string',
                        description: 'Project key (e.g., "PROJ")',
                    },
                    repoSlug: {
                        type: 'string',
                        description: 'Repository slug (e.g., "my-repo")',
                    },
                    prId: {
                        type: 'number',
                        description: 'Pull request ID',
                    },
                    commentId: {
                        type: 'number',
                        description: 'ID of the comment to delete',
                    },
                    version: {
                        type: 'number',
                        description: 'Current version of the comment (for optimistic locking)',
                    },
                },
                required: ['projectKey', 'repoSlug', 'prId', 'commentId', 'version'],
            },
            handler: async (args) => {
                await client.deletePullRequestComment(args.projectKey, args.repoSlug, args.prId, args.commentId, args.version);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                message: 'Comment deleted successfully',
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        list_my_pull_requests_to_review: {
            description: 'List pull requests assigned to me for review',
            inputSchema: {
                type: 'object',
                properties: {
                    limit: {
                        type: 'number',
                        description: 'Maximum number of PRs to return (default: 25)',
                    },
                },
            },
            handler: async (args) => {
                const result = await client.getMyPullRequestsToReview(args.limit);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                pullRequests: result.values.map((pr) => ({
                                    id: pr.id,
                                    title: pr.title,
                                    state: pr.state,
                                    author: pr.author.user.displayName,
                                    repository: `${pr.toRef.repository.project.key}/${pr.toRef.repository.slug}`,
                                    fromBranch: pr.fromRef.displayId,
                                    toBranch: pr.toRef.displayId,
                                    createdDate: new Date(pr.createdDate).toISOString(),
                                    link: pr.links.self[0]?.href,
                                })),
                                pagination: {
                                    size: result.size,
                                    isLastPage: result.isLastPage,
                                },
                            }, null, 2),
                        },
                    ],
                };
            },
        },
        list_my_pull_requests: {
            description: 'List pull requests related to me (created by me, need my review, or participating)',
            inputSchema: {
                type: 'object',
                properties: {
                    role: {
                        type: 'string',
                        enum: ['AUTHOR', 'REVIEWER', 'PARTICIPANT'],
                        description: 'Role filter: AUTHOR (created by me), REVIEWER (need my review), PARTICIPANT (participating). Default: AUTHOR',
                    },
                    state: {
                        type: 'string',
                        enum: ['OPEN', 'MERGED', 'DECLINED', 'ALL'],
                        description: 'PR state filter (default: OPEN)',
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum number of PRs to return (default: 25)',
                    },
                },
            },
            handler: async (args) => {
                const result = await client.getMyPullRequests(args.role || 'AUTHOR', args.state, args.limit);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                role: args.role || 'AUTHOR',
                                pullRequests: result.values.map((pr) => ({
                                    id: pr.id,
                                    title: pr.title,
                                    state: pr.state,
                                    author: pr.author.user.displayName,
                                    repository: `${pr.toRef.repository.project.key}/${pr.toRef.repository.slug}`,
                                    fromBranch: pr.fromRef.displayId,
                                    toBranch: pr.toRef.displayId,
                                    createdDate: new Date(pr.createdDate).toISOString(),
                                    link: pr.links.self[0]?.href,
                                })),
                                pagination: {
                                    size: result.size,
                                    isLastPage: result.isLastPage,
                                },
                            }, null, 2),
                        },
                    ],
                };
            },
        },
    };
}
