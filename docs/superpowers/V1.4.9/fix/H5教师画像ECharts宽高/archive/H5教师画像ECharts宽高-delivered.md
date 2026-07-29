# H5教师画像ECharts宽高 · 交付归档

**归档类型：** fix  
**归档日期：** 2026-07-22  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

修复 H5 教师画像页 ECharts 宽高：`MrEcharts` 可靠 resize + 去掉 size transition；面板改为「外层定尺寸、图表 100% 铺满」。

## A · 一致性自检

| 项 | 结果 |
|----|------|
| 空态/有数据 | 仅布局，数据路径不变 |
| 多入口 | 公共 `MrEcharts`；运动页仍可用显式 px 高 |

## 还原度自检

不适用（布局 bugfix，非 Figma 新还原）。

## Harness

- [x] archive + validate
