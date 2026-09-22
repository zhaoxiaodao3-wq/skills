# 教职工权限及范围接口对接 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.0 / api-adapter
**状态：** 待 P2 确认
**目标仓库：** `E:\code\two\frontend`（明睿 AI 校园管理平台）
**关联页面：** `src/pages/app/basic-data/school/school/faculty/faculty-position.vue` 及其依赖
**改造范围：** 30+ 文件（service / 组件 / 页面 / 枚举 / utils）

---

## 1. 概述

### 1.1 背景

V1.7.0 已在 `feature/` 下交付了 6 个数据权限类型模块（校区 / CGS / CCS / CC / CG / CSS），全部走 `src/mocks/faculty-position/` mock。本期按对接文档（A：教职工权限 4 接口 + B：数据权限枚举 2 接口）切真接口、删 mock、字段重命名、组件改写。

**关键差异**：
- 字段名：`dataPermissionEnum` → `dataPermissionType`
- 枚举值：`campus_grade_sub` → `campus_grade_subject`（3 个 enum）
- 范围结构：嵌套 `scopePaths[]` → 扁平 `permissionScopeList[]`
- CCS 设置方式：`setupMode` 字段保留（隐式语义：不传 `dataPermissionType` 即多对多）
- 列表派生：列表不再带 scopes，**二次拉** `queryDataScopeList`

### 1.2 档位 / 暂停点

- 档位：**全量**（多文件 + 多接口 + 字段重命名 + 业务流程重构）
- 暂停点：本文档对应 **P2**。P3（Inline / SDD）在 `plans/01-dev-plan.md` 完成后单独确认
- 暂停点边界：实现前必须满足 **`pnpm harness:status` → `READY_TO_DEV` + P3 已确认**（标准 HARNESS_RULES §3.1）

---

## 2. 范围

### 2.1 本期 IN

- **删除**：`src/mocks/faculty-position/` 整目录（13 文件）
- **新增 service 函数**（3 个）：
  - `dataPermissionEnumSchoolList`（GET）
  - `queryDataScopeList`（GET）
  - `updateDataScope`（POST）
- **改造 service 函数**（7 个 mock-first 切真接口 + 5 个 tree 改写为链路拼装）：
  - `facultyDataPermissionEnums` 改用 `dataPermissionEnumSchoolList`
  - `facultyCampusList` 改用 `getSchoolCampusList`
  - `facultyAssignPost` 改用 `saveSchoolTenantUserPost`（operate.ts:169）
  - `facultyUpdateDataPermission` 改用 `updateDataScope`
  - `facultyRemoveAssign` 改用 `deleteTenantUserPost`（多对多占位回滚）
  - 5 个 `facultyCampus*Tree` 改写为 ElTree lazy load 链路接口拼装
  - `facultyPostList` 整段删除，调用方改回 `facultyPermissionPage`
- **字段重命名 / 结构调整**（6 处）：
  - `dataPermissionEnum` → `dataPermissionType`
  - 3 个枚举值（`campus_grade_sub` → `campus_grade_subject` 等）
  - `scopePaths` 嵌套 → `permissionScopeList` 扁平
- **组件改造**：
  - 5 个 picker-dialog 组件：内部 ElTree lazy load（参考 students.vue:122-216）
  - 5 个 cascader 组件：保持纯展示
  - `DataPermissionSelect.vue`：去掉 `[TEST-N] __BRANCH_*` 测试项
  - `list-cells.ts`：按 `dataPermissionType` + `scopes` 重写
- **页面改造**：
  - `faculty-position.vue`：`listPaging.getRecords` 改回 `facultyPermissionPage`；列表二次拉 scopes；字段名重命名
  - 图1 弹框：增加【设置方式】切换（仅 CCS 类型：1对1 / 多对多）

### 2.2 本期 OUT（明确不实现）

- 其它 7th 类型数据权限（如有）
- 学年升级联动逻辑（后端承担）
- 移动端适配
- 批量分配新流程

---

## 3. 用户流程（精简回顾，详细见 requirements §6）

