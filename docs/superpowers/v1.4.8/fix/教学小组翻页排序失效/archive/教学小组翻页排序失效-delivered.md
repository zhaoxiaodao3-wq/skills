# 教学小组翻页排序失效 · 交付快照

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [plans/01-dev-plan.md](../plans/01-dev-plan.md)
**交付日期：** 2026-07-17

## 变更摘要

| 文件 | 变更 |
|------|------|
| `teaching-group-api.ts` | `fetchTeachingGroupPageData` 返回前对 `records` 调用 `sortTeachingGroupsByMemberCountDesc`，排序成为页数据不变量 |
| `TeachingGroupContainer.vue` | 删除 `loadGroups` 中依赖 `!selectedGroupId` 的条件排序块及对应 import |
| `teaching-group-api.spec.ts` | 新增，6 个用例（TDD：先红后绿） |

## 根因回顾

v1.4.8 排序守卫 `!selectedGroupId.value` 与「初始自动选中 + 选中保持」互斥：首次加载后 `selectedGroupId` 恒非空，翻页触发的 `loadGroups()` 恒跳过排序。修复将排序下沉到数据层，消除所有可绕过排序的状态路径。

## 验证记录

- RED：`fetchTeachingGroupPageData` 排序用例 2 failed（复现 bug）
- GREEN：6/6 passed
- teacher-portrait 全量测试：45 passed，2 failed 为存量失败（stash 验证与本次改动无关：`teacher-profile.adapter.spec.ts`、`classroom-structure-clarity/chart-options.spec.ts`）
- `vue-tsc -b`：EXIT=0
- `pnpm harness:check`：本模块无警告

## 验收对照

- [x] 任意分页恒按 memberCount 降序（数据层不变量 + 单测）
- [x] 同人数随机（沿用 shuffle，单测校验集合不变）
- [x] 翻页不自动选中（`hasInitialAutoSelected` 逻辑未动）
- [x] 选中保持与高亮隔离未回归（相关逻辑未动）
- [x] 容器中不存在条件排序分支
