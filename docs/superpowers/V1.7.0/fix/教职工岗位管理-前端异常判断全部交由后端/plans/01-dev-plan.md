# Dev Plan：教职工岗位管理-前端异常判断全部交由后端

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

> 状态：P3 已确认（hotfix Inline 档位）
> Plan 版本：v1.0 / 2026-09-23

## 1. 范围

11 个文件改动（5 个 util + 5 个 picker-dialog.vue + 1 个 composable）：

| 步骤 | 操作 | 验证 |
|---|---|---|
| 1 | 5 个 util validateScopes → filterScopes | ripgrep `validateScopes` 0 命中 |
| 2 | CG picker-dialog onSubmit 删 warning | read diff |
| 3 | CGS picker-dialog onSubmit 删 warning | read diff |
| 4 | CCS picker-dialog onSubmit 删 warning | read diff |
| 5 | CC picker-dialog onSubmit 删 warning | read diff |
| 6 | CSE picker-dialog onSubmit 删 warning | read diff |
| 7 | composable L284 / L300 / L322 / L391 删 warning | ripgrep 4 处 warning 文案 0 命中 |
| 8 | ESLint + auto-fix | EXIT 0 |
| 9 | archive + harness:check | EXIT 0 |

## 2. 验收

- [ ] ripgrep `validateScopes` 在 data-permission 0 命中
- [ ] ripgrep `请先选择岗位和数据权限` / `数据权限类型不匹配` / `该数据权限类型暂未开放` / `请完整选择` / `已存在` 在 data-permission 0 命中
- [ ] 5 个 util 都提供 `filterScopes`
- [ ] 5 个 picker-dialog onSubmit 直接 emit submit
- [ ] composable 4 处业务校验 warning 全部移除
- [ ] `pnpm eslint` 11 个目标文件 0 error
- [ ] `pnpm harness:check` EXIT 0
- [ ] `pnpm harness:status` 当前模块 DELIVERED

## 3. 风险

| 风险 | 概率 | 缓解 |
|---|---|---|
| 业务校验缺失（前端验空所有判断） | 中 | 由后端 message 兜底（composable ElMessage.error 保留） |
| ESLint 警告 | 中 | 收尾 ESLint --fix 验证 |
| 校区型弹窗行为变化 | 0 | 本轮不动校区型弹窗 |

## 4. 工时预估

- 5 个 util validateScopes → filterScopes：5 分钟
- 5 个 picker-dialog onSubmit：5 分钟
- composable 4 处 warning：3 分钟
- ESLint auto-fix：1 分钟
- archive + harness 验证：2 分钟
- 合计 ~16 分钟