```
[主表] 点【分配岗位】
  ↓
[图1] 选岗位 + 选数据权限（6 种之一，CCS 多一对【设置方式】）
  ↓ [下一步]
[图2] 按类型走链路：
  ├─ campus：多选校区
  ├─ CGS/CSS/CG/CC：ElTree 4/3/3/4 级链路
  ├─ CCS one_to_one：ElTree 5 级链路
  └─ CCS many_to_many：复用 SelectClassListDialog + SelectSubjectListDialog
  ↓ [确定]
调 saveSchoolTenantUserPost（按设置方式传不同入参）

[主表] 二次拉 scopes → 三列渲染
[主表] 行点【数据权限】→ 按类型编辑 → 调 queryDataScopeList / updateDataScope 或 updateFacultyPermission
[主表] 行点【删除】→ 调 updateSchoolFacultyPermissionState
```

---

## 4. 数据契约

### 4.1 新增 service 函数（3 个）

```ts
// 1. 数据权限枚举（学校岗位可用）
export const getDataPermissionTypesByPost = defineService<
  { postId?: string },  // 可选，不传则返回所有可用枚举；传则返回该岗位已有/可用枚举
  Array<{
    code: string
    name: string
    tenantType: string
    description: string
    disabled: boolean  // true = 已有权限置灰不可取消
  }>
>(async (params, config) => {
  return request.get('/backstage/dataPermissionEnum/schoolList', { params, ...config })
})
// 自动排除 full 枚举

// 2. 查询权限范围（编辑回填 + 列表范围明细）
export const queryDataScopeList = defineService<
  { facultyPermissionId: string },
  SchoolFacultyPermissionScopeVO[]  // { id, facultyPermissionId, campusId, gradeId, classId, stageId, subjectId, scopeName, ... }
>(async (params, config) => {
  return request.get('/backstage/schoolFacultyPermissionScope/queryDataScopeList', { params, ...config })
})

// 3. 全量修改权限范围（编辑保存）
export const updateDataScope = defineService<
  { facultyPermissionId: string, permissionScopeList: SchoolFacultyPermissionScopeDTO[] },
  void
>(async (params, config) => {
  return request.post('/backstage/schoolFacultyPermissionScope/updateDataScope', params, config)
})
```

### 4.2 改造 service 函数（11 个）

| 函数 | 改造方式 |
|------|---------|
| `facultyDataPermissionEnums(postId)` | 删 mock 分支，改调 `getDataPermissionTypesByPost(postId)` |
| `facultyCampusList(schoolId)` | 删 mock 分支，改调 `getSchoolCampusList({schoolId})` |
| `facultyAssignPost(payload)` | 删 mock 分支，按 payload.dataPermissionType 分支：<br>- 1对1（campus/CGS/CSS/CG/CC/CCS one_to_one）→ `saveSchoolTenantUserPost({...payload, permissionScopeList})`<br>- CCS many_to_many→ `saveSchoolTenantUserPost({classIds, subjectIds})`（**不传** dataPermissionType） |
| `facultyUpdateDataPermission(payload)` | 删 mock 分支，改调 `updateDataScope({facultyPermissionId, permissionScopeList})` |
| `facultyRemoveAssign(assignId)` | 删 mock 分支，改调 `deleteTenantUserPost({tenantUserPostId: assignId})` |
| 5 个 `facultyCampus*Tree` | 整段重写：内部按 `dataPermissionType` 决定 lazy load level 0~4，参考 students.vue:122-216 |
| `facultyPostList(params)` | 整段删除，调用方改回 `facultyPermissionPage` |

### 4.3 数据模型

```ts
// 范围明细（5 维度扁平）
interface SchoolFacultyPermissionScopeDTO {
  campusId?: string   // campus / campus_grade[_subject] / campus_class[_subject] / campus_stage_subject 必填
  gradeId?: string    // campus_grade[_subject] 必填
  classId?: string    // campus_class[_subject] 必填
  stageId?: string    // campus_stage_subject 必填
  subjectId?: string  // campus_grade_subject / campus_stage_subject / campus_class_subject 必填
}

// 范围明细（含展示名，对接查询返回）
interface SchoolFacultyPermissionScopeVO extends SchoolFacultyPermissionScopeDTO {
  id: string
  facultyPermissionId: string
  scopeName: string   // 后端拼接的展示名，如"东校区 / 七年级 / 数学"
  createTime?: string
  updateTime?: string
}

// 列表行（facultyPermissionPage 返回）
interface FacultyPermissionRow {
  id: string                       // facultyPermissionId（编辑/删除用）
  tenantUserId: string
  tenantUserPostId: string         // 不要用于删除（与 id 不同！）
  postName: string
  postState: 0 | 1
  postStateStr: string
  dataPermissionType: string | null // 可能为空（兼容老数据）
  stageList: SchoolStage[] | null  // CSS 类型用；后端当前未填充
  campusId: string | null
  campusName: string | null
  classIds: string[]
  classList: SchoolClass[]
  gradeIds: string[]
  gradeList: SchoolGrade[]
  subjectIds: string[]
  subjectList: Subjects[]
  method: 'auto' | 'manual'
  methodStr: string
  state: 0 | 1
  topSign: 0 | 1
  upgrade: 0 | 1
  createTime: number
  updateTime: number
}
```

