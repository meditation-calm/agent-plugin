/**
 * a2ui-question-bridge - A2UI 问题交互桥接插件
 *
 * 功能：
 * - 拦截内置 question tool 调用
 * - 将 _a2ui 字段转换为 question JSON 字符串
 * - 注入 |A2UI 标识到 header 字段
 * - 清理 _a2ui 字段，确保符合标准 QuestionInfo 格式
 */

export const A2UIQuestionBridge = async () => {
  return {
    'tool.execute.before': async (input, output) => {
      if (input.tool === 'question' && output.args) {
        const questions = output.args.questions || [];
        for (const q of questions) {
          if (q._a2ui && q._a2ui.surfaceId) {
            // 将 _a2ui 转为 JSON 字符串放入 question 字段
            q.question = JSON.stringify(q._a2ui);

            // 注入 A2UI 标识到 header（保留原始 header 前 24 字符）
            const shortHeader = (q.header || '').substring(0, 24);
            q.header = `${shortHeader}|A2UI`;

            // 启用自定义 UI 渲染
            q.custom = true;

            // 清理 _a2ui 字段，确保符合标准格式
            delete q._a2ui;
          }
        }
      }
    },
  };
};
