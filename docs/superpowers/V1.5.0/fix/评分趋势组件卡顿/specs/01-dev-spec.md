# 评分趋势组件卡顿 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

「评分趋势」dataZoom 交互即时渲染：关闭 `moveOnMouseMove`，入场后 `animationDurationUpdate = 0`。

## 2. 方案

- `score-trend-chart-options.ts`：inside dataZoom `moveOnMouseMove: false`，保留滚轮平移 `moveOnMouseWheel: true`。
- `score-trend-panel.vue`：入场播完后（deferred RO 回调内）`chart.setOption({ animationDurationUpdate: 0 }, false)`。

## 3. 验收标准

- [x] 滚轮滑动内容即时渲染，不卡
- [x] 页面滚动时鼠标悬停图表不自动平移
- [x] 入场动画仍为 800ms
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空态零值渲染不变 |
| 常量/mock/真数据 | N/A：不改数据 |
| 多入口 | 只影响详情页评分趋势 |
| 失败/缺省 | slider / inside dataZoom 交互保留 |
