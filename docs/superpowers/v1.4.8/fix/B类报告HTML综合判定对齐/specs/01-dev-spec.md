# B类报告HTML综合判定对齐 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

网页端 `buildObjectiveCalcItems` 已仅使用 `comprehensiveJudgment`。服务端 Thymeleaf 模板与前端 report 副本的 5.5「综合判定」仍额外渲染 `totalObjectives` / `achievedCount` / `notAchievedCount` / `reasonAnalysis`，导出/打印与网页不一致。字段本身同源，需收敛模板列表内容。

## 2. 目标

- 「综合判定」卡片列表**仅** `th:each` `obj.comprehensiveJudgment`
- 与网页字段路径一致：`contents.teachingBehavior.objectiveAchievement.comprehensiveJudgment`
- 同步修改 muban 服务端模板与本仓库 report HTML 副本

## 3. 非目标

- 不改 5.5 教学目标表格、`sectionSummary` 大节总结
- 不改 `classroom-content-analysis-b.mapper.ts`（已对齐）
- 不删 Thymeleaf 其它章节

## 4. 改动范围

| 路径 | 变更 |
|------|------|
| `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/B/ClassroomContentAnalysisReportB.html` | 删除综合判定中 4 个多余 `<li th:if=...>`，保留 `comprehensiveJudgment` 循环 |
| `src/report/ClassroomContentAnalysisReportB.html` | 同上 |
| `src/report/report/ClassroomContentAnalysisReportB.html` | 若含同源片段则同上 |
| `src/pages/.../template-thymeleaf/ClassroomContentAnalysisReportB.html` | 若为静态示例且含拼装文案，按需与网页展示一致（示例稿可不含 th:） |

## 5. 验收标准

- [x] muban 与本仓库 report B 模板「综合判定」仅循环 `comprehensiveJudgment`
- [x] 不再出现总数/达成数/未达成数/`reasonAnalysis` 拼装项
- [x] 表格与「大节总结说明」保留
- [x] 字段路径仍为 `teachingBehavior.objectiveAchievement.comprehensiveJudgment`
