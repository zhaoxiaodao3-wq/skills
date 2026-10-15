# 教职工岗位管理 · CGS_CCS_CSE · baseGradeId 字段修复 · 交付归档

**归档类型：** fix hotfix 交付快照
**归档日期：** 2026-09-23
**版本：** V1.7.0
**状态：** DELIVERED
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

紧接 `fix/教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复` DELIVERED 之后，用户实测反馈 CGS / CCS 弹窗选科目仍 412。

### 真实根因

后端接口 `schoolGradeSubjectsList({ baseGradeId, stageId })` 的 `baseGradeId` 是**基础年级 ID**（来自 `schoolBase` 字典），不是学校绑定年级 ID。

- **CGS / CCS cascader 第 3 层（年级）** 调 `getSchoolGradeListByCurrentYear` 拿学校当前学年年级，每个 item 含 `baseGradeId` 字段（指向基础年级）—— **但前轮 cascader.vue 没把 `baseGradeId` 写入节点的 `data`**，第 4/5 层科目取不到。
- **CSE cascader 无年级层**，`baseGradeId` 在 CSE 场景下无来源，前轮的 `schoolGradeSubjectsList({ baseGradeId: '', stageId })` 回退路径**永远 412 失败**——属于 dead code。

证据：
- `pages/app/basic-data/school/school/department/index.vue` 第 18 行：`<ElOption :value="item.baseGradeId" />` —— grade item 直接有 `baseGradeId`
- `pages/app/basic-data/school/school/subject/index.vue` 第 209 行：`baseGradeId: item.id`（来自 `getSchoolBaseGradeList` 基础年级列表）

---

## 修复（3 个 cascader）

### CGS（4 层）
- 第 3 层（年级）map 写入 `baseGradeId: String(g.baseGradeId ?? '')`
- 第 4 层（科目）改 `const baseGradeId = String(parentData?.baseGradeId ?? '')`

### CCS（5 层）
- 第 3 层（年级）map 写入 `baseGradeId: String(g.baseGradeId ?? '')`
- 第 4 层（班级）从父年级透传 `baseGradeId` 写入 data
- 第 5 层（科目）改 `const baseGradeId = String(parentData?.baseGradeId ?? '')`

### CSE（3 层）
- **移除** `schoolGradeSubjectsList({ baseGradeId: '', stageId })` 回退路径（永远 412）
- 只保留 `queryAllowSubjectsList({ stageId })` 主路径
- try/catch 失败 → `subjects = []` → empty-text 兜底

---

## 改动文件（3 个）

### `E:\code\two\frontend\`（代码仓库）

| 类型 | 改动 |
|------|------|
| CGS | `campus-grade-subject-cascader.vue` level=2/3 各改 1 行 |
| CCS | `campus-class-subject-cascader.vue` level=2/3/4 各改 1 行 + 班级 map 透传 |
| CSE | `campus-stage-subject-cascader.vue` 重写 level=2（移除双层兜底，简化成单 try/catch） |

