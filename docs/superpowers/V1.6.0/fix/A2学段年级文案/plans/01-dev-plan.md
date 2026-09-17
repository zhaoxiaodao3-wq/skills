# A2学段年级文案 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A2 板块四 meta 行统一展示「学段与年级：…」，去掉「年级→学年」强制替换；Web / H5 / muban PDF / 本仓 PDF 四处一致。

**Architecture:** 展示层规范化函数与 Thymeleaf metaDisp 同步翻转文案方向；入参仍兼容「学年/年级」，输出固定「学段与年级」。

**Tech Stack:** TypeScript mapper；H5 adapter；Thymeleaf HTML 模板。

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Skills（路由 · Mode A）：**  
本机 Windows 下 `router.mjs` CLI 因 `import.meta.url` 未进 main；已用 `loadGraph` + `annotatePlan` 等价跑通。  
Task 1–2 无命中 skill；Task 3 命中 `ccar-pdf-static-html`（0.70，人工复核：仅改 meta 文案/Thymeleaf，不强制完整 PDF 管线）；Task 4 命中 `superpowers-harness`（交付校验）。

## Global Constraints

- 只改展示文案与规范化，不改接口契约 / 无关样式
- 不整文件 Prettier 格式化 A2 HTML
- 外链路径：`E:\code\H5\...`、`E:\code\muban\analysis-service\...\lessonTemplates\A\A2\`

---

### Task 1: Web mapper + 单测 / mock / 注释

> **Skill:** 无需专项 skill · 置信度 n/a · 人工复核：纯文案规范化 + vitest

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.ts`
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.spec.ts`
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/a2-data/chapter-new-knowledge.ts`
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/types/classroom-content-analysis-a2-report.ts`

- [x] **Step 1:** 改 `normalizeCognitiveFitMetaLine`：返回前缀 `学段与年级：`；fallback 将「学段与学年」→「学段与年级」；更新函数注释
- [x] **Step 2:** 单测期望改为「学段与年级：…」
- [x] **Step 3:** mock `metaLine` 与类型注释示例同步
- [x] **Step 4:** 跑相关 vitest，确认通过

---

### Task 2: H5 adapter + 注释

> **Skill:** 无需专项 skill · 置信度 n/a · 人工复核：与 Web 同逻辑的 adapter 文案

**Files:**
- Modify: `E:\code\H5\src\pages\share\analysisTeachingA2\adapters\mapA2ToView.ts`
- Modify: `E:\code\H5\src\pages\share\analysisTeachingA2\components\blocks\A2NumberedPanel.vue`（注释）

- [x] **Step 1:** `normalizeCognitiveFitMetaLine` 与 Web 同逻辑
- [x] **Step 2:** 组件注释示例改为「学段与年级」

---

### Task 3: PDF 模板（muban + 本仓）

> **Skill:** `ccar-pdf-static-html` · 置信度 0.70 · 人工复核：仅改板块四 meta Thymeleaf/占位，不强制完整 gen/PDF 管线

**Files:**
- Modify: `E:\code\muban\analysis-service\src\main\resources\lessonTemplates\A\A2\ClassroomContentAnalysisReportA.html`
- Modify: `src/report/report/A2/ClassroomContentAnalysisReportA.html`

- [x] **Step 1:** muban：去掉/翻转「年级→学年」replace；`metaDisp` 前缀与静态占位改为「学段与年级」
- [x] **Step 2:** 本仓 HTML 同源修改
- [x] **Step 3:**（可选）预览抽查板块四 meta 行

---

### Task 4: 交付归档

> **Skill:** `superpowers-harness` · 置信度 0.70 · 风险 low（校验/归档）

- [x] **Step 1:** 勾选 spec §5 验收项
- [x] **Step 2:** 写 `archive/A2学段年级文案-delivered.md`（含一致性自检）
- [x] **Step 3:** `pnpm harness:check` + `pnpm harness:status -- --match "学段年级"`
