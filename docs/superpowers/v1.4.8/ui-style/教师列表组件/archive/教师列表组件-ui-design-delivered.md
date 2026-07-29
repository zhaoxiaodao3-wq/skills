# 教师列表组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 有数据 | [6696:15974](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-15974) |
| 空态 | [6696:17036](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-17036) |

所属项目：明睿开发稿 · 团队星版

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/teacher-list/TeacherListView.vue` |
| Container | `src/pages/school/teacher-portrait/components/teacher-list/TeacherListContainer.vue` |

## 三、UI 结构

- 栏目标题「教师列表」+ 蓝色竖条
- 搜索框 + 重置按钮
- 教师行：姓名、科目、选中高亮
- 底部分页（每页 10 条）
- 空态插画 + 文案

## 四、视觉规范摘要

- 左栏宽度随整页 `aside` 比例伸缩，小屏限高后**内部滚动**
- 选中行背景 `#f3f9ff`，主色 `#027aff`
- 列表区 `overflow-y: auto`，与左栏其他面板一致

## 五、状态定义

| 状态 | 触发条件 |
|------|----------|
| 有数据 | 接口返回教师列表 |
| 空态 | 列表为空或筛选无结果 |
| 选中 | 用户点击某教师行 |

## 六、响应式与交互

- 整页 `≤1023px`：左栏移至顶部，`max-height: min(360px, 42vh)`，列表在左栏内滚动
- 右栏 `main` 始终独立滚动，非整页滚动

## 七、归档说明

本文档为 **UI 设计阶段**交付归档，记录 Figma 对照关系与最终实现路径，供验收与后续迭代参照。开发规格以 `specs/` 为准。
