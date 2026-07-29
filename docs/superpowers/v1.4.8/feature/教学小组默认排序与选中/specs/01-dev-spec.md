# 教学小组默认排序与选中 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

教师画像「教学小组」组件在**首次进入**时：对当前页小组按人数降序排序（同人数随机），若第一组有人则静默选中其第一名成员并高亮小组；**不进入成员列表视图**。之后一切交互由用户驱动。

## 2. 范围

| 在范围内 | 不在范围内 |
|----------|------------|
| `TeachingGroupContainer.vue` 排序与初始化选中逻辑 | 成员列表 UI 改版 |
| `teaching-group-api.ts` 抽取排序工具函数 | 后端接口变更 |
| 小组高亮（已有 `--selected` 样式复用） | 翻页/返回时再次自动选中 |
| 首次进入自动驱动右侧教师画像 | 教师列表组件行为 |

## 3. 行为规格

### 3.1 小组排序

**触发条件：** `selectedGroupId === null` 且当前为小组列表视图（`groups` / `groups-empty`）

**规则：**
1. 对**当前页** `groups` 按 `memberCount` **降序**
2. 相同 `memberCount` 的小组之间**随机**顺序（Fisher-Yates shuffle 同档内元素）
3. 翻页后：仅排序，**不**触发初始化选中

### 3.2 初始化选中（仅一次）

**触发条件：** 组件 `onMounted` 首次 `loadGroups` 成功返回后，且满足：
- `hasInitialAutoSelected === false`（组件级 flag，挂载后只尝试一次）
- `groups.length > 0`
- 排序后第一组 `memberCount > 0`

**行为：**
1. 设置 `selectedGroupId` / `selectedGroupName` → 小组列表**高亮**该组
2. **保持** `view = 'groups'`，不调用切换至 `members` 的逻辑
3. 后台拉取该组成员（复用 `fetchTeachingGroupMembersByFacultyList`），取 ordered 列表**第一个人**
4. `emit('selectMember', firstMember)` → 驱动右侧教师画像
5. 设置 `hasInitialAutoSelected = true`

**不触发初始化选中的情况：**
- 排序后第一组 `memberCount === 0`（当前页全员为 0）→ 只展示小组列表
- `groups` 为空 → 保持 `groups-empty`
- 成员拉取失败或列表为空 → 不 emit，flag 仍置 true（避免重复尝试）

### 3.3 选中保持 + 高亮隔离（新增）

**规则：**
1. 一旦用户选中了任意成员（props.selectedMemberId 非空），后续所有翻页、切换小组操作均**不取消**当前选中。只有用户主动点击另一个成员时才变更选中。
2. 成员高亮**仅在当前所在小组内生效**：选中 A 小组的成员后，切换到 B 小组查看时，即使该成员同时存在于 B 小组，也不高亮。高亮与小组绑定。

**实现要点：**
- `handleSelectGroup` 不再 emit `selectMember(null)`
- `loadMembersForGroup` 移除 `preserveSelection` 参数及所有 `emit('selectMember', null)` 调用
- 移除不再需要的 `isSelectedMemberInGroup` 辅助函数
- 新增 `visibleSelectedMemberId` computed：检查 props.selectedMemberId 是否属于当前 selectedGroupId 的成员列表，不属于时返回 null，传给 View 层控制高亮

### 3.4 用户交互

| 操作 | 行为 |
|------|------|
| 点击小组 | 进入成员列表视图，加载成员，清除自动选中语义 |
| 点击成员 | emit 选中成员 |
| 返回小组列表 | 清空选中，回到 groups 视图，**不**再次自动选中 |
| 翻页 | 重新 loadGroups + 排序，**不**自动选中 |
| debug 模式切换 | 重置所有状态含 flag，重新 mount 等价于首次进入 |

## 4. 技术方案

### 4.1 新增工具函数

文件：`teaching-group-api.ts`

```ts
export function sortTeachingGroupsByMemberCountDesc(
  groups: TeachingGroupItem[],
): TeachingGroupItem[]
```

- 按 `memberCount` 降序分组
- 每组内 Fisher-Yates 随机
- 纯函数，便于单测

### 4.2 Container 改动

文件：`TeachingGroupContainer.vue`

1. 新增 `hasInitialAutoSelected = ref(false)`
2. `loadGroups` 成功后：若 `!selectedGroupId`，调用排序函数
3. 新增 `tryInitialAutoSelect()`：
   - 检查 flag + 第一组 memberCount
   - 设置 selectedGroupId/Name
   - 拉成员 → emit 第一人
   - flag = true
4. `loadMembersForGroup` 增加参数 `options?: { stayInGroupsView?: boolean }`：
   - `stayInGroupsView: true` 时不改 `view`，不清空 emit
5. `onMounted`：`loadGroups()` → `tryInitialAutoSelect()`
6. `handleGroupPageChange` / `handleBack`：不调用 `tryInitialAutoSelect`
7. `watch(debugDataMode)`：重置 `hasInitialAutoSelected = false`

### 4.3 View 层

**无需改动**。`selectedGroupId` 已有高亮样式 `teaching-group-view__group-item--selected`。

## 5. 数据流

```
onMounted
  └─ loadGroups()
       ├─ fetch page data
       ├─ sort (if no selectedGroupId)
       └─ tryInitialAutoSelect() [once]
            ├─ set selectedGroupId/Name
            ├─ fetch members (background)
            └─ emit selectMember(first)

用户点击小组
  └─ loadMembersForGroup(id) → view = 'members'
```

## 6. 验收标准

- [x] 首次进入：当前页小组按人数降序，同人数顺序随机
- [x] 首次进入：第一组 memberCount > 0 时，高亮第一组、右侧展示第一人画像，**不进入成员列表**
- [x] 首次进入：第一组 memberCount === 0 时，只展示小组，无选中
- [x] 翻页后：仅排序，不自动选中成员
- [x] 返回小组列表后：不自动选中
- [x] 用户点击小组/成员：行为与改前一致
- [x] 选中成员后：切换小组不取消选中，右侧画像保持当前成员
- [x] 选中成员后：翻页（小组/成员）不取消选中
- [x] 选中成员高亮仅在其所属小组内生效，跨小组不高亮
- [x] debug 模式切换：重新走首次初始化逻辑
- [x] 无小组：空态不变

## 7. 风险与边界

| 场景 | 处理 |
|------|------|
| 第一组有 memberCount 但 facultyList 返回空 | 不 emit，flag 置 true |
| 排序与分页 | 仅排当前页 10 条，符合需求 |
| 同人数随机 | 每次 loadGroups 重新 shuffle，翻页也会 shuffle |
