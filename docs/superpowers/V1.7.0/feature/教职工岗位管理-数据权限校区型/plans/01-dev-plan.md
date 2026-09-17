# 教职工岗位管理 · 数据权限（校区型）· 实施计划

> **For engineer:** 按任务顺序执行；每完成一个 Task 即 commit。**禁止**跳步 / 合并跳步 / 改实现前未 `pnpm harness:status` 看到 `READY_TO_DEV`。
> **业务上下文：** `faculty-position.vue`（明睿 AI 校园管理平台 · client-web v0.0.0 · port 5173）

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Goal:** 在已有"分配岗位"弹框流程上新增【数据权限】维度（本期仅校区型），并升级列表【所属校区】渲染 + 追加【数据权限】操作入口；所有数据前端 mock。

**Architecture:**
- 新增 3 个组件 + 1 个 composable
- 复用 `AppTagClampTooltip`、`useGeneralDialog`、现有 service 接口
- mock 数据按接口分子文件，集中在 `src/mocks/faculty-position/`
- 单一 service 切换点（`USE_MOCK` 标志）

**Tech Stack:** Vue 3 + TypeScript + Element Plus + axios + Pinia · VueUse `useAsyncState` · 项目现有 `useGeneralDialog`

---

## Task 1：常量与枚举集中管理

> **Skill:** — 无（纯 TS 枚举） · 置信度 — · 自动激活
> **理由:** 纯数据结构，不涉及 UI / 渲染 / 业务逻辑

**Files:**
- Create: `src/constants/faculty.ts`

**Step 1：写常量文件**

```ts
// src/constants/faculty.ts

/** 数据权限枚举值（与后端约定，v1） */
export enum DataPermissionEnum {
  CAMPUS = 'campus',                  // 校区
  CAMPUS_GRADE_SUB = 'campus_grade_sub',   // 校区+年级+科目
  CAMPUS_CLASS_SUB = 'campus_class_sub',   // 校区+班级+科目
  CAMPUS_CLASS = 'campus_class',           // 校区+班级
  CAMPUS_GRADE = 'campus_grade',           // 校区+年级
  CAMPUS_STAGE_SUB = 'campus_stage_sub',   // 校区+学段+科目
  ALL = '__all__',                          // 全量（前端排除项，不通过接口下发）
}

/** 本期实现范围 */
export const DATA_PERMISSION_IMPLEMENTED: DataPermissionEnum[] = [
  DataPermissionEnum.CAMPUS,
]

/** 操作结果码（用于重复分配） */
export const AssignResultCode = {
  OK: 'OK',
  ALREADY_EXISTS: 'ALREADY_EXISTS', // 该岗位已存在且数据权限相同
  SERVER_ERROR: 'SERVER_ERROR',
} as const
```

**Step 2：commit**

```bash
git add src/constants/faculty.ts
git commit -m "feat(faculty): 数据权限枚举与操作结果码常量"
```

---

## Task 2：mock 数据准备（6 个文件）

> **Skill:** — 无（mock 数据生成） · 置信度 — · 自动激活
> **理由:** 纯数据，无 UI

**Files:**
- Create: `src/mocks/faculty-position/index.ts`
- Create: `src/mocks/faculty-position/data-permission-enums.ts`
- Create: `src/mocks/faculty-position/campus-list.ts`
- Create: `src/mocks/faculty-position/faculty-post-list.ts`
- Create: `src/mocks/faculty-position/assign.ts`
- Create: `src/mocks/faculty-position/update.ts`

**Step 1：枚举列表**

```ts
// src/mocks/faculty-position/data-permission-enums.ts
import { DataPermissionEnum } from '@/constants/faculty'

export function getDataPermissionEnums(_postId: string) {
  return [
    { value: DataPermissionEnum.CAMPUS,           label: '校区' },
    { value: DataPermissionEnum.CAMPUS_GRADE_SUB, label: '校区+年级+科目' },
    { value: DataPermissionEnum.CAMPUS_CLASS_SUB, label: '校区+班级+科目' },
    { value: DataPermissionEnum.CAMPUS_CLASS,     label: '校区+班级' },
    { value: DataPermissionEnum.CAMPUS_GRADE,     label: '校区+年级' },
    { value: DataPermissionEnum.CAMPUS_STAGE_SUB, label: '校区+学段+科目' },
  ]
}
```

