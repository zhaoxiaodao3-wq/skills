# 教职工岗位管理 · 五类数据权限弹窗 2 · 行内级联选择修复 · 开发计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**类型：** fix  
**档位：** 标准  
**版本：** V1.7.0  
**日期：** 2026-09-23  
**状态：** 待 P3 确认

> **同形微任务（Batch）：** Task 2/3/4/5/6 都是「重写一个 `*-picker-dialog.vue`」，模板与 script 骨架同构，仅 service 调用栈与级联深度不同。SDD 可一次派发。

---

## Skill 路由结果（`router.mjs --annotate` · 2026-09-23）

- **CLI 真实输出**：所有 step 均为 `needsSkill: false`（`/skills/.agents/routing/SKILL_ROUTING.md` 路由图中无 vue-skills / element-plus / 业务组件相关 skill）
- **人工复核**：
  - Task 1（读校区型弹窗）→ 仅 vue3 `<script setup>` + Element Plus 模板阅读；无 skill 匹配是合理的
  - Task 2-6（重写 5 个 picker-dialog）→ 同样 Vue3 + Element Plus；不在路由图 → 不强制外部 skill
  - Task 7（lint + 回归）→ 同上
- **决策**：
  - 不引入路由图中不存在的 skill（避免幻觉）
  - 实施时若对 `<script setup>` / `ElCascader` / `ElDialog` / `ElIcon` 用法不确定，可本地参考 `vue-skills` 描述（按需 human 决策）
  - 路由图未变；标注仍落 plan，便于后续追溯

---

## Task 1：校区型弹窗回归基线（先做，确保后续不被破坏）

- 路径（不动）：`E:\code\two\frontend\src\components\faculty\CampusMultiPickerDialog.vue`
- 验证：
  1. `pnpm lint src/components/faculty/CampusMultiPickerDialog.vue` 0 error
  2. 读 CampusMultiPickerDialog 确认 `dataPermissionType: 'campus'` + `el-checkbox` 多选语义未变
  3. 记录：校区型契约 = `{ modelValue, dataPermissionType: 'campus', defaultCampusIds, showPrevStep, skipResetOnOpen?, schoolId }`；emit `update:modelValue / prevStep / submit(campusIds[])`
- 输出：基线契约记录（注释或本地 scratch）。**不修改任何文件**

> **Skill:** 无（路由图无 vue 相关 skill）

---

## Task 2：campus-grade-picker-dialog 重写（CG · 校区→学段→年级 · 3 段）

> **Skill:** 无（路由图无 vue 相关 skill）

### 子任务 2.1 — 模板重写

- 文件：`E:\code\two\frontend\src\components\faculty\data-permission\campus-grade\campus-grade-picker-dialog\campus-grade-picker-dialog.vue`
- 删除：
  - `<ElTree>` + `show-checkbox` + `treeRef` 整段
  - `__head__label` 文字「请勾选校区年级（多选）」→ 改为「请添加校区年级（必填）」
- 新增：
  - `__head` 末尾加 `<ElButton round size="small" @click="addRow">+</ElButton>`
  - `__list` 容器内 `v-for="(row, idx) in rows" :key="idx"` 渲染 `__row`
  - 每行：`<CampusGradeCascader :model-value="row" :tree="tree" @update:model-value="onRowChange(idx, $event)" />`
  - 每行尾部：`<ElButton v-if="canRemoveRow(rows.length)" round size="small" @click="removeRow(idx)">-</ElButton>`

### 子任务 2.2 — Script 重写

- 引入：
  - `import CampusGradeCascader from '../campus-grade-cascader/campus-grade-cascader.vue'`
  - `import { initScopes, validateScopes, canRemoveRow } from './campus-grade-picker-dialog.util'`
  - `import type { CascaderNode } from '../campus-grade-cascader/campus-grade-cascader.util'`
- 状态：
  - `const rows = ref<ScopeRow[]>([null])`
  - `const tree = ref<CascaderNode[]>([])`
  - `const treeLoading = ref(false)`
  - `const submitLoading = ref(false)`
  - `const currentYearId = ref<string>('')`
- watch modelValue=true：
  1. `treeLoading = true`
  2. `currentYearId = (await service.school.currentYear({ schoolId })).id` （try-catch 兜底空串）
  3. `const campuses = (await service.baseData.getSchoolCampusList({ schoolId, state: 1 })) ?? []`
  4. 对每个 campus `Promise.allSettled` 拉 stage：`service.baseData.getSchoolStageList({ schoolId, campusId: c.id })`
  5. 对每个 stage `Promise.allSettled` 拉 grade：`service.school.getSchoolGradeListByCurrentYear({ schoolId, campusId, stageId, yearId })`
  6. 组装 `tree = campuses.map(c => ({ id: String(c.id), name: c.name, children: stages.map(...) }))`
  7. `rows.value = initScopes(props.defaultScopes ?? [])`
  8. `treeLoading = false`
