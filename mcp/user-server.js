import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const LAB_BASE_URL = process.env.LAB_BASE_URL || "https://lab-test.cloudlab.top";
const TOKEN = process.env.TOKEN || "";
const PARTNER = process.env.PARTNER || "";
const SIGN = process.env.SIGN || "";

const labAxios = axios.create({
  baseURL: LAB_BASE_URL,
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
  name: "user-mcp",
  version: "1.0.0",
});

server.tool(
  "lab_query",
  "分页查询用户可管理的实验室列表，获取实验室编码、名称、状态等信息",
  {
    current: z.number().describe("分页页码，从1开始"),
    size: z.number().describe("每页数量，每次最多查询20个"),
    keywords: z.string().optional().describe("搜索关键词"),
  },
  async ({ current, size, keywords }) => {
    try {
      const res = await labAxios.post(
        "/api/v0.3/lab/recent/query",
        {
          current: current || 1,
          size: size || 10,
          keywords: keywords || "",
        },
        { headers: getAuthHeaders() }
      );

      const data = res?.data;
      const result = {
        current: data?.current,
        size: data?.size,
        total: data?.total,
        rows: data?.rows?.map((item) => ({
          code: item?.code,
          name: item?.name,
          status: item?.status,
          statusName: item?.statusName,
          type: item?.type,
          typeName: item?.typeName,
        })),
        hasPrevious: data?.hasPrevious,
        hasNext: data?.hasNext,
        pages: data?.pages,
      };

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
            text: `实验室列表查询失败: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
