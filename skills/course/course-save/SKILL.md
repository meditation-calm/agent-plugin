---
name: course-save
version: 1.0.0
description: "课程保存技能，将本地生成的课程内容（元数据、目录、章节内容、题目活动）保存到平台。Use when: 保存课程, course save."
---

# 课程保存技能

将本地生成的课程内容保存到远程平台，包括课程记录创建、章节目录搭建、内容写入和活动保存。

## 可用 MCP 工具（course-mcp）

| 工具 | 用途 | 关键参数 |
|---|---|---|
| `course_save` | 创建课程记录 | `labCode`, `name`, `remark`, `template` |
| `fs_mkdir` | 创建章节目录 | `repo`, `parent`, `path`, `title`, `index`, `category`, `type` |
| `fs_write` | 写入章节内容（自动提取活动） | `repo`, `path`, `content` |
| `activity_batch_save` | 批量保存活动 | `repo`, `path`, `activities` |
| `repo_refresh` | 刷新课程仓库 | `repo` |

## 工作流程

### 1. 创建课程记录

调用 `course_save` 创建课程：
- `labCode`: 实验室编码（从 `lab_query` 获取）
- `name`: 课程名称（从 metadata.json 的 title）
- `remark`: 课程描述（从 metadata.json 的 description）
- `template`: 环境模板 JSON（可选，从 env_list 获取后传入）

返回 `repo`（仓库标识）和 `labCode`，后续步骤均使用 `repo`。

### 2. 创建章节目录

读取 `course/toc.md`，解析目录结构，逐节点调用 `fs_mkdir`：

**目录层级与 describe 映射规则**：

| 条件 | category | type |
|---|---|---|
| toc 最大层级为 1（只有节） | `content` | `text` |
| toc 最大层级 >= 3 且节点是第 1 层 | `chapter` | `stage` |
| 其他 | `chapter` | `chapter` |

**路径规则**：
- `parent`: 父级节点名称用 `/` 拼接，去除特殊字符(`/ : * ? \` ' " < > |`)
- `path`: `parent/title` 拼接
- `title`: 节点名称，去除特殊字符
- `index`: 节点在同级中的排序序号

### 3. 写入章节内容

对每个有内容文件的节点，调用 `fs_write`：
- 传入原始 markdown 内容（含 ```question/validate```{{active}} 活动代码块）
- 工具自动提取活动并替换为 ID 引用
- 返回提取的 `activities` 数组

### 4. 保存活动

如果 `fs_write` 返回了活动列表（`activityCount > 0`），调用 `activity_batch_save`：
- 传入 `fs_write` 返回的 `activities` 数组
- 工具自动 PAKO 压缩后上传

### 5. 刷新课程仓库

所有章节写入完成后，调用 `repo_refresh` 刷新课程导航结构。

## 严格约束

1. 必须先调用 `course_save` 获取 `repo`，再执行后续步骤
2. 章节目录必须按 toc.md 的顺序逐级创建
3. `fs_write` 返回的活动列表必须立即用 `activity_batch_save` 保存
4. 最后必须调用 `repo_refresh` 刷新仓库
5. 特殊字符（`/ : * ? \` ' " < > |`）必须从路径和标题中去除
