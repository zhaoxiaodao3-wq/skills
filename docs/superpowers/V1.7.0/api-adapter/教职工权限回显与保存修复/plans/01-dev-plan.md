# 教职工权限回显与保存修复 · 开发计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**目标仓库:** `E:\code\two\frontend`
**档位:** 标准
**类型:** api-adapter
**Skill 路由:** 由 `node .agents/routing/router.mjs --annotate` 自动标注(见各 Task 下方)
**执行方式(P3):** Inline(默认)

---

## 总览

| Task | 文件 | 估时 | Skill 标注(待 router 输出) |
|------|------|------|------------------------------|
| T0 | 准备:校验分支、读取 7 个目标文件 | 5min | harness |
| T1 | `src/service/school.ts`:`facultyUpdateDataPermission` 字段名修复 | 2min | (待 router) |
| T2 | `src/components/faculty/data-permission/registry.ts`:`toUpdateBody` 删 dataPermissionType | 2min | (待 router) |
| T3 | `src/components/faculty/data-permission/registry.ts`:`campusStrategy.getDefaults` 删 scopeCampusIds 分支 | 2min | (待 router) |
| T4 | `src/composables/useFacultyDataPermissionSession.ts`:CCS 多对多判断(D-2) | 5min | vue-skills |
| T5 | `src/utils/faculty-data-permission.ts`:5 个 aggregateXxx 兼容 VO name | 3min | (待 router) |
| T6 | `src/utils/faculty-data-permission.ts`:CSS fallback 保留 | 2min | (待 router) |
| T7 | `src/utils/faculty-data-permission.ts`:CCS 多对多列表只取 classList | 2min | (待 router) |
| V1 | 验证:`pnpm typecheck` + `pnpm eslint` | 3min | (待 router) |
| V2 | 验证:`pnpm harness:check` + `pnpm harness:status` | 2min | (待 router) |
| A1 | 归档:`archive/教职工权限回显与保存修复-delivered.md` | 5min | (待 router) |

**总计:** ~33min

---

## Task 0 · 准备(分支 + 文件快照)

> **Skill:** harness · 置信度高 · 自动激活
> **理由:** 改实现前先校验工作区状态

**步骤:**

1. 切到目标仓库 `E:\code\two\frontend`
2. 确认分支(避免在 main 直接改)
   ```bash
   git status
   git branch --show-current
   ```
3. 读 7 个目标文件的当前状态(已经在 P1 阶段读过,此步骤在改前快速核对版本)

**通过条件:**
- 工作区干净或 stash 已存
- 7 个目标文件路径在仓库中存在

---

## Task 1 · `facultyUpdateDataPermission` 字段名修复

> **Skill:** (无) · 仅 TS 类型契约修复
> **理由:** 字段名错位修复属纯 type/adapter 改动,不在 SKILL_ROUTING 覆盖范围

**文件:** `src/service/school.ts`

**变更位置:** `facultyUpdateDataPermission` 函数(line 551-559)

**变更前:**
```ts
export async function facultyUpdateDataPermission(payload: {
  assignId: string // facultyPermissionId
  permissionScopeList: SchoolFacultyPermissionScopeDTO[]
}) {
  return rawRequest.post('/backstage/schoolFacultyPermissionScope/updateDataScope', {
    facultyPermissionId: payload.assignId,
    permissionScopeList: payload.permissionScopeList,
  })
}
```

**变更后:**
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

**通过条件:**
- `payload.assignId` → `payload.facultyPermissionId` 全文替换
- 注释 `// facultyPermissionId` 删除(已正确)
- 函数返回类型不变

---

## Task 2 · `toUpdateBody` 删 `dataPermissionType` 字段

> **Skill:** (无) · 仅 TS 类型契约修复
> **理由:** `toUpdateBody` 返回 body 删字段,纯 type/adapter 改动

**文件:** `src/components/faculty/data-permission/registry.ts`

**变更位置 1:** `campusStrategy.toUpdateBody`(line 29-36)

**变更前:**
```ts
toUpdateBody(facultyPermissionId, dataPermissionType, detail) {
  const campusIds = detail.kind === 'campus' ? detail.campusIds : []
  return {
    facultyPermissionId,
    dataPermissionType,
    permissionScopeList: campusIds.map(id => ({ campusId: id })),
  }
}
```

