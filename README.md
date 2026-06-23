<div align="center">

# agent-plugin

**场景化智能体插件集合 for OpenCode**

[![OpenCode](https://img.shields.io/badge/OpenCode-Plugin%20%7C%20Agents%20%7C%20Skills-6E40C9?logo=opensourceinitiative&logoColor=white)](https://opencode.ai)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Agents](https://img.shields.io/badge/agents-1-success.svg)](#agents)
[![Skills](https://img.shields.io/badge/skills-1-blue.svg)](#skills)
[![Tools](https://img.shields.io/badge/tools-1-orange.svg)](#tools)

</div>

---

## 这是什么

`agent-plugin` 是场景化智能体能力插件集合，为 OpenCode 提供可插拔的场景化能力扩展。

**工作原理：**
- OpenCode 通过 `plugin` 配置自动 clone 远程仓库
- 插件加载时自动发现 skills/agents/tools 并注册
- 更新由 OpenCode 重启或 `opencode-marketplace update` 触发

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

### 方式 2：使用 opencode-marketplace CLI

```bash
# 安装到用户级别
npx opencode-marketplace install https://github.com/ArchAIHarness/agent-plugin

# 安装到项目级别
npx opencode-marketplace install https://github.com/ArchAIHarness/agent-plugin --scope project

# 更新插件
npx opencode-marketplace update agent-plugin

# 查看已安装插件
npx opencode-marketplace list
```

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
│   - 发现 skills/agents/tools                                 │
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
│  - Tools: 自动发现并注册                                     │
└─────────────────────────────────────────────────────────────┘
```

### 更新策略

| 方式 | 说明 |
|---|---|
| OpenCode 重启 | 重新拉取远程插件并加载最新版本 |
| opencode-marketplace update | 手动触发更新检查 |
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
| [code-reviewer](./agents/code-reviewer.md) | 代码审查专家，检查质量、安全性和最佳实践 |

### Skills

<a name="skills"></a>

| Skill | 分组 | 定位 | 版本 |
|---|---|---|---|
| [code-quality-check](./skills/development/code-quality-check/SKILL.md) | development | 快速代码质量检查和 lint 运行 | 1.0.0 |

### Tools

<a name="tools"></a>

| 目录 | 定位 |
|---|---|
| [path-validator](./tools/utilities/path-validator.js) | 路径安全性和有效性验证 |

---

## 仓库结构

```text
agent-plugin/
├── package.json                    # npm 包配置
├── plugin.json                     # 插件元数据
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
└── tools/
    └── {domain}/
        └── *.js                    # 自定义工具实现
```

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

### 添加新 Tool

1. 在 `tools/{domain}/` 目录创建 `.js` 文件
2. 导出标准工具接口（name, description, parameters, execute）
3. 不硬编码本机路径

详见 [AGENTS.md](./AGENTS.md)

---

## 相关仓库

- [agent-master](https://github.com/ArchAIHarness/agent-master) - Agent 控制面服务
- [agent-image](https://github.com/ArchAIHarness/agent-image) - 无头 OpenCode Runtime 镜像
- [agent-image-webui](https://github.com/ArchAIHarness/agent-image-webui) - 带 WebUI 的 Runtime 镜像
- [opencode-marketplace](https://github.com/ArchAIHarness/opencode-marketplace) - 插件市场 CLI 工具

---

<div align="center">

**Engineered by Architects · Empowered by AI**

</div>