### 4.4 统一分配接口（按 B 方案，所有类型一致走 saveSchoolTenantUserPost）

| 字段 | 1对1（campus/CGS/CSS/CG/CC/CCS one_to_one） | CCS many_to_many |
|------|:---:|:---:|
| `tenantUserId` | ✅ 必传 | ✅ 必传 |
| `tenantPostId` | ✅ 必传 | ✅ 必传 |
| `dataPermissionType` | ✅ 必传（6 种之一） | ❌ **不传** |
| `permissionScopeList[]` | ✅ 必传（5 维度字段） | ❌ **不传** |
| `classIds[]` | — | ✅ 必传 |
| `subjectIds[]` | — | ✅ 必传 |

**B 方案决策**（2026-09-22 用户确认）：
- **所有 6 种类型统一走 `saveSchoolTenantUserPost`**（对接文档的"单人分配岗位"统一入口）
- `saveFacultyPermission` 仅保留给 `SelectClassListDialog` / `SelectSubjectListDialog` 的"非数据权限分配"老路径（如果存在）；如无 caller，可整段删除
- `facultyAssignPost` 改造为统一调 `saveSchoolTenantUserPost`，按 `dataPermissionType` 是否为空分支：
  - 1对1类型：传 `dataPermissionType` + `permissionScopeList`
  - CCS many_to_many：**不传** `dataPermissionType`，传 `classIds` + `subjectIds`

> ⚠️ 后端当前**不消费**新字段（按对接文档 §1 实现状态）；前端按契约正确传，等后端实现即可生效。

---

## 5. 组件设计

### 5.1 改造的 picker-dialog 组件（5 个）

**改造模板**（参考 `students.vue:122-216` 的 `handleTreeLoadNode`）：

```vue
<!-- campus-class-subject-picker-dialog.vue 改造示例 -->
<template>
  <ElDialog v-model="modelVisible" ...>
    <ElTree
      ref="treeRef"
      :data="treeData"
      :load="handleLoadNode"
      :props="treeProps"
      lazy
      show-checkbox
      node-key="id"
    />
  </ElDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  schoolId: string
  classType: string  // ← 新增 prop
  defaultPaths: CampusClassSubjectPath[]
  skipResetOnOpen?: boolean
}>()

async function handleLoadNode(node, resolve) {
  const { level, data } = node
  if (level === 0) {
    const list = await service.baseData.getSchoolCampusList({ schoolId: props.schoolId, state: 1 })
    return resolve(list.map(item => ({
      id: item.id, label: item.name, isLeaf: false,
      params: { campusId: item.id }
    })))
  }
  if (level === 1) {
    const list = await service.baseData.getSchoolStageList({ schoolId: props.schoolId, campusId: data.params.campusId })
    return resolve(list.map(item => ({
      id: item.id, label: item.typeStr, isLeaf: false,
      params: { ...data.params, stageId: item.id }
    })))
  }
  if (level === 2) {
    const list = await service.school.getSchoolGradeListByCurrentYear({
      schoolId: props.schoolId, campusId: data.params.campusId, stageId: data.params.stageId
    })
    return resolve(list.map(item => ({
      id: item.id, label: item.name, isLeaf: false,
      params: { ...data.params, gradeId: item.id }
    })))
  }
  if (level === 3) {
    const list = await service.school.getSchoolClassList({
      schoolId: props.schoolId, campusId: data.params.campusId, stageId: data.params.stageId,
      yearId: ..., gradeId: data.params.gradeId, classType: props.classType
    })
    return resolve(list.map(item => ({
      id: item.id, label: item.name, isLeaf: false,
      params: { ...data.params, classId: item.id }
    })))
  }
  if (level === 4) {
    const list = await service.school.schoolSubjectsPage({ schoolId: props.schoolId, page: 1, size: 100 })
    return resolve(list.list.map(item => ({
      id: item.id, label: item.name, isLeaf: true,
      params: { ...data.params, subjectId: item.id }
    })))
  }
}
</script>
```

