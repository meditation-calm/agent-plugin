/**
 * agent-plugin - 场景化智能体插件入口
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, '../..');
const agentsDir = path.join(pluginRoot, 'agents');
const skillsDir = path.join(pluginRoot, 'skills');
const toolsDir = path.join(pluginRoot, 'tools');
const mcpDir = path.join(pluginRoot, 'mcp');

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: markdown.trimStart() };
  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const index = trimmed.indexOf(':');
    if (index <= 0) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
    frontmatter[key] = value;
  }
  return { frontmatter, body: match[2].trimStart() };
}

function registerSkills(config) {
  if (!fs.existsSync(skillsDir)) return;
  config.skills = config.skills || {};
  config.skills.paths = config.skills.paths || [];
  if (!config.skills.paths.includes(skillsDir)) {
    config.skills.paths.push(skillsDir);
  }
}

function registerAgents(config) {
  if (!fs.existsSync(agentsDir)) return;
  config.agent = config.agent || {};
  for (const fileName of fs.readdirSync(agentsDir)) {
    if (!fileName.endsWith('.md')) continue;
    const agentName = path.basename(fileName, '.md');
    const fullPath = path.join(agentsDir, fileName);
    const markdown = fs.readFileSync(fullPath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(markdown);
    config.agent[agentName] = {
      ...config.agent[agentName],
      description: frontmatter.description || `${agentName} agent`,
      mode: frontmatter.mode || 'subagent',
      color: frontmatter.color,
      prompt: body,
    };
  }
}

function registerTools(config) {
  if (!fs.existsSync(toolsDir)) return;
  const toolsFiles = fs.readdirSync(toolsDir).filter(f => f !== '.gitkeep');
  if (toolsFiles.length === 0) return;
  config.tools = config.tools || {};
  config.tools.paths = config.tools.paths || [];
  if (!config.tools.paths.includes(toolsDir)) {
    config.tools.paths.push(toolsDir);
  }
}

function registerMcp(config) {
  if (!fs.existsSync(mcpDir)) return;
  config.mcp = config.mcp || {};

  const mcpFiles = fs.readdirSync(mcpDir).filter(f => /\.(js|mjs)$/.test(f));
  for (const file of mcpFiles) {
    const name = path.basename(file).replace(/-server\.(js|mjs)$/, '-mcp');
    if (config.mcp[name]) continue;

    config.mcp[name] = {
      type: 'local',
      command: ['node', path.join(mcpDir, file)],
      enabled: true,
    };
  }
}

export const AgentPlugin = async () => {
  return {
    config: async (config) => {
      registerSkills(config);
      registerAgents(config);
      registerTools(config);
      registerMcp(config);
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      for (const msg of output.messages) {
        if (!msg.parts) continue;

        for (const part of msg.parts) {
          if (part.type === 'tool-call' && part.args) {
            const { tool } = part;

            if (tool === 'question' && part.args.questions) {
              part.args = {
                id: 'A2UI',
                data: part.args
              };
            }

            if (tool === 'todo' && part.args.todos) {
              part.args = {
                id: 'A2UI',
                data: part.args
              };
            }

            if (tool === 'openfile' && part.args.filePath) {
              part.args = {
                id: 'A2UI',
                data: part.args
              };
            }
          }
        }
      }
    },
  };
};

export default AgentPlugin;
