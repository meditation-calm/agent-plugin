/**
 * agent-plugin - 场景化智能体插件入口
 *
 * 功能：
 * - 本地组件自动发现与注册（skills/agents/tools）
 * - 通过 OpenCode 插件系统加载（远程 clone 由 OpenCode 处理）
 * - 注册表管理（registry）跟踪组件版本
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============ 配置常量 ============
const PLUGIN_NAME = 'agent-plugin';

// ============ 路径工具 ============
const normalizePath = (p, homeDir) => {
  if (!p || typeof p !== 'string') return null;
  let normalized = p.trim();
  if (normalized.startsWith('~/')) {
    normalized = path.join(homeDir, normalized.slice(2));
  } else if (normalized === '~') {
    normalized = homeDir;
  }
  return path.resolve(normalized);
};

const getConfigDir = () => {
  const homeDir = os.homedir();
  const envConfigDir = normalizePath(process.env.OPENCODE_CONFIG_DIR, homeDir);
  return envConfigDir || path.join(homeDir, '.config', 'opencode');
};

const getRegistryPath = () => {
  return path.join(getConfigDir(), 'plugins', 'agent-plugin-registry.json');
};

// ============ 注册表管理 ============
const loadRegistry = () => {
  const registryPath = getRegistryPath();
  if (!fs.existsSync(registryPath)) {
    return { version: 1, plugins: {}, lastUpdate: 0 };
  }
  try {
    const content = fs.readFileSync(registryPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { version: 1, plugins: {}, lastUpdate: 0 };
  }
};

const saveRegistry = (registry) => {
  const registryPath = getRegistryPath();
  const dir = path.dirname(registryPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tmpPath = `${registryPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(registry, null, 2), 'utf-8');
  fs.renameSync(tmpPath, registryPath);
};

const computeHash = (content) => {
  return createHash('sha256').update(content).digest('hex');
};

// ============ 组件发现 ============
const discoverComponents = (pluginRoot, type) => {
  const components = [];
  const searchPaths = {
    skill: ['.opencode/skills', '.claude/skills', 'skills'],
    agent: ['.opencode/agents', '.claude/agents', 'agents'],
    tool: ['.opencode/tools', '.claude/tools', 'tools'],
  };

  const paths = searchPaths[type] || [];
  for (const relativePath of paths) {
    const fullPath = path.join(pluginRoot, relativePath);
    if (fs.existsSync(fullPath)) {
      scanRecursive(fullPath, type, components);
      break;
    }
  }

  return components;
};

const scanRecursive = (dirPath, type, results) => {
  try {
    const entries = fs.readdirSync(dirPath);
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry);
      const stats = fs.statSync(entryPath);

      if (stats.isDirectory()) {
        if (type === 'skill') {
          const skillMdPath = path.join(entryPath, 'SKILL.md');
          if (fs.existsSync(skillMdPath)) {
            results.push({ type: 'skill', path: entryPath, name: entry });
          } else {
            // 递归搜索子目录（支持 skills/<domain>/<skill-name>/SKILL.md）
            scanRecursive(entryPath, type, results);
          }
        } else if (type === 'tool') {
          // tools 目录下可能有子目录，递归搜索
          scanRecursive(entryPath, type, results);
        }
      } else {
        // 文件匹配
        if (type === 'agent' && entry.endsWith('.md')) {
          results.push({ type: 'agent', path: entryPath, name: path.basename(entry, '.md') });
        } else if (type === 'tool' && (entry.endsWith('.js') || entry.endsWith('.mjs'))) {
          results.push({ type: 'tool', path: entryPath, name: path.basename(entry, path.extname(entry)) });
        }
      }
    }
  } catch {
    // 忽略错误，保持健壮性
  }
};

// ============ 前端解析 ============
const extractFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
};

// ============ 插件主入口 ============
export const AgentPlugin = async ({ client, directory }) => {
  const pluginRoot = path.resolve(__dirname, '../..');

  const skills = discoverComponents(pluginRoot, 'skill');
  const agents = discoverComponents(pluginRoot, 'agent');
  const tools = discoverComponents(pluginRoot, 'tool');

  const skillPaths = skills.map(s => s.path);

  const agentConfigs = {};
  agents.forEach(a => {
    const content = fs.readFileSync(a.path, 'utf-8');
    const { frontmatter } = extractFrontmatter(content);
    agentConfigs[a.name] = {
      path: a.path,
      description: frontmatter.description || '',
      mode: frontmatter.mode || 'subagent',
      color: frontmatter.color || 'default',
    };
  });

  const toolConfigs = {};
  tools.forEach(t => {
    toolConfigs[t.name] = {
      path: t.path,
      description: `${t.name} custom tool`,
    };
  });

  // 更新注册表
  const allContent = [...skills, ...agents, ...tools]
    .map(c => {
      if (c.type === 'skill') {
        return fs.readFileSync(path.join(c.path, 'SKILL.md'), 'utf-8');
      }
      return fs.readFileSync(c.path, 'utf-8');
    })
    .join('');
  const hash = computeHash(allContent);

  const registry = loadRegistry();
  registry.plugins[PLUGIN_NAME] = {
    name: PLUGIN_NAME,
    hash,
    source: { type: 'local', path: pluginRoot },
    installedAt: new Date().toISOString(),
    components: {
      skills: skills.map(s => s.name),
      agents: agents.map(a => a.name),
      tools: tools.map(t => t.name),
    },
  };
  registry.lastUpdate = Date.now();
  saveRegistry(registry);

  const bootstrapContent = `
<AGENT_PLUGIN_LOADED>
已加载 agent-plugin 组件：
- Skills: ${skills.map(s => s.name).join(', ') || '无'}
- Agents: ${agents.map(a => a.name).join(', ') || '无'}
- Tools: ${tools.map(t => t.name).join(', ') || '无'}
</AGENT_PLUGIN_LOADED>`;

  const getBootstrapContent = () => bootstrapContent;

  return {
    config: async (config) => {
      if (skillPaths.length > 0) {
        if (!config.skills) config.skills = {};
        if (!config.skills.paths) config.skills.paths = [];
        config.skills.paths.push(...skillPaths);
      }

      if (Object.keys(agentConfigs).length > 0) {
        if (!config.agents) config.agents = {};
        Object.assign(config.agents, agentConfigs);
      }

      if (Object.keys(toolConfigs).length > 0) {
        if (!config.tools) config.tools = {};
        Object.assign(config.tools, toolConfigs);
      }
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (bootstrap && output.messages.length) {
        const firstUser = output.messages.find(m => m.info.role === 'user');
        if (firstUser && firstUser.parts.length) {
          if (!firstUser.parts.some(p => p.type === 'text' && p.text.includes('AGENT_PLUGIN_LOADED'))) {
            firstUser.parts.unshift({ ...firstUser.parts[0], type: 'text', text: bootstrap });
          }
        }
      }
    },
  };
};

