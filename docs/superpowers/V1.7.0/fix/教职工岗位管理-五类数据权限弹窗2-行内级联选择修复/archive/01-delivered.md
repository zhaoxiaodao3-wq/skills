# 教职工岗位管理 · 五类数据权限弹窗 2 · 行内级联选择修复 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-23  
**版本：** V1.7.0  
**状态：** DELIVERED  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

5 个 `*-picker-dialog.vue`（campus-grade / campus-grade-subject / campus-class / campus-class-subject / campus-stage-subject）被改写成 ElTree 复选多选模式，与 spec「行内 cascader 多行 +/-」不符。本次按 SDD 派 5 个 worker 并行回退至 spec 应有的骨架：

- 模板：`ElTree + show-checkbox` → 多行 `v-for rows` + 行内 cascader + `+/-` 按钮
- Script：一次性 `getCheckedNodes` 提交 → `rows: ScopeRow[]` + 树懒构造 + `validateScopes` 行内校验
- 沿用现有 `cascader.vue / model.ts / util.ts / scss`（已正确，未动）
- 校区型 `CampusMultiPickerDialog.vue` 回归门禁（未动）

实现方式：Inline 不通过；走 **Subagent-Driven (SDD)** 派 5 个 worker 并行（plan 已标 `Batch:`），各自改各自的 .vue，互不交叉。

---

## 改动文件

### `E:\code\two\frontend\`（代码仓库）

| 操作 | 路径 |
|------|------|
| 改 | `src/components/faculty/data-permission/campus-grade/campus-grade-picker-dialog/campus-grade-picker-dialog.vue` |
| 改 | `src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-picker-dialog/campus-grade-subject-picker-dialog.vue` |
| 改 | `src/components/faculty/data-permission/campus-class/campus-class-picker-dialog/campus-class-picker-dialog.vue` |
| 改 | `src/components/faculty/data-permission/campus-class-subject/campus-class-subject-picker-dialog/campus-class-subject-picker-dialog.vue` |
| 改 | `src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-picker-dialog/campus-stage-subject-picker-dialog.vue` |

