# 教职工岗位管理 · 五类数据权限 · 级联选择 lazy 模式 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**类型：** fix  
**档位：** 标准  
**版本：** V1.7.0  
**日期：** 2026-09-23  
**状态：** 待 P2 确认

---

## 1. 改造范围（20 个文件）

### 1.1 5 个 cascader 子模块（15 个文件）

| 类型 | cascader.vue | cascader.model.ts | cascader.util.ts |
|------|-------------|-------------------|------------------|
| CG | `campus-grade-cascader.vue` | `campus-grade-cascader.model.ts` | `campus-grade-cascader.util.ts` |
| CGS | `campus-grade-subject-cascader.vue` | `campus-grade-subject-cascader.model.ts` | `campus-grade-subject-cascader.util.ts` |
| CC | `campus-class-cascader.vue` | `campus-class-cascader.model.ts` | `campus-class-cascader.util.ts` |
| CCS | `campus-class-subject-cascader.vue` | `campus-class-subject-cascader.model.ts` | `campus-class-subject-cascader.util.ts` |
| CSE | `campus-stage-subject-cascader.vue` | `campus-stage-subject-cascader.model.ts` | `campus-stage-subject-cascader.util.ts` |

### 1.2 5 个 picker-dialog（5 个文件）

| 类型 | picker-dialog.vue |
|------|-------------------|
| CG | `campus-grade-picker-dialog.vue` |
| CGS | `campus-grade-subject-picker-dialog.vue` |
| CC | `campus-class-picker-dialog.vue` |
| CCS | `campus-class-subject-picker-dialog.vue` |
| CSE | `campus-stage-subject-picker-dialog.vue` |

---

## 2. cascader.vue 改造（统一骨架 + 各自链路）

### 2.1 Props（5 个 cascader 统一）

```ts
const props = withDefaults(defineProps<{
  modelValue: SchoolFacultyPermissionScopeDTO | null
  schoolId: string
  disabled?: boolean
  placeholder?: string
}>(), {
  disabled: false,
  // placeholder 各 cascader 各自默认
})
```

### 2.2 cascaderProps 关键字段（5 个 cascader 统一）

```ts
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  emitPath: true,
  lazy: true,            // ← 新增
  checkStrictly: false,
  async lazyLoad(node: any, resolve: (data: CascaderNode[]) => void) {
    // 各 cascader 内部按 enum 实现链路
  },
}
```

### 2.3 v-model 适配（5 个 cascader 统一）

```ts
const innerIds = computed(() => pathToIds(props.modelValue))

function onIdsChange(ids: unknown) {
  const arr = Array.isArray(ids) ? (ids as string[]) : null
  emit('update:modelValue', arr ? idsToDTO(arr) : null)
}
```

### 2.4 lazyLoad 链路（每个 cascader 各自实现）

#### CG (校区→学段→年级 · 3 段)

```ts
async lazyLoad(node, resolve) {
  const { level, data } = node
  try {
    let list: CascaderNode[] = []
    if (level === 0) {
      // 第 1 层：校区
      const campuses = await service.baseData.getSchoolCampusList({ schoolId: props.schoolId, state: 1 })
      list = (campuses ?? []).map(c => ({ id: String(c.id), name: c.name ?? '', isLeaf: false }))
    }
    else if (level === 1) {
      // 第 2 层：学段
      const stages = await service.baseData.getSchoolStageList({ schoolId: props.schoolId, campusId: data.id })
      list = (stages ?? []).map(s => ({ id: String(s.id), name: s.typeStr ?? s.name ?? '', isLeaf: false }))
    }
    else if (level === 2) {
      // 第 3 层：年级（按当前学年）
      let yearId: string | undefined
      try {
        const y: any = await service.school.currentYear({ schoolId: props.schoolId })
        yearId = y?.id ? String(y.id) : undefined
      }
      catch { yearId = undefined }
      const grades = await service.school.getSchoolGradeListByCurrentYear({
        schoolId: props.schoolId,
        campusId: data.id,
        stageId: data.id, // 注意：picker-dialog 之前传 stageId，这里要纠正（见下文）
        yearId,
      })
      list = (grades ?? []).map(g => ({ id: String(g.id), name: g.name ?? '', isLeaf: true }))
    }
    resolve(list)
  }
  catch {
    resolve([])
  }
}
```

**注意**：上面 level 2 的 `campusId / stageId` 应该从 `node.pathValues / data` 取，不能直接用 `data.id`。具体实施时按 Element Plus Cascader lazy 模式的 node 结构取：

- `node.level` 当前节点的层级（0 / 1 / 2 / ...）
- `node.pathValues` 父节点 id 路径（Element Plus Cascader 提供的字段）
- `node.data` 当前节点数据对象（resolve 进去的对象）

Element Plus Cascader lazy 模式下，resolve 进去的对象会保留 data 引用。`node.data` 是上级级联节点的对象，id 是 `node.data.id`。

