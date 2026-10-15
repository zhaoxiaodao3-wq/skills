# CSE 数据权限弹窗 2 · UI 对齐 CGS / CCS · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-23  
**版本：** V1.7.0  
**状态：** DELIVERED  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

紧接上一轮 DELIVERED 的「五类数据权限弹窗 2 修复」之后，对 **CSE（校区+学段+科目）** 单文件做 UI / 行为对齐修复——与 CGS / CCS 4 处偏离：

1. **+ 按钮位置**：`__list` 底部 → `__head` 末尾
2. **+ / - 按钮形态**：文字按钮「+ 添加一行」「删除」→ `round size="small"` + `<ElIcon><IconEpPlus/></ElIcon>` / `<IconEpMinus/>`
3. **- 按钮行为**：`:disabled` → `v-if="canRemoveRow(rows.length)"`（行数 = 1 时隐藏）
4. **service 接口**：`schoolSubjectsList`（后端不分学段）→ `queryAllowSubjectsList({ stageId })` 主路径 + `schoolGradeSubjectsList({ baseGradeId: '', stageId })` fallback（**业务 bug 修复**：第 3 列科目改为"该学段下的科目"，而非全校所有科目）

实现方式：单文件改动（1 个 .vue），Inline 一次性改完（不再派 worker）。

---

## 改动文件

### `E:\code\two\frontend\`（代码仓库）

| 操作 | 路径 |
|------|------|
| 改 | `src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-picker-dialog/campus-stage-subject-picker-dialog.vue` |

### `E:\code\frontend\`（文档仓库）

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/fix/CSE数据权限弹窗2-UI对齐CGS_CCS/{requirements,specs,plans,archive}/` |

### 仓库已存在但未触碰（已验证）

- 校区型 `CampusMultiPickerDialog.vue`
- 6 个 `*-cascader.vue`
- 5 个 `*-picker-dialog.{model,util}.ts`
- 5 个 `*-picker-dialog.scss`
- 其它 4 个 picker-dialog.vue（campus-grade / campus-grade-subject / campus-class / campus-class-subject）——上一轮 DELIVERED 后行为不变
- `src/components/faculty/data-permission/{registry,list-cells,types}.ts`
- `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`
- `src/mocks/faculty-position/*`
- `src/service/*`（仅调用，未改签名）

---

## 验收结果（spec §6 逐项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | `+` 按钮位于 `__head` 末尾（label 右移），`round size="small"` + `<ElIcon><IconEpPlus /></ElIcon>` | ✅ | line 20-27 |
| 2 | `-` 按钮在每行尾部，`round size="small"` + `<ElIcon><IconEpMinus /></ElIcon>` | ✅ | line 41-49 |
| 3 | `-` 按钮用 `v-if="canRemoveRow(rows.length)"`（不是 `:disabled`）；行数 = 1 时隐藏 | ✅ | line 42 |
| 4 | 模板不再含 `+ 添加一行` / `删除` 文字按钮 | ✅ | grep 0 命中 |
| 5 | script 不再用 `schoolSubjectsList` | ✅ | grep 0 命中 |
| 6 | script 用 `queryAllowSubjectsList({ stageId })` 主路径 + `schoolGradeSubjectsList({ baseGradeId: '', stageId })` fallback | ✅ | line 152（主）/ line 168（fallback） |
| 7 | rows 操作：直接 mutate（与 CGS 风格一致） | ✅ | `rows.value.push(null)` / `splice` / `[idx]=value` |
| 8 | `pnpm eslint <file>` 0 error | ✅ | `pnpm eslint --fix` 后 EXIT 0 |
| 9 | 校区型 + 其它 4 个 picker-dialog 行为不变（回归门禁） | ✅ | `pnpm eslint` 6 个 vue 文件 EXIT 0；`CampusMultiPickerDialog.vue` 未改 |

---

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | `rows = ref<ScopeRow[]>([null])` 默认 1 空行；`v-loading` 包 body；空行不可提交 |
| 常量/mock/真数据 | 通过 | 主路径 `queryAllowSubjectsList({ stageId })` + fallback `schoolGradeSubjectsList`；service 调用未改签名；mocks 未动 |
| 多入口 | 通过 | 校区型（checkbox）+ 5 个 picker-dialog（行内级联）双入口独立；`faculty-position.vue` 通过 registry 路由 |
| 失败/缺省 | 通过 | 单条 service 失败 → 三层 `Promise.allSettled` 兜底空数组；空行 → toast「请完整选择校区学段科目」不关弹框；重复 → toast「科目已存在」不关弹框；queryAllowSubjectsList 抛错 → fallback；fallback 抛错 → 返回 `[]` |

---

## 还原度自检

不适用。本次为 UI 行为修复（fix），无 Figma / 无像素对照需求；与 CGS / CCS 观感对齐即可。

---

## 与上一轮 fix 模块的关系

| | 上一轮 | 本轮 |
|--|--------|------|
| 模块 | `fix/教职工岗位管理-五类数据权限弹窗2-行内级联选择修复` | `fix/CSE数据权限弹窗2-UI对齐CGS_CCS` |
| 状态 | DELIVERED（2026-09-23 10:42） | DELIVERED（2026-09-23 10:50） |
| 范围 | 5 个 picker-dialog 全部 ElTree → 行内 cascader | CSE 单文件 4 项对齐 + service 接口替换 |
| 关系 | 上一轮 CSE worker 交付的实现未对齐 CGS / CCS | 本轮补齐 4 项偏离 + 业务 bug |

---

## Harness 闭环

| 项 | 结果 |
|----|------|
| 模块目录四层齐全 | ✅ requirements / specs / plans / archive 4 层均存在 |
| requirements / spec / plan 链接正确 | ✅ archive 头部 3 条相对路径均可达 |
| 改 src 前 validate-harness 已跑 | ✅ P3 前 `pnpm harness:check` EXIT 0 |
| spec 验收项已勾选 | ✅ 见「验收结果」表 9/9 |
| 一致性自检已完成并写入 archive | ✅ 见上表 |
| 还原度自检已完成或已注明不适用 | ✅ 注明「不适用」 |
| archive 交付快照已写 | ✅ 本文件 |
| commit 前 validate-harness 已跑 | ✅ `pnpm harness:check` EXIT 0（提交由用户决定，本期不自动 commit） |
| harness:check 无本模块 ARCHIVE_MISSING_* / SPEC_MISSING_FIGMA_STYLE_TABLE 警告 | ✅ 通过 |
| harness:status 阶段为 DELIVERED | ⏳ 见下方「下一步交付对话」 |

---

## 下一步交付对话

- dev smoke：进入 `http://localhost:5173/app/basic-data/school/school/faculty/faculty-position?item=...`
  - 分配岗位 → 选「校区+学段+科目」→ 下一步
  - 期望：
    1. 弹窗标题 `【校区+学段+科目】权限`
    2. label 右移位置出现小圆 `+` 按钮（**不再**有「+ 添加一行」文字）
    3. 默认 1 空行；行数 = 1 时**无** `-` 按钮
    4. 点开选择框：3 列级联面板（校区 → 学段 → 科目）
    5. **第 3 列（科目）只显示"该学段下的科目"**（不是全校所有科目）——这是 4 项修复中**唯一功能层改动**
    6. 选完后能正常提交；重复路径 → toast「科目已存在」
- 用户决定是否 commit / push（**不自动 commit**）