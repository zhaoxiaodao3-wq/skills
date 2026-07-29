# 隐藏AI课堂分析报告Tab · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1：菜单去掉该 Tab（约 2 分钟）

文件：`src/pages/analysis-web/ai-teaching-diagnosis.vue`

1. `buildReportPreviewMenu`：删除 path 为 `ai-classroom-analysis-report` 的 children
2. `buildAiSelfAnalysisLoadingPages`：同步删除报告预览下同项

## Task 2：自检与交付（约 2 分钟）

- AI自主分析报告预览仅剩教学分析 / 课堂实录（按 A/B 规则）
- 勾选 spec → archive → `pnpm harness:check`