**修正**：campusId 应从 `pathValues[0]` 拿；stageId 从 `pathValues[1]` 拿。

让我修正规范。

实际上 ElCascader 的 lazy node 有这些字段：
- `level`: 0 表示根级（无父节点）
- `data`: 上次 resolve 进去的对象（根级时是 root）
- `pathLabels`: 父级 label 路径（注意是 label 不是 id）
- `pathValues`: Element Plus Cascader lazy 模式 `pathValues` 字段？

实际上 Element Plus Cascader 的 lazy node 提供 `data` 对象，可以通过 `data` 拿到自己 + 父级的 id（如果在 resolve 时把父级 id 放在 data 里）。

所以最佳实践：
- 校区层 resolve 时：`{ id: String(c.id), name: c.name, isLeaf: false }`
- 学段层 resolve 时：`{ id: String(s.id), name: ..., isLeaf: false, campusId: String(校区.id) }` —— data.campusId
- 年级层 resolve 时：`{ id: String(g.id), name: ..., isLeaf: true, campusId, stageId }`

具体 plan 实施时按此走。

#### CGS (校区→学段→年级→科目 · 4 段)

- level 0 → 校区
- level 1 → 学段
- level 2 → 年级
- level 3 → 科目（`schoolGradeSubjectsList({ baseGradeId, stageId })`）

#### CC (校区→学段→年级→班级 · 4 段)

- level 0 → 校区
- level 1 → 学段
- level 2 → 年级
- level 3 → 班级（`getSchoolClassList`）

#### CCS (校区→学段→年级→班级→科目 · 5 段)

- level 0 → 校区
- level 1 → 学段
- level 2 → 年级
- level 3 → 班级
- level 4 → 科目

#### CSE (校区→学段→科目 · 3 段，跳年级)

- level 0 → 校区
- level 1 → 学段
- level 2 → 科目（`queryAllowSubjectsList({ stageId })` 主路径 + `schoolGradeSubjectsList({ baseGradeId: '', stageId })` fallback）

---

## 3. cascader.model.ts 改造

5 个统一改：

```ts
import type { SchoolFacultyPermissionScopeDTO } from '@/utils/faculty-data-permission'

export interface CampusXxxCascaderProps {
  modelValue: SchoolFacultyPermissionScopeDTO | null
  schoolId: string  // ← 替换 tree
  disabled?: boolean
  placeholder?: string
}

export type CampusXxxCascaderEmits = {
  (e: 'update:modelValue', value: SchoolFacultyPermissionScopeDTO | null): void
}
```

---

## 4. cascader.util.ts 改造

5 个统一改：

```ts
import type { SchoolFacultyPermissionScopeDTO } from '@/utils/faculty-data-permission'

export interface CascaderNode {
  id: string
  name: string
  isLeaf?: boolean
  children?: CascaderNode[]
  /** 父级链路信息（lazy 模式下 resolve 时写入，用于在子层 lazyLoad 里拿父级 id） */
  [key: string]: any
}

/** DTO → ids 数组（不变） */
export function pathToIds(dto: SchoolFacultyPermissionScopeDTO | null): string[] {
  if (!dto) return []
  return [dto.campusId, dto.stageId, dto.gradeId, dto.classId, dto.subjectId].filter(Boolean) as string[]
}

/** ids 数组 → DTO（不依赖外部 tree；DTO 只含 id 字段） */
export function idsToDTO(ids: string[]): SchoolFacultyPermissionScopeDTO | null {
  if (!ids || ids.length === 0) return null
  const dto: SchoolFacultyPermissionScopeDTO = {}
  if (ids[0]) dto.campusId = ids[0]
  if (ids[1]) dto.stageId = ids[1]
  if (ids[2]) dto.gradeId = ids[2]
  if (ids[3]) dto.classId = ids[3]
  if (ids[4]) dto.subjectId = ids[4]
  return dto
}
```

> **关键差异**：`idsToPath(tree, ids)` → `idsToDTO(ids)`。因为 DTO 不需要 name 字段，name 由级联面板展示用，不入 dto。
>
> **旧 `idsToPath` 函数**：在外部 tree 里 find → 还需要 tree 数据；改后**直接按位映射**。

---

## 5. picker-dialog.vue 改造

### 5.1 watch modelValue（5 个统一改）

```ts
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    if (!props.skipResetOnOpen) {
      rows.value = initScopes(props.defaultScopes ?? [])
    }
  },
)
```

**删除整个 watch 里的构造 tree 段**。

### 5.2 状态（5 个统一改）

**删除**：
- `const tree = ref<CascaderNode[]>([])`
- `const treeLoading = ref(false)`
- `const currentYearId = ref<string>('')`
- 所有 `import` 对应的 cascader 模块（cascader.vue 还用，但不再传 tree）

**保留**：
- `const rows = ref<ScopeRow[]>([null])`
- `const submitLoading = ref(false)`

### 5.3 service import（5 个删除）

