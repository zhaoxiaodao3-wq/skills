# PDF 报告模板字段展示 · 交付归档

**归档类型：** ui-style 交付快照  
**归档日期：** 2026-08-26  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

仅在 A/B PDF 正文模板 meta 行右侧增加「报告模板」；Thymeleaf 绑定 `reportSubType`，空则 `--`。未改 Java。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `.../lessonTemplates/A/ClassroomContentAnalysisReportA.html` |
| 改 | `.../lessonTemplates/B/ClassroomContentAnalysisReportB.html` |

## 验收结果

- [x] A/B 均有右侧「报告模板」
- [x] `#strings.isEmpty(reportSubType) ? '--' : reportSubType`
- [x] 未改 Java

## 一致性自检

| 检查项 | 结果 | 证据 |
|------|------|------|
| 空态 vs 有数据 | 通过 | 空 → `--`；有变量则显示值 |
| 常量/mock/真数据 | N/A | 仅模板；Context 由后端日后注入 |
| 多入口 | 通过 | A/B 两份模板对称改 |
| 失败/缺省 | 通过 | isEmpty 兜底 |

## 还原度自检

- 对照：与 Web 顶栏布局/样式一致（用户 CSS）
- 结论：可交付

## Harness 闭环

- [x] archive 已写
