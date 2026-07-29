# 教学风格与弹性特征组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 完整 | [6696:13183](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13183) |
| 缺省 | [6696:20508](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20508) |
| 情境等级 | 6696:21339 |
| 风格选中 | 6696:21296 |
| 弹性模块 | 6696:21324 |

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/teaching-style-flexibility/TeachingStyleFlexibilityView.vue` |
| Container | `src/pages/school/teacher-portrait/components/teaching-style-flexibility/TeachingStyleFlexibilityContainer.vue` |

## 三、UI 结构

1. 五风格得分卡（grid 5 列）
2. 雷达图面板（330px）+ 详情面板（弹性稳定性 + 情境等级行）

## 四、视觉规范摘要

- 主导风格卡带彩色边框选中态
- 情境标签强/中/弱三色
- 雷达五维标签比例定位（300×313 content）

## 五、状态定义

| 状态 | 说明 |
|------|------|
| 有数据 | 五风格分数 + 雷达 + 情境 |
| 缺省 | 零分灰卡，文案「暂无」 |

## 六、响应式与交互

| 断点 | 行为 |
|------|------|
| 1280–1720 | 雷达+详情上下堆叠，五卡缩小 |
| 1280–1480 | 五卡改 3+2 两行 |
| ≤1279 | 五卡 3 列，body 纵向 |
| ≤767 | 五卡 2 列 / 479 单列 |

## 七、归档说明

Row2 风格行左列；与趋势/结构清晰度并列。
