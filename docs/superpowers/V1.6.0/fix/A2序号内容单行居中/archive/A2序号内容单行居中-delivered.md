# A2序号内容单行居中 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-14  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

A2 Web「蓝序号 + 正文」行改为：内容高度 ≤40px 时相对序号垂直居中，超过则顶对齐；覆盖编号面板与 Bloom 维度三。PDF 未改。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/composables/useIndexContentAlign.ts` |
| 增 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/composables/useIndexContentAlign.spec.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportA2NumberedPanel.vue` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportA2BloomStatsPanel.vue` |
| 改 | `src/report/report/A2/ClassroomContentAnalysisReportA.html`（交付后补：PDF 同逻辑预览） |

## 验收结果

- [x] 编号面板单行居中 / 多行顶对齐
- [x] 维度三同行为
- [x] ResizeObserver 跟随尺寸变化
- [x] PDF 未改动
- [x] `useIndexContentAlign.spec.ts` 2 tests passed

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 空态仍走原 `isBlockEmpty` / `dimThreeEmpty`，不绑观察 |
| 常量/mock/真数据 | N/A | 未改 mapper/mock，仅布局 |
| 多入口 | 通过 | NumberedPanel + Bloom 维度三共用 `useIndexContentAlignMap` |
| 失败/缺省 | 通过 | ref 为 null 时 unbind；卸载 disconnect |

## 还原度自检

不适用：无 Figma / 非 UI 对照还原任务（纯布局对齐 fix）

## Harness 闭环

- [x] validate 开发前已跑（READY_TO_DEV）
- [x] archive 交付快照已写
- [x] validate 交付后已跑
