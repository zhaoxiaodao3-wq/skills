# 关联章节章节点拼接 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1：CreateCourseDialog 路径拼接 + 回填兼容

**文件：** `src/pages/course/components/CreateCourseDialog.vue`

- [x] 新增 `findChapterPathLabel`
- [x] `setOptsForm` 改用路径拼接
- [x] `findIdByLabel` 支持路径优先 + 末段回退（顶层回退，避免子树误匹配）
- [x] 教材版本 `findLabelInTree` 不变

## Task 2：CreateAITeachingDiagnosisDialog 路径拼接

**文件：** `src/pages/school/components/CreateAITeachingDiagnosisDialog.vue`

- [x] 新增本地 `findChapterPathLabel`
- [x] `handleCreateSubmit` 改用路径拼接

## Task 3：自检与交付

- [x] `pnpm harness:check`
- [x] 勾选 spec 验收项并写 archive
