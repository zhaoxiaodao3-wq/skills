# A2 报告展示微调（H5 + Web）· Dev Spec

**模块：** `fix/A2报告展示微调-H5Web`  
**档位：** 标准  
**日期：** 2026-09-09  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

按产品清单微调 A2 报告展示：H5 若干文案/结构 + H5/Web 总分小计去权重。

## 2. 变更明细

| # | 端 | 行为 | 落点 |
|---|----|------|------|
| 1 | H5 | overview 不渲染：课题行、总评分、评分等级 | `A2OverviewPanel.vue` |
| 2 | H5 | 1.2 label「依据（原文）」→「依据」 | `A2HighlightTable.vue` |
| 3 | H5 | 3.4.3：无 badge；fields = 观察内容 → 评价 → 理由 | `mapA2ToView.ts` `mapDimCards` 专写 `method343` |
| 4 | H5 | 5.1/5.2 观察内容 label 加「（从音转文提取）」 | `summary51` + 新增 `summary52` case（勿改 default） |
| 5 | H5 | 章八「课堂实际」→「课堂实际（音转文）」 | `planVsActualSection` fields label |
| 6 | H5+Web | 总分小计仅分数，不拼「（权重…）」 | H5 `mapScoreSummaryTail`；Web `mapScoreSummaryTailRows`；同步相关单测/mock |

## 3. 约束

- 不改共用 `A2FieldCard` 布局；3.4.3 / 5.2 用专用 case，避免误伤其它章节
- 不回退 mock 假数据
- Web 仅改第 6 项（及必要测试期望）

## 4. 验收

1. H5 overview 无课题 / 总评分 / 评分等级展示  
2. 1.2 依据无括号后缀  
3. 3.4.3 评价在观察内容与理由之间的字段行，非右上角  
4. 5.1、5.2 观察内容带「（从音转文提取）」  
5. 章八课堂实际带「（音转文）」  
6. H5 与 Web 总分小计无权重括号；其它评分行不变  

## 5. 实现路径

- `E:\code\H5\...\components\A2OverviewPanel.vue`
- `E:\code\H5\...\components\blocks\A2HighlightTable.vue`
- `E:\code\H5\...\adapters\mapA2ToView.ts`
- `e:\code\frontend\...\mappers\classroom-content-analysis-a2.mapper.ts`（+ `.spec.ts` / mock 若断言权重）
