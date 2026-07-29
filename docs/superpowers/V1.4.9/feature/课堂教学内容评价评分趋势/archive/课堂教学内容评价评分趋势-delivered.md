# 课堂教学内容评价评分趋势 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-07-20
**版本：** V1.4.9
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

在「课堂教学内容评价」底部右侧新增 A/B 评分趋势折线图：与评价维度得分同行排布；Mock ≥15 条报告；复用 `useTeacherPortraitChart`；正式接口预留 TODO。上区环图/汇总与雷达业务逻辑未改。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/pages/school/teacher-portrait/components/classroom-content-eval/ScoreTrendPanel.vue` |
| 增 | `src/pages/school/teacher-portrait/components/classroom-content-eval/score-trend-chart-options.ts` |
| 增 | `src/pages/school/teacher-portrait/components/classroom-content-eval/score-trend.mock.ts` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/types.ts` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalContainer.vue` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalView.vue` |

## 验收结果

- [x] 底部左维度得分、右评分趋势同行；窄屏堆叠
- [x] A/B 双折线颜色与图例正确；Y 0–100；X 无报告名；新报告在左
- [x] 点数足够时底部 slider 可拖；图例可显隐
- [x] Tooltip 含评分、评级、课例、生成时间（深色样式）
- [x] Mock ≥15；空态/loading 无白屏无报错
- [x] 原环图、汇总、雷达无回归

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