删除 picker-dialog 里所有 service 调用 import（`service.baseData.getSchoolCampusList / service.baseData.getSchoolStageList / service.school.getSchoolGradeListByCurrentYear / service.school.currentYear / service.school.getSchoolClassList / service.school.schoolGradeSubjectsList / service.school.queryAllowSubjectsList`）——**全部移到 cascader.vue 内部**。

### 5.4 cascader 行模板（5 个统一改）

```vue
<!-- 改前 -->
<cx-branch><campus-grade-subject-cascader :model-value="row" :tree="tree" @update:model-value="onRowChange(idx, $event)" /></cx-branch>

<!-- 改后 -->
<campus-grade-subject-cascader :model-value="row" :school-id="dpSchoolId" @update:model-value="onRowChange(idx, $event)" />
```

**注意**：`dpSchoolId` 是 faculty-position.vue 计算的（来自 `schoolInfo.value?.id`）；picker-dialog 通过 props.schoolId 接收。

---

## 6. 数据加载链路对照（按 enum）

| Type | level 0 | level 1 | level 2 | level 3 | level 4 |
|------|---------|---------|---------|---------|---------|
| CG (3 段) | 校区 `getSchoolCampusList` | 学段 `getSchoolStageList` | 年级 `getSchoolGradeListByCurrentYear` | - | - |
| CGS (4 段) | 校区 | 学段 | 年级 | 科目 `schoolGradeSubjectsList({ baseGradeId, stageId })` | - |
| CC (4 段) | 校区 | 学段 | 年级 | 班级 `getSchoolClassList` | - |
| CCS (5 段) | 校区 | 学段 | 年级 | 班级 | 科目 |
| CSE (3 段，跳年级) | 校区 | 学段 | 科目 `queryAllowSubjectsList({ stageId })` 主路径 + `schoolGradeSubjectsList({ baseGradeId: '', stageId })` fallback | - | - |

---

## 7. 不动项（严格）

| 层 | 不动 |
|----|------|
| 校区型弹窗 | `CampusMultiPickerDialog.vue` |
| 行内级联样式 | 5 个 `*-cascader.scss` |
| 契约 / 校验 | 5 个 `*-picker-dialog.{model,util}.ts`（保留；util 里的 `validateScopes / hasDuplicateScopes / canRemoveRow / initScopes` 还在用） |
| 注册表 / 列表聚合 / session | 不动 |
| 页面 | `faculty-position.vue` |
| mocks / service | 不动（service 接口仍用：cascader.vue 内部调用） |

---

## 8. 验收（写入 archive 前必勾）

- [ ] 5 个 cascader.vue 不再接收 `tree` prop；接收 `schoolId`
- [ ] 5 个 cascader.vue 用 `lazy: true` + `async lazyLoad` 按需加载
- [ ] 5 个 cascader.util.ts 提供 `pathToIds` 和 `idsToDTO`；删除 `idsToPath`
- [ ] 5 个 cascader.model.ts 的 Props 字段 `tree → schoolId`
- [ ] 5 个 picker-dialog.vue 删 `tree / treeLoading / currentYearId` 三个状态
- [ ] 5 个 picker-dialog.vue 的 watch modelValue 只保留 initScopes 守门
- [ ] 5 个 picker-dialog.vue 给 cascader 的 props `:tree` 改为 `:school-id`
- [ ] 校区型弹框行为不变（回归门禁）
- [ ] `pnpm eslint` 20 个目标文件 0 error
- [ ] dev smoke：CGS 打开弹窗 → 0 次服务调用（用户不点不动）；用户点开选择框 → 4 次

---

## 9. 风险与回退

| 风险 | 缓解 |
|------|------|
| Element Plus Cascader lazy 模式下 node.data 的可用字段需实测 | plan 实施时若发现 `data` 拿不到父级 id，改用 `pathValues` 数组或 `lazyLoad` 时往 `data` 里塞父级 id |
| 单条 service 失败级联面板空白 | lazyLoad catch → `resolve([])`；用户能看到「该层级暂无数据」提示（ElCascader 行为） |
| 行回填（编辑路径）的级联面板初始就有路径 → cascader 需要先按路径逐级展开并填好选项 | ElCascader v-model 传入 id 数组会自动按 id 匹配 option；lazy 模式下若 option 还没加载，UI 会空但 v-model 正确。问题简化到「打开面板时 cascader 内部主动把该行 DTO 对应的所有层选项预先加载」——如果行回填场景有此需求，plan 实施时按需 watch `modelValue` 变化预先触发 lazy 链路（不属于本期必须，可作后续 fix） |
| 编辑路径下选项未预加载时，cascader 显示空白 | 一期不处理（用户开 panel 选级联仍正常加载；编辑时点开面板会从空白 → 选层级才加载）。如影响 dev smoke，plan 阶段评估加 watch modelValue 预加载 |

---

## 10. 还原度自检

不适用。本次为 UI 行为修复（fix），无 Figma / 无像素对照需求；与 `AppCascaderArea` 范式对齐即可。