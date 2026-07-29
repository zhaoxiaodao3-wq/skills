# 自主分析列表B类教材匹配失败标红 · 交付归档

**归档类型：** ui-style 交付快照
**归档日期：** 2026-07-20
**版本：** V1.4.9
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

AI 自主分析列表「报告类型」列：当 `reportType === 'B'` 且 `textbookAsrMatchStatus === 3` 且展示文案非 `-` 时，文案标红（`#f53f3f`）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue` |

## 验收结果

- [x] `reportType=B` 且 `textbookAsrMatchStatus=3` 且展示非 `-` → 报告类型红色
- [x] 其它组合 → 默认色
- [x] 筛选/分页/其它列无回归（仅加 class，无接口改动）

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
