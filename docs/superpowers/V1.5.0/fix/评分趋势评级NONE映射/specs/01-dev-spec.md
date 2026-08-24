# 评分趋势评级 NONE 映射 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `E:\code\frontend`

## 1. 目标

评分趋势 hover 评级映射补充 `NONE → 无`，未匹配/空值显示 `-`。

## 2. 现状映射

| scoreLevel | 评级 |
|------------|------|
| EXCELLENT | 优秀 |
| GOOD | 良好 |
| QUALIFIED | 合格 |
| NEED_IMPROVEMENT | 待改进 |
| 空 / 未匹配 | `--`（保持原逻辑） |

## 3. 方案

- `adapters/score-trend.adapter.ts`：
  - `SCORE_LEVEL_MAP` 增加 `NONE: { gradeKey: null, gradeLabel: '无' }`。
  - `readScoreLevel` 空值/未匹配仍返回 `gradeLabel: '--'`。
- `score-trend-chart-options.ts`：tooltip 评级直接渲染 `report.gradeLabel`（NONE 即 `无`，空/未匹配即 `--`）。
- 更新 adapter 单测：`--` → `-`，补充 NONE 用例。

## 4. 验收标准

- [x] `NONE` 显示「无」
- [x] 未匹配/空值显示 `--`
- [x] 原有四级映射不变
- [x] 单测通过
- [x] ESLint 通过

## 5. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空值评级显示 `--` |
| 常量/mock/真数据 | 映射集中在 adapter |
| 多入口 | 只影响评分趋势 hover |
| 失败/缺省 | 未匹配回退 `--` |
