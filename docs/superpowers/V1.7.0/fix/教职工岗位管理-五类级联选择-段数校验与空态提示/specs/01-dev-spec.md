# 教职工岗位管理 · 五类级联选择 · 段数校验与空态提示 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**类型：** fix  
**档位：** 标准  
**版本：** V1.7.0  
**日期：** 2026-09-23  
**状态：** 待 P2 确认

---

## 1. 改造范围（15 个文件）

### 1.1 5 个 cascader.vue（加 `empty-text`）

| 类型 | 路径 |
|------|------|
| CG | `src/components/faculty/data-permission/campus-grade/campus-grade-cascader/campus-grade-cascader.vue` |
| CGS | `src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-cascader/campus-grade-subject-cascader.vue` |
| CC | `src/components/faculty/data-permission/campus-class/campus-class-cascader/campus-class-cascader.vue` |
| CCS | `src/components/faculty/data-permission/campus-class-subject/campus-class-subject-cascader/campus-class-subject-cascader.vue` |
| CSE | `src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-cascader/campus-stage-subject-cascader.vue` |

### 1.2 5 个 cascader.util.ts（`idsToDTO` 段数校验）

| 类型 | 路径 | 必填段数 |
|------|------|----------|
| CG | `.../campus-grade-cascader/campus-grade-cascader.util.ts` | 3（campus + stage + grade） |
| CGS | `.../campus-grade-subject-cascader/campus-grade-subject-cascader.util.ts` | 4（campus + stage + grade + subject） |
| CC | `.../campus-class-cascader/campus-class-cascader.util.ts` | 4（campus + stage + grade + class） |
| CCS | `.../campus-class-subject-cascader/campus-class-subject-cascader.util.ts` | 5（campus + stage + grade + class + subject） |
| CSE | `.../campus-stage-subject-cascader/campus-stage-subject-cascader.util.ts` | 3（campus + stage + subject） |

### 1.3 5 个 picker-dialog.util.ts（`validateScopes` 段数校验）

| 类型 | 路径 | 校验字段 |
|------|------|----------|
| CG | `.../campus-grade-picker-dialog/campus-grade-picker-dialog.util.ts` | `!row.gradeId` |
| CGS | `.../campus-grade-subject-picker-dialog/campus-grade-subject-picker-dialog.util.ts` | `!row.subjectId` |
| CC | `.../campus-class-picker-dialog/campus-class-picker-dialog.util.ts` | `!row.classId` |
| CCS | `.../campus-class-subject-picker-dialog/campus-class-subject-picker-dialog.util.ts` | `!row.classId || !row.subjectId` |
| CSE | `.../campus-stage-subject-picker-dialog/campus-stage-subject-picker-dialog.util.ts` | `!row.subjectId` |

---

## 2. cascader.vue 改造（5 个统一改）

### 2.1 加 `empty-text` prop

```vue
<template>
  <div class="xxx-cascader">
    <ElCascader
      :model-value="innerIds"
      :props="cascaderProps"
      :disabled="disabled"
      :placeholder="placeholder"
      empty-text="暂无数据，请联系管理员"  <!-- ← 新增 -->
      clearable
      filterable
      :show-all-levels="true"
      separator="/"
      @update:model-value="onIdsChange"
    />
  </div>
</template>
```

`empty-text` 是 Element Plus Cascader 自带的 prop：级联面板某一级无数据时显示的文本。默认是「No Data」。

---

## 3. cascader.util.ts 改造（5 个各自不同）

### 3.1 统一骨架

```ts
import type { SchoolFacultyPermissionScopeDTO } from '@/utils/faculty-data-permission'

export interface CascaderNode {
  id: string
  name: string
  isLeaf?: boolean
  children?: CascaderNode[]
  [key: string]: any
}

export function pathToIds(dto: SchoolFacultyPermissionScopeDTO | null): string[] {
  if (!dto)
    return []
  return [dto.campusId, dto.stageId, dto.gradeId, dto.classId, dto.subjectId].filter(Boolean) as string[]
}

/** ids → DTO；段数不够返回 null（防止不完整路径流通） */
export function idsToDTO(ids: string[]): SchoolFacultyPermissionScopeDTO | null {
  if (!ids || ids.length === 0)
    return null
  // 按 enum 必填段数校验（各 cascader 不同）
  if (ids.length < REQUIRED_LENGTH)
    return null
  const dto: SchoolFacultyPermissionScopeDTO = {}
  if (ids[0]) dto.campusId = ids[0]
  if (ids[1]) dto.stageId = ids[1]
  if (ids[2]) dto.gradeId = ids[2]
  if (ids[3]) dto.classId = ids[3]
  if (ids[4]) dto.subjectId = ids[4]
  return dto
}
```

