# 课堂教学内容报告模板展示 · 执行计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

> **Skill：** 无专用前端 skill；Inline 按本 plan。

## Task 1: 数据与展示

1. `report-variant` 增加 `resolveReportTemplateDisplay` → 合法子类型或 `'--'`
2. `ReportHeaderMeta.reportTemplate: string`
3. a/b mapper header 写入该字段
4. `ReportHeroHeader`：meta 左右分栏；右侧 `报告模板：{{ header.reportTemplate }}` + 指定样式
5. 补单测（display helper）
