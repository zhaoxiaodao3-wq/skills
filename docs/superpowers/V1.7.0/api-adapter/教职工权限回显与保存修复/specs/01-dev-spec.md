# 教职工权限回显与保存修复 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.0 / api-adapter
**状态：** 待 P2 确认
**目标仓库：** `E:\code\two\frontend`(明睿 AI 校园管理平台)
**关联页面：** `src/pages/app/basic-data/school/school/faculty/faculty-position.vue` 及其依赖
**改造范围：** 7 个核心文件(service / registry / composable / utils + 5 个 cascader util)

---

## 1. 概述

### 1.1 背景

V1.7.0 已 DELIVERED 的"教职工权限及范围接口对接"模块在 6 种数据权限类型的回显与保存链路上存在 9 个 bug:

| Bug | 类别 | 影响范围 | 必修/后端协作 |
|-----|------|---------|-------------|
| A-1 字段名错位(assignId vs facultyPermissionId) | 保存 | 5 种 1对1 编辑保存全部失败 | 前端独立修 |
| A-2 toUpdateBody 多传 dataPermissionType | 保存 | 同上 | 前端独立修 |
| B-1 校区型回显依赖 row.scopeCampusIds | 回显 | 校区型回显空 | 前端改用 queryDataScopeList |
| B-2 CCS 多对多判断依赖 row.setupMode | 回显 | CCS 多对多编辑走错分支 | 前端改用 dataPermissionType 空值判断 |
| B-3 CSS 类型列表依赖 row.stageList | 回显 | CSS 列表"权限范围"列展示空 | 后端补 stageList |
| B-4 列表聚合缺维度名 | 回显 | 列表展示 id 而非名称 | 后端补 VO name 字段 |
| C-1 CG/CGS/CC scope 缺 stageId | 设计 | 3 种类型 cascader 回显断 | 后端冗余写入 stageId |
| C-2 campusList 字段缺失 | 设计 | 校区型列表展示退化 | 已被 D-3 规避 |
| C-3 setupMode 字段缺失 | 设计 | CCS 多对多判断 | 已被 D-2 规避 |

### 1.2 关键决策(2026-09-23 用户拍板)

- **D-1**:CG/CGS/CC 的 stageId 由后端冗余写入 scope
- **D-2**:CCS 多对多 / 1对1 通过 `dataPermissionType` 是否为空字符串/null 判断
- **D-3**:校区型回显**不降级**,完全依赖 queryDataScopeList

### 1.3 档位 / 暂停点

- 档位:**标准**(边界清晰的小改/修复,已有代码路径)
- 暂停点:本文对应 **P2**。P3(Inline / SDD)在 `plans/01-dev-plan.md` 完成后单独确认
- 实现门禁:P2 + P3 + `pnpm harness:status` → `READY_TO_DEV` 后才能改 `src/`

---

## 2. 范围

### 2.1 本期 IN

- 修复 9 个 bug 中的 7 个前端可独立修复的部分(A-1、A-2、B-1、B-2;**B-3 / B-4 / C-1 等后端协作项仅在前端做兼容占位**)
- 不动上一模块已对接的 service 函数(mock 切真接口已完成)
- 不动 mock 清理(已 DELIVERED)
- 不动 UI 框架(组件结构沿用)

### 2.2 本期 OUT

- 后端协作项的同步推进(用户决定另起线程)
- 其他数据权限类型扩展
- 学年升级联动
- 移动端适配

---

## 3. 6 种类型回显/保存契约(决策落地表)

