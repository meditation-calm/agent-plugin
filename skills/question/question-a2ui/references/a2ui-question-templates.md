# A2UI 出题场景模板参考

> 以下模板是**可选参考**，Agent 根据实际场景按需组合使用，不必走完所有模板。
> 信息充足时可直接生成题目跳过表单，题库搜索不渲染 A2UI Surface。

## 按需组合指南

| 场景 | 使用的模板 | 可跳过的模板 |
|------|-----------|-------------|
| 信息不足 → 表单收集 → 生成 → 预览 → 保存 | 需求表单 → 预览 | 编排 |
| 信息充足 → 直接生成 → 预览 → 保存 | 预览 | 需求表单、编排 |
| 表单 → 生成 → 编辑编排 → 保存 | 需求表单 → 预览 → 编排 | — |
| 预览 → 编辑编排 → 保存 | 编排 | 需求表单 |

**关键**：同一个出题 session 中，A2UI 交互和 Agent 执行多次穿插。每次 Agent 执行完成后，按需输出对应的 Surface 模板等待用户确认，确认后继续执行。

---

## 模板 1：需求表单（信息不足时使用）

**场景**：用户发起出题请求，信息不足需要收集
**数据来源**：内嵌 value（仅课程相关字段，其余由前端自行管理）
**Agent 行为**：输出 createSurface + updateComponents(仅CourseChapterSelector) + updateDataModel(value, mode=form)

前端根据 CourseChapterSelector 选择结果和 mode=form，自行渲染题型/难度/数量/分值等表单字段及提交按钮。

**信息充足时跳过此模板**，直接派遣生成子 agent。

```
<a2ui>
[
  {
    "version": "v0.9.1",
    "createSurface": {
      "surfaceId": "question-form",
      "catalogId": "a2ui-question-catalog",
      "theme": {
        "primaryColor": "#4CAF50",
        "agentDisplayName": "智能出题助手"
      },
      "sendDataModel": true
    }
  },
  {
    "version": "v0.9.1",
    "updateComponents": {
      "surfaceId": "question-form",
      "components": [
        {
          "id": "course_selector",
          "component": "CourseChapterSelector",
          "labCode": { "path": "/labCode" },
          "courseCode": { "path": "/courseCode" },
          "chapterPath": { "path": "/chapterPath" }
        }
      ]
    }
  },
  {
    "version": "v0.9.1",
    "updateDataModel": {
      "surfaceId": "question-form",
      "path": "/",
      "value": {
        "labCode": "",
        "courseCode": "",
        "chapterPath": "",
        "mode": "form"
      }
    }
  }
]
</a2ui>
```

---

## 模板 2：题目预览（生成完成后使用）

**场景**：子 agent 生成题目后，编排器只需让前端读取 questions.json 渲染预览
**数据来源**：dataSource 引用 questions.json
**Agent 行为**：仅输出 updateDataModel(dataSource, mode=preview)

**如果尚未创建 Surface，需要先输出 createSurface**（信息充足直接生成时）。

```
<a2ui>
[
  {
    "version": "v0.9.1",
    "updateDataModel": {
      "surfaceId": "question-form",
      "path": "/",
      "value": {
        "mode": "preview"
      },
      "dataSource": {
        "path": "questions.json",
        "dataType": "questions"
      }
    }
  }
]
</a2ui>
```

---

## 模板 3：编辑编排（用户要求编辑时使用）

**场景**：用户点击"编辑编排"，编排器让前端进入编排模式
**数据来源**：dataSource 引用 questions.json
**Agent 行为**：仅输出 updateDataModel(dataSource, mode=edit)

```
<a2ui>
[
  {
    "version": "v0.9.1",
    "updateDataModel": {
      "surfaceId": "question-form",
      "path": "/",
      "value": {
        "mode": "edit"
      },
      "dataSource": {
        "path": "questions.json",
        "dataType": "questions"
      }
    }
  }
]
</a2ui>
```

---

## 模板 4：刷新文件数据（子 agent 修改文件后）

**场景**：子 agent 修改 questions.json 后，编排器让前端重新读取刷新渲染
**Agent 行为**：仅输出 updateDataModel(dataSource, action="refresh)

```
<a2ui>
[
  {
    "version": "v0.9.1",
    "updateDataModel": {
      "surfaceId": "question-form",
      "path": "/",
      "dataSource": {
        "path": "questions.json",
        "dataType": "questions",
        "action": "refresh"
      }
    }
  }
]
</a2ui>
```

---

## Action 回传格式参考

Action 通过前端 Sidecar 反向代理 POST 到 OpenCode：

```json
POST http://localhost:4096/session/{sessionId}/message
Content-Type: application/json

{
  "content": "A2UI action: generate on surface question-form",
  "metadata": {
    "a2ui_action": {
      "version": "v0.9.1",
      "action": {
        "name": "generate",
        "surfaceId": "question-form",
        "sourceComponentId": "submit_btn",
        "timestamp": "2026-06-26T10:30:00Z",
        "context": {
          "labCode": {"path": "/labCode"},
          "courseCode": {"path": "/courseCode"},
          "chapterPath": {"path": "/chapterPath"},
          "topic": {"path": "/topic"},
          "types": {"path": "/questionTypes"},
          "difficulty": {"path": "/difficulty"},
          "count": {"path": "/count"},
          "score": {"path": "/scorePerQuestion"},
          "savePath": {"path": "/savePath"}
        }
      }
    }
  }
}
```

**注意**：`sendDataModel: true` 时，每个 action 自动附带完整 DataModel（用户填写的表单数据）。

## DataModel 结构参考

### 需求表单 DataModel（内嵌 value，仅课程相关字段）

```json
{
  "labCode": "",
  "courseCode": "",
  "chapterPath": "",
  "mode": "form"
}
```

前端根据 CourseChapterSelector 选择结果和 mode=form，自行渲染题型/难度/数量/分值/保存路径等字段及提交按钮。generate action 回传时 sendDataModel=true，前端会将完整表单数据一并回传。

### 题目预览 DataModel（dataSource 转换后）

```json
{
  "totalCount": 5,
  "totalScore": 50,
  "validCount": 4,
  "invalidCount": 1,
  "savePath": "questions.json",
  "mode": "preview",
  "questions": [
    {
      "type": "radio",
      "title": "Python变量命名",
      "difficulty": "low",
      "score": 5,
      "isValid": true,
      "validationErrors": []
    }
  ]
}
```

### 编辑编排 DataModel（dataSource 转换后）

```json
{
  "totalCount": 5,
  "totalScore": 50,
  "validCount": 4,
  "invalidCount": 1,
  "savePath": "questions.json",
  "mode": "edit",
  "questions": [
    {
      "type": "radio",
      "title": "Python变量命名",
      "difficulty": "low",
      "score": 5,
      "isValid": true,
      "validationErrors": []
    }
  ]
}
```