**Step 2：校区列表（4 个）**

```ts
// src/mocks/faculty-position/campus-list.ts
export function getCampusList(_schoolId: string) {
  return [
    { id: 'c1', name: 'A校区' },
    { id: 'c2', name: 'B校区' },
    { id: 'c3', name: 'C校区' },
    { id: 'c4', name: 'D校区' },
  ]
}
```

**Step 3：教职工岗位列表（含图3 第7行演示数据）**

```ts
// src/mocks/faculty-position/faculty-post-list.ts
import { DataPermissionEnum } from '@/constants/faculty'

const list = [
  { id: 'm1', postId: 'p1', postName: '任课教师', postState: 1, postStateStr: '启用',
    campusName: '初--(1)班', classList: [{id:'cl1',name:'初--(1)班'}], gradeList: [],
    subjectList: [{id:'s1',name:'语文'}], method: 'auto', methodStr: '自动分配', topSign: 0, state: 0 },
  { id: 'm2', postId: 'p2', postName: '副班主任', postState: 1, postStateStr: '启用',
    campusName: '主校区', classList: [], gradeList: [{id:'g1',name:'初一'}],
    subjectList: [{id:'s2',name:'数学'},{id:'s3',name:'英语'},{id:'s4',name:'物理'},{id:'s5',name:'化学'},{id:'s6',name:'长信息科技'}],
    method: 'auto', methodStr: '自动分配', topSign: 0, state: 0 },
  // ... 其余 5 行省略 ...
  { id: 'm7', postId: 'p7', postName: 'XXXXX', postState: 1, postStateStr: '启用',
    campusName: '校区A,校区B', classList: [], gradeList: [],
    subjectList: [], method: 'manual', methodStr: '手动添加', topSign: 0, state: 0,
    dataPermissionEnum: DataPermissionEnum.CAMPUS, scopeCampusIds: ['c1','c2'] },
  // ...
]

export function getFacultyPostList(params: { tenantUserId: string; page: number; size: number }) {
  const { page, size } = params
  const start = (page - 1) * size
  return { list: list.slice(start, start + size), total: list.length }
}
```

**Step 4：分配 / 编辑（含 4.3 重复分配规则）**

```ts
// src/mocks/faculty-position/assign.ts
import { AssignResultCode, DataPermissionEnum } from '@/constants/faculty'
import { list } from './faculty-post-list'

export async function assignPost(payload: {
  facultyId: string
  postId: string
  dataPermissionEnum: DataPermissionEnum
  campusIds: string[]
}) {
  // 模拟网络 300ms
  await new Promise(r => setTimeout(r, 300))

  const dup = list.find(r =>
    r.postId === payload.postId &&
    r.dataPermissionEnum === payload.dataPermissionEnum
  )
  if (dup) {
    return { code: AssignResultCode.ALREADY_EXISTS, message: '该岗位已存在且数据权限相同' }
  }
  // 成功：插入新行
  const id = 'mock-' + Date.now()
  list.unshift({ id, postId: payload.postId, postName: '(新)', postState: 1, postStateStr: '启用',
    campusName: payload.campusIds.map(id => id === 'c1' ? 'A校区' : id === 'c2' ? 'B校区' : 'C校区').join(','),
    classList: [], gradeList: [], subjectList: [], method: 'manual', methodStr: '手动添加',
    topSign: 0, state: 0,
    dataPermissionEnum: payload.dataPermissionEnum, scopeCampusIds: payload.campusIds })
  return { code: AssignResultCode.OK, data: { id } }
}
```