### 3.2 各 enum 的 `REQUIRED_LENGTH` 与字段映射

| 类型 | REQUIRED_LENGTH | idsToDTO 字段映射 |
|------|----------------|---------------------|
| CG | **3** | `[0]=campusId, [1]=stageId, [2]=gradeId` |
| CGS | **4** | `[0]=campusId, [1]=stageId, [2]=gradeId, [3]=subjectId` |
| CC | **4** | `[0]=campusId, [1]=stageId, [2]=gradeId, [3]=classId` |
| CCS | **5** | `[0]=campusId, [1]=stageId, [2]=gradeId, [3]=classId, [4]=subjectId` |
| CSE | **3** | `[0]=campusId, [1]=stageId, [2]=subjectId` |

### 3.3 CG util 完整改后

```ts
import type { SchoolFacultyPermissionScopeDTO } from '@/utils/faculty-data-permission'

export interface CascaderNode {
  id: string
  name: string
  isLeaf?: boolean
  children?: CascaderNode[]
  [key: string]: any
}

export function pathToIds(dto: SchoolFacultyPermissionScopeDTO | null): string[] {
  if (!dto)
    return []
  return [dto.campusId, dto.stageId, dto.gradeId].filter(Boolean) as string[]
}

export function idsToDTO(ids: string[]): SchoolFacultyPermissionScopeDTO | null {
  if (!ids || ids.length < 3)
    return null
  const dto: SchoolFacultyPermissionScopeDTO = {}
  if (ids[0]) dto.campusId = ids[0]
  if (ids[1]) dto.stageId = ids[1]
  if (ids[2]) dto.gradeId = ids[2]
  return dto
}
```

### 3.4 CGS util 完整改后

```ts
import type { SchoolFacultyPermissionScopeDTO } from '@/utils/faculty-data-permission'

export interface CascaderNode {
  id: string
  name: string
  isLeaf?: boolean
  children?: CascaderNode[]
  [key: string]: any
}

export function pathToIds(dto: SchoolFacultyPermissionScopeDTO | null): string[] {
  if (!dto)
    return []
  return [dto.campusId, dto.stageId, dto.gradeId, dto.subjectId].filter(Boolean) as string[]
}

export function idsToDTO(ids: string[]): SchoolFacultyPermissionScopeDTO | null {
  if (!ids || ids.length < 4)
    return null
  const dto: SchoolFacultyPermissionScopeDTO = {}
  if (ids[0]) dto.campusId = ids[0]
  if (ids[1]) dto.stageId = ids[1]
  if (ids[2]) dto.gradeId = ids[2]
  if (ids[3]) dto.subjectId = ids[3]
  return dto
}
```

### 3.5 CC util 完整改后

```ts
import type { SchoolFacultyPermissionScopeDTO } from '@/utils/faculty-data-permission'

export interface CascaderNode {
  id: string
  name: isLeaf?: boolean
  children?: CascaderNode[]
  [key: string]: any
}

export function pathToIds(dto: SchoolFacultyPermissionScopeDTO | null): string[] {
  if (!dto)
    return []
  return [dto.campusId, dto.stageId, dto.gradeId, dto.classId].filter(Boolean) as string[]
}

export function idsToDTO(ids: string[]): SchoolFacultyPermissionScopeDTO | null {
  if (!ids || ids.length < 4)
    return null
  const dto: SchoolFacultyPermissionScopeDTO = {}
  if (ids[0]) dto.campusId = ids[0]
  if (ids[1]) dto.stageId = ids[1]
  if (ids[2]) dto.gradeId = ids[2]
  if (ids[3]) dto.classId = ids[3]
  return dto
}
```

### 3.6 CCS util 完整改后

```ts
import type { SchoolFacultyPermissionScopeDTO } from '@/utils/faculty-data-permission'

export interface CascaderNode {
  id: string
  name: isLeaf?: boolean
  children?: CascaderNode[]
  [key: string]: any
}

export function pathToIds(dto: SchoolFacultyPermissionScopeDTO | null): string[] {
  if (!dto)
    return []
  return [dto.campusId, dto.stageId, dto.gradeId, dto.classId, dto.subjectId].filter(Boolean) as string[]
}

export function idsToDTO(ids: string[]): SchoolFacultyPermissionScopeDTO | null {
  if (!ids || ids.length < 5)
    return null
  const dto: SchoolFacultyPermissionScopeDTO = {}
  if (ids[0]) dto.campusId = ids[0]
  if (ids[1]) dto.stageId = ids[1]
  if (ids[2]) dto.gradeId = ids[2]
  if (ids[3]) dto.classId = ids[3]
  if (ids[4]) dto.subjectId = ids[4]
  return dto
}
```

