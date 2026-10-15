# Dev Spec：教职工岗位管理-picker-dialog-关闭时清空内部状态

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 状态：P2 已确认（hotfix 模式）
> Spec 版本：v1.0 / 2026-09-23

## 1. 目标

修复 picker-dialog 关闭时不清空内部状态（selected/rows）的 bug，避免第二次走创建流程时 race condition 导致 picker-dialog 保留上次选的内容。

## 2. 详细变更

### 2.1 CampusMultiPickerDialog watch modelValue=false

**变更前**：
```ts
watch(
  () => props.modelValue,
  async (open) => {
    if (!open)
      return
    const list = await service.school.facultyCampusList(props.schoolId)
    campusList.value = (list ?? []).map((c: any) => ({ id: String(c.id), name: String(c.name ?? '') }))
    if (!props.skipResetOnOpen) {
      selected.value = [...props.defaultCampusIds]
    }
  },
  { immediate: true },
)
```

**变更后**：
```ts
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) {
      // 关闭时立即清空 selected，避免第二次走创建流程时 race condition 保留上次内容
      selected.value = []
      return
    }
    const list = await service.school.facultyCampusList(props.schoolId)
    campusList.value = (list ?? []).map((c: any) => ({ id: String(c.id), name: String(c.name ?? '') }))
    if (!props.skipResetOnOpen) {
      selected.value = [...props.defaultCampusIds]
    }
  },
  { immediate: true },
)
```

### 2.2 5 个 picker-dialog watch modelValue=false

每个 picker-dialog 的 watch：

**变更前**：
```ts
watch(() => props.modelValue, (open) => {
  if (!open)
    return
  if (!props.skipResetOnOpen)
    rows.value = initScopes(props.defaultScopes ?? [])
})
```

**变更后**：
```ts
watch(() => props.modelValue, (open) => {
  if (!open) {
    // 关闭时立即清空 rows，避免第二次走创建流程时 race condition 保留上次内容
    rows.value = [null]
    return
  }
  if (!props.skipResetOnOpen)
    rows.value = initScopes(props.defaultScopes ?? [])
})
```

### 2.3 composable onDetailClosed 加 setSkip(kind, false)

**变更前**：
```ts
function onDetailClosed(kind: DetailDialogKind) {
  if (activeKind.value !== kind)
    return
  activeKind.value = null
  if (kind === 'campus') campusVisible.value = false
  if (kind === 'campus_grade_subject') cgsVisible.value = false
  if (kind === 'campus_class_subject') ccsVisible.value = false
  if (kind === 'campus_class') campusClassVisible.value = false
  if (kind === 'campus_grade') campusGradeVisible.value = false
  if (kind === 'campus_stage_subject') campusStageSubVisible.value = false
  if (!editingRow.value) {
    options.setFigure1Visible(false)
    options.resetFigure1()
  }
}
```

**变更后**：
```ts
function onDetailClosed(kind: DetailDialogKind) {
  if (activeKind.value !== kind)
    return
  activeKind.value = null
  if (kind === 'campus') campusVisible.value = false
  if (kind === 'campus_grade_subject') cgsVisible.value = false
  if (kind === 'campus_class_subject') ccsVisible.value = false
  if (kind === 'campus_class') campusClassVisible.value = false
  if (kind === 'campus_grade') campusGradeVisible.value = false
  if (kind === 'campus_stage_subject') campusStageSubVisible.value = false
  // 防御：保证关闭详情时显式把 skip 设回 false，
  // 防止 race condition（picker-dialog 关闭时 internal state 未清空）导致第二次走创建流程时残留上次内容
  setSkip(kind, false)
  if (!editingRow.value) {
    options.setFigure1Visible(false)
    options.resetFigure1()
  }
}
```

### 2.4 不变更

| 项 | 状态 |
|---|---|
| 5 个 picker-dialog 模板 / emit / props / submit / 校验 | 不动 |
| 5 个 cascader.vue / cascader.model.ts / cascader.util.ts | 不动 |
| picker-dialog.util.ts（filterScopes / initScopes / canRemoveRow） | 不动 |
| 校区型弹窗的 props（skipResetOnOpen 保留） | 不动 |
| skipResetOnOpen 判断缺失（hotfix 已完成） | 保留 |
| 前端异常判断全部交由后端（已 DELIVERED） | 保留 |
| registry / types / page / service / mocks | 不动 |

## 3. 行为对照表

| 场景 | 变更前 | 变更后 |
|---|---|---|
| 校区类型 picker-dialog：选 A → 关弹窗 → 重新点分配岗位 → 进 picker-dialog | **仍显示 A** ✗ | **空** ✓ |
| CGS/CCS/CC/CSE：选 scope → 关弹窗 → 重新走创建 | **仍显示上次 scope** ✗ | **空** ✓ |
| 编辑模式打开 picker-dialog → 选 → 上一步 → 下一步（prevStep 设 skip=true） | rows 保留 ✓ | rows 保留 ✓（按 `skipResetOnOpen=true` 跳过 reset） |
| 提交成功后 → closeAllDetails → 重走创建 | selected 清空 ✓ | selected 清空 ✓ |
| prevStep → 重新进入同 kind picker-dialog | rows 保留 ✓ | rows 保留 ✓ |
| 跨 kind 切换（如 CG → CGS） | 各自重置 ✓ | 各自重置 ✓ |

## 4. 验收清单

- [ ] ripgrep `rows.value = \[null\]` 在 5 个 picker-dialog 都命中
- [ ] ripgrep `selected.value = \[\]` 在 CampusMultiPickerDialog 命中
- [ ] ripgrep `setSkip(kind, false)` 在 composable onDetailClosed 命中
- [ ] race condition 不再导致 picker-dialog 残留上次内容
- [ ] prevStep 设 skip=true 行为不变（上一步 → 下一步保留 rows）
- [ ] ESLint 0 error
- [ ] `pnpm harness:check` EXIT 0

## 5. 风险与回归门禁

| 风险 | 应对 |
|---|---|
| prevStep 设 skip=true 被误清空 | 关闭路径 `rows = [null]` 是直接关 picker-dialog；prevStep 路径是父组件调 picker-dialog emit('prevStep')，不触发 picker-dialog 关闭，所以 watch(modelValue=false) 不会触发 ✓ |
| 编辑模式打开 picker-dialog 关闭时清空 selected/rows → 下次打开重置为 defaultScopes | 符合预期 ✓ |
| 校区型弹窗的 selected 在 race 期间被清空但用户没保存 → 用户必须重新选 | 符合"新建流程清空表单"业务规则 ✓ |

## 6. 实施档位

**轻量档 Inline**：7 个文件各加 2-5 行，零跨文件接口修改，无 Figma / 性能 / 跨页面风险。