# A2UI 消息模板

## 阶段1：课程选择 Surface

```json
<a2ui-json>
[
  {
    "version": "v0.9.1",
    "createSurface": {
      "surfaceId": "question-form",
      "catalogId": "a2ui-question-catalog",
      "theme": { "primaryColor": "#4CAF50", "agentDisplayName": "智能出题助手" },
      "sendDataModel": true
    }
  },
  {
    "version": "v0.9.1",
    "updateComponents": {
      "surfaceId": "question-form",
      "components": [
        { "id": "root", "component": "CourseSelector" }
      ]
    }
  }
]
</a2ui-json>
```

## 阶段2：章节选择 Surface

```json
<a2ui-json>
[
  {
    "version": "v0.9.1",
    "updateComponents": {
      "surfaceId": "question-form",
      "components": [
        { "id": "root", "component": "ChapterSelector", "courseCode": "{{courseCode}}", "repo": "{{repo}}" }
      ]
    }
  }
]
</a2ui-json>
```

## 阶段3：知识点提取 Surface

```json
<a2ui-json>
[
  {
    "version": "v0.9.1",
    "updateComponents": {
      "surfaceId": "question-form",
      "components": [
        { "id": "root", "component": "KnowledgePointSelector", "knowledgePoints": [/* Agent提取的知识点数组 */] }
      ]
    }
  }
]
</a2ui-json>
```

## 阶段4：题目预览 Surface

```json
<a2ui-json>
[
  {
    "version": "v0.9.1",
    "updateComponents": {
      "surfaceId": "question-form",
      "components": [
        { "id": "root", "component": "QuestionPreview", "filePath": "questions.json" }
      ]
    }
  }
]
</a2ui-json>
```

## 阶段5：完成 Surface

```json
<a2ui-json>
[
  {
    "version": "v0.9.1",
    "updateComponents": {
      "surfaceId": "question-form",
      "components": [
        { "id": "root", "component": "QuestionPreview", "filePath": "questions.json" }
      ]
    }
  },
  {
    "version": "v0.9.1",
    "deleteSurface": { "surfaceId": "question-form" }
  }
]
</a2ui-json>
```

## Action 定义

| Action | context | 说明 |
|--------|---------|------|
| `select_course` | `{courseCode, repo, labCode}` | 用户选择课程 |
| `select_chapters` | `{selectedChapters: [{path, title}]}` | 用户勾选章节 |
| `confirm_knowledge_points` | `{knowledgePoints: [{id, name}]}` | 用户确认知识点 |
| `edit_questions` | — | 进入编辑模式 |
| `save` | — | 确认保存 |

## 自定义组件说明

| 组件 | 类型 | 说明 |
|------|------|------|
| `CourseSelector` | 自定义 | 前端自行调用 API 获取课程列表并渲染选择器 |
| `ChapterSelector` | 自定义 | 前端自行调用 API 获取章节树并渲染，接收 courseCode/repo 参数 |
| `KnowledgePointSelector` | 自定义 | 展示 Agent 提取的知识点列表供用户勾选 |
| `QuestionPreview` | 自定义 | 前端自行读取 filePath 文件并渲染题目卡片 |

**前端职责**：标题、按钮、布局、统计面板等 UI 元素均由前端自行渲染，A2UI Surface 只传递组件加载指令。
