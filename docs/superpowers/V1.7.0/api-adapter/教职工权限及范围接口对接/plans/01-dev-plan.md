# 教职工权限及范围接口对接 · 开发计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.0 / api-adapter
**状态：** 待 P3 确认（Inline / SDD）
**目标仓库：** `E:\code\two\frontend`

---

## 0. 全局前置

```bash
# 实现前必跑
pnpm harness:status -- --match "教职工权限及范围接口对接"  # 期望 READY_TO_DEV
pnpm harness:check                                          # 期望无本模块警告
```

---

## Task 1：删除 mock 整目录

> **Skill:** —
> **理由:** 纯文件删除，无技术决策点

```bash
# 删除
rm -rf E:/code/two/frontend/src/mocks/faculty-position/

# 验证：业务代码无引用
rg "mocks/faculty-position|USE_MOCK|__BRANCH_|MOCK_TEST_BRANCH|VITE_FACULTY_MOCK" E:/code/two/frontend/src/
# 期望：仅 docs/ 命中，业务代码 0 命中
```

**验证**：mock 目录不存在，rg 命令业务侧 0 命中。

---

## Task 2：枚举值重命名（`constants/faculty.ts`）

> **Skill:** —
> **理由:** TypeScript 类型 + 常量重命名

`E:/code/two/frontend/src/constants/faculty.ts` 改造：

```ts
export enum DataPermissionEnum {
  CAMPUS = 'campus',
  CAMPUS_GRADE_SUBJECT = 'campus_grade_subject',         // 原 CAMPUS_GRADE_SUB
  CAMPUS_CLASS_SUBJECT = 'campus_class_subject',         // 原 CAMPUS_CLASS_SUB
  CAMPUS_CLASS = 'campus_class',
  CAMPUS_GRADE = 'campus_grade',
  CAMPUS_STAGE_SUBJECT = 'campus_stage_subject',         // 原 CAMPUS_STAGE_SUB
  ALL = '__all__',
}
// DATA_PERMISSION_IMPLEMENTED 列表不变
```

**验证**：`pnpm typecheck` 0 错误（业务代码会有大量引用报错，下游 Task 处理）。

---

## Task 3：`utils/faculty-data-permission.ts` Path 结构调整

> **Skill:** —
> **理由:** 类型结构调整，影响所有 picker 组件

`E:/code/two/frontend/src/utils/faculty-data-permission.ts` 改造：

- 删 `CampusGradeSubjectPath` / `CampusClassSubjectPath` / `CampusStageSubjectPath` / `CampusClassPath` / `CampusGradePath` 嵌套类型
- 改用 `SchoolFacultyPermissionScopeDTO`（扁平 5 维度字段）

```ts
export interface SchoolFacultyPermissionScopeDTO {
  campusId?: string
  gradeId?: string
  classId?: string
  stageId?: string
  subjectId?: string
}

// pathKey 函数统一为 5 段：
function classSubjectPathKey(p: SchoolFacultyPermissionScopeDTO): string {
  return [p.campusId, p.stageId, p.gradeId, p.classId, p.subjectId].join('\0')
}
```

**验证**：类型替换无遗漏。

---

## Task 4：service 函数新增（3 个）

> **Skill:** —
> **理由:** 标准 service 函数封装

`E:/code/two/frontend/src/service/school.ts` 新增：

```ts
// 1. 数据权限枚举（学校岗位可用）
export const getDataPermissionTypesByPost = defineService<
  { postId?: string },
  Array<{ code: string, name: string, tenantType: string, description: string, disabled: boolean }>
>(async (params, config) => {
  return request.get('/backstage/dataPermissionEnum/schoolList', { params, ...config })
})

// 2. 查询权限范围
export const queryDataScopeList = defineService<
  { facultyPermissionId: string },
  SchoolFacultyPermissionScopeVO[]
>(async (params, config) => {
  return request.get('/backstage/schoolFacultyPermissionScope/queryDataScopeList', { params, ...config })
})

// 3. 全量修改权限范围
export const updateDataScope = defineService<
  { facultyPermissionId: string, permissionScopeList: SchoolFacultyPermissionScopeDTO[] },
  void
>(async (params, config) => {
  return request.post('/backstage/schoolFacultyPermissionScope/updateDataScope', params, config)
})
```

**验证**：3 个函数导出可用。

---

## Task 5：`queryAllowSubjectsList` 入参类型修正

> **Skill:** —
> **理由:** TypeScript 类型 bug 修复

`E:/code/two/frontend/src/service/school.ts:165`：

```ts
// 修复前
export const queryAllowSubjectsList = defineService<undefined, Record<string, any>[]>(...)

// 修复后
export const queryAllowSubjectsList = defineService<{ stageId: string }, Record<string, any>[]>(...)
```

**验证**：调用处 `subject/index.vue:337` 传 `{stageId}` 类型通过。

---

## Task 6：mock-first service 函数改造（5 个）

> **Skill:** —
> **理由:** service 函数体改写

`E:/code/two/frontend/src/service/school.ts` 改造：

