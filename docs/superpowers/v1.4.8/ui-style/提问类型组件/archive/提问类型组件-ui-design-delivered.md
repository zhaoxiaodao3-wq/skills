# 提问类型组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 完整 | [6696:13589](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13589) |
| 缺省 | [6696:20907](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20907) |

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/question-type/QuestionTypeView.vue` |
| Container | `src/pages/school/teacher-portrait/components/question-type/QuestionTypeContainer.vue` |
| 子面板 | `question-type/QuestionTypePanel.vue` |

## 三、UI 结构

- 标题「提问类型」
- 双卡并排：**四何问题** + **布鲁姆分类**
- 每卡：徽章标题 + 80px 饼图 + 图例 + 橙色小计栏

## 四、视觉规范摘要

- 四何/布鲁姆各自 badge 背景色
- 缺省态饼图保留分类色等分（非灰色）
- 小计栏 `#fffbee` 边框 `#ffaf59`

## 五、状态定义

| 状态 | 说明 |
|------|------|
| 有数据 | sihe + bloom counts |
| 缺省 | 零值环图等分 |

## 六、响应式与交互

| 断点 | 行为 |
|------|------|
| ≤1535 | 底栏提问类型独占一行，双卡可并排 |
| 1280–1365 | 双卡纵向 |
| ≤1279 | 双卡堆叠 |
| ≤767 | padding 12px |

## 七、归档说明

底栏 Row4 左列（设计宽 562px 比例）。
