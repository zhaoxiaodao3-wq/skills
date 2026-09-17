# PDF大纲同页滚动贴顶 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 PDF 预览大纲同页点子节无滚动、以及目标未贴视口顶部的问题。

**Architecture:** 在 `AppViewerAnalysis` 中扩展大纲跳转：解析 outline `dest` 得到 page + 页内 Y；无 Y 时用已抽取 `pdfPage.lines` 按标题匹配；滚动时用相对 `pdfViewer` 的视觉坐标，使目标靠近视口顶部。同页也必须执行 scrollTo。

**Tech Stack:** Vue 3；pdf.js Outline / Destination；现有 page.lines 文本抽取

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 只改 `src/components/AppViewerAnalysis/AppViewerAnalysis.vue`
- 不改 muban / report 模板
- 仍以 `getOutline()` 为大纲数据源
- 兼容 `ScaleContainer` 缩放

## File map

| 文件 | 职责 |
|------|------|
| `AppViewerAnalysis.vue` | dest/Y 解析、标题回退、贴顶滚动；修 menu 跳转 |

---

## Task 1: 统一「滚到页内 Y」能力

> **Skill:** 无需 skill · CLI 无前端组件命中；纯 Vue + DOM 滚动。

**Files:**
- Modify: `src/components/AppViewerAnalysis/AppViewerAnalysis.vue`

- [x] **Step 1:** 新增 `jumpToPageOffset(pageNumber, offsetYInPagePx?: number | null)`：以 `page-${n}` 为基准，将目标点滚到 `pdfViewer` 视口顶部（padding 约 8～16px）。无 offset 时行为等同滚到页顶。

- [x] **Step 2:** 换算须兼容 scale（推荐：`getBoundingClientRect` 算 page 相对 viewer 的 top，再加 `offsetY * (pageRect.height / pdfPage.height)` 或等价公式）。

- [x] **Step 3:** 将现有 `jumpPage` 改为调用 `jumpToPageOffset(pageNumber, null)`，避免两套滚动逻辑。

## Task 2: 大纲跳转解析 dest Y + 标题回退

> **Skill:** 无需 skill · 同上。

**Files:**
- Modify: 同上

- [x] **Step 1:** 在 `jumpOutlinePageNumber` 中解析 dest（string 先 `getDestination`）：取 pageIndex；若数组含 XYZ/`XYZ` name，读取 top 并换算到渲染坐标系（注意 PDF Y 向上 vs lines 的 y 向下）。

- [x] **Step 2:** dest 无可用 Y 时：在目标页（或全页）`lines` 中匹配 `outlineItem.title`（精确优先，其次 includes），取该行 `y`；多命中取更合理的一条（同页内即可）。

- [x] **Step 3:** 调用 `jumpToPageOffset(pageNumber, y)`；**即使与当前页相同也调用**。

- [x] **Step 4:** dest 解析 try/catch，失败走标题回退，避免静默无反应。

## Task 3: menu 跳转一致性 + 自测说明

> **Skill:** 实现步骤无需 skill；交付 archive 由 harness-run 控制器执行（CLI 命中 harness 为元流程，不阻塞）。

**Files:**
- Modify: 同上

- [x] **Step 1:** 修复 `jumpMenuItemPageNumber`：`menuItem.page` 时改为真正跳转（带可选标题 Y），禁止只 `return page`。

- [x] **Step 2:** 手工验收清单写入注释或交付时核对：同屏点 1.2 有滚动且贴顶；跨页贴顶。

- [x] **Step 3:** harness archive（实现完成后由控制器执行）。
