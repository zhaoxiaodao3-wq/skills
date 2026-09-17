# A2表格列间隙 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A2 PDF 正文表增加可统一调节的列间视觉间隙；屏显与打印共用 `--ccar-table-cell-pad-x`。

**Architecture:** 在 `:root` 声明变量（默认 `var(--ccar-space-md)`），`.ccar-table` 与亮点表单元格左右 padding 引用该变量；print 依赖已有 space 缩放。同步 gen 脚本 CSS 防覆盖。

**Tech Stack:** 静态 HTML/CSS；`gen-ccar-a2-static-html.mts` 模板字符串。

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Skills（路由 · Mode A）：**  
`ccar-pdf-static-html` 命中 PDF 模板路径（置信度 0.70）；本任务仅为 CSS token/padding，**人工复核：可读 skill 作约束参考，不强制完整 PDF 管线流程**。交付步用 harness。

## Global Constraints

- 仅 PDF：`ClassroomContentAnalysisReportA.html` + `gen-ccar-a2-static-html.mts`
- 不改 Web、不改 colgroup、保持 `border-collapse: collapse`
- print 不另写死左右 px（除非覆盖同名变量）

---

### Task 1: HTML 模板变量 + 表样式

> **Skill:** `ccar-pdf-static-html`（可选参考）· 置信度 0.70 · 人工复核：仅改 CSS，不走完整 gen/PDF 管线也可交付；改前可读 skill 中「勿破坏 print 约定」

**Files:**
- Modify: `src/report/report/A2/ClassroomContentAnalysisReportA.html`

- [x] **Step 1:** `:root` 增加 `--ccar-table-cell-pad-x: var(--ccar-space-md);`
- [x] **Step 2:** `.ccar-table th, td` 改为 `padding: var(--ccar-space-lg) var(--ccar-table-cell-pad-x);`
- [x] **Step 3:** `.ccar-a2-highlight-table th/td` 同样改写
- [x] **Step 4:** 确认 `@media print` 无覆盖表格单元格左右 padding 为 `0` 的规则

---

### Task 2: 同步 gen 脚本

> **Skill:** 无需专项 skill · 置信度 n/a

**Batch:** 与 Task 1 同形（同源 CSS）

**Files:**
- Modify: `scripts/gen-ccar-a2-static-html.mts`

- [x] **Step 1:** `:root` / tokens 区增加同名变量
- [x] **Step 2:** `.ccar-table` 与 highlight 表 padding 与 HTML 一致
- [x] **Step 3:** 全文搜索 `padding: var(--ccar-space-lg) 0` 在表相关选择器上是否漏改

---

### Task 3: 预览抽查 + 交付

> **Skill:** `superpowers-harness` · 置信度 0.70 · 风险 low（校验/归档）

- [x] **Step 1:**（可选）`node scripts/preview-a2-thymeleaf-pdf.mjs --mode=full` 抽查长文案表
- [x] **Step 2:** 勾选 spec §5；写 `archive/A2表格列间隙-delivered.md`（一致性自检；还原度不适用）
- [x] **Step 3:** `pnpm harness:check` + `pnpm harness:status -- --match "A2表格列间隙"`
