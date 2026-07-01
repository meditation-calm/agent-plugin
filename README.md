<div align="center">

# agent-plugin

**场景化智能体插件集合 for OpenCode**

[![OpenCode](https://img.shields.io/badge/OpenCode-Plugin%20%7C%20Agents%20%7C%20Skills-6E40C9?logo=opensourceinitiative&logoColor=white)](https://opencode.ai)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Agents](https://img.shields.io/badge/agents-6-success.svg)](#agents)
[![Skills](https://img.shields.io/badge/skills-7-blue.svg)](#skills)
[![MCP](https://img.shields.io/badge/mcp-5-purple.svg)](#mcp)

</div>

---

## 这是什么

`agent-plugin` 是场景化智能体能力插件集合，为 OpenCode 提供可插拔的场景化能力扩展。

**工作原理：**
- OpenCode 通过 `plugin` 配置自动 clone 远程仓库
- 插件加载时自动发现 skills/agents/tools 并注册
- 更新由 OpenCode 重启触发

---

## 快速安装

### 方式 1：通过 opencode.json 配置

在项目的 `opencode.json` 中添加：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["agent-plugin@git+https://github.com/ArchAIHarness/agent-plugin.git"]
}
```

重启 OpenCode 即可生效。

---

## 加载机制

### 工作流程

```
┌─────────────────────────────────────────────────────────────┐
│              OpenCode 启动 / 重启                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         OpenCode 处理 plugin 配置                             │
│   - 解析 git+https:// 地址                                   │
│   - 自动 clone 到本地缓存                                     │
│   - 加载 .opencode/plugins/agent-plugin.js                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              agent-plugin.js 执行                             │
│   - 发现 skills/agents/tools/mcp                             │
│   - 解析 frontmatter 提取元数据                               │
│   - 注册到 OpenCode config                                   │
│   - 更新注册表（版本追踪）                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    组件可用                                   │
│  - Skills: 通过 skill tool 加载                             │
│  - Agents: 通过 @mention 调用                               │
│  - Tools: 自动注册自定义工具                                 │
│  - MCP: 自动注册本地 MCP 服务                                │
└─────────────────────────────────────────────────────────────┘
```

### 更新策略

| 方式 | 说明 |
|---|---|
| OpenCode 重启 | 重新拉取远程插件并加载最新版本 |
| 注册表 | 记录组件哈希，用于版本追踪 |

### 注册表

注册表位置：`~/.config/opencode/plugins/agent-plugin-registry.json`

记录内容：
- 插件名称和版本
- 组件内容哈希
- 安装时间
- 已安装组件列表

---

## 能力索引

### Agents

<a name="agents"></a>

#### 智能出题 Agent 集群（主从协调模式）

| Agent | 模式 | 定位 |
|---|---|---|
| [智能出题](./agents/question/智能出题.md) | primary | 智能出题主调度器，负责意图识别、任务分发、全链路验收 |
| [内容分析](./agents/question/内容分析.md) | subagent | 内容分析，从用户提供的资料中提取知识点 |
| [方案设计](./agents/question/方案设计.md) | subagent | 方案设计，确定题型分布、难度梯度、考核维度 |
| [题目生成](./agents/question/题目生成.md) | subagent | 题目生成，根据方案生成题目并调用校验脚本验证格式 |
| [内容审核](./agents/question/内容审核.md) | subagent | 内容审核，答案正确性、难度合理性、知识点覆盖、查重 |
| [题目编辑](./agents/question/题目编辑.md) | subagent | 题目编辑，根据审核意见或用户反馈修改题目 |

### Skills

<a name="skills"></a>

| Skill | 分组 | 定位 | 版本 |
|---|---|---|---|
| [question](./skills/question/question/SKILL.md) | question | 题目生成、编辑、校验与试卷编排 | 1.0.0 |
| [question-search](./skills/question/question-search/SKILL.md) | question | 题库搜索与格式转换 | 1.0.0 |
| [course-framework](./skills/course/course-framework/SKILL.md) | course | 课程元数据与目录结构 | 1.0.0 |
| [course-content](./skills/course/course-content/SKILL.md) | course | 章节内容生成与知识点卡片嵌入 | 1.0.0 |
| [course-save](./skills/course/course-save/SKILL.md) | course | 保存课程到平台 | 1.0.0 |

### MCP

<a name="mcp"></a>

| MCP 服务 | 工具 | 定位 |
|---|---|---|
| question-bank-mcp | question_label | 查找题库知识点 |
| | question_search | 在题库中搜索题目 |
| | question_detail | 获取题目详情 |
| knowledge-mcp | knowledge_card | 为章节生成知识点卡片 |
| user-mcp | lab_query | 查询用户实验室列表 |
| env-mcp | env_list | 查询可用实验环境模板列表 |
| course-mcp | course_list | 分页查询课程列表 |
| | course_detail | 获取课程详情 |
| | course_chapters | 查询课程章节目录结构 |
| | course_content | 读取课程章节内容 |

### Custom Tools

| 工具 | 分组 | 定位 |
|---|---|---|
| openfile | common | 打开文件供预览，前端根据 viewType 选择渲染组件 |
| course_save | course | 创建课程记录 |
| fs_mkdir | course | 创建章节目录 |
| fs_write | course | 写入章节内容（自动提取活动并保存） |
| repo_status | course | 查询课程目录结构 |
| repo_refresh | course | 刷新课程仓库 |

---

## 仓库结构

```text
agent-plugin/
├── package.json                    # npm 包配置
├── mcp-config.json                 # MCP 服务配置
├── README.md                       # 本文件
├── AGENTS.md                       # 维护规则
├── LICENSE                         # MIT 许可证
├── .opencode/
│   └── plugins/
│       └── agent-plugin.js         # OpenCode 插件入口
├── agents/
│   └── question/
│       ├── 智能出题.md           # 智能出题主调度 Agent
│       ├── 内容分析.md           # 内容分析子 Agent
│       ├── 方案设计.md           # 方案设计子 Agent
│       ├── 题目生成.md           # 题目生成子 Agent
│       ├── 内容审核.md           # 内容审核子 Agent
│       ├── 题目编辑.md           # 题目编辑子 Agent
│       ── course-generator-agent.md.deprecated # 课程生成 Agent (deprecated)
├── skills/
│   ├── question/
│   │   ├── question/               # 题目生成/编辑/校验技能
│   │   │   ├── SKILL.md
│   │   │   ├── references/
│   │   │   └── scripts/            # 校验脚本
│   │   └── question-search/        # 题库搜索技能
│   ── course/
│       ├── course-framework/       # 课程框架技能
│       ├── course-content/         # 课程内容技能
│       ── course-save/            # 课程保存技能
├── tools/
│   ├── common/
│   │   └── open-file.js            # 通用文件预览工具
│   └── course/
│       └── course.js               # 课程相关自定义工具
└── mcp/
    ├── question-bank-server.js     # 题库 MCP 服务
    ├── knowledge-server.js         # 知识卡片 MCP 服务
    ├── user-server.js              # 用户相关 MCP 服务
    ├── env-server.js               # 实验环境 MCP 服务
    └── course-server.js            # 课程读取 MCP 服务
```

---

## MCP 服务配置

题库 MCP 服务需要以下环境变量：

| 环境变量 | 必填 | 说明 | 示例 |
|---|---|---|---|
| `LAB_BASE_URL` | 否 | Lab 服务 API 地址 | `https://lab-test.cloudlab.top` |
| `OPENAPI_BASE_URL` | 否 | 课程文件操作 API 地址 | `https://openapi-test.cloudlab.top` |
| `PTY_BASE_URL` | 否 | 实验环境模板 API 地址 | `https://pty-test.cloudlab.top` |
| `KNOWLEDGE_BASE_URL` | 否 | 知识引擎 API 地址 | `https://ai-engine-test.cloudlab.top` |
| `TOKEN` | 是 | 业务认证令牌 | — |
| `PARTNER` | 否 | 合作方标识 | — |
| `SIGN` | 否 | 签名 | — |

---

## 开发规范

### 添加新 Agent

1. 在 `agents/` 目录创建 `.md` 文件
2. 必须包含 frontmatter（description, mode, color）
3. 更新 README 索引

### 添加新 Skill

1. 在 `skills/{domain}/` 目录创建 `{skill-name}/SKILL.md`
2. 必须包含 frontmatter（name, version, description）
3. 更新 README 索引

### 添加新 MCP 服务

1. 在 `mcp/` 目录创建服务脚本
2. 在 `mcp-config.json` 中添加服务配置
3. 更新 README 索引

### 添加新 Tool

1. 在 `tools/{domain}/` 目录创建 `{tool-group}.js` 文件
2. 使用 `tool()` 辅助函数定义工具，named export 名为工具名
3. 更新 README 索引

详见 [AGENTS.md](./AGENTS.md)

---

## 相关仓库

- [agent-master](https://github.com/ArchAIHarness/agent-master) - Agent 控制面服务
- [agent-image](https://github.com/ArchAIHarness/agent-image) - 无头 OpenCode Runtime 镜像
- [agent-image-webui](https://github.com/ArchAIHarness/agent-image-webui) - 带 WebUI 的 Runtime 镜像

---

<div align="center">

**Engineered by Architects · Empowered by AI**

</div>
