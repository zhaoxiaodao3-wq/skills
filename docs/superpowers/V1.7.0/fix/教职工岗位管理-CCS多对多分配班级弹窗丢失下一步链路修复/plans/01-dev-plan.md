# Dev Plan：教职工岗位管理-CCS多对多分配班级弹窗丢失下一步链路修复

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

> 状态：P3 已确认（标准档）
> Plan 版本：v1.0 / 2026-09-24

## 1. 范围

4 文件 86 行变更，恢复 CCS（校区+班级+科目）MANY_TO_MANY 分配的三步链路（**图1 → 班级弹窗 → 科目弹窗 → 提交**）。

| 步骤 | 操作 | 验证 |
|---|---|---|
| 1 | session 加 `openSubjectPermissionDialog` option + `manyToManyGoingToNext` 标记 | ripgrep `openSubjectPermissionDialog` 命中 |
| 2 | `openManyToManyClassPermission` 调用班级弹窗时附 `singleMode + onBack + onNext` | ripgrep `singleMode: true,` 命中 |
| 3 | `onManyToManyClassPermissionClosed` 加 `manyToManyGoingToNext` 守卫 | ripgrep `manyToManyGoingToNext` 命中 2 处 |
| 4 | `faculty-position.vue` 加 `subjectListGoingBack` + `openSubjectListForAssignDialog` + `onSubjectListVisible` + 注入 `openSubjectPermissionDialog` | ripgrep `openSubjectListForAssignDialog` 命中 |
| 5 | `faculty-position.vue` 科目弹窗模板换 `v-model:visible` 为受控 + `@update:visible` | 模板行 ripgrep 命中 |
| 6 | `faculty-position.vue` `handleSinglePosition` 重置 CCS 中间态 | ripgrep `subjectListGoingBack = false` 命中 |
| 7 | `SelectClassListDialog.handleAssignSubmit` 顺序：先 `onNext` 再 `emit` | ripgrep `props.data.onNext` 命中在 `emit('update:visible', false)` 之前 |
| 8 | `SelectSubjectListDialog.handleSingleSubmit` 按 `data.id` 分支 | ripgrep `if (props.data?.id)` 命中 |
| 9 | `vue-tsc --noEmit` | EXIT 0 |
| 10 | archive + harness 验证 | EXIT 0 |

## 2. 验收

- [ ] ripgrep `singleMode: true,` 在 session 命中
- [ ] ripgrep `openSubjectPermissionDialog` 在 session 和 page 均命中
- [ ] ripgrep `manyToManyGoingToNext` 在 session 命中 2 处（声明 + 守卫）
- [ ] ripgrep `subjectListGoingBack` 在 page 命中 3 处（声明 + 设置 + 守卫）
- [ ] ripgrep `if (props.data?.id)` 在 SelectSubjectListDialog 命中
- [ ] `vue-tsc --noEmit` EXIT 0
- [ ] `pnpm harness:check` EXIT 0
- [ ] `pnpm harness:status` 当前模块 DELIVERED

## 3. 风险

| 风险 | 概率 | 缓解 |
|---|---|---|
| 班级弹窗关闭时序错（emit 先于 onNext → 父级误回滚） | 中 | 步骤 7 调换 `handleAssignSubmit` 顺序；`manyToManyGoingToNext` 守卫 |
| 科目弹窗「上一步」误回滚 | 中 | 步骤 4 步 5 加 `subjectListGoingBack` 标记 + `onSubjectListVisible` 守卫 |
| 跨会话残留（再次分配时上次的 `subjectListGoingBack=true`） | 低 | 步骤 6 `handleSinglePosition` 重置中间态 |
| 占位行泄漏（中途取消但未走任何回滚路径） | 低 | 班级/科目两条关闭路径都接到回滚守卫 |
| 破坏 1对1 / CGS / CC / CG / CSE 路径 | 0 | 5 个 picker-dialog 零改动 |
| 破坏批量分配（`faculty/index.vue` `batchMode=true`） | 0 | `handleBatchSubmit` 不动；`handleSingleSubmit` 无 id 走 `saveSchoolTenantUserPost` |
| 破坏老「科目权限」行操作（`subjectListDialog`） | 0 | `singleMode=false` 走 `handleSubmit`，不动 |
| ESLint 警告 | 低 | 收尾 ESLint 验证 |
| Figma 还原度 | 不适用 | 纯逻辑修复，无 UI 变更 |

## 4. 工时预估

- session 修改 3 处 ≈ 4 分钟
- `faculty-position.vue` 修改 4 处 ≈ 5 分钟
- `SelectClassListDialog` 顺序调整 ≈ 1 分钟
- `SelectSubjectListDialog` 分支添加 ≈ 2 分钟
- vue-tsc 验证 ≈ 1 分钟
- archive + harness 验证 ≈ 2 分钟
- 合计 ~15 分钟

## 5. 实施顺序

按依赖顺序：

1. **session 加 option / 标记 / 调用附 singleMode**（核心改动）
2. **`SelectSubjectListDialog` handleSingleSubmit 分支**（与 #1 配合）
3. **`SelectClassListDialog` handleAssignSubmit 顺序**（与 #1 配合）
4. **`faculty-position.vue` 接 openSubjectPermissionDialog + 加守卫 + 重置中间态**（收尾）
5. **vue-tsc + ESLint 验证**
6. **archive 写盘**

每步独立可回滚。