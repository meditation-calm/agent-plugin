# AGENTS.md · agent-plugin

本文件是维护 `agent-plugin` 仓库自身的协作规则。它不是 OpenCode 插件、不是 Agent 定义、不是 Skill，也不应被插件注册到 OpenCode。

## 1. 仓库定位

本仓库是场景化智能体插件集合，遵循 OpenCode 官方插件格式：

- OpenCode 插件入口：`.opencode/plugins/agent-plugin.js`
- OpenCode Agent 定义：`agents/*.md`
- OpenCode Skill 定义：`skills/**/SKILL.md`
- 自定义工具：`tools/**`

所有插件通过 `opencode.json` 的 `plugin` 配置插拔式加载，不修改 `agent-master` 或 `agent-image` 核心代码。

## 2. 目录职责

| 路径 | 职责 | 是否由插件注册 |
|---|---|---|
| `AGENTS.md` | 维护本仓库的规则 | 否 |
| `README.md` | 仓库说明、安装、索引 | 否 |
| `package.json` | git/npm 插件包入口 | 被 OpenCode 用于定位插件 main |
| `.opencode/plugins/agent-plugin.js` | OpenCode 插件入口 | 是 |
| `agents/` | 可注入 OpenCode 的场景化 Agent 定义 | 是 |
| `skills/` | 可被 OpenCode skill tool 加载的 Skill 定义 | 是 |
| `tools/` | 自定义工具脚本或资源 | 视插件实现 |

## 3. Agent 维护规则

Agent 文件位于：

```text
agents/<agent-name>.md
```

必须包含 frontmatter：

```markdown
---
description: <触发场景和职责>
mode: subagent
color: <color>
---
```

要求：

- 内容为场景化角色定义，明确职责、工作流程和输出约束。
- 通用场景，不绑定个人、公司、客户或私有路径。
- 说明使用的 skill 和禁止事项。
- 不在 agent 文件中配置权限；权限由使用方 OpenCode 配置管理。

## 4. Skill 维护规则

Skill 文件位于：

```text
skills/<domain>/<skill-name>/SKILL.md
```

分组建议：

| domain | 用途 |
|---|---|
| `platform` | 智能体平台自身管理能力 |
| `business` | 业务场景专用技能 |
| `product` | 产品需求、设计相关技能 |
| `development` | 开发、编码、调试相关技能 |
| `content` | 内容创作、运营相关技能 |

`SKILL.md` 必须包含 frontmatter：

```markdown
---
name: <skill-name>
version: <semver>
description: |
  <触发关键词与适用场景>
---
```

要求：

- `name` 与目录名一致。
- `description` 写清触发场景。
- 内容通用，不包含私有路径、客户信息、内网地址、账号密码、Token、Cookie。

## 5. Tool 维护规则

Tool 文件位于：

```text
tools/<domain>/
```

要求：

- 工具通过显式参数接收输入路径或内容。
- 不硬编码本机路径。
- 不读取密钥、Token、Cookie、`.env` 等敏感文件。
- 如注册为 OpenCode custom tool，必须提供清晰参数 schema 和安全边界。

## 6. OpenCode 插件维护规则

插件入口：

```text
.opencode/plugins/agent-plugin.js
```

遵循 OpenCode 插件格式约定，直接作为插件入口被加载。

当前职责：

1. 将本仓库 `skills/` 加入 `config.skills.paths`，路径存在时才注册。
2. 读取 `agents/*.md` 并注入 `config.agents`。
3. 不覆盖用户已有 MCP 配置。

要求：

- 不读取或注入 `AGENTS.md` 到 agents 配置。
- 不修改用户默认 agent。
- 不注入私有路径。
- 不自动提交、推送或生成用户文件。
- 插件必须通过 `node --check` 语法检查。

## 7. 公开安全规则

禁止提交：

- 真实密钥、Token、Cookie、账号密码。
- 私有路径、内网地址、客户材料、未公开业务数据。
- 与个人工作区绑定的规则或私有协作偏好。

## 8. 变更验证

结构或插件变更后至少运行：

```bash
npm run verify
```

并检查：

- `agents/*.md` 可解析 frontmatter。
- `skills/**/SKILL.md` 存在且 frontmatter 合法。
- README 索引与实际目录一致。
- 公开文件不包含敏感信息。
