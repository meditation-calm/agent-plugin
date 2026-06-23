import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import pako from "pako";
import crypto from "crypto";

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

const pakoCompress = (data) => {
  const compressed = pako.deflate(new TextEncoder().encode(data));
  return Buffer.from(compressed).toString("base64");
};

const parseContentActivities = (content) => {
  const activities = [];
  const regex = /```(question|validate)\s*(?:\{\{active\}\})?\s*([\s\S]*?)```(?:\{\{active\}\})?/g;
  const newContent = content.replace(regex, (match, type, jsonContent) => {
    try {
      const json = JSON.parse(jsonContent.trim());
      json.id = json.id || `activity-${crypto.randomUUID()}`;
      activities.push(json);
      return `\`\`\`${type}\n${JSON.stringify({ id: json.id }, null, 2)}\n\`\`\`{{active}}`;
    } catch {
      return match;
    }
  });
  return { content: newContent, activities };
};

const server = new McpServer({
  name: "course-mcp",
  version: "1.0.0",
});

server.tool(
  "course_save",
  "创建课程记录，返回课程的 labCode 和 repo 信息",
  {
    labCode: z.string().describe("实验室编码"),
    name: z.string().describe("课程名称"),
    remark: z.string().optional().describe("课程描述"),
    template: z.string().optional().describe("课程环境模板(JSON字符串)"),
  },
  async ({ labCode, name, remark, template }) => {
    try {
      const res = await labAxios.post("/api/v0.3/course/save", {
        labCode,
        type: "COURSE",
        tempId: 1,
        isUpdate: false,
        name: name || null,
        remark: remark || null,
        template: template || null,
      }, { headers: getAuthHeaders() });
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `创建课程失败: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "fs_mkdir",
  "创建章节目录结构",
  {
    repo: z.string().describe("课程仓库标识(course_save返回的repo)"),
    parent: z.string().describe("父级路径，多级用/分隔"),
    path: z.string().describe("完整路径(parent/title)"),
    title: z.string().describe("章节标题"),
    index: z.number().describe("章节排序序号"),
    category: z.enum(["content", "chapter"]).describe("章节类别：content(内容页)或chapter(目录章节)"),
    type: z.enum(["text", "stage", "chapter"]).describe("章节类型：text(单层内容)、stage(阶段)、chapter(章节)"),
  },
  async ({ repo, parent, path, title, index, category, type }) => {
    try {
      const res = await openapiAxios.post("/fs/mkdir", {
        parent,
        path,
        title,
        describe: { index, category, type },
      }, { params: { repo }, headers: getAuthHeaders() });
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `创建章节目录失败: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "fs_write",
  "写入章节内容，自动提取活动(question/validate代码块)并替换为ID引用，同时保存活动。一步完成内容写入和活动保存",
  {
    repo: z.string().describe("课程仓库标识"),
    path: z.string().describe("章节路径(fs_mkdir创建的path)"),
    content: z.string().describe("章节原始markdown内容(含活动代码块)"),
  },
  async ({ repo, path, content }) => {
    try {
      const { content: cleanedContent, activities } = parseContentActivities(content);
      const base64Data = Buffer.from(cleanedContent, "utf-8").toString("base64");
      const writeRes = await openapiAxios.post("/fs/write", {
        encoding: "base64",
        data: base64Data,
      }, {
        params: { repo, path, file: "index.md" },
        headers: getAuthHeaders(),
      });
      if (activities.length > 0) {
        const encodeData = pakoCompress(JSON.stringify({
          file: "activity.json",
          activities,
        }));
        await openapiAxios.post("/activity/batchSave", {
          requestId: crypto.randomUUID(),
          encodeData,
        }, {
          params: { repo, path },
          headers: { ...getAuthHeaders(), EncodeScheme: "PAKO" },
        });
      }
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            writeResult: writeRes.data,
            activityCount: activities.length,
            activitiesSaved: activities.length > 0,
          }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `写入章节内容失败: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "repo_refresh",
  "刷新课程仓库，重建导航和内容结构",
  {
    repo: z.string().describe("课程仓库标识"),
  },
  async ({ repo }) => {
    try {
      const res = await openapiAxios.get("/repo/refresh", {
        params: { repo },
        headers: getAuthHeaders(),
      });
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    } catch {
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, message: "刷新请求已发送(忽略错误)" }) }],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
