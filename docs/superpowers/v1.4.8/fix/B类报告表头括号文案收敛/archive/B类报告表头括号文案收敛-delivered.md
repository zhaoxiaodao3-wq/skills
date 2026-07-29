# B类报告表头括号文案收敛 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-15
**版本：** v1.4.8
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

合并收敛 B 类 3.1 / 7.1 / 7.2 表头括号说明：`示例（时间戳）`→`示例`，`依据（时间戳+原文）`→`依据`（与 2.1 同类规则；2.1 已交付另模块）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b.mapper.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/type-b-chapters.ts` |
| 改 | `src/report/ClassroomContentAnalysisReportB.html` |
| 改 | `src/report/report/ClassroomContentAnalysisReportB.html` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/template-thymeleaf/ClassroomContentAnalysisReportB.html` |
| 改 | `E:/code/muban/analysis-service/.../ClassroomContentAnalysisReportB.html`（仓库外，7.1/7.2） |

## 验收结果

- [x] 3.1 表头为「示例」，无「（时间戳）」
- [x] 7.1 / 7.2 表头为「依据」，无「（时间戳+原文）」
- [x] mapper、mock、本仓 HTML、muban 模板与网页一致
- [x] 单元格摘录/依据正文不变

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