**变更后:**
```ts
toUpdateBody(facultyPermissionId, _dataPermissionType, detail) {
  const campusIds = detail.kind === 'campus' ? detail.campusIds : []
  return {
    facultyPermissionId,
    permissionScopeList: campusIds.map(id => ({ campusId: id })),
  }
}
```

**变更位置 2:** `makeScopeStrategy.toUpdateBody`(line 54-60)

**变更前:**
```ts
toUpdateBody(facultyPermissionId, dataPermissionType, detail) {
  return {
    facultyPermissionId,
    dataPermissionType,
    permissionScopeList: cloneScopes(detail),
  }
}
```

**变更后:**
```ts
toUpdateBody(facultyPermissionId, _dataPermissionType, detail) {
  return {
    facultyPermissionId,
    permissionScopeList: cloneScopes(detail),
  }
}
```

**通过条件:**
- 5 种 1对1 类型(CGS/CCS/CC/CG/CSS)+ 校区型共 6 个 strategy 的 toUpdateBody 全部不带 `dataPermissionType`
- 参数重命名为 `_dataPermissionType` 表示故意不使用(避免 lint 警告)

---

## Task 3 · `campusStrategy.getDefaults` 删 `row.scopeCampusIds` 分支

> **Skill:** (无) · 仅策略模式微调
> **理由:** `campusStrategy.getDefaults` 删分支,纯逻辑调整

**文件:** `src/components/faculty/data-permission/registry.ts`

**变更位置:** `campusStrategy.getDefaults`(line 17-24)

**变更前:**
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

**变更后:**
```ts
getDefaults(row) {
  return {
    kind: 'campus',
    campusIds: (row?.scopes ?? []).map(s => s.campusId ?? '').filter(Boolean),
  }
}
```

**通过条件:**
- 完全依赖 `queryDataScopeList` 注入的 scopes(在 `composable.openEdit` 中已 await)
- 不再读 `row.scopeCampusIds`(对接文档 §2 list 字段不存在)
- 校区型回显 = scope.campusId → 校区列表勾选(D-3 落地)

---

## Task 4 · CCS 多对多 / 1对1 判断(D-2 落地)

> **Skill:** superpowers-harness-run · 置信度 0.75 · 自动激活
> **理由:** composable.openEdit 是核心分支,涉及 reactive ref 流转,改实现前需读 harness 上下文确认 harness:status → READY_TO_DEV

**文件:** `src/composables/useFacultyDataPermissionSession.ts`

**变更位置:** `openEdit` 函数(line 321-352)

**变更前:**
```ts
async function openEdit(row: FacultyPostRowLike) {
  if (
    readType(row) === DataPermissionEnum.CAMPUS_CLASS_SUBJECT
    && row.setupMode === DataPermissionSetupMode.MANY_TO_MANY
  ) {
    options.openClassPermissionDialog?.(row)
    return
  }
  const strategy = resolveDataPermissionStrategy(readType(row) ?? '')
  if (!strategy) {
    return
  }
  if (row.id) {
    try {
      const scopes = (await service.school.queryDataScopeList({
        facultyPermissionId: row.id,
      })) ?? []
      row = { ...row, scopes }
    }
    catch {
      // 查询失败时降级用列表缓存的 scopes,避免完全打不开弹窗
    }
  }
  editingRow.value = row
  setSkip(strategy.kind, false)
  await closeAllDetails()
  activeKind.value = strategy.kind
  await forceOpenDetailByKind(strategy.kind)
}
```

**变更后:**
```ts
async function openEdit(row: FacultyPostRowLike) {
  const type = readType(row)

  // D-2:CCS 多对多 = dataPermissionType 为空/null/老的非 campus_class_subject
  // 1对1 = 显式 === 'campus_class_subject'
  const isCcsOneToOne = type === DataPermissionEnum.CAMPUS_CLASS_SUBJECT
  const isManyToMany = !isCcsOneToOne

  if (isManyToMany) {
    // CCS 多对多:走 SelectClassListDialog(老路径)
    options.openClassPermissionDialog?.(row)
    return
  }

  // 1对1(CAMPUS_CLASS_SUBJECT 显式):走 5 级弹框
  const strategy = resolveDataPermissionStrategy(type)
  if (!strategy) {
    return
  }
  if (row.id) {
    try {
      const scopes = (await service.school.queryDataScopeList({
        facultyPermissionId: row.id,
      })) ?? []
      row = { ...row, scopes }
    }
    catch {
      // 查询失败时降级用列表缓存的 scopes,避免完全打不开弹窗
    }
  }
  editingRow.value = row
  setSkip(strategy.kind, false)
  await closeAllDetails()
  activeKind.value = strategy.kind
  await forceOpenDetailByKind(strategy.kind)
}
```