5 个 picker-dialog 各自按 requirements §4 的 level 0~4 链路拼装。

### 5.2 list-cells.ts 改造

```ts
export function resolveListCells(row: FacultyPostRowLike): ListCellModel {
  const enumValue = row.dataPermissionType        // 重命名
  const scopes = row.scopes ?? []                 // 二次拉注入
  
  if (enumValue === DataPermissionEnum.CAMPUS) {
    return {
      scopeTags: [...(row.classList ?? []), ...(row.gradeList ?? [])],
      campusTags: row.campusName?.split(',').filter(Boolean) ?? [],
      subjectMode: 'all',                          // 校区型强制「全部」
      subjectTags: [],
      subjectLimit: 2,
    }
  }
  
  // CGS: scopes → 派生 classList / gradeList / subjectList
  if (enumValue === DataPermissionEnum.CAMPUS_GRADE_SUBJECT) {
    const gradeTags = uniqueBy(scopes, s => s.gradeId, s => ({ id: s.gradeId, name: ... }))
    const subjectTags = uniqueBy(scopes, s => s.subjectId, s => ({ id: s.subjectId, name: ... }))
    return {
      scopeTags: gradeTags,
      campusTags: uniqueBy(scopes, s => s.campusId, ...),
      subjectMode: 'tags',
      subjectTags,
      subjectLimit: 2,
    }
  }
  
  // CSS / CG / CC / CCS 按类似逻辑
}
```

### 5.3 faculty-position.vue 列表二次拉

```ts
const listPaging = useListPaging({
  async getRecords(page, size, filter) {
    const { list, total } = await service.school.facultyPermissionPage({...})
    
    // 二次拉 scopes（按 facultyPermissionId）
    const scopesById = await Promise.all(
      list.map(async row => {
        const scopes = row.dataPermissionType
          ? await service.school.queryDataScopeList({ facultyPermissionId: row.id }).catch(() => [])
          : []
        return [row.id, scopes] as const
      })
    )
    const map = Object.fromEntries(scopesById)
    
    return {
      list: list.map(row => ({ ...row, scopes: map[row.id] ?? [] })),
      total,
    }
  }
})
```

---

## 6. 交互细节

### 6.1 弹框防抖 / 节流

| 按钮 | 防抖策略 |
|------|---------|
| 【下一步】 | 点击后立即 `disabled` + loading，300ms 后恢复 |
| 【确定】（图2 / 图4） | 点击后立即 `disabled` + loading，等待响应；失败保留 5s 让用户看 toast |
| 【取消】 | 点击后立即关闭弹框（无需 loading） |
| 列表【数据权限】操作 | 点击后立即 `disabled`（避免双击打开 2 个弹框） |

### 6.2 loading / 错误态

- 弹框加载：复用 `v-loading="singleAssignForm.loading"`
- 失败 toast：`ElMessage.error(message)`，**保留弹框**，用户可改后再提交

### 6.3 列表派生三列渲染

| 列 | 渲染 |
|----|------|
| 权限范围 | `resolveListCells(row).scopeTags` → `AppTagClampTooltip :limit=2 formatter=name` |
| 所属校区 | `resolveListCells(row).campusTags` → `AppTagClampTooltip :limit=2 formatter=raw` |
| 任教科目 | `subjectMode==='all'` → `<span>全部</span>`<br>`subjectMode==='tags'` → `AppTagClampTooltip :limit=subjectLimit`<br>`subjectMode==='empty'` → `<span>--</span>` |

---

## 7. Mock 数据清理

### 7.1 删除

- `src/mocks/faculty-position/` 整目录（13 文件）
  - `assign.ts`（含 `__BRANCH_*` 魔值）
  - `update.ts`
  - `remove.ts`
  - `campus-list.ts`
  - `campus-grade-tree.ts` / `campus-grade-subject-tree.ts` / `campus-class-tree.ts` / `campus-class-subject-tree.ts` / `campus-stage-subject-tree.ts`
  - `data-permission-enums.ts`（含 `[TEST-N]` 测试项）
  - `faculty-post-list.ts`
  - `post-config.ts`
  - `index.ts`（USE_MOCK 开关）

