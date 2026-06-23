#!/usr/bin/env python3
"""校验问答题格式"""
import json
import sys

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
    if question['type'] != 'answer':
        errors.append(f"type 必须是 answer，当前: {question['type']}")
    
    # topic 校验
    if not isinstance(question['topic'], str):
        errors.append("topic 必须是字符串")
    elif not question['topic'].startswith('<p>') or not question['topic'].endswith('</p>'):
        errors.append("topic 必须使用 <p> 标签包裹")
    
    # difficulty 校验
    if question['difficulty'] not in ['low', 'middle', 'high']:
        errors.append(f"difficulty 必须是 low/middle/high，当前: {question['difficulty']}")
    
    # score 校验
    if not isinstance(question['score'], int):
        errors.append("score 必须是整数")
    
    # answer 校验
    if not isinstance(question['answer'], str):
        errors.append("answer 必须是字符串")
    elif not question['answer'].strip():
        errors.append("answer 不能为空")
    
    return len(errors) == 0, errors

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "errors": ["请提供题目JSON文件或JSON字符串"]}))
        sys.exit(1)
    
    try:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            question = json.load(f)
    except json.JSONDecodeError as e:
        print(json.dumps({"success": False, "errors": [f"JSON格式错误: {str(e)}"]}))
        sys.exit(1)
    
    success, errors = validate(question)
    result = {"success": success, "errors": errors}
    if success:
        result["message"] = "问答题格式校验通过"
    
    print(json.dumps(result, ensure_ascii=False))
    sys.exit(0 if success else 1)