| 类型 | dataPermissionType 值 | 回显数据来源 | 回显组件 | 保存接口 | scope 必填字段 |
|------|----------------------|-------------|---------|---------|---------------|
| 校区型 | `campus` | `queryDataScopeList` → `scopes` 取 `campusId` | `CampusMultiPickerDialog` | `updateDataScope` | `campusId` |
| CGS | `campus_grade_subject` | `queryDataScopeList` → `scopes` | `campus-grade-subject-picker-dialog` | `updateDataScope` | `campusId`, `stageId`, `gradeId`, `subjectId` |
| CCS 1对1 | `campus_class_subject` | `queryDataScopeList` → `scopes` | `campus-class-subject-picker-dialog` | `updateDataScope` | `campusId`, `stageId`, `gradeId`, `classId`, `subjectId` |
| CCS 多对多 | **空字符串 / null / 老类型** | 不走 queryDataScopeList,走 `row.classList` ∪ `row.subjectList` | `SelectClassListDialog` + `SelectSubjectListDialog` | `updateFacultyPermission` | 走老 `classIds`/`subjectIds` |
| CC | `campus_class` | `queryDataScopeList` → `scopes` | `campus-class-picker-dialog` | `updateDataScope` | `campusId`, `stageId`, `gradeId`, `classId` |
| CG | `campus_grade` | `queryDataScopeList` → `scopes` | `campus-grade-picker-dialog` | `updateDataScope` | `campusId`, `stageId`, `gradeId` |
| CSS | `campus_stage_subject` | `queryDataScopeList` → `scopes` 取 stageId | `campus-stage-subject-picker-dialog` | `updateDataScope` | `campusId`, `stageId`, `subjectId` |

**CCS 多对多分支判断(D-2 落地)**:
```ts
const isManyToMany =
  !row.dataPermissionType
  || row.dataPermissionType === ''
  || row.dataPermissionType === null
  || row.dataPermissionType === undefined
```

`composable.openEdit` 中:
```ts
if (
  readType(row) === 'campus_class_subject'
  && !isManyToMany  // 1对1:dataPermissionType 显式为 campus_class_subject
) {
  // 走 5 级弹框
}
if (readType(row) !== 'campus_class_subject' && isManyToMany) {
  // 走 SelectClassListDialog
}
```

> 注:严格按 D-2,只要 `dataPermissionType === 'campus_class_subject'` 即 1对1;其他(空/null/老的非 1对1)即多对多走老接口。

**校区型回显(D-3 落地)**:
- 不再依赖 `row.scopeCampusIds` 或 `row.campusList`
- `campusStrategy.getDefaults(row)` 改为:`row.scopes.map(s => s.campusId ?? '').filter(Boolean)`
- `CampusMultiPickerDialog` 在 `onMounted` 拉全量校区列表(已实现),selected 来自 defaultCampusIds

---

## 4. bug 修复表(7 个前端修复任务)

### T1 · 修复 `facultyUpdateDataPermission` 字段名

**文件:** `src/service/school.ts`

**现状(line 551-559)**:
```ts
export async function facultyUpdateDataPermission(payload: {
  assignId: string // facultyPermissionId
  permissionScopeList: SchoolFacultyPermissionScopeDTO[]
}) {
  return rawRequest.post('/backstage/schoolFacultyPermissionScope/updateDataScope', {
    facultyPermissionId: payload.assignId,    // ← payload.assignId = undefined
    permissionScopeList: payload.permissionScopeList,
  })
}
```

**改为**:
```ts
export async function facultyUpdateDataPermission(payload: {
  facultyPermissionId: string
  permissionScopeList: SchoolFacultyPermissionScopeDTO[]
}) {
  return rawRequest.post('/backstage/schoolFacultyPermissionScope/updateDataScope', {
    facultyPermissionId: payload.facultyPermissionId,
    permissionScopeList: payload.permissionScopeList,
  })
}
```

### T2 · 修复 `toUpdateBody` 不返回 `dataPermissionType`

**文件:** `src/components/faculty/data-permission/registry.ts`

**现状(makeScopeStrategy line 39-62)**:
```ts
toUpdateBody(facultyPermissionId, dataPermissionType, detail) {
  return {
    facultyPermissionId,
    dataPermissionType,    // ← 多余,对接文档 §4 不传
    permissionScopeList: cloneScopes(detail),
  }
}
```

**改为**(删 `dataPermissionType` 字段):
```ts
toUpdateBody(facultyPermissionId, _dataPermissionType, detail) {
  return {
    facultyPermissionId,
    permissionScopeList: cloneScopes(detail),
  }
}
```

`campusStrategy.toUpdateBody` 同样处理。

### T3 · 修复 `campusStrategy.getDefaults` 不依赖 `row.scopeCampusIds`

**文件:** `src/components/faculty/data-permission/registry.ts`