```ts
// src/mocks/faculty-position/update.ts
import { AssignResultCode } from '@/constants/faculty'
import { list } from './faculty-post-list'

export async function updateDataPermission(payload: {
  assignId: string
  dataPermissionEnum: string
  campusIds: string[]
}) {
  await new Promise(r => setTimeout(r, 300))
  const row = list.find(r => r.id === payload.assignId)
  if (!row) {
    return { code: AssignResultCode.SERVER_ERROR, message: '分配记录不存在' }
  }
  row.campusName = payload.campusIds.map(id =>
    id === 'c1' ? 'A校区' : id === 'c2' ? 'B校区' : 'C校区').join(',')
  row.dataPermissionEnum = payload.dataPermissionEnum
  row.scopeCampusIds = payload.campusIds
  return { code: AssignResultCode.OK }
}
```

**Step 5：总入口**

```ts
// src/mocks/faculty-position/index.ts
export * from './data-permission-enums'
export * from './campus-list'
export * from './faculty-post-list'
export * from './assign'
export * from './update'

/** VITE 变量：true=全 mock；false=走真接口（后端未到位时勿改） */
export const USE_MOCK = import.meta.env.VITE_FACULTY_MOCK !== 'false'
```

**Step 6：commit**

```bash
git add src/mocks/faculty-position/
git commit -m "feat(faculty): mock 数据全套（含重复分配规则）"
```

---

## Task 3：service 切换层

> **Skill:** — 无（接口切换逻辑） · 置信度 — · 自动激活
> **理由:** 纯函数映射，mock ↔ 真接口

**Files:**
- Modify: `src/service/school.ts`

**Step 1：在 school service 末尾追加**

```ts
// src/service/school.ts （末尾追加）

import * as mockFaculty from '@/mocks/faculty-position'

// 列表：本期也走 mock（避免后端未实现时返回空）
export const facultyDataPermissionEnums = (postId: string) =>
  mockFaculty.USE_MOCK
    ? Promise.resolve(mockFaculty.getDataPermissionEnums(postId))
    : /* TODO 真接口到位后实现 */ Promise.resolve([])

export const facultyCampusList = (schoolId: string) =>
  mockFaculty.USE_MOCK
    ? Promise.resolve(mockFaculty.getCampusList(schoolId))
    : Promise.resolve([])

export const facultyAssignPost = (payload: Parameters<typeof mockFaculty.assignPost>[0]) =>
  mockFaculty.USE_MOCK
    ? mockFaculty.assignPost(payload)
    : Promise.resolve({ code: 'OK', data: { id: 'pending' } })

export const facultyUpdateDataPermission = (payload: Parameters<typeof mockFaculty.updateDataPermission>[0]) =>
  mockFaculty.USE_MOCK
    ? mockFaculty.updateDataPermission(payload)
    : Promise.resolve({ code: 'OK' })
```

**Step 2：commit**

```bash
git add src/service/school.ts
git commit -m "feat(service): 教职工数据权限 service 切换层"
```

---

## Task 4：DataPermissionSelect 组件

> **Skill:** frontend-design · 置信度 0.75 · 自动激活
> **理由:** 新建 UI 组件，遵循 Element Plus 风格 + 项目现有 ElSelect 模式；component 设计决策
> **前置:** `vue-skills` 通用 Vue 3 实践（项目内 vue-expert-project 已内化）

**Files:**
- Create: `src/components/faculty/DataPermissionSelect.vue`

**Step 1：写组件**

```vue
<!-- src/components/faculty/DataPermissionSelect.vue -->
<script setup lang="ts">
import { ElSelect, ElOption } from 'element-plus'
import { ref, watch } from 'vue'
import { service } from '@/service'

interface Props {
  modelValue: string
  postId: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const options = ref<Array<{ value: string; label: string }>>([])
const loading = ref(false)

watch(() => props.postId, async (pid) => {
  if (!pid) { options.value = []; return }
  loading.value = true
  try {
    options.value = await service.school.facultyDataPermissionEnums(pid)
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <ElSelect
    :model-value="modelValue"
    :loading="loading"
    placeholder="请选择数据权限"
    style="width: 100%"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <ElOption v-for="o in options" :key="o.value" :label="o.label" :value="o.value" />
  </ElSelect>
</template>
```

