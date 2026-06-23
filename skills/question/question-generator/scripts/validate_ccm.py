#!/usr/bin/env python3
"""校验编程题格式"""
import json
import sys

def validate(question):
    errors = []
    
    # 必填字段
    required = ['type', 'topic', 'content', 'difficulty', 'score', 'language', 'initCode', 'answer', 'verifyMode']
    for field in required:
        if field not in question:
            errors.append(f"缺少必填字段: {field}")
    
    if errors:
        return False, errors
    
    # type 校验
    if question['type'] != 'ccm':
        errors.append(f"type 必须是 ccm，当前: {question['type']}")
    
    # topic 校验
    if not isinstance(question['topic'], str):
        errors.append("topic 必须是字符串")
    elif len(question['topic']) > 50:
        errors.append("topic 长度不能超过50字")
    
    # content 校验
    if not isinstance(question['content'], str):
        errors.append("content 必须是字符串")
    elif not question['content'].startswith('<p>') or not question['content'].endswith('</p>'):
        errors.append("content 必须使用 <p> 标签包裹")
    
    # difficulty 校验
    if question['difficulty'] not in ['low', 'middle', 'high']:
        errors.append(f"difficulty 必须是 low/middle/high，当前: {question['difficulty']}")
    
    # score 校验
    if not isinstance(question['score'], int):
        errors.append("score 必须是整数")
    
    # language 校验
    valid_languages = ['python', 'javascript', 'typescript', 'c', 'cpp', 'csharp', 'java', 'rust', 'vb', 'php', 'mysql', 'golang', 'bash', 'html']
    if question['language'] not in valid_languages:
        errors.append(f"language 必须是 {valid_languages} 之一，当前: {question['language']}")
    
    # initCode 校验
    if not isinstance(question['initCode'], str):
        errors.append("initCode 必须是字符串")
    elif not question['initCode'].strip():
        errors.append("initCode 不能为空")
    
    # answer 校验
    if not isinstance(question['answer'], str):
        errors.append("answer 必须是字符串")
    elif not question['answer'].strip():
        errors.append("answer 不能为空")
    
    # verifyMode 校验
    if question['verifyMode'] not in ['SUBJECTIVE', 'INPUT_OUTPUT']:
        errors.append(f"verifyMode 必须是 SUBJECTIVE 或 INPUT_OUTPUT，当前: {question['verifyMode']}")
    else:
        # inputNum 校验
        if 'inputNum' not in question:
            errors.append("缺少必填字段: inputNum")
        elif not isinstance(question['inputNum'], int):
            errors.append("inputNum 必须是整数")
        else:
            if question['verifyMode'] == 'SUBJECTIVE':
                if question['inputNum'] != 0:
                    errors.append("主观校验模式下 inputNum 必须为 0")
                if question.get('exampleList') or question.get('testCaseList'):
                    errors.append("主观校验模式下不得生成 exampleList 或 testCaseList")
            elif question['verifyMode'] == 'INPUT_OUTPUT':
                if question['inputNum'] <= 0:
                    errors.append("输入输出校验模式下 inputNum 必须大于 0")
                if not question.get('exampleList') or len(question.get('exampleList', [])) == 0:
                    errors.append("输入输出校验模式下必须提供 exampleList")
                if not question.get('testCaseList') or len(question.get('testCaseList', [])) == 0:
                    errors.append("输入输出校验模式下必须提供 testCaseList")
                
                # 校验用例格式
                for i, case in enumerate(question.get('exampleList', [])):
                    if not isinstance(case, dict) or 'input' not in case or 'output' not in case:
                        errors.append(f"exampleList[{i}] 必须包含 input 和 output")
                    elif not case['input'] or case['input'] == '[]' or case['input'].strip() == '':
                        errors.append(f"exampleList[{i}] 的 input 不能为空或空字符串")
                
                for i, case in enumerate(question.get('testCaseList', [])):
                    if not isinstance(case, dict) or 'input' not in case or 'output' not in case:
                        errors.append(f"testCaseList[{i}] 必须包含 input 和 output")
                    elif not case['input'] or case['input'] == '[]' or case['input'].strip() == '':
                        errors.append(f"testCaseList[{i}] 的 input 不能为空或空字符串")
    
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
        result["message"] = "编程题格式校验通过"
    
    print(json.dumps(result, ensure_ascii=False))
    sys.exit(0 if success else 1)
