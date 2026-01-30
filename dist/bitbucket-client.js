import axios, { AxiosError } from 'axios';
export class BitbucketClient {
    client;
    baseUrl;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
        this.client = axios.create({
            baseURL: `${this.baseUrl}/rest/api/1.0`,
            headers: {
                Authorization: `Bearer ${config.token}`,
                'Content-Type': 'application/json',
            },
        });
    }
    handleError(error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.errors?.[0]?.message
                || error.response?.data?.message
                || error.message;
            throw new Error(`Bitbucket API Error: ${message} (${error.response?.status || 'unknown'})`);
        }
        throw error;
    }
    // ============ Project APIs ============
    async listProjects(limit = 25, start = 0) {
        try {
            const response = await this.client.get('/projects', {
                params: { limit, start },
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async getProject(projectKey) {
        try {
            const response = await this.client.get(`/projects/${projectKey}`);
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    // ============ Repository APIs ============
    async listRepositories(projectKey, limit = 25, start = 0) {
        try {
            const response = await this.client.get(`/projects/${projectKey}/repos`, {
                params: { limit, start },
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async getRepository(projectKey, repoSlug) {
        try {
            const response = await this.client.get(`/projects/${projectKey}/repos/${repoSlug}`);
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async browseRepository(projectKey, repoSlug, path = '', at, limit = 100) {
        try {
            const response = await this.client.get(`/projects/${projectKey}/repos/${repoSlug}/browse/${path}`, {
                params: { at, limit },
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async getFileContent(projectKey, repoSlug, path, at) {
        try {
            const response = await this.client.get(`/projects/${projectKey}/repos/${repoSlug}/raw/${path}`, {
                params: { at },
                responseType: 'text',
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    // ============ Branch APIs ============
    async listBranches(projectKey, repoSlug, filterText, limit = 25, start = 0) {
        try {
            const response = await this.client.get(`/projects/${projectKey}/repos/${repoSlug}/branches`, {
                params: { filterText, limit, start },
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async getDefaultBranch(projectKey, repoSlug) {
        try {
            const response = await this.client.get(`/projects/${projectKey}/repos/${repoSlug}/default-branch`);
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    // ============ Pull Request APIs ============
    async listPullRequests(projectKey, repoSlug, state = 'OPEN', limit = 25, start = 0, direction = 'INCOMING') {
        try {
            const response = await this.client.get(`/projects/${projectKey}/repos/${repoSlug}/pull-requests`, {
                params: { state, limit, start, direction },
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async getPullRequest(projectKey, repoSlug, prId) {
        try {
            const response = await this.client.get(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}`);
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async createPullRequest(projectKey, repoSlug, title, fromBranch, toBranch, description, reviewers) {
        try {
            const response = await this.client.post(`/projects/${projectKey}/repos/${repoSlug}/pull-requests`, {
                title,
                description,
                fromRef: {
                    id: `refs/heads/${fromBranch}`,
                },
                toRef: {
                    id: `refs/heads/${toBranch}`,
                },
                reviewers: reviewers?.map((name) => ({ user: { name } })),
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async getPullRequestDiff(projectKey, repoSlug, prId, contextLines = 3) {
        try {
            const response = await this.client.get(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/diff`, {
                params: { contextLines },
                headers: {
                    Accept: 'text/plain',
                },
                responseType: 'text',
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async getPullRequestActivities(projectKey, repoSlug, prId, limit = 25, start = 0) {
        try {
            const response = await this.client.get(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/activities`, {
                params: { limit, start },
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async approvePullRequest(projectKey, repoSlug, prId) {
        try {
            const response = await this.client.post(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/approve`);
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async unapprovePullRequest(projectKey, repoSlug, prId) {
        try {
            await this.client.delete(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/approve`);
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async setReviewerStatus(projectKey, repoSlug, prId, username, status) {
        try {
            await this.client.put(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/participants/${username}`, {
                user: { name: username },
                approved: status === 'APPROVED',
                status,
            });
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async mergePullRequest(projectKey, repoSlug, prId, version) {
        try {
            const response = await this.client.post(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/merge`, {}, {
                params: { version },
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async declinePullRequest(projectKey, repoSlug, prId, version) {
        try {
            const response = await this.client.post(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/decline`, {}, {
                params: { version },
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async updatePullRequest(projectKey, repoSlug, prId, version, updates) {
        try {
            // 首先获取当前 PR 信息以保留未修改的字段
            const currentPr = await this.getPullRequest(projectKey, repoSlug, prId);
            const updatePayload = {
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
            const response = await this.client.put(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}`, updatePayload);
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async addPullRequestReviewers(projectKey, repoSlug, prId, version, reviewers) {
        try {
            // 获取当前 PR 信息
            const currentPr = await this.getPullRequest(projectKey, repoSlug, prId);
            // 合并现有审查者和新审查者（去重）
            const existingReviewerNames = currentPr.reviewers.map((r) => r.user.name);
            const allReviewers = [...new Set([...existingReviewerNames, ...reviewers])];
            const response = await this.client.put(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}`, {
                version,
                title: currentPr.title,
                description: currentPr.description,
                reviewers: allReviewers.map((name) => ({ user: { name } })),
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async removePullRequestReviewer(projectKey, repoSlug, prId, username) {
        try {
            await this.client.delete(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/participants/${username}`);
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async addPullRequestComment(projectKey, repoSlug, prId, text) {
        try {
            const response = await this.client.post(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/comments`, { text });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async addPullRequestLineComment(projectKey, repoSlug, prId, text, filePath, line, lineType = 'CONTEXT', fileType = 'TO', fromHash, toHash) {
        try {
            // 构建 anchor 对象
            const anchor = {
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
            const response = await this.client.post(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/comments`, {
                text,
                anchor,
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async replyToPullRequestComment(projectKey, repoSlug, prId, parentCommentId, text) {
        try {
            const response = await this.client.post(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/comments`, {
                text,
                parent: {
                    id: parentCommentId,
                },
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async getPullRequestComments(projectKey, repoSlug, prId, path, limit = 100, start = 0, anchorState = 'ALL') {
        try {
            const response = await this.client.get(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/comments`, {
                params: { path, limit, start, anchorState },
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async deletePullRequestComment(projectKey, repoSlug, prId, commentId, version) {
        try {
            await this.client.delete(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/comments/${commentId}`, {
                params: { version },
            });
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async updatePullRequestComment(projectKey, repoSlug, prId, commentId, text, version) {
        try {
            const response = await this.client.put(`/projects/${projectKey}/repos/${repoSlug}/pull-requests/${prId}/comments/${commentId}`, {
                text,
                version,
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    // ============ Search APIs ============
    async searchCode(query, projectKey, repoSlug, limit = 25) {
        try {
            // Bitbucket Server code search API
            const searchUrl = `${this.baseUrl}/rest/search/latest/search`;
            const searchQuery = {
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
        }
        catch (error) {
            this.handleError(error);
        }
    }
    // ============ User APIs ============
    async getCurrentUser() {
        try {
            // Get current user via inbox API (workaround for Bitbucket Server)
            const response = await axios.get(`${this.baseUrl}/plugins/servlet/applinks/whoami`, {
                headers: {
                    Authorization: this.client.defaults.headers['Authorization'],
                },
            });
            return { name: response.data, emailAddress: '', displayName: response.data };
        }
        catch {
            // Fallback: return empty user info
            return { name: 'unknown', emailAddress: '', displayName: 'Unknown' };
        }
    }
    // ============ PR Review APIs ============
    async getMyPullRequestsToReview(limit = 25, start = 0) {
        try {
            const response = await axios.get(`${this.baseUrl}/rest/api/1.0/inbox/pull-requests`, {
                headers: {
                    Authorization: this.client.defaults.headers['Authorization'],
                },
                params: { limit, start, role: 'REVIEWER' },
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    // ============ Dashboard APIs ============
    async getMyPullRequests(role = 'AUTHOR', state, limit = 25, start = 0) {
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
        }
        catch (error) {
            this.handleError(error);
        }
    }
}
