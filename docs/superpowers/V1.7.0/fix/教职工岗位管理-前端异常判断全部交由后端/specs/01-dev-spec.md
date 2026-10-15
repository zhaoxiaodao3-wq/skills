# Dev Spec：教职工岗位管理-前端异常判断全部交由后端

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 状态：P2 已确认（hotfix 模式）
> Spec 版本：v1.0 / 2026-09-23

## 1. 目标

按"全部由后端判断"原则，移除前端所有业务校验类的 ElMessage.warning：
1. 5 个 util 的 `validateScopes` → `filterScopes`（删段数完整性 / 重复校验）
2. 5 个 picker-dialog 的 onSubmit → 直接 emit submit
3. composable 4 处业务校验 warning → 保留防御逻辑，删除提示

## 2. 详细变更

### 2.1 5 个 util 的 validateScopes → filterScopes

每个 util 把 `validateScopes` 改成 `filterScopes`：

**变更前**：
```ts
export function validateScopes(scopes: ScopeRow[]): {
  ok: boolean
  message?: string
  scopes?: SchoolFacultyPermissionScopeDTO[]
} {
  const out: SchoolFacultyPermissionScopeDTO[] = []
  for (const row of scopes) {
    if (!row)
      return { ok: false, message: '请完整选择XXX' }
    if (!row.gradeId / !row.classId / !row.subjectId)  // 段数完整性
      return { ok: false, message: '请完整选择XXX' }
    out.push(row)
  }
  if (hasDuplicateScopes(out))
    return { ok: false, message: 'XXX已存在' }  // 重复校验
  return { ok: true, scopes: out }
}
```

**变更后**：
```ts
/**
 * 过滤 null 行：返回非空 scopes（供后端校验）
 * 前端不做段数完整性 / 重复校验，全部由后端判断并返回 message
 */
export function filterScopes(scopes: ScopeRow[]): SchoolFacultyPermissionScopeDTO[] {
  return scopes.filter((row): row is SchoolFacultyPermissionScopeDTO => row !== null)
}
```

### 2.2 5 个 picker-dialog 的 onSubmit

每个 picker-dialog.vue：

**变更前**：
```ts
function onSubmit() {
  const r = validateScopes(rows.value)
  if (!r.ok) {
    ElMessage.warning(r.message!)
    return
  }
  submitLoading.value = true
  emit('submit', r.scopes!)
  ...
}
```

**变更后**：
```ts
function onSubmit() {
  // 前端不做异常判断：段数完整性 / 重复 / 数据权限类型，全部由后端校验并返回 message
  submitLoading.value = true
  emit('submit', filterScopes(rows.value))
  ...
}
```

### 2.3 composable 4 处业务校验 warning

#### L284（openNextFromFigure1 表单校验）

**变更前**：
```ts
if (!form.tenantPostId || !form.dataPermissionType) {
  ElMessage.warning('请先选择岗位和数据权限')
  return
}
```

**变更后**（删除 warning，保留防御）：
```ts
// 防御：未选岗位/数据权限不向后端发请求（前端不提示错误，统一交由后端判断）
if (!form.tenantPostId || !form.dataPermissionType) {
  return
}
```

#### L300（openNextFromFigure1 enum 校验）

**变更前**：
```ts
const strategy = resolveDataPermissionStrategy(form.dataPermissionType)
if (!strategy) {
  ElMessage.warning('该数据权限类型暂未开放')
  return
}
```

**变更后**：
```ts
const strategy = resolveDataPermissionStrategy(form.dataPermissionType)
// 防御：未知 enum 不向后端发请求
if (!strategy) {
  return
}
```

#### L322（openEdit enum 校验）

同上模式。

#### L391（onDetailSubmit kind 校验）

**变更前**：
```ts
if (!strategy || detail.kind !== strategy.kind) {
  ElMessage.warning('数据权限类型不匹配')
  return
}
```

**变更后**：
```ts
// 防御：未知 enum / kind 不匹配不向后端发请求（前端不提示错误，统一交由后端判断）
if (!strategy || detail.kind !== strategy.kind) {
  return
}
```

