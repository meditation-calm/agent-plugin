# 题目格式规范

课程章节内容中支持两种题型嵌入：选择题和编程题。

## 选择题格式

题目包裹在 ```question ... ```{{active}} 代码块中，内部为 JSON 结构（注意转义，保证 JSON.parse() 成功）。

### 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 题目唯一标识，不能重复 |
| `title` | string | 题目标题，支持 HTML |
| `type` | string | 固定为 `question` |
| `category` | string | `"radio"` 为单选题，`"checkbox"` 为多选题 |
| `options` | array | 选项列表，每个选项包含 `value` 和 `key` 字段 |
| `selected` | string | 正确答案。多选题多个答案用英文逗号分隔 |
| `buttonName` | string | 提交按钮名称 |

### 示例

````markdown
```question
{
    "id": "activity-3fda4019-1b52-4f61-9a27-6ac1d7b8e929",
    "title": "<p>考虑以下关于Java异常处理的说法，哪一个是正确的？</p>",
    "type": "question",
    "category": "radio",
    "options": [
        {
            "value": "`try`块必须与`catch`块配对使用，但可以不包含`finally`块。",
            "key": "A"
        },
        {
            "value": "可以有多个`catch`块来捕获不同类型的异常。",
            "key": "B"
        },
        {
            "value": "`finally`块总是会被执行，即使在`try`或`catch`块中有`return`语句。",
            "key": "C"
        },
        {
            "value": "`throw`关键字用于创建自定义异常类。",
            "key": "D"
        }
    ],
    "selected": "C",
    "buttonName": "提交"
}
```{{active}}
````

## 编程题格式

题目包裹在 ```validate ... ```{{active}} 代码块中，内部为 JSON 结构。

### 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 题目唯一标识，不能重复 |
| `topic` | string | 题目名称简略内容，不支持 HTML |
| `title` | string | 题目详细内容，支持 HTML |
| `type` | string | 固定为 `validate` |
| `verifyMode` | string | `"SUBJECTIVE"` 或 `"INPUT_OUTPUT"` |
| `judgeMode` | string | SUBJECTIVE 模式为 `"MANUAL"`，INPUT_OUTPUT 模式为 `"AUTOMATIC"` |
| `codeLanguage` | string | 编程语言 |
| `code` | string | 初始代码 |
| `paramNum` | number | 方法参数个数（仅 INPUT_OUTPUT 模式） |
| `testExample` | array | 测试用例（仅 INPUT_OUTPUT 模式） |
| `example` | array | 示例用例（仅 INPUT_OUTPUT 模式） |
| `buttonName` | string | 作答按钮名称 |

### 支持的编程语言

`python`, `java`, `rust`, `javascript`, `typescript`, `c`, `cpp`, `csharp`, `vb`, `php`, `mysql`, `golang`, `bash`, `html`

### 示例 — 主观题模式（SUBJECTIVE）

````markdown
```validate
{
    "id": "activity-061d8e74-7ff4-4513-8853-3c4940eccf98",
    "topic": "两数之和",
    "title": "<p>请实现两数之和算法...</p>",
    "type": "validate",
    "verifyMode": "SUBJECTIVE",
    "judgeMode": "MANUAL",
    "codeLanguage": "python",
    "code": "def twoSum(self, nums: List[int], target: int) -> List[int]:\r\n    pass\r\n\r\nif __name__ == "__main__":\r\n    pass",
    "buttonName": "去答题"
}
```{{active}}
````

### 示例 — 自动评测模式（INPUT_OUTPUT）

````markdown
```validate
{
    "id": "activity-9a5c11ff-2629-46cb-8417-c01893128b9e",
    "topic": "两数之和",
    "title": "<p>给定一个整数数组 <code>nums</code> ...</p>",
    "type": "validate",
    "verifyMode": "INPUT_OUTPUT",
    "judgeMode": "AUTOMATIC",
    "codeLanguage": "python",
    "code": "class Solution:\r\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\r\n        ",
    "paramNum": 2,
    "testExample": [{"input": ["[3,2,4]", "6"], "output": "[1,2]"}],
    "example": [{"input": ["[2,7,11,15]", "9"], "output": "[0,1]"}],
    "buttonName": "去答题"
}
```{{active}}
````

## 通用约束

1. 所有题目的 JSON 必须可被 `JSON.parse()` 成功解析
2. `id` 不能重复
3. INPUT_OUTPUT 模式的 `input` 字符串类型参数不支持为空或空字符串
