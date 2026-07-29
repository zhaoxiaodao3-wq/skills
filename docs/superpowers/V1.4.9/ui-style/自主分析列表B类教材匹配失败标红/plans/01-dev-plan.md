# 自主分析列表 B 类教材匹配状态标红 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AI 自主分析列表中，B 类且 `textbookAsrMatchStatus===3` 时「报告类型」文案标红。

**Architecture:** 仅改 `index.vue`：条件判断 + class；展示为 `-` 时不标红。

**Tech Stack:** Vue 3 + Element Plus 现有列表页

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

### Task 1: 报告类型列标红

- [x] **Step 1:** 增加 `isReportTypeHighlightRed(row)`
- [x] **Step 2:** 「报告类型」列绑定 `report-type--danger`
- [x] **Step 3:** scoped 样式 `color: #f53f3f`
- [x] **Step 4:** 自检

---

### Task 2: 归档

- [x] **Step 1:** 勾选 spec 验收项
- [x] **Step 2:** 写 delivered 归档
- [x] **Step 3:** `pnpm harness:check` + status