**现状(line 17-24)**:
```ts
getDefaults(row) {
  return {
    kind: 'campus',
    campusIds: (row?.scopeCampusIds && row.scopeCampusIds.length)
      ? [...row.scopeCampusIds]
      : (row?.scopes ?? []).map(s => s.campusId ?? '').filter(Boolean),
  }
}
```

**改为**(按 D-3,只依赖 queryDataScopeList 注入的 scopes):
```ts
getDefaults(row) {
  return {
    kind: 'campus',
    campusIds: (row?.scopes ?? []).map(s => s.campusId ?? '').filter(Boolean),
  }
}
```

### T4 · 修复 CCS 多对多 / 1对1 判断(D-2 落地)

**文件:** `src/composables/useFacultyDataPermissionSession.ts`

**现状(line 321-328)**:
```ts
async function openEdit(row: FacultyPostRowLike) {
  if (
    readType(row) === DataPermissionEnum.CAMPUS_CLASS_SUBJECT
    && row.setupMode === DataPermissionSetupMode.MANY_TO_MANY
  ) {
    options.openClassPermissionDialog?.(row)
    return
  }
  ...
}
```

**改为**(按 D-2,dataPermissionType 空值即多对多):
```ts
async function openEdit(row: FacultyPostRowLike) {
  const type = readType(row)
  // CCS 多对多:dataPermissionType 为空/null/老的非 campus_class_subject
  const isManyToMany = !type || type === DataPermissionEnum.CAMPUS_CLASS_SUBJECT
    ? (type !== DataPermissionEnum.CAMPUS_CLASS_SUBJECT)  // 空值/null 走老路径
    : true  // 其他类型 enum 走新接口(不是 CCS)
  // 简化:
  if (type !== DataPermissionEnum.CAMPUS_CLASS_SUBJECT) {
    // dataPermissionType 为空/null/其他 enum → 多对多走老接口
    if (type === undefined || type === null || type === '') {
      options.openClassPermissionDialog?.(row)
      return
    }
    // 其他 enum 不属于本期范围,防御性 return
    const strategy = resolveDataPermissionStrategy(type)
    if (!strategy) return
    // ... 走对应 picker-dialog
  }
  // type === 'campus_class_subject' → 1对1
  const strategy = resolveDataPermissionStrategy(type)
  if (!strategy) return
  // ... 走 5 级弹框
  ...
}
```

> 实现细节见 plans/01-dev-plan.md 的 T4 子任务拆分。

### T5 · 修复列表聚合 `aggregateXxx` 兼容 VO name 字段

**文件:** `src/utils/faculty-data-permission.ts`

**现状(aggregateCampuses line 84-90)**:
```ts
export function aggregateCampuses(items: Array<{ campusId?: string, campusName?: string }>) {
  return uniqById(
    items
      .filter(i => i.campusId)
      .map(i => ({ id: i.campusId as string, name: i.campusName ?? i.campusId as string })),
  )
}
```

**改为**(兼容多字段名):
```ts
export function aggregateCampuses(items: Array<Record<string, any>>) {
  return uniqById(
    items
      .filter(i => i.campusId ?? i.id)
      .map(i => ({
        id: String(i.campusId ?? i.id ?? ''),
        name: String(i.campusName ?? i.name ?? i.campusId ?? i.id ?? ''),
      })),
  )
}
```

其他 4 个 aggregate 函数同样处理。

### T6 · 修复 CSS 列表三列 fallback(D-3 不降级,但 scope 缺 stageName 时有兜底)

**文件:** `src/utils/faculty-data-permission.ts`

**现状(line 245-274)**:
```ts
if (type === DataPermissionEnum.CAMPUS_STAGE_SUBJECT) {
  const stageTags = useScopes
    ? aggregateStages(scopes as any)
    : (fb.stageList ?? []).map(s => ({ ... }))
  ...
}
```

