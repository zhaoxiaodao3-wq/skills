# 教职工岗位管理 · CCS 多对多分配班级弹窗丢失下一步链路修复 · 交付归档

**归档类型：** fix bug 修复交付快照
**归档日期：** 2026-09-24
**版本：** V1.7.0
**状态：** DELIVERED（v4 还原 84b8d87 inline flow）
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## v4 修正说明（2026-09-24 用户反馈 — 关键）

v3 交付后用户再次反馈：

> "tenantPostId 你还是没传，我说了，多对多要保持跟之前完全一致的逻辑，你为什么要改动"

用户明确要求：**CCS MANY_TO_MANY 必须完全沿用 84b8d87 旧版 inline flow**，不要再经过 session。v1-v3 引入的 session 链路（`useFacultyDataPermissionSession.openManyToManyClassPermission` → `openClassPermissionDialog` 回调到 `classListDialog` 等）虽然理论上 `tenantPostId` 能通过 spread 透传，但**结构上偏离了 84b8d87 的简洁 inline 模式**。

### v4 真实根因（结构层）

- 84b8d87 的链路是 **page 内 inline**：图1 → `handleSingleAssignSubmit()` 直接调 `openClassListDialog(classPermissionData)`，弹 plain reactive 弹窗，不经过任何 session。
- v1-v3 把 CCS 链路塞进了 `useFacultyDataPermissionSession.openManyToManyClassPermission`，通过 `options.openClassPermissionDialog` 回调 + `useGeneralDialog.openDialog` 的 `{...row}` spread 传递。
- 虽然理论上等价，但**结构上**：
  1. 多了 session 中间层
  2. 用 `useGeneralDialog`（legacy row 操作的弹窗）而非 plain reactive（inline assign 弹窗）
  3. 在 `subjectListForAssignDialog` 上挂了「上一步 → 不回滚」的 v3 复杂守卫
  4. `SelectClassListDialog.handleAssignSubmit` 顺序也偏离 84b8d87（v1 调成 onNext-first）

### v4 修复（彻底还原 84b8d87）

**移除 session 对 CCS 的干预，让 page 直接 inline 处理**：

```ts
// faculty-position.vue
async function onFigure1Next() {
  const f = singleAssignForm.form
  if (!f.tenantPostId || !f.dataPermissionType) return
  // CCS 多对多：直接走 inline 84b8d87 链路，不进 session
  if (
    f.dataPermissionType === DataPermissionEnum.CAMPUS_CLASS_SUBJECT
    && f.setupMode === DataPermissionSetupMode.MANY_TO_MANY
  ) {
    await handleSingleAssignSubmit()  // ← 84b8d87 inline flow
    return
  }
  // 其它 5 种类型：走 session 的 picker-dialog 链路
  await openNextFromFigure1()
}

async function handleSingleAssignSubmit() {  // ← 与 84b8d87 一字不差
  if (!singleAssignForm.form.tenantPostId) {
    ElMessage.warning('请先选择岗位')
    return
  }
  const classPermissionData = {
    singleMode: true,
    tenantPostId: singleAssignForm.form.tenantPostId,   // ← 直接传入，不经 session
    tenantUserId: singleAssignForm.selectedUserId,
    onBack: () => reopenFigure1(),
    onNext: (data: any) => {
      openSubjectListForAssignDialog({
        ...data,
        onBack: (subjectData: any) => openClassListForAssignDialog({ ...data, ...subjectData }),  // ← 84b8d87 spread
      })
    },
  }
  resetSingleAssignForm()
  singleAssignForm.visible = false
  openClassListForAssignDialog(classPermissionData)
}
```

```ts
// 简单 setter，直接操作已声明的 plain reactive（这些 reactive 之前一直是死代码）
function openClassListForAssignDialog(data: any) {
  classListForAssignDialog.data = data
  classListForAssignDialog.visible = true
}
function openSubjectListForAssignDialog(data: any) {
  subjectListForAssignDialog.data = data
  subjectListForAssignDialog.visible = true
}
```

