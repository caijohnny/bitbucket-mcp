import { BitbucketConfig, BitbucketProject, BitbucketRepository, BitbucketBranch, BitbucketPullRequest, BitbucketPullRequestActivity, BitbucketBrowsePath, BitbucketSearchResult, PagedResponse } from './types.js';
export declare class BitbucketClient {
    private client;
    private baseUrl;
    constructor(config: BitbucketConfig);
    private handleError;
    listProjects(limit?: number, start?: number): Promise<PagedResponse<BitbucketProject>>;
    getProject(projectKey: string): Promise<BitbucketProject>;
    listRepositories(projectKey: string, limit?: number, start?: number): Promise<PagedResponse<BitbucketRepository>>;
    getRepository(projectKey: string, repoSlug: string): Promise<BitbucketRepository>;
    browseRepository(projectKey: string, repoSlug: string, path?: string, at?: string, limit?: number): Promise<BitbucketBrowsePath>;
    getFileContent(projectKey: string, repoSlug: string, path: string, at?: string): Promise<string>;
    listBranches(projectKey: string, repoSlug: string, filterText?: string, limit?: number, start?: number): Promise<PagedResponse<BitbucketBranch>>;
    getDefaultBranch(projectKey: string, repoSlug: string): Promise<BitbucketBranch>;
    listPullRequests(projectKey: string, repoSlug: string, state?: 'OPEN' | 'MERGED' | 'DECLINED' | 'ALL', limit?: number, start?: number, direction?: 'INCOMING' | 'OUTGOING'): Promise<PagedResponse<BitbucketPullRequest>>;
    getPullRequest(projectKey: string, repoSlug: string, prId: number): Promise<BitbucketPullRequest>;
    createPullRequest(projectKey: string, repoSlug: string, title: string, fromBranch: string, toBranch: string, description?: string, reviewers?: string[]): Promise<BitbucketPullRequest>;
    getPullRequestDiff(projectKey: string, repoSlug: string, prId: number, contextLines?: number): Promise<string>;
    getPullRequestActivities(projectKey: string, repoSlug: string, prId: number, limit?: number, start?: number): Promise<PagedResponse<BitbucketPullRequestActivity>>;
    approvePullRequest(projectKey: string, repoSlug: string, prId: number): Promise<{
        approved: boolean;
    }>;
    unapprovePullRequest(projectKey: string, repoSlug: string, prId: number): Promise<void>;
    setReviewerStatus(projectKey: string, repoSlug: string, prId: number, username: string, status: 'APPROVED' | 'NEEDS_WORK' | 'UNAPPROVED'): Promise<void>;
    mergePullRequest(projectKey: string, repoSlug: string, prId: number, version: number): Promise<BitbucketPullRequest>;
    declinePullRequest(projectKey: string, repoSlug: string, prId: number, version: number): Promise<BitbucketPullRequest>;
    addPullRequestComment(projectKey: string, repoSlug: string, prId: number, text: string): Promise<BitbucketPullRequestActivity['comment']>;
    addPullRequestLineComment(projectKey: string, repoSlug: string, prId: number, text: string, filePath: string, line: number, lineType?: 'ADDED' | 'REMOVED' | 'CONTEXT', fileType?: 'FROM' | 'TO'): Promise<BitbucketPullRequestActivity['comment']>;
    replyToPullRequestComment(projectKey: string, repoSlug: string, prId: number, parentCommentId: number, text: string): Promise<BitbucketPullRequestActivity['comment']>;
    getPullRequestComments(projectKey: string, repoSlug: string, prId: number, path?: string, limit?: number, start?: number, anchorState?: 'ACTIVE' | 'ORPHANED' | 'ALL'): Promise<PagedResponse<BitbucketPullRequestActivity['comment']>>;
    deletePullRequestComment(projectKey: string, repoSlug: string, prId: number, commentId: number, version: number): Promise<void>;
    updatePullRequestComment(projectKey: string, repoSlug: string, prId: number, commentId: number, text: string, version: number): Promise<BitbucketPullRequestActivity['comment']>;
    searchCode(query: string, projectKey?: string, repoSlug?: string, limit?: number): Promise<BitbucketSearchResult>;
    getCurrentUser(): Promise<{
        name: string;
        emailAddress: string;
        displayName: string;
    }>;
    getMyPullRequestsToReview(limit?: number, start?: number): Promise<PagedResponse<BitbucketPullRequest>>;
    getMyPullRequests(role?: 'AUTHOR' | 'REVIEWER' | 'PARTICIPANT', state?: 'OPEN' | 'MERGED' | 'DECLINED' | 'ALL', limit?: number, start?: number): Promise<PagedResponse<BitbucketPullRequest>>;
}