- 方法：
  - `addRow() { rows.value.push(null) }`
  - `removeRow(i) { rows.value.splice(i, 1) }`
  - `onRowChange(i, v) { rows.value[i] = v }`
  - `onSubmit() { const r = validateScopes(rows.value); if (!r.ok) { ElMessage.warning(r.message!); return } submitLoading.value = true; emit('submit', r.scopes!); setTimeout(() => submitLoading.value = false, 300) }`
- 不要：`treeRef / handleLoadNode / applyDefaultChecked / getCheckedNodes / setCheckedKeys`

### 子任务 2.3 — 校验

- `pnpm lint src/components/faculty/data-permission/campus-grade/campus-grade-picker-dialog/campus-grade-picker-dialog.vue` 0 error
- 类型：`<script setup lang="ts">` 中 import / type 不再含 `TreeInstance / treeRef`

---

## Task 3：campus-grade-subject-picker-dialog 重写（CGS · 校区→学段→年级→科目 · 4 段）

> **Skill:** 无（路由图无 vue 相关 skill）

- 文件：`E:\code\two\frontend\src\components\faculty\data-permission\campus-grade-subject\campus-grade-subject-picker-dialog\campus-grade-subject-picker-dialog.vue`
- 模板：同 Task 2，标题 = `【校区+年级+科目】权限`，label = `请添加校区年级科目（必填）`，行内组件 = `<CampusGradeSubjectCascader ...>`
- Script：同 Task 2，watch 多一步：
  - 对每个 grade 拉 `service.school.schoolGradeSubjectsList({ baseGradeId: g.id, stageId })`
  - 组装时 `grade.children = subjects.map(...)`
- 文案：空行→`'请完整选择校区年级科目'`；重复→`'科目已存在'`（沿用 util）
- 校验：`pnpm lint` 0 error

---

## Task 4：campus-class-picker-dialog 重写（CC · 校区→学段→年级→班级 · 4 段）

> **Skill:** 无（路由图无 vue 相关 skill）

- 文件：`E:\code\two\frontend\src\components\faculty\data-permission\campus-class\campus-class-picker-dialog\campus-class-picker-dialog.vue`
- 模板：标题 = `【校区+班级】权限`，label = `请添加校区班级（必填）`，行内组件 = `<CampusClassCascader ...>`
- Script：watch 链路：校区→学段→年级→班级（`service.school.getSchoolClassList({ ... params })`，参数沿用原 ElTree 版本 `handleLoadNode` 中见过的：`{ schoolId, campusId, stageId, gradeId }` 或等价；详见「关键参数」附录）
- 文案：空行→`'请完整选择校区班级'`；重复→`'班级已存在'`
- 校验：`pnpm lint` 0 error

---

## Task 5：campus-class-subject-picker-dialog 重写（CCS · 校区→学段→年级→班级→科目 · 5 段）

> **Skill:** 无（路由图无 vue 相关 skill）

- 文件：`E:\code\two\frontend\src\components\faculty\data-permission\campus-class-subject\campus-class-subject-picker-dialog\campus-class-subject-picker-dialog.vue`
- 模板：标题 = `【校区+班级+科目】权限`，label = `请添加校区班级科目（必填）`，行内组件 = `<CampusClassSubjectCascader ...>`
- Script：watch 链路：校区→学段→年级→班级→科目（班级之后多一步 `schoolGradeSubjectsList`）
- 文案：空行→`'请完整选择校区班级科目'`；重复→`'科目已存在'`
- 校验：`pnpm lint` 0 error

---

## Task 6：campus-stage-subject-picker-dialog 重写（CSE · 校区→学段→科目 · 3 段，跳年级）

> **Skill:** 无（路由图无 vue 相关 skill）

