# 驾驶舱教师画像详情图表加载动画 · 交付快照

**模块：** feature/驾驶舱教师画像详情图表加载动画  
**实现仓：** data-cockpit `mr-teacher-portrait/detail`

## 交付摘要

1. 新增 `detail/composables/tp-chart-animation.ts`（800ms / cubicOut；空态与 reduced-motion 关动画）。  
2. 全部 ECharts option builder 接入 `resolveTpChartAnimation`。  
3. Panel 层重复 reduce-motion 逻辑已删除。  
4. 个人标签云：width 0→目标 0.8s 过渡。  
5. 语言可理解度 gauge：reduced-motion 时瞬时到位。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `resolveTpChartAnimation(!isEmpty/!showEmptyChart)`；标签云 `isDefaultEmpty` 瞬时到位 |
| 常量/mock/真数据 | N/A | 仅动效，不改数据映射 |
| 多入口 | N/A | 仅详情页 |
| 失败/缺省 | 通过 | 空态关动画；减动效关动画 |

## 还原度自检

不适用：无 Figma / 动效增强

## 验收勾选

- [x] ECharts 统一入场基线  
- [x] 空态无生长动画  
- [x] 标签云 CSS 生长  
- [x] gauge reduced-motion  
