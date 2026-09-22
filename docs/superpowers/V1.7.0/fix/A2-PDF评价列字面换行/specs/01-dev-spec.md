# A2-PDF评价列字面换行 · 开发规格（跟进）

**Requirement:** [requirements/02-lineSeparator报错改用SpEL双引号.md](../requirements/02-lineSeparator报错改用SpEL双引号.md)

> 覆盖并取代前版「仅用 lineSeparator()」的实现约定；原 [01-原始需求](../requirements/01-原始需求.md) 验收目标（无字面 `\n`、只改一处）不变。

## 1. 根因修正

| 写法 | 结果 |
|------|------|
| `'\n'`（单引号） | 常为字面 `\`+`n` → PDF 露出 `\n` |
| `T(java.lang.System).lineSeparator()` | 易触发类型限制 → 模板/PDF 生成失败 |
| `"\n"`（SpEL 双引号） | 真换行，且不碰 `System` |

## 2. 改动

**文件：** `E:\code\muban\analysis-service\src\main\resources\lessonTemplates\A\A2\ClassroomContentAnalysisReportA.html`

仅 `data-field="newKnowledgeTeaching.teachingMethod.aidAnalysis[].evaluation"` 处：

```text
#strings.listJoin(evRaw, T(java.lang.System).lineSeparator())  // 触发 System 限制 / 生成失败
#strings.listJoin(evRaw, "\n")                                 // HTML 属性双引号嵌套 → ParseException
→
#strings.listJoin(evRaw, '<真实换行符>')                       // 单引号 + 属性内真实 LF；保留 th:text + pre-wrap
```

（实现上为 SpEL 单引号字符串，中间夹一个真实 LF，不嵌套 `"`，不调用 `System`。）

`.ccar-table td` 已有 `white-space: pre-wrap`，不加样式；仍用 `th:text`（不改为 `utext`）。

## 3. 非目标

- 同文件其它 `listJoin(evRaw, '\n')`
- 本仓 frontend `src/`、后端 Java（除非后续证明模板侧不够）

## 4. 验收标准

- [x] 该处已无 `lineSeparator()` / `java.lang.System`
- [x] 该处已无会拆破 HTML 属性的 `"\n"`
- [x] 分隔符为单引号包裹的真实换行（保留 `th:text`）
- [ ] 后端能成功生成 A2 PDF（待重出确认）
- [ ] 3.4.3 评价列无字面 `\n`，多条评价分行（待重出确认）
- [x] 其它评价列未改
