# 教师画像看板统计失败不回落 mock · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

`statistics` 切真实接口（`dataSourceBindId: '66666'`），失败/空数据展示空态，不移除 mock 文件但不再回退。

## 2. 方案

- `use-teacher-style-dashboard.ts`：`loadStatistics` 请求 `'66666'`；失败/无数据清空 `kpi / styleDistribution / tagModules / heatmap`。
- `kpi-strip.vue`：接口数据为空用全 `null` 空 KPI（显示 `--`）。
- `style-distribution-panel.vue`：固定展示 20 组合，接口未返回的组合补 0。
- `tag-panel.vue`：按固定标签表补齐，接口未返回的标签补 0 空行。
- `subject-style-heatmap.vue`：固定 20 风格纵轴，接口未返回的组合补 0。

## 3. 验收标准

- [x] `statistics` 请求使用真实 `dataSourceBindId`
- [x] 请求失败/空数据时：KPI `--`；风格分布固定 20 组合补 0；标签固定表补 0；热力固定 20 风格补 0
- [x] 接口成功仍显示接口数据
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空态沿用各自结构（`--` / 全 0 / EmptyState / 零矩阵） |
| 常量/mock/真数据 | mock 文件保留但不再被统计面板引用 |
| 多入口 | 只影响看板统计面板 |
| 失败/缺省 | 失败清空，不回退 |
