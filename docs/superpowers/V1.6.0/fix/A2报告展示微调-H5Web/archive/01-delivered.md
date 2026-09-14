# A2 报告展示微调（H5 + Web）· 交付归档

**日期：** 2026-09-09  
**档位：** 标准  
**执行：** Inline

## 结论

已按 spec 完成 6 项展示微调：H5 overview/文案/卡片结构 + H5/Web 总分小计去权重。

## 改动清单

| # | 文件 | 说明 |
|---|------|------|
| 1 | H5 `A2OverviewPanel.vue` | 隐藏课题、总评分、评分等级 |
| 2 | H5 `A2HighlightTable.vue` | 「依据（原文）」→「依据」 |
| 3 | H5 `mapA2ToView.ts` | `method343`：评价入 fields（观察内容→评价→理由），无 badge |
| 4 | H5 `mapA2ToView.ts` | 5.1/5.2 观察内容 label 加「（从音转文提取）」 |
| 5 | H5 `mapA2ToView.ts` | 章八「课堂实际（音转文）」 |
| 6 | H5 `mapScoreSummaryTail` + Web `mapScoreSummaryTailRows` + spec/mock | 总分小计去掉权重后缀 |

## 一致性自检

| 验收项 | 结果 |
|--------|------|
| overview 无课题/总评分/评分等级 | ✅ |
| 1.2 依据无括号 | ✅ |
| 3.4.3 评价为字段行且居中于观察内容与理由之间 | ✅ 专用 case |
| 5.1/5.2 观察内容带「（从音转文提取）」 | ✅ |
| 章八课堂实际带「（音转文）」 | ✅ |
| H5+Web 总分小计无权重；vitest 14 passed | ✅ |
| 未改共用 A2FieldCard 布局 | ✅ |

## 验证

- Web：`pnpm exec vitest run .../classroom-content-analysis-a2.mapper.spec.ts` 通过  
- H5：真 code 打开对应章节目视确认
