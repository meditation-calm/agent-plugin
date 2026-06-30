# A2UI 消息模板

## 核心规则

**所有组件只传递组件标识和必要参数，不传递数据数组**

- `CourseSelector`：只传组件名，前端自行获取课程列表
- `ContentModeSelector`：只传 `sourceType`，前端渲染两个选项按钮
- `ChapterSelector`：只传 `courseCode` 和 `repo`，前端自行获取章节树
- `KnowledgePointSelector`：**唯一需要传数据的组件**，传递 Agent 提取的知识点数组
- `QuestionPreview`：只传 `filePath`，前端自行读取文件

---

## 阶段1：课程选择

调用 `question` tool，参数如下：

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

**禁止**：不要在 CourseSelector 中嵌入课程列表数据。

---

## 阶段2：内容模式选择（课程/附件场景）

调用 `question` tool，参数如下：

```json
{
  "questions": [{
    "question": "请选择内容使用模式",
    "header": "内容模式",
    "options": [{ "label": "确认", "description": "确认选择" }],
    "custom": true,
    "_a2ui": {
      "version": "v0.9.1",
      "surfaceId": "question-form",
      "components": [
        { "id": "root", "component": "ContentModeSelector", "sourceType": "course" }
      ]
    }
  }]
}
```

`sourceType` 取值：`"course"` 或 `"attachment"`

**禁止**：不要嵌入选项数据，前端根据 sourceType 自行渲染对应文案。

---

## 阶段3：章节选择（仅课程出题场景）

调用 `question` tool，参数如下：

```json
{
  "questions": [{
    "question": "请选择要出题的章节",
    "header": "章节选择",
    "options": [{ "label": "确认", "description": "确认选择" }],
    "custom": true,
    "_a2ui": {
      "version": "v0.9.1",
      "surfaceId": "question-form",
      "components": [
        { "id": "root", "component": "ChapterSelector", "courseCode": "PY101", "repo": "repo-py101" }
      ]
    }
  }]
}
```

**禁止**：不要在 ChapterSelector 中嵌入章节树数据。

---

## 阶段4：知识点提取（解析模式）

调用 `question` tool，参数如下：

```json
{
  "questions": [{
    "question": "请勾选要出题的知识点",
    "header": "知识点选择",
    "options": [{ "label": "确认", "description": "确认选择" }],
    "custom": true,
    "_a2ui": {
      "version": "v0.9.1",
      "surfaceId": "question-form",
      "components": [
        {
          "id": "root",
          "component": "KnowledgePointSelector",
          "knowledgePoints": [
            { "id": "kp-1", "name": "变量命名规范", "source": "1.1 变量与数据类型", "selected": false },
            { "id": "kp-2", "name": "数据类型转换", "source": "1.1 变量与数据类型", "selected": false }
          ]
        }
      ]
    }
  }]
}
```

**这是唯一需要传数据的组件**。知识点由 Agent 从章节内容或附件中提取。

---

## 阶段5：题目预览

调用 `question` tool，参数如下：

```json
{
  "questions": [{
    "question": "请预览并确认题目",
    "header": "题目预览",
    "options": [{ "label": "确认", "description": "确认保存" }],
    "custom": true,
    "_a2ui": {
      "version": "v0.9.1",
      "surfaceId": "question-form",
      "components": [
        { "id": "root", "component": "QuestionPreview", "filePath": "questions.json" }
      ],
      "deleteSurface": true
    }
  }]
}
```

**禁止**：不要在 QuestionPreview 中嵌入题目数据。

---

## Action 定义

| Action | context | 说明 |
|--------|---------|------|
| `select_course` | `{courseCode, repo, labCode}` | 用户选择课程 |
| `select_content_mode` | `{mode: "reference"|"parse"}` | 用户选择内容使用模式 |
| `select_chapters` | `{selectedChapters: [{path, title}]}` | 用户勾选章节 |
| `confirm_knowledge_points` | `{knowledgePoints: [{id, name}]}` | 用户确认知识点 |
| `edit_questions` | — | 进入编辑模式 |
| `save` | — | 确认保存 |

---

## 前端职责

标题、按钮、布局、统计面板等 UI 元素均由前端自行渲染，A2UI Surface 只传递组件加载指令。