**Step 2：commit**

```bash
git add src/components/faculty/DataPermissionSelect.vue
git commit -m "feat(faculty): DataPermissionSelect 组件"
```

---

## Task 5：CampusMultiPickerDialog 组件（共用图2 / 图4）

> **Skill:** frontend-design · 置信度 0.85 · 自动激活
> **理由:** 公共弹框组件，跨两个流程复用；交互决策（防抖 / 上一步按钮 / loading）

**Files:**
- Create: `src/components/faculty/CampusMultiPickerDialog.vue`

**Step 1：写组件**

```vue
<!-- src/components/faculty/CampusMultiPickerDialog.vue -->
<script setup lang="ts">
import { ElDialog, ElCheckbox, ElButton } from 'element-plus'
import { ref, watch } from 'vue'
import { service } from '@/service'

interface Props {
  modelValue: boolean
  /** 'campus' = 校区（本期唯一） */
  dataPermissionEnum: 'campus'
  /** 编辑路径回填；新增路径为空 */
  defaultCampusIds: string[]
  /** 是否显示「上一步」按钮 */
  showPrevStep: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'prev-step': []
  'submit': [campusIds: string[]]
}>()

const campusList = ref<Array<{ id: string; name: string }>>([])
const selected = ref<string[]>([])
const submitLoading = ref(false)

watch(() => props.modelValue, async (open) => {
  if (!open) return
  campusList.value = await service.school.facultyCampusList('mock-school')
  selected.value = [...props.defaultCampusIds]
}, { immediate: true })

async function onSubmit() {
  if (!selected.value.length) return
  submitLoading.value = true
  emit('submit', [...selected.value])
  // 由父组件控制关闭时机；本组件只通知
  setTimeout(() => { submitLoading.value = false }, 300) // 防抖
}
</script>

<template>
  <ElDialog
    :model-value="modelValue"
    width="640px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #title>
      <span>[校区] 权限</span>
    </template>

    <div class="form-row">
      <span class="required-mark">*</span>
      <span class="form-label">请选择管辖校区</span>
    </div>
    <div class="campus-grid">
      <ElCheckbox v-for="c in campusList" :key="c.id"
        :model-value="selected.includes(c.id)"
        @update:model-value="(v) => v ? selected.push(c.id) : selected = selected.filter(x => x !== c.id)">
        {{ c.name }}
      </ElCheckbox>
    </div>

    <template #footer>
      <ElButton round @click="emit('update:modelValue', false)">取消</ElButton>
      <ElButton v-if="showPrevStep" round @click="emit('prev-step')">上一步</ElButton>
      <ElButton round type="primary" :loading="submitLoading"
        :disabled="!selected.length || submitLoading" @click="onSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.form-row { display: flex; align-items: center; gap: 4px; margin-bottom: 16px; }
.required-mark { color: var(--el-color-danger); }
.campus-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 24px; padding-left: 16px; }
</style>
```

**Step 2：commit**

```bash
git add src/components/faculty/CampusMultiPickerDialog.vue
git commit -m "feat(faculty): CampusMultiPickerDialog 多选校区弹框（共用图2/图4）"
```

---

## Task 6：图1 弹框加【数据权限】下拉 + 触发图2

> **Skill:** frontend-design · 置信度 0.80 · 自动激活
> **理由:** 改造现有弹框，新增字段 + 联动图2；保持现有 ElForm / ElRow / ElCol 结构

**Files:**
- Modify: `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`

**Step 1：在 singleAssignForm 加 dataPermission 字段**

（line 231-242 附近）

```ts
const singleAssignForm = reactive({
  visible: false,
  loading: false,
  submitLoading: false,
  selectedUserId: '',
  form: {
    tenantPostId: '',
    dataPermissionEnum: '',  // 新增
  },
  rules: {
    tenantPostId: [{ required: true, message: '请选择岗位' }],
    dataPermissionEnum: [{ required: true, message: '请选择数据权限' }],  // 新增
  }
})
```

**Step 2：在弹框表单内追加一列（line 88-103 ElRow 内）**

