# H5 A2 10.1 对接 evaluationResult · 交付归档

**日期：** 2026-09-09  
**档位：** 标准  
**执行：** Inline

## 结论

H5 A2「10.1 评分汇总表」已改读 `evaluationResult`；映射逻辑对齐 Web；`A2ScoringPreview` / `A2ScoreSummary` / `A2FieldCard` 样式未改。

## 改动

| 文件 | 说明 |
|------|------|
| `E:\code\H5\...\adapters\mapA2ToView.ts` | 新增 `resolveEvaluationDimensionFullScore` / `parseClassDurationMinutes` / `buildDurationCoefficientHint` / `mapEvaluationResultToScoringSection`；`scoringSection` 改接 `vo.evaluationResult`；删除 `mapScoreSummaryTail`、`SUMMARY_TAIL_*`、`summaryTable` 10.1 分支 |

## 一致性自检

| 项 | 结果 |
|----|------|
| 维度卡：dimensionName / finalGrade / 补偿 / score/满分 / coreBasis | ✅ |
| 小结设计满分固定 10 | ✅ |
| 其它维满分 `round(weight×100)` | ✅ |
| coreBasis 空 → `--` | ✅ |
| totalCalc 五行；时长系数 hint 拼进 value | ✅ |
| 无 evaluationResult 不回退 summaryTable | ✅ 空 cards/rows |
| H5 样式组件未改 | ✅ |
| 其它章节映射未改 | ✅ |

## 还原度自检

样式未改（N/A）：仅换 adapter 数据源，组件树与 SCSS 保持原样。

## 验证

- 旧符号 `mapScoreSummaryTail` / `SUMMARY_TAIL_*` 已无引用
- 核心满分 / hint 规则与 Web 对齐（node 抽检通过）
