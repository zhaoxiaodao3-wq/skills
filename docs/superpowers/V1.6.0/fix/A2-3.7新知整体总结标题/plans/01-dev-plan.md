# A2-3.7新知整体总结标题 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 A2 报告 3.7 标题与目录从「新知讲授整体总结」改为「新知整体总结」，覆盖 Web、H5、PDF。

**Architecture:** 标题来源分两路：Web/H5 由 A2 mapper 的 `nk-3-7.title` 驱动（TOC 由 `buildTypeA2Toc` 跟随）；PDF 正文与 TOC HTML 为硬编码。四文件同步替换同一字面量即可，不改数据结构。

**Tech Stack:** Vue 3 + TypeScript mapper；Thymeleaf/静态 HTML（A2 PDF 模板）

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 新文案必须完整为 `3.7 新知整体总结`（保留序号前缀）
- 禁止改 B2「3.7 新知整体分析」
- 禁止改章标题「三、新知讲授/探究」
- 禁止改 3.7 正文内容与接口字段

## File map

| 文件 | 职责 |
|------|------|
| `classroom-content-analysis-a2.mapper.ts` | Web/H5 真数据 3.7 标题 |
| `chapter-new-knowledge.ts` | Web mock 3.7 标题（与真数据一致） |
| `ClassroomContentAnalysisReportA.html` | PDF 正文 3.7 `<h3>` |
| `ClassroomContentAnalysisReportTocA.html` | PDF 目录 3.7 label |
| `classroom-content-analysis-a2.mapper.spec.ts` | 断言 mapper 产出新标题 |

---

## Task 1: 测试断言 3.7 新标题

> **Skill:** 无需 skill · 置信度 N/A · CLI Mode A 无命中；纯 Vitest 文案断言。

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.spec.ts`

- [x] **Step 1:** 在现有 spec 增加一条用例：调用已导出的 `mapA2ReportToClassroomContentPayload`（或等价映射入口），在 `newKnowledgeTeaching` 章节找到 `id === 'nk-3-7'`，断言 `title === '3.7 新知整体总结'`。

- [x] **Step 2:** 跑该测试，确认当前因旧文案失败（或若入口需要完整 VO，则用最小 `overallSummary` 桩数据）。

- [x] **Step 3:** 先不改生产 mapper（本 Task 只落测试）。

## Task 2: Batch: 四处字面量替换

> **Skill:** `ccar-pdf-static-html` · 置信度 0.70 · 风险 medium · 需人工确认  
> **人工复核：** 命中因 PDF 文件名 `ClassroomContentAnalysisReport*`。本次只改已落盘 HTML/mapper/mock 的标题字面量，**不**跑 `pnpm gen:ccar:a2` 全量重建，避免无关 diff。生成器从 subsection.title 读标题，mock 改完后日后 gen 会一致。Web 侧不启用 `figma-long-page`。

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.ts`
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/a2-data/chapter-new-knowledge.ts`
- Modify: `src/report/report/A2/ClassroomContentAnalysisReportA.html`
- Modify: `src/report/report/A2/ClassroomContentAnalysisReportTocA.html`

- [x] **Step 1:** 将上述文件中的 `3.7 新知讲授整体总结` 全部替换为 `3.7 新知整体总结`（仅该完整字符串）。

- [x] **Step 2:** 全仓搜索确认无残留 `新知讲授整体总结`；B2 `3.7 新知整体分析` 仍在。

- [x] **Step 3:** 重跑 Task 1 测试，确认通过。

## Task 3: 交付前核对

> **Skill:** 无需 skill · 置信度 N/A · CLI Mode A 无命中。

- [x] **Step 1:** 确认 Web 目录由 `buildTypeA2Toc` 使用 `sub.title`，无需单独改 TOC builder。

- [x] **Step 2:** `pnpm harness:check`；按 harness 写 archive（本 Task 在实现完成后由控制器执行，不在开发中途报 DELIVERED）。