**改为**(后端协作 #2 完成后 `aggregateStages` 会从 scope 的 stageName 字段取;当前 fallback 保留 stageList):
```ts
if (type === DataPermissionEnum.CAMPUS_STAGE_SUBJECT) {
  const stageTags = useScopes
    ? aggregateStages(scopes as any)  // scope 带 stageId 和 stageName(后端补)
    : (fb.stageList ?? []).map(s => ({ ... }))
  ...
}
```

> 当前实现不动;依赖 T5 修复后 `aggregateStages` 从 scope 取 stageName。

### T7 · 修复 CCS 多对多列表展示(无 dataPermissionType 分支)

**文件:** `src/utils/faculty-data-permission.ts`

**现状(line 275-285)**:
```ts
// 兼容老数据:无 dataPermissionType;scopeTags = classList∪gradeList;subjectTags = row.subjectList
const scopeTags = [...(fb.classList ?? []), ...(fb.gradeList ?? [])]
const subjectTags = fb.subjectList ?? []
return {
  ...empty,
  scopeTags,
  campusTags,
  subjectMode: subjectTags.length ? 'tags' : 'empty',
  subjectTags,
  subjectLimit: 6,
}
```

**改为**(CCS 多对多:scopeTags = classList,subjectTags = subjectList):
```ts
// 无 dataPermissionType:CCS 多对多走老 classIds/subjectIds
const scopeTags = fb.classList ?? []
const subjectTags = fb.subjectList ?? []
return {
  ...empty,
  scopeTags,
  campusTags,
  subjectMode: subjectTags.length ? 'tags' : 'empty',
  subjectTags,
  subjectLimit: 6,
}
```

> 注:CCS 多对多无 gradeList 字段,只 classList;原逻辑"classList ∪ gradeList"会混入空 gradeList 数组,实际等价,但更清晰是只取 classList。

---

## 5. 数据契约(对接后端补齐后)

### 5.1 `queryDataScopeList` 返回 VO(后端补 name 字段)

```ts
interface SchoolFacultyPermissionScopeVO extends SchoolFacultyPermissionScopeDTO {
  id: string                       // 范围明细主键
  facultyPermissionId: string       // 主表 ID
  campusName?: string               // ← 后端补(原 VO 没有)
  gradeName?: string                // ← 后端补
  className?: string                // ← 后端补
  stageName?: string                // ← 后端补
  subjectName?: string              // ← 后端补
  scopeName?: string                // 后端拼接名(备用)
  createTime?: string
  updateTime?: string
}
```

### 5.2 `updateDataScope` 入参(对接文档 §4)

```ts
// 前端只发**
{
  facultyPermissionId: string       // 必填
  permissionScopeList: SchoolFacultyPermissionScopeDTO[]  // 必填,非空
}
// 不传 dataPermissionType(对接文档明确约定)
```

### 5.3 CG/CGS/CC scope 冗余 stageId(后端协作 #5)

```ts
// CG 类型的 scope 实际包含
{
  campusId: string,
  stageId: string,   // ← 冗余写入,对接文档"前端按类型组织明细"表说 CG 不含 stageId,实际必须有
  gradeId: string,
}
```

### 5.4 `facultyPermissionPage` 行(D-2 / D-3 决定不补 `setupMode` / `campusList`)

```ts
interface FacultyPermissionRow {
  id: string
  dataPermissionType: string | null  // CCS 多对多为 null/''/'老值';1对1 为 'campus_class_subject'
  campusName: string | null          // 字符串拼接,校区型 list 三列渲染用(降级路径)
  classList: SchoolClass[]
  gradeList: SchoolGrade[]
  subjectList: Subjects[]
  stageList?: SchoolStage[]          // 后端协作 #4 补
  // 不新增 campusList(D-3),不新增 setupMode(D-2)
  ...
}
```

---

## 6. 组件改造一览

| 文件 | 改动 |
|------|------|
| `src/service/school.ts` | T1: `facultyUpdateDataPermission` 字段名修正 |
| `src/components/faculty/data-permission/registry.ts` | T2: `toUpdateBody` 删 `dataPermissionType`;T3: `campusStrategy.getDefaults` 删 `row.scopeCampusIds` 分支 |
| `src/composables/useFacultyDataPermissionSession.ts` | T4: CCS 多对多判断改为 `dataPermissionType` 空值判断 |
| `src/utils/faculty-data-permission.ts` | T5: 5 个 `aggregateXxx` 兼容 VO name 字段;T6: CSS fallback 保留;T7: CCS 多对多无 dataPermissionType 分支只取 classList |

**未改动**:
- 5 个 cascader `.util.ts`:对齐对接文档契约(D-1 后端补 stageId),前端不动
- 5 个 picker-dialog:接 `defaultScopes` 流程不变,只依赖后端补齐
- `faculty-position.vue`:列表 / 编辑入口流程不变

---

## 7. 验收标准

### 7.1 功能(端到端)

- [ ] **保存(A-1 修复)**:5 种 1对1 类型点击【数据权限】→ 改 scope → 确定 → 后端日志显示 `facultyPermissionId` 不为空 → 列表刷新成功
- [ ] **保存(A-2 修复)**:后端收到的 body 不含 `dataPermissionType` 字段
- [ ] **校区型回显(D-3 落地)**:校区型行点击【数据权限】,弹框显示已选校区(默认勾上),未选校区未勾上
- [ ] **CGS 回显**:CGS 行点击【数据权限】,cascader 路径完整匹配 4 段(校区/学段/年级/科目)
- [ ] **CCS 1对1 回显**:dataPermissionType='campus_class_subject' 的行点击【数据权限】,5 级 cascader 路径完整
- [ ] **CCS 多对多回显(D-2 落地)**:dataPermissionType='' 或 null 的 CCS 行点击【数据权限】,**走 SelectClassListDialog**(不开 5 级弹框),班级列表已选回填正确
- [ ] **CC 回显**:CC 行点击【数据权限】,4 级 cascader 路径完整
- [ ] **CG 回显**:CG 行点击【数据权限】,3 级 cascader 路径完整
- [ ] **CSS 回显**:CSS 行点击【数据权限】,3 级 cascader 路径完整(跳过年级)
- [ ] **列表三列渲染**:6 种类型的三列(权限范围 / 所属校区 / 任教科目)展示正确
- [ ] **CCS 多对多列表**:dataPermissionType='' 的 CCS 行显示【班级权限 + 科目权限 + 删除】3 按钮

### 7.2 工程

- [ ] `pnpm typecheck` 0 错误
- [ ] `pnpm eslint` 0 新错误
- [ ] `pnpm harness:check` 无本模块 ARCHIVE_MISSING_* 警告
- [ ] 全部按钮防抖 300ms 不变

### 7.3 Harness 闭环

- [ ] 模块目录四层齐全(requirements / specs / plans / archive)
- [ ] requirements / spec / plan 链接正确
- [ ] 改 src/ 前 validate-harness 已跑(`pnpm harness:status` → `READY_TO_DEV`)
- [ ] spec 验收项已勾选
- [ ] 一致性自检已完成并写入 archive
- [ ] 还原度自检:不适用(api-adapter / 非 UI)
- [ ] archive 交付快照已写
- [ ] commit 前 validate-harness 已跑

---

## 8. 风险 / 备注

1. **后端 4 个补项**(步骤 4 表格)本期不阻塞前端代码完成;但联调前必须确认:
   - `queryDataScopeList` 实现且返回 VO 含各维度 name(否则列表展示退化为 id)
   - `updateDataScope` 实现且支持 `permissionScopeList` 全量替换
   - CG/CGS/CC 的 scope 冗余写入 stageId(否则 cascader 路径断)
   - `facultyPermissionPage` 行填充 `stageList`(否则 CSS 列表展示空)
2. **CCS 多对多 / 1对1 共享 enum 值**:按 D-2,只有 `dataPermissionType === 'campus_class_subject'` 才走 1对1 路径;其他(空/null/老的非 1对1)走多对多老接口
3. **校区型回显**:依赖 `queryDataScopeList` 落地;当前 501 → 等后端;无降级方案(D-3 拍板)
4. **不动 mock 清理**:V1.7.0 已 DELIVERED,本期只修复 bug,不重构
5. **不动 UI 框架**:组件结构沿用,只修内部逻辑

---

## 9. Skill 路由提示(Step C 计划阶段用)

- `vue-skills` — composable 改造(T4)
- `code-review` — diff 提交前评审

> 不需要 Figma 还原(无 figma.com 链接)

---

**确认请回 `spec OK`**,我即进入 Step C 写 `plans/01-dev-plan.md`。