```ts
// 1. facultyDataPermissionEnums
export async function facultyDataPermissionEnums(postId: string) {
  return request.post<{ code: number, data: Array<{ value: string, label: string }> }>(
    '/backstage/tenantUserPost/postList',  // 或后端给的真实路径
    { postId }
  )
  // 实际已不需要，保留 alias 用 getDataPermissionTypesByPost
}

// 2. facultyCampusList
export async function facultyCampusList(schoolId: string) {
  return request.post('/backstage/school/schoolCampusList', { schoolId })
}

// 3. facultyAssignPost（B 方案：统一走 saveSchoolTenantUserPost）
export async function facultyAssignPost(payload: {
  facultyId: string
  postId: string
  dataPermissionEnum?: string  // 1对1 必传，CCS 多对多不传
  permissionScopeList?: Array<{ campusId?: string, gradeId?: string, classId?: string, stageId?: string, subjectId?: string }>
  classIds?: string[]           // CCS 多对多
  subjectIds?: string[]         // CCS 多对多
}) {
  return request.post('/backstage/tenantUserPost/saveSchoolTenantUserPost', payload)
}

// 4. facultyUpdateDataPermission
export async function facultyUpdateDataPermission(payload: {
  assignId: string
  permissionScopeList: SchoolFacultyPermissionScopeDTO[]
}) {
  return request.post('/backstage/schoolFacultyPermissionScope/updateDataScope', {
    facultyPermissionId: payload.assignId,
    permissionScopeList: payload.permissionScopeList
  })
}

// 5. facultyRemoveAssign
export async function facultyRemoveAssign(assignId: string) {
  return request.get('/backstage/tenantUserPost/deleteTenantUserPost', {
    params: { tenantUserPostId: assignId }
  })
}
```

**验证**：5 个函数不再走 mock 分支。

---

## Task 7：`facultyPostList` 整段删除

> **Skill:** —
> **理由:** 清理 mock 专用函数

`E:/code/two/frontend/src/service/school.ts` 删除 `facultyPostList` 函数（约 12 行）。

**验证**：rg 无 `facultyPostList` 业务调用（除 faculty-position.vue 准备改）。

---

## Task 8：5 个 `facultyCampus*Tree` 改写为链路拼装

> **Skill:** —
> **理由:** 5 个函数体内重写，逻辑同构（参考 students.vue:122-216）

`E:/code/two/frontend/src/service/school.ts` 改造：

```ts
// 示例：campus_grade_subject 四级树
export async function facultyCampusGradeSubjectTree(schoolId: string) {
  // 返回树形结构（懒加载由 picker-dialog 实现，不在 service 层）
  // service 层只提供"按需获取单层节点"的能力
  return request.post('/backstage/schoolConfig/schoolGradeSubjectsList', { schoolId })
  // 实际不需要这层 service，picker-dialog 直接调链路接口即可
}
```

**⚠️ 简化决策**：
- 5 个 `facultyCampus*Tree` service 函数**整段删除**
- picker-dialog 内部直接调链路接口（getSchoolCampusList / getSchoolStageList / ...）

**验证**：picker-dialog 能独立从真接口拉数据。

---

## Task 9：`DataPermissionSelect.vue` 去掉测试项

> **Skill:** —
> **理由:** 清理 mock 期测试魔值

`E:/code/two/frontend/src/components/faculty/DataPermissionSelect.vue`：

- 移除 `__BRANCH_*` 测试分支
- 移除 `[TEST-N] xxx` 测试项
- 改成调用 `getDataPermissionTypesByPost(postId)`

**验证**：下拉项只有真实 6 种枚举。

---

## Task 10：`list-cells.ts` 按新字段重写

> **Skill:** —
> **理由:** 列表派生函数按 dataPermissionType + scopes 重写

`E:/code/two/frontend/src/components/faculty/data-permission/list-cells.ts`：

- 入参 `row.dataPermissionType`（替代 `dataPermissionEnum`）
- 入参 `row.scopes`（二次拉注入）
- 6 种 type 分支收敛

**验证**：列渲染按新逻辑展示三列。

---

## Task 11：5 个 picker-dialog 改造（ElTree lazy load）

> **Skill:** vue-skills · 置信度 0.85
> **理由:** Vue 3 组件设计、ElTree 懒加载模式

`E:/code/two/frontend/src/components/faculty/data-permission/{campus,campus-grade,campus-grade-subject,campus-class,campus-class-subject}/{}-picker-dialog/{}-picker-dialog.vue`：

按 spec §5.1 模板改造：
- 内部接受 `schoolId`, `classType` 等 props
- 内部用 `<ElTree lazy :load="handleLoadNode">`
- `handleLoadNode` 按 `level` 调用对应链路接口（getSchoolCampusList / getSchoolStageList / getSchoolGradeListByCurrentYear / getSchoolClassList / schoolSubjectsPage）

**验证**：弹框打开后能逐级懒加载展开。

---

## Task 12：`faculty-position.vue` 列表调用改造

