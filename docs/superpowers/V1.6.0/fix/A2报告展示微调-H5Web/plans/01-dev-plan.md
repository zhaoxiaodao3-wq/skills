# A2 报告展示微调（H5 + Web）Implementation Plan

> **For agentic workers:** 按 Task 推进；执行方式以 P3（Inline / SDD）为准。

**Goal:** 按 spec 完成 H5 文案/结构微调 + H5/Web 总分小计去权重。

**Architecture:** H5 优先改专用组件文案与 `mapDimCards` 专用 case；Web 仅改 `mapScoreSummaryTailRows`。

**Tech Stack:** H5 Vue3；Web Vue3 + vitest。

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Skills（路由）：** 纯展示映射/文案；无 Figma/ECharts 专项。实现遵循仓库 Vue 惯例。

## Global Constraints

- 不改共用 `A2FieldCard` 布局；3.4.3 / 5.2 用专用 case
- 不回退 mock；缺字段仍空态
- Web 范围仅第 6 项（及测试/mock 同步）

---

## Task 1: H5 overview / 1.2 文案

- [x] `A2OverviewPanel.vue`：去掉课题行；去掉总评分 / 评分等级区块
- [x] `A2HighlightTable.vue`：「依据（原文）」→「依据」

## Task 2: H5 adapter 字段结构

- [x] `mapA2ToView.ts`：`method343` 专用 case（无 badge；观察内容 → 评价 → 理由）
- [x] `summary51` label「观察内容（从音转文提取）」；新增 `summary52` case 同 label
- [x] `planVsActual`：「课堂实际（音转文）」
- [x] `mapScoreSummaryTail`：总分小计不加权重后缀

## Task 3: Web 总分小计

- [x] `classroom-content-analysis-a2.mapper.ts` → `mapScoreSummaryTailRows` 去掉权重拼接
- [x] 同步相关 `.spec.ts` / mock 期望值

## Task 4: 校验与交付

- [x] H5/Web 冒烟核对清单 6 项
- [x] `pnpm harness:status -- --match "A2报告展示微调"` + `pnpm harness:check`
- [x] 写 `archive/*-delivered.md`（含一致性自检）
