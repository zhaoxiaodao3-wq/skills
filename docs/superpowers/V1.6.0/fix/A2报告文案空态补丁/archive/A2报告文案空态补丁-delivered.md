# A2报告文案空态补丁 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-03  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

修正 A2 报告 C1～C6（时长括号、3.4 表头、3.6 维度文案/结构）；Web + H5 mock 同步；表格无行默认「暂无数据」、字段仍走 `--`；**Web / H5 均提供右下角空态开关**（联调 TEMP）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/.../mock/classroom-content-analysis-a2.mock.ts` |
| 改 | `src/.../mock/a2-data/chapter-new-knowledge.ts` |
| 改 | `src/.../types/classroom-content-analysis-a2-report.ts` |
| 改 | `src/.../components/ReportA2BloomStatsPanel.vue` |
| 改 | `src/.../components/ReportDataTable.vue` |
| 改 | `src/.../mappers/classroom-content-analysis-a2.mapper.ts` |
| 改 | `src/.../components/ReportTypeA2View.vue`（挂空态开关） |
| 增 | `src/.../components/dev/A2EmptyProbeToggle.vue` |
| 增 | `src/.../utils/a2-empty-probe.ts` |
| 改 | `src/.../components/ReportA2HeroHeader.vue`（元信息 `--`） |
| 改 | `E:\code\H5\...\mock\a2-mock.ts` / types / A2QuestionPreview / A2NewKnowledgePreview / A2NumberedPanel / emptyProbe |

## 验收结果

- [x] C1～C6 mock 有数据态正确  
- [x] Web + H5 语义同步  
- [x] 空态：字段 `--`；表无行「暂无数据」；flags 不适用文案保留  
- [x] §3.2 清单已按现有探针/Empty Probe + 默认暂无数据落地  
- [x] a1/b1/b2 未改  

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | `ReportDataTable` 无行→暂无数据；`displayValue`/`mapRowWithDash`→`--`；H5 Empty Probe |
| 常量/mock/真数据 | 通过 | mock 改文案；mapper 去括号兜底 |
| 多入口 | 通过 | 仅 A2 路径 |
| 失败/缺省 | 通过 | 表空/整块空有占位；不适用 emptyNote 保留 |

## 还原度自检

不适用：无 Figma / 非 UI 样式还原（文案与空态补丁）

## Harness 闭环

- [x] validate 开发前已跑  
- [x] archive 交付快照已写  
- [x] validate 交付后已跑  