> **Skill:** vue-skills · 置信度 0.85
> **理由:** Vue 3 列表渲染 + 二次拉

`E:/code/two/frontend/src/pages/app/basic-data/school/school/faculty/faculty-position.vue`：

- `listPaging.getRecords` 改回 `facultyPermissionPage`
- 二次拉 `queryDataScopeList(facultyPermissionId)` → 注入 `row.scopes`
- 字段名 `dataPermissionEnum` → `dataPermissionType`
- UI 分支：`v-if="row.dataPermissionType"` 替代 `v-if="row.dataPermissionEnum"`

**验证**：列表能拉真接口数据 + 三列正确渲染。

---

## Task 13：`faculty-position.vue` 图1 弹框增加 CCS 设置方式切换

> **Skill:** vue-skills · 置信度 0.85
> **理由:** UI 表单分支

`E:/code/two/frontend/src/pages/app/basic-data/school/school/faculty/faculty-position.vue`：

- 图1 弹框：当 `dataPermissionType === 'campus_class_subject'` 时，显示【设置方式】radio（1对1 / 多对多）
- 1对1：图2 走 picker-dialog（5 级级联）
- 多对多：图2 走 SelectClassListDialog → SelectSubjectListDialog

**验证**：CCS 图1 可切换设置方式，后续流程正确。

---

## Task 14：faculty-position.vue saveSchoolTenantUserPost 接入

> **Skill:** —
> **理由:** service 调用改造

`E:/code/two/frontend/src/pages/app/basic-data/school/school/faculty/faculty-position.vue`：

- `facultyAssignPost` 调用方按 spec §4.4 改造入参
- 1对1类型传 `dataPermissionType + permissionScopeList`
- CCS 多对多**不传** `dataPermissionType`，传 `classIds + subjectIds`

**验证**：6 种类型分配调用入参正确。

---

## Task 15：CC / CG / CGS / CSS 类型 cascader 组件验证

> **Skill:** —
> **理由:** 5 个 cascader 组件配合 picker-dialog 验证

`E:/code/two/frontend/src/components/faculty/data-permission/*/...-cascader.vue`：

- 验证 cascader 接收 props.tree 后能正确展示
- 验证路径聚合函数按新的扁平结构计算

**验证**：5 个 cascader 组件正确展示。

---

## Task 16：utils/faculty-data-permission.ts 聚合函数重写

> **Skill:** —
> **理由:** 数据结构改造配套

`E:/code/two/frontend/src/utils/faculty-data-permission.ts`：

- 删 `pathsToCampusClassListFields` / `pathsToCampusGradeListFields` / `pathsToCampusStageSubjectListFields` / `pathsToClassSubjectListFields` / `pathsToListFields`
- 新增 `scopesToListFields` 统一函数（按 dataPermissionType 分支聚合）

**验证**：list-cells.ts 调用新函数能正确派生三列字段。

---

## Task 17：清理 `__BRANCH_*` 测试魔值和 `[TEST-N]` 测试项

> **Skill:** —
> **理由:** 清理 mock 期测试产物

- Task 1 已删除 mock 目录覆盖大部分
- 验证：`pnpm grep "__BRANCH_" E:/code/two/frontend/src/` 0 命中
- 验证：`pnpm grep "\[TEST-" E:/code/two/frontend/src/` 0 命中

---

## Task 18：全局验证

> **Skill:** —
> **理由:** Harness 闭环

```bash
# 1. 类型检查
pnpm typecheck  # 0 错误

# 2. lint
pnpm eslint  # 0 新错误

# 3. 全局搜杀
rg "dataPermissionEnum" E:/code/two/frontend/src/  # 0 业务命中
rg "mocks/faculty-position" E:/code/two/frontend/src/  # 0 命中
rg "USE_MOCK|__BRANCH_|MOCK_TEST_BRANCH|VITE_FACULTY_MOCK" E:/code/two/frontend/src/  # 0 命中

# 4. harness 状态
pnpm harness:status -- --match "教职工权限及范围接口对接"  # DELIVERED
pnpm harness:check  # 无警告
```

**端到端验证**：6 种类型各跑一遍分配 → 列表 → 编辑 → 删除。

---

## 实施顺序建议

| 阶段 | Task 序号 | 备注 |
|------|----------|------|
| **Phase 1：清理** | 1, 7, 17 | 删除 mock + 删除 service 函数 |
| **Phase 2：基础设施** | 2, 3, 4, 5, 6 | 枚举/类型/service 函数 |
| **Phase 3：组件改造** | 8, 9, 10, 11, 15, 16 | 5 个 picker / 5 个 cascader / list-cells |
| **Phase 4：页面接入** | 12, 13, 14 | faculty-position.vue |
| **Phase 5：验证** | 18 | Harness 闭环 |

---

**确认请回 `plan OK`**，或选择执行方式：
- **Inline**：我直接按 Phase 顺序实现
- **SDD**（Subagent-Driven）：按 plan 派子代理实施，每阶段审计

按 superpowers-harness-run Step C 暂停点（P3）。