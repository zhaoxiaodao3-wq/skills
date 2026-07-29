# B类报告表头括号文案收敛 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

B 类报告表头括注文案需统一收敛（与已交付的 2.1「对应内容摘录」同类）。本期合并处理 3.1 / 7.1 / 7.2，不再拆开多个需求。

## 2. 目标

| 章节 | 表头从 | 改为 |
|------|--------|------|
| 3.1 教师提问统计 | `示例（时间戳）` | `示例` |
| 7.1 本堂课存在的不足 | `依据（时间戳+原文）` | `依据` |
| 7.2 本堂课的主要亮点 | `依据（时间戳+原文）` | `依据` |

仅改表头文案，不改单元格内容。

## 3. 非目标

- 不改其它节独立列名（如「时间戳」「时间戳范围」本身作为列名的字段）
- 不回改已交付的 2.1 模块文档
- 不改 A 类报告

## 4. 改动范围

| 路径 | 变更 |
|------|------|
| `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b.mapper.ts` | 三处 `label` |
| `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/type-b-chapters.ts` | 对应 mock label |
| `src/report/ClassroomContentAnalysisReportB.html` | `<th>` |
| `src/report/report/ClassroomContentAnalysisReportB.html` | `<th>`（静态） |
| `src/pages/.../template-thymeleaf/ClassroomContentAnalysisReportB.html` | 静态示例 `<th>` |
| `E:/code/muban/analysis-service/.../ClassroomContentAnalysisReportB.html` | 7.1/7.2 的 `<th>`（3.1 已是「示例」） |

## 5. 验收标准

- [x] 3.1 表头为「示例」，无「（时间戳）」
- [x] 7.1 / 7.2 表头为「依据」，无「（时间戳+原文）」
- [x] mapper、mock、本仓 HTML、muban 模板与网页一致
- [x] 单元格摘录/依据正文不变
