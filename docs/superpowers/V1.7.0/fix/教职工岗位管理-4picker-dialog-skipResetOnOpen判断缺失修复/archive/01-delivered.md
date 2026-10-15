# 教职工岗位管理 · 4 picker-dialog · skipResetOnOpen 判断缺失修复 · 交付归档

**归档类型：** fix hotfix 交付快照
**归档日期：** 2026-09-23
**版本：** V1.7.0
**状态：** DELIVERED
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

紧接 `fix/教职工岗位管理-CGS_CCS_CSE-baseGradeId字段修复` DELIVERED 之后，用户实测反馈"上一步/下一步切换时清空已选内容"。

### 真实根因（源码确认）

父组件 `useFacultyDataPermissionSession` 的 `prevStep()` 设 `setSkip(kind, true)`，父模板正确传 `:skip-reset-on-open="skipResetByKind.xxx"` 给 5 个 picker-dialog。**但 4 个 picker-dialog（CGS / CCS / CC / CSE）的 watch 完全没读 `props.skipResetOnOpen`**——只有 CG picker-dialog 读了。

| picker-dialog | watch `if (!props.skipResetOnOpen)` 判断 |
|---|---|
| `campus-grade-picker-dialog.vue` | ✅ **有**（line 99） |
| `campus-grade-subject-picker-dialog.vue` | ❌ **漏写**（line 105） |
| `campus-class-picker-dialog.vue` | ❌ **漏写**（line 113） |
| `campus-class-subject-picker-dialog.vue` | ❌ **漏写**（line 113） |
| `campus-stage-subject-picker-dialog.vue` | ❌ **漏写**（line 105） |

### 业务影响

| 场景 | CG | CGS / CCS / CC / CSE |
|---|---|---|
| 新增模式打开 → 选 → 上一步 → 下一步 | rows 保留 ✓ | **rows 被 initScopes 清空** ✗ |
| 编辑模式打开 → 选 → 上一步 → 下一步 | rows 保留 ✓ | **rows 被 initScopes 清空** ✗ |

---

## 修复（4 个 picker-dialog watch 各加 2 行）

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

---

## 改动文件（4 个）

### `E:\code\two\frontend\`（代码仓库）

| 类型 | 改动 |
|------|------|
| CGS | `campus-grade-subject-picker-dialog.vue` watch 加 `if (!props.skipResetOnOpen)` |
| CCS | `campus-class-subject-picker-dialog.vue` watch 加同上 |
| CC | `campus-class-picker-dialog.vue` watch 加同上 |
| CSE | `campus-stage-subject-picker-dialog.vue` watch 加同上 |

每个文件改 1 处（共 4 处 edit）：watch 加 `if (!props.skipResetOnOpen)` 判断 + 注释。

### `E:\code\frontend\`（文档仓库）

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/fix/教职工岗位管理-4picker-dialog-skipResetOnOpen判断缺失修复/{requirements,specs,plans,archive}/` |

### 仓库已存在但未触碰（已验证）

- `campus-grade-picker-dialog.vue`（CG，**已经有 skip 检查**，不动）
- 校区型 `CampusMultiPickerDialog.vue`（行为正确）
- `useFacultyDataPermissionSession.ts`（prevStep / skipResetByKind 逻辑正确）
- `faculty-position.vue`（`:skip-reset-on-open` 模板绑定正确）
- 5 个 cascader.vue（不动）
- cascader.util / picker-dialog.util / model.ts（不动）

---

## 验收结果（spec §4 逐项）

### 核心修复（3 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | 5 个 picker-dialog 都含 `if (!props.skipResetOnOpen)` 判断 | ✅ | ripgrep 5/5 命中 |
| 2 | CGS / CCS / CC / CSE picker-dialog watch 新增了 `if (!props.skipResetOnOpen)` | ✅ | 4 个 picker-dialog 都已修 |
| 3 | CG picker-dialog 不变 | ✅ | 本轮未触碰 |

### 防御层未受影响（2 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 4 | `useFacultyDataPermissionSession` composable 逻辑保留 | ✅ | 本轮未触碰 |
| 5 | `faculty-position.vue` 模板 `:skip-reset-on-open` 绑定保留 | ✅ | 本轮未触碰 |

### 回归（3 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 6 | 校区型 `CampusMultiPickerDialog.vue` 未改 | ✅ | 本轮未触碰 |
| 7 | 5 个 cascader.vue 未改 | ✅ | 本轮未触碰 |
| 8 | `pnpm eslint` 4 个目标文件 0 error | ✅ | EXIT 0 |

---

## 还原度自检

不适用：本次为 watch 判断缺失修复（hotfix），无 Figma / 无像素对照需求。

---

## SDD / 派发记录

| 模式 | 说明 |
|------|------|
| **Inline (hotfix)** | 4 个 picker-dialog.vue watch 各加 2 行，与 CG picker-dialog 对齐 |

---

## Harness 闭环

| 项 | 结果 |
|----|------|
| 模块目录四层齐全 | ✅ requirements / specs / plans / archive 4 层均存在 |
| requirements / spec / plan 链接正确 | ✅ archive 头部 3 条相对路径均可达 |
| 改 src 前 validate-harness 已跑 | ✅ P3 前 `pnpm harness:check` EXIT 0 |
| spec 验收项已勾选 | ✅ 见「验收结果」表 8/8 |
| 一致性自检已完成并写入 archive | ✅ 见上表 |
| 还原度自检已完成或已注明不适用 | ✅ 注明「不适用」 |
| archive 交付快照已写 | ✅ 本文件 |
| commit 前 validate-harness 已跑 | ✅ `pnpm harness:check` EXIT 0 |
| harness:check 无本模块警告 | ✅ 通过 |
| harness:status 阶段为 DELIVERED | ⏳ 见下方「下一步交付对话」 |

---

## 下一步交付对话

- dev smoke（强建议）：
  - **CGS 弹窗** → 选天河校区/小学/三年级 → 上一步回图1 → 不改任何东西 → 下一步回到 CGS → **rows 保留**（不再清空）
  - **CCS 弹窗** → 同上路径 → 上一步/下一步 → **rows 保留**
  - **CC / CSE 弹窗** → 同上
  - **跨 kind 切换**：CG 弹窗选 → 取消 → 在图1 切换到 CGS → 打开 CGS → **rows 仍是 CGS 的 defaultScopes**（符合预期，不同 kind 各自重置）
  - **新增模式**：分配岗位 → 选 CG → 选 scopes → 上一步 → 下一步 → **rows 保留**（符合用户期望）
- 用户决定是否 commit / push（**不自动 commit**）

---

## 关联模块（9 个 fix 修复链）

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
| **`fix/教职工岗位管理-4picker-dialog-skipResetOnOpen判断缺失修复`** | **DELIVERED** | **真实根因 #3**：4 个 picker-dialog watch 漏写 `if (!props.skipResetOnOpen)` 判断 |

> 修复链全貌：本轮是 hotfix 之后**第三个真实根因修复**——`useFacultyDataPermissionSession` 的 `prevStep` / `skipResetByKind` 机制早已设计正确，模板传 `:skip-reset-on-open` 也正确，**唯一漏写**的是 4 个 picker-dialog 的 watch 没读这个 prop。CG picker-dialog 是参照实现，对齐 4 个 picker-dialog 即可。

> 用户视角最终行为：「上一步/下一步切换时，已选内容保留；只有重新点击分配岗位（新增）才清空表单」 ✅ 与用户期望对齐