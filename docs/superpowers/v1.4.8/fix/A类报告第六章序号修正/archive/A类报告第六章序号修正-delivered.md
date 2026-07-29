# A类报告第六章序号修正 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-14  
**版本：** v1.4.8  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

将 A 类报告第六章亮点节「6.2-6.3」改为「6.2」，并顺延后续小节为 6.3 / 6.4 / 6.5。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a.mapper.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/type-a-chapters.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/template-thymeleaf/ClassroomContentAnalysisReport.html` |
| 改 | `src/report/ClassroomContentAnalysisReportA.html` |
| 改 | `src/report/report/ClassroomContentAnalysisReportA.html` |
| 改 | `src/report/ClassroomContentAnalysisReportTocA.html` |
| 改 | `src/report/report/ClassroomContentAnalysisReportTocA.html` |

## 验收结果

- [x] 第六章标题为 6.1 → 6.2 → 6.3 → 6.4 → 6.5
- [x] 主模板 / TOC / mock / mapper 已对齐
- [x] 未改 B 类；废弃 `copy.html` 未改

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
