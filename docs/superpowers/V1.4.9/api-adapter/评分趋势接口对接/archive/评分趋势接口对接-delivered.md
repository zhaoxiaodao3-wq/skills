# 评分趋势接口对接 · 交付归档

**归档类型：** api-adapter 交付快照
**归档日期：** 2026-07-20
**版本：** V1.4.9
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

将课堂教学内容评价「评分趋势」从 Mock 替换为 `GET /analysis/v2/teachingDiagnosis/scoreTrend`；经 adapter 将 `scoreLevel`（EXCELLENT/GOOD/QUALIFIED/NEED_IMPROVEMENT）与字段名映射为现有 ViewModel，空分数/等级保留并展示 `--`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 新增 | `src/pages/school/teacher-portrait/api/types/score-trend.vo.ts` |
| 新增 | `src/pages/school/teacher-portrait/api/get-score-trend.ts` |
| 新增 | `src/pages/school/teacher-portrait/adapters/score-trend.adapter.ts` |
| 新增 | `src/pages/school/teacher-portrait/adapters/score-trend.adapter.spec.ts` |
| 改 | `src/pages/school/teacher-portrait/adapters/index.ts` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/types.ts` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/score-trend-chart-options.ts` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalContainer.vue` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/score-trend.mock.ts`（仅类型收紧） |

## 验收结果

- [x] 真实接口有数据时 A/B 折线与 tooltip 正确
- [x] `EXCELLENT/GOOD/QUALIFIED/NEED_IMPROVEMENT` → 优秀/良好/合格/待改进 + 色点
- [x] `score`/`scoreLevel` 为空保留条目，文案 `--`
- [x] `reportType` 非法条目被过滤
- [x] 空列表 / 失败 → 趋势空态，环图雷达不受影响
- [x] 切换教师后趋势更新；无教师不发请求
- [x] 默认生产路径不使用 Mock

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
