# 教学小组组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 左栏小组管理员：小组列表 → 成员列表三态；选中成员后 `emit('selectMember', teacherId)`。

**架构：** 内部状态 `view: 'groups' | 'members' | 'members-empty'`；独立列表 Mock；空值 `--`。

**技术栈：** Vue 3 + Element Plus + Figma MCP

**交付状态：** 已完成（2026-07-03）— 三态视图与 Container 已落地并接入页面，`typecheck` 通过。

---

### 任务 1：Mock

**涉及文件：**
- 新建： `src/pages/school/teacher-portrait/mock/teaching-group.mock.ts`

- [x] 多小组、多成员、某小组零成员场景

### 任务 2：View 三态

**涉及文件：**
- 新建： `components/teaching-group/TeachingGroupView.vue`

- [x] Figma：`6696:14923`、`6696:18084`、`6696:19145`
- [x] 分页每页 10 条；成员选中态

### 任务 3：Container

**涉及文件：**
- 新建： `components/teaching-group/TeachingGroupContainer.vue`

- [x] 仅 `GroupAdmin` 渲染（由页面 `v-if` 控制；Container 内已移除二次角色校验以支持 RoleDebugBar）
- [x] 点击小组 → 成员列表；无成员 → 空态
- [x] `emit('selectMember', id | null)`：仅选小组未选成员时为 `null`

### 任务 4：接入页面 + 验收

- [x] 未选成员时 `activeTeacherId` 保持 null
- [x] 选成员后触发聚合请求