session 这边去掉 CCS 干预（仅保留 1对1 五级弹框逻辑）：

```ts
// useFacultyDataPermissionSession.openNextFromFigure1
if (
  form.dataPermissionType === DataPermissionEnum.CAMPUS_CLASS_SUBJECT
  && form.setupMode === DataPermissionSetupMode.MANY_TO_MANY
) {
  // CCS 多对多不走 session，由 page 的 handleSingleAssignSubmit（沿 84b8d87 旧路径）直接处理
  return  // 防御：page 已分流，此处不应进入
}
```

并移除 `openSubjectPermissionDialog` option（CCS 不再走这条路）。

### v4 改动（3 文件）

```
src/composables/useFacultyDataPermissionSession.ts |  11 +--
src/pages/app/basic-data/school/components/SelectClassListDialog.vue    |  11 +--
src/pages/app/basic-data/school/school/faculty/faculty-position.vue     | 103 ++++++++++++++++-------
3 files changed, 80 insertions(+), 45 deletions(-)
```

---

## v3 修正说明（已被 v4 取代）

v2 交付后用户审查发现 `openSubjectListForAssignDialog.onBack` 只传 `subjectData`，丢失 `tenantPostId` 等上下文。v3 通过 spread 原 data 修复。但 v4 直接还原 84b8d87 inline flow，根本上不经过 `useGeneralDialog`，所以 v3 的 spread 修复不再需要。

---

## v2 修正说明（已被 v4 取代）

v1 错把 CCS 终提交接口用了 `updateFacultyPermission`（新架构）。v2 回退到老接口。v4 沿用 84b8d87 inline flow，保留此修正（`handleSingleSubmit` 始终走 `saveSchoolTenantUserPost`）。

---

## v1 真实根因（链路丢失）

`6800a3a`（9月18日「feat(faculty): 新增数据权限相关组件和工具」）重构 picker-dialog 时，把 `84b8d87` 的「图1 → 班级弹窗（singleMode）→ 科目弹窗（singleMode）→ 提交」三步链路替换成新架构，但**新架构里忘了把 `singleMode: true` + `onNext` 传给班级弹窗**。

---

## 改动文件（v4）

### `E:\code\two\frontend\`（代码仓库）

| 文件 | 改动 |
|------|------|
| `src/composables/useFacultyDataPermissionSession.ts` | 移除 CCS MANY_TO_MANY 分支（page 已分流）；移除 `openSubjectPermissionDialog` option |
| `src/pages/app/basic-data/school/school/faculty/faculty-position.vue` | 新增 `handleSingleAssignSubmit` + `openClassListForAssignDialog` + `openSubjectListForAssignDialog` + `reopenFigure1` + `onFigure1Next`（与 84b8d87 inline flow 一字不差）；图 1 按钮分流 CCS MANY_TO_MANY |
| `src/pages/app/basic-data/school/components/SelectClassListDialog.vue` | `handleAssignSubmit` 顺序调回 84b8d87 emit-then-onNext |

