---
name: question-editor
version: 1.0.0
description: "题目编辑与编排技能。读取已有题目文件，支持修改、删除、调整顺序、按题型编排试卷。Use when: 编辑题目, 修改题目, 删除题目, 组卷, 排序题目, edit questions."
---

# 题目编辑技能

## 工作流程

### 1. 读取题目文件

加载已有的 `questions.json` 文件（或用户指定的文件路径），解析为题目列表。

### 2. 编辑题目

根据用户要求修改指定题目：
- **修改内容**：题干、选项、答案、分值、难度、解析等
- **修改后必须重新校验**：修改的题目调用 `question-generator` 技能的校验脚本验证格式
- 校验失败时修正后重新校验
- 修改时必须遵循题目格式规范（参见 [question-schema.md](references/question-schema.md)）

### 3. 删除题目

- 按题号、题型、难度等条件筛选并删除指定题目
- 删除后保存更新后的文件

### 4. 编排试卷

- 默认按题型聚合排列：选择题 → 填空题 → 问答题 → 编程题
- 支持用户自定义排序（移动指定题目到指定位置）
- 支持添加、替换题目（需校验格式）
- 最终结果保存至 `questions.json`

## 注意事项

1. 编辑后的题目必须校验格式，确保修改未破坏结构
2. 删除题目后检查剩余题目是否仍满足用户的出题需求
3. 编辑时参考 [question-schema.md](references/question-schema.md) 确保格式正确

## 完整格式规范

完整JSON字段规范、各题型结构示例参见 [question-schema.md](references/question-schema.md)。
