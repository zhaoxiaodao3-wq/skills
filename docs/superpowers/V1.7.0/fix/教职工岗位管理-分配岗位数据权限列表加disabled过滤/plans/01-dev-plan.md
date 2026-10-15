# Dev Plan：教职工岗位管理-分配岗位数据权限列表加 disabled 过滤

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

> 状态：P3 已确认（hotfix 轻量档）
> Plan 版本：v1.0 / 2026-09-24

## 1. 范围

1 文件 4 行变更：在 `DataPermissionSelect.vue` 加 `disabled: boolean` 字段到 `OptionItem`，并在 `loadOptions` 的 filter 加 `o.disabled === true` 条件。

| 步骤 | 操作 | 验证 |
|---|---|---|
| 1 | `OptionItem` 加 `disabled: boolean` 字段 | ripgrep `disabled: boolean` 命中 |
| 2 | filter 加 `o.disabled === true` | ripgrep `o.disabled === true && o.code !== DataPermissionEnum.ALL` 命中 |
| 3 | `vue-tsc --noEmit` | EXIT 0 |
| 4 | archive + harness 验证 | EXIT 0 |

## 2. 验收

- [x] ripgrep `disabled: boolean` 在 `DataPermissionSelect.vue` 中命中
- [x] ripgrep `o.disabled === true` 在 `DataPermissionSelect.vue` 中命中
- [x] `vue-tsc --noEmit` EXIT 0
- [x] `pnpm harness:check` EXIT 0

## 3. 风险

| 风险 | 概率 | 缓解 |
|---|---|---|
| 部分岗位返回 `disabled:false` 多于预期导致下拉为空 | 低 | `canSubmitFigure1` 在下拉为空时禁止「下一步」；如发生可后端排查 6 种枚举的 disabled 值 |
| 与批量分配共用组件行为不一致 | 0 | DataPermissionSelect 是受控组件，filter 是组件内部行为，调用方无感 |

## 4. 工时预估

- Inline 改 1 文件 × 4 行 ≈ 1 分钟
- `vue-tsc` + archive 验证 ≈ 1 分钟
- 合计 ~2 分钟