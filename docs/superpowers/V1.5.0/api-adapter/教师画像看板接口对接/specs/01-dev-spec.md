# 教师画像看板接口对接 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** api-adapter
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

教师风格画像看板（`mr-teacher-portrait` 组合件）由 mock 切换为接口数据：KPI、风格分布、三类标签、学科热力由 `/statistics` 提供；教师列表与科目下拉由 `/teachers` 提供并支持筛选。

## 2. 现状

- 5 个子面板各自调用 `adapters/portrait-data` 中的 `resolveKpiData / resolveStyleDistribution / resolveTagPanel / resolveTeacherList / resolveHeatmap`（当前全部返回 mock）。
- 教师列表面板在本地 `filterTeachers` 过滤，科目选项为写死 `SUBJECT_OPTIONS`。
- 父组件 `mr-teacher-portrait.vue` 通过 `scenario` prop 控制空态预览。

## 3. 方案

### 3.1 API 层

- 新建 `api/teacher-style-dashboard.ts`：
  - `getTeacherStyleStatistics(dataSourceBindId)` → `POST /cockpit/classroomCmpnt/teacherStyleDashboard/statistics`
  - `getTeacherStyleTeachers(params)` → `POST /cockpit/classroomCmpnt/teacherStyleDashboard/teachers`
- 新建 VO 类型 `api/types/teacher-style-dashboard.vo.ts`。

### 3.2 适配层

- 新建 `adapters/teacher-style-dashboard.adapter.ts`，把 VO 映射为现有视图类型：
  - KPI：`kpi.totalTeachers → analyzedTeacherCount` 等
  - 风格分布：`styleTypeName/dominantStyle/auxiliaryStyle/maleCount/femaleCount`
  - 标签：`speechTags/emotionTags/powerTags → TagPanelModules`，`topTeachers` 用现有头像解析
  - 热力：`subjectStyleMatrix → HeatmapData`（固定 20 组合顺序）
  - 教师：`teachers → TeacherListItem[]`，`subjectOptions` 前插「全部」

### 3.3 数据编排

- 新建 `composables/use-teacher-style-dashboard.ts`：
  - 读 `route.query.dataSourceBindId`（缺省 `1`）
  - 挂载时请求 `/statistics`；`searchTeachers(query)` 请求 `/teachers`
  - `provide` 注入 `statistics / teachers / subjectOptions / loading / searchTeachers / refetch`
- 5 个子面板改为 inject 数据；`scenario === 'empty'` 或接口数据缺失时回退现有 mock（保留 DEV 开关）。

## 4. 验收标准

- [ ] `/statistics` 返回后 KPI/风格分布/标签/热力显示接口数据
- [ ] `/teachers` 返回后列表显示接口教师，科目下拉来自 `subjectOptions`
- [ ] 姓名/科目/性别/风格组合筛选会携带正确参数重新请求
- [ ] 接口失败时面板不崩，回退 mock 或显示空态
- [ ] DEV 空态开关行为不变
- [ ] ESLint 通过

## 5. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | scenario=`empty` 走 mock 空态；接口数据缺失回退 mock |
| 常量/mock/真数据 | API VO → 视图类型走 adapter，头像仍用 `resolveTeacherAvatar` |
| 多入口 | 详情页不受影响；列表跳详情沿用原参数 |
| 失败/缺省 | 请求失败显示空态/回退，不抛错 |
