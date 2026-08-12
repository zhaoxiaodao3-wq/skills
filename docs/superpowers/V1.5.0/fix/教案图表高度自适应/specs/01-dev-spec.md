# 教案图表高度自适应 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

教师画像详情页「我的教案」图表高度自动撑满面板可用高度，不再被 `230px` / `300px` 上限截断。

## 2. 方案

只改 `my-lesson-plan.vue` 的 SCSS：

- 基础样式：`.tp-my-lesson-plan__chart-wrap` 删除 `max-height: 230px`，保留 `flex: 1 1 0` + `min-height: 160px`。
- `@media (max-width: 1298px)`：父容器高度由固定 `300px` 改为 `100%`，`chart-wrap` 由固定 `300px` 改为 `height: 100%; max-height: none`。
- `@container` 与移动端块不变（已自适应或固定 220px）。

ECharts 已有 `ResizeObserver` 在入场后挂载，容器尺寸变化会自动 `resize()`，无需改 JS。

## 3. 验收标准

- [x] 面板可用高度大于 230px 时图表撑满，不再留白
- [x] 1298px 断点横向布局时图表同样撑满
- [x] 移动端图高仍为 220px
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空态图表零值渲染不受影响 |
| 常量/mock/真数据 | N/A：仅样式 |
| 多入口 | 只影响详情页「我的教案」 |
| 失败/缺省 | 容器最小高度 160px 保留 |