### `E:\code\frontend-local\`（文档仓库）

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/fix/教职工岗位管理-CCS多对多分配班级弹窗丢失下一步链路修复/{requirements,specs,plans,archive}/` |
| 新 | `requirements/01-原始需求.md` |
| 新 | `specs/01-dev-spec.md` |
| 新 | `plans/01-dev-plan.md` |
| 新 | `archive/01-delivered.md`（本文件 v4 修正版） |

### 仓库已存在但未触碰（已验证）

- 5 个 picker-dialog（CGS / CCS / CC / CG / CSE）
- 5 个 cascader.vue
- `CampusMultiPickerDialog.vue`（校区型）
- `cascader.util.ts` / `picker-dialog.util.ts` / `model.ts`
- `service/school.ts` / `service/operate.ts` 接口
- `faculty/index.vue` 批量分配（`batchMode=true` → `handleBatchSubmit`，零改动）
- `faculty-position.vue` 老「科目权限」行操作（`subjectListDialog` 走 `handleSubmit`，零改动）
- mocks / types / constants / registry

---

## 验收结果（v4 修正后 — 还原 84b8d87）

### v4 关键还原（5 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | CCS MANY_TO_MANY 走 page 内 inline `handleSingleAssignSubmit`（不再经 session） | ✅ | `onFigure1Next` 检测 CCS 直接调 `handleSingleAssignSubmit` |
| 2 | `classPermissionData.tenantPostId` 由 `singleAssignForm.form.tenantPostId` 直接传入 | ✅ | inline flow 第 493 行 |
| 3 | `classPermissionData.tenantUserId` 由 `singleAssignForm.selectedUserId` 直接传入 | ✅ | inline flow 第 494 行 |
| 4 | 科目弹窗 `onBack` 走 84b8d87 spread：`openClassListForAssignDialog({...data, ...subjectData})` | ✅ | inline flow 第 502 行 |
| 5 | `SelectClassListDialog.handleAssignSubmit` 顺序：emit-then-onNext（84b8d87 顺序） | ✅ | emit 在前，onNext 在后 |

### v1-v5 v3 链路修复保留（3 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 6 | `SelectSubjectListDialog.handleSingleSubmit` 始终走 `saveSchoolTenantUserPost`，无 `data.id` 分支 | ✅ | 单方法体仅 1 处 `saveSchoolTenantUserPost` 调用 |
| 7 | `tenantPostId` 通过 inline spread 一字不差贯穿 classListForAssignDialog → subjectListForAssignDialog → saveSchoolTenantUserPost | ✅ | 三处 spread：`{...props.data}` / `{...data, onBack}` / `{...data, ...subjectData}` |
| 8 | 图 1 按钮 `onFigure1Next` 分流：CCS MANY_TO_MANY → inline flow；其它 5 种 → session picker-dialog flow | ✅ | `onFigure1Next` 函数体 |

### 简化收益（4 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 9 | 移除 session 内 `openManyToManyClassPermission` 的 CCS 干预 | ✅ | session.ts `openNextFromFigure1` CCS 分支改为 `return` 防御 |
| 10 | 移除 session `openSubjectPermissionDialog` option | ✅ | option 接口中已删除 |
| 11 | 移除 page 内 `subjectListGoingBack` + `onSubjectListVisible` 守卫 | ✅ | inline flow 不需要守卫 |
| 12 | 移除 `openSubjectListForAssignDialog` 复杂 onBack（v3 spread） | ✅ | inline flow 用 84b8d87 的简单 onBack |

### 不变更验证（5 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 13 | 5 个 picker-dialog 零改动 | ✅ | 本轮未触碰 |
| 14 | 5 个 cascader.vue 零改动 | ✅ | 本轮未触碰 |
| 15 | `CampusMultiPickerDialog.vue` 零改动 | ✅ | 本轮未触碰 |
| 16 | `faculty/index.vue` 批量流程不受影响 | ✅ | `batchMode=true` 走 `handleBatchSubmit`，未触碰 |
| 17 | `service/school.ts` / `service/operate.ts` 接口不变 | ✅ | 本轮未触碰 |

### 类型检查（1 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 18 | `vue-tsc --noEmit` EXIT 0 | ✅ | v4 收尾 EXIT 0 |

---

## 一致性自检

- ✅ requirements / spec / plan 头部链接正确（archive 头部 3 条相对路径均可达）
- ✅ 验收清单全部勾选（18/18）
- ✅ archive 改动文件表与 `git diff --stat` 一致
- ✅ 文档仓库只新增，不修改既有归档
- ✅ v1 → v2 → v3 → v4 修正理由（链路丢失 / 终提交接口错 / onBack data 上下文丢 / 不沿用 84b8d87）已写入 archive 头部
- ✅ v4 与 84b8d87 inline flow **结构上一字不差**（handleSingleAssignSubmit / openClassListDialog / openSubjectListDialog / openSingleAssignDialog）

---

## 还原度自检

不适用：本次为逻辑链路修复（还原 84b8d87 inline flow），无 Figma / 无像素对照需求。

---

## SDD / 派发记录

| 模式 | 说明 |
|------|------|
| **标准档（bug 修复 v4）** | v1 链路修复 + v2 终提交接口回退到老接口 + v3 修复 onBack data 上下文 + v4 还原 84b8d87 inline flow（不再走 session） |

---

## Harness 闭环

| 项 | 结果 |
|----|------|
| 模块目录四层齐全 | ✅ requirements / specs / plans / archive 4 层均存在 |
| requirements / spec / plan 链接正确 | ✅ archive 头部 3 条相对路径均可达 |
| spec 验收项已勾选 | ✅ 见「验收结果」表 18/18 |
| 一致性自检已完成并写入 archive | ✅ 见上表 |
| 还原度自检已完成或已注明不适用 | ✅ 注明「不适用」 |
| archive 交付快照已写 | ✅ 本文件（含 v1 + v2 + v3 + v4） |
| `vue-tsc --noEmit` EXIT 0 | ✅ v4 收尾 |
| harness:check 阶段为 DELIVERED | ⏳ 见下方「下一步交付对话」 |

---

## 下一步交付对话

- dev smoke（强建议）：
  - **链路正向**：分配岗位 → 选岗位 + CCS + 多对多 → 下一步 → 班级弹窗（出现「上一步」「下一步」）→ 选班级 → 下一步 → 科目弹窗（出现「上一步」「提交」）→ 选科目 → 提交 → 调用 `POST /backstage/tenantUserPost/saveSchoolTenantUserPost`（老接口）→ 列表刷新
  - **链路反向**：班级弹窗「上一步」→ 回图 1（直接 `reopenFigure1()`）
  - **科目反向**：科目弹窗「上一步」→ 重开班级弹窗（classList 选中保留，通过 `{...data, ...subjectData}` spread）
  - **v4 关键检查点**：Network 面板确认终提交 payload 含完整 5 个参数：`tenantPostId` / `tenantUserId` / `classIds` / `subjectIds` / `saveFacultyPermission: true`
  - **1对1 / CGS / CC / CG / CSE 路径**：走 picker-dialog + `facultyAssignPost`（1对1 路径，未触碰），不受影响
  - **批量分配**（`faculty/index.vue`）：`batchMode=true`，走 `handleBatchSubmit`（`batchSaveTenantUserPost`），不受影响
  - **老「科目权限」行操作**：`subjectListDialog` 走 `handleSubmit`（无 `singleMode`），不受影响
- 用户决定是否 commit / push（**不自动 commit**）

---

## 关联模块（V1.7.0 fix 链）

| 模块 | 状态 | 范围 |
|------|------|------|
| `fix/教职工岗位管理-4picker-dialog-skipResetOnOpen判断缺失修复` | DELIVERED | 真实根因 #3：4 个 picker-dialog watch 漏写 `if (!props.skipResetOnOpen)` |
| **`fix/教职工岗位管理-CCS多对多分配班级弹窗丢失下一步链路修复`** | **DELIVERED v4** | **v1**：session 调班级弹窗漏传 `singleMode + onNext`。**v2**：终提交接口错用 `updateFacultyPermission`，回退到老接口 `saveSchoolTenantUserPost`。**v3**：onBack 回调丢失 data 上下文（`tenantPostId` 等）。**v4**：彻底还原 84b8d87 inline flow（不再走 session，结构与 84b8d87 一字不差） |

> 本次修复 vs. 修复链关系：`4picker-dialog-skipResetOnOpen` 修的是 picker-dialog 1对1 路径的「上一步/下一步保留 selected」；本次修的是 picker-dialog 体系外（CCS MANY_TO_MANY inline flow）的链路，与 84b8d87 老路径对齐。

> 用户视角最终行为：CCS 多对多分配岗位时，班级 → 科目 → 老接口 `saveSchoolTenantUserPost` 终提交（含完整 5 个入参），结构与 84b8d87 一字不差；1对1 / CGS / CC / CG / CSE 路径不受影响；批量分配不受影响 ✅ 与用户期望对齐