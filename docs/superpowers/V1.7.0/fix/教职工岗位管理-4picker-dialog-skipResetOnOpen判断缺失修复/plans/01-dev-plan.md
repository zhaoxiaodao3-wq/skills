# Dev Plan：教职工岗位管理-4picker-dialog-skipResetOnOpen判断缺失修复

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

> 状态：P3 已确认（hotfix Inline 档位）
> Plan 版本：v1.0 / 2026-09-23

## 1. 范围

4 个 picker-dialog 各加 2 行（`if (!props.skipResetOnOpen)` 判断 + 注释），与 CG picker-dialog 对齐。

| 步骤 | 操作 | 验证 |
|---|---|---|
| 1 | 改 CGS picker-dialog watch | ripgrep `if (!props.skipResetOnOpen)` 命中 |
| 2 | 改 CCS picker-dialog watch | 同上 |
| 3 | 改 CC picker-dialog watch | 同上 |
| 4 | 改 CSE picker-dialog watch | 同上 |
| 5 | ripgrep 验证 5/5 picker-dialog 含 `if (!props.skipResetOnOpen)` | 5/5 命中 |
| 6 | ESLint 验证 | EXIT 0 |
| 7 | archive + harness:check | EXIT 0 |

## 2. 验收

- [ ] ripgrep `if \(!props\.skipResetOnOpen\)` 5/5 命中
- [ ] `pnpm eslint` 4 个目标文件 0 error
- [ ] `pnpm harness:check` EXIT 0
- [ ] `pnpm harness:status` 当前模块 DELIVERED

## 3. 风险

| 风险 | 概率 | 缓解 |
|---|---|---|
| 4 个 picker-dialog 行为变化 | 中 | dev smoke：选 → 上一步 → 下一步 → rows 保留 |
| 跨 kind 切换异常 | 0 | 不同 kind 用不同 picker-dialog，无 skip 串扰 |
| CG 行为受影响 | 0 | CG picker-dialog 不动 |
| ESLint 警告 | 低 | 收尾 ESLint 验证 |

## 4. 工时预估

- Inline 改 4 文件 × 2 行 = 4 处 edit，预计 3 分钟
- ESLint 收尾 1 分钟
- archive + harness 验证 1 分钟
- 合计 ~5 分钟