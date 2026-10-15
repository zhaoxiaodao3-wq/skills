# Dev Spec：教职工岗位管理-CCS多对多分配班级弹窗丢失下一步链路修复

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 状态：P2 已确认（标准档 · bug 修复）
> Spec 版本：v1.0 / 2026-09-24

## 1. 目标

恢复 CCS（校区+班级+科目）MANY_TO_MANY 分配的三步链路：**图1 → 班级弹窗（singleMode）→ 科目弹窗（singleMode）→ 提交**。

不动 picker-dialog 体系，不动 1对1 / CGS / CC / CG / CSE 路径，不动批量分配（`faculty/index.vue` 的 `batchMode=true` 流程）。

## 2. 详细变更

### 2.1 `useFacultyDataPermissionSession.ts` — 补齐 3 步链路

#### 2.1.1 新增 option

```ts
export interface FacultyDataPermissionSessionOptions {
  ...
  /** 多对多：打开现有班级权限弹窗（由页面注入） */
  openClassPermissionDialog?: (row: FacultyPostRowLike) => void
  /** 多对多：打开现有科目权限弹窗（由页面注入），data 来自班级弹窗 onNext */
  openSubjectPermissionDialog?: (data: any) => void
}
```

#### 2.1.2 新增 `manyToManyGoingToNext` 标记

```ts
let manyToManyClassDialogCommitted = false
/** 多对多：班级 → 科目过渡标记，true 时关闭班级弹窗不回滚占位 */
let manyToManyGoingToNext = false
```

#### 2.1.3 `openManyToManyClassPermission` 调班级弹窗时附 singleMode + onBack + onNext

**变更前**：
```ts
options.openClassPermissionDialog(row)
```

**变更后**：
```ts
options.openClassPermissionDialog({
  ...row,
  singleMode: true,
  // 上一步：回到图 1（占位行会在班级弹窗关闭时由 onManyToManyClassPermissionClosed 回滚）
  onBack: () => {
    options.setFigure1Visible(true)
  },
  onNext: (data: any) => {
    // 进入下一步（科目弹窗）→ 班级弹窗关闭时不回滚占位
    manyToManyGoingToNext = true
    options.openSubjectPermissionDialog?.(data)
  },
})
```

并在开头初始化标记：
```ts
pendingManyToManyAssignId.value = row.id
manyToManyClassDialogCommitted = false
manyToManyGoingToNext = false  // 新增
```

#### 2.1.4 `onManyToManyClassPermissionClosed` 加守卫

```ts
async function onManyToManyClassPermissionClosed() {
  // CCS 多对多链路：班级已确认 → 正在切到科目弹窗，不回滚占位
  if (manyToManyGoingToNext) {
    manyToManyGoingToNext = false
    return
  }
  ...existing rollback logic
}
```

### 2.2 `faculty-position.vue` — 接上 `openSubjectPermissionDialog`

#### 2.2.1 加 `subjectListGoingBack` 与 `openSubjectListForAssignDialog`

```ts
const subjectListForAssignDialog = reactive({ visible: false, data: null as any })
const classListForAssignDialog = reactive({ visible: false, data: null as any })

/** CCS 多对多：科目弹窗正在「上一步」回班级弹窗，关闭时不回滚占位 */
let subjectListGoingBack = false

/** CCS 多对多：开科目弹窗（接班级弹窗 onNext） */
function openSubjectListForAssignDialog(data: any) {
  subjectListForAssignDialog.data = {
    ...data,
    // 科目弹窗「上一步」→ 关闭科目、重开班级弹窗（保留已选 classList / subjectList）
    onBack: (subjectData: any) => {
      subjectListGoingBack = true
      subjectListForAssignDialog.visible = false
      classListDialog.openDialog(subjectData)
    },
  }
  subjectListForAssignDialog.visible = true
}
```

#### 2.2.2 注入 `openSubjectPermissionDialog`

```ts
useFacultyDataPermissionSession({
  ...
  openClassPermissionDialog: row => classListDialog.openDialog(row),
  openSubjectPermissionDialog: openSubjectListForAssignDialog,
})
```

#### 2.2.3 科目弹窗模板：换 `v-model:visible` 为受控 + 自定义 `update:visible` 守卫

