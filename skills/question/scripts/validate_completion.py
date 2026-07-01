#!/usr/bin/env python3
"""校验填空题格式"""
import json
import os
import re
import sys

FILL_BLANK_PATTERN = r'<input\s+class="w-e-fill-blank"[^>]*>'

def validate(question):
    errors = []
    
    # 必填字段
    required = ['type', 'topic', 'difficulty', 'score', 'answer']
    for field in required:
        if field not in question:
            errors.append(f"缺少必填字段: {field}")
    
    if errors:
        return False, errors
    
    # type 校验
    if question['type'] != 'completion':
        errors.append(f"type 必须是 completion，当前: {question['type']}")
    
    # topic 校验
    if not isinstance(question['topic'], str):
        errors.append("topic 必须是字符串")
    elif not question['topic'].startswith('<p>') or not question['topic'].endswith('</p>'):
        errors.append("topic 必须使用 <p> 标签包裹")
    
    # 填空项数量校验
    fill_blanks = re.findall(FILL_BLANK_PATTERN, question['topic'])
    if len(fill_blanks) == 0:
        errors.append("topic 中必须至少有一个填空项（使用 <input class=\"w-e-fill-blank\" ... />）")
    
    # answer 校验
    if not isinstance(question['answer'], list):
        errors.append("answer 必须是数组")
    elif len(fill_blanks) > 0 and len(question['answer']) != len(fill_blanks):
        errors.append(f"填空项数量({len(fill_blanks)})与answer数量({len(question['answer'])})不匹配")
    else:
        for i, ans in enumerate(question['answer']):
            if not isinstance(ans, dict) or 'answer' not in ans:
                errors.append(f"answer[{i}] 必须包含 'answer' 字段")
            elif not ans['answer'] or not ans['answer'].strip():
                errors.append(f"answer[{i}] 不能为空")
    
    # difficulty 校验
    if question['difficulty'] not in ['low', 'middle', 'high']:
        errors.append(f"difficulty 必须是 low/middle/high，当前: {question['difficulty']}")
    
    # score 校验
    if not isinstance(question['score'], int):
        errors.append("score 必须是整数")
    
    return len(errors) == 0, errors

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "errors": ["请提供题目JSON文件或JSON字符串"]}))
        sys.exit(1)
    
    input_arg = sys.argv[1]
    try:
        if os.path.isfile(input_arg):
            with open(input_arg, 'r', encoding='utf-8') as f:
                question = json.load(f)
        else:
            question = json.loads(input_arg)
    except (json.JSONDecodeError, OSError) as e:
        print(json.dumps({"success": False, "errors": [f"JSON格式错误: {str(e)}"]}))
        sys.exit(1)
    
    success, errors = validate(question)
    result = {"success": success, "errors": errors}
    if success:
        result["message"] = "填空题格式校验通过"
    
    print(json.dumps(result, ensure_ascii=False))
    sys.exit(0 if success else 1)
