import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  BitbucketConfig,
  BitbucketProject,
  BitbucketRepository,
  BitbucketBranch,
  BitbucketPullRequest,
  BitbucketPullRequestActivity,
  BitbucketBrowsePath,
  BitbucketSearchResult,
  PagedResponse,
} from './types.js';

export class BitbucketClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config: BitbucketConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.client = axios.create({
      baseURL: `${this.baseUrl}/rest/api/1.0`,
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private handleError(error: unknown): never {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.errors?.[0]?.message
        || error.response?.data?.message
        || error.message;
      throw new Error(`Bitbucket API Error: ${message} (${error.response?.status || 'unknown'})`);
    }
    throw error;
  }

  // ============ Project APIs ============

  async listProjects(limit: number = 25, start: number = 0): Promise<PagedResponse<BitbucketProject>> {
    try {
      const response = await this.client.get('/projects', {
        params: { limit, start },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProject(projectKey: string): Promise<BitbucketProject> {
    try {
      const response = await this.client.get(`/projects/${projectKey}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============ Repository APIs ============

  async listRepositories(
    projectKey: string,
    limit: number = 25,
    start: number = 0
  ): Promise<PagedResponse<BitbucketRepository>> {
    try {
      const response = await this.client.get(`/projects/${projectKey}/repos`, {
        params: { limit, start },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRepository(projectKey: string, repoSlug: string): Promise<BitbucketRepository> {
    try {
      const response = await this.client.get(`/projects/${projectKey}/repos/${repoSlug}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async browseRepository(
    projectKey: string,
    repoSlug: string,
    path: string = '',
    at?: string,
    limit: number = 100
  ): Promise<BitbucketBrowsePath> {
    try {
      const response = await this.client.get(
        `/projects/${projectKey}/repos/${repoSlug}/browse/${path}`,
        {
          params: { at, limit },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getFileContent(
    projectKey: string,
    repoSlug: string,
    path: string,
    at?: string
  ): Promise<string> {
    try {
      const response = await this.client.get(
        `/projects/${projectKey}/repos/${repoSlug}/raw/${path}`,
        {
          params: { at },
          responseType: 'text',
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============ Branch APIs ============

  async listBranches(
    projectKey: string,
    repoSlug: string,
    filterText?: string,
    limit: number = 25,
    start: number = 0
  ): Promise<PagedResponse<BitbucketBranch>> {
    try {
      const response = await this.client.get(
        `/projects/${projectKey}/repos/${repoSlug}/branches`,
        {
          params: { filterText, limit, start },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDefaultBranch(projectKey: string, repoSlug: string): Promise<BitbucketBranch> {
    try {
      const response = await this.client.get(
        `/projects/${projectKey}/repos/${repoSlug}/default-branch`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============ Pull Request APIs ============

  async listPullRequests(
    projectKey: string,
    repoSlug: string,
    state: 'OPEN' | 'MERGED' | 'DECLINED' | 'ALL' = 'OPEN',
    limit: number = 25,
    start: number = 0,
    direction: 'INCOMING' | 'OUTGOING' = 'INCOMING'
  ): Promise<PagedResponse<BitbucketPullRequest>> {
    try {
      const response = await this.client.get(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests`,
        {
          params: { state, limit, start, direction },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPullRequest(
    projectKey: string,
    repoSlug: string,
    prId: number
  ): Promise<BitbucketPullRequest> {
    try {
      const response = await this.client.get(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createPullRequest(
    projectKey: string,
    repoSlug: string,
    title: string,
    fromBranch: string,
    toBranch: string,
    description?: string,
    reviewers?: string[]
  ): Promise<BitbucketPullRequest> {
    try {
      const response = await this.client.post(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests`,
        {
          title,
          description,
          fromRef: {
            id: `refs/heads/${fromBranch}`,
          },
          toRef: {
            id: `refs/heads/${toBranch}`,
          },
          reviewers: reviewers?.map((name) => ({ user: { name } })),
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPullRequestDiff(
    projectKey: string,
    repoSlug: string,
    prId: number,
    contextLines: number = 3
  ): Promise<string> {
    try {
      const response = await this.client.get(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/diff`,
        {
          params: { contextLines },
          headers: {
            Accept: 'text/plain',
          },
          responseType: 'text',
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPullRequestActivities(
    projectKey: string,
    repoSlug: string,
    prId: number,
    limit: number = 25,
    start: number = 0
  ): Promise<PagedResponse<BitbucketPullRequestActivity>> {
    try {
      const response = await this.client.get(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/activities`,
        {
          params: { limit, start },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async approvePullRequest(
    projectKey: string,
    repoSlug: string,
    prId: number
  ): Promise<{ approved: boolean }> {
    try {
      const response = await this.client.post(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/approve`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async unapprovePullRequest(
    projectKey: string,
    repoSlug: string,
    prId: number
  ): Promise<void> {
    try {
      await this.client.delete(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/approve`
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async setReviewerStatus(
    projectKey: string,
    repoSlug: string,
    prId: number,
    username: string,
    status: 'APPROVED' | 'NEEDS_WORK' | 'UNAPPROVED'
  ): Promise<void> {
    try {
      await this.client.put(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/participants/${username}`,
        {
          user: { name: username },
          approved: status === 'APPROVED',
          status,
        }
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async mergePullRequest(
    projectKey: string,
    repoSlug: string,
    prId: number,
    version: number
  ): Promise<BitbucketPullRequest> {
    try {
      const response = await this.client.post(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/merge`,
        {},
        {
          params: { version },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async declinePullRequest(
    projectKey: string,
    repoSlug: string,
    prId: number,
    version: number
  ): Promise<BitbucketPullRequest> {
    try {
      const response = await this.client.post(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/decline`,
        {},
        {
          params: { version },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async addPullRequestComment(
    projectKey: string,
    repoSlug: string,
    prId: number,
    text: string
  ): Promise<BitbucketPullRequestActivity['comment']> {
    try {
      const response = await this.client.post(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/comments`,
        { text }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async addPullRequestLineComment(
    projectKey: string,
    repoSlug: string,
    prId: number,
    text: string,
    filePath: string,
    line: number,
    lineType: 'ADDED' | 'REMOVED' | 'CONTEXT' = 'CONTEXT',
    fileType: 'FROM' | 'TO' = 'TO',
    fromHash?: string,
    toHash?: string
  ): Promise<BitbucketPullRequestActivity['comment']> {
    try {
      // 构建 anchor 对象
      const anchor: {
        path: string;
        line: number;
        lineType: string;
        fileType: string;
        diffType: string;
        fromHash?: string;
        toHash?: string;
      } = {
        path: filePath,
        line,
        lineType,
        fileType,
        diffType: 'EFFECTIVE',
      };

      // 如果提供了 hash，添加到 anchor 中（某些 Bitbucket 版本可能需要）
      if (fromHash && toHash) {
        anchor.fromHash = fromHash;
        anchor.toHash = toHash;
        anchor.diffType = 'COMMIT';
      }

      const response = await this.client.post(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/comments`,
        {
          text,
          anchor,
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async replyToPullRequestComment(
    projectKey: string,
    repoSlug: string,
    prId: number,
    parentCommentId: number,
    text: string
  ): Promise<BitbucketPullRequestActivity['comment']> {
    try {
      const response = await this.client.post(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/comments`,
        {
          text,
          parent: {
            id: parentCommentId,
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPullRequestComments(
    projectKey: string,
    repoSlug: string,
    prId: number,
    path?: string,
    limit: number = 100,
    start: number = 0,
    anchorState: 'ACTIVE' | 'ORPHANED' | 'ALL' = 'ALL'
  ): Promise<PagedResponse<BitbucketPullRequestActivity['comment']>> {
    try {
      const response = await this.client.get(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/comments`,
        {
          params: { path, limit, start, anchorState },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deletePullRequestComment(
    projectKey: string,
    repoSlug: string,
    prId: number,
    commentId: number,
    version: number
  ): Promise<void> {
    try {
      await this.client.delete(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/comments/${commentId}`,
        {
          params: { version },
        }
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async updatePullRequestComment(
    projectKey: string,
    repoSlug: string,
    prId: number,
    commentId: number,
    text: string,
    version: number
  ): Promise<BitbucketPullRequestActivity['comment']> {
    try {
      const response = await this.client.put(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/comments/${commentId}`,
        {
          text,
          version,
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============ Search APIs ============

  async searchCode(
    query: string,
    projectKey?: string,
    repoSlug?: string,
    limit: number = 25
  ): Promise<BitbucketSearchResult> {
    try {
      // Bitbucket Server code search API
      const searchUrl = `${this.baseUrl}/rest/search/latest/search`;
      const searchQuery: {
        query: string;
        entities: { code: Record<string, unknown> };
      } = {
        query,
        entities: {
          code: {},
        },
      };

      if (projectKey) {
        searchQuery.entities.code = {
          ...searchQuery.entities.code,
          projectKey,
        };
      }

      if (repoSlug && projectKey) {
        searchQuery.entities.code = {
          ...searchQuery.entities.code,
          repositorySlug: repoSlug,
        };
      }

      const response = await axios.post(searchUrl, searchQuery, {
        headers: {
          Authorization: this.client.defaults.headers['Authorization'],
          'Content-Type': 'application/json',
        },
        params: { limit },
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============ User APIs ============

  async getCurrentUser(): Promise<{ name: string; emailAddress: string; displayName: string }> {
    try {
      // Get current user via inbox API (workaround for Bitbucket Server)
      const response = await axios.get(`${this.baseUrl}/plugins/servlet/applinks/whoami`, {
        headers: {
          Authorization: this.client.defaults.headers['Authorization'],
        },
      });
      return { name: response.data, emailAddress: '', displayName: response.data };
    } catch {
      // Fallback: return empty user info
      return { name: 'unknown', emailAddress: '', displayName: 'Unknown' };
    }
  }

  // ============ PR Review APIs ============

  async getMyPullRequestsToReview(
    limit: number = 25,
    start: number = 0
  ): Promise<PagedResponse<BitbucketPullRequest>> {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/1.0/inbox/pull-requests`, {
        headers: {
          Authorization: this.client.defaults.headers['Authorization'],
        },
        params: { limit, start, role: 'REVIEWER' },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============ Dashboard APIs ============

  async getMyPullRequests(
    role: 'AUTHOR' | 'REVIEWER' | 'PARTICIPANT' = 'AUTHOR',
    state?: 'OPEN' | 'MERGED' | 'DECLINED' | 'ALL',
    limit: number = 25,
    start: number = 0
  ): Promise<PagedResponse<BitbucketPullRequest>> {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/1.0/dashboard/pull-requests`, {
        headers: {
          Authorization: this.client.defaults.headers['Authorization'],
        },
        params: {
          role,
          state: state === 'ALL' ? undefined : state,
          limit,
          start
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}
