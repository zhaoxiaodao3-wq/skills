# 教师画像小组分页 sortField · 实施计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

### Task 1: API 入参 + 去掉前端排序

- [x] Step 1: `getQuotaGroupPage({ ..., sortField: 'memberCount' })`
- [x] Step 2: 移除 `sortTeachingGroupsByMemberCountDesc` 与 `shuffleArray`
- [x] Step 3: 更新单测
- [x] Step 4: 单测通过（3/3）

### Task 2: Harness 交付

- [x] Step 1: `pnpm harness:check`
- [x] Step 2: 勾选 spec；写 archive
- [x] Step 3: status → DELIVERED
