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
        { "id": "root", "component": "column", "children": ["title", "course_selector"] },
        { "id": "title", "component": "text", "text": "选择课程", "variant": "h2" },
        { "id": "course_selector", "component": "CourseSelector", "labCode": { "path": "/labCode" } }
      ]
    }
  },
  {
    "version": "v0.9.1",
    "updateDataModel": {
      "surfaceId": "question-form",
      "path": "/",
      "value": { "labCode": "" }
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
        { "id": "root", "component": "column", "children": ["title", "chapter_selector"] },
        { "id": "title", "component": "text", "text": "选择章节", "variant": "h2" },
        { "id": "chapter_selector", "component": "ChapterSelector", "courseCode": "{{courseCode}}", "repo": "{{repo}}" }
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
        { "id": "root", "component": "column", "children": ["title", "kp_selector", "confirm_btn"] },
        { "id": "title", "component": "text", "text": "确认知识点", "variant": "h2" },
        { "id": "kp_selector", "component": "KnowledgePointSelector", "knowledgePoints": [/* Agent提取的知识点数组 */] },
        { "id": "confirm_btn", "component": "button", "child": "confirm_label", "variant": "primary", "action": { "event": { "name": "confirm_knowledge_points", "context": { "knowledgePoints": { "path": "/knowledgePoints" } } } } },
        { "id": "confirm_label", "component": "text", "text": "确认并出题" }
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
        { "id": "root", "component": "column", "children": ["title", "question_preview", "action_row"] },
        { "id": "title", "component": "text", "text": "题目预览", "variant": "h2" },
        { "id": "question_preview", "component": "QuestionPreview", "filePath": "questions.json" },
        { "id": "action_row", "component": "row", "children": ["edit_btn", "save_btn"] },
        { "id": "edit_btn", "component": "button", "child": "edit_label", "variant": "borderless", "action": { "event": { "name": "edit_questions" } } },
        { "id": "edit_label", "component": "text", "text": "编辑编排" },
        { "id": "save_btn", "component": "button", "child": "save_label", "variant": "primary", "action": { "event": { "name": "save" } } },
        { "id": "save_label", "component": "text", "text": "确认保存" }
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
        { "id": "root", "component": "column", "children": ["title", "question_preview"] },
        { "id": "title", "component": "text", "text": "出题完成", "variant": "h2" },
        { "id": "question_preview", "component": "QuestionPreview", "filePath": "questions.json" }
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
