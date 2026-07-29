# B类5.5综合判定字段收敛 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** B 类 5.5「综合判定」卡片仅展示 `comprehensiveJudgment` 数组，不再拼装其它统计/原因字段。

**Architecture:** 收敛 `buildObjectiveCalcItems` 单一数据源；不改表格与 `sectionSummary` 大节总结。

**Tech Stack:** TypeScript mapper

---

### Task 1: 收敛 buildObjectiveCalcItems

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b.mapper.ts`（`buildObjectiveCalcItems`）

- [x] **Step 1:** 删除对 `totalObjectives` / `achievedCount` / `notAchievedCount` / `reasonAnalysis` 的 `items.push`
- [x] **Step 2:** 仅用 `(objective.comprehensiveJudgment ?? []).filter(Boolean)`；无有效项则 `return []`；有则保持 title「综合判定」、`listStyle: 'bullet'`

### Task 2: 交付归档

- [x] **Step 1:** 勾选 spec；写 archive；跑 `pnpm harness:check` / `harness:status`
