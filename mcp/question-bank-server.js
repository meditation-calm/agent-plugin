import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const LAB_BASE_URL = process.env.LAB_BASE_URL || "https://lab-test.cloudlab.top";
const TOKEN = process.env.TOKEN || "";
const PARTNER = process.env.PARTNER || "";
const SIGN = process.env.SIGN || "";

const axiosInstance = axios.create({
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

const formatQuestionBank = (question) => {
  const formatItem = {
    id: question?.questionCode,
    type: question?.type,
    topic: question?.topic,
    content: question?.content,
    difficulty: question?.difficulty,
    option: question?.option,
    answer: question?.answer,
    description: question?.description,
    judgeMode: question?.judgeMode,
    judgeNorm: question?.judgeNorm,
  };

  try {
    formatItem.option = JSON.parse(formatItem.option);
  } catch {}

  if (formatItem.type === "completion") {
    formatItem.answer = question?.answerOption;
  }

  if (formatItem.type === "ccm") {
    formatItem.option = null;
    formatItem.language = question?.optionJson?.defaultLanguage;
    formatItem.verifyMode = question?.optionJson?.verifyMode;
    formatItem.initCode = (question?.codeList ?? []).find(() => true)?.customCode;
    formatItem.exampleList =
      question.exampleList?.map((example) => ({
        input: example?.input,
        output: example?.output,
      })) ?? [];
    formatItem.testCaseList =
      question.testCaseList?.map((caseItem) => ({
        input: caseItem?.input,
        output: caseItem?.output,
      })) ?? [];
  }

  return formatItem;
};

const mapLabelItem = (item) => ({
  labelCode: item?.labelCode,
  parentCode: item?.parentCode,
  name: item?.name,
  path: item?.path,
  children: item?.childList?.map(mapLabelItem),
});

const server = new McpServer({
  name: "question-bank-mcp",
  version: "1.0.0",
});

server.tool(
  "question_label",
  "查找题库知识点，可用于题库基于知识点反向查找搜索题目",
  {
    labCode: z.string().describe("实验室编码code，查询实验室获取"),
  },
  async ({ labCode }) => {
    try {
      const res = await axiosInstance.post(
        "/api/v0.3/lab-label/tree-list",
        {
          labCode,
          modules: "QUESTION_LABEL",
          hasEmptyChildLabel: false,
          hasQuantity: false,
          hasSubAllLabel: false,
        },
        { headers: getAuthHeaders() }
      );
      const labels = (res.data ?? []).map(mapLabelItem);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(labels, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `知识点查询失败: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "question_search",
  "在题库中搜索题目",
  {
    labCode: z.string().describe("实验室编码code，查询实验室获取"),
    types: z
      .array(z.enum(["RADIO", "CHECKBOX", "ANSWER", "COMPLETION", "CCM"]))
      .optional()
      .describe("题目类型, 可选"),
    difficulties: z
      .array(z.enum(["LOW", "MIDDLE", "HIGH"]))
      .optional()
      .describe("题目难度, 可选"),
    labelPaths: z
      .array(z.string())
      .optional()
      .describe("题目知识点path, 可选"),
    current: z.number().describe("分页页码，从1开始"),
    size: z.number().describe("每页数量，每次最多查询20个"),
    keywords: z.string().optional().describe("搜索关键词, 可选"),
  },
  async ({ labCode, types, difficulties, labelPaths, current, size, keywords }) => {
    try {
      const res = await axiosInstance.post(
        "/api/v0.3/question/bank/search",
        {
          labCode,
          types: types || [],
          labelPaths: labelPaths || [],
          difficulties: difficulties || [],
          keywords: keywords || "",
          current: current || 1,
          size: size || 10,
        },
        { headers: getAuthHeaders() }
      );

      const dataList = Array.isArray(res.data?.rows) ? res.data?.rows : [];
      const questions = await Promise.all(
        dataList.map(async (item) => {
          if (item?.type === "ccm") {
            const detailRes = await axiosInstance.get(
              "/api/v0.3/question/bank/info",
              {
                params: { questionCode: item?.questionCode },
                headers: getAuthHeaders(),
              }
            );
            return formatQuestionBank(detailRes.data);
          }
          return formatQuestionBank(item);
        })
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(questions, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `题目搜索失败: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "question_detail",
  "获取题库题目详情",
  {
    questionCode: z.string().describe("题目编码code"),
  },
  async ({ questionCode }) => {
    try {
      const res = await axiosInstance.get("/api/v0.3/question/bank/info", {
        params: { questionCode },
        headers: getAuthHeaders(),
      });
      const detail = formatQuestionBank(res.data);
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
            text: `题目详情查询失败: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