```vue
<ElRow :gutter="20">
  <ElCol :span="12">
    <ElFormItem label="选择岗位" prop="tenantPostId">
      <ElSelect v-model="singleAssignForm.form.tenantPostId"
                :loading="savePositionOptionsLoading"
                placeholder="请选择岗位">
        <ElOption v-for="item in savePositionOptions"
                  :key="item.id" :label="item.name" :value="item.id" />
      </ElSelect>
    </ElFormItem>
  </ElCol>
  <ElCol :span="12">
    <ElFormItem label="数据权限" prop="dataPermissionEnum">
      <DataPermissionSelect v-model="singleAssignForm.form.dataPermissionEnum"
                            :post-id="singleAssignForm.form.tenantPostId" />
    </ElFormItem>
  </ElCol>
</ElRow>
```

**Step 3：改【下一步】行为**

`handleSingleAssignSubmit` 改为只打开图2（图2 内部调用 assign service）：

```ts
const handleSingleAssignSubmit = async () => {
  if (!singleAssignForm.form.tenantPostId || !singleAssignForm.form.dataPermissionEnum) {
    ElMessage.warning('请先选择岗位和数据权限')
    return
  }
  // 关图1，开图2
  singleAssignForm.visible = false
  await nextTick()
  campusPickerVisible.value = true  // 新增 ref
}
```

**Step 4：commit**

```bash
git add src/pages/app/basic-data/school/school/faculty/faculty-position.vue
git commit -m "feat(faculty): 图1 弹框加数据权限下拉，触发图2"
```

---

## Task 7：图2 弹框接入 + 分配提交流程

> **Skill:** frontend-design · 置信度 0.75 · 自动激活
> **理由:** 业务流程接入（分配 / 重复分配 / 上一步回退）；错误处理 toast 模式

**Files:**
- Modify: `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`

**Step 1：加 ref + 引用组件**

```ts
const campusPickerVisible = ref(false)  // 图2 / 图4 共用

async function onCampusPickerSubmit(campusIds: string[]) {
  if (singleAssignForm.form.dataPermissionEnum !== 'campus') return  // 本期仅校区
  try {
    const res = await service.school.facultyAssignPost({
      facultyId: tenantUserId.value ?? '',
      postId: singleAssignForm.form.tenantPostId,
      dataPermissionEnum: singleAssignForm.form.dataPermissionEnum as any,
      campusIds,
    })
    if (res.code === 'OK') {
      ElMessage.success('分配成功')
      campusPickerVisible.value = false
      await listPaging.refresh()
      resetSingleAssignForm()
    } else if (res.code === 'ALREADY_EXISTS') {
      ElMessage.warning('该岗位已存在且数据权限相同')
      // 不关闭弹框，用户可改
    } else {
      ElMessage.error(res.message ?? '分配失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.message ?? '分配失败')
  }
}

function onPrevStep() {
  campusPickerVisible.value = false
  singleAssignForm.visible = true
}
```

**Step 2：模板末尾挂弹框**

```vue
<CampusMultiPickerDialog
  v-model="campusPickerVisible"
  data-permission-enum="campus"
  :default-campus-ids="[]"
  :show-prev-step="true"
  @prev-step="onPrevStep"
  @submit="onCampusPickerSubmit"
/>
```

**Step 3：commit**

```bash
git add src/pages/app/basic-data/school/school/faculty/faculty-position.vue
git commit -m "feat(faculty): 图2 弹框接入 + 分配提交流程（含重复分配规则）"
```

---

## Task 8：图4 弹框接入（编辑路径）

> **Skill:** frontend-design · 置信度 0.70 · 自动激活
> **理由:** 复用图2组件 + 编辑路径特化；区分 showPrevStep / submit handler

**Files:**
- Modify: `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`

**Step 1：加编辑 ref + handler**

