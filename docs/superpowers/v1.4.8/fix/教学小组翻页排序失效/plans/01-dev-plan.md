# 教学小组翻页排序失效 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1：失败测试（红）

- [ ] 新建 `src/pages/school/teacher-portrait/components/teaching-group/teaching-group-api.spec.ts`
- [ ] 用例：mock `getQuotaGroupPage` 返回乱序（memberCount 混排）列表，`fetchTeachingGroupPageData({ page: 2, ... })` 返回的 `records` 按 `memberCount` 非递增 → **当前实现应失败**
- [ ] 用例：`sortTeachingGroupsByMemberCountDesc` 降序 / 多重集不变 / 同人数集合不变
- [ ] 运行 `npx vitest run src/pages/school/teacher-portrait/components/teaching-group/teaching-group-api.spec.ts` 确认红

## Task 2：修复（绿）

- [ ] `teaching-group-api.ts`：`fetchTeachingGroupPageData` 返回前对 `records` 排序
- [ ] `TeachingGroupContainer.vue`：删除 `loadGroups` 内条件排序块与对应 import
- [ ] 重跑测试确认绿

## Task 3：验证与归档

- [ ] 运行 teacher-portrait 全部测试确认无回归
- [ ] `npx vue-tsc --noEmit`（或项目等价类型检查）
- [ ] `pnpm harness:check`
- [ ] 写 `archive/教学小组翻页排序失效-delivered.md`
