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

  async updatePullRequest(
    projectKey: string,
    repoSlug: string,
    prId: number,
    version: number,
    updates: {
      title?: string;
      description?: string;
      reviewers?: string[];
      toRef?: { id: string };
    }
  ): Promise<BitbucketPullRequest> {
    try {
      // 首先获取当前 PR 信息以保留未修改的字段
      const currentPr = await this.getPullRequest(projectKey, repoSlug, prId);

      const updatePayload: {
        version: number;
        title: string;
        description?: string;
        reviewers?: Array<{ user: { name: string } }>;
        toRef?: { id: string };
      } = {
        version,
        title: updates.title ?? currentPr.title,
        description: updates.description ?? currentPr.description,
      };

      // 如果提供了新的 reviewers 列表，使用它；否则保留原有的
      if (updates.reviewers !== undefined) {
        updatePayload.reviewers = updates.reviewers.map((name) => ({ user: { name } }));
      }

      // 如果提供了新的目标分支
      if (updates.toRef) {
        updatePayload.toRef = updates.toRef;
      }

      const response = await this.client.put(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}`,
        updatePayload
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async addPullRequestReviewers(
    projectKey: string,
    repoSlug: string,
    prId: number,
    version: number,
    reviewers: string[]
  ): Promise<BitbucketPullRequest> {
    try {
      // 获取当前 PR 信息
      const currentPr = await this.getPullRequest(projectKey, repoSlug, prId);

      // 合并现有审查者和新审查者（去重）
      const existingReviewerNames = currentPr.reviewers.map((r) => r.user.name);
      const allReviewers = [...new Set([...existingReviewerNames, ...reviewers])];

      const response = await this.client.put(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}`,
        {
          version,
          title: currentPr.title,
          description: currentPr.description,
          reviewers: allReviewers.map((name) => ({ user: { name } })),
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async removePullRequestReviewer(
    projectKey: string,
    repoSlug: string,
    prId: number,
    username: string
  ): Promise<void> {
    try {
      await this.client.delete(
        `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/participants/${username}`
      );
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
    fileType: 'FROM' | 'TO' = 'TO'
  ): Promise<BitbucketPullRequestActivity['comment']> {
    try {
      // 根据 lineType 自动设置正确的 fileType（如果不匹配）
      // ADDED 行只存在于目标文件 (TO)
      // REMOVED 行只存在于源文件 (FROM)
      // CONTEXT 行在两边都存在，使用用户指定的 fileType
      let effectiveFileType = fileType;
      if (lineType === 'ADDED') {
        effectiveFileType = 'TO';
      } else if (lineType === 'REMOVED') {
        effectiveFileType = 'FROM';
      }

      // 构建 anchor 对象
      // 使用 EFFECTIVE diffType，它基于 PR 的有效 diff，更适合 PR 评论场景
      const anchor: {
        path: string;
        srcPath: string;
        line: number;
        lineType: string;
        fileType: string;
        diffType: string;
      } = {
        path: filePath,
        srcPath: filePath,  // srcPath 通常与 path 相同，除非文件被重命名
        line,
        lineType,
        fileType: effectiveFileType,
        diffType: 'EFFECTIVE',
      };

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
