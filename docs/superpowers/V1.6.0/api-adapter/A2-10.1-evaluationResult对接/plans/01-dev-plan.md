# A2 Web 10.1 对接 evaluationResult Implementation Plan

> **For agentic workers:** 按 Task 推进；执行方式以 P3（Inline / SDD）为准。

**Goal:** Web A2 10.1 改读 `aReport.evaluationResult`；删除旧 `scoring.summaryTable` 10.1 逻辑。

**Architecture:** 在 `mapRestChapters` 的 scoring 段替换数据源；新增纯函数映射 `dimensionList`/`totalCalc` → 现有 `table` + `a2ScoreSummary` blocks；UI 组件尽量不改。

**Tech Stack:** Vue3 + TS + vitest

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Skills（路由）：** 纯 mapper/VO；无 Figma/ECharts 专项。

## Global Constraints

- 仅 Web；不影响章二～九、`buildScore`、G05 scoreDetail
- 小结设计满分固定 10；其它 `round(weight*100)`
- `coreBasis` 空 → `--`
- 无 `evaluationResult` 不回退旧 summaryTable

---

## Task 1: VO

- [x] `teaching-diagnosis-a2-report-vo.ts` 增加 `evaluationResult`（dimensionList + totalCalc + compensationCheck/coreBasis 等）
- [x] `PostClassReportA2VO.evaluationResult?`

## Task 2: 新 10.1 映射 + 删旧逻辑

- [x] 新增映射函数（如 `mapEvaluationResultToScoring101`）：表行 + 底栏五行
- [x] 满分规则、补偿标记、时长系数 hint（图二）
- [x] `mapRestChapters` scoring 段改用新函数
- [x] 删除/停用：`mapScoreSummaryTailRows`、`SUMMARY_TAIL_*`、`pickDurationCoeffHint`（确认无其它引用）
- [x] 更新 `classroom-content-analysis-a2.mapper.spec.ts`
- [x] 按需更新 `mock/a2-data/chapter-rest.ts` 10.1 桩

## Task 3: 校验与交付

- [x] 单测覆盖：得分格式、小结满分 10、补偿、hint、空 coreBasis
- [x] `pnpm harness:status -- --match "10.1-evaluationResult"` + `pnpm harness:check`
- [x] 写 `archive/*-delivered.md`（含一致性自检）
