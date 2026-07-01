import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const LAB_BASE_URL = process.env.LAB_BASE_URL || "https://lab-test.cloudlab.top";
const OPENAPI_BASE_URL = process.env.OPENAPI_BASE_URL || "https://openapi-test.cloudlab.top";
const TOKEN = process.env.TOKEN || "";
const PARTNER = process.env.PARTNER || "";
const SIGN = process.env.SIGN || "";

const labAxios = axios.create({ baseURL: LAB_BASE_URL, timeout: 5000 });
const openapiAxios = axios.create({ baseURL: OPENAPI_BASE_URL, timeout: 5000 });

const getAuthHeaders = () => {
  const headers = {};
  if (PARTNER) headers.partner = PARTNER;
  if (TOKEN) headers.token = TOKEN;
  if (SIGN) headers.sign = SIGN;
  return headers;
};

const formatCourseDetail = (data) => ({
  code: data?.code,
  repo: data?.repo,
  name: data?.name,
  remark: data?.remark,
  template: data?.template,
  labCode: data?.labCode,
  labName: data?.labName,
});

const server = new McpServer({
  name: "course-mcp",
  version: "1.0.0",
});

server.tool(
  "course_list",
  "分页查询用户可管理的课程列表，可按实验室筛选、关键词搜索",
  {
    labCode: z.string().describe("实验室编码code"),
    current: z.number().describe("分页页码，从1开始"),
    size: z.number().describe("每页数量，每次最多查询20个"),
    keywords: z.string().optional().describe("搜索关键词, 可选"),
  },
  async ({ labCode, current, size, keywords }) => {
    try {
      const res = await labAxios.post(
        "/api/v0.3/course/page",
        {
          current: current || 1,
          size: size || 10,
          labCode,
          keywords: keywords || "",
        },
        { headers: getAuthHeaders() }
      );

      const data = res?.data;
      const result = {
        current: data?.current,
        size: data?.size,
        total: data?.total,
        rows: data?.rows?.map(formatCourseDetail),
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
            text: `课程列表查询失败: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "course_detail",
  "获取课程详情，包含课程编码、仓库标识、名称、描述、模板、章节统计等信息",
  {
    courseCode: z.string().describe("课程编码code"),
  },
  async ({ courseCode }) => {
    try {
      const res = await labAxios.get(
        `/api/v0.3/course/${courseCode}`,
        { headers: getAuthHeaders() }
      );
      const detail = formatCourseDetail(res.data);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(detail, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `课程详情查询失败: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "course_chapters",
  "查询课程章节目录结构，返回课程标题、描述和章节目录",
  {
    repo: z.string().describe("课程仓库标识(course_detail返回的repo)"),
  },
  async ({ repo }) => {
    try {
      const res = await openapiAxios.get("/repo/status", {
        params: { repo },
        headers: getAuthHeaders(),
      });
      const data = res.data;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              course: data?.course,
              repo: data?.repo,
              title: data?.title,
              description: data?.description,
              stat: data?.stat,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `课程章节查询失败: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "course_content",
  "读取课程章节内容，返回章节的markdown文本",
  {
    repo: z.string().describe("课程仓库标识(course_detail返回的repo)"),
    path: z.string().describe("章节路径(course_chapters返回的章节path)"),
  },
  async ({ repo, path }) => {
    try {
      const res = await openapiAxios.get("/fs/read", {
        params: { repo, path, file: "index.md" },
        headers: getAuthHeaders(),
      });
      const data = res.data;
      let content = "";
      if (data?.encoding === "base64" && data?.data) {
        content = Buffer.from(data.data, "base64").toString("utf-8");
      } else if (typeof data === "string") {
        content = data;
      } else {
        content = JSON.stringify(data, null, 2);
      }
      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `章节内容读取失败: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