```ts
const editingRow = ref<any>(null)

async function openDataPermissionEdit(row: any) {
  editingRow.value = row
  await nextTick()
  campusPickerVisible.value = true
}

async function onCampusEditSubmit(campusIds: string[]) {
  if (!editingRow.value) return
  try {
    const res = await service.school.facultyUpdateDataPermission({
      assignId: editingRow.value.id,
      dataPermissionEnum: editingRow.value.dataPermissionEnum,
      campusIds,
    })
    if (res.code === 'OK') {
      ElMessage.success('保存成功')
      campusPickerVisible.value = false
      await listPaging.refresh()
      editingRow.value = null
    } else {
      ElMessage.error(res.message ?? '保存失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.message ?? '保存失败')
  }
}
```

**Step 2：模板按 dataPermission 切换 submit handler，根据 editingRow 决定 showPrevStep**

```vue
<CampusMultiPickerDialog
  v-model="campusPickerVisible"
  data-permission-enum="campus"
  :default-campus-ids="editingRow?.scopeCampusIds ?? []"
  :show-prev-step="!editingRow"
  @prev-step="onPrevStep"
  @submit="editingRow ? onCampusEditSubmit($event) : onCampusPickerSubmit($event)"
/>
```

**Step 3：commit**

```bash
git add src/pages/app/basic-data/school/school/faculty/faculty-position.vue
git commit -m "feat(faculty): 图4 弹框接入（编辑路径，无上一步按钮）"
```

---

## Task 9：列表【所属校区】列渲染升级

> **Skill:** frontend-design · 置信度 0.70 · 自动激活
> **理由:** 复用 AppTagClampTooltip；字符串切分 → 数组 → 多列模板（formatter="raw"）

**Files:**
- Modify: `src/pages/app/basic-data/school/school/faculty/faculty-position.vue:40-45`

**Step 1：改造 template**

```vue
<ElTableColumn label="所属校区" prop="campusName" min-width="200">
  <template #default="{ row }">
    <AppTagClampTooltip
      v-if="row.campusName"
      :content="row.campusName.split(',').filter(Boolean)"
      formatter="raw"
      :limit="2"
      placement="top"
    />
    <ElText v-else type="info">--</ElText>
  </template>
</ElTableColumn>
```

**Step 2：commit**

```bash
git add src/pages/app/basic-data/school/school/faculty/faculty-position.vue
git commit -m "feat(faculty): 列表【所属校区】列最多 2 + ... + hover 全量"
```

---

## Task 10：列表【操作】列追加【数据权限】按钮

> **Skill:** frontend-design · 置信度 0.65 · 自动激活
> **理由:** 现有 ElLink 列内追加按钮；disabled 规则沿用

**Files:**
- Modify: `src/pages/app/basic-data/school/school/faculty/faculty-position.vue:53-60`

**Step 1：改 template**

```vue
<ElTableColumn label="操作" width="280" fixed="right">
  <template #default="{ row }">
    <ElLink class="mr-[8px]" type="primary" :disabled="row.method === 'auto' || row.topSign === 1" @click="addUpdateClass(row)">班级权限</ElLink>
    <ElLink class="mr-[8px]" type="primary" :disabled="row.method === 'auto' || row.topSign === 1" @click="addUpdateSubject(row)">科目权限</ElLink>
    <ElLink class="mr-[8px]" type="primary" :disabled="!row.dataPermissionEnum" @click="openDataPermissionEdit(row)">数据权限</ElLink>
    <ElLink :disabled="row.state === 1" type="primary" @click="listPaging.rowDelete(row)">删除</ElLink>
  </template>
</ElTableColumn>
```

**Step 2：commit**

```bash
git add src/pages/app/basic-data/school/school/faculty/faculty-position.vue
git commit -m "feat(faculty): 列表【操作】列追加【数据权限】按钮"
```

---

## Task 11：列表【任教科目】校区型覆盖

> **Skill:** frontend-design · 置信度 0.65 · 自动激活
> **理由:** 条件渲染（v-if dataPermissionEnum === 'campus'）；保留 fallback

**Files:**
- Modify: `src/pages/app/basic-data/school/school/faculty/faculty-position.vue:46-50`

**Step 1：改 template**