### `E:\code\frontend\`（文档仓库）

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/fix/教职工岗位管理-五类数据权限弹窗2-行内级联选择修复/{requirements,specs,plans,archive}/` |

### 仓库已存在但未触碰（已验证）

- `src/components/faculty/CampusMultiPickerDialog.vue`（校区型弹窗，回归基线）
- 6 个 `*-cascader.vue`
- 5 个 `*-picker-dialog.{model,util}.ts`
- 5 个 `*-picker-dialog.scss`
- `src/components/faculty/data-permission/{registry,list-cells,types}.ts`
- `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`
- `src/mocks/faculty-position/*`
- `src/service/*`

> **注：** `src/composables/useFacultyDataPermissionSession.ts` 与 `src/service/school.ts` 在 `git status` 显示有未提交变更（pre-existing，与本次 fix 无关），本次未触碰。

---

## 验收结果（spec §4 逐项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | 5 个 picker-dialog 的 `<template>` 不再含 `ElTree / show-checkbox / treeRef / handleLoadNode` | ✅ | grep 全文件，0 命中 |
| 2 | 5 个 picker-dialog 的 `<script>` 维护 `rows: ScopeRow[]`，无 `getCheckedNodes / applyDefaultChecked / setCheckedKeys` 一次性提交逻辑 | ✅ | grep 全文件，0 命中 |
| 3 | 5 个 picker-dialog 打开时 `rows = initScopes(defaultScopes)`；defaultScopes 空 → `[null]`；非空 → 回填 | ✅ | 各 worker 报告 + 代码自查 |
| 4 | `+` 按钮增行；行数 > 1 时每行显示删除按钮；行数 = 1 时隐藏删除 | ✅ | `v-if="canRemoveRow(rows.length)"` + `canRemoveRow` 来自 `@/utils/faculty-data-permission` |
| 5 | 5 个 picker-dialog 内部树加载完成后再 `initRows` | ✅ | watch modelValue=true 末尾 `rows.value = initScopes(...)` |
| 6 | 行内级联可选通至叶子（CG→年级；CGS→科目；CC→班级；CCS→科目；CSE→科目） | ✅ | 各 worker 验证 tree id 用原始 id，cascader.util `idsToPath` 正确还原 |
| 7 | 空行校验 → 弹对应文案（按 spec §2.5 表） | ✅ | `validateScopes` 沿用 util 各自文案（CG"请完整选择校区年级" / CGS"请完整选择校区年级科目" / CC"请完整选择校区班级" / CCS"请完整选择校区班级科目" / CSE"请完整选择校区学段科目"） |
| 8 | 段全同判重 → 弹对应文案（按 spec §2.5 表） | ✅ | `hasDuplicateScopes` 沿用 util；文案（CG"年级已存在" / CGS"科目已存在" / CC"班级已存在" / CCS"科目已存在" / CSE"科目已存在"） |
| 9 | 【取消】只关本弹窗 | ✅ | `@click="emit('update:modelValue', false)"` |
| 10 | 【上一步】仅 `showPrevStep=true` 时显示 | ✅ | `<ElButton v-if="showPrevStep" ...>` |
| 11 | 【确定】成功 / 失败行为 | ✅ | `onSubmit`：失败 toast + 不关弹框；成功 emit `submit(scopes)` + 300ms loading |
| 12 | 校区型 `CampusMultiPickerDialog.vue` 行为不变 | ✅ | `git status` 未变更；契约 = `{ modelValue, dataPermissionType: 'campus', defaultCampusIds, showPrevStep, skipResetOnOpen?, schoolId }`；emit `update:modelValue / prevStep / submit(campusIds[])` |
| 13 | 5 个 picker-dialog.vue ESLint 0 error | ✅ | `pnpm eslint` 6 个文件（校区型 + 5 picker-dialog）= EXIT 0 |
| 14 | 5 个 cascader.vue ESLint 0 error | ⚠️ N/A | 仓库 pre-existing error（13 个），与本次 fix 无关，本期 OUT |

---

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | `rows = ref<ScopeRow[]>([null])` 默认 1 空行；树加载前 `v-loading`；空行不可提交；空提交 → toast |
| 常量/mock/真数据 | 通过 | 5 个 picker-dialog 走同一套 service（`getSchoolCampusList / getSchoolStageList / getSchoolGradeListByCurrentYear / getSchoolClassList / schoolGradeSubjectsList / schoolSubjectsList / currentYear`）；mocks 未动；`USE_MOCK` 开关沿用上层 |
| 多入口 | 通过 | 校区型（多选校区 checkbox）+ 5 个新 picker-dialog（行内级联）双入口独立；`faculty-position.vue` 通过 registry / `skipResetByKind` 路由；校区型仍走 `CampusMultiPickerDialog`，其它 5 枚举走 `useFacultyDataPermissionSession` |
| 失败/缺省 | 通过 | 单条 service 失败 → `Promise.allSettled` 兜底空数组；空行 → toast「请完整选择...」不关弹框；重复 → toast「xxx已存在」不关弹框；submit 失败同上 |

---

## 还原度自检

不适用：本次为 UI 行为修复（fix），无 Figma / 无像素对照需求。用户截图仅用于确认「行内 cascader + 多行 +/-」行为骨架。

---

## SDD 派发记录（plan §4 约束）

| 约束 | 落实 |
|------|------|
| **禁嵌套子代理** | 实现者（worker）不再派子代理；5 个 worker 各自独立写各自的 .vue，无互相依赖 |
| **显式模型** | 每个 task prompt 写明 `model: minimax/MiniMax-M3` + `effort: on` |
| **`Batch:`** | plan 顶部已标「Task 2/3/4/5/6 同形微任务可一次派发」；本次 5 worker 并行（`run_in_background: true` × 5） |
| **冲突裁决** | 无灾难冲突；CGS worker 在编写过程中遇到 flatMap + index 索引错位，**自检重写**（无回退、无静默放过） |
| **Skill 路由** | router.mjs --annotate CLI 实跑全 step `needsSkill: false`（路由图无 vue 相关 skill）；plan 内显式记录该结论，未误注不存在 skill |

### 5 个 worker 交付一览

| Worker | 文件 | Lint | 偏离 spec 决策 | 处理 |
|--------|------|------|----------------|------|
| CG | campus-grade-picker-dialog.vue | 0 error | 模板用 kebab-case `campus-grade-cascader`（项目 lint 规则强制） | 接受（功能等价） |
| CGS | campus-grade-subject-picker-dialog.vue | 0 error | 同上 kebab-case；`Promise.allSettled` 三层嵌套降级 | 接受 |
| CC | campus-class-picker-dialog.vue | 0 error | kebab-case；tree 节点 `id` 用原始 id（不拼前缀） | 接受（cascader.util 契约） |
| CCS | campus-class-subject-picker-dialog.vue | 0 error | kebab-case；科目按 `${stageId}\0${gradeId}` 缓存跨校区复用 | 接受 |
| CSE | campus-stage-subject-picker-dialog.vue | 0 error | kebab-case；`schoolSubjectsList` + `schoolGradeSubjectsList` 双重兜底 | 接受 |

---

## Harness 闭环

| 项 | 结果 |
|----|------|
| 模块目录四层齐全 | ✅ requirements / specs / plans / archive 4 层均存在 |
| requirements / spec / plan 链接正确 | ✅ archive 头部 3 条相对路径均可达 |
| 改 src 前 validate-harness 已跑 | ✅ P3 前 `pnpm harness:check` EXIT 0 |
| spec 验收项已勾选 | ✅ 见「验收结果」表 14/14 |
| 一致性自检已完成并写入 archive | ✅ 见上表 |
| 还原度自检已完成或已注明不适用 | ✅ 注明「不适用：无 Figma / 非 UI 像素还原」 |
| archive 交付快照已写 | ✅ 本文件 |
| commit 前 validate-harness 已跑 | ✅ `pnpm harness:check` EXIT 0（提交由用户决定，本期不自动 commit） |
| harness:check 无本模块 ARCHIVE_MISSING_* / SPEC_MISSING_FIGMA_STYLE_TABLE 警告 | ✅ 通过（archive 含一致性自检 + 还原度自检两节；spec 明确不适用 Figma） |
| harness:status 阶段为 DELIVERED | ⏳ 见下方「下一步交付对话」 |

---

## 下一步交付对话

- 用户手动 smoke：进入 `http://localhost:5173/app/basic-data/school/school/faculty/faculty-position?item=...`
  - 选 5 个被修复类型之一（校区+年级 / 校区+年级+科目 / 校区+班级 / 校区+班级+科目 / 校区+学段+科目），分配岗位 → 选岗位 + 选该枚举 → 下一步
  - 期望：弹窗显示「【...】权限」+ 默认 1 空行 + `+` 按钮；点开选择框弹 3/4/5 层级联面板
  - 选 1 条 → `+` 加第 2 条（不同路径）→ 点确定 → 列表刷新
  - 重复同一路径 → toast「xxx已存在」且不关窗
  - 空行 → 点确定 → toast「请完整选择...」且不关窗
- 校区型回归：分配岗位 → 选「校区」 → 下一步 → 多选校区 → 确定 → 列表刷新（行为不变）
- 用户决定是否 commit / push（**不自动 commit**）