### 3.7 CSE util 完整改后

```ts
import type { SchoolFacultyPermissionScopeDTO } from '@/utils/faculty-data-permission'

export interface CascaderNode {
  id: string
  name: isLeaf?: boolean
  children?: CascaderNode[]
  [key: string]: any
}

export function pathToIds(dto: SchoolFacultyPermissionScopeDTO | null): string[] {
  if (!dto)
    return []
  return [dto.campusId, dto.stageId, dto.subjectId].filter(Boolean) as string[]
}

export function idsToDTO(ids: string[]): SchoolFacultyPermissionScopeDTO | null {
  if (!ids || ids.length < 3)
    return null
  const dto: SchoolFacultyPermissionScopeDTO = {}
  if (ids[0]) dto.campusId = ids[0]
  if (ids[1]) dto.stageId = ids[1]
  if (ids[2]) dto.subjectId = ids[2]
  return dto
}
```

---

## 4. picker-dialog.util.ts 改造（5 个各自不同）

### 4.1 统一思路

```ts
export function validateScopes(scopes: ScopeRow[]): {
  ok: boolean
  message?: string
  scopes?: SchoolFacultyPermissionScopeDTO[]
} {
  const out: SchoolFacultyPermissionScopeDTO[] = []
  for (const row of scopes) {
    if (!row)
      return { ok: false, message: '请完整选择校区年级科目' }
    // 新增：段数完整性校验（按 enum 类型必填字段）
    if (!row.gradeId || !row.subjectId)
      return { ok: false, message: '请完整选择校区年级科目' }
    out.push(row)
  }
  if (hasDuplicateScopes(out))
    return { ok: false, message: '科目已存在' }
  return { ok: true, scopes: out }
}
```

### 4.2 各 enum 的字段校验与完整文案

| Enum | 当前接口文案（已正确） | 新增字段校验 | 校验失败文案 |
|------|-------------------------|---------------|----------------|
| CG | `'请完整选择校区年级'` / `'年级已存在'` | `!row.gradeId` | `'请完整选择校区年级'` |
| CGS | `'请完整选择校区年级科目'` / `'科目已存在'` | `!row.subjectId` | `'请完整选择校区年级科目'` |
| CC | `'请完整选择校区班级'` / `'班级已存在'` | `!row.classId` | `'请完整选择校区班级'` |
| CCS | `'请完整选择校区班级科目'` / `'科目已存在'` | `!row.classId \|\| !row.subjectId` | `'请完整选择校区班级科目'` |
| CSE | `'请完整选择校区学段科目'` / `'科目已存在'` | `!row.subjectId` | `'请完整选择校区学段科目'` |

> **注意**：当前 5 个 util 的 `validateScopes` 已有「空行校验」「全段重复校验」；本次**追加**「段数完整性校验」，文案沿用现有（空行校验的 message）。

### 4.3 CG util.ts 完整改后示例

```ts
import type { SchoolFacultyPermissionScopeDTO } from '@/utils/faculty-data-permission'
import { canRemoveRow, hasDuplicateScopes } from '@/utils/faculty-data-permission'

export type ScopeRow = SchoolFacultyPermissionScopeDTO | null

export function cloneScopes(scopes: SchoolFacultyPermissionScopeDTO[]): SchoolFacultyPermissionScopeDTO[] {
  return scopes.map(s => ({ ...s }))
}

export function initScopes(defaultScopes: SchoolFacultyPermissionScopeDTO[]): ScopeRow[] {
  return defaultScopes.length ? cloneScopes(defaultScopes) : [null]
}

export { canRemoveRow, hasDuplicateScopes }

export function validateScopes(scopes: ScopeRow[]): {
  ok: boolean
  message?: string
  scopes?: SchoolFacultyPermissionScopeDTO[]
} {
  const out: SchoolFacultyPermissionScopeDTO[] = []
  for (const row of scopes) {
    if (!row)
      return { ok: false, message: '请完整选择校区年级' }
    // 新增：段数完整性校验（CG 必须有 gradeId）
    if (!row.gradeId)
      return { ok: false, message: '请完整选择校区年级' }
    out.push(row)
  }
  if (hasDuplicateScopes(out))
    return { ok: false, message: '年级已存在' }
  return { ok: true, scopes: out }
}
```

