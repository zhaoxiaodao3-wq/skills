# A2-PDF评价列字面换行 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景与根因

`evaluation` 为 `List` 时，模板 `#strings.listJoin(evRaw, '\n')` 中 `'\n'` 常被解析为字面 `\`+`n`。

## 2. 改动范围（已收窄）

| 项 | 说明 |
|----|------|
| 文件 | `ClassroomContentAnalysisReportA.html`（A2） |
| 仅改 | `data-field="newKnowledgeTeaching.teachingMethod.aidAnalysis[].evaluation"` 对应的 `listJoin` 分隔符 → `T(java.lang.System).lineSeparator()` |
| 不改 | 同文件其它约 12 处同源 `listJoin`；本仓 `src/`；其它模板 |

表格 `.ccar-table td` 已有 `white-space: pre-wrap`，无需加样式。

## 3. 验收标准

- [x] 仅 `aidAnalysis[].evaluation` 一处使用 `lineSeparator()`
- [ ] 重出 PDF 后 3.4.3 评价列无字面 `\n`（待肉眼确认）
- [x] 同文件其余 `listJoin(evRaw, '\n')` 保持未改（12 处）
