<div align="center">

# agent-plugin
**场景化智能体插件集合 for OpenCode**

[![OpenCode](https://img.shields.io/badge/OpenCode-Plugin%20%7C%20Agents%20%7C%20Skills-6E40C9?logo=opensourceinitiative&logoColor=white)](https://opencode.ai)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Agents](https://img.shields.io/badge/agents-0-success.svg)](#agents)
[![Skills](https://img.shields.io/badge/skills-0-blue.svg)](#skills)

</div>

---

## 这是什么

`agent-plugin` 是场景化智能体能力插件集合，为 `agent-master` + `agent-image` 体系提供可插拔的场景化能力扩展。遵循 OpenCode 官方插件格式，通过 `opencode.json` 配置动态加载。

当前能力覆盖：

> 等待添加场景化插件...

---

## OpenCode 安装

在 `opencode.json` 中添加：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["agent-plugin@git+https://github.com/ArchAIHarness/agent-plugin.git"]
}
```

重启 OpenCode。

插件会自动注册：

- `agents/*.md` 为 OpenCode agents。
- `skills/**/SKILL.md` 为 OpenCode skills。
- `tools/` 中的工具可被 OpenCode 自动发现。

---

## Agents

<a name="agents"></a>

| Agent | 定位 |
|---|---|
<!-- 新增 Agent 请在此添加索引 -->

---

## Skills

<a name="skills"></a>

| Skill | 分组 | 定位 | 版本 |
|---|---|---|---|
<!-- 新增 Skill 请在此添加索引 -->

---

## Tools

| 目录 | 定位 |
|---|---|
<!-- 新增 Tool 请在此添加索引 -->

---

## 仓库结构

```text
agent-plugin/
├── package.json
├── README.md
├── AGENTS.md
├── LICENSE
├── .opencode/
│   └── plugins/
│       └── agent-plugin.js  # OpenCode 插件入口
├── agents/
│   └── *.md            # 场景化 Agent 定义
├── skills/
│   └── {domain}/
│       └── {skill-name}/
│           └── SKILL.md
└── tools/
    └── {domain}/
        └── *.js        # 自定义工具实现
```

---

## 开发规范

请参见 [AGENTS.md](./AGENTS.md) 维护规则。

---

## 相关仓库

- [agent-master](https://github.com/ArchAIHarness/agent-master) - Agent 控制面服务
- [agent-image](https://github.com/ArchAIHarness/agent-image) - 无头 OpenCode Runtime 镜像
- [agent-image-webui](https://github.com/ArchAIHarness/agent-image-webui) - 带 WebUI 的 Runtime 镜像（OpenCode + AionUi）

---

<div align="center">

**Engineered by Architects · Empowered by AI**

</div>
