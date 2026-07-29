# 教学小组翻页排序失效 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

教学小组组件任意分页数据**恒**按 `memberCount` 降序展示（同人数随机），排序与 UI 选中态彻底解耦，逻辑闭环。

## 2. 根因

`TeachingGroupContainer.vue#loadGroups` 的排序守卫 `!selectedGroupId.value` 与 v1.4.8 的「初始自动选中 + 选中保持」互斥：首次加载后 `selectedGroupId` 恒非空，翻页时排序恒被跳过。

## 3. 修复方案：排序下沉到数据层

**原则：** 排序是页数据的**不变量**，不是 UI 的条件行为。

### 3.1 `teaching-group-api.ts`

`fetchTeachingGroupPageData` 在映射完成后、返回前，对 `records` 调用 `sortTeachingGroupsByMemberCountDesc`：

```ts
const result = mapTeachingGroupPageResponse(response)
return { ...result, records: sortTeachingGroupsByMemberCountDesc(result.records) }
```

任何调用方取到的页数据必然已排序，不存在绕过路径。

### 3.2 `TeachingGroupContainer.vue`

删除 `loadGroups` 中的条件排序块（原 105-110 行）及 `sortTeachingGroupsByMemberCountDesc` 的 import。容器不再承担排序职责。

### 3.3 不变的行为（回归约束）

| 行为 | 来源 | 保持 |
|------|------|------|
| 初始自动选中仅一次（`hasInitialAutoSelected`） | v1.4.8 §3.2 | ✅ |
| 翻页 / 返回不自动选中 | v1.4.8 §3.4 | ✅ |
| 选中保持 + 高亮隔离（`visibleSelectedMemberId`） | v1.4.8 §3.3 | ✅ |
| 同人数随机、每次加载重新 shuffle | v1.4.8 §7 | ✅ |
| 仅排当前页（服务端分页，页内排序） | v1.4.8 §7 | ✅ |
| debug 模式重置 | v1.4.8 §3.4 | ✅ |

## 4. 测试（TDD）

新增 `src/pages/school/teacher-portrait/components/teaching-group/teaching-group-api.spec.ts`：

1. **失效场景复现（红→绿）：** mock `getQuotaGroupPage` 返回乱序列表，断言 `fetchTeachingGroupPageData` 任意页（page=1 / page=2）返回 `records` 均满足 `memberCount` 非递增 —— 与调用方状态无关
2. `sortTeachingGroupsByMemberCountDesc`：降序不变量、元素多重集不变、同人数元素集合不变
3. `mapTeachingGroupPageResponse` 的 `memberIdsByGroupId` 映射不受排序影响

## 5. 验收标准

- [ ] 新测试全绿；`fetchTeachingGroupPageData` 返回值恒降序
- [ ] 容器中不存在任何条件排序分支
- [ ] 现有 teacher-portrait 相关测试无回归
- [ ] 类型检查通过
