# A2 Web 10.1 对接 evaluationResult · 交付归档

**日期：** 2026-09-09  
**档位：** 标准  
**执行：** Inline

## 结论

Web A2「10.1 评分汇总表」已改读 `aReport.evaluationResult`；旧 `scoring.summaryTable` 10.1 组装已删除。

## 改动

| 文件 | 说明 |
|------|------|
| `types/teaching-diagnosis-a2-report-vo.ts` | 新增 `evaluationResult` / dimension / totalCalc VO |
| `mappers/classroom-content-analysis-a2.mapper.ts` | `mapEvaluationResultToScoring101`；`mapRestChapters` scoring 段换源；删除 `mapScoreSummaryTailRows` / `SUMMARY_TAIL_*` |
| `mappers/classroom-content-analysis-a2.mapper.spec.ts` | 新映射与满分/hint 单测 |

## 一致性自检

| 项 | 结果 |
|----|------|
| 维度表：dimensionName / finalGrade / 补偿 / score/满分 / coreBasis | ✅ |
| 小结设计满分固定 10（忽略 weight） | ✅ 单测 |
| 其它维满分 `round(weight×100)` | ✅ |
| coreBasis 空 → `--` | ✅ |
| totalCalc 五行 + 时长系数 hint 按 T | ✅ |
| 无 evaluationResult 不回退 summaryTable | ✅ 空 blocks |
| 其它章节 / buildScore / G05 未改 | ✅ |
| vitest mapper spec 15 passed | ✅ |

## 验证

```bash
pnpm exec vitest run src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.spec.ts
```
