# 报告预览 Tab 顺序调整 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-17  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

调整 `buildReportPreviewMenu`：A/B 下「报告预览与下载」子 Tab 顺序为 AI教学分析报告 → AI课堂实录报告 → AI课堂分析报告。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis.vue` |

## 验收结果

- [x] A/B 顺序正确  
- [x] G 仍为实录 → 分析  

## Harness 闭环

- [x] 开发前 validate  
- [x] archive 已写  
- [x] 交付后 validate  

未自动 commit。