### 4.4 CGS util.ts 完整改后示例

```ts
export function validateScopes(scopes: ScopeRow[]): {
  ok: boolean
  message?: string
  scopes?: SchoolFacultyPermissionScopeDTO[]
} {
  const out: SchoolFacultyPermissionScopeDTO[] = []
  for (const row of scopes) {
    if (!row)
      return { ok: false, message: '请完整选择校区年级科目' }
    // 新增：段数完整性校验（CGS 必须有 subjectId）
    if (!row.subjectId)
      return { ok: false, message: '请完整选择校区年级科目' }
    out.push(row)
  }
  if (hasDuplicateScopes(out))
    return { ok: false, message: '科目已存在' }
  return { ok: true, scopes: out }
}
```

### 4.5 CC / CCS / CSE util 改造同上模式（不再重复模板）

---

## 5. 数据流（修复后）

```
Element Plus Cascader lazy 模式
  ↓ user click "天河校区/学前" (resolve([]))
  ↓ ElCascader emit ids = ["天河校区.id", "学前.id"] (长度 2)
cascader.vue onIdsChange(ids)
  ↓ idsToDTO(["天河校区.id", "学前.id"]) (CG 必填 3 段)
  ↓ 返回 null (校验不通过)
  ↓ emit('update:modelValue', null)
picker-dialog row[idx] = null
  ↓ UI 显示空行 + placeholder
picker-dialog onSubmit
  ↓ validateScopes(rows) (兜底)
  ↓ 段数完整性校验
```

---

## 6. 不动项（严格）

| 层 | 不动 |
|----|------|
| 校区型弹框 | `CampusMultiPickerDialog.vue` |
| 5 个 cascader.vue 的 lazyLoad 链路 | 不动 |
| 5 个 cascader.model.ts | 不动 |
| 5 个 cascader.scss | 不动 |
| 5 个 picker-dialog.vue | 不动（只动其 util.ts） |
| 注册表 / 列表聚合 / session | 不动 |
| 页面 | `faculty-position.vue` |
| mocks / service | 不动 |

---

## 7. 验收（写入 archive 前必勾）

### 7.1 段数校验

- [ ] CG `idsToDTO`：ids.length < 3 → null ✓
- [ ] CGS `idsToDTO`：ids.length < 4 → null ✓
- [ ] CC `idsToDTO`：ids.length < 4 → null ✓
- [ ] CCS `idsToDTO`：ids.length < 5 → null ✓
- [ ] CSE `idsToDTO`：ids.length < 3 → null ✓
- [ ] CG `validateScopes`：`!row.gradeId` → toast「请完整选择校区年级」 ✓
- [ ] CGS `validateScopes`：`!row.subjectId` → toast「请完整选择校区年级科目」 ✓
- [ ] CC `validateScopes`：`!row.classId` → toast「请完整选择校区班级」 ✓
- [ ] CCS `validateScopes`：`!row.classId || !row.subjectId` → toast「请完整选择校区班级科目」 ✓
- [ ] CSE `validateScopes`：`!row.subjectId` → toast「请完整选择校区学段科目」 ✓

### 7.2 空态提示

- [ ] 5 个 cascader.vue 加 `empty-text="暂无数据，请联系管理员"` ✓
- [ ] dev smoke：点开无年级学段 → 面板显示「暂无数据，请联系管理员」

### 7.3 回归门禁

- [ ] 校区型弹框行为不变（`CampusMultiPickerDialog.vue` 未改） ✓
- [ ] `pnpm eslint` 15 个目标文件 0 error ✓

---

## 8. 风险与回退

| 风险 | 缓解 |
|------|------|
| idsToDTO 返回 null 导致 picker-dialog 行变 null（UI 显示空行） | 用户重新点击选择完整路径即可；onSubmit 兜底校验不通过 → toast 提示 |
| 编辑路径回填时 cascader 模型变 null（用户选了某 enum 但本条缺段数） | 走 onSubmit 兜底 + toast 提示 |
| `empty-text` 全局硬编码，不能按 level 区分提示 | 折中方案：友好提示「暂无数据，请联系管理员」 |

---

## 9. 还原度自检

不适用。本次为 UI 行为修复（fix），无 Figma / 无像素对照需求；与用户截图描述对齐即可。