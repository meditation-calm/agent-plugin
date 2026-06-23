<div align="center">

# agent-plugin

**场景化智能体插件集合 for OpenCode**

[![OpenCode](https://img.shields.io/badge/OpenCode-Plugin%20%7C%20Agents%20%7C%20Skills-6E40C9?logo=opensourceinitiative&logoColor=white)](https://opencode.ai)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Agents](https://img.shields.io/badge/agents-1-success.svg)](#agents)
[![Skills](https://img.shields.io/badge/skills-3-blue.svg)](#skills)
[![MCP](https://img.shields.io/badge/mcp-1-purple.svg)](#mcp)

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
│   - 发现 skills/agents/mcp                                  │
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

| Agent | 定位 |
|---|---|
| [question-generator-agent](./agents/question-generator-agent.md) | 智能出题助手，生成、校验、保存和编排题目 |

### Skills

<a name="skills"></a>

| Skill | 分组 | 定位 | 版本 |
|---|---|---|---|
| [question-generator](./skills/question/question-generator/SKILL.md) | question | 题目生成与格式校验 | 1.0.0 |
| [question-editor](./skills/question/question-editor/SKILL.md) | question | 题目编辑、删除与试卷编排 | 1.0.0 |
| [question-search](./skills/question/question-search/SKILL.md) | question | 题库搜索与格式转换 | 1.0.0 |

### MCP

<a name="mcp"></a>

| MCP 服务 | 工具 | 定位 |
|---|---|---|
| question-bank-mcp | question_label | 查找题库知识点 |
| | question_search | 在题库中搜索题目 |
| | question_detail | 获取题目详情 |

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
│   └── *.md                        # 场景化 Agent 定义
├── skills/
│   └── {domain}/
│       └── {skill-name}/
│           └── SKILL.md            # Skill 定义
│           └── references/         # 参考文档
│           └── scripts/            # 校验脚本
└── mcp/
    └── question-bank-server.js     # 题库 MCP 服务
```

---

## MCP 服务配置

题库 MCP 服务需要以下环境变量：

| 环境变量 | 必填 | 说明 | 示例 |
|---|---|---|---|
| `LAB_BASE_URL` | 否 | Lab 服务 API 地址 | `https://lab-test.cloudlab.top` |
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
