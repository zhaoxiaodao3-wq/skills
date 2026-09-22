# A2-PDF评价列字面换行 · 实施计划（跟进）

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [requirements/02-lineSeparator报错改用SpEL双引号.md](../requirements/02-lineSeparator报错改用SpEL双引号.md)

## Task 1：aidAnalysis 评价列分隔符改为 SpEL `"\n"`

> **Skill:** thymeleaf · 置信度 high · 单处表达式替换，避开受限 `System` 类型

**文件：** `E:\code\muban\analysis-service\src\main\resources\lessonTemplates\A\A2\ClassroomContentAnalysisReportA.html`

仅 `data-field="newKnowledgeTeaching.teachingMethod.aidAnalysis[].evaluation"` 处：

```text
#strings.listJoin(evRaw, T(java.lang.System).lineSeparator())
→
#strings.listJoin(evRaw, "\n")
```

**验收：** 全文 `lineSeparator` 为 0；该 data-field 使用 `"\n"`；其它 `listJoin(evRaw, '\n')` 不动。
