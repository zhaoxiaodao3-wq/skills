# 学科风格人次分布高度定高 · 交付归档

**归档类型：** ui-style 交付快照  
**归档日期：** 2026-08-03  
**版本：** V1.5.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

热力组件改为相对 1920 稿宽驱动 `scale`，格子宽高同比缩放；高度随「行数×(24×scale)+底栏」内容定高，不再均分父级剩余高度挤扁格子。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps/data-cockpit/.../subject-style-heatmap/subject-style-heatmap.vue` |
| 改 | `apps/data-cockpit/src/constants/canvas-design.ts`（`TEACHER_PORTRAIT_CONTENT_HEIGHT` 1580） |

## 验收结果

- [x] 1920 设计宽附近：行高视觉接近 24，20 行可读，色阶不压矩阵
- [x] 缩窄 / 拉宽容器：格子宽高同比变化，不出现「扁条」或「只拉宽」
- [x] 高度随行数与 scale 变，不填满父级留白去挤扁格子
- [x] 有数据 / 空态（全 0）均可预览
- [x] 改动文件以 `subject-style-heatmap.vue` 为主；非必要不改其它面板

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `resolveHeatmap('empty'|'full')` 同一 `resolveLayout` / `buildOption` |
| 常量/mock/真数据 | 通过 | `DESIGN` 对齐 Figma 8048:38471；mock 科目/风格序未改 |
| 多入口 | N/A | 仅热力单组件入口 |
| 失败/缺省 | 通过 | 空态全 0 矩阵仍绘制，无星球占位 |

## 还原度自检

- Figma 节点：`8048:38471`（整卡参考 `8048:37563`）
- 对照方式：MCP `get_design_context` / screenshot + 实现 `DESIGN`×`scale`
- 偏差清单：字号设下限 10px；`TEACHER_PORTRAIT_CONTENT_HEIGHT` 为防裁切预估，非稿面逐像素锁高
- 结论：可交付

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
