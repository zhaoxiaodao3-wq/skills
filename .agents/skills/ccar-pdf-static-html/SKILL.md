---
name: ccar-pdf-static-html
description: >-
  Generates classroom content analysis PDF static HTML from Web mock via
  gen-ccar-* scripts (A1/A2). Use when user asks for CCAR PDF HTML, gen:ccar:a2,
  Web-to-PDF static report, Review Batch R0–R12, Thymeleaf-free report HTML,
  or print regression on report @media print. Not for Vue page UI (use
  figma-long-page) nor generic Figma components.
---

# CCAR PDF 静态 HTML

**Web mock = 内容/逻辑 SSOT** · **Figma PDF 稿 = UI 样式 SSOT** · **Phase 1 = 纯静态 HTML（无 Thymeleaf）**

## 何时用 / 何时不用

| 用 | 不用 |
|----|------|
| `pnpm gen:ccar:a2` / A1 `gen:ccar` | 改 Vue 报告页交互（走 Web + Harness） |
| Review Batch 分批交付 PDF HTML | 单个 Figma 小组件 |
| 打印空白页 / 重叠 / 分页问题 | 从零设计 UI（`frontend-design`） |
| block 渲染器、TOC 对齐 mock | 后端 Playwright 服务参数（只读文档） |

## 与 figma-long-page 的分工

| 轨道 | Skill | 产物 |
|------|-------|------|
| **Web** | `figma-long-page` | Vue 组件 + mock + 浏览器预览 |
| **PDF** | **本 skill** | `src/report/report/A2/*.html` + 生成器 `.mts` |

mock / `TypeA2ContentBlock` 变更时：**先 Web 再 PDF**；禁止 PDF 单独改文案来源。

## Harness（强制）

1. 入口：`superpowers-harness-run` 或 `/harness`
2. 档位：PDF 新报告类型 → **全量**；纯打印 fix → **标准**
3. **先文档后实现**；改 `scripts/gen-ccar-*` / `src/report/` 前须 `READY_TO_DEV`
4. 模块路径：`docs/superpowers/{version}/ui-style/{模块名}/`

## 流水线

```text
P1–P3  需求 / spec / plan（全量）
  ↓
R0     生成器骨架 + TOC + CSS token（对齐 A1 画布 1200/75/1050/0.661417）
R1–R10 按章 Review Batch；每批暂停等用户「R(n) 通过」
R11    打印回归 → references/print-regression.md
R12    单测 + archive + harness:check
```

### A2 关键路径

| 项 | 路径 |
|----|------|
| 生成器 | `scripts/gen-ccar-a2-static-html.mts` |
| 生成 | `pnpm gen:ccar:a2` |
| 回归 | `pnpm check:ccar:a2` |
| 输出 | `src/report/report/A2/ClassroomContentAnalysisReport{A2,TocA}.html` |
| Mock | `classroom-content-analysis-a2.mock.ts` |
| 打印卡片布局 | 脚本 `PRINT_CARD_LAYOUT` 或 HTML `data-ccar-print-cards="html\|stack"` |

### PDF 特规（覆盖 Figma 稿）

- 无 Hero 评分卡、无 `.time-anchor`、无「查看详情」
- 时间戳纯文本
- 条件 flag 与 Web 一致（`a2-report-flags-context`）

## Block → 渲染器（A2）

| block type | render |
|------------|--------|
| `paragraph` | `renderParagraph` |
| `highlightTable` | `renderHighlightTable` |
| `a2DeficiencyGrid` | `renderA2DeficiencyGrid` |
| `table` | `renderTable` |
| `a2KnowledgeMatrix` | `renderA2KnowledgeMatrix` |
| `a2SectionTitle` | inline title |
| `a2NumberedPanel` | `renderA2NumberedPanel` |
| `a2CaseExampleGrid` | `renderA2CaseExampleGrid` |
| `a2BulletList` | `renderA2BulletList` |
| `a2BloomStats` | `renderA2BloomStats` |
| `a2ProblemChainStack` | `renderA2ProblemChainStack` |
| `a2ScoreSummary` | `renderA2ScoreSummary`（无 detail btn） |

新增 block：同时改 types、mock、Vue `ReportA2BlockRenderer`、生成器 `renderBlock`。

## 打印回归（R11）

**用户报打印问题时读** [references/print-regression.md](references/print-regression.md)。

快速检查：

```bash
pnpm gen:ccar:a2
pnpm check:ccar:a2
```

Chrome：`Ctrl+P` 或 DevTools → Emulate CSS media: **print**。

## 验收

- [ ] TOC id 与 mock 一致
- [ ] 无 `待实现` / `查看详情` / `time-anchor`
- [ ] 打印：无大面积重叠、无多余尾页（见 print-regression）
- [ ] `pnpm harness:check`

## 参考

- A1 生成器：`scripts/gen-ccar-static-html.mts`
- 打印重叠：`src/report/PDF_PRINT_OVERLAP_FIX.md`
- 用法：`scripts/gen-ccar-static-html.md`
- A2 归档示例：`docs/.../课堂教学内容分析A2/archive/A2-PDF-delivered.md`
