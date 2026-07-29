# 教师列表组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 左栏教师列表：分页、搜索、重置、空态、选中首条并通知页面。

**架构：** Container 负责列表 Mock/API + 权限；View 纯展示；`emit('select')` 驱动页面 `activeTeacherId`。

**技术栈：** Vue 3 + Element Plus + Figma MCP

**前置依赖：** `教师画像完整页面` 实施计划任务 1–4（context 已就绪）

**交付状态：** 已完成（2026-07-03）— `TeacherListContainer` / `TeacherListView` 已落地并接入页面，`typecheck` 通过。

---

### 任务 1：Mock 数据与类型

**涉及文件：**
- 新建： `src/pages/school/teacher-portrait/mock/teacher-list.mock.ts`
- 新建： `src/pages/school/teacher-portrait/components/teacher-list/types.ts`

- [x] 定义 `TeacherListItem { id, name, ... }`，Mock 25+ 条（多页）、0 条（空态）
- [x] 导出 `fetchTeacherListMock({ page, pageSize: 10, keyword? })`

### 任务 2：Figma 还原 View

**涉及文件：**
- 新建： `src/pages/school/teacher-portrait/components/teacher-list/TeacherListView.vue`

- [x] Figma MCP：`6696:15974`（列表）、`6696:17036`（空态）
- [x] 搜索框 + 图标/回车触发；重置按钮；`ElPagination` 每页 10 条
- [x] 行选中态样式；scoped CSS

### 任务 3：Container 逻辑

**涉及文件：**
- 新建： `src/pages/school/teacher-portrait/components/teacher-list/TeacherListContainer.vue`

- [x] 非 `Admin/SchoolAdmin` 不渲染（由页面 `v-if` 控制；Container 内已移除二次角色校验以支持 RoleDebugBar）
- [x] Props： `selectedTeacherId`；Emits： `select(teacherId: string)`, `listEmpty()`
- [x] 首次加载有数据且未选中 → `emit('select', records[0].id)`
- [x] 空列表 → `emit('listEmpty')` 或页面监听后设 `activeTeacherId=null`
- [x] 空关键词搜索 → 重置第一页全量

### 任务 4：接入页面

**涉及文件：**
- 修改： `src/pages/school/teacher-portrait/teacher-portrait/index.vue`

- [x] `v-if="flags.isAdmin || flags.isSchoolAdmin"` 挂载 Container
- [x] `@select="handleTeacherSelect"`

### 任务 5：验收

- [x] 搜索/重置/分页正确
- [x] 有数据默认选首条；无数据右侧缺省
