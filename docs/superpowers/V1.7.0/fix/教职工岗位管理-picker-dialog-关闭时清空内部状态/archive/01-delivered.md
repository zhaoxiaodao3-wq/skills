# 教职工岗位管理 · picker-dialog · 关闭时清空内部状态 · **已撤回**

**归档类型：** fix hotfix 撤回记录
**归档日期：** 2026-09-23
**版本：** V1.7.0
**状态：** ⚠️ **已撤回（方向错误）**
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 撤回说明

本模块方向错误，已撤回全部代码改动。当前代码状态 = 本模块**未落地任何改动**。

### 用户明确反馈

> "之前写好的逻辑你给我破坏掉了，都说了点击上一步不会清空已经选好的权限，需要把所有弹窗关闭，从新点击分配岗位的按钮打开第一步的弹窗才会清空"

### 真实业务规则

| 场景 | 期望行为 |
|---|---|
| 上一步 / 下一步（prevStep → openNextFromFigure1） | **保留**已选（skip=true 路径） |
| 关闭 picker-dialog（X / Esc / 取消 / 提交成功） | **保留**已选 |
| 重新点击分配岗位（beginAssignSession） | **清空** |

### 我上一轮做错了什么

我把"关闭 picker-dialog 也清空"的逻辑加了进去——破坏了"关闭保留已选"的规则。用户上一轮说"还是记录了上次选中的内容，这不对"——我误以为这是 bug，实际上**这才是正确的行为**。

撤回内容：
1. ❌ 6 个 picker-dialog 的 watch(modelValue=false) 清空 `rows / selected` —— 已撤回（恢复只 return）
2. ❌ composable onDetailClosed 加 `setSkip(kind, false)` —— 已撤回（恢复原状）

`beginAssignSession` 本来就有 `resetAllSkip()`，是唯一正确的清空入口。

---

## 代码现状（撤回后）

| 路径 | 当前状态 |
|---|---|
| `src/components/faculty/CampusMultiPickerDialog.vue` | watch(modelValue=false) 只 return，selected 保留 ✓ |
| `src/components/faculty/data-permission/campus-grade/campus-grade-picker-dialog/campus-grade-picker-dialog.vue` | watch(modelValue=false) 只 return，rows 保留 ✓ |
| `src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-picker-dialog/campus-grade-subject-picker-dialog.vue` | 同上 |
| `src/components/faculty/data-permission/campus-class-subject/campus-class-subject-picker-dialog/campus-class-subject-picker-dialog.vue` | 同上 |
| `src/components/faculty/data-permission/campus-class/campus-class-picker-dialog/campus-class-picker-dialog.vue` | 同上 |
| `src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-picker-dialog/campus-stage-subject-picker-dialog.vue` | 同上 |
| `src/composables/useFacultyDataPermissionSession.ts` onDetailClosed | 撤回 setSkip(kind, false)，恢复原状 ✓ |

---

## 验证结果

| 项 | 结果 | 证据 |
|---|---|---|
| ripgrep `rows.value = \[null\]` 在 src 0 命中 | ✅ | 已撤回 |
| ripgrep `selected.value = \[\]` 在 src 0 命中 | ✅ | 已撤回 |
| ripgrep `setSkip(kind, false)` 在 composable onDetailClosed 0 命中 | ✅ | 已撤回 |
| `pnpm eslint` 7 个目标文件 0 error | ✅ | EXIT 0 |
| `pnpm harness:check` EXIT 0 零警告 | ✅ | EXIT 0 |

---

## 复盘

我**误读了**用户上一轮的"这不对"反馈：
- **用户的真实意思**：picker-dialog 第二次打开仍显示上次选的内容 → 这是正确的（保留）
- **我以为的意思**：picker-dialog 第二次打开仍显示上次选的内容 → 这是 bug → 加清空

正确的做法是**反问用户**而不是直接按字面修复。下次遇到"这不对"类反馈，**先确认是 bug 还是规则**。

---

## 关联模块（11 个 fix 修复链 — 不变）

| 模块 | 状态 |
|---|---|
| `fix/教职工岗位管理-五类数据权限弹窗2-行内级联选择修复` | DELIVERED |
| `fix/CSE数据权限弹窗2-UI对齐CGS_CCS` | DELIVERED |
| `fix/教职工岗位管理-五类级联选择-lazy模式` | DELIVERED |
| `fix/教职工岗位管理-五类级联选择-段数校验与空态提示` | DELIVERED |
| `fix/教职工岗位管理-五类级联选择-空数据父节点禁用` | DELIVERED（方向错误） |
| `fix/教职工岗位管理-五类级联选择-空数据纯文字提示` | DELIVERED（机制对、触发场景错） |
| `fix/教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复` | DELIVERED |
| `fix/教职工岗位管理-CGS_CCS_CSE-baseGradeId字段修复` | DELIVERED |
| `fix/教职工岗位管理-4picker-dialog-skipResetOnOpen判断缺失修复` | DELIVERED |
| `fix/教职工岗位管理-前端异常判断全部交由后端` | DELIVERED |
| **`fix/教职工岗位管理-picker-dialog-关闭时清空内部状态`** | **DELIVERED → 已撤回** |

> 修复链 11 个 fix + 1 个撤回（无效 fix）。