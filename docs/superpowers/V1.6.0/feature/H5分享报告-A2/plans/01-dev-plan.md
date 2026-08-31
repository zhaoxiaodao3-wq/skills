# H5分享报告-A2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 H5 落地 A2 分享页（registry + 新 Template + Web 对齐 mock），按 Figma 细粒度还原样式，每块审查通过后再下一块。

**Architecture:** Family `a` + Template `analysisTeachingA2`；`useShareReportSession` + mock/adapter 单入口；UI 拆 chrome/blocks/sections；Figma MCP 按块取上下文。

**Tech Stack:** Vue 3 + Vite + H5 现有 share 架构；Figma MCP；可选 `@miray/icons`

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 实现仓仅 `E:\code\H5\`（文档在 frontend Harness 模块）
- 每个 **UI Task** 结束后必须 **暂停：用户样式审查**；未通过不得开下一 UI Task
- 数据以 Web A2 mock 为准；Figma 只管样式
- 分享文案与 a1 同源；不改其他 variant 行为
- UI Task 开始前对该块调用 Figma `get_design_context`（或等价截图）

---

### Task 0: Registry + 空壳页（非 UI 审查）

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] 架构登记

**Files:** `registry.ts`、`routes.ts`、`analysisTeachingA2/index.vue`

- [x] **Step 1:** 登记 `a2` + `TEMPLATE_LOADERS.analysisTeachingA2`
- [x] **Step 2:** 空页挂 `useShareReportSession` + 开发态强制 mock 开关
- [x] **Step 3:** 冒烟 `/analysis-teaching-a2` 可打开（可无正文）

---

### Task 1: types + mock + adapter（非 UI 审查）

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] 数据对齐 Web A2

**Files:** `types/`、`mock/`、`adapters/mapA2ToView.ts`、`useA2ReportPage.ts`

- [x] **Step 1:** 对齐 Web `TypeA2*` 精简类型 + flags
- [x] **Step 2:** 迁入/精简 Web A2 mock（一～十可渲染所需字段）
- [x] **Step 3:** `mapA2ToView` 唯一出口；index 只吃 ViewModel

---

### Task 2: UI · Cover 蓝头+元信息

> **Skill:** figma-design-to-code · 置信度 high · [人工复核] 每块必 MCP
> **审查门禁：** 完成后暂停，用户确认「Cover 通过」

**Figma:** `8785:57155`（Cover 头）

- [x] **Step 1:** MCP 取 design context
- [x] **Step 2:** 实现 `A2CoverHero.vue`（渐变/Badge/标题/元信息卡）
- [x] **Step 3:** 对照审查清单 → **暂停**（Cover 通过）

---

### Task 3: UI · 目录 TOC

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁：** 「TOC 通过」

**Figma:** `8785:57197`

- [x] **Step 1:** MCP
- [x] **Step 2:** `A2Toc.vue` + 锚点滚动
- [x] **Step 3:** **暂停审查**（TOC 通过）

---

### Task 4: UI · 章/小节 chrome

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁：** 「chrome 通过」

- [x] **Step 1:** MCP 取样一处章标题+小节标题
- [x] **Step 2:** `A2SectionTitle` / `A2SubSectionTitle`（及依据行若有）
- [x] **Step 3:** **暂停审查**（chrome 通过）

---

### Task 4b: UI · 课堂基本信息与评分等级总览（补漏）

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁：** 「总览通过」

**Figma:** `8785:57333`

- [x] **Step 1:** MCP
- [x] **Step 2:** `A2OverviewPanel` + mock overview + `@miray/icons`
- [x] **Step 3:** **暂停审查**（总览通过）

---

### Task 4c: 空值兜底 `displayValue`（需求补充）

> **Skill:** 无需 skill · 置信度 n/a · [人工复核]
> **门禁：** 用户确认空态规则后执行；可与下一 UI Task 前连续完成（非样式审查）

- [x] **Step 1:** 新增 `utils/displayValue.ts`（空/空白 → `--`）
- [x] **Step 2:** Cover / Overview（含评分）全部走 `displayValue` + TEMP 空态开关
- [x] **Step 3:** plan/spec 要求后续 blocks 强制使用同一 helper

---

### Task 5: UI · Block paragraph

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁**

- [x] MCP → `A2Paragraph`
- [x] **暂停审查**（paragraph 通过）

---

### Task 6: UI · Block 亮点表 highlightTable

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁**

- [x] MCP → `A2HighlightTable`
- [x] **暂停审查**（亮点表通过）

---

### Task 7: UI · Block 不足格 deficiencyGrid

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁**

- [x] MCP → `A2DeficiencyGrid`
- [x] **暂停审查**（不足表通过）

---

### Task 8: UI · Block 编号面板 numberedPanel

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁**
> **顺序更正（2026-08-31）：** 编号面板属 **章三**，不在 1.3 之后立刻审。章一完成后按 Figma 滚到 **章二 FieldCard**；本 Task 挂起至章三再审。

- [x] MCP → `A2NumberedPanel`（cards `8785:57875` + framed `8785:57844`）已实现
- [ ] **暂停审查**（编号面板通过）— **待章三**

---

### Task 8b: UI · 章二 FieldCard（导入分析卡）← **当前应做**

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁**
> Figma：`8785:57449` / `8785:57473`（竖排 FieldCard + StatusBadge）

- [x] MCP → `A2FieldCard` + `A2ImportPreview`（2.1～2.7）
- [x] **暂停审查**（章二通过；2.7 用 `A2SummaryPanel`）

---

### Task 9: UI · Block 知识矩阵 knowledgeMatrix（章三 3.1）

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁**
> Figma：`8785:57596` / 综合结论 `8785:57714`

- [x] MCP → `A2KnowledgeMatrix` + `A2NewKnowledgePreview`（仅 3.1）
- [x] **暂停审查**（3.1 通过；综合结论空态无圆点）

---

### Task 9b: UI · 章三 3.2 知识呈现逻辑

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁**

- [x] FieldCard / 编号面板挂入 3.2
- [x] **暂停审查**（3.2 通过；四板块齐全；二/三无序号）

---

### Task 9c: UI · 章三 3.3 教学重难点突破

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁**
> Figma：`8785:57873`

- [ ] NumberedCard + 重难点 FieldCard + SummaryPanel → **暂停审查**

---

### Task 10: UI · Block 案例格 / Bloom / 问题链

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁：** 建议再拆为 10a/10b/10c 三次审查（执行时按块暂停）

- [ ] 10a 案例格 → 审查
- [ ] 10b Bloom → 审查
- [ ] 10c 问题链 → 审查

---

### Task 11: UI · Block 表格 / 评分卡 / tip

> **Skill:** figma-design-to-code · 置信度 high · [人工复核]
> **审查门禁：** 11a 表 → 11b 评分卡 → 11c tip，各审一次

---

### Task 12: 组装 · 章一（整体总结）

> **Skill:** figma-design-to-code · 置信度 medium · [人工复核] 组装+对照
> **审查门禁：** 「章一通过」

- [ ] `SectionSummary.vue` 拼 1.1～1.3 → **暂停**

---

### Task 13: 组装 · 章二（新课导入）

> **Skill:** figma-design-to-code · 置信度 medium · [人工复核]
> **审查门禁**

---

### Task 14: 组装 · 章三（新知）— 可按 3.1～3.7 再拆审查

> **Skill:** figma-design-to-code · 置信度 medium · [人工复核]
> **审查门禁：** 建议每 1～2 个小节一审（章三最长）

---

### Task 15: 组装 · 章四～六

> **Skill:** figma-design-to-code · 置信度 medium · [人工复核]
> **审查门禁：** 每章一审

---

### Task 16: 组装 · 章七～十 + flags 条件分支

> **Skill:** figma-design-to-code · 置信度 medium · [人工复核]
> **审查门禁：** 每章一审；flags 空态/不适用态另审一轮

---

### Task 17: 图标资产收口 + 多机型抽检

> **Skill:** figma-design-to-code · 置信度 medium · [人工复核] 缺图标再 download_assets

- [ ] 图标：`@miray/icons` / SVG / Figma 下载
- [ ] 375 / 390 / 414 抽检
- [ ] a1/b1/b2 冒烟回归

---

### Task 18: 文档 + 交付归档

> **Skill:** 无需 skill · 置信度 n/a · [人工复核]

**Files:** H5 overview 补 a2；frontend `archive/*-delivered.md`

- [ ] 更新分享概要
- [ ] 一致性/还原度自检 + harness:check
