import { tool } from "@opencode-ai/plugin";
import axios from "axios";
import pako from "pako";
import crypto from "crypto";
import path from "path";
import fs from "fs";

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

export const course_save = tool({
  description: "创建课程记录，返回课程的 labCode 和 repo 信息",
  args: {
    labCode: tool.schema.string().describe("实验室编码"),
    name: tool.schema.string().describe("课程名称"),
    remark: tool.schema.string().optional().describe("课程描述"),
    template: tool.schema.string().optional().describe("课程环境模板(JSON字符串)"),
  },
  async execute({ labCode, name, remark, template }) {
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
      return JSON.stringify(res.data, null, 2);
    } catch (error) {
      return `创建课程失败: ${error.message}`;
    }
  },
});

export const fs_mkdir = tool({
  description: "创建章节目录结构",
  args: {
    repo: tool.schema.string().describe("课程仓库标识(course_save返回的repo)"),
    parent: tool.schema.string().describe("父级路径，多级用/分隔"),
    path: tool.schema.string().describe("完整路径(parent/title)"),
    title: tool.schema.string().describe("章节标题"),
    index: tool.schema.number().describe("章节排序序号"),
    category: tool.schema.enum(["content", "chapter"]).describe("章节类别：content(内容页)或chapter(目录章节)"),
    type: tool.schema.enum(["text", "stage", "chapter"]).describe("章节类型：text(单层内容)、stage(阶段)、chapter(章节)"),
  },
  async execute({ repo, parent, path, title, index, category, type }) {
    try {
      const res = await openapiAxios.post("/fs/mkdir", {
        parent,
        path,
        title,
        describe: { index, category, type },
      }, { params: { repo }, headers: getAuthHeaders() });
      return JSON.stringify(res.data, null, 2);
    } catch (error) {
      return `创建章节目录失败: ${error.message}`;
    }
  },
});

export const fs_write = tool({
  description: "写入章节内容，自动提取活动(question/validate代码块)并替换为ID引用，同时保存活动。一步完成内容写入和活动保存。推荐使用filePath传入本地文件路径（更快），content用于短内容直接传入",
  args: {
    repo: tool.schema.string().describe("课程仓库标识"),
    path: tool.schema.string().describe("章节路径(fs_mkdir创建的path)"),
    content: tool.schema.string().optional().describe("章节原始markdown内容(含活动代码块)"),
    filePath: tool.schema.string().optional().describe("本地文件路径，相对项目根目录(如course/Java基础/概述.md)，也可用绝对路径"),
  },
  async execute({ repo, path: chapterPath, content, filePath }, context) {
    let fileContent;
    if (filePath) {
      const resolved = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(context.worktree || process.cwd(), filePath);
      fileContent = fs.readFileSync(resolved, 'utf-8');
    } else if (content) {
      fileContent = content;
    } else {
      return "错误：必须提供 content 或 filePath 参数";
    }
    try {
      const { content: cleanedContent, activities } = parseContentActivities(fileContent);
      const base64Data = Buffer.from(cleanedContent, "utf-8").toString("base64");
      const writeRes = await openapiAxios.post("/fs/write", {
        encoding: "base64",
        data: base64Data,
      }, {
        params: { repo, path: chapterPath, file: "index.md" },
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
          params: { repo, path: chapterPath },
          headers: { ...getAuthHeaders(), EncodeScheme: "PAKO" },
        });
      }
      return JSON.stringify({
        writeResult: writeRes.data,
        activityCount: activities.length,
        activitiesSaved: activities.length > 0,
      }, null, 2);
    } catch (error) {
      return `写入章节内容失败: ${error.message}`;
    }
  },
});

export const repo_refresh = tool({
  description: "刷新课程仓库，重建导航和内容结构",
  args: {
    repo: tool.schema.string().describe("课程仓库标识"),
  },
  async execute({ repo }) {
    try {
      const res = await openapiAxios.get("/repo/refresh", {
        params: { repo },
        headers: getAuthHeaders(),
      });
      return JSON.stringify(res.data, null, 2);
    } catch {
      return JSON.stringify({ success: true, message: "刷新请求已发送(忽略错误)" });
    }
  },
});