**变更前**：
```vue
<select-subject-list-dialog
  v-model:visible="subjectListForAssignDialog.visible" :data="subjectListForAssignDialog.data"
  @submit-success="refreshList"
/>
```

**变更后**：
```vue
<select-subject-list-dialog
  :visible="subjectListForAssignDialog.visible"
  :data="subjectListForAssignDialog.data"
  @submit-success="onClassListSubmitSuccess"
  @update:visible="onSubjectListVisible"
/>
```

#### 2.2.4 加 `onSubjectListVisible` 守卫

```ts
/** CCS 多对多：科目弹窗关闭 → 未提交且非「上一步」则回滚占位行 */
async function onSubjectListVisible(visible: boolean) {
  subjectListForAssignDialog.visible = visible
  if (!visible) {
    if (subjectListGoingBack) {
      subjectListGoingBack = false
      return
    }
    await onManyToManyClassPermissionClosed()
  }
}
```

#### 2.2.5 `handleSinglePosition` 重置 CCS 中间态

```ts
async function handleSinglePosition() {
  singleAssignForm.selectedUserId = tenantUserId.value ?? ''
  // 新会话：清空 CCS 多对多中间态，防止跨会话残留
  subjectListGoingBack = false
  subjectListForAssignDialog.visible = false
  classListForAssignDialog.visible = false
  await beginAssignSession()
  updateSavePositionOptions()
  nextTick(() => {
    batchFormRef.value?.clearValidate()
  })
}
```

### 2.3 `SelectClassListDialog.vue` — 调整 `handleAssignSubmit` 顺序

**变更前**（先 emit 再 onNext → 父级关闭班级弹窗时已回滚占位）：
```ts
emit('update:visible', false)
if (props.data?.onNext) {
  props.data.onNext({...props.data, classIds, classList})
}
```

**变更后**（先 onNext 设 `manyToManyGoingToNext=true`，再 emit 关闭）：
```ts
if (props.data?.onNext) {
  props.data.onNext({
    ...props.data,
    classIds: params.value.classIds,
    classList: multipleSelection.value,
  })
}
emit('update:visible', false)
```

### 2.4 `SelectSubjectListDialog.vue` — `handleSingleSubmit` 按 `data.id` 分支

**变更前**（无脑调 `saveSchoolTenantUserPost`）：
```ts
await service.operate.saveSchoolTenantUserPost({
  tenantPostId: props.data?.tenantPostId,
  tenantUserId: props.data?.tenantUserId,
  classIds: props.data?.classIds || [],
  subjectIds,
  saveFacultyPermission: true,
})
```

**变更后**（占位行走 `updateFacultyPermission`，老单步链路保留 `saveSchoolTenantUserPost`）：
```ts
const subjectIds = multipleSelection.value.map(item => item.id)
// CCS 多对多新链路：占位行已有 id → 走 updateFacultyPermission 补齐 classIds+subjectIds
// 老 84b8d87 单步链路：无 id → 走 saveSchoolTenantUserPost 一次性创建
if (props.data?.id) {
  await service.school.updateFacultyPermission({
    id: props.data.id,
    classIds: props.data?.classIds || [],
    subjectIds,
  })
}
else {
  await service.operate.saveSchoolTenantUserPost({
    tenantPostId: props.data?.tenantPostId,
    tenantUserId: props.data?.tenantUserId,
    classIds: props.data?.classIds || [],
    subjectIds,
    saveFacultyPermission: true,
  })
}
```

## 3. 不变更

| 项 | 状态 |
|---|---|
| 5 个 picker-dialog（CGS / CCS / CC / CG / CSE） | **不动** |
| 5 个 cascader.vue | **不动** |
| `CampusMultiPickerDialog.vue` | **不动** |
| `cascader.util.ts` / `picker-dialog.util.ts` / `model.ts` | **不动** |
| `useFacultyDataPermissionSession` 的其他逻辑（`openEdit` / `prevStep` / `onFigure1Close` / `onDetailClosed` / `onDetailSubmit`） | **不动** |
| `service/school.ts` / `service/operate.ts` 接口 | **不动** |
| `faculty/index.vue` 批量分配（`batchMode=true`） | **不动** |
| mocks / types / constants / registry | **不动** |
| `faculty-position.vue` 列表 / Figure 1 / 5 个 picker-dialog 模板 | **不动** |
| `SelectClassListDialog.vue` 的 `handleSubmit`（无 singleMode 的「确定」路径仍走它） | **不动** |

