# 教职工岗位管理 · 五类级联选择 · 段数校验与空态提示 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-23  
**版本：** V1.7.0  
**状态：** DELIVERED  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

紧接 `fix/教职工岗位管理-五类数据权限级联选择-lazy模式` DELIVERED 之后，对**段数完整性与空态友好性**做关键修复：

### 问题 1：父级无 children 时仍可作为最后一级被选

- **现象**：CG 弹窗里 row 显示「天河校区/学前」（2 段），缺年级，**仍可提交**
- **业务影响**：后端 `permissionScopeList` 收到不完整 DTO → 「权限范围」列显示缺失；学年升级 / 真接口对接会报错；判重失效
- **根因**：
  1. Element Plus Cascader lazy 模式下，父节点 `resolve([])` 被识别为 leaf，允许被选
  2. `idsToDTO` 不校验 ids 长度
  3. `validateScopes` 不校验 DTO 完整性字段
- **修复**：双层防御
  - **第一层**（前置）：`cascader.util.idsToDTO` 加 `ids.length < N` 校验（CG 3 / CGS 4 / CC 4 / CCS 5 / CSE 3），长度不够返回 null → cascader.vue emit null → picker-dialog 行变空行
  - **第二层**（兜底）：`picker-dialog.util.validateScopes` 加 `!row.gradeId/subjectId/classId` 校验 → onSubmit 时 toast「请完整选择...」不关弹框

### 问题 2：父节点空时的「展开框」

- **现象**：用户看到空 panel 误以为是展开控件
- **业务影响**：用户体验差；找不到原因（"明明有年级，怎么没有？"）
- **根因**：Element Plus Cascader 默认 `empty-text="No Data"`——视觉提示不友好、不本地化
- **修复**：5 个 cascader.vue 加 `empty-text="暂无数据，请联系管理员"`

---

## 改动文件（15 个）

### `E:\code\two\frontend\`（代码仓库）

| 类型 | cascader.vue (加 empty-text) | cascader.util.ts (idsToDTO 校验) | picker-dialog.util.ts (validateScopes 校验) |
|------|------------------------------|----------------------------------|----------------------------------------------|
| CG | `campus-grade-cascader.vue` | `campus-grade-cascader.util.ts` | `campus-grade-picker-dialog.util.ts` |
| CGS | `campus-grade-subject-cascader.vue` | `campus-grade-subject-cascader.util.ts` | `campus-grade-subject-picker-dialog.util.ts` |
| CC | `campus-class-cascader.vue` | `campus-class-cascader.util.ts` | `campus-class-picker-dialog.util.ts` |
| CCS | `campus-class-subject-cascader.vue` | `campus-class-subject-cascader.util.ts` | `campus-class-subject-picker-dialog.util.ts` |
| CSE | `campus-stage-subject-cascader.vue` | `campus-stage-subject-cascader.util.ts` | `campus-stage-subject-picker-dialog.util.ts` |

