#!/usr/bin/env python3
"""校验选择题（单选/多选）格式"""
import json
import os
import sys

def validate(question):
    errors = []
    
    # 必填字段
    required = ['type', 'topic', 'difficulty', 'score', 'option', 'answer']
    for field in required:
        if field not in question:
            errors.append(f"缺少必填字段: {field}")
    
    if errors:
        return False, errors
    
    # type 校验
    if question['type'] not in ['radio', 'checkbox']:
        errors.append(f"type 必须是 radio 或 checkbox，当前: {question['type']}")
    
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
    
    # option 校验
    if not isinstance(question['option'], list) or len(question['option']) < 2:
        errors.append("option 必须是至少2个选项的数组")
    else:
        for i, opt in enumerate(question['option']):
            if 'key' not in opt or 'value' not in opt:
                errors.append(f"选项{i} 必须包含 key 和 value")
            if not isinstance(opt['value'], str):
                errors.append(f"选项{i} 的 value 必须是纯文本")
            elif '<' in opt['value'] or '>' in opt['value']:
                errors.append(f"选项{i} 的 value 不能包含HTML标签")
    
    # answer 校验
    if not isinstance(question['answer'], str):
        errors.append("answer 必须是字符串")
    else:
        keys = [opt['key'] for opt in question.get('option', [])]
        answers = [a.strip() for a in question['answer'].split(',')]
        for ans in answers:
            if ans not in keys:
                errors.append(f"答案 '{ans}' 不在选项 {keys} 中")
        
        if question['type'] == 'radio' and len(answers) != 1:
            errors.append("单选题 answer 只能有一个选项")
        elif question['type'] == 'checkbox' and len(answers) < 2:
            errors.append("多选题 answer 至少需要两个选项")
    
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
        result["message"] = "选择题格式校验通过"
    
    print(json.dumps(result, ensure_ascii=False))
    sys.exit(0 if success else 1)
