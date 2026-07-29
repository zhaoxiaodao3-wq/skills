# 课堂结构清晰度组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 完整 | [6696:13387](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13387) |
| 缺省 | [6696:20705](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20705) |
| 等级五档 | 6696:21348 |

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/classroom-structure-clarity/ClassroomStructureClarityView.vue` |
| Container | `src/pages/school/teacher-portrait/components/classroom-structure-clarity/ClassroomStructureClarityContainer.vue` |
| 等级图标 | `classroom-structure-clarity/assets/mr-general-statistics.svg` |

## 三、UI 结构

- 标题「课堂结构清晰度」
- ECharts 四维度条形图（**167px** 高）
- 综合得分卡（奖杯图标）+ 综合等级卡（统计 SVG 图标 + pill）
- 课堂特征描述卡

## 四、视觉规范摘要

- 四维度配色独立（目标/环节/逻辑/总结）
- 总分整数截断，映射卓越/良好/中等/较弱/薄弱五档
- 等级 pill 边框/背景/文字色随档位变化

## 五、状态定义

| 状态 | 说明 |
|------|------|
| 有数据 | dimensions + 总分等级 |
| 缺省 | 零分，`--` / 「暂无」 |

## 六、响应式与交互

| 断点 | 行为 |
|------|------|
| ≤1659 | summary 纵向，`height: auto` |
| 1280–1535 | 图表 150px |
| ≤767 | padding 收紧 |

## 七、归档说明

`趋势-stack` 列下部；综合等级图标被语言可理解度组件复用。