### `E:\code\frontend\`（文档仓库）

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/fix/教职工岗位管理-五类级联选择-段数校验与空态提示/{requirements,specs,plans,archive}/` |

### 仓库已存在但未触碰（已验证）

- `src/components/faculty/CampusMultiPickerDialog.vue`（校区型弹框，回归门禁）
- 5 个 cascader.model.ts
- 5 个 cascader.scss
- 5 个 picker-dialog.vue（只动其 util.ts，不动 .vue）
- 注册表 / 列表聚合 / session
- `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`
- mocks / service

---

## 验收结果（spec §7 逐项）

### 段数校验（10 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | CG `idsToDTO`：ids.length < 3 → null | ✅ | line 20 `if (!ids \|\| ids.length < 3)` |
| 2 | CGS `idsToDTO`：ids.length < 4 → null | ✅ | line 18 `if (!ids \|\| ids.length < 4)` |
| 3 | CC `idsToDTO`：ids.length < 4 → null | ✅ | line 18 `if (!ids \|\| ids.length < 4)` |
| 4 | CCS `idsToDTO`：ids.length < 5 → null | ✅ | line 18 `if (!ids \|\| ids.length < 5)` |
| 5 | CSE `idsToDTO`：ids.length < 3 → null | ✅ | line 18 `if (!ids \|\| ids.length < 3)` |
| 6 | CG `validateScopes`：`!row.gradeId` → toast | ✅ | line 26 |
| 7 | CGS `validateScopes`：`!row.subjectId` → toast | ✅ | line 25 |
| 8 | CC `validateScopes`：`!row.classId` → toast | ✅ | line 26 |
| 9 | CCS `validateScopes`：`!row.classId \|\| !row.subjectId` → toast | ✅ | line 25 |
| 10 | CSE `validateScopes`：`!row.subjectId` → toast | ✅ | line 26 |

### 空态提示（1 项 + 1 项 dev smoke）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 11 | 5 个 cascader.vue 加 `empty-text="暂无数据，请联系管理员"` | ✅ | 5 个 .vue 都含该 prop |
| 12 | dev smoke：点开无年级学段 → 面板显示「暂无数据，请联系管理员」 | ⏳ | 用户 dev 验证 |

### 校验（3 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 13 | 校区型 `CampusMultiPickerDialog.vue` 未改 | ✅ | `git diff --stat` 无变更 |
| 14 | 5 个 picker-dialog.vue 未改 | ✅ | `git diff --stat` 仅 util 变化 |
| 15 | `pnpm eslint` 16 个目标文件 0 error | ✅ | EXIT 0 |

---

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | `idsToDTO` 长度不够返回 null → picker-dialog 行变 null（空行）；onSubmit 兜底校验 |
| 常量/mock/真数据 | 通过 | service 接口调用沿用上一轮 lazy 模式；无新增 mock |
| 多入口 | 通过 | 5 个 enum 类型 picker-dialog 各自校验；校区型不动 |
| 失败/缺省 | 通过 | 空 panel → 显示「暂无数据，请联系管理员」；不完整路径 → toast 拒绝 |

---

## 还原度自检

不适用：本次为 UI 行为修复（fix），无 Figma / 无像素对照需求；与用户截图描述对齐即可。

---

## SDD 派发记录（plan §4 约束）

| 约束 | 落实 |
|------|------|
| **禁嵌套子代理** | 5 个 worker 各自独立改各自 enum 类型；无嵌套派发 |
| **显式模型** | 每个 task prompt 写明 `model: minimax/MiniMax-M3` + `effort: on` |
| **`Batch:`** | plan 已标「5 个 enum 类型并行派发」；本次 5 worker 并行 |
| **冲突裁决** | 无冲突；各 worker 各自独立改各自 3 个文件 |

### 5 个 worker 交付一览

| Worker | 文件 | Lint | 决策 |
|--------|------|------|------|
| CG | campus-grade-cascader/{vue,util.ts} + campus-grade-picker-dialog/util.ts | 0 error | - |
| CGS | campus-grade-subject-cascader/{vue,util.ts} + campus-grade-subject-picker-dialog/util.ts | 0 error | - |
| CC | campus-class-cascader/{vue,util.ts} + campus-class-picker-dialog/util.ts | 0 error | - |
| CCS | campus-class-subject-cascader/{vue,util.ts} + campus-class-subject-picker-dialog/util.ts | 0 error | - |
| CSE | campus-stage-subject-cascader/{vue,util.ts} + campus-stage-subject-picker-dialog/util.ts | 0 error | - |

---

## Harness 闭环

| 项 | 结果 |
|----|------|
| 模块目录四层齐全 | ✅ requirements / specs / plans / archive 4 层均存在 |
| requirements / spec / plan 链接正确 | ✅ archive 头部 3 条相对路径均可达 |
| 改 src 前 validate-harness 已跑 | ✅ P3 前 `pnpm harness:check` EXIT 0 |
| spec 验收项已勾选 | ✅ 见「验收结果」表 14/15 + dev smoke 待用户验证 |
| 一致性自检已完成并写入 archive | ✅ 见上表 |
| 还原度自检已完成或已注明不适用 | ✅ 注明「不适用」 |
| archive 交付快照已写 | ✅ 本文件 |
| commit 前 validate-harness 已跑 | ✅ `pnpm harness:check` EXIT 0（提交由用户决定，本期不自动 commit） |
| harness:check 无本模块 ARCHIVE_MISSING_* / SPEC_MISSING_FIGMA_STYLE_TABLE 警告 | ✅ 通过 |
| harness:status 阶段为 DELIVERED | ⏳ 见下方「下一步交付对话」 |

---

## 下一步交付对话

- dev smoke（强建议，按 spec §6.4）：
  - **场景 1**：CG 弹窗 → 选「天河校区/学前」（无年级）→ 面板显示「暂无数据，请联系管理员」→ 用户无法继续选 → 行变空行
  - **场景 2**：CG 选完整 3 段 → 选中 + 提交成功
  - **场景 3**：CCS / CSE 类似（5 段 / 3 段），任一段缺失 → toast 拒绝
  - **场景 4**：校区型分配岗位 → 选「校区」 → 多选校区 → 确定（行为不变）
- 用户决定是否 commit / push（**不自动 commit**）

---

## 关联模块（系列 fix 总览）

| 模块 | 状态 | 范围 |
|------|------|------|
| `fix/教职工岗位管理-五类数据权限弹窗2-行内级联选择修复` | DELIVERED | 5 picker-dialog ElTree → 行内 cascader 骨架 |
| `fix/CSE数据权限弹窗2-UI对齐CGS_CCS` | DELIVERED | CSE 4 项对齐 + service 接口修复 |
| `fix/教职工岗位管理-五类数据权限级联选择-lazy模式` | DELIVERED | cascader 「打开弹窗一次性拉完整树」→ lazy 模式 |
| `fix/教职工岗位管理-五类级联选择-段数校验与空态提示` | **DELIVERED** | 段数完整性 + 空态友好性 |

后续如发现其它问题（响应码统一、CascaderNode 类型统一等），继续以独立 fix 模块推进。