import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const KNOWLEDGE_BASE_URL = process.env.KNOWLEDGE_BASE_URL || "https://ai-engine-test.cloudlab.top";
const TOKEN = process.env.TOKEN || "";

const server = new McpServer({
  name: "knowledge-mcp",
  version: "1.0.0",
});

server.tool(
  "knowledge_card",
  "生成知识点卡片，返回结构化的知识点列表",
  {
    content: z.string().describe("章节知识点内容，包含章节标题、知识点详情、学习目标、实践要求等"),
    generateOnEmpty: z.boolean().describe("如果内容为空，是否生成").default(true),
  },
  async ({ content, generateOnEmpty }) => {
    try {
      const response = await fetch(
        `${KNOWLEDGE_BASE_URL}/api/v1/knowledge/batch/card/exec`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            token: TOKEN,
          },
          body: JSON.stringify({ contents: [{ content, generateOnEmpty }] }),
          signal: AbortSignal.timeout(120000),
        }
      );
      const data = (await response.json())?.data || [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `知识点卡片生成失败: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
