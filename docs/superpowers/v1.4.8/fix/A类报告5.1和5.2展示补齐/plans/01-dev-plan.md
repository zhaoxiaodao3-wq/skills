# A类报告5.1和5.2展示补齐 · 开发计划

> **For agentic workers:** 按 Task 顺序执行。

**Goal:** A/B 5.1 补齐核心问题行并对齐空值；5.2 三行改为 has+详情拼接，空值原样无占位。  
**Architecture:** 共用 `report-display-format` 做拼接；A/B mapper 对齐行与空值。  
**Tech Stack:** TypeScript  
**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

## Task 1：公共拼接与 5.2

**文件：** `src/pages/analysis-web/ai-teaching-diagnosis/utils/report-display-format.ts`

1. 新增 helper（或内联）：
   - `joinParts(parts, sep)`：过滤 trim 后空串，用给定分隔符合并
   - `formatHasDetail(has, detail, sep)`：`joinParts([has, detail], sep)`
2. 改 `buildNewKnowledgeTableRows`：
   - 问题链：`formatHasDetail(hasQuestionChain, questionChainDetail, '。')`
   - 案例：`formatHasDetail(hasCases, caseDetails, '，')`
   - 探究：`formatHasDetail(hasInquiryActivity, activityDetails, '，')`
   - 其余单字段：`data[key]?.trim() ?? ''`（**不用** `'无'`）
3. 可选：导出 `formatIntroCoreQuestion(has, content)` 供 A/B：
   - 有 content：`${has || ''}，${content}` 或 `是`+content 时与现 B 一致收敛为「有什么拼什么、无占位」
   - 皆空：`''`

若有针对该 util 的单测，按新契约更新。

## Task 2：A mapper 5.1

**文件：** `classroom-content-analysis-a.mapper.ts`

1. 在「实际使用的导入方式」与「导入与新课的衔接」之间插入：
   `{ item: '是否提出核心问题', content: formatIntroCoreQuestion(...) }`
2. 所有行用「空串」语义（`text` 若默认 `-`，本表需改用 trim 原样或 `text(v, '')`）
3. **删除** `.filter(row => row.content !== '-')`
4. `improvementSuggestion` 不再传 fallback `'无'`

## Task 3：B mapper 5.1

**文件：** `classroom-content-analysis-b.mapper.ts`

1. `formatIntroCoreQuestion` 对齐「无占位」
2. 删除 `.filter(row => row.content !== '-')`
3. 改进建议等 fallback `'无'` → 空串
4. 5.2 已吃共用 util，确认即可

## Task 4：Mock

**文件：** `type-a-chapters.ts`（及 B mock 若缺行）

- 5.1 表格补「是否提出核心问题」示例行（对齐 HTML）

## Task 5：门禁与交付

1. 改码前 `pnpm harness:check`
2. 勾选 spec；写 `archive/A类报告5.1和5.2展示补齐-delivered.md`
3. 再跑 `pnpm harness:check` / `pnpm harness:status`
