# B类报告2.1表头文案 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

B 类课堂内容分析报告「2.1 教材知识点覆盖情况」表格表头为「对应内容摘录（时间戳）」，产品要求去掉括号及其中内容，仅保留「对应内容摘录」。单元格内摘录后的时间戳展示逻辑不变。

## 2. 目标

- 表头文案：`对应内容摘录（时间戳）` → `对应内容摘录`
- 覆盖页面渲染数据源、诊断 mock、报告 HTML 模板中的同源文案，避免预览/打印与页面不一致

## 3. 非目标

- 不修改单元格内容（含「（00:xx:xx-00:xx:xx）」类时间戳）
- 不同步修改 A 类报告同类表头（若存在）
- 不调整列宽、列顺序或表格数据结构

## 4. 改动范围

| 路径 | 变更 |
|------|------|
| `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b.mapper.ts` | `evidence` 列 `label` |
| `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/type-b-chapters.ts` | mock 列 `label` |
| `src/pages/analysis-web/ai-teaching-diagnosis/template-thymeleaf/ClassroomContentAnalysisReportB.html` | `<th>` 表头 |
| `src/report/ClassroomContentAnalysisReportB.html` | `<th>` 表头 |

说明：`src/report/report/ClassroomContentAnalysisReportB.html` 若仍含旧文案，一并替换，与主报告模板保持一致。

## 5. 实现要点

- 全文检索 `对应内容摘录（时间戳）`，仅替换为 `对应内容摘录`（B 类上述文件）
- 不做常量抽取（单次文案订正，保持与现有硬编码风格一致）

## 6. 验收标准

- [x] 2.1 表格表头显示为「对应内容摘录」，无「（时间戳）」后缀
- [x] mapper / mock / B 报告 HTML 中不再出现「对应内容摘录（时间戳）」
- [x] 单元格摘录内容仍可含时间戳，行为与改前一致
- [x] A 类报告表头未因本需求被改动
