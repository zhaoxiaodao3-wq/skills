# 教师画像看板统计失败不回落 mock · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

`statistics` 接口切真实数据（`dataSourceBindId` 取自页面 URL query），失败或空数据时不再回退 mock：KPI 显示 `--`；风格分布固定 20 组合、标签按固定标签表、热力固定 20 风格纵轴，接口未返回的项补 0 空态。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/composables/use-teacher-style-dashboard.ts` |
| 改 | `.../components/kpi-strip/kpi-strip.vue` |
| 改 | `.../components/style-distribution-panel/style-distribution-panel.vue` |
| 改 | `.../components/tag-panel/tag-panel.vue` |
| 改 | `.../components/subject-style-heatmap/subject-style-heatmap.vue` |

## 验收结果

- [x] `statistics` 请求使用真实 `dataSourceBindId`
- [x] 请求失败/空数据时：KPI `--`；风格分布固定 20 组合补 0；标签固定表补 0；热力固定 20 风格补 0
- [x] 接口成功仍显示接口数据
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | KPI `--` / 风格分布全 0 / 标签 EmptyState / 热力零矩阵 |
| 常量/mock/真数据 | 通过 | mock 文件保留但统计面板不再引用 |
| 多入口 | 通过 | 只影响看板统计面板 |
| 失败/缺省 | 通过 | 失败清空，不回退 |

## 还原度自检

不适用：数据回退策略修复，非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