- 文件：`E:\code\two\frontend\src\components\faculty\data-permission\campus-stage-subject\campus-stage-subject-picker-dialog\campus-stage-subject-picker-dialog.vue`
- 模板：标题 = `【校区+学段+科目】权限`，label = `请添加校区学段科目（必填）`，行内组件 = `<CampusStageSubjectCascader ...>`
- Script：watch 链路：校区→学段→科目
  - 对每个 stage 拉：`service.school.schoolSubjectsList({ schoolId, stageId })`（或 `schoolGradeSubjectsList({ baseGradeId: '', stageId })`；先看 SKILL_ROUTING service 列表）
  - 注：被改乱的 CGS picker-dialog 中曾用 `schoolGradeSubjectsList({ baseGradeId: data.params.gradeId, stageId })`，CSE 不应直接复用——必要时打开 `src/service/school.ts` 看一下 `schoolSubjectsList` 签名
- 文案：空行→`'请完整选择校区学段科目'`；重复→`'科目已存在'`
- 校验：`pnpm lint` 0 error

---

## Task 7：跨类型一致性 + 校区型回归 + ESLint 收尾

### 7.1 ESLint 全量

```bash
cd E:\code\two\frontend
pnpm lint src/components/faculty/
```

- 期望：6 个 vue 文件（5 picker-dialog + 1 CampusMultiPickerDialog）0 error；cascade 模块 + cascader.vue 0 error
- 若有 error：直接修正进对应 vue 文件（不允许动 cascader.vue 与 util.ts）

### 7.2 校区型回归（再走一遍 Task 1 的契约）

- 读 `faculty-position.vue` 确认校区型绑定未变：
  - `<campus-multi-picker-dialog ... @submit="(ids) => onDetailSubmit({ kind: 'campus', campusIds: ids })" />`
- 读 5 个新 picker-dialog 确认 emits 与 props 契约一致（modelValue / prevStep / submit(scopes) / closed）

### 7.3 行内 click 自检（手动 / 浏览器调试）

- 进入 `http://localhost:5173/app/basic-data/school/school/faculty/faculty-position?item=...`
- 任选 5 个被修复类型之一，点击分配岗位 → 选岗位 + 选该枚举 → 下一步
- 期望：弹窗显示「【...】权限」+ 默认 1 空行 + `+` 按钮；点开选择框弹 3/4/5 层级联面板
- 选完一行 → 选第二行（不同路径）→ 点确定 → 应成功提交并刷新列表
- 故意重复同一路径 → 应 toast 「xxx已存在」且不关窗
- 故意空行 → 点确定 → 应 toast 「请完整选择...」且不关窗

> **Skill:** 无（路由图无 mcp_browser；本任务为人工校验）

---

## 附录 · 关键 service 参数（沿用当前 5 个 picker-dialog.vue 已用过的写法）

| Type | 链路参数（按被改乱改版本沿用） |
|------|--------------------------------|
| 校区列表 | `service.baseData.getSchoolCampusList({ schoolId, state: 1 })` |
| 学段列表 | `service.baseData.getSchoolStageList({ schoolId, campusId })` |
| 当前学年 | `service.school.currentYear({ schoolId }).id` |
| 年级（按学年） | `service.school.getSchoolGradeListByCurrentYear({ schoolId, campusId, stageId, yearId })` |
| 年级科目（CGS/CCS 叶子） | `service.school.schoolGradeSubjectsList({ baseGradeId, stageId })` |
| 班级（CC/CCS 中间） | `service.school.getSchoolClassList({ ... })`（具体参数在 plan 实施时若不确定，先读 `src/service/school.ts:235` 附近，再 grep 当前 picker-dialog.vue 旧写法） |
| 科目（CSE 叶子，直挂学段） | `service.school.schoolSubjectsList({ ... })` 或 `schoolGradeSubjectsList({ baseGradeId: '', stageId })`（实施时优先复用 CGS 中现成的 `schoolGradeSubjectsList` 形态，并加 TODO 注释确认） |

---

## 附录 · 不动文件清单（plan 期间禁止编辑）

- 校区型：`src/components/faculty/CampusMultiPickerDialog.vue`
- 6 个级联组件：`src/components/faculty/data-permission/*/xxx-cascader.vue`
- 5 个 model：`src/components/faculty/data-permission/*/xxx-picker-dialog.model.ts`
- 5 个 util：`src/components/faculty/data-permission/*/xxx-picker-dialog.util.ts`
- 5 个 scss：`src/components/faculty/data-permission/*/xxx-picker-dialog.scss`
- 注册表 / 列表聚合：`src/components/faculty/data-permission/registry.ts`、`list-cells.ts`、`types.ts`
- 页面：`src/pages/app/basic-data/school/school/faculty/faculty-position.vue`
- mocks：`src/mocks/faculty-position/*`
- service：`src/service/school.ts`、`src/service/baseData.ts`、`src/service/operate.ts`