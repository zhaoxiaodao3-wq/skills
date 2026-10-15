# 教职工岗位管理 · 五类数据权限 · 级联选择 lazy 模式 · 开发计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**类型：** fix  
**档位：** 标准  
**版本：** V1.7.0  
**日期：** 2026-09-23  
**状态：** 待 P3 确认

> **同形微任务（Batch）：** Task 2/3/4/5/6 都是「改一个 enum 类型的 cascader 子模块 + picker-dialog 共 4 个文件」。各 enum 链路不同（详见 spec §6），无法完全同形。但 scaffold（cascader.vue 的 props / cascaderProps / v-model 适配 / picker-dialog 改 props）完全相同。

---

## Skill 路由结果（`router.mjs --annotate` · 2026-09-23）

- **CLI 真实输出**：所有 step 均为 `needsSkill: false`（`.agents/routing/SKILL_ROUTING.md` 路由图中无 vue-skills / element-plus 相关 skill）
- **人工复核**：与前两轮 fix 一致——Vue 3 + Element Plus 行内级联骨架无路由图匹配 skill
- **决策**：不引入路由图中不存在的 skill；cascader.vue 用 `Element Plus Cascader` 官方 lazy 模式（参考 `AppCascaderArea.vue` 项目内成熟实现）

---

## Task 1：5 个 cascader 子模块改造（cascader.vue + model.ts + util.ts）

> **Skill:** 无（路由图无 vue 相关 skill）

按 spec §2/§3/§4 改造。每个 enum 类型 3 个文件：

| 类型 | 文件路径（`E:\code\two\frontend\src\components\faculty\data-permission\`） |
|------|----------------------------------------------------------------------|
| CG | `campus-grade/campus-grade-cascader/{vue,model.ts,util.ts}` |
| CGS | `campus-grade-subject/campus-grade-subject-cascader/{vue,model.ts,util.ts}` |
| CC | `campus-class/campus-class-cascader/{vue,model.ts,util.ts}` |
| CCS | `campus-class-subject/campus-class-subject-cascader/{vue,model.ts,util.ts}` |
| CSE | `campus-stage-subject/campus-stage-subject-cascader/{vue,model.ts,util.ts}` |

### 子任务 1.1 — cascader.vue 改造

- 改 props：接收 `schoolId` 替代 `tree`
- 改 cascaderProps：`lazy: true` + `async lazyLoad(node, resolve)` 按 spec §2.4 实现各 enum 链路
- 改 v-model 适配：保持 `modelValue: SchoolFacultyPermissionScopeDTO | null`；emit 用 `idsToDTO(ids)` 替代 `idsToPath(tree, ids)`
- 内部 catch → `resolve([])` 不阻断

### 子任务 1.2 — model.ts 改造

```ts
// 改前
tree: Array<{ id: string, name: string, children?: any[] }>

// 改后
schoolId: string
```

### 子任务 1.3 — util.ts 改造

```ts
// 改前
export function idsToPath(tree, ids) { /* 在 tree 里 find 还原 DTO */ }