### `E:\code\frontend\`（文档仓库）

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/fix/教职工岗位管理-CGS_CCS_CSE-baseGradeId字段修复/{requirements,specs,plans,archive}/` |

### 仓库已存在但未触碰（已验证）

- 校区型 `CampusMultiPickerDialog.vue`
- CG cascader（无科目层，不受影响）
- CC cascader（无科目层，不受影响）
- 5 个 cascader 的 cascaderProps（保留 hotfix 的 `leaf: 'isLeaf'`）
- 5 个 cascader.model.ts / util.ts
- 5 个 picker-dialog.vue / util.ts
- 注册表 / 列表聚合 / session
- `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`
- service 接口定义（不动）
- mocks

---

## 验收结果（spec §4 逐项）

### 核心修复（8 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | CGS 年级层（level=2）map 写入 `baseGradeId` | ✅ | ripgrep `baseGradeId: String(g.baseGradeId ?? '')` 命中 CGS |
| 2 | CGS 科目层（level=3）改用 `parentData.baseGradeId` | ✅ | ripgrep `parentData?.baseGradeId` 命中 CGS |
| 3 | CCS 年级层（level=2）map 写入 `baseGradeId` | ✅ | ripgrep 命中 CCS |
| 4 | CCS 班级层（level=3）从父年级透传 `baseGradeId` | ✅ | ripgrep 命中 CCS |
| 5 | CCS 科目层（level=4）改用 `parentData.baseGradeId` | ✅ | ripgrep 命中 CCS |
| 6 | CSE 移除 `schoolGradeSubjectsList` 回退路径 | ✅ | ripgrep `schoolGradeSubjectsList` 仅 CGS / CCS 命中 |
| 7 | `baseGradeId: ''` 在真实代码 0 命中（仅注释） | ✅ | ripgrep `baseGradeId: ''` 命中 1 处（CSE 注释） |
| 8 | `leaf: 'isLeaf'`（hotfix）在 5 个 cascader 中保留 | ✅ | ripgrep 5/5 命中 |

### 防御层未受影响（2 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 9 | cascaderProps `leaf: 'isLeaf'` 映射（hotfix 修复）保留 | ✅ | ripgrep 5/5 命中 |
| 10 | empty-text + util 双层防御保留 | ✅ | 未触碰 |

### 回归（3 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 11 | 校区型 `CampusMultiPickerDialog.vue` 未改 | ✅ | 本轮未触碰 |
| 12 | 5 个 picker-dialog.vue 未改 | ✅ | 本轮未触碰 |
| 13 | `pnpm eslint` 3 个目标文件 0 error | ✅ | EXIT 0 |

---

## 还原度自检

不适用：本次为接口参数修复（hotfix），无 Figma / 无像素对照需求。

---

## SDD / 派发记录

| 模式 | 说明 |
|------|------|
| **Inline (hotfix)** | 3 个 cascader.vue 各 ~10 行修改 |

---

## Harness 闭环

| 项 | 结果 |
|----|------|
| 模块目录四层齐全 | ✅ requirements / specs / plans / archive 4 层均存在 |
| requirements / spec / plan 链接正确 | ✅ archive 头部 3 条相对路径均可达 |
| 改 src 前 validate-harness 已跑 | ✅ P3 前 `pnpm harness:check` EXIT 0 |
| spec 验收项已勾选 | ✅ 见「验收结果」表 13/13 |
| 一致性自检已完成并写入 archive | ✅ 见上表 |
| 还原度自检已完成或已注明不适用 | ✅ 注明「不适用」 |
| archive 交付快照已写 | ✅ 本文件 |
| commit 前 validate-harness 已跑 | ✅ `pnpm harness:check` EXIT 0 |
| harness:check 无本模块警告 | ✅ 通过 |
| harness:status 阶段为 DELIVERED | ⏳ 见下方「下一步交付对话」 |

---

## 下一步交付对话

- dev smoke（强建议）：
  - **CGS 弹窗** → 选天河校区/小学/三年级 → 第 4 列科目**正常显示该年级下科目列表**
  - **CCS 弹窗** → 选天河校区/小学/三年级/一班 → 第 5 列科目**正常显示该班级下科目列表**
  - **CSE 弹窗** → 选天河校区/小学 → 第 3 列科目**正常显示该学段下允许的科目**
- 用户决定是否 commit / push（**不自动 commit**）

---

## 关联模块（8 个 fix 修复链）

| 模块 | 状态 | 范围 |
|------|------|------|
| `fix/教职工岗位管理-五类数据权限弹窗2-行内级联选择修复` | DELIVERED | 5 picker-dialog ElTree → 行内 cascader 骨架 |
| `fix/CSE数据权限弹窗2-UI对齐CGS_CCS` | DELIVERED | CSE 4 项对齐 + service 接口修复 |
| `fix/教职工岗位管理-五类级联选择-lazy模式` | DELIVERED | cascader 「打开弹窗一次性拉完整树」→ lazy 按需加载 |
| `fix/教职工岗位管理-五类级联选择-段数校验与空态提示` | DELIVERED | 段数完整性 + empty-text 兜底 |
| `fix/教职工岗位管理-五类级联选择-空数据父节点禁用` | DELIVERED（方向错误） | 已被撤销 |
| `fix/教职工岗位管理-五类级联选择-空数据纯文字提示` | DELIVERED（机制对、触发场景错） | 保留作为防御层 |
| `fix/教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复` | DELIVERED | cascaderProps 加 `leaf: 'isLeaf'` 映射（真实根因 #1） |
| **`fix/教职工岗位管理-CGS_CCS_CSE-baseGradeId字段修复`** | **DELIVERED** | **真实根因 #2**：grade item 透传 `baseGradeId` + CSE 移除死路径 |

> 修复链全貌：本轮（baseGradeId 字段修复）是 hotfix 之后**第二个真实根因修复**——CGS/CCS 年级层缺 `baseGradeId` 透传，CSE 回退路径永 412 失败。两者都是「参数未透传或接口路径设计错」类问题。

> 用户视角最终行为：「CGS/CCS 选完整路径到科目可正常显示，CSE 按学校学段直查允许的科目」 ✅ 与用户期望对齐