**通过条件:**
- `dataPermissionType === 'campus_class_subject'` → 走 5 级弹框(1对1)
- `dataPermissionType` 为空 / null / 其他 enum → 走 `openClassPermissionDialog`(多对多老路径)
- 不再读 `row.setupMode`(对接文档 §2 list 不带此字段)

**注意:** 删去对 `row.setupMode === MANY_TO_MANY` 的判断后,CCS 多对多的 edit 与 add 路径**统一**走 `openClassPermissionDialog`(对应 SelectClassListDialog)。这与现有多对多分配链路一致。

---

## Task 5 · 5 个 `aggregateXxx` 兼容 VO name 字段

> **Skill:** (无) · 纯函数工具
> **理由:** 5 个 aggregate 函数放宽类型 + 兼容多字段名,纯逻辑调整

**文件:** `src/utils/faculty-data-permission.ts`

**变更位置:** `aggregateCampuses` / `aggregateGrades` / `aggregateClasses` / `aggregateSubjects` / `aggregateStages`(line 84-118)

**变更前(以 aggregateCampuses 为例,其他 4 个对称):**
```ts
export function aggregateCampuses(items: Array<{ campusId?: string, campusName?: string }>) {
  return uniqById(
    items
      .filter(i => i.campusId)
      .map(i => ({ id: i.campusId as string, name: i.campusName ?? i.campusId as string })),
  )
}
```

**变更后(以 aggregateCampuses 为例):**
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

**其他 4 个函数对称处理:**
- `aggregateGrades`:`gradeId|gradeName|id|name`
- `aggregateClasses`:`classId|className|id|name`
- `aggregateSubjects`:`subjectId|subjectName|id|name`
- `aggregateStages`:`stageId|stageName|id|name`

**通过条件:**
- 5 个函数类型从严格 `Array<{ id: string, name: string }>` 放宽为 `Array<Record<string, any>>`
- id 优先取 `*Id` 字段,fallback 到 `id` 字段
- name 优先取 `*Name` 字段,fallback 到 `name`,最后到 id

---

## Task 6 · CSS 列表三列 fallback 保留

> **Skill:** (无) · 仅验证不改动
> **理由:** CSS 分支代码保持不动,仅验证行为符合对接文档

**文件:** `src/utils/faculty-data-permission.ts`

**变更位置:** `scopesToListFields` 的 CSS 分支(line 245-274)