// 改后
export function idsToDTO(ids: string[]) {
  // 直接按位映射到 dto 各字段（DTO 只需 id 字段）
}
```

### 子任务 1.4 — 校验

- `pnpm eslint E:\code\two\frontend\src\components\faculty\data-permission\*\cascader*.vue` 0 error
- grep 验证 cascader.vue 不再接收 `tree` prop

---

## Task 2-6：5 个 picker-dialog 改造（与 cascader 同一 worker 串行做）

> **Skill:** 无（路由图无 vue 相关 skill）

每个 picker-dialog 单独 Task；每个 Task 由一个 worker 串行做（同一个 enum 的 cascader 子模块 + picker-dialog）：

### Task 2：CG enum 类型（4 个文件）
- Task 1 改 `campus-grade-cascader/{vue,model.ts,util.ts}`
- 然后改 `campus-grade-picker-dialog/campus-grade-picker-dialog.vue`：
  - 删除 watch modelValue 里构造 tree 的全部代码（保留 initScopes 守门）
  - 删除 `tree / treeLoading / currentYearId` 状态
  - 删除 picker-dialog 里所有 service import（移到 cascader.vue 内部）
  - 模板改：`<campus-grade-cascader :tree="tree" ...>` → `<campus-grade-cascader :school-id="dpSchoolId" ...>`

### Task 3：CGS enum 类型（4 个文件）
- 同 Task 2，链路 4 段（校区→学段→年级→科目）

### Task 4：CC enum 类型（4 个文件）
- 同 Task 2，链路 4 段（校区→学段→年级→班级）

### Task 5：CCS enum 类型（4 个文件）
- 同 Task 2，链路 5 段（校区→学段→年级→班级→科目）

### Task 6：CSE enum 类型（4 个文件）
- 同 Task 2，链路 3 段（校区→学段→科目，跳年级）
- service 接口：`queryAllowSubjectsList` 主路径 + `schoolGradeSubjectsList` fallback（沿用上一轮 CSE 修复）

### 校验（每个 Task 完成时跑）

```bash
pnpm eslint E:\code\two\frontend\src\components\faculty\data-permission\{type}\{type}-cascader\
  E:\code\two\frontend\src\components\faculty\data-permission\{type}\{type}-picker-dialog\
```

期望 0 error

---

## Task 7：跨类型一致性 + 校区型回归 + ESLint 收尾

### 7.1 ESLint 全量

```bash
cd E:\code\two\frontend
pnpm eslint \
  src/components/faculty/CampusMultiPickerDialog.vue \
  src/components/faculty/data-permission/campus-grade/campus-grade-cascader/campus-grade-cascader.vue \
  src/components/faculty/data-permission/campus-grade/campus-grade-picker-dialog/campus-grade-picker-dialog.vue \
  src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-cascader/campus-grade-subject-cascader.vue \
  src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-picker-dialog/campus-grade-subject-picker-dialog.vue \
  src/components/faculty/data-permission/campus-class/campus-class-cascader/campus-class-cascader.vue \
  src/components/faculty/data-permission/campus-class/campus-class-picker-dialog/campus-class-picker-dialog.vue \
  src/components/faculty/data-permission/campus-class-subject/campus-class-subject-cascader/campus-class-subject-cascader.vue \
  src/components/faculty/data-permission/campus-class-subject/campus-class-subject-picker-dialog/campus-class-subject-picker-dialog.vue \
  src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-cascader/campus-stage-subject-cascader.vue \
  src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-picker-dialog/campus-stage-subject-picker-dialog.vue
```

期望：12 个 vue 文件 0 error

### 7.2 行为一致性自检

- 5 个 cascader 的 props 全部改为 `schoolId`（不再接收 tree）
- 5 个 cascader 的 cascaderProps 全部含 `lazy: true`
- 5 个 picker-dialog 的 watch modelValue 只保留 initScopes 守门
- 5 个 picker-dialog 不再维护 `tree / treeLoading / currentYearId` 状态
- 5 个 picker-dialog 给 cascader 的 props 改为 `:school-id`

### 7.3 校区型回归

- `pnpm eslint src/components/faculty/CampusMultiPickerDialog.vue` 0 error
- 校区型 `CampusMultiPickerDialog.vue` 未改（`git diff --stat` 确认）
- 校区型契约 `{ modelValue, dataPermissionType: 'campus', defaultCampusIds, showPrevStep, skipResetOnOpen?, schoolId }`；emit `update:modelValue / prevStep / submit(campusIds[])` 不变

### 7.4 dev smoke（任选一种）

#### 方案 A（推荐）：用浏览器 DevTools Network 面板
- 进入 `http://localhost:5173/app/basic-data/school/school/faculty/faculty-position?item=...`
- 打开 DevTools → Network 面板 → 清空
- 点击「分配岗位」→ 选岗位 → 选 CGS 枚举 → 下一步
- **期望**：Network 面板 **0 条** `getSchoolCampusList / getSchoolStageList / getSchoolGradeListByCurrentYear / schoolGradeSubjectsList` 请求
- 点开选择框 → 弹级联面板 → 4 条请求（校区/学段/年级/科目逐级展开）
- 选完一行 → `+` 加第 2 行（不同路径）→ 点确定 → 列表刷新
- 故意重复 → toast「科目已存在」且不关窗
- 空行 → toast「请完整选择...」且不关窗

