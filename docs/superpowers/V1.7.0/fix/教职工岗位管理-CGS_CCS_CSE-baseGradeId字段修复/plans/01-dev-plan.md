# Dev Plan：教职工岗位管理-CGS_CCS_CSE-baseGradeId字段修复

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

> 状态：P3 已确认（hotfix Inline 档位）
> Plan 版本：v1.0 / 2026-09-23

## 1. 范围

3 个 cascader 各 1-3 处 edit：

| 步骤 | 操作 | 验证 |
|---|---|---|
| 1 | 改 CGS level=2（年级）map 写入 `baseGradeId` | read diff |
| 2 | 改 CGS level=3（科目）取 `parentData.baseGradeId` | read diff |
| 3 | 改 CCS level=2（年级）map 写入 `baseGradeId` | read diff |
| 4 | 改 CCS level=3（班级）透传 `baseGradeId` | read diff |
| 5 | 改 CCS level=4（科目）取 `parentData.baseGradeId` | read diff |
| 6 | 改 CSE level=2（科目）移除回退路径，只用 `queryAllowSubjectsList` | read diff |
| 7 | ripgrep 验证 `baseGradeId: ''`（排除注释）仅命中注释 | 0 命中 |
| 8 | ripgrep 验证 `schoolGradeSubjectsList` 在 CSE 已无调用 | 仅 CGS/CCS 命中 |
| 9 | ESLint 验证 | EXIT 0 |
| 10 | archive + harness:check | EXIT 0 |

## 2. 验收

- [ ] ripgrep `baseGradeId: ''`（排除注释）→ 0 命中真实代码
- [ ] ripgrep `schoolGradeSubjectsList` → 仅 CGS / CCS 命中（不在 CSE）
- [ ] ripgrep `leaf: 'isLeaf'` 在 5 个 cascader 中保留（hotfix 不回退）
- [ ] `pnpm eslint` 5 个目标文件 0 error
- [ ] `pnpm harness:check` EXIT 0
- [ ] `pnpm harness:status` 当前模块 DELIVERED

## 3. 风险

| 风险 | 概率 | 缓解 |
|---|---|---|
| CGS / CCS 科目选不中（仍 412） | 极低 | grade item 真实含 `baseGradeId` 字段（department/index.vue 第 18 行已验证） |
| CSE 主路径异常无回退 | 低 | try/catch + empty-text 兜底 |
| picker-dialog 行为回归 | 0 | 本轮不动 picker-dialog |
| 校区型弹窗行为回归 | 0 | 本轮不动校区型弹窗 |

## 4. 工时预估

- Inline 改 3 文件 ~30 行，预计 5 分钟
- ESLint 收尾 1 分钟
- archive + harness 验证 1 分钟
- 合计 ~7 分钟