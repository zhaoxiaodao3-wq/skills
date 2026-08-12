# 教学风格变化趋势组件卡顿 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-07
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

「教学风格变化趋势」两处卡顿修复：① 图例切换从“整图零值重入场”改为轻量 `setOption`（只更新系列可见性，动画 200ms）；② dataZoom 关闭鼠标悬停自动平移，入场结束后交互更新动画降为 0，滚轮缩放/滑动不再每帧 800ms 动画卡顿。数据变化仍走完整入场动画。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/components/teaching-style-trend/teaching-style-trend-panel.vue` |

## 验收结果

- [x] 图例点击只更新系列，不再整图闪零值重入场
- [x] 图例切换动画 200ms，交互不卡
- [x] 数据到达仍走完整入场动画
- [x] 至少一条系列保持可见
- [x] ESLint 通过
- [x] dataZoom 滚轮/缩放交互即时渲染，不再每帧 800ms 动画卡顿
- [x] 页面滚动时鼠标悬停图表不触发自动平移

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 空态仍零值渲染 |
| 常量/mock/真数据 | N/A | 不改数据 |
| 多入口 | 通过 | 只影响详情页该面板 |
| 失败/缺省 | 通过 | 图例互斥保护保留 |

## 还原度自检

不适用：无 Figma 节点核对；交互优化

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
