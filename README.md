# Bitbucket MCP Server

[English](#english) | [中文](#中文)

---

## English

A Model Context Protocol (MCP) server for Bitbucket Server (Data Center). This server enables AI assistants like Claude to interact with Bitbucket repositories, pull requests, and code reviews.

### Features

- **Project Management**: List and browse projects
- **Repository Management**: List repositories, browse files, get file content, search code
- **Branch Management**: List branches, get default branch
- **Pull Request Management**:
  - Create, update, merge, decline PRs
  - Add/remove reviewers
  - Approve/unapprove PRs
  - Mark PRs as "needs work"
- **Code Review**:
  - Add general comments to PRs
  - Add line-specific comments to code
  - Reply to existing comments
  - Update and delete comments
- **Dashboard**: List PRs assigned to you for review, or PRs you authored

### Installation

#### Via npx (Recommended)

```bash
npx github:caijohnny/bitbucket-mcp
```

#### Manual Installation

```bash
git clone https://github.com/caijohnny/bitbucket-mcp.git
cd bitbucket-mcp
npm install
npm run build
```

### Configuration

Set the following environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `BITBUCKET_TOKEN` | Yes | Your Bitbucket personal access token |
| `BITBUCKET_URL` | No | Bitbucket Server URL (default: `https://code.fineres.com`) |

#### Creating a Personal Access Token

1. Log in to your Bitbucket Server
2. Go to **Profile** > **Manage Account** > **Personal access tokens**
3. Click **Create a token**
4. Give it a name and select the required permissions:
   - `Repository read` - for browsing repositories
   - `Repository write` - for creating PRs
   - `Pull request read/write` - for managing PRs

### Usage with Claude Desktop

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": ["-y", "github:caijohnny/bitbucket-mcp"],
      "env": {
        "BITBUCKET_URL": "https://your-bitbucket-server.com",
        "BITBUCKET_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

### Available Tools

#### Repository Tools
| Tool | Description |
|------|-------------|
| `list_projects` | List all projects |
| `list_repositories` | List repositories in a project |
| `get_repository` | Get repository details |
| `browse_repository` | Browse files and directories |
| `get_file_content` | Get file content |
| `search_code` | Search code across repositories |

#### Branch Tools
| Tool | Description |
|------|-------------|
| `list_branches` | List branches in a repository |
| `get_default_branch` | Get the default branch |

#### Pull Request Tools
| Tool | Description |
|------|-------------|
| `list_pull_requests` | List PRs in a repository |
| `get_pull_request` | Get PR details |
| `create_pull_request` | Create a new PR |
| `update_pull_request` | Update PR title/description/reviewers |
| `merge_pull_request` | Merge a PR |
| `decline_pull_request` | Decline a PR |
| `approve_pull_request` | Approve a PR |
| `unapprove_pull_request` | Remove approval |
| `needs_work_pull_request` | Mark PR as needs work |
| `get_pull_request_diff` | Get PR diff |
| `list_pull_request_activities` | Get PR activities |
| `add_pull_request_comment` | Add a general comment |
| `add_pull_request_line_comment` | Add a line-specific comment |
| `reply_to_pull_request_comment` | Reply to a comment |
| `get_pull_request_comments` | Get all comments |
| `update_pull_request_comment` | Update a comment |
| `delete_pull_request_comment` | Delete a comment |
| `add_pull_request_reviewers` | Add reviewers |
| `remove_pull_request_reviewer` | Remove a reviewer |
| `list_my_pull_requests` | List PRs related to me |
| `list_my_pull_requests_to_review` | List PRs I need to review |

### License

MIT

---

## 中文

一个用于 Bitbucket Server (Data Center) 的 Model Context Protocol (MCP) 服务器。该服务器使 Claude 等 AI 助手能够与 Bitbucket 仓库、Pull Request 和代码审查进行交互。

### 功能特性

- **项目管理**：列出和浏览项目
- **仓库管理**：列出仓库、浏览文件、获取文件内容、搜索代码
- **分支管理**：列出分支、获取默认分支
- **Pull Request 管理**：
  - 创建、更新、合并、拒绝 PR
  - 添加/移除审查者
  - 批准/取消批准 PR
  - 标记 PR 为"需要修改"
- **代码审查**：
  - 添加 PR 通用评论
  - 添加行级代码评论
  - 回复已有评论
  - 更新和删除评论
- **工作台**：列出分配给你审查的 PR，或你创建的 PR

### 安装

#### 通过 npx（推荐）

```bash
npx github:caijohnny/bitbucket-mcp
```

#### 手动安装

```bash
git clone https://github.com/caijohnny/bitbucket-mcp.git
cd bitbucket-mcp
npm install
npm run build
```

### 配置

设置以下环境变量：

| 变量 | 必需 | 描述 |
|------|------|------|
| `BITBUCKET_TOKEN` | 是 | 你的 Bitbucket 个人访问令牌 |
| `BITBUCKET_URL` | 否 | Bitbucket Server URL（默认：`https://code.fineres.com`） |

#### 创建个人访问令牌

1. 登录你的 Bitbucket Server
2. 进入 **个人资料** > **账户管理** > **个人访问令牌**
3. 点击 **创建令牌**
4. 设置名称并选择所需权限：
   - `Repository read` - 用于浏览仓库
   - `Repository write` - 用于创建 PR
   - `Pull request read/write` - 用于管理 PR

### 在 Claude Desktop 中使用

将以下内容添加到你的 Claude Desktop 配置文件：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": ["-y", "github:caijohnny/bitbucket-mcp"],
      "env": {
        "BITBUCKET_URL": "https://your-bitbucket-server.com",
        "BITBUCKET_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

### 可用工具

#### 仓库工具
| 工具 | 描述 |
|------|------|
| `list_projects` | 列出所有项目 |
| `list_repositories` | 列出项目中的仓库 |
| `get_repository` | 获取仓库详情 |
| `browse_repository` | 浏览文件和目录 |
| `get_file_content` | 获取文件内容 |
| `search_code` | 跨仓库搜索代码 |

#### 分支工具
| 工具 | 描述 |
|------|------|
| `list_branches` | 列出仓库中的分支 |
| `get_default_branch` | 获取默认分支 |

#### Pull Request 工具
| 工具 | 描述 |
|------|------|
| `list_pull_requests` | 列出仓库中的 PR |
| `get_pull_request` | 获取 PR 详情 |
| `create_pull_request` | 创建新 PR |
| `update_pull_request` | 更新 PR 标题/描述/审查者 |
| `merge_pull_request` | 合并 PR |
| `decline_pull_request` | 拒绝 PR |
| `approve_pull_request` | 批准 PR |
| `unapprove_pull_request` | 取消批准 |
| `needs_work_pull_request` | 标记 PR 需要修改 |
| `get_pull_request_diff` | 获取 PR 差异 |
| `list_pull_request_activities` | 获取 PR 活动 |
| `add_pull_request_comment` | 添加通用评论 |
| `add_pull_request_line_comment` | 添加行级评论 |
| `reply_to_pull_request_comment` | 回复评论 |
| `get_pull_request_comments` | 获取所有评论 |
| `update_pull_request_comment` | 更新评论 |
| `delete_pull_request_comment` | 删除评论 |
| `add_pull_request_reviewers` | 添加审查者 |
| `remove_pull_request_reviewer` | 移除审查者 |
| `list_my_pull_requests` | 列出与我相关的 PR |
| `list_my_pull_requests_to_review` | 列出我需要审查的 PR |

### 行级评论使用说明

使用 `add_pull_request_line_comment` 时，需要注意以下参数：

| 参数 | 描述 |
|------|------|
| `filePath` | 文件路径（相对于仓库根目录） |
| `line` | 行号 |
| `lineType` | 行类型：`ADDED`（新增行）、`REMOVED`（删除行）、`CONTEXT`（上下文行） |
| `fileType` | 文件类型：`TO`（目标文件）、`FROM`（源文件） |

**常见场景：**
- 评论新增的代码行：`lineType: 'ADDED'`, `fileType: 'TO'`
- 评论删除的代码行：`lineType: 'REMOVED'`, `fileType: 'FROM'`
- 评论未修改的上下文行：`lineType: 'CONTEXT'`, `fileType: 'TO'`

### 许可证

MIT
