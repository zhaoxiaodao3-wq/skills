# 课堂语言行为组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 完整 | [6696:13645](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13645) |
| 缺省 | [6696:20962](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20962) |

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/classroom-language-behavior/ClassroomLanguageBehaviorView.vue` |
| Container | `src/pages/school/teacher-portrait/components/classroom-language-behavior/ClassroomLanguageBehaviorContainer.vue` |

## 三、UI 结构

- 标题「课堂语言行为」
- 左：**120px** 环图
- 右：**180px** 图例（色点 + 标签 + 份数 + 占比%）
- 底：橙色小计「小计 N 个」

## 四、视觉规范摘要

- 五类语言行为固定配色
- 占比 1 位小数截断
- 内边距 32×16（窄屏 20px）

## 五、状态定义

| 状态 | 说明 |
|------|------|
| 有数据 | items + subtotal |
| 缺省 | 零值环图 |

## 六、响应式与交互

| 断点 | 行为 |
|------|------|
| 1280–1535 | 环图+图例上下排列 |
| ≤1279 | body wrap 居中 |
| ≤767 | 纵向居中，padding 16px |

## 七、归档说明

底栏 Row4 中列（设计宽 380px 比例）。