#### 方案 B：加临时 instrumentation

cascader.vue 加临时 `console.count('cascader-lazy-load')`，dialog 打开时打开选择框前看是否被调用。

### 7.5 service 接口调用次数对比

打开弹窗 → 不点选择框时 service 调用次数：

| 项 | 改前 | 改后 |
|----|------|------|
| CGS (3+1 层) | ~186 次 | **0 次** |
| CCS (1+5+30+150+?) | 数百次 | **0 次** |
| 任何类型 | 数十至数百次 | **0 次** |

点开选择框选完一条 4 级路径 → service 调用次数：

| 项 | 改前 | 改后 |
|----|------|------|
| CGS | 0 次（已加载完）| 4 次（校区→学段→年级→科目） |
| CCS | 0 次 | 5 次 |
| 任何类型 | 0 次 | N 次（N = 级联深度）|

---

## 附录 · 不动文件清单（plan 期间禁止编辑）

- 校区型：`src/components/faculty/CampusMultiPickerDialog.vue`
- 5 个 `*-picker-dialog.{model,util}.ts`（保留 `validateScopes / hasDuplicateScopes / canRemoveRow / initScopes`）
- 5 个 `*.scss`
- 注册表 / 列表聚合 / session
- 页面 `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`
- mocks / service
- 其它 picker-dialog.vue（任务并行，不交叉）

---

## 附录 · 5 个 cascader 的 lazyLoad 链路速查

| Type | level 0 | level 1 | level 2 | level 3 | level 4 |
|------|---------|---------|---------|---------|---------|
| CG (3 段) | `getSchoolCampusList` | `getSchoolStageList` | `getSchoolGradeListByCurrentYear` | - | - |
| CGS (4 段) | `getSchoolCampusList` | `getSchoolStageList` | `getSchoolGradeListByCurrentYear` | `schoolGradeSubjectsList({ baseGradeId, stageId })` | - |
| CC (4 段) | `getSchoolCampusList` | `getSchoolStageList` | `getSchoolGradeListByCurrentYear` | `getSchoolClassList` | - |
| CCS (5 段) | `getSchoolCampusList` | `getSchoolStageList` | `getSchoolGradeListByCurrentYear` | `getSchoolClassList` | `schoolGradeSubjectsList({ baseGradeId, stageId })` |
| CSE (3 段，跳年级) | `getSchoolCampusList` | `getSchoolStageList` | `queryAllowSubjectsList({ stageId })` 主路径 + `schoolGradeSubjectsList` fallback | - | - |

---

## 附录 · 验收清单（spec §8 对照）

- [ ] 5 个 cascader.vue 不再接收 `tree` prop；接收 `schoolId`
- [ ] 5 个 cascader.vue 用 `lazy: true` + `async lazyLoad`
- [ ] 5 个 cascader.util.ts 提供 `pathToIds` 和 `idsToDTO`；删除 `idsToPath`
- [ ] 5 个 cascader.model.ts 的 Props 字段 `tree → schoolId`
- [ ] 5 个 picker-dialog.vue 删 `tree / treeLoading / currentYearId` 三个状态
- [ ] 5 个 picker-dialog.vue 的 watch modelValue 只保留 initScopes 守门
- [ ] 5 个 picker-dialog.vue 给 cascader 的 props `:tree` 改为 `:school-id`
- [ ] 校区型弹框行为不变（回归门禁）
- [ ] `pnpm eslint` 12 个目标文件 0 error
- [ ] dev smoke：打开 CGS 弹窗 → 0 次服务调用；点开选择框 → 4 次