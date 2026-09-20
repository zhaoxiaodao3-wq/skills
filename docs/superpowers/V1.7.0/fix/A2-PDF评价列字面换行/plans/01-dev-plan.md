# A2-PDF评价列字面换行 · 实施计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1：仅改 3.4.3 aidAnalysis 评价列分隔符

> **Skill:** thymeleaf · 置信度 high

**文件：** `ClassroomContentAnalysisReportA.html`

仅将 `data-field="...aidAnalysis[].evaluation"` 处的  
`#strings.listJoin(evRaw, '\n')` → `#strings.listJoin(evRaw, T(java.lang.System).lineSeparator())`。

同文件其它 `listJoin` 不动。
