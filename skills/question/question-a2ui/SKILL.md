---
name: question-a2ui
version: 1.0.0
description: |
  A2UI交互式出题技能。通过<a2ui>标签在文本响应中嵌入声明式A2UI JSON，
  在客户端渲染为富交互表单和题目预览。按需穿插使用，不是固定阶段流水线。
  Use when: A2UI出题, 富交互出题, 表单出题, interactive question generation.
---

# A2UI 交互式出题技能

## 何时使用 A2UI

A2UI 是交互层，按需穿插在出题执行流程中：

| 场景 | 是否需要 A2UI Surface | 说明 |
|------|----------------------|------|
| 信息不足，需要收集需求 | ✓ 需求表单 Surface | CourseChapterSelector + 表单字段 |
| 信息充足，可直接生成 | ✗ 直接派遣子 agent | 不必强制展示表单 |
| 生成完成，需要预览确认 | ✓ 预览 Surface | dataSource 引用 questions.json，前端自行渲染 |
| 用户要求编辑编排 | ✓ 编排 Surface | dataSource 引用 questions.json，前端自行渲染 |
| 题库搜索 | ✗ 纯内部操作 | 搜索结果作为子 agent 辅助数据，不渲染 Surface |

**关键原则**：A2UI 交互和 Agent 执行按需穿插，同一个 session 中可能多次穿插。

## A2UI 消息输出格式

### 输出规则

所有 A2UI JSON 消息必须使用 `<a2ui>` 标签包裹：

```
<a2ui>
[
  {"version":"v0.9.1","createSurface":{...}},
  {"version":"v0.9.1","updateComponents":{...}},
  {"version":"v0.9.1","updateDataModel":{...}}
]
</a2ui>
```

- 标签外的文本内容渲染为聊天消息
- 标签内的 JSON 由 A2UI Renderer 渲染为 Surface
- 统一 `<a2ui>` 标签

### 协议版本

使用 A2UI v0.9.1 协议，所有消息 `version` 字段固定为 `"v0.9.1"`。

### Surface 管理

| 属性 | 值 | 说明 |
|------|-----|------|
| surfaceId | `"question-form"` | 固定不变，所有交互共用 |
| catalogId | `"a2ui-question-catalog"` | 继承 Basic + 1 自定义组件 |
| sendDataModel | `true` | action 回传时附带完整 DataModel |

### Surface 操作模式

| 操作类型 | 消息组合 | 使用场景 |
|----------|----------|----------|
| 首次创建 Surface | createSurface + updateComponents(仅CourseChapterSelector) + updateDataModel(value, mode=form) | 需求表单——前端根据CourseChapterSelector和mode自行渲染题型/难度/数量等其余表单 |
| 展示文件数据（预览） | 仅 updateDataModel(dataSource, mode=preview) | 前端自行读取渲染预览界面 |
| 展示文件数据（编排） | 仅 updateDataModel(dataSource, mode=edit) | 前端自行读取渲染编排界面（含删除/重排操作） |
| 刷新文件数据 | 仅 updateDataModel(dataSource, action="refresh") | 子 agent 修改文件后 |
| 完成/关闭 | deleteSurface | 保存确认后 |

### Catalog

使用自定义出题 Catalog: `"a2ui-question-catalog"`

- 继承 Basic Catalog 18 个组件 + 24 个函数
- 新增 1 个自定义组件：CourseChapterSelector
- 详见 [a2ui-question-catalog.md](references/a2ui-question-catalog.md)

### 数据绑定

- 所有可变数据通过 `updateDataModel` 设置
- 输入组件使用 `{path: "/..."}` DataBinding
- 题目数据绑定到 `/questions` 数组
- 用户交互数据使用内嵌 `value`
- Agent 写文件后的数据使用 `dataSource` 引用

### updateDataModel dataSource 扩展

`updateDataModel` 支持两种数据来源：

**直接内嵌 value（标准 A2UI）**：
```json
{"version":"v0.9.1","updateDataModel":{"surfaceId":"question-form","path":"/","value":{"topic":"","questionTypes":["radio"]}}}
```

