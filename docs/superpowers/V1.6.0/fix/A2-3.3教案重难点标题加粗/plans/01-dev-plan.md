# A2 · 3.3 教案重难点参考标题加粗 Implementation Plan

> **For agentic workers:** 按 Task 推进；执行方式以 P3（Inline / SDD）为准。

**Goal:** 3.3「教案重难点参考信息」两条从接口整串拆出 `leadLabel`（加粗）+ `leadContent`，与 mock / spike G08 一致。

**Architecture:** 在 `classroom-content-analysis-a2.mapper.ts` 新增 `parsePlanReferenceItems`（固定前缀正则 + 下标兜底），替换 `mapNumberedFromStrings('教案重难点参考信息', kp?.planReference)`；组件样式已具备，不改 Vue。

**Tech Stack:** Vue3 + TS；既有 mapper 单测（vitest）。

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 只改 3.3 教案重难点参考拆条；**维度三不改**
- 不改 `ReportA2NumberedPanel` 样式（`__lead-label` 已加粗）
- 固定前缀：`教案中标注的教学重点：` / `教案中标注的教学难点：`（支持 `：` / `:`）
- 本期交付以 Web 为准；不顺手改 H5

---

## Task 1: 单测先行 — parsePlanReferenceItems

> **Skill:** （无）· 置信度 — · router Mode A 对本 Task 无达标 skill；人工复核：纯 mapper 单测，不启 UI/Figma skill  
> **理由:** 仅 vitest 断言拆条结果

- [x] 在 `classroom-content-analysis-a2.mapper.spec.ts` 增加用例：
  - 标准两行（中文冒号）→ index `01`/`02` + 对应 leadLabel/leadContent
  - 英文冒号 `:` 可拆
  - 无前缀两行 → 下标 0/1 回填固定 leadLabel，全文为 leadContent
  - `null` / `[]` → 空 items（或与现 numbered 空态一致）
- [x] 先跑测确认失败（函数尚未导出）

## Task 2: 实现解析并接线 mapNewKnowledgeChapter

> **Skill:** （无）· 置信度 — · 同上；人工复核：正则 + mapper 接线，无样式/动效  
> **理由:** 实现 `parsePlanReferenceItems` 并替换 `mapNumberedFromStrings` 调用

- [x] 在 `classroom-content-analysis-a2.mapper.ts` 实现并 `export function parsePlanReferenceItems`
- [x] 正则按 spec（可选序号 + 固定前缀 + 冒号）
- [x] `mapNewKnowledgeChapter`：用解析结果组装 `a2NumberedPanel`（title=`教案重难点参考信息`），**不再**对该块调用 `mapNumberedFromStrings`
- [x] 跑单测通过

## Task 3: 交付归档

> **Skill:** superpowers-harness · 置信度 0.85 · 人工标注（交付门禁）  
> **理由:** archive + harness:check / status 闭环

- [x] 勾选 spec 验收项
- [x] 写 `archive/A2-3.3教案重难点标题加粗-delivered.md`（含一致性自检；还原度写不适用）
- [x] `pnpm harness:check` + `pnpm harness:status -- --match "A2-3.3教案重难点"`
