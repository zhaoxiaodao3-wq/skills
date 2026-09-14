# H5 A2 10.1 对接 evaluationResult Implementation Plan

> **For agentic workers:** 按 Task 推进；执行方式以 P3（Inline / SDD）为准。

**Goal:** H5 A2 10.1 改读 `evaluationResult`；逻辑对齐 Web；样式与组件树不变。

**Architecture:** 仅改 `mapA2ToView.ts` 内 10.1 组装：`dimensionList`→`dimensionCards`，`totalCalc`→`summaryRows`；删除 `summaryTable` 尾表逻辑；Vue/SCSS 不动。

**Tech Stack:** Vue3 + TS（H5 仓）

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Skills（路由）：** 纯 adapter 映射；无 Figma/ECharts。

## Global Constraints

- 实现仓：`E:\code\H5\src\pages\share\analysisTeachingA2\`
- 不改 `A2ScoringPreview` / `A2ScoreSummary` / `A2FieldCard` 样式
- 小结设计满分固定 10；其它 `round(weight*100)`
- 无 `evaluationResult` 不回退 `scoring.summaryTable`
- hint 拼进时长系数 `value`

---

## Task 1: 映射辅助函数

**Files:**
- Modify: `E:\code\H5\src\pages\share\analysisTeachingA2\adapters\mapA2ToView.ts`

- [x] 新增（或内联对齐 Web）：`resolveEvaluationDimensionFullScore`、`parseClassDurationMinutes`、`buildDurationCoefficientHint`
- [x] 新增 `mapEvaluationResultToScoringSection(er)` → `{ dimensionCards, summaryRows }`（卡结构与现 `scoreDimRows.map` 一致）

## Task 2: 接入 buildView + 删旧 10.1

- [x] `buildView` 的 `scoringSection` 改用 `vo.evaluationResult`
- [x] 删除 `mapScoreSummaryTail`、`SUMMARY_TAIL_*`、`scoreTable`/`scoreDimRows` 对 10.1 的依赖（确认无其它引用）
- [x] 保留 `tip: A2_SCORE_TIP` 与章节其它映射不变

## Task 3: 校验与交付

- [x] 人工/脚本核对：得分格式、小结满分 10、补偿、hint、空态
- [x] `pnpm harness:status -- --match "H5-A2-10.1"`（frontend 文档仓）
- [x] 写 `archive/*-delivered.md`（含一致性自检；还原度：样式未改，注明 N/A）
