# B类5.5综合判定字段收敛 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

B 类报告 5.5「综合判定」卡片当前由 `buildObjectiveCalcItems` 拼装多个 `objectiveAchievement` 字段，导致除 `comprehensiveJudgment` 外还显示总数/达成数/未达成数/原因分析。产品要求该卡片**仅**展示 `comprehensiveJudgment` 数组。

## 2. 目标

- 「综合判定」info 卡片的 `items` **仅**来自 `contents.teachingBehavior.objectiveAchievement.comprehensiveJudgment`
- 过滤空字符串；数组为空时不渲染该卡片（或整块 calc 行中无该 item）

## 3. 非目标

- 不改 5.5 教学目标表格（objectives）
- 不移除「大节总结说明」（`sectionSummary`）——方案 A 保留
- 不改 A 类报告 5.5
- 不改接口文档字段定义

## 4. 改动范围

| 路径 | 变更 |
|------|------|
| `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b.mapper.ts` | `buildObjectiveCalcItems`：删除对 `totalObjectives` / `achievedCount` / `notAchievedCount` / `reasonAnalysis` 的拼装，只 push `comprehensiveJudgment` |

若 mock（`type-b-chapters.ts` / `b-report-mock-fallbacks`）中有意展示额外行，仅在与 mapper 产物不一致且影响预览时同步收敛；以 mapper 为准。

## 5. 验收标准

- [x] 5.5「综合判定」列表仅含 `comprehensiveJudgment` 逐条内容
- [x] 不再出现「预设教学目标总数」「达成目标数」「未达成目标数」及单独塞入的 `reasonAnalysis`
- [x] 教学目标表格与「大节总结说明」行为与改前一致
