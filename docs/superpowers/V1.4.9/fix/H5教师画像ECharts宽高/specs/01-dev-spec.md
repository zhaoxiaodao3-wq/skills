# H5教师画像ECharts宽高 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**日期：** 2026-07-22

## 目标

所有教师画像图表正确填满外层容器。

## 方案

1. `MrEcharts`：去掉宽高 transition；mount/`setOption` 后 `nextTick`+`rAF` resize；观察自身与父节点  
2. 面板：外层写死宽高，图表 `width/height=100%` 绝对铺满；雷达用独立 slot，不把 absolute 直接打在图表根上

## 验收

- [x] 柱/环/雷达/趋势无裁切、无 0 高  
- [x] 滚动/旋转后仍正确（ResizeObserver）
