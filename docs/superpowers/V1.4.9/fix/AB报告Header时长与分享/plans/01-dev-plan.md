# AB 报告 Header 时长与分享 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Header 右侧换分享按钮；课堂时长无图标移至 meta 行末尾。

**Architecture:** 只改共用 `ReportHeroHeader.vue`，引入 `AppShareLink` ghost。

**Tech Stack:** Vue 3 + 已有 AppShareLink

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

### Task 1: 改 Header 布局

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportHeroHeader.vue`

- [x] **Step 1:** 引入 `AppShareLink`；标题行右侧替换为 `<AppShareLink variant="ghost" />`
- [x] **Step 2:** 删除时长图标与原 `cca-hero__duration` 块
- [x] **Step 3:** meta 行末追加 `| 课堂时长：{{ header.durationDisplay }}`
- [x] **Step 4:** 清理无用 styles / import

---

### Task 2: 归档

- [x] **Step 1:** 勾选 spec 验收项
- [x] **Step 2:** 写 `archive/AB报告Header时长与分享-delivered.md`
- [x] **Step 3:** `pnpm harness:check -- --match "AB报告Header时长与分享"`；不自动 commit

