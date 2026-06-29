# A2UI 出题自定义 Catalog 定义

## Catalog 基础信息

```json
{
  "catalogId": "a2ui-question-catalog",
  "includeBasicCatalog": true,
  "basicCatalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
}
```

继承 Basic Catalog 18 个组件 + 24 个函数，新增 1 个自定义组件。

## Basic Catalog 组件清单（继承）

本场景使用的 Basic Catalog 组件：

| 组件 | 用途 | 场景 |
|------|------|------|
| Column | 垂直布局容器 | 表单、预览、编排 |
| Row | 水平布局容器 | 表单、预览 |
| Text | 文本显示 | 表单、预览、编排 |
| TextField | 文本/数字输入 | 表单 |
| ChoicePicker | 单选/多选选择 | 表单 |
| Slider | 滑动条输入 | 表单 |
| Button | 操作按钮 | 表单、预览、编排 |
| Divider | 分隔线 | 表单 |

其余 10 个 Basic 组件本场景不直接使用，但 Catalog 继承后仍可使用。

## Basic Catalog 函数清单（继承）

本场景使用的函数：

| 函数 | 用途 | 场景 |
|------|------|------|
| required | 必填校验 | 表单 |
| numeric | 数值范围校验 | 表单 |
| and | 多条件组合 | 表单 |

---

## 自定义组件：CourseChapterSelector — 课程章节选择器

渐进式选择课程和章节（lab → 课程 → 章节），组件自身调 API 加载课程数据。

### Zod Schema

```typescript
z.object({
  labCode: DynamicStringSchema,
  courseCode: DynamicStringSchema.optional(),
  chapterPath: DynamicStringSchema.optional(),
  labCodeBinding: DataBindingSchema,
  courseCodeBinding: DataBindingSchema.optional(),
  chapterPathBinding: DataBindingSchema.optional(),
})
```

### 属性定义

| 属性 | 类型 | 必填 | 绑定方式 | 说明 |
|------|------|------|----------|------|
| labCode | DynamicString | 否 | `{path: "/labCode"}` | 实验室编码，用户选择后自动回填 |
| courseCode | DynamicString | 否 | `{path: "/courseCode"}` | 课程编码，用户选择课程后自动回填 |
| chapterPath | DynamicString | 否 | `{path: "/chapterPath"}` | 章节路径，用户选择章节后自动回填 |

### 组件行为

1. 组件渲染时**自行调平台 API**加载 lab 列表、课程列表、章节目录
2. 用户交互：先选 lab → 再选课程 → 再选章节（渐进式三步）
3. 选中后**自动将 labCode、courseCode、chapterPath 写入 DataModel 对应 path**
4. Agent 不需要调 MCP 填充选项数据，只需在 updateComponents 中放置此组件

### 组件在 updateComponents 中的声明示例

```json
{
  "id": "course_selector",
  "component": "CourseChapterSelector",
  "labCode": { "path": "/labCode" },
  "courseCode": { "path": "/courseCode" },
  "chapterPath": { "path": "/chapterPath" }
}
```

---

## dataSource dataType 说明

| dataType | 转换内容 | 使用场景 |
|----------|----------|----------|
| `questions` | 题目列表 + 校验状态（_isValid/_validationErrors → isValid/validationErrors） | 预览、编排 |

dataSource 由 Sidecar 预处理：读 questions.json → dataType 转换 → 替换 dataSource 为 value → MessageProcessor 处理。前端收到转换后的数据后**自行决定渲染方式**。

### dataType `questions` 转换规则

输入（questions.json 原始格式）：
```json
[
  {
    "type": "radio",
    "topic": "<p>题目内容</p>",
    "difficulty": "low",
    "score": 5,
    "_isValid": true,
    "_validationErrors": []
  }
]
```

转换后（DataModel value）：
```json
{
  "questions": [
    {
      "type": "radio",
      "topic": "<p>题目内容</p>",
      "difficulty": "low",
      "score": 5,
      "isValid": true,
      "validationErrors": [],
      "title": "题目内容"
    }
  ],
  "totalCount": 5,
  "totalScore": 50,
  "validCount": 4,
  "invalidCount": 1,
  "mode": "preview"
}
```

转换逻辑：
- `_isValid` → `isValid`（去掉下划线前缀）
- `_validationErrors` → `validationErrors`
- 追加 `title`：extractPlainText(topic)（去掉 HTML 标签）
- 计算统计：totalCount、totalScore、validCount、invalidCount
- `mode` 字段由编排器通过 updateDataModel 设置（不在 dataSource 转换中生成，编排器需单独设置 mode）
