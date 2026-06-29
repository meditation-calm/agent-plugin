---
name: question-a2ui
version: 1.0.0
description: |
  A2UI交互式出题技能。通过<a2ui-json>标签在文本响应中嵌入声明式A2UI JSON，
  在客户端渲染为富交互界面（课程选择/章节选择/知识点提取/题目预览）。
  Use when: A2UI出题, 富交互出题, 课程选择, 知识点提取.
---

# A2UI 出题交互技能

## A2UI 消息输出格式

### 输出规则
所有A2UI JSON消息必须使用 `<a2ui-json>` 标签包裹，嵌入在文本响应中：

<a2ui-json>
[
  {"version":"v0.9.1","createSurface":{...}},
  {"version":"v0.9.1","updateComponents":{...}},
  {"version":"v0.9.1","updateDataModel":{...}}
]
</a2ui-json>

标签外的文本内容会被渲染为聊天消息，标签内的JSON会被A2UI Renderer渲染为Surface。

### 协议版本
使用 A2UI v0.9.1 协议，version字段固定为 "v0.9.1"。

### Surface 管理
- 所有阶段共用同一个surfaceId: "question-form"
- 阶段1: createSurface + updateComponents
- 阶段2-3: 仅 updateComponents
- 阶段4: updateComponents + deleteSurface

### Catalog
使用自定义出题Catalog: "a2ui-question-catalog"
- 继承 Basic Catalog（includeBasicCatalog: true）
- 自定义组件: CourseSelector, ContentModeSelector, ChapterSelector, KnowledgePointSelector, QuestionPreview

### 数据绑定
- 所有可变数据通过 updateDataModel 设置
- 输入组件使用 {path: "/..."} DataBinding
- 题目数据通过文件路径传递，前端自行加载

### Action处理
当收到用户消息中包含 a2ui_action metadata时:
1. 从context中提取用户操作数据
2. 调用对应 skill 执行业务逻辑
3. 输出新的 <a2ui-json> 更新Surface

### 消息模板
参见 references/a2ui-templates.md

## 数据传递规则

**核心原则：组件只传引用，不传数据**

| 组件 | 传递内容 | 前端职责 |
|------|---------|---------|
| CourseSelector | 仅组件名 | 自行获取课程列表 |
| ContentModeSelector | sourceType 参数 | 根据类型渲染选项 |
| ChapterSelector | courseCode, repo | 自行获取章节树 |
| KnowledgePointSelector | knowledgePoints 数组 | 渲染知识点列表 |
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
- 本 skill 只输出 Surface 组件（CourseSelector/ChapterSelector/KnowledgePointSelector/QuestionPreview）
