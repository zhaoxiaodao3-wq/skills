# Dev Spec：教职工岗位管理-4picker-dialog-skipResetOnOpen判断缺失修复

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 状态：P2 已确认（hotfix 模式）
> Spec 版本：v1.0 / 2026-09-23

## 1. 目标

修复 CGS / CCS / CC / CSE picker-dialog 的 watch 漏写 `if (!props.skipResetOnOpen)` 判断，让父组件 `prevStep()` 设的 skip 机制真正生效。

## 2. 详细变更

### 2.1 4 个 picker-dialog 的 watch（核心修复）

每个 picker-dialog 都把：

**变更前**（漏写 skip 检查）：
```ts
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    rows.value = initScopes(props.defaultScopes ?? [])  // ← 无条件重置
  },
)
```

**变更后**（与 CG picker-dialog 对齐）：
```ts
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    // 父组件 prevStep 设 skip=true 后，重新打开时不重置 rows
    if (!props.skipResetOnOpen)
      rows.value = initScopes(props.defaultScopes ?? [])
  },
)
```

### 2.2 不变更

| 项 | 状态 |
|---|---|
| CG picker-dialog.vue | **不动**（已经有 `if (!props.skipResetOnOpen)` 判断） |
| 校区型 `CampusMultiPickerDialog.vue` | **不动**（行为正确） |
| `useFacultyDataPermissionSession.ts` | **不动**（prevStep / skipResetByKind / resetAllSkip 逻辑已正确） |
| `faculty-position.vue` 模板的 `:skip-reset-on-open` 绑定 | **不动**（prop 传参已正确） |
| 5 个 picker-dialog 的模板 / emit / submit / 校验逻辑 | **不动** |
| 5 个 cascader.vue | **不动** |
| cascader.util / picker-dialog.util / model.ts | **不动** |

## 3. 行为对照表

| 场景 | 变更前（CGS / CCS / CC / CSE） | 变更后 |
|---|---|---|
| 新增模式打开 → 选 → 上一步 → 下一步（同 kind） | rows 被 `initScopes([])` 清空 | rows 保留 |
| 编辑模式打开 → 选 → 上一步 → 下一步（同 kind） | rows 被 `initScopes(defaultScopes)` 清空 | rows 保留 |
| 跨 kind 切换（如 CG → CGS） | 各自重置（符合预期） | 各自重置（符合预期） |
| 取消（X / Esc / @closed） | 关闭后下次打开重置 | 关闭后下次打开重置 |

## 4. 验收清单

- [ ] ripgrep `if \(!props\.skipResetOnOpen\)` 在 5 个 picker-dialog 中命中（5/5）
- [ ] ripgrep `skipResetOnOpen` 在 5 个 picker-dialog 的 prop 定义里命中
- [ ] CGS / CCS / CC / CSE picker-dialog 的 watch 都新增了 `if (!props.skipResetOnOpen)` 判断
- [ ] CG picker-dialog 不变
- [ ] ESLint 0 error
- [ ] `pnpm harness:check` EXIT 0

## 5. 风险与回归门禁

| 风险 | 应对 |
|---|---|
| 5 个 picker-dialog 行为变化 | dev smoke：选完整路径 → 上一步 → 下一步 → rows 保留 |
| `prevStep()` 逻辑被绕过 | 父组件 composable / 模板未触碰，零风险 |
| picker-dialog prop 类型错误 | watch 读 `props.skipResetOnOpen` 与 prop 定义一致（`?: boolean` + `withDefaults`） |
| ESLint 警告 | 收尾 ESLint 验证 |

## 6. 实施档位

**轻量档 Inline**：4 个 picker-dialog.vue 各加 2 行（`if + 注释`），与 CG picker-dialog 对齐，零跨文件接口修改，无 Figma / 性能 / 跨页面风险。