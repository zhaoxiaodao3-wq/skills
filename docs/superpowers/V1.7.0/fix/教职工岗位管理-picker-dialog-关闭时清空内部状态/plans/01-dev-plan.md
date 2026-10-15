# Dev Plan：教职工岗位管理-picker-dialog-关闭时清空内部状态

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

> 状态：P3 已确认（hotfix Inline 档位）
> Plan 版本：v1.0 / 2026-09-23

## 1. 范围

7 个文件改动（1 个 CampusMultiPickerDialog + 5 个 picker-dialog + 1 个 composable）：

| 步骤 | 操作 | 验证 |
|---|---|---|
| 1 | CampusMultiPickerDialog watch modelValue=false 清空 selected | ripgrep `selected.value = \[\]` 命中 |
| 2 | CG picker-dialog watch 清空 rows | ripgrep `rows.value = \[null\]` 命中 |
| 3 | CGS picker-dialog watch 清空 rows | 同上 |
| 4 | CCS picker-dialog watch 清空 rows | 同上 |
| 5 | CC picker-dialog watch 清空 rows | 同上 |
| 6 | CSE picker-dialog watch 清空 rows | 同上 |
| 7 | composable onDetailClosed 加 setSkip(kind, false) | ripgrep 命中 |
| 8 | ESLint + harness:check | EXIT 0 |

## 2. 验收

- [ ] ripgrep `rows.value = \[null\]` 5/5 命中 picker-dialog
- [ ] ripgrep `selected.value = \[\]` 命中 CampusMultiPickerDialog
- [ ] ripgrep `setSkip(kind, false)` 在 composable onDetailClosed 命中
- [ ] `pnpm eslint` 7 个目标文件 0 error
- [ ] `pnpm harness:check` EXIT 0
- [ ] `pnpm harness:status` 当前模块 DELIVERED

## 3. 风险

| 风险 | 概率 | 缓解 |
|---|---|---|
| prevStep 路径误清空 | 极低 | prevStep 走 emit('prevStep') 不触发 picker-dialog 关闭 |
| 编辑模式打开 picker-dialog 关闭后下次打开没数据 | 中 | 这是符合预期的（编辑模式 = 弹窗关闭 = 用户主动取消） |
| 校区型弹窗的 selected 在 race 期间被清空 | 低 | 符合"新建流程清空表单"业务规则 |

## 4. 工时预估

- 7 个文件改动：5 分钟
- ESLint 收尾：1 分钟
- archive + harness 验证：2 分钟
- 合计 ~8 分钟