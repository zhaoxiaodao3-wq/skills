# 教学小组组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 小组列表 | [6696:14923](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-14923) |
| 成员列表 | [6696:18084](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-18084) |
| 成员空态 | [6696:19145](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-19145) |

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/teaching-group/TeachingGroupView.vue` |
| Container | `src/pages/school/teacher-portrait/components/teaching-group/TeachingGroupContainer.vue` |

## 三、UI 结构

- **小组列表态**：小组名称列表 + 分页
- **成员列表态**：返回 + 小组名 + 成员行（姓名/科目）
- **成员空态**：无成员提示

三态在同一左栏容器内切换。

## 四、视觉规范摘要

- 分页每页 10 条，与教师列表一致
- 空值展示 `--`
- 选中成员高亮，驱动右侧画像数据

## 五、状态定义

| 状态 | 说明 |
|------|------|
| 小组列表 | 默认进入，展示用户所属小组 |
| 成员列表 | 点击小组后进入 |
| 成员空态 | 小组无成员 |

## 六、响应式与交互

- 左栏限高 + 内部滚动（同教师列表）
- 面包屑式返回小组列表

## 七、归档说明

UI 设计阶段归档；业务角色为**教研组长**可见左栏。
