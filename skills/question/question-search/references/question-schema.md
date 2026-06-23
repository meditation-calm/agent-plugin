# 题目JSON数据格式规范

## 通用字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 否 | 题目唯一标识，使用UUID格式 |
| `type` | string | 是 | 题目类型：`radio`/`checkbox`/`completion`/`ccm`/`answer` |
| `topic` | string | 是 | 题干内容，必须使用`<p>`标签包裹，图片使用`<img>`标签 |
| `difficulty` | string | 是 | 难度：`low`（低）/`middle`（中）/`high`（高） |
| `score` | number | 是 | 分数，必须是整数 |
| `description` | string | 否 | 题目解析 |
| `judgeNorm` | string | 否 | 判断标准 |
| `index` | string | 否 | 排序序号，默认0 |

---

## 单选题 (radio)

```json
{
  "type": "radio",
  "topic": "<p>题干内容</p>",
  "difficulty": "low|middle|high",
  "score": 5,
  "option": [
    {"key": "A", "value": "选项内容"},
    {"key": "B", "value": "选项内容"},
    {"key": "C", "value": "选项内容"},
    {"key": "D", "value": "选项内容"}
  ],
  "answer": "A",
  "description": "解析内容（可选）"
}
```

**约束：**
- `topic`不得包含选项，选项必须在`option`数组中单独列出
- `option`的`value`必须是纯文本，不能包含HTML标签
- `answer`是单个选项键，如`"A"`

---

## 多选题 (checkbox)

```json
{
  "type": "checkbox",
  "topic": "<p>题干内容</p>",
  "difficulty": "low|middle|high",
  "score": 5,
  "option": [
    {"key": "A", "value": "选项内容"},
    {"key": "B", "value": "选项内容"},
    {"key": "C", "value": "选项内容"},
    {"key": "D", "value": "选项内容"}
  ],
  "answer": "A,B",
  "description": "解析内容（可选）"
}
```

**约束：**
- `topic`不得包含选项，选项必须在`option`数组中单独列出
- `option`的`value`必须是纯文本，不能包含HTML标签
- `answer`是多个选项键，用逗号分隔，如`"A,B"`或`"A,B,C"`

---

## 填空题 (completion)

```json
{
  "type": "completion",
  "topic": "<p>题目内容<input class=\"w-e-fill-blank\" data-w-e-type=\"fill-blank\" data-w-e-is-void=\"true\" data-w-e-is-inline=\"true\" readonly=\"true\" />更多内容<input class=\"w-e-fill-blank\" data-w-e-type=\"fill-blank\" data-w-e-is-void=\"true\" data-w-e-is-inline=\"true\" readonly=\"true\" /></p>",
  "difficulty": "low|middle|high",
  "score": 5,
  "answer": [
    {"answer": "填空1答案"},
    {"answer": "填空2答案"}
  ],
  "description": "解析内容（可选）"
}
```

**约束：**
- 必须使用`<input class="w-e-fill-blank" data-w-e-type="fill-blank" data-w-e-is-void="true" data-w-e-is-inline="true" readonly="true" />`表示填空项
- `topic`中的填空项数量必须与`answer`数组长度相同
- 每个填空项有且仅有唯一答案
- 至少有一个填空项

---

## 编程题 (ccm)

```json
{
  "type": "ccm",
  "topic": "题目名称，最多50字",
  "content": "<p>题目详细描述</p>",
  "difficulty": "low|middle|high",
  "score": 10,
  "language": "python|javascript|typescript|c|cpp|csharp|java|rust|vb|php|mysql|golang|bash|html",
  "initCode": "class Solution:\n    def method(self, param):\n\n// 请在此处作答...\n\n\n",
  "answer": "完整的可运行通过的代码",
  "verifyMode": "SUBJECTIVE|INPUT_OUTPUT",
  "inputNum": 0,
  "exampleList": [
    {"input": "[\"param1\",\"param2\"]", "output": "expected_output"},
    {"input": "[\"param1\",\"param2\"]", "output": "expected_output"}
  ],
  "testCaseList": [
    {"input": "[\"param1\",\"param2\"]", "output": "expected_output"},
    {"input": "[\"param1\",\"param2\"]", "output": "expected_output"}
  ],
  "description": "解析内容（可选）"
}
```

**约束：**
- `verifyMode`为`SUBJECTIVE`时：必须有主程序入口（如main方法），`inputNum`必须为0，不得生成用例
- `verifyMode`为`INPUT_OUTPUT`时：类似LeetCode模式，仅核心实现方法，无主程序入口，`exampleList`和`testCaseList`必填
- `initCode`不得包含完整答案，只能包含方法体必要结构
- 必须使用`\n// 请在此处作答...\n\n\n`标记用户答题输入位置
- `inputNum`表示输入参数个数，必须与用例的输入参数格式一致
- `exampleList`和`testCaseList`的`input`是字符串数组类型（JSON字符串格式）
- `input`不得提供空或空字符串（不支持）
- 注意不同语言入参特性（如Java需要returnSize参数）

### 编程题示例

**输入输出校验模式（INPUT_OUTPUT）：**

```json
{
  "input": "[\"[2,7,11,15]\",\"9\"]",
  "output": "[0,1]"
}
```

**主观校验模式（SUBJECTIVE）示例：**

```json
{
  "input": "[\"\\\"the sky is blue\\\"\"]",
  "output": "\"blue is sky the\""
}
```

---

## 问答题 (answer)

```json
{
  "type": "answer",
  "topic": "<p>题目问题内容</p>",
  "difficulty": "low|middle|high",
  "score": 10,
  "answer": "参考答案内容",
  "judgeNorm": "判断标准（可选）",
  "description": "解析内容（可选）"
}
```

**约束：**
- `answer`是参考答案，不是唯一答案
- `judgeNorm`可选，用于说明评分标准

---

## HTML标签规范

### 题干包装
所有内容必须使用`<p>`标签包裹：
```html
<p>这是题干内容</p>
```

### 图片处理
图片必须转成`<img>`标签描述：
```html
<p>根据下图回答问题：<img src="image_url" alt="图片描述" /></p>
```

### 填空项
填空题必须使用标准填空标签：
```html
<input class="w-e-fill-blank" data-w-e-type="fill-blank" data-w-e-is-void="true" data-w-e-is-inline="true" readonly="true" />
```

---

## JSON转义要求

- 双引号必须转义：`\"`
- 换行符必须转义：`\n`
- 反斜杠必须转义：`\\`
- 确保最终输出是标准JSON格式
