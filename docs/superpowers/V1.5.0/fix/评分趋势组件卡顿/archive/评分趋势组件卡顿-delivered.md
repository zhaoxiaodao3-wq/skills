# 评分趋势组件卡顿 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-07
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

「评分趋势」dataZoom 交互优化：关闭鼠标悬停自动平移（`moveOnMouseMove: false`），入场动画结束后 `animationDurationUpdate` 设为 0，滚轮滑动/滑块拖动即时渲染，不再每帧 800ms 动画卡顿。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/components/classroom-content-eval/score-trend-chart-options.ts` |
| 改 | `.../score-trend-panel.vue` |

## 验收结果

- [x] 滚轮滑动内容即时渲染，不卡
- [x] 页面滚动时鼠标悬停图表不自动平移
- [x] 入场动画仍为 800ms
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 空态零值渲染逻辑未改 |
| 常量/mock/真数据 | N/A | 不改数据 |
| 多入口 | 通过 | 只影响详情页评分趋势 |
| 失败/缺省 | 通过 | slider / inside dataZoom 交互保留 |

## 还原度自检

不适用：交互优化，无 UI 还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
