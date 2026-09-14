# H5-A2 报告接口对齐 Implementation Plan

> **For agentic workers:** 按 Task 推进；执行方式以 P3（Inline / SDD）为准。

**Goal:** H5 A2 分享页吃真实 `aReport`，映射/条件渲染与 Web 一致，样式不变并清理 mock 死逻辑。

**Architecture:** 在 H5 `analysisTeachingA2/adapters/mapA2ToView.ts` 按 Web `classroom-content-analysis-a2.mapper.ts` 规则做独立映射（不抽跨仓包）；ViewModel 契约尽量沿用现有 H5 types，只换数据源。条件显隐只走字段启发式（不读 `renderFlags`）。frontend 仅在分享 path 错误时改 registry。

**Tech Stack:** H5 Vue3 + TS；对照 Web A2 mapper / 约定文档。

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- **H5 禁止改样式**（SCSS / 布局 / 视觉结构）；只做取数 + adapter 填现有槽位
- 冲突先写清单确认（`archive/spike-禁改样式-对接问题清单.md`），再改代码
- 对齐 Web 数据规则：条件渲染约定、3.6.2 数组、`parsePlanReferenceItems`；不读 `renderFlags`；G05 不做
- Web 半卡撑满 CSS **不移植**
- 实现仓主战场：`E:\code\H5\`；文档在 frontend 本模块

---

## Task 1: 取数与 envelope 解析

- [x] 改 `useA2ReportPage.ts`：默认走真数据；去掉或收窄 `FORCE_MOCK`（仅显式调试）
- [x] 从 **H5 分享接口既有根字段**取出与 Web 同构的报告体（外层路径跟 H5，内层字段跟 Web）
- [x] 无报告体时：合理空态/错误态，不静默整包 mock

## Task 2: mapA2ToView 真映射（对齐 Web）

- [x] 重写 `adapters/mapA2ToView.ts`：按章映射 header / flags / sectionOne / chapters
- [x] flags 启发式与 Web 一致（3.4.2 / 3.6.2 / 5.0 / 5.3；不读 renderFlags）
- [x] 3.6.2：`logicalClue`/`goalOrientation`/`closureAnalysis` 按 `string[]`；null/`{}` 同构
- [x] **3.3 `planReference`：对齐 Web `parsePlanReferenceItems`（重点/难点固定 leadLabel+leadContent）**
- [x] 空态文案与 Web `a2-report-messages` 对齐（H5 本地常量即可）
- [x] G05：不做详情弹窗；10.1 摘要行把系数说明/公式编入 `value`（对齐 H5 mock 写法）
- [x] 5.3：`coreQuestionReturn` 有数据 → 卡片列表；为 `null`/`[]` → 标题下加一行固定文案（跟 Web，允许模板绑一行，不改样式）

## Task 3: Types / 组件接线微调

- [x] 更新 `types/a2-report.ts` 仅当 ViewModel 缺字段阻碍映射
- [x] `A2ClassroomSummaryPreview`：5.3 在标题下按条件展示一行 `notApplicableMessage`（纯文案，不改样式）
- [x] Preview/blocks **只改 props 数据接线**，不改样式类名与布局
- [x] 冒烟：封面、目录、3.4.2、3.6.2、5.x、10.1

## Task 4: 清理无用逻辑

- [x] 删除 Empty Probe（toggle + util + index 引用）
- [x] 删除无引用预览件（如 `A2AtomPreview.vue`）
- [x] 收缩/删除 `mock/a2-mock.ts` 生产路径依赖；adapter 去掉「暂回退 mock」双分支

## Task 5: frontend 分享 path（按需）

- [x] 检查 `classroom-content-report-registry.ts` A2 `share.path` 是否仍为 `analysis-teaching-a`
- [x] 若是，改为 `analysis-teaching-a2`（或与 H5 registry 一致的 path），保证分享链打开 H5 A2

## Task 6: 校验与交付

- [x] H5 真 code 联调：有数据 / 条件分支各至少一条
- [x] `pnpm harness:status -- --match H5-A2` + `pnpm harness:check`
- [x] 写 `archive/*-delivered.md`（含一致性自检）
