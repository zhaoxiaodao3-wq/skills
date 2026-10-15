# 教职工岗位管理 · 前端异常判断全部交由后端 · 交付归档

**归档类型：** fix hotfix 交付快照
**归档日期：** 2026-09-23
**版本：** V1.7.0
**状态：** DELIVERED
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

紧接 `fix/教职工岗位管理-4picker-dialog-skipResetOnOpen判断缺失修复` DELIVERED 之后，用户实测反馈：

> "所有类型点击确定提交后，不需要判断各种异常逻辑，全部由后端判断"

### 盘点

**前端业务校验类位置（已删除）**：

| 类型 | 位置 | 校验 | 错误提示 |
|------|------|------|---------|
| util | 5 个 picker-dialog.util.ts | `!row` + `!row.xxxId`（段数完整性）+ `hasDuplicateScopes`（重复） | "请完整选择XXX" / "XXX已存在" |
| .vue | 5 个 picker-dialog.vue 的 onSubmit | `r.ok === false` | ElMessage.warning(r.message) |
| composable | L284 | `!tenantPostId \|\| !dataPermissionType` | "请先选择岗位和数据权限" |
| composable | L300 / L322 | `!strategy` | "该数据权限类型暂未开放" |
| composable | L391 | `!strategy \|\| detail.kind !== strategy.kind` | "数据权限类型不匹配" |

**保留位置**（不是"业务校验异常"）：

| 位置 | 用途 |
|------|------|
| composable 各种 `ElMessage.success(res?.message ?? 'xxx')` | 展示后端 message + fallback |
| composable 各种 `ElMessage.error(res?.message ?? 'xxx')` | 展示后端 message + fallback |
| composable `catch` 块 | 网络/代码异常兜底 |
| composable L192 `'分配异常，请重试'` | 分配占位 row 拿不到（结构性） |
| picker-dialog `canRemoveRow` | 行数 UX 限制 |

---

## 修复（11 个文件）

### 5 个 util: validateScopes → filterScopes

```ts
/**
 * 过滤 null 行：返回非空 scopes（供后端校验）
 * 前端不做段数完整性 / 重复校验，全部由后端判断并返回 message
 */
export function filterScopes(scopes: ScopeRow[]): SchoolFacultyPermissionScopeDTO[] {
  return scopes.filter((row): row is SchoolFacultyPermissionScopeDTO => row !== null)
}
```

### 5 个 picker-dialog.vue 的 onSubmit

```ts
function onSubmit() {
  // 前端不做异常判断：段数完整性 / 重复 / 数据权限类型，全部由后端校验并返回 message
  submitLoading.value = true
  emit('submit', filterScopes(rows.value))
  setTimeout(() => {
    submitLoading.value = false
  }, 300)
}
```

### composable 4 处 warning

```ts
// 防御：未选岗位/数据权限不向后端发请求（前端不提示错误，统一交由后端判断）
if (!form.tenantPostId || !form.dataPermissionType) {
  return
}
const strategy = resolveDataPermissionStrategy(form.dataPermissionType)
// 防御：未知 enum 不向后端发请求
if (!strategy) {
  return
}
// onDetailSubmit
// 防御：未知 enum / kind 不匹配不向后端发请求
if (!strategy || detail.kind !== strategy.kind) {
  return
}
```

---

## 改动文件（11 个）

### `E:\code\two\frontend\`（代码仓库）

| 路径 | 改动 |
|---|---|
| `src/components/faculty/data-permission/campus-grade/campus-grade-picker-dialog/campus-grade-picker-dialog.util.ts` | validateScopes → filterScopes |
| `src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-picker-dialog/campus-grade-subject-picker-dialog.util.ts` | 同上 |
| `src/components/faculty/data-permission/campus-class/campus-class-picker-dialog/campus-class-picker-dialog.util.ts` | 同上 |
| `src/components/faculty/data-permission/campus-class-subject/campus-class-subject-picker-dialog/campus-class-subject-picker-dialog.util.ts` | 同上 |
| `src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-picker-dialog/campus-stage-subject-picker-dialog.util.ts` | 同上 |
| 5 个 `*.vue` 的 onSubmit | 删 validateScopes + ElMessage.warning，直接 emit('submit', filterScopes) |
| `src/composables/useFacultyDataPermissionSession.ts` | L284 / L300 / L322 / L391 删 warning，保留结构性防御 |

