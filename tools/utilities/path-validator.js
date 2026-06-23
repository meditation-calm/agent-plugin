/**
 * Path Validator Tool
 * 
 * 验证文件路径的安全性和有效性
 * 防止路径遍历攻击和非法路径访问
 */

import path from 'path';
import fs from 'fs';

export const pathValidator = {
  name: 'path-validator',
  description: '验证文件路径的安全性和有效性',
  
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: '要验证的文件路径',
      },
      allowedRoot: {
        type: 'string',
        description: '允许的根目录路径',
      },
      checkExists: {
        type: 'boolean',
        description: '是否检查文件/目录是否存在',
        default: true,
      },
    },
    required: ['filePath'],
  },

  async execute({ filePath, allowedRoot, checkExists = true }) {
    const result = {
      valid: true,
      issues: [],
      normalized: null,
      exists: false,
    };

    try {
      const normalized = path.normalize(filePath);
      result.normalized = normalized;

      if (normalized.includes('..') && allowedRoot) {
        const resolved = path.resolve(allowedRoot, normalized);
        if (!resolved.startsWith(path.resolve(allowedRoot))) {
          result.valid = false;
          result.issues.push('路径遍历攻击检测：路径超出允许的根目录');
        }
      }

      if (checkExists) {
        result.exists = fs.existsSync(normalized);
        if (!result.exists) {
          result.issues.push(`路径不存在: ${normalized}`);
        }
      }

      const stats = result.exists ? fs.statSync(normalized) : null;
      if (stats) {
        result.type = stats.isFile() ? 'file' : 'directory';
        result.size = stats.size;
      }
    } catch (error) {
      result.valid = false;
      result.issues.push(`验证失败: ${error.message}`);
    }

    return result;
  },
};

export default pathValidator;
