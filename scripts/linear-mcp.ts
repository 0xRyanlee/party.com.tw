#!/usr/bin/env npx ts-node

/**
 * Party Linear MCP Server v1
 * 修正版本 - 可用於日常 PM/Dev flow
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;

// 緩存 team states（避免重複查詢）
let statesCache: Map<string, { id: string; name: string }[]> = new Map();

// ==================== API 調用 ====================

async function linearQuery(query: string, variables?: Record<string, unknown>) {
    const res = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: LINEAR_API_KEY!, // Linear API key 不需要 Bearer 前綴
        },
        body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) {
        throw new Error(JSON.stringify(json.errors));
    }
    return json;
}

// 判斷是 identifier (PAR-9) 還是 UUID
function isIdentifier(value: string): boolean {
    return /^[A-Z]+-\d+$/.test(value); // 修正：regex 判斷
}

// 通過 identifier 查詢真正的 issue ID
async function getIssueByIdentifier(identifier: string) {
    const query = `
    query($filter: IssueFilter!) {
      issues(filter: $filter, first: 1) {
        nodes { id identifier title description priority state { id name } assignee { id name } labels { nodes { id name } } project { id name } url }
      }
    }
  `;
    const result = await linearQuery(query, {
        filter: { number: { eq: parseInt(identifier.split("-")[1]) } },
    });
    return result.data?.issues?.nodes?.[0];
}

// 獲取 team 的 states 列表（緩存）
async function getTeamStates(teamId: string) {
    if (statesCache.has(teamId)) {
        return statesCache.get(teamId)!;
    }
    const query = `
    query($teamId: String!) {
      team(id: $teamId) {
        states { nodes { id name type } }
      }
    }
  `;
    const result = await linearQuery(query, { teamId });
    const states = result.data?.team?.states?.nodes || [];
    statesCache.set(teamId, states);
    return states;
}

// 通過 stateName 找 stateId
async function findStateId(teamId: string, stateName: string) {
    const states = await getTeamStates(teamId);
    const found = states.find(
        (s: { name: string }) => s.name.toLowerCase() === stateName.toLowerCase()
    );
    return found?.id;
}

// ==================== MCP Server ====================

const server = new Server(
    { name: "party-linear", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

// 定義工具
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        // ===== 查詢工具 =====
        {
            name: "list_teams",
            description: "列出所有 teams",
            inputSchema: { type: "object", properties: {} },
        },
        {
            name: "list_projects",
            description: "列出 team 的所有 projects",
            inputSchema: {
                type: "object",
                properties: {
                    teamId: { type: "string", description: "Team ID（可選，預設第一個 team）" },
                },
            },
        },
        {
            name: "list_states",
            description: "列出 team 的所有 workflow states（用於 update_issue）",
            inputSchema: {
                type: "object",
                properties: {
                    teamId: { type: "string", description: "Team ID" },
                },
                required: ["teamId"],
            },
        },
        {
            name: "list_issues",
            description: "列出 issues，支援多種篩選",
            inputSchema: {
                type: "object",
                properties: {
                    projectId: { type: "string", description: "Project ID" },
                    state: { type: "string", description: "狀態名稱（如 Todo, In Progress, Done）" },
                    priority: { type: "number", description: "優先級 1-4" },
                    assigneeId: { type: "string", description: "負責人 ID" },
                    limit: { type: "number", description: "數量限制（預設 20）" },
                    cursor: { type: "string", description: "分頁游標" },
                },
            },
        },
        {
            name: "search_issues",
            description: "搜索 issues（更靈活的查詢）",
            inputSchema: {
                type: "object",
                properties: {
                    query: { type: "string", description: "搜索關鍵字" },
                    limit: { type: "number", description: "數量限制（預設 10）" },
                },
                required: ["query"],
            },
        },
        {
            name: "get_issue",
            description: "獲取單個 issue 詳情（支援 identifier 如 PAR-9）",
            inputSchema: {
                type: "object",
                properties: {
                    identifier: { type: "string", description: "Issue identifier（如 PAR-9）或 UUID" },
                },
                required: ["identifier"],
            },
        },
        // ===== 編輯工具 =====
        {
            name: "create_issue",
            description: "創建新 issue",
            inputSchema: {
                type: "object",
                properties: {
                    title: { type: "string", description: "標題" },
                    description: { type: "string", description: "描述（Markdown）" },
                    teamId: { type: "string", description: "Team ID" },
                    projectId: { type: "string", description: "Project ID" },
                    priority: { type: "number", description: "優先級 1-4" },
                    stateName: { type: "string", description: "初始狀態名稱（如 Backlog, Todo）" },
                    assigneeId: { type: "string", description: "負責人 ID" },
                    labelNames: { type: "array", items: { type: "string" }, description: "標籤名稱列表" },
                },
                required: ["title", "teamId"],
            },
        },
        {
            name: "update_issue",
            description: "更新 issue（支援一次更新多欄位）",
            inputSchema: {
                type: "object",
                properties: {
                    identifier: { type: "string", description: "Issue identifier（如 PAR-9）或 UUID" },
                    title: { type: "string", description: "新標題" },
                    description: { type: "string", description: "新描述" },
                    priority: { type: "number", description: "新優先級" },
                    stateName: { type: "string", description: "新狀態名稱（如 In Progress, Done）" },
                    assigneeId: { type: "string", description: "新負責人 ID" },
                },
                required: ["identifier"],
            },
        },
        {
            name: "add_comment",
            description: "對 issue 添加評論",
            inputSchema: {
                type: "object",
                properties: {
                    identifier: { type: "string", description: "Issue identifier（如 PAR-9）或 UUID" },
                    body: { type: "string", description: "評論內容（Markdown）" },
                },
                required: ["identifier", "body"],
            },
        },
        {
            name: "bulk_update",
            description: "批量更新多個 issues",
            inputSchema: {
                type: "object",
                properties: {
                    identifiers: { type: "array", items: { type: "string" }, description: "Issue identifiers 列表" },
                    priority: { type: "number", description: "新優先級" },
                    stateName: { type: "string", description: "新狀態名稱" },
                },
                required: ["identifiers"],
            },
        },
    ],
}));

// 處理工具調用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            // ===== 查詢工具 =====
            case "list_teams": {
                const query = `{ teams { nodes { id name key } } }`;
                const result = await linearQuery(query);
                return { content: [{ type: "text", text: JSON.stringify(result.data?.teams?.nodes || [], null, 2) }] };
            }

            case "list_projects": {
                let teamId = args?.teamId as string;
                if (!teamId) {
                    const teamsResult = await linearQuery(`{ teams { nodes { id } } }`);
                    teamId = teamsResult.data?.teams?.nodes?.[0]?.id;
                }
                const query = `
          query($teamId: String!) {
            team(id: $teamId) {
              projects { nodes { id name state } }
            }
          }
        `;
                const result = await linearQuery(query, { teamId });
                return { content: [{ type: "text", text: JSON.stringify(result.data?.team?.projects?.nodes || [], null, 2) }] };
            }

            case "list_states": {
                const states = await getTeamStates(args?.teamId as string);
                return { content: [{ type: "text", text: JSON.stringify(states, null, 2) }] };
            }

            case "list_issues": {
                const limit = (args?.limit as number) || 20;
                const filters: string[] = [];

                if (args?.projectId) filters.push(`project: { id: { eq: "${args.projectId}" } }`);
                if (args?.priority) filters.push(`priority: { eq: ${args.priority} }`);
                if (args?.assigneeId) filters.push(`assignee: { id: { eq: "${args.assigneeId}" } }`);

                const filterStr = filters.length ? `filter: { ${filters.join(", ")} }` : "";
                const afterStr = args?.cursor ? `, after: "${args.cursor}"` : "";

                const query = `
          query {
            issues(first: ${limit}${afterStr}, ${filterStr}, orderBy: createdAt) {
              nodes { id identifier title priority state { name } assignee { name } project { name } url }
              pageInfo { hasNextPage endCursor }
            }
          }
        `;
                const result = await linearQuery(query);

                // 如果有 state 篩選，在結果中過濾
                let issues = result.data?.issues?.nodes || [];
                if (args?.state) {
                    issues = issues.filter((i: { state?: { name: string } }) =>
                        i.state?.name?.toLowerCase() === (args.state as string).toLowerCase()
                    );
                }

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            issues,
                            pageInfo: result.data?.issues?.pageInfo,
                        }, null, 2),
                    }],
                };
            }

            case "search_issues": {
                const limit = (args?.limit as number) || 10;
                const query = `
          query($query: String!, $first: Int!) {
            issueSearch(query: $query, first: $first) {
              nodes { id identifier title priority state { name } assignee { name } url }
            }
          }
        `;
                const result = await linearQuery(query, { query: args?.query, first: limit });
                return { content: [{ type: "text", text: JSON.stringify(result.data?.issueSearch?.nodes || [], null, 2) }] };
            }

            case "get_issue": {
                const identifier = args?.identifier as string;
                let issue;

                if (isIdentifier(identifier)) {
                    issue = await getIssueByIdentifier(identifier);
                } else {
                    const query = `
            query($id: String!) {
              issue(id: $id) {
                id identifier title description priority 
                state { id name } 
                assignee { id name } 
                labels { nodes { id name } } 
                project { id name }
                comments { nodes { body user { name } createdAt } }
                url
              }
            }
          `;
                    const result = await linearQuery(query, { id: identifier });
                    issue = result.data?.issue;
                }

                if (!issue) {
                    return { content: [{ type: "text", text: `Issue not found: ${identifier}` }] };
                }
                return { content: [{ type: "text", text: JSON.stringify(issue, null, 2) }] };
            }

            // ===== 編輯工具 =====
            case "create_issue": {
                const input: Record<string, unknown> = {
                    title: args?.title,
                    description: args?.description || "",
                    teamId: args?.teamId,
                };

                if (args?.projectId) input.projectId = args.projectId;
                if (args?.priority) input.priority = args.priority;
                if (args?.assigneeId) input.assigneeId = args.assigneeId;

                // 處理 stateName → stateId
                if (args?.stateName && args?.teamId) {
                    const stateId = await findStateId(args.teamId as string, args.stateName as string);
                    if (stateId) input.stateId = stateId;
                }

                const mutation = `
          mutation($input: IssueCreateInput!) {
            issueCreate(input: $input) {
              success
              issue { id identifier title url }
            }
          }
        `;
                const result = await linearQuery(mutation, { input });
                return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
            }

            case "update_issue": {
                const identifier = args?.identifier as string;
                let issueId: string;
                let teamId: string | undefined;

                if (isIdentifier(identifier)) {
                    const issue = await getIssueByIdentifier(identifier);
                    if (!issue) {
                        return { content: [{ type: "text", text: `Issue not found: ${identifier}` }] };
                    }
                    issueId = issue.id;
                    // 需要 teamId 來查 stateId
                    const teamQuery = `query($id: String!) { issue(id: $id) { team { id } } }`;
                    const teamResult = await linearQuery(teamQuery, { id: issueId });
                    teamId = teamResult.data?.issue?.team?.id;
                } else {
                    issueId = identifier;
                }

                const input: Record<string, unknown> = {};
                if (args?.title) input.title = args.title;
                if (args?.description) input.description = args.description;
                if (args?.priority) input.priority = args.priority;
                if (args?.assigneeId) input.assigneeId = args.assigneeId;

                // 處理 stateName → stateId
                if (args?.stateName && teamId) {
                    const stateId = await findStateId(teamId, args.stateName as string);
                    if (stateId) input.stateId = stateId;
                }

                const mutation = `
          mutation($id: String!, $input: IssueUpdateInput!) {
            issueUpdate(id: $id, input: $input) {
              success
              issue { id identifier title state { name } priority url }
            }
          }
        `;
                const result = await linearQuery(mutation, { id: issueId, input });
                return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
            }

            case "add_comment": {
                const identifier = args?.identifier as string;
                let issueId: string;

                if (isIdentifier(identifier)) {
                    const issue = await getIssueByIdentifier(identifier);
                    if (!issue) {
                        return { content: [{ type: "text", text: `Issue not found: ${identifier}` }] };
                    }
                    issueId = issue.id;
                } else {
                    issueId = identifier;
                }

                const mutation = `
          mutation($input: CommentCreateInput!) {
            commentCreate(input: $input) {
              success
              comment { id body createdAt }
            }
          }
        `;
                const result = await linearQuery(mutation, {
                    input: { issueId, body: args?.body },
                });
                return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
            }

            case "bulk_update": {
                const identifiers = args?.identifiers as string[];
                const results: unknown[] = [];

                for (const identifier of identifiers) {
                    const updateResult = await server.request(
                        { method: "tools/call", params: { name: "update_issue", arguments: { identifier, ...args } } },
                        CallToolRequestSchema
                    );
                    results.push({ identifier, result: updateResult });
                }

                return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
        };
    }
});

// 啟動
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Party Linear MCP Server v1 running...");
}

main().catch(console.error);
