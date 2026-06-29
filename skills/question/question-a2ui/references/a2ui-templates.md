# A2UI 消息模板

## 阶段2：内容模式选择 Surface（课程/附件场景）

```json
<a2ui-json>
[
  {
    "version": "v0.9.1",
    "updateComponents": {
      "surfaceId": "question-form",
      "components": [
        { "id": "root", "component": "ContentModeSelector", "sourceType": "course|attachment" }
      ]
    }
  }
]
</a2ui-json>
```

## 阶段3：章节选择 Surface（仅课程出题场景）

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

## 阶段4：知识点提取 Surface（解析模式）

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

## 阶段5：题目预览 Surface

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
| `select_content_mode` | `{mode: "reference"|"parse"}` | 用户选择内容使用模式 |
| `select_chapters` | `{selectedChapters: [{path, title}]}` | 用户勾选章节 |
| `confirm_knowledge_points` | `{knowledgePoints: [{id, name}]}` | 用户确认知识点 |
| `edit_questions` | — | 进入编辑模式 |
| `save` | — | 确认保存 |

## 自定义组件说明

| 组件 | 类型 | 说明 |
|------|------|------|
| `CourseSelector` | 自定义 | 前端自行调用 API 获取课程列表并渲染选择器 |
| `ContentModeSelector` | 自定义 | 展示两种模式供用户选择：参考资料模式 / 解析知识点模式 |
| `ChapterSelector` | 自定义 | 前端自行调用 API 获取章节树并渲染，接收 courseCode/repo 参数 |
| `KnowledgePointSelector` | 自定义 | 展示 Agent 提取的知识点列表供用户勾选 |
| `QuestionPreview` | 自定义 | 前端自行读取 filePath 文件并渲染题目卡片 |

## 流程分支说明

**课程出题流程**：
1. CourseSelector → 用户选择课程
2. ContentModeSelector(sourceType="course") → 用户选择模式
   - `reference`（参考资料）→ 跳至阶段5，用户输入需求直接出题
   - `parse`（解析知识点）→ 进入阶段3
3. ChapterSelector → 用户勾选章节
4. KnowledgePointSelector → 用户确认知识点
5. QuestionPreview → 题目预览

**附件出题流程**：
1. CourseSelector → 用户选择课程
2. ContentModeSelector(sourceType="attachment") → 用户选择模式
   - `reference`（参考资料）→ 跳至阶段5，用户输入需求直接出题
   - `parse`（解析知识点）→ 进入阶段4
3. KnowledgePointSelector → 用户确认知识点
4. QuestionPreview → 题目预览

**纯文本出题流程**：
1. CourseSelector → 用户选择课程
2. 跳至阶段5，用户输入需求直接出题

**前端职责**：标题、按钮、布局、统计面板等 UI 元素均由前端自行渲染，A2UI Surface 只传递组件加载指令。
