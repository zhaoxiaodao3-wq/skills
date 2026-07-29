# B类报告2.1表头文案 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 将 B 类报告 2.1 表格表头「对应内容摘录（时间戳）」改为「对应内容摘录」，并同步页面数据源、mock 与报告 HTML。

**Architecture:** 纯文案替换，无逻辑变更。主渲染路径为 mapper 的 column label；mock 与静态/ Thymeleaf HTML 中的表头同源，需一并替换以免预览不一致。

**Tech Stack:** Vue/TS（mapper + mock）、Thymeleaf/静态 HTML 报告模板

---

### Task 1: 替换 mapper 与 mock 列 label

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b.mapper.ts`（约 L391）
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/type-b-chapters.ts`（约 L19）

- [x] **Step 1:** 将两处 `label: '对应内容摘录（时间戳）'` 改为 `label: '对应内容摘录'`
- [x] **Step 2:** 确认仅改 `evidence` 列 label，未动 rows / 单元格映射

### Task 2: 替换 B 报告 HTML 表头

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/template-thymeleaf/ClassroomContentAnalysisReportB.html`
- Modify: `src/report/ClassroomContentAnalysisReportB.html`
- Modify: `src/report/report/ClassroomContentAnalysisReportB.html`

- [x] **Step 1:** 将上述文件中表头 `<th>对应内容摘录（时间戳）</th>`（或同串出现处）改为「对应内容摘录」
- [x] **Step 2:** 勿改 tbody 单元格内含 `（00:xx:xx-...）` 的摘录正文

### Task 3: 检索验收与交付归档

- [x] **Step 1:** 在 `src/` 内检索确认无残留 `对应内容摘录（时间戳）`
- [x] **Step 2:** 勾选 `specs/01-dev-spec.md` 验收项；写 `archive/B类报告2.1表头文案-delivered.md`；跑 `pnpm harness:check` 与 `pnpm harness:status`
