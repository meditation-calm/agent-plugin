---
name: question-search
version: 1.0.0
description: "题库搜索技能。通过MCP题库工具搜索已有题目，获取知识点和题目详情，转换格式后保存到参考文件供其他技能使用。Use when: 搜索题库, 查找题目, 从题库找题, search questions."
---

# 题库搜索技能

## 可用 MCP 工具

| 工具 | 用途 | 关键参数 |
|---|---|---|
| `question_label` | 查找知识点树结构 | `labCode` |
| `question_search` | 搜索题目列表 | `labCode`, `types`, `difficulties`, `labelPaths`, `keywords`, `current`, `size` |
| `question_detail` | 获取题目详情 | `questionCode` |

## 工作流程

### 1. 获取知识点

调用 `question_label(labCode)` 获取知识点树结构，找到与用户需求匹配的知识点 `path`。

### 2. 搜索题目

调用 `question_search` 搜索匹配的题目，可按以下条件筛选：
- **知识点**：`labelPaths`（从第一步获取）
- **题型**：`types`（RADIO/CHECKBOX/ANSWER/COMPLETION/CCM）
- **难度**：`difficulties`（LOW/MIDDLE/HIGH）
- **关键词**：`keywords`

### 3. 获取详情

对感兴趣的题目调用 `question_detail(questionCode)` 获取完整详情。

### 4. 格式转换

将题库题目转换为标准格式，字段映射：

| 题库字段 | 目标字段 | 说明 |
|---|---|---|
| `questionCode` | `id` | 题目唯一标识 |
| `type` | `type` | 题型（题库大写 → 目标小写：RADIO→radio 等） |
| `topic` | `topic` | 题干 |
| `option` | `option` | 选项 |
| `answer` | `answer` | 答案 |
| `difficulty` | `difficulty` | 难度 |
| `description` | `description` | 解析 |

转换后的题目需符合 [question-schema.md](references/question-schema.md) 中定义的 JSON 格式规范。

### 5. 保存参考文件

将转换后的题目保存到参考文件（例如 `{workDir}/python_reference.json`、`{workDir}/题库_选择题.json` 等），供 `question-reference` agent 或其他技能使用。

**注意**：搜索到的题目仅作为参考资料，不直接作为最终出题结果。最终题目由 `question-maker` agent 生成并保存到题目文件。

## 注意事项

1. 需要用户提供 `labCode` 才能搜索题库
2. 搜索到的题目保存到参考文件（例如 `python_reference.json`、`题库_选择题.json` 等），不直接保存到最终题目文件
3. 转换后的题目应调用 `question` skill 的校验脚本验证格式
4. 转换时参考 [question-schema.md](references/question-schema.md) 确保格式正确
5. 所有文件操作必须基于 `workDir`
