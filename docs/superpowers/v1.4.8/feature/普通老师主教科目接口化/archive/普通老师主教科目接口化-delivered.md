# 普通老师主教科目接口化 · 交付快照

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [plans/01-dev-plan.md](../plans/01-dev-plan.md)
**交付日期：** 2026-07-17

## 变更摘要

| 文件 | 变更 |
|------|------|
| `composables/teacher-profile-basic.ts` | 新增 `fetchMainSubjectByFacultyList`（facultyList 接口 → `mainSubjectName`）；`resolveWhoamiProfile` 的 `subject` 恒 `null`，删除 whoami 本地科目字段读取 |
| `components/teaching-group/teaching-group-api.ts` | `normalizeFacultyListResponse` 导出复用 |
| `teacher-portrait/index.vue` | 普通老师初始化时异步回填 `activeTeacherProfile.subject`，对象同一性竞态守卫，失败静默 |
| `components/teacher-portrait-card/TeacherPortraitCardView.vue` | 文案「主要科目」→「主教科目」 |
| `composables/teacher-profile-basic.spec.ts` | 新增，6 个用例（TDD 先红后绿） |

## 数据流闭环

普通老师科目唯一来源：`facultyList({ tenantId, tenantUserIds: [当前用户] })` → `mainSubjectName` → 页面级 `activeTeacherProfile` → 「我的信息」+ 教师画像卡同步消费。无 whoami 回退路径；接口失败 / 空数据两处显示 `-`。

## 验证记录

- RED：6/6 失败（函数未定义 + subject 非 null）
- GREEN：6/6 通过
- teacher-portrait 全量：51 passed，2 failed 为已知存量失败（`teacher-profile.adapter.spec.ts`、`classroom-structure-clarity/chart-options.spec.ts`）
- `vue-tsc -b`：EXIT=0
- `pnpm harness:check`：本模块无警告

## 待用户联调确认

普通老师身份的浏览器端展示依赖真实登录态（whoami + userInfo.tenantUserId），需在联调环境以普通老师账号验证「我的信息」科目与画像卡「主教科目」展示。
