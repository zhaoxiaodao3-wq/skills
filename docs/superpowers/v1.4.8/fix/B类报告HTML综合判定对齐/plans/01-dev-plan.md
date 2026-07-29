# B类报告HTML综合判定对齐 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 使 B 类报告 HTML 模板 5.5「综合判定」与网页一致，仅渲染 `comprehensiveJudgment`。

**Architecture:** 删除 Thymeleaf 综合判定卡片中多余 `th:if` 列表项；静态示例稿删除拼装假数据，保留占位或空列表结构。

**Tech Stack:** Thymeleaf HTML

---

### Task 1: 收敛带 th: 的正式模板

**Files:**
- Modify: `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/B/ClassroomContentAnalysisReportB.html`
- Modify: `src/report/ClassroomContentAnalysisReportB.html`

- [x] **Step 1:** 在 5.5「综合判定」`<ul>` 中删除 `totalObjectives` / `achievedCount` / `notAchievedCount` / `reasonAnalysis` 四个 `<li th:if=...>`
- [x] **Step 2:** 保留 `<li th:each="line : ${obj?.comprehensiveJudgment ?: {}}" ...>`

### Task 2: 收敛静态示例 HTML

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/template-thymeleaf/ClassroomContentAnalysisReportB.html`
- Modify: `src/report/report/ClassroomContentAnalysisReportB.html`

- [x] **Step 1:** 将综合判定 `<ul>` 中「预设教学目标总数 / 达成目标数 / 未达成目标数 / 原因分析」四条替换为一条占位示例（或留空结构），避免再展示拼装字段文案

### Task 3: 交付归档

- [x] **Step 1:** 勾选 spec；写 archive；跑 `pnpm harness:check` / `harness:status`
