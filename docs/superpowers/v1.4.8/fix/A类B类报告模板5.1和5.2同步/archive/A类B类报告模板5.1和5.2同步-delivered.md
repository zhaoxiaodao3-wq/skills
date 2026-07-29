# A类B类报告模板5.1和5.2同步 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-14  
**版本：** v1.4.8  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

将 Vue 侧已交付的 5.1/5.2 展示契约同步到 analysis-service lessonTemplates（仅 muban，未改本仓 src/）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/A/ClassroomContentAnalysisReportA.html` |
| 改 | `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/B/ClassroomContentAnalysisReportB.html` |

## 验收结果

- [x] A 5.1 含「是否提出核心问题」
- [x] A/B 5.2 含 has+详情拼接
- [x] 5.1/5.2 本表空值不再回落 `-`/`无`
- [x] 本仓 `src/` 无改动

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
