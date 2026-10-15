# 教职工权限回显与保存修复 · 校区型 watch 依赖修正

**模块名：** api-adapter/教职工权限回显与保存修复
**版本：** V1.7.0
**日期：** 2026-09-23
**修正类型：** DELIVERED 后小修正(响应式依赖)

---

## 1. 用户反馈(2026-09-23)

> 校区类型的回显,我先打开一个选了一个校区的没问题正常回显,我再打开另一个选了三个校区的结果还是刚才打开的一个回显

**场景**:
1. 行 A(选了 1 个校区,dataPermissionType='campus')点击【数据权限】 → 弹框勾选 1 个校区 ✓
2. 行 B(选了 3 个校区,dataPermissionType='campus')点击【数据权限】 → **弹框还显示 1 个校区** ❌

## 2. 根因分析

`src/components/faculty/CampusMultiPickerDialog.vue` 的 watch 依赖:

```ts
// 修正前
watch(
  [() => props.modelValue, () => props.skipResetOnOpen],
  ([open, skip]) => {
    if (!open) return
    if (skip) return
    selected.value = [...(props.defaultCampusIds ?? [])]
  },
  { immediate: true },
)
```

**依赖列表只监听 `modelValue` 和 `skipResetOnOpen`,不监听 `defaultCampusIds`**。

**触发链路**:
1. 第 2 次 openEdit(row2):
   - `editingRow.value = row2` 触发
   - `setSkip('campus', false)` 触发(`skipResetByKind.value` 创建新对象 → 触发响应式)
   - `await closeAllDetails()`:campusVisible.value = false(可能 no-op)
   - `await forceOpenDetailByKind('campus')`:
     - `campusVisible.value = false`(no-op)
     - `await nextTick()`
     - `campusVisible.value = true`(从 false 变 true,**理论上应触发 watch**)

2. Vue 3 在某些时序下,即使 `campusVisible` 从 false 变 true,**triggerRef 未触发 watcher 实际执行**(推测:Vue 3 的 pre-flush watcher + parent computed lazy evaluation + child props reactive proxy 之间的时序竞争,导致 watcher 在 parent computed 还未重计算时被调度,读 props.defaultCampusIds 拿到旧值)。

3. `selected` 保留第 1 次的值(1 个校区),UI 仍显示旧勾选。

## 3. 修复

把 `defaultCampusIds` 加进 watch 依赖列表,确保 defaultCampusIds 引用变化必触发 watch。

```ts
// 修正后
watch(
  () => [props.modelValue, props.skipResetOnOpen, props.defaultCampusIds] as const,
  ([open, skip, ids]) => {
    if (!open) return
    if (skip) return
    selected.value = [...(ids ?? [])]
  },
  { immediate: true },
)
```

## 4. 修复影响

- 校区型回显:连续编辑不同行时,弹框正确按新行的 defaultCampusIds 重置 selected
- 上一步/下一步切换:`skipResetOnOpen` 仍被监听,行为不变
- 弹框关闭时:`open=false` 提前 return,行为不变

## 5. 验收

- typecheck:`CampusMultiPickerDialog.vue` 0 新错误(总 51 个 baseline 不变)
- harness:check:无本模块警告

## 6. 遗留 / 待跟进

**5 个 picker-dialog(CCS / CGS / CC / CG / CSS)有相同的 watch 结构**,但用户只报告了校区型问题。如果其他类型在真实数据下也复现类似问题,需要批量修复(同样把 defaultScopes 加进 watch 依赖)。**本次先只修校区型,等用户验证。**

预计受影响文件:
- `src/components/faculty/data-permission/campus-class-subject/campus-class-subject-picker-dialog/campus-class-subject-picker-dialog.vue`
- `src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-picker-dialog/campus-grade-subject-picker-dialog.vue`
- `src/components/faculty/data-permission/campus-class/campus-class-picker-dialog/campus-class-picker-dialog.vue`
- `src/components/faculty/data-permission/campus-grade/campus-grade-picker-dialog/campus-grade-picker-dialog.vue`
- `src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-picker-dialog/campus-stage-subject-picker-dialog.vue`