```vue
<ElTableColumn label="任教科目" prop="subjectList" min-width="200">
  <template #default="{ row }">
    <template v-if="row.dataPermissionEnum === 'campus'">
      <span>全部</span>
    </template>
    <template v-else>
      <AppTagClampTooltip v-if="row.subjectList.length" :content="row.subjectList" formatter="name" :limit="6" placement="top" />
      <ElText v-else type="info">--</ElText>
    </template>
  </template>
</ElTableColumn>
```

**Step 2：commit**

```bash
git add src/pages/app/basic-data/school/school/faculty/faculty-position.vue
git commit -m "feat(faculty): 列表【任教科目】校区型强制显示全部"
```

---

## Task 12：防抖与切换动画（最后微调）

> **Skill:** improve-animations · 置信度 0.60 · 自动激活
> **理由:** 弹框切换动画 / 按钮防抖微调；ElDialog 自带过渡已够用，仅复核
> **前置:** 手动跑一遍流程验证交互兜底（点 5 "下一步"、"确定"、"上一步"、"数据权限"）

**Files:**
- Modify: `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`

**Step 1：图1→图2 切换加 150ms 淡入**

利用 el-dialog 自带过渡；切换时 `singleAssignForm.visible=false` 后 `await nextTick()` 再 `campusPickerVisible.value=true`（Task 6/7 已做）。

**Step 2：【下一步】按钮防抖 300ms**

`singleAssignForm.submitLoading` 已在 Task 6 中提交时立即设 true，submit 函数由 `handleSingleAssignSubmit` 控制，详见 Task 7。无需额外动作。

**Step 3：手动验证**

打开 dev:develop → 复现完整流程一遍（分配 / 重复 / 编辑）。

**Step 4：commit（如有微调）**

```bash
git add src/pages/app/basic-data/school/school/faculty/faculty-position.vue
git commit -m "polish(faculty): 切换动画与防抖微调"
```

---

## Task 13：Harness 自检 + validate

> **Skill:** superpowers-harness-run · 置信度 0.70 · 自动激活
> **理由:** 触发词命中：harness / validate-harness
> **子技能:** superpowers-harness（阶段判断）

**Step 1：跑 harness:status（两/frontend）**

```bash
cd E:/code/two/frontend
node scripts/harness/status.mjs --match "教职工岗位管理"
```

预期：`阶段: READY_TO_DEV`（spec + plan 已就位）。

**Step 2：跑 validate-harness（frontend-local）**

```bash
cd E:/code/frontend-local
node .agents/skills/superpowers-harness/scripts/validate-harness.mjs
```

预期：ExitCode 0，无 `ARCHIVE_MISSING_*` / `SPEC_MISSING_FIGMA_STYLE_TABLE` 警告。

---

## Task 14：交付自检与 archive

> **Skill:** superpowers-harness · 置信度 0.85 · 自动激活
> **理由:** archive 模板由 HARNESS_RULES §6.4 定义；交付自检 A/B 强制项
> **强制小节:** `## 一致性自检` + `## 还原度自检`（不适用 → "不适用：无 Figma / 非 UI"）

**Files:**
- Create: `docs/superpowers/V1.7.0/feature/教职工岗位管理-数据权限校区型/archive/{模块名}-delivered.md`

**Step 1：写 archive（按 HARNESS_RULES §6.4 模板，必含 ## 一致性自检 + ## 还原度自检）**

详见 §6.4 模板；还原度自检填"不适用：无 Figma / 非 UI"。

**Step 2：commit**

```bash
cd E:/code/frontend-local
git add docs/superpowers/V1.7.0/
git commit -m "deliver(faculty): 数据权限（校区型）交付快照"
```

---

## Skill 路由（router --annotate 结果）

> 见下文"## Skill 路由标注"小节，由 `router.mjs --annotate` 输出后回写。

---

## 暂停点 · P3

确认请回 **P3 = Inline** 或 **P3 = SDD**：
- **Inline**：本对话按 Task 1→14 顺序连续执行（含 commit）
- **SDD**：派子代理每 Task 派一次，途中审核（详见 HARNESS_RULES §4）