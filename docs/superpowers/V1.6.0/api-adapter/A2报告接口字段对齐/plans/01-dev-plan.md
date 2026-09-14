# A2 报告接口字段对齐 Implementation Plan

> **For agentic workers:** Inline 执行；按 Task 推进。

**Goal:** `aReport`(A2) → `TypeA2AnalysisPayload` 真数据对接，替换全 mock。

**Architecture:** 新增 A2 VO 类型；在 `classroom-content-analysis-a2.mapper.ts` 分章纯函数映射；展示组件尽量少改，契约按裁定放宽为动态数组。G05 不映射弹窗。

**Tech Stack:** Vue3 + TS；现有 A2 View / BlockRenderer。

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 以接口为准；列表动态遍历；G05 不做；G04 可读 `renderFlags` 或启发式
- 先文档后实现已完成；本 plan 对应 Inline

---

## Task 1: A2 VO 类型

- [ ] 新增 `src/types/teaching-diagnosis-a2-report-vo.ts`（对齐预接口 aReport 结构）
- [ ] `CaseBasicInfo` / resolve 侧可读该类型（或 aReport 用联合/unknown 收窄）

## Task 2: Mapper 骨架 + Hero/评分/flags

- [ ] 改 `classroom-content-analysis-a2.mapper.ts`：读 `resolveAReport`，无数据返回空/判假
- [ ] 映射 header（时长格式化）、score、`renderFlags`/启发式 flags
- [ ] `hasA2ReportData` 真实判断

## Task 3: 映射一～五章内容块

- [ ] overallSummary（G01 亮点、1.3 不足）
- [ ] lessonIntroduction 表
- [ ] newKnowledgeTeaching（3.1～3.7，含 G03/G06～G10/G15/G17）
- [ ] practiceFeedback（G02 动态）
- [ ] classSummary

## Task 4: 映射六～十 + TOC

- [ ] studentDiagnosis、timeAllocation、planComparison、benchmarkComparison
- [ ] scoring.summaryTable 拆表+摘要（G12）；不映射 scoreDetail（G05）
- [ ] buildToc

## Task 5: 展示微调

- [ ] HighlightTable：无 lead 时只显示 description/body 插槽空
- [ ] 生产 `showFlagProbes=false`（若入口未关）
- [ ] 必要时 ProblemChain / Bloom 兼容转换结果

## Task 6: 校验

- [ ] 相关单测或 mapper 冒烟
- [ ] `pnpm harness:check` / status
