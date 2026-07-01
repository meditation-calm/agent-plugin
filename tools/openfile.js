import { tool } from "@opencode-ai/plugin";
import path from "path";
import fs from "fs";

export const openfile = tool({
  description: "打开文件供预览，前端根据 viewType 选择对应 A2UI 组件渲染，文件内容前端自行读取",
  args: {
    filePath: tool.schema.string().describe("文件路径（相对 workDir）"),
    workDir: tool.schema.string().optional().describe("工作目录（可选，用于相对路径解析）"),
    title: tool.schema.string().optional().describe("预览标题"),
    viewType: tool.schema.enum(["markdown", "question", "json"]).describe("前端渲染组件类型：markdown(Markdown预览)、question(题目专用组件)、json(JSON查看器)"),
  },
  async execute({ filePath, workDir, title, viewType }) {
    let resolvedPath = filePath;
    if (workDir && !path.isAbsolute(filePath)) {
      resolvedPath = path.resolve(workDir, filePath);
    }

    if (!fs.existsSync(resolvedPath)) {
      return JSON.stringify({
        success: false,
        error: `文件不存在: ${resolvedPath}`,
      });
    }

    return JSON.stringify({
      success: true,
      filePath: resolvedPath,
      title: title || path.basename(filePath),
      viewType,
    });
  },
});
