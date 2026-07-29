# 我的信息组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 左栏普通教师：展示本人统计；单字段缺省；CSS 头像。

**架构：** Container inject聚合数据与当前用户信息；View 纯 Props 驱动；`AvatarInitial.vue` 姓氏头像子组件可复用。

**技术栈：** Vue 3 + Figma MCP

**交付状态：** 已完成（2026-07-03）— `AvatarInitial` / `MyInfoView` / `MyInfoContainer` 已落地，`typecheck` 通过。

---

### 任务 1：姓氏头像子组件

**涉及文件：**
- 新建： `src/pages/school/teacher-portrait/components/my-info/AvatarInitial.vue`

- [x] Props： `name: string`, `bgColor?: string`；取姓氏首字（复姓仅首字）

### 任务 2：View 双态

**涉及文件：**
- 新建： `components/my-info/MyInfoView.vue`

- [x] Figma：`6696:12845`、`6696:20198`
- [x] 每字段独立正常/缺省区域

### 任务 3：Container

**涉及文件：**
- 新建： `components/my-info/MyInfoContainer.vue`

- [x] 仅 `Teacher` 渲染
- [x] inject context；从 aggregate 个人信息段与当前用户信息合并
- [x] `truncateToInteger` 处理上课时长

### 任务 4：验收

- [x] 单字段缺省互不影响；复姓头像取字正确