### 7.2 全局搜杀验证

```bash
# 期望：业务代码 0 命中（文档除外）
rg "mocks/faculty-position|USE_MOCK|__BRANCH_|MOCK_TEST_BRANCH|VITE_FACULTY_MOCK" src/
rg "dataPermissionEnum" src/  # 仅零业务代码应有过渡引用
```

---

## 9. 验收标准

### 9.1 功能（端到端）

- [ ] **删除** `src/mocks/faculty-position/` 整目录
- [ ] **新增** 3 个 service 函数（getDataPermissionTypesByPost / queryDataScopeList / updateDataScope）
- [ ] **改造** mock-first 切真接口 5 个 service 函数
- [ ] **改造** 5 个 `facultyCampus*Tree` 为 ElTree lazy load 链路拼装
- [ ] **删除** `facultyPostList`，调用方改回 `facultyPermissionPage`
- [ ] 6 种数据权限类型弹框树能正确从真接口拉数据
- [ ] CCS 图1 弹框增加【设置方式】切换（1对1 / 多对多）
- [ ] CCS 多对多分配走老路径（不传 `dataPermissionType`，传 `classIds` + `subjectIds`）
- [ ] CCS 多对多编辑走 `updateFacultyPermission`（老接口）
- [ ] 列表派生按 `dataPermissionType` + 二次拉 `queryDataScopeList` 正确展示三列
- [ ] 字段名重命名（`dataPermissionEnum` → `dataPermissionType`，3 个枚举值）
- [ ] 范围结构从嵌套 `scopePaths` 改扁平 `permissionScopeList`
- [ ] 删除 `__BRANCH_*` 测试魔值和 `[TEST-N]` 测试项
- [ ] UI 分支保留：无 `dataPermissionType` 显示原 3 按钮（班级 / 科目 / 删除）

### 9.2 工程

- [ ] 全部按钮防抖 300ms 不变
- [ ] 弹框切换走 `nextTick` 控制顺序，无样式跳动
- [ ] loading 态在所有数据加载时显示
- [ ] 失败 toast 保留弹框
- [ ] `pnpm typecheck` 0 错误
- [ ] `pnpm eslint` 0 新错误

### 9.3 Harness 闭环

- [ ] `pnpm harness:check` 无本模块 `ARCHIVE_MISSING_*` 警告
- [ ] `pnpm harness:status -- --match 教职工权限及范围` 显示 `DELIVERED`

---

## 10. 风险 / 备注

1. **后端 3 个接口待实现**：saveSchoolTenantUserPost 消费新字段 / updateDataScope 落库 / facultyPermissionPage 填充 stageList。前端代码可先行，等后端逐步实现即可。
2. **B 方案决策（统一走 saveSchoolTenantUserPost）**：所有 6 种类型都通过 `saveSchoolTenantUserPost` 分配。**强制依赖后端实现新字段消费**，否则 1对1 类型的 `dataPermissionType` 不落库 → 列表走老分支。
3. **stageList 后端未填充**：CSS 类型回显阶段，不能依赖 `facultyPermissionPage` 的 `stageList` 字段；需用 `queryDataScopeList` 返回的 scopes 自行按 stageId 聚合
4. **`queryAllowSubjectsList` 入参类型修正**：service 当前 `defineService<undefined, ...>` 写错，应改为 `{ stageId: string }`
5. **mock 字段适配**：前端 utils/faculty-data-permission.ts 的 Path 嵌套结构改扁平 5 维度，影响所有 picker-dialog + cascader 组件的 pathKey 计算函数
6. **`saveFacultyPermission` / `updateFacultyPermission` 保留**：CCS many_to_many 编辑保存仍用 `updateFacultyPermission`（school.ts:91，老接口）；如果 `saveFacultyPermission` 无其他 caller，整段删除

---

## 11. Skill 路由提示（Step C 计划阶段用）

- `vue-skills` — Vue 3 组件设计（5 个 picker 改造）
- `frontend-design` — 列表派生渲染

> 不需要 Figma 还原（无 figma.com 链接）

---

**确认请回 `spec OK`**，我即进入 Step C 写 `plans/01-dev-plan.md`。