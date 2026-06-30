---
name: question-a2ui
version: 1.0.0
description: |
  A2UI交互式出题技能。通过内置question tool的_a2ui字段输出声明式A2UI JSON，
  在客户端渲染为富交互界面（课程选择/章节选择/用途选择/知识点选择/参数补充/题目预览）。
  系统会真正暂停等待用户响应。
  Use when: A2UI出题, 富交互出题, 课程选择, 章节选择, 知识点提取, 参数补充.
---

# A2UI 出题交互技能

## A2UI 交互方式

### 调用格式
当需要展示富交互界面时，由**主Agent**调用内置 `question` tool，并在参数中包含 `_a2ui` 字段：

```json
{
  "questions": [{
    "question": "请选择要出题的课程",
    "header": "课程选择",
    "options": [{ "label": "确认", "description": "确认选择" }],
    "custom": true,
    "_a2ui": {
      "version": "v0.9.1",
      "surfaceId": "question-form",
      "components": [
        { "id": "root", "component": "CourseSelector" }
      ]
    }
  }]
}
```

### 字段说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `question` | string | 是 | 界面提示文本（会被插件转换为A2UI JSON字符串） |
| `header` | string | 是 | 界面标题（会被注入\|A2UI标识） |
| `options` | array | 是 | 选项数组（至少包含一个确认选项） |
| `custom` | boolean | 是 | 必须设为true，启用自定义UI渲染 |
| `_a2ui` | object | 是 | A2UI表面定义，包含version、surfaceId、components |

### 自动处理
插件会自动处理以下转换，无需手动操作：
- `_a2ui` 字段转为 JSON 字符串放入 `question` 字段
- `header` 自动注入 `|A2UI` 标识
- 清理 `_a2ui` 字段，确保符合标准格式

### 协议版本
使用 A2UI v0.9.1 协议，version 字段固定为 "v0.9.1"。

### Surface 管理
- 所有阶段共用同一个 surfaceId: "question-form"
- 阶段1: createSurface + updateComponents
- 阶段2-4: 仅 updateComponents
- 阶段5: updateComponents + deleteSurface

### Catalog
使用自定义出题 Catalog: "a2ui-question-catalog"
- 继承 Basic Catalog（includeBasicCatalog: true）
- 自定义组件: CourseSelector, ChapterSelector, ContentModeSelector, KnowledgePointSelector, ParameterConfirm, QuestionPreview

### 消息模板
参见 references/a2ui-templates.md

## 数据传递规则

**核心原则：组件只传引用，不传数据**

| 组件 | 传递内容 | 前端职责 |
|------|---------|---------|
| CourseSelector | 仅组件名 | 自行获取课程列表 |
| ChapterSelector | courseCode, repo | 自行获取章节树 |
| ContentModeSelector | sourceType 参数 | 根据类型渲染选项 |
| KnowledgePointSelector | knowledgePoints 数组 | 渲染知识点列表 |
| ParameterConfirm | topic, questionTypes, difficulty, questionCount（已有值） | 渲染参数表单，收集用户补充 |
| QuestionPreview | filePath 字符串 | 自行读取文件渲染 |

**禁止**：在 CourseSelector/ChapterSelector/QuestionPreview 中嵌入数据数组。

## 自定义组件定义

### CourseSelector
课程选择器组件，前端自行调用API获取课程列表并渲染。

```json
{
  "component": "CourseSelector"
}
```

**禁止**：不要传递课程列表数据。

### ContentModeSelector
内容模式选择器组件，展示两种模式供用户选择。

```json
{
  "component": "ContentModeSelector",
  "sourceType": "course|attachment"
}
```

模式选项：
- `reference`（参考资料）：仅将内容作为参考资料，按照用户需求出题
- `parse`（解析知识点）：解析内容知识点，基于知识点出题

### ChapterSelector
章节选择器组件，前端自行调用API获取章节树并渲染。

```json
{
  "component": "ChapterSelector",
  "courseCode": "课程编码",
  "repo": "课程仓库标识（可选）"
}
```

### KnowledgePointSelector
知识点选择器组件，展示Agent提取的知识点列表供用户勾选。

```json
{
  "component": "KnowledgePointSelector",
  "knowledgePoints": [
    {"id": "kp-1", "name": "知识点名称", "source": "来源章节", "selected": false}
  ]
}
```

### ParameterConfirm
参数补充组件，展示已解析的参数并允许用户补充缺失信息。

```json
{
  "component": "ParameterConfirm",
  "topic": "Python语言设计",
  "questionTypes": ["radio", "checkbox"],
  "difficulty": "middle",
  "questionCount": 10
}
```

字段说明：
- `topic`: 出题主题（可为空，由用户补充）
- `questionTypes`: 题型要求（可为空数组，由用户选择）
- `difficulty`: 难度级别 low/middle/high（可为空，由用户选择）
- `questionCount`: 题目数量（可为空，由用户输入）

### QuestionPreview
题目预览组件，前端自行读取文件并渲染题目卡片。

```json
{
  "component": "QuestionPreview",
  "filePath": "questions.json"
}
```

## 职责边界

**本 skill 仅负责 A2UI 交互界面输出，不负责题目生成**

- 题目生成必须调用 `question` skill
- 题目格式规范参见 `question` skill 的 references/question-schema.md
- 本 skill 只输出 Surface 组件（CourseSelector/ChapterSelector/ContentModeSelector/KnowledgePointSelector/ParameterConfirm/QuestionPreview）
