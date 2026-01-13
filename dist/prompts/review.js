export function registerReviewPrompts(client) {
    return {
        review_my_prs: {
            name: 'review_my_prs',
            description: '列出待我评审的 PR，以资深研发的角度进行代码审查，针对有问题的地方添加评论，如果没有问题则直接 approve',
            arguments: [
                {
                    name: 'projectKey',
                    description: '项目 Key（可选，不填则审查所有待审 PR）',
                    required: false,
                },
                {
                    name: 'repoSlug',
                    description: '仓库 Slug（可选）',
                    required: false,
                },
                {
                    name: 'prId',
                    description: 'PR ID（可选，指定则只审查该 PR）',
                    required: false,
                },
            ],
            handler: async (args) => {
                // 如果指定了具体的 PR，直接返回该 PR 的审查提示
                if (args.projectKey && args.repoSlug && args.prId) {
                    const pr = await client.getPullRequest(args.projectKey, args.repoSlug, args.prId);
                    const diff = await client.getPullRequestDiff(args.projectKey, args.repoSlug, args.prId, 10);
                    const comments = await client.getPullRequestComments(args.projectKey, args.repoSlug, args.prId);
                    return {
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: buildReviewPrompt(pr, diff, comments.values, args.projectKey, args.repoSlug),
                                },
                            },
                        ],
                    };
                }
                // 否则，获取所有待审 PR 列表
                const prsToReview = await client.getMyPullRequests('REVIEWER', 'OPEN', 50);
                if (prsToReview.values.length === 0) {
                    return {
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: '当前没有待审查的 Pull Request。',
                                },
                            },
                        ],
                    };
                }
                // 构建待审 PR 列表
                const prList = prsToReview.values.map((pr, index) => {
                    const repo = pr.toRef.repository;
                    return `${index + 1}. [${repo.project.key}/${repo.slug}] PR #${pr.id}: ${pr.title}
   作者: ${pr.author.user.displayName}
   分支: ${pr.fromRef.displayId} → ${pr.toRef.displayId}
   创建时间: ${new Date(pr.createdDate).toLocaleString('zh-CN')}
   链接: ${pr.links.self[0]?.href || 'N/A'}`;
                }).join('\n\n');
                return {
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `## 待审查的 Pull Request 列表

${prList}

---

请选择一个 PR 进行审查。你可以使用以下工具：

1. **get_pull_request_diff** - 获取 PR 的代码变更
2. **get_pull_request_comments** - 获取现有评论
3. **add_pull_request_comment** - 添加一般评论
4. **add_pull_request_line_comment** - 针对具体代码行添加评论
5. **approve_pull_request** - 审批通过 PR

请告诉我你想要审查哪个 PR（输入序号或 PR ID）。`,
                            },
                        },
                    ],
                };
            },
        },
    };
}
function buildReviewPrompt(pr, diff, existingComments, projectKey, repoSlug) {
    const validComments = existingComments.filter((c) => c !== undefined);
    return `## PR 代码审查任务

### PR 信息
- **项目/仓库**: ${projectKey}/${repoSlug}
- **PR ID**: ${pr.id}
- **标题**: ${pr.title}
- **描述**: ${pr.description || '无描述'}
- **作者**: ${pr.author.user.displayName}
- **分支**: ${pr.fromRef.displayId} → ${pr.toRef.displayId}
- **创建时间**: ${new Date(pr.createdDate).toLocaleString('zh-CN')}
- **版本号**: ${pr.version} (approve 时需要)

### 现有评论 (${validComments.length} 条)
${validComments.length > 0 ? validComments.map(c => `- ${c.author?.displayName || '未知'}: ${c.text || ''}`).join('\n') : '暂无评论'}

### 代码变更 (Diff)
\`\`\`diff
${diff}
\`\`\`

---

## 审查要求

请以资深研发工程师的角度审查此 PR，重点关注以下方面：

### 1. 代码质量
- 代码是否清晰易读
- 命名是否规范、有意义
- 是否存在代码重复
- 函数/方法是否过长或过于复杂

### 2. 潜在 Bug
- 边界条件处理
- 空指针/空值检查
- 类型安全问题
- 并发/线程安全问题

### 3. 安全性
- SQL 注入风险
- XSS 风险
- 敏感信息泄露
- 权限校验

### 4. 性能
- 不必要的循环或计算
- N+1 查询问题
- 内存泄漏风险
- 大数据量处理

### 5. 最佳实践
- 错误处理是否完善
- 日志记录是否合理
- 是否符合项目规范
- 测试覆盖情况

---

## 操作指南

审查完成后，请执行以下操作：

**如果发现问题：**
使用 \`add_pull_request_line_comment\` 工具针对具体代码行添加评论：
- projectKey: "${projectKey}"
- repoSlug: "${repoSlug}"
- prId: ${pr.id}
- text: 你的评论内容
- filePath: 文件路径
- line: 行号
- lineType: "ADDED" (新增行) / "REMOVED" (删除行) / "CONTEXT" (上下文行)

**如果没有问题：**
使用 \`approve_pull_request\` 工具批准此 PR：
- projectKey: "${projectKey}"
- repoSlug: "${repoSlug}"
- prId: ${pr.id}

请开始审查并给出你的专业意见。`;
}
