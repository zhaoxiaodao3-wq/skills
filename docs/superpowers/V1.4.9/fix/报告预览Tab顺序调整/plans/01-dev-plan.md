# 报告预览 Tab 顺序调整 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A/B 报告预览子 Tab 顺序改为：教学分析 → 课堂实录 → 课堂分析。

**Architecture:** 仅调整 `buildReportPreviewMenu` 中 `children` 组装顺序。

**Tech Stack:** Vue 3

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

### Task 1: 调整顺序

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis.vue`（`buildReportPreviewMenu`）

- [x] **Step 1:** A/B 时先 push「教学分析报告」，再 push「课堂实录报告」「课堂分析报告」
- [x] **Step 2:** G 仍只有实录 + 分析两项，顺序不变

---

### Task 2: 归档

- [x] **Step 1:** 勾选 `specs/01-dev-spec.md` 验收项
- [x] **Step 2:** 写 `archive/报告预览Tab顺序调整-delivered.md`
- [x] **Step 3:** `pnpm harness:check -- --match "报告预览Tab顺序调整"`；确认 `DELIVERED`；不自动 commit