## 4. 行为对照表

| 场景 | 变更前 | 变更后 |
|---|---|---|
| 图1 → CCS MANY_TO_MANY → 下一步 | 班级弹窗只显示「确定」 | 班级弹窗显示「上一步」「下一步」 |
| 班级弹窗选完班级 → 点击 | 直接 updateFacultyPermission（subjectIds 空） | 弹出科目弹窗 |
| 科目弹窗选完 → 点击 | 弹窗不弹 | updateFacultyPermission（id + classIds + subjectIds）落库 |
| 班级弹窗「上一步」 | 无 onBack | setFigure1Visible(true) + 占位回滚 |
| 科目弹窗「上一步」 | 无 onBack | 重开班级弹窗、保留 classList 选中、不回滚 |
| 班级弹窗取消（X） | 现有 onClassListVisible → 回滚 | 同左 |
| 科目弹窗取消（X） | 无守卫，占位行泄漏 | onSubjectListVisible → 回滚 |
| 1对1 / CGS / CC / CG / CSE | 走 picker-dialog（5 个不动） | 同左 |
| 批量分配（`faculty/index.vue` `batchMode=true`） | 走 handleBatchSubmit | 不受影响 |
| 行操作「科目权限」（subjectListDialog） | 走 handleSubmit（无 singleMode） | 不受影响 |

## 5. 验收清单

- [ ] `useFacultyDataPermissionSession.openManyToManyClassPermission` 调用班级弹窗时 data 含 `singleMode: true` + `onBack` + `onNext`
- [ ] session 提供 `openSubjectPermissionDialog` option
- [ ] `manyToManyGoingToNext` 在班级弹窗关闭时被守卫（不会回滚占位）
- [ ] `faculty-position.vue` 注入 `openSubjectPermissionDialog` 接 `subjectListForAssignDialog`
- [ ] 科目弹窗 `submit-success` → `onClassListSubmitSuccess` → 刷新列表
- [ ] 科目弹窗 `update:visible(false)` → `onSubjectListVisible` → 回滚或跳过（按 `subjectListGoingBack`）
- [ ] `SelectClassListDialog.handleAssignSubmit` 顺序：先 `onNext` 再 `emit('update:visible', false)`
- [ ] `SelectSubjectListDialog.handleSingleSubmit` 按 `data.id` 分支
- [ ] `vue-tsc --noEmit` EXIT 0

## 6. 风险与回归门禁

| 风险 | 应对 |
|---|---|
| session 内班级关闭时序错（emit 先于 onNext） | `handleAssignSubmit` 调换顺序；`manyToManyGoingToNext` 守卫 |
| 科目弹窗「上一步」误回滚 | `subjectListGoingBack` 标记守卫 |
| 跨会话状态残留（再次打开分配岗位时残留上次的 goingBack） | `handleSinglePosition` 重置中间态 |
| 占用行泄漏（用户中途取消但未走任何回滚路径） | 班级/科目两条关闭路径都接到回滚守卫 |
| 破坏 1对1 / CGS / CC / CG / CSE 路径 | 5 个 picker-dialog 零改动 |
| 破坏批量分配（`faculty/index.vue`） | `batchMode=true` 走 `handleBatchSubmit`，不动；`handleSingleSubmit` 无 id 仍走 `saveSchoolTenantUserPost` |
| 破坏老「科目权限」行操作（`subjectListDialog`） | `singleMode=false` 走 `handleSubmit`，不动 |
| 顺序错乱引发首屏闪烁 | 全部是闭包内同步赋值，Vue 渲染批次合并 |

## 7. 实施档位

**标准档**：4 文件 86 行变更，含 1 处弹窗顺序调整 + 1 处按字段分支 + 1 处 session option 扩展。无 Figma / 像素对照需求；纯逻辑链路补齐。

---

> **不要扩大范围**：本模块不重构 picker-dialog 体系，不动 `useFacultyDataPermissionSession` 其他逻辑，不重构 84b8d87 → 6800a3a 的整体架构。