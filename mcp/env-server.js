import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const PTY_BASE_URL = process.env.PTY_BASE_URL || "https://pty-test.cloudlab.top";
const TOKEN = process.env.TOKEN || "";
const PARTNER = process.env.PARTNER || "";
const SIGN = process.env.SIGN || "";

const ptyAxios = axios.create({
  baseURL: PTY_BASE_URL,
  timeout: 5000,
});

const getAuthHeaders = () => {
  const headers = {};
  if (PARTNER) headers.partner = PARTNER;
  if (TOKEN) headers.token = TOKEN;
  if (SIGN) headers.sign = SIGN;
  return headers;
};

const server = new McpServer({
  name: "env-mcp",
  version: "1.0.0",
});

server.tool(
  "env_list",
  "查询可用的实验环境模板列表，可按实验室筛选",
  {
    labCode: z.string().optional().describe("实验室编码，用于筛选该实验室下的环境模板"),
  },
  async ({ labCode }) => {
    try {
      const res = await ptyAxios.get("/cmd/template/list", {
        params: {
          custom: false,
          lab: labCode || undefined,
        },
        headers: getAuthHeaders(),
      });

      const result = Array.isArray(res.data)
        ? res.data.map((item) => ({
            lab: item?.lab,
            id: item?.id,
            name: item?.name,
            experEnv: item?.location,
            containers: item?.containers,
          }))
        : [];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `实验环境列表查询失败: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