**文件引用 dataSource（扩展）**：
```json
{"version":"v0.9.1","updateDataModel":{"surfaceId":"question-form","path":"/","dataSource":{"path":"questions.json","dataType":"questions"}}}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `path` | string | 文件路径（相对 workspace 目录） |
| `dataType` | enum | 转换器标识：`questions` |
| `action` | enum | 操作类型：`loadDataModel`(初始) / `refresh`(重新读取) / `update`(部分更新) |

dataSource 由 Sidecar 预处理：读文件 → dataType 转换 → 替换 dataSource 为 value → MessageProcessor 处理。

**前端自行渲染**：dataSource dataType `questions` 返回题目数据后，前端根据数据自行决定渲染方式。

### Action 处理

收到用户消息中包含 `a2ui_action` metadata 时：

1. 从 `context` 提取用户填写的数据（sendDataModel=true 时附带完整 DataModel）
2. 根据 action name 执行对应业务逻辑
3. 输出新的 `<a2ui>` 更新 Surface

| Action | 说明 | 编排器行为 |
|--------|------|-----------|
| `generate` | 用户提交需求 | 拼 prompt → 派遣 question-generator-agent → 收到摘要 → dataSource 预览 Surface（mode=preview） |
| `edit_questions` | 进入编排 | dataSource 编排 Surface（mode=edit） |
| `delete_question` | 删除题目 | 拼 prompt → 派遣 question-edit-agent → 收到摘要 → refresh Surface |
| `reorder_question` | 移动顺序 | 拼 prompt → 派遣 question-edit-agent → 收到摘要 → refresh Surface |
| `save` | 确认保存 | deleteSurface + 文字确认 |
| `back_to_preview` | 返回预览 | dataSource 预览 Surface（mode=preview） |
| `back_to_chat` | 回到聊天 | deleteSurface |

### 文件写入规则

子 agent 写 `questions.json` 时，每个题目对象必须追加以下扩展字段：

```json
{
  "type": "radio",
  "topic": "<p>题目内容</p>",
  "_isValid": true,
  "_validationErrors": []
}
```

这些字段供 dataSource 转换器计算校验状态，填充到 DataModel 的 `isValid` / `validationErrors`。

### DataModel 字段

需求表单 DataModel（仅课程相关字段，其余由前端自行管理）：
```json
{
  "labCode": "",
  "courseCode": "",
  "chapterPath": "",
  "mode": "form"
}
```

| 字段 | 说明 |
|------|------|
| `labCode` | 实验室编码，由 CourseChapterSelector 回填 |
| `courseCode` | 课程编码，由 CourseChapterSelector 回填 |
| `chapterPath` | 章节路径，由 CourseChapterSelector 回填 |
| `mode` | Surface 状态标识：`form`（表单）/ `preview`（预览）/ `edit`（编排），前端据此决定渲染界面 |

generate action 回传时 sendDataModel=true，前端会将用户填写的完整表单数据一并回传，编排器从完整 DataModel 中提取所有参数（题型/难度/数量/分值/保存路径等）拼入子 agent prompt。

### 课程章节流程

用户通过 CourseChapterSelector 组件选择课程和章节（组件自身调 API 加载），确认后提交 generate action。编排器从 DataModel 提取 courseCode + chapterPath 等参数拼入 prompt，派遣 question-generator-agent。子 agent 自己调 course_detail(courseCode) 获取 repo，再调 course_content(repo, chapterPath) 获取章节 markdown 内容，作为知识点上下文生成题目。

### 消息模板参考

A2UI 消息模板是**可选参考**，Agent 根据实际场景按需组合。详见 [a2ui-question-templates.md](references/a2ui-question-templates.md)。

题目 JSON 格式规范详见 question-generator 技能的 [question-schema.md](../question-generator/references/question-schema.md)。

## 自定义组件概览

| 组件 | 用途 | 使用场景 |
|------|------|----------|
| CourseChapterSelector | 课程章节选择（渐进式：lab→课程→章节） | 需求表单 |
