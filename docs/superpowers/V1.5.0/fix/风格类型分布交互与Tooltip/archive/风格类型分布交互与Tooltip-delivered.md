# 风格类型分布交互与 Tooltip · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-08-03  
**版本：** V1.5.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

将风格类型分布从自定义 DOM 条改回 ECharts 横向堆叠条；Tooltip `appendToBody`。定位回调返回图表局部坐标，由 ECharts `transformLocalCoord` 换到 body（曾误用 getBoundingClientRect 导致双重偏移，已修正）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps/data-cockpit/.../style-distribution-panel/style-distribution-panel.vue` |
| 改 | `apps/data-cockpit/.../style-distribution-panel/style-distribution-panel.util.ts` |

## 验收结果

- [x] 风格分布为 ECharts，非自定义 DOM 条列表 tip
- [x] Hover tip 可溢出面板外（appendToBody），无外层 overflow:auto 列表
- [x] tip 挂 body，position 经 getBoundingClientRect 校正
- [x] 卸载 dispose，切空态 dispose
- [x] 空态 / 排序 / formatTooltipHtml 占比截断保持

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | `isEmpty` → empty-state；有数据才 init |
| 常量/mock/真数据 | 通过 | 仍 `resolveStyleDistribution` + `toSortedRows` |
| 多入口 | N/A | 仅本子组件 |
| 失败/缺省 | 通过 | empty 不挂图 |

## 还原度自检

- Figma 节点：8048:37661（交互 fix，条色/ tip 字段色）
- 对照方式：代码色值与 formatTooltipHtml
- 偏差清单：ECharts 条无稿面轨道底 `rgba(40,220,209,0.2)` 条纹底（可接受，非本 fix 范围）
- 结论：可交付

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
