# 教师画像看板接口对接 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 教师画像看板由 mock 切换为两个后端接口，筛选联动。

**Architecture:** API 文件 + VO 类型 + adapter 映射 + `useTeacherStyleDashboard` provide/inject；5 个面板 inject 数据，`scenario=empty` 或数据缺失时回退 mock。

**Tech Stack:** Vue 3 + TypeScript（data-cockpit）

## Global Constraints

- 只改 `apps/data-cockpit/src/views/preview/mr-teacher-portrait/` 下文件
- 不改详情页与头像逻辑
- 保留 DEV 空态开关

---

### Task 1：API + 类型

**Files:**
- Create: `api/teacher-style-dashboard.ts`
- Create: `api/types/teacher-style-dashboard.vo.ts`

- [ ] Step 1: 定义 `getTeacherStyleStatistics` / `getTeacherStyleTeachers`（`@miray/utils` request，`VITE_API_BASE_URL`）
- [ ] Step 2: 定义 VO：`KpiVO / StyleDistributionVO / TagVO / TagTeacherVO / SubjectStyleMatrixVO / TeacherItemVO / TeacherListRspVO`

### Task 2：adapter 映射

**Files:**
- Create: `adapters/teacher-style-dashboard.adapter.ts`

- [ ] Step 1: `adaptTeacherStyleStatistics` → KPI/风格分布/标签/热力视图类型
- [ ] Step 2: `adaptTeacherStyleTeachers` → `TeacherListItem[]` + 科目选项

### Task 3：数据编排 composable

**Files:**
- Create: `composables/use-teacher-style-dashboard.ts`

- [ ] Step 1: 读取 `dataSourceBindId`，挂载请求 statistics
- [ ] Step 2: `searchTeachers(query)` 映射筛选参数并请求 teachers
- [ ] Step 3: provide/inject key 与 loading/refetch

### Task 4：5 个面板切接口

**Files:**
- Modify: `components/kpi-strip/kpi-strip.vue`
- Modify: `components/style-distribution-panel/style-distribution-panel.vue`
- Modify: `components/teacher-list-panel/teacher-list-panel.vue`
- Modify: `components/tag-panel/tag-panel.vue`
- Modify: `components/subject-style-heatmap/subject-style-heatmap.vue`

- [ ] Step 1: kpi/style/tag/heatmap inject statistics 数据，scenario=empty 回退 mock
- [ ] Step 2: teacher-list 用接口 teachers + subjectOptions，筛选改调 `searchTeachers`

### Task 5：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教师画像看板接口对接-delivered.md`

- [ ] Step 1: ESLint 全量改动文件通过
- [ ] Step 2: 打开 restore-implement 预览页，确认接口数据渲染、筛选请求正确
- [ ] Step 3: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [ ] Step 4: `harness:check` + `harness:status` DELIVERED；不 commit
