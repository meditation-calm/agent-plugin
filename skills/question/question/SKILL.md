---
name: question
version: 1.0.0
description: "题目生成与编辑编排技能。按需求生成单选/多选/填空/编程/问答题，支持读取已有题目文件进行修改、删除、编排试卷，并调用校验脚本验证格式。Use when: 出题, 生题, 生成题目, 编辑题目, 修改题目, 删除题目, 组卷, 排序题目, generate questions, edit questions."
---

# 题目技能

## 支持题型

- 单选题 `radio`
- 多选题 `checkbox`
- 填空题 `completion`
- 编程题 `ccm`
- 问答题 `answer`

## 工作流程一：生成题目

### 1. 需求确认

与用户沟通，明确：
- **主题/领域**：题目涉及的知识领域
- **题型**：单选、多选、填空、编程、问答（可混合）
- **数量**：每种题型需要多少道
- **难度**：低(low)、中(middle)、高(high)
- **分数**：每题分值（若未指定，自动分配合理分值）

### 2. 生成题目

#### 格式要求
- 所有题目必须输出标准JSON格式
- 题干必须使用 `<p>` 标签包裹
- 图片必须使用 `<img>` 标签描述
- 特殊字符必须正确转义（双引号 `\"`、换行 `\n`、反斜杠 `\\`）

#### 题型规则
- **选择题**：题干不得包含选项，选项在 `option` 数组中单独列出，`value` 必须是纯文本
- **填空题**：必须使用标准填空标签，填空项数量与 `answer` 数组长度相同
- **编程题**：`initCode` 只包含方法体结构，使用 `\n// 请在此处作答...\n\n\n` 标记答题位置
- **问答题**：`answer` 是参考答案，非唯一答案

### 3. 校验题目

**每道题生成后，必须调用对应题型的校验脚本**：

执行校验脚本（支持传入文件路径或 JSON 字符串）：
   - 选择题：`python scripts/validate_choice.py '<JSON字符串>'` 或 `python scripts/validate_choice.py <文件路径>`
   - 填空题：`python scripts/validate_completion.py '<JSON字符串>'` 或 `python scripts/validate_completion.py <文件路径>`
   - 编程题：`python scripts/validate_ccm.py '<JSON字符串>'` 或 `python scripts/validate_ccm.py <文件路径>`
   - 问答题：`python scripts/validate_answer.py '<JSON字符串>'` 或 `python scripts/validate_answer.py <文件路径>`
校验失败时，根据错误信息修正题目后重新校验。

## 工作流程二：编辑题目

### 1. 读取题目文件

加载已有的 `questions.json` 文件（或用户指定的文件路径），解析为题目列表。

### 2. 编辑题目

根据用户要求修改指定题目：
- **修改内容**：题干、选项、答案、分值、难度、解析等
- **修改后必须重新校验**：修改的题目调用校验脚本验证格式
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

1. 确保生成的题目内容准确、表述清晰
2. 难度分布合理，选项具有区分度
3. 编辑后的题目必须校验格式，确保修改未破坏结构
4. 删除题目后检查剩余题目是否仍满足用户的出题需求

## 完整格式规范

完整JSON字段规范、各题型结构示例、HTML标签使用规范参见 [question-schema.md](references/question-schema.md)。生成和编辑题目时参考此文件确保格式正确。
