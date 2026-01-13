export interface BitbucketUser {
    name: string;
    emailAddress?: string;
    id: number;
    displayName: string;
    active: boolean;
    slug: string;
    type: string;
}
export interface BitbucketProject {
    key: string;
    id: number;
    name: string;
    description?: string;
    public: boolean;
    type: string;
    links: {
        self: Array<{
            href: string;
        }>;
    };
}
export interface BitbucketRepository {
    slug: string;
    id: number;
    name: string;
    description?: string;
    hierarchyId: string;
    scmId: string;
    state: string;
    statusMessage: string;
    forkable: boolean;
    project: BitbucketProject;
    public: boolean;
    links: {
        clone: Array<{
            href: string;
            name: string;
        }>;
        self: Array<{
            href: string;
        }>;
    };
}
export interface BitbucketBranch {
    id: string;
    displayId: string;
    type: string;
    latestCommit: string;
    latestChangeset?: string;
    isDefault: boolean;
}
export interface BitbucketCommit {
    id: string;
    displayId: string;
    author: {
        name: string;
        emailAddress: string;
    };
    authorTimestamp: number;
    committer: {
        name: string;
        emailAddress: string;
    };
    committerTimestamp: number;
    message: string;
    parents: Array<{
        id: string;
        displayId: string;
    }>;
}
export interface BitbucketPullRequest {
    id: number;
    version: number;
    title: string;
    description?: string;
    state: 'OPEN' | 'MERGED' | 'DECLINED';
    open: boolean;
    closed: boolean;
    createdDate: number;
    updatedDate: number;
    closedDate?: number;
    fromRef: {
        id: string;
        displayId: string;
        latestCommit: string;
        repository: BitbucketRepository;
    };
    toRef: {
        id: string;
        displayId: string;
        latestCommit: string;
        repository: BitbucketRepository;
    };
    locked: boolean;
    author: {
        user: BitbucketUser;
        role: string;
        approved: boolean;
        status: string;
    };
    reviewers: Array<{
        user: BitbucketUser;
        role: string;
        approved: boolean;
        status: 'UNAPPROVED' | 'NEEDS_WORK' | 'APPROVED';
        lastReviewedCommit?: string;
    }>;
    participants: Array<{
        user: BitbucketUser;
        role: string;
        approved: boolean;
        status: string;
    }>;
    links: {
        self: Array<{
            href: string;
        }>;
    };
}
export interface BitbucketPullRequestActivity {
    id: number;
    createdDate: number;
    user: BitbucketUser;
    action: string;
    commentAction?: string;
    comment?: {
        id: number;
        version: number;
        text: string;
        author: BitbucketUser;
        createdDate: number;
        updatedDate: number;
        comments?: BitbucketPullRequestActivity[];
        severity?: string;
        state?: string;
    };
    diff?: {
        source?: {
            components: string[];
            toString: string;
        };
        destination?: {
            components: string[];
            toString: string;
        };
        hunks?: Array<{
            sourceLine: number;
            sourceSpan: number;
            destinationLine: number;
            destinationSpan: number;
            segments: Array<{
                type: string;
                lines: Array<{
                    source: number;
                    destination: number;
                    line: string;
                }>;
            }>;
        }>;
    };
}
export interface BitbucketFileContent {
    lines: Array<{
        text: string;
    }>;
    start: number;
    size: number;
    isLastPage: boolean;
}
export interface BitbucketBrowsePath {
    path: {
        components: string[];
        name: string;
        toString: string;
    };
    revision: string;
    children: {
        size: number;
        limit: number;
        isLastPage: boolean;
        values: Array<{
            path: {
                components: string[];
                name: string;
                toString: string;
            };
            type: 'FILE' | 'DIRECTORY';
            size?: number;
        }>;
        start: number;
    };
}
export interface BitbucketSearchResult {
    code?: {
        count: number;
        values: Array<{
            file: {
                path: string;
                name: string;
            };
            hitContexts: Array<{
                context: Array<{
                    line: {
                        text: string;
                        line: number;
                    };
                    highlight?: boolean;
                }>;
            }>;
            repository: BitbucketRepository;
        }>;
    };
}
export interface PagedResponse<T> {
    size: number;
    limit: number;
    isLastPage: boolean;
    values: T[];
    start: number;
    nextPageStart?: number;
}
export interface BitbucketConfig {
    baseUrl: string;
    token: string;
}
