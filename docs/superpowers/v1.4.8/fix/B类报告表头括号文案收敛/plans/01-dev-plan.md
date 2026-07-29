# B类报告表头括号文案收敛 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 去掉 B 类 3.1 / 7.1 / 7.2 表头括号说明，与 2.1 同类文案规则对齐。

**Architecture:** 纯字符串替换 label / `<th>`；mapper → mock → HTML → muban。

**Tech Stack:** TS mapper、Thymeleaf/静态 HTML

---

### Task 1: mapper + mock

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b.mapper.ts`
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/type-b-chapters.ts`

- [x] **Step 1:** `示例（时间戳）` → `示例`
- [x] **Step 2:** `依据（时间戳+原文）` → `依据`（7.1、7.2 各一处）

### Task 2: 本仓 HTML + muban

**Files:**
- Modify: `src/report/ClassroomContentAnalysisReportB.html`
- Modify: `src/report/report/ClassroomContentAnalysisReportB.html`
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/template-thymeleaf/ClassroomContentAnalysisReportB.html`
- Modify: `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/B/ClassroomContentAnalysisReportB.html`（仅 7.1/7.2）

- [x] **Step 1:** 全文替换上述表头字符串（勿改单元格正文）
- [x] **Step 2:** `src/` 内检索确认无残留旧表头

### Task 3: 交付归档

- [x] **Step 1:** 勾选 spec；写 archive；`pnpm harness:check` / `harness:status`
