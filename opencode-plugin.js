/**
 * agent-plugin - 场景化智能体插件入口
 *
 * 遵循 OpenCode 插件约定：
 * - 导出 default function (config) { ... }
 * - 修改 config 添加 agents、skills、tools
 * - 不覆盖用户已有配置
 */

const fs = require('fs');
const path = require('path');

module.exports = function plugin(config) {
  // Add skills paths
  const skillsDir = path.join(__dirname, 'skills');
  if (fs.existsSync(skillsDir)) {
    if (!config.skills) {
      config.skills = {};
    }
    if (!config.skills.paths) {
      config.skills.paths = [];
    }
    config.skills.paths.push(skillsDir);
  }

  // Auto-discover and register agents
  const agentsDir = path.join(__dirname, 'agents');
  if (fs.existsSync(agentsDir)) {
    if (!config.agents) {
      config.agents = {};
    }
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    agentFiles.forEach(file => {
      const name = path.basename(file, '.md');
      const agentPath = path.join(agentsDir, file);
      config.agents[name] = agentPath;
    });
  }

  // Register custom tools if any exist
  const toolsDir = path.join(__dirname, 'tools');
  if (fs.existsSync(toolsDir) && !config.tools) {
    // Tools are discovered automatically by OpenCode from tools/ directory
    // No explicit registration needed for built-in tools
  }

  return config;
};
