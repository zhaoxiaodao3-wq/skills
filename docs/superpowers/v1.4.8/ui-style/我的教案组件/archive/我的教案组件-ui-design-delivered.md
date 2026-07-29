# 我的教案组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 有数据 | [6696:13950](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13950) |
| 缺省 | [6696:20250](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20250) |

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/my-lesson-plan/MyLessonPlanView.vue` |
| Container | `src/pages/school/teacher-portrait/components/my-lesson-plan/MyLessonPlanContainer.vue` |
| 图表 | `my-lesson-plan/chart-options.ts` |

## 三、UI 结构

- 标题「我的教案」+ 蓝色竖条
- 左：等级图例（色点 + 名称 + 数量 + 占比）
- 右：ECharts 柱状图（230px 高）

## 四、视觉规范摘要

- 等级配色固定（优秀/良好/合格/待改进等）
- 占比保留 1 位小数，**截断不四舍五入**
- 图表区边框 `#f2f3f5`

## 五、状态定义

| 状态 | 说明 |
|------|------|
| 有数据 | 各等级 count/ratio 来自接口 |
| 缺省 | 占比 `--`，柱图灰色占位 |

## 六、响应式与交互

| 断点 | 行为 |
|------|------|
| 1280–1687 | 图例+图表可换行，图表 `min-width` 降低 |
| 1280–1439 | 图例与图表上下堆叠 |
| ≤1279 | 与 Hero 画像纵向排列 |

## 七、归档说明

Hero 行右侧列；ECharts 经 `useTeacherPortraitChart` + ResizeObserver 自适应。
