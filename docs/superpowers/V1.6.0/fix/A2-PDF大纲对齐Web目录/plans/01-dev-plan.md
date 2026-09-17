# A2-PDF大纲对齐Web目录 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 通过治理 A2 PDF 模板标题层级，使网页 PDF 预览右侧大纲与 Web 报告目录一致，且点击可跳到正文对应位置。

**Architecture:** Playwright `setOutline(true)` 按 HTML heading 生成书签。只保留与 Web TOC 对应的 h2/h3（及 L3 的 h4）；其余面板/卡片标题降为非 heading；Hero 升为 h2；封面/目录页标题退出书签。muban 与本仓 `src/report/report/A2` 双份同步。不改前端预览页。

**Tech Stack:** Thymeleaf/静态 HTML（A2 lessonTemplates）；Chromium PDF outline

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 不改 `ai-teaching-analysis-report.vue` / `AppViewerAnalysis`
- 保留原 CSS class，仅改标签名（h* → div/p/span 或反之）
- Web TOC 权威列表以 A2 mapper / TocA 44 项为准
- 历史 PDF 需重生后验证

## File map

| 文件 | 职责 |
|------|------|
| `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/A/A2/ClassroomContentAnalysisReportA.html` | 正文 heading 治理（主） |
| `E:/code/muban/.../A/A2/ClassroomContentAnalysisReportTocA.html` | 「目录」退出书签 |
| `E:/code/muban/.../A/A2/coverA.html` | 封面标题退出书签 |
| `frontend/src/report/report/A2/*` 同源三文件 | 与 muban 同步 |

---

## Task 1: 正文 heading 降噪 + Hero / L3

> **Skill:** `ccar-pdf-static-html` · 置信度 0.70 · 风险 medium · 需人工确认  
> **人工复核：** 命中因 `ClassroomContentAnalysisReport*`。本次只改标题标签层级以治理 Chromium outline，**不**跑 `pnpm gen:ccar:a2` 全量重建。改 muban 与本仓 HTML 同源即可。

**Files:**
- Modify: muban + frontend `ClassroomContentAnalysisReportA.html`

- [x] **Step 1:** 将 Hero `课堂基本信息与评分等级总览` 从 `<p class="ccar-a2-hero__title">` 改为 `<h2 class="ccar-a2-hero__title">`（或同等进书签的章级标题）。

- [x] **Step 2:** L3 小节 `3.4.1`/`3.4.2`/`3.4.3`/`3.6.1`/`3.6.2`：若需嵌套贴近 Web，将标签改为 `h4.ccar-subsection-title`（父级 `3.4`/`3.6` 保持 `h3`）。

- [x] **Step 3:** Batch：所有**非 TOC** 的 `h4`（deficiency/case/bloom/numbered-panel/knowledge-matrix/bullet-list 等标题）改为 `div`（或 `p`），**保留原 class 与 th 属性**。

- [x] **Step 4:** 确认章 `h2.ccar-section-title`、其余小节 `h3.ccar-subsection-title` 文案仍与 Web TOC 一致。

## Task 2: 封面与目录页退出书签噪声

> **Skill:** `ccar-pdf-static-html` · 置信度 0.70 · 风险 medium · 需人工确认（同 Task 1 复核结论）。

**Files:**
- Modify: muban + frontend `coverA.html`、`ClassroomContentAnalysisReportTocA.html`

- [x] **Step 1:** `coverA.html`：`h1.ccar-cover-page__title` → `div`/`p`，保留 class。

- [x] **Step 2:** `TocA.html`：`h2.ccar-toc-page__title`「目录」→ `div`/`p`，保留 class 与 `id="menu"`（若打印锚点需要可保留 id 在非 heading 上）。

## Task 3: 双仓同步核对

> **Skill:** 无需 skill · CLI 无独立命中；人工 diff / 标题统计即可。

- [x] **Step 1:** 确认 muban `lessonTemplates/A/A2` 与 `frontend/src/report/report/A2` 三文件标题策略一致（可用 diff / 标题标签统计）。

- [x] **Step 2:** 列出改后仍为 heading 的文案清单，与 Web TOC 44 项对照，无多余、无缺失（含 Hero；无封面名/「目录」/面板 h4）。

## Task 4: 交付说明

> **Skill:** 无需 skill。

- [x] **Step 1:** 注明须**重生** case_basic_info PDF 后，在预览页点大纲验证滚动。

- [x] **Step 2:** `pnpm harness:check` + archive（实现完成后由控制器执行）。
