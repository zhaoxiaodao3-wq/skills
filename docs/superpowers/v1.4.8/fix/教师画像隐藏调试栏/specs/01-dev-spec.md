# 教师画像隐藏调试栏 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景与目标

教师画像页 `index.vue` 顶部挂载了开发调试组件 `RoleDebugBar`（角色切换 / mock 开关）。现需在页面上隐藏该栏，方式为**注释模板用法**，便于本地联调时快速恢复。

附加交付：审查页内各区块是否已对接真实接口（审查结论见第 5 节，不纳入本次代码改动）。

## 2. 方案（已确认）

在 `src/pages/school/teacher-portrait/teacher-portrait/index.vue` 的 `<template>` 中，将 `<RoleDebugBar ... />` 整段注释掉。

- 不删除 `RoleDebugBar.vue` 文件
- 不强制清理 `debugRole` / debug（保留以便取消注释后立即可用；lint 若报未使用再作最小处理）
- 不改 `teacher-portrait-debug` 默认值（`useMock` 已为 `false`）

## 3. 非目标

- 不做 `v-if="import.meta.env.DEV"` 条件展示
- 不删除调试 composable / mock 分支
- 不新增业务接口对接
- 不修复 whoami 回落 `teacher-001` 等历史问题

## 4. 验收标准

- [x] 页面顶部不再渲染 `RoleDebugBar`
- [x] `RoleDebugBar` 相关代码以注释形式保留在 `index.vue`，可一眼恢复
- [x] 默认仍走登录角色 + `getTeacherProfile` / `getTeachingStatistics` HTTP（mock 默认关）
- [x] 接口对接审查结论已写入本 spec 第 5 节

## 5. 接口对接审查结论（只读）

默认 `teacherPortraitUseMockData = false` 时：

| 区块 | 接口 / 数据源 | 状态 |
|------|---------------|------|
| 教师列表 | `querySchoolUserPage` | 已对接 |
| 教研组 | `getQuotaGroupPage` + `facultyList` | 已对接 |
| 我的信息 | whoami + `teachingStatistics` | 已对接 |
| 教师画像卡 | `personalFeature` + `teachingStatistics` | 已对接 |
| 我的教案 | `getTeacherProfile.myLessonPlan` | 已对接 |
| 课堂内容评价 | `postClassReport` | 已对接 |
| 教学风格弹/灵活度 | `teachingStyleElasticity` | 已对接 |
| 教学风格趋势 | `teachingStyleTrend` | 已对接 |
| 课堂结构清晰度 | `classroomClarity` | 已对接 |
| 个人标签云 | `personalTagCloud` | 已对接 |
| 提问类型 | `questionType` | 已对接 |
| 课堂语言行为 | `speakingBehavior` | 已对接 |
| 语言可理解度 | `speakingComprehensibility` | 已对接 |

**结论：页面业务内容均已对接真实接口；无未对接业务模块。**

残留注意（本次不改）：

1. whoami 无 userId 时回落 `DEFAULT_MOCK_TEACHER_ID`
2. 组件内仍保留 mock/API 双分支，仅调试开关打开时走 fixture