### 2.4 不变更（保留）

| 项 | 用途 |
|---|---|
| composable `ElMessage.success(res?.message ?? 'xxx')` | 展示后端 message |
| composable `ElMessage.error(res?.message ?? 'xxx')` | 展示后端 message |
| composable `catch` 块 `ElMessage.error(e?.message ?? '操作失败')` | 网络/代码异常兜底 |
| composable L192 `'分配异常，请重试'` | 分配占位 row 拿不到（前端流程问题） |
| picker-dialog `canRemoveRow` | 行数 UX 限制 |
| 5 个 picker-dialog 的模板 / emit / 其它 prop / submit loading | 不动 |

## 3. 行为对照表

| 场景 | 变更前 | 变更后 |
|---|---|---|
| 提交空 rows（rows=[]） | 前端 `r.ok=false` + ElMessage.warning "请完整选择XXX" | 直接提交，后端校验失败返回 message |
| 提交未选完的行（部分行 null） | 前端 `r.ok=false` + warning | 直接提交，后端校验失败返回 message |
| 提交重复 scope | 前端 `hasDuplicateScopes` + warning "XXX已存在" | 直接提交，后端校验失败返回 message |
| 图1 未选岗位/数据权限 → 点"下一步" | 前端 warning "请先选择岗位和数据权限" | 静默 return，无提示 |
| openEdit 未知 enum | 前端 warning "该数据权限类型暂未开放" | 静默 return，无提示 |
| onDetailSubmit kind 不匹配 | 前端 warning "数据权限类型不匹配" | 静默 return，无提示 |
| 后端校验失败 | ElMessage.error(res?.message) | ElMessage.error(res?.message)（不变） |
| 后端校验成功 | ElMessage.success(res?.message) | ElMessage.success(res?.message)（不变） |
| 网络/代码异常 | catch 块 fallback ElMessage.error | catch 块 fallback ElMessage.error（不变） |
| 后端 message 缺失 | fallback `'分配失败' / '保存失败' / '操作失败'` | fallback 文案不变（保留兜底） |

## 4. 验收清单

- [ ] ripgrep `validateScopes` 在 data-permission 0 命中
- [ ] ripgrep `请先选择岗位和数据权限` 在 data-permission 0 命中
- [ ] ripgrep `数据权限类型不匹配` 在 data-permission 0 命中
- [ ] ripgrep `该数据权限类型暂未开放` 在 data-permission 0 命中
- [ ] ripgrep `请完整选择` 在 data-permission 0 命中
- [ ] ripgrep `已存在`（指 picker-dialog 的 "XXX已存在"）在 data-permission 0 命中
- [ ] 5 个 util 都提供 `filterScopes` 函数
- [ ] 5 个 picker-dialog 的 onSubmit 直接 emit submit
- [ ] composable 4 处业务校验 warning 全部移除（保留结构性防御）
- [ ] composable 展示后端 message 的 ElMessage 保留
- [ ] ESLint 0 error
- [ ] `pnpm harness:check` EXIT 0

## 5. 风险与回归门禁

| 风险 | 应对 |
|---|---|
| 后端校验失败时用户无前端提示 | 由后端 message 兜底（ElMessage.error / ElMessage.warning 保留） |
| picker-dialog 校验失败时不关弹窗 | composable 失败时不调 closeAllDetails，弹窗保持打开，loading 解除（用户可继续编辑） |
| 5 个 picker-dialog 行为变化 | dev smoke：提交空/不完整/重复 → 看后端 message 提示 |
| picker-dialog 的其它 prop / 模板 / submit loading | 不动 |
| 校区型弹窗 `CampusMultiPickerDialog.vue` | 不动 |
| ESLint 警告 | 收尾 ESLint 验证 |

## 6. 实施档位

**轻量档 Inline**：5 个 util + 5 个 picker-dialog.vue + 1 个 composable 共 11 个文件，零跨文件接口修改，无 Figma / 性能 / 跨页面风险。