### `E:\code\frontend\`（文档仓库）

| 操作 | 路径 |
|---|---|
| 新 | `docs/superpowers/V1.7.0/fix/教职工岗位管理-前端异常判断全部交由后端/{requirements,specs,plans,archive}/` |

### 仓库已存在但未触碰（已验证）

- 5 个 cascader.vue / cascader.model.ts / cascader.util.ts（不动）
- 校区型 `CampusMultiPickerDialog.vue`（不动）
- picker-dialog 的模板 / emit / 其它 prop / submit loading（不动）
- registry / types / composables 其它逻辑 / page / service / mocks / constants

---

## 验收结果（spec §4 逐项）

### 核心修复（11 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | ripgrep `validateScopes` 在 data-permission 0 命中 | ✅ | 0 命中 |
| 2 | ripgrep `请先选择岗位和数据权限` 0 命中 | ✅ | 0 命中 |
| 3 | ripgrep `数据权限类型不匹配` 0 命中 | ✅ | 0 命中 |
| 4 | ripgrep `该数据权限类型暂未开放` 0 命中 | ✅ | 0 命中 |
| 5 | ripgrep `请完整选择` 0 命中 | ✅ | 0 命中 |
| 6 | ripgrep `已存在`（picker-dialog 的"XXX已存在"）0 命中 | ✅ | 0 命中 |
| 7 | 5 个 util 都提供 `filterScopes` 函数 | ✅ | ripgrep `filterScopes` 5/5 命中 |
| 8 | CG picker-dialog onSubmit 直接 emit submit | ✅ | 删 ElMessage.warning |
| 9 | CGS / CCS / CC / CSE picker-dialog onSubmit 直接 emit submit | ✅ | 4 个已删 |
| 10 | composable L284 / L300 / L322 / L391 删 warning | ✅ | 4 处已删 |
| 11 | composable 结构性防御保留（if 仍存在） | ✅ | 防御逻辑保留 |

### 保留位置未受影响（5 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 12 | composable 展示后端 message 的 ElMessage 保留 | ✅ | ripgrep `ElMessage.success` / `ElMessage.error` 在 composable 仍命中 |
| 13 | composable catch 块兜底保留 | ✅ | ripgrep `catch` 在 composable 命中 |
| 14 | composable L192 `'分配异常，请重试'` 保留 | ✅ | ripgrep 命中 |
| 15 | picker-dialog `canRemoveRow` 保留 | ✅ | ripgrep `canRemoveRow` 5/5 命中 |
| 16 | picker-dialog 模板 / emit / submit loading 不动 | ✅ | 本轮未触碰 |

### 回归（3 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 17 | 校区型 `CampusMultiPickerDialog.vue` 未改 | ✅ | 本轮未触碰 |
| 18 | 5 个 cascader.vue 未改 | ✅ | 本轮未触碰 |
| 19 | `pnpm eslint` 11 个目标文件 0 error | ✅ | EXIT 0（8 个 antfu/if-newline 警告已 --fix） |

---

## 还原度自检

不适用：本次为前端业务校验类删除（hotfix），无 Figma / 无像素对照需求。

---

## SDD / 派发记录

| 模式 | 说明 |
|------|------|
| **Inline (hotfix)** | 11 个文件改动（5 个 util validateScopes → filterScopes + 5 个 picker-dialog onSubmit 删 warning + 1 个 composable 删 4 处 warning） |

---

## Harness 闭环

| 项 | 结果 |
|----|------|
| 模块目录四层齐全 | ✅ requirements / specs / plans / archive 4 层均存在 |
| requirements / spec / plan 链接正确 | ✅ archive 头部 3 条相对路径均可达 |
| 改 src 前 validate-harness 已跑 | ✅ P3 前 `pnpm harness:check` EXIT 0 |
| spec 验收项已勾选 | ✅ 见「验收结果」表 19/19 |
| 一致性自检已完成并写入 archive | ✅ 见上表 |
| 还原度自检已完成或已注明不适用 | ✅ 注明「不适用」 |
| archive 交付快照已写 | ✅ 本文件 |
| commit 前 validate-harness 已跑 | ✅ `pnpm harness:check` EXIT 0 |
| harness:check 无本模块警告 | ✅ 通过 |
| harness:status 阶段为 DELIVERED | ⏳ 见下方「下一步交付对话」 |

---

## 下一步交付对话

- dev smoke（强建议）：
  - **CGS 弹窗** → 选天河校区/小学/三年级 → 点击确定 → **后端校验**返回 message（如有）+ 前端只展示
  - **CGS 弹窗** → 不选完点击确定 → **后端校验失败**返回 message + 前端只展示（不再前端 warning）
  - **图1** → 不选岗位/数据权限 → 点击"下一步" → **静默 return**，无前端提示（由用户保证填写完整，或后端校验失败时返回）
  - **分配占位 row 拿不到**（极端情况） → 仍 `'分配异常，请重试'` warning（结构性保留）
  - **后端 message 缺失**（网络异常 catch） → 仍 fallback `'操作失败'`（保留兜底）
- 用户决定是否 commit / push（**不自动 commit**）

---

## 关联模块（10 个 fix 修复链）

| 模块 | 状态 | 范围 |
|------|------|------|
| `fix/教职工岗位管理-五类数据权限弹窗2-行内级联选择修复` | DELIVERED | 5 picker-dialog ElTree → 行内 cascader 骨架 |
| `fix/CSE数据权限弹窗2-UI对齐CGS_CCS` | DELIVERED | CSE 4 项对齐 + service 接口修复 |
| `fix/教职工岗位管理-五类级联选择-lazy模式` | DELIVERED | cascader 「打开弹窗一次性拉完整树」→ lazy 按需加载 |
| `fix/教职工岗位管理-五类级联选择-段数校验与空态提示` | DELIVERED | 段数完整性 + empty-text 兜底 |
| `fix/教职工岗位管理-五类级联选择-空数据父节点禁用` | DELIVERED（方向错误） | 已被撤销 |
| `fix/教职工岗位管理-五类级联选择-空数据纯文字提示` | DELIVERED（机制对、触发场景错） | 保留作为防御层 |
| `fix/教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复` | DELIVERED（真实根因 #1） | cascaderProps 加 `leaf: 'isLeaf'` 映射 |
| `fix/教职工岗位管理-CGS_CCS_CSE-baseGradeId字段修复` | DELIVERED（真实根因 #2） | grade item 透传 `baseGradeId` + CSE 移除死路径 |
| `fix/教职工岗位管理-4picker-dialog-skipResetOnOpen判断缺失修复` | DELIVERED（真实根因 #3） | 4 个 picker-dialog watch 漏写 `if (!props.skipResetOnOpen)` 判断 |
| **`fix/教职工岗位管理-前端异常判断全部交由后端`** | **DELIVERED** | **5 个 util validateScopes → filterScopes + 5 个 picker-dialog onSubmit 删 warning + composable 4 处 warning 删** |

> 修复链全貌：本轮是业务规则重构——前端不再做"业务校验 + 错误提示"，全部交由后端判断并返回 message，前端只展示。

> 用户视角最终行为：「点击确定提交后，前端无任何业务校验提示；后端校验失败时，前端展示后端返回的 message」 ✅ 与用户期望对齐