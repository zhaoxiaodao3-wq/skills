# 教学风格变化趋势组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 完整 | [6696:13277](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13277) |
| 缺省 | [6696:20597](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20597) |
| 图表区 | 6696:13289 |

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/teaching-style-trend/TeachingStyleTrendView.vue` |
| Container | `src/pages/school/teacher-portrait/components/teaching-style-trend/TeachingStyleTrendContainer.vue` |
| 图表配置 | `teaching-style-trend/trend-chart-options.ts` |

## 三、UI 结构

- 标题「教学风格变化趋势」
- 图例：主导风格（蓝圈白心）、辅助风格（绿圈白心）
- ECharts 折线/散点趋势图，图表区 **155px** 高

## 四、视觉规范摘要

- 纵轴固定五类教学风格
- 横轴报告序号 A1…Z99 / a1…z99
- 单屏默认 26 点，超出支持 dataZoom

## 五、状态定义

| 状态 | 说明 |
|------|------|
| 有数据 | reports 序列映射主导/辅助风格 |
| 缺省 | 空轴占位标签 |

## 六、响应式与交互

| 断点 | 行为 |
|------|------|
| ≤1659 | 图表区固定 `155px`（避免 flex 高度塌陷导致 ECharts 不渲染） |
| 1280–1535 | header 换行 |
| ≤767 | 标题/图例纵向 |

## 七、归档说明

位于 `trend-stack` 列上部，下方为课堂结构清晰度。