**说明:** 本 Task **不实际改动代码**,仅确认 CSS 分支的行为符合对接文档:
- queryDataScopeList 工作(scope 带 stageId + 后端补 stageName)→ 走 `aggregateStages(scopes)` 从 scope 取 stageName
- queryDataScopeList 未工作 → fallback 到 `fb.stageList`(依赖后端协作 #4)

**通过条件:**
- CSS 分支代码保持不动(已依赖 T5 修复的 aggregateStages 从 scope 取 stageName)
- console.warn 调试提示保留(便于联调时定位)

---

## Task 7 · CCS 多对多列表只取 classList

> **Skill:** (无) · 纯函数
> **理由:** CCS 多对多列表展示只取 classList,纯逻辑调整

**文件:** `src/utils/faculty-data-permission.ts`

**变更位置:** `scopesToListFields` 的"无 dataPermissionType"分支(line 275-285)

**变更前:**
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

**变更后:**
```ts
// CCS 多对多:无 dataPermissionType;scopeTags = classList;subjectTags = subjectList
// (gradeList 不属于 CCS 多对多,不再混入)
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

**通过条件:**
- 列表"权限范围"列只显示班级(不再混入年级)
- 列表"任教科目"列显示 subjectList
- subjectLimit 6 沿用

---

## 验证 V1 · 类型检查 + lint

> **Skill:** superpowers-harness · 置信度 0.80 · 自动激活
> **理由:** TypeScript + ESLint 静态校验 = validate-harness 一部分

**步骤:**
```bash
cd E:\code\two\frontend
pnpm typecheck
pnpm eslint --fix src/service/school.ts src/components/faculty/data-permission/registry.ts src/composables/useFacultyDataPermissionSession.ts src/utils/faculty-data-permission.ts
```

**通过条件:**
- typecheck 0 错误
- eslint 0 新错误(允许历史遗留错误)

---

## 验证 V2 · Harness 校验

> **Skill:** harness · 置信度高 · 自动激活

**步骤:**
```bash
cd E:\code\frontend
pnpm harness:check
pnpm harness:status -- --match "教职工权限回显与保存修复"
```

**通过条件:**
- `pnpm harness:check` 无本模块 `ARCHIVE_MISSING_*` 警告(archive 写完后)
- `pnpm harness:status` 显示 `DELIVERED`

---

## 归档 A1 · 写交付快照

> **Skill:** harness · 置信度高 · 自动激活

**步骤:**

1. 勾选 `specs/01-dev-spec.md` 验收项(§7.1、§7.2、§7.3)
2. 写 `archive/教职工权限回显与保存修复-delivered.md`,使用 archive 模板(必须含 `## 一致性自检` + `## 还原度自检` + `## Harness 闭环` 三个小节)
3. 跑 `pnpm harness:check`
4. 跑 `pnpm harness:status`,确认 `DELIVERED`

**通过条件:**
- archive 含强制三小节
- `harness:check` 无本模块警告
- `harness:status` 显示 `DELIVERED`

---

## Skill 路由标注(CLI 输出 + 人工复核)

### CLI 原始输出

`node .agents/routing/router.mjs --annotate <plan>` 在本 plan 上命中 3/331 step(按行切割粒度太细,实际需要人工复核)。命中项:

| Step | Skill | 置信度 | 自动激活 |
|------|-------|--------|---------|
| T0 准备 | `superpowers-harness-run` | 0.70 | ✅ |
| V2 harness 校验 | `superpowers-harness-run` + `superpowers-harness` | 0.70 | ✅ |
| A1 归档 | `superpowers-harness-run` + `superpowers-harness` | 0.70 | ✅ |

> CLI 按行切割丢失上下文,大量 TS / 工具函数改动 step 未命中。本地 SKILL_ROUTING.md(14 个 skill)没有 vue-skills/code-review/test-runner,TS 类型契约修复类步骤不在 routing 覆盖范围。

### 人工复核结论(覆盖全 11 步)

| Task | 推荐 Skill | 置信度 | 自动激活 | 备注 |
|------|-----------|--------|---------|------|
| **T0** | `superpowers-harness-run` | 0.90 | ✅ | 改实现前准备(分支校验) |
| **T1** | (无,纯 TS 类型契约) | - | - | 不需要 skill |
| **T2** | (无,纯 TS 类型契约) | - | - | 不需要 skill |
| **T3** | (无,策略模式微调) | - | - | 不需要 skill |
| **T4** | `superpowers-harness-run` | 0.75 | ✅ | composable 分支逻辑关键,跑通必走 harness |
| **T5** | (无,纯函数工具) | - | - | 不需要 skill |
| **T6** | (无,验证不改动) | - | - | 不需要 skill |
| **T7** | (无,纯函数) | - | - | 不需要 skill |
| **V1** | `superpowers-harness` | 0.80 | ✅ | typecheck + eslint = validate-harness |
| **V2** | `superpowers-harness-run` + `superpowers-harness` | 0.85 | ✅ | 门禁校验 |
| **A1** | `superpowers-harness-run` + `superpowers-harness` | 0.85 | ✅ | 归档 + DELIVERED |

**风险等级**:全部 low(riskLevel 不超过 low,autoActivateRiskLevel = low),无需人工确认。

### Step D 执行注意

- T1-T7 改实现时,**必须先读并遵循**对应 skill(自动激活 = 直接生效,无需确认)
- 但 T1-T7 多数 skill 为"无需 skill"——这些步骤为纯代码改动,按 plan 代码片段直接编辑即可
- V2 / A1 是 harness 强制步骤,任何情况下必须跑

---

**P3 决策点(请用户选择执行方式):**

- **Inline(推荐)** — 由当前 root 会话按本 plan 直接执行 Task 0 → A1,完成后报告 DELIVERED
- **SDD(Subagent-Driven)** — 派 worker 子代理执行实现 + 评审者子代理做评审(本任务简单,**Inline 已足够,SDD 收益不大**)

确认后进入 Step D 开发。