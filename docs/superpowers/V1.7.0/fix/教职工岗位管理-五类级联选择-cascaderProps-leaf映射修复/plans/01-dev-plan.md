# Dev Plan：教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

> 状态：P3 已确认（hotfix Inline 档位）
> Plan 版本：v1.0 / 2026-09-23

## 1. 范围

仅 5 个 cascader 的 `cascaderProps` 各加 1 行 `leaf: 'isLeaf'`：

| 步骤 | 操作 | 验证 |
|---|---|---|
| 1 | 改 `campus-grade-cascader.vue` cascaderProps | ripgrep `leaf: 'isLeaf'` |
| 2 | 改 `campus-grade-subject-cascader.vue` cascaderProps | 同上 |
| 3 | 改 `campus-class-cascader.vue` cascaderProps | 同上 |
| 4 | 改 `campus-class-subject-cascader.vue` cascaderProps | 同上 |
| 5 | 改 `campus-stage-subject-cascader.vue` cascaderProps | 同上 |
| 6 | ripgrep 验证 5/5 cascader 含 `leaf: 'isLeaf'` | 5/5 命中 |
| 7 | ESLint 验证 | EXIT 0 |
| 8 | archive + harness:check | EXIT 0 |

## 2. 具体 edit 模式

每个 cascader 都是同一 edit：

**旧**：
```ts
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  emitPath: true,
  checkStrictly: false,
```

**新**：
```ts
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  leaf: 'isLeaf',
  emitPath: true,
  checkStrictly: false,
```

## 3. 验收

- [ ] ripgrep `leaf: 'isLeaf'` 在 5 个 cascader 中命中
- [ ] ripgrep `empty-text="暂无数据..."` 在 5 个 cascader 中保留
- [ ] ripgrep `resolve([])` 在 5 个 cascader 中保留
- [ ] `pnpm eslint` 5 个目标文件 0 error
- [ ] `pnpm harness:check` EXIT 0
- [ ] `pnpm harness:status` 当前模块 DELIVERED

## 4. 风险

| 风险 | 概率 | 缓解 |
|---|---|---|
| 5 个 cascader 行为变化 | 中 | dev smoke：选最深一层 → 直接选中 |
| picker-dialog 行为回归 | 0 | 本轮不动 picker-dialog |
| 校区型弹窗行为回归 | 0 | 本轮不动校区型弹窗 |
| ESLint 警告 | 低 | 收尾 ESLint 验证 |

## 5. 工时预估

- Inline 改 5 文件 × 1 行 = 5 处 edit，预计 2 分钟
- ESLint 收尾 1 分钟
- archive + harness 验证 1 分钟
- 合计 ~4 分钟