# 教学小组默认排序与选中 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 教学小组组件首次进入时按人数降序排序当前页小组，静默选中第一组第一名成员并高亮小组，不进入成员列表视图。

**Architecture:** 在 `teaching-group-api.ts` 抽取纯函数排序；在 `TeachingGroupContainer.vue` 用 `hasInitialAutoSelected` flag 控制一次性初始化选中，复用现有成员拉取逻辑但不切换 view。

**Tech Stack:** Vue 3 Composition API, TypeScript

---

### Task 1: 排序工具函数

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teaching-group/teaching-group-api.ts`
- Create: `src/pages/school/teacher-portrait/components/teaching-group/teaching-group-api.test.ts`（若项目有 vitest 惯例则加，否则手动验证）

- [ ] **Step 1:** 新增 `shuffleArray<T>(items: T[]): T[]`（Fisher-Yates）
- [ ] **Step 2:** 新增 `sortTeachingGroupsByMemberCountDesc(groups: TeachingGroupItem[]): TeachingGroupItem[]`
  - 按 `memberCount` 降序分组
  - 每组内 shuffle 后拼接
- [ ] **Step 3:** export 两个函数

```ts
export function sortTeachingGroupsByMemberCountDesc(
  groups: TeachingGroupItem[],
): TeachingGroupItem[] {
  const buckets = new Map<number, TeachingGroupItem[]>()
  for (const g of groups) {
    const count = g.memberCount ?? 0
    const list = buckets.get(count) ?? []
    list.push(g)
    buckets.set(count, list)
  }
  const counts = [...buckets.keys()].sort((a, b) => b - a)
  return counts.flatMap((c) => shuffleArray(buckets.get(c)!))
}
```

---

### Task 2: Container 排序集成

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teaching-group/TeachingGroupContainer.vue`

- [ ] **Step 1:** import `sortTeachingGroupsByMemberCountDesc`
- [ ] **Step 2:** 在 `loadGroups` 成功赋值 `groups.value = result.records` 后，若 `!selectedGroupId.value`，调用排序并赋回 `groups.value`
- [ ] **Step 3:** 翻页 `handleGroupPageChange` 走同一 `loadGroups` 路径，自动获得排序，不触发选中

---

### Task 3: 一次性初始化选中

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teaching-group/TeachingGroupContainer.vue`

- [ ] **Step 1:** 新增 `const hasInitialAutoSelected = ref(false)`
- [ ] **Step 2:** 新增 `async function tryInitialAutoSelect()`：
  - 若 `hasInitialAutoSelected.value` → return
  - 若 `groups.value.length === 0` → `hasInitialAutoSelected = true`; return
  - 取 `groups.value[0]`，若 `memberCount <= 0` → `hasInitialAutoSelected = true`; return
  - 设置 `selectedGroupId` / `selectedGroupName`
  - 拉成员：`fetchTeachingGroupMembersByFacultyList`（复用缓存逻辑）
  - 有第一人 → `emit('selectMember', first)`；**不改 view**
  - `hasInitialAutoSelected = true`
- [ ] **Step 3:** `onMounted` 改为 `async () => { await loadGroups(); await tryInitialAutoSelect() }`
- [ ] **Step 4:** `watch(debugDataMode)` 重置 `hasInitialAutoSelected = false`
- [ ] **Step 5:** `handleBack` / `handleGroupPageChange` **不**调用 `tryInitialAutoSelect`
- [ ] **Step 6:** 新增 `visibleSelectedMemberId` computed：仅当 `props.selectedMemberId` 属于当前 `selectedGroupId` 的成员时才透传给 View，否则传 null

---

### Task 3b: 选中保持（修订）

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teaching-group/TeachingGroupContainer.vue`

- [ ] **Step 1:** `handleSelectGroup` 移除 `preserveSelection` 逻辑与 `emit('selectMember', null)`
- [ ] **Step 2:** `loadMembersForGroup` 移除 `preserveSelection` 参数及所有 `emit('selectMember', null)` 调用
- [ ] **Step 3:** 移除不再需要的 `isSelectedMemberInGroup` 函数

---

### Task 4: 验证与交付

- [ ] **Step 1:** 改 `src/` 前运行 `pnpm harness:check`
- [ ] **Step 2:** lint 检查改动文件
- [ ] **Step 3:** 手动验证：首次进入高亮+画像、全页无人、翻页不选中、点击小组进成员列表
- [ ] **Step 4:** 勾选 spec 验收项
- [ ] **Step 5:** 写 `archive/教学小组默认排序与选中-delivered.md`
- [ ] **Step 6:** 改 `src/` 后再跑 `pnpm harness:check`
