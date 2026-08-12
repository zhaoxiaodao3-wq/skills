# 教学风格变化趋势组件卡顿 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

「教学风格变化趋势」图例切换不再触发整图重入场，改为轻量更新，交互顺滑。

## 2. 方案

只改 `teaching-style-trend-panel.vue`：

- 新增 `syncSeriesVisibility()`：`chart.setOption(option, false)`，附加 `animationDurationUpdate: 200`，仅更新系列可见性。
- 拆分 watcher：
  - `props.data`（deep + immediate）→ `renderChart()`（完整入场）
  - `seriesVisible` → `syncSeriesVisibility()`
- 保留 `toggleSeries` 至少一条线可见的逻辑与空态行为。

## 3. 验收标准

- [x] 图例点击只更新系列，不再整图闪零值重入场
- [x] 图例切换动画 200ms，交互不卡
- [x] 数据到达仍走完整入场动画
- [x] 至少一条系列保持可见
- [x] ESLint 通过
- [x] dataZoom 滚轮/缩放交互即时渲染，不再每帧 800ms 动画卡顿
- [x] 页面滚动时鼠标悬停图表不触发自动平移

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空态仍零值渲染 |
| 常量/mock/真数据 | N/A：不改数据 |
| 多入口 | 只影响详情页该面板 |
| 失败/缺省 | 图例互斥保护保留 |
