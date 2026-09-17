# A2-3.7新知整体总结标题 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

A2 报告 3.7 小节当前展示「3.7 新知讲授整体总结」。产品要求改为「3.7 新知整体总结」，正文标题与目录必须一致，覆盖 Web、H5、PDF。

## 2. 目标文案

| 位置 | 旧文案 | 新文案 |
|------|--------|--------|
| 3.7 小节标题 | `3.7 新知讲授整体总结` | `3.7 新知整体总结` |
| 对应目录项 | 同上 | 同上 |

## 3. 改动面（实现时）

| 端 | 文件 | 机制 |
|----|------|------|
| Web / H5 正文 | `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.ts` | `nk-3-7.title` 字面量；H5 与 Web 共用 mapper |
| Web / H5 目录 | 由 `buildTypeA2Toc` 读取 `sub.title` | 改 mapper/mock 后目录自动跟随 |
| Web mock | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/a2-data/chapter-new-knowledge.ts` | mock 章节标题与真数据路径一致 |
| PDF 正文 | `src/report/report/A2/ClassroomContentAnalysisReportA.html` | `<h3>` 硬编码 |
| PDF 目录 | `src/report/report/A2/ClassroomContentAnalysisReportTocA.html` | TOC label 硬编码 |

## 4. 非目标

- B2 的 `3.7 新知整体分析` 不改
- 「三、新知讲授/探究」章标题不改
- 3.7 正文内容、字段 `overallSummary`、样式均不改

## 5. 验收

- [x] Web A2 正文 3.7 标题为「3.7 新知整体总结」
- [x] Web A2 侧栏/目录 3.7 为「3.7 新知整体总结」
- [x] H5 A2 正文与目录同上（同源 mapper）
- [x] PDF A2 正文 3.7 标题同上
- [x] PDF A2 目录 3.7 同上
- [x] 全仓不再出现「3.7 新知讲授整体总结」
- [x] B2 3.7 文案仍为「新知整体分析」
