# A类报告4.2列名教案设计的方法 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

A 类报告 4.2「知识点呈现方法与逻辑分析」表格列名：

- 原：`教案设计的深度`
- 现：`教案设计的方法`

## 2. 已确认方案

**方案 A：** 同步修改 mapper、mock、A 类主 HTML/Thymeleaf 模板中的该表头文案。

## 3. 改动约束

- 仅替换字符串 `教案设计的深度` → `教案设计的方法`
- 不改 `prop: 'planned'` 及其它列（实际讲授的深度、深度差异分析）
- 不改 B 类报告；废弃 `ClassroomContentAnalysisReport copy.html` 可不改

## 4. 涉及文件（预期）

| 路径 |
|------|
| `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a.mapper.ts` |
| `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/type-a-chapters.ts` |
| `src/pages/analysis-web/ai-teaching-diagnosis/template-thymeleaf/ClassroomContentAnalysisReport.html` |
| `src/report/ClassroomContentAnalysisReportA.html` |
| `src/report/report/ClassroomContentAnalysisReportA.html` |

## 5. 验收标准

- [x] 在线 A 报告 4.2 表头为「教案设计的方法」
- [x] 主用 A 模板 / mock 同上
- [x] `src` 内主用文件无残留「教案设计的深度」（可忽略 copy.html）
