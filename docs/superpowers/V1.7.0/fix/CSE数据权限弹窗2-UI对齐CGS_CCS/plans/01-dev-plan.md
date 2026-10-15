# CSE 数据权限弹窗 2 · UI 对齐 CGS / CCS · 开发计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**类型：** fix  
**档位：** 标准  
**版本：** V1.7.0  
**日期：** 2026-09-23  
**状态：** 待 P3 确认

---

## Skill 路由结果（`router.mjs --annotate` · 2026-09-23）

- **CLI 真实输出**：所有 step 均为 `needsSkill: false`（`.agents/routing/SKILL_ROUTING.md` 路由图中无 vue-skills / element-plus / 业务组件相关 skill）
- **人工复核**：与上一轮一致——Vue 3 + Element Plus 行内级联骨架无路由图匹配 skill
- **决策**：不引入路由图中不存在的 skill；模板与 script 沿用上一轮已交付的 CGS / CCS picker-dialog 作为对照（按 spec §2 / §3 改造）

---

## Task 1：CSE picker-dialog 改造（单文件，4 项一起修）

- 文件：`E:\code\two\frontend\src\components\faculty\data-permission\campus-stage-subject\campus-stage-subject-picker-dialog\campus-stage-subject-picker-dialog.vue`

### 子任务 1.1 — 模板对齐 CGS / CCS

按 spec §2 重写 `<template>`：

1. 删除 `__list` 容器底部那个 `+ 添加一行` 文字按钮（第 40-45 行）
2. `__head` 末尾加 `+` 按钮（`round size="small"` + `<ElIcon><IconEpPlus /></ElIcon>` + `class="campus-stage-subject-picker-dialog__add"`）
3. 每行 `-` 按钮：
   - `round size="small"` + `<ElIcon><IconEpMinus /></ElIcon>`
   - class = `campus-stage-subject-picker-dialog__remove`
   - `v-if="canRemoveRow(rows.length)"`（删掉 `:disabled`）
4. 行内级联组件：保持 `<CampusStageSubjectCascader>`（与上一轮 CSE 写法一致，模板不强制 kebab；但 spec 已建议 `campus-stage-subject-cascader` kebab，**按 spec 走**）

### 子任务 1.2 — Script 重构

按 spec §3 重写 `<script lang="ts" setup>`：

1. 删除 `loadStageSubjects` 中 `service.school.schoolSubjectsList` 调用
2. `loadStageSubjects(stageId)` 改用：
   - 主路径 `service.school.queryAllowSubjectsList({ stageId })`
   - fallback `service.school.schoolGradeSubjectsList({ baseGradeId: '', stageId })`
   - 双层 try/catch 兜底返回 `[]`
3. `rows` 操作改回 mutate（`rows.value.push / splice / [idx] = value`），与 CGS 风格一致
4. `loadTree()` 改用三层并行 `Promise.allSettled` 模式（与 CGS 一致）；不再 `for await` 串行
5. `tree.value` 组装时 id 用原始 id（`String(c.id) / String(s.id) / String(sub.id)`）

### 子任务 1.3 — 校验

- `pnpm eslint E:\code\two\frontend\src\components\faculty\data-permission\campus-stage-subject\campus-stage-subject-picker-dialog\campus-stage-subject-picker-dialog.vue` 0 error
- grep 验证模板不含 `+ 添加一行` / `删除` 文字按钮
- grep 验证 script 不含 `schoolSubjectsList`

---

## Task 2：5 picker-dialog 一致性 + 校区型回归 + ESLint 收尾

### 2.1 ESLint 全量

```bash
cd E:\code\two\frontend
pnpm eslint src/components/faculty/CampusMultiPickerDialog.vue src/components/faculty/data-permission/campus-grade/campus-grade-picker-dialog/campus-grade-picker-dialog.vue src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-picker-dialog/campus-grade-subject-picker-dialog.vue src/components/faculty/data-permission/campus-class/campus-class-picker-dialog/campus-class-picker-dialog.vue src/components/faculty/data-permission/campus-class-subject/campus-class-subject-picker-dialog/campus-class-subject-picker-dialog.vue src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-picker-dialog/campus-stage-subject-picker-dialog.vue
```

- 期望：6 个 vue 文件 0 error

### 2.2 观感一致性自检（与 CGS / CCS 模板并排 diff）

- `__head` 容器布局（label + + 按钮左右）
- `+` 按钮形态（`round size="small"` + `<ElIcon><IconEpPlus />`）
- `-` 按钮形态 + `v-if` 隐藏
- footer 三按钮（取消 / 上一步 / 确定）
- 行内级联组件写法（kebab-case）
- `rows` 操作风格（mutate）

### 2.3 校区型回归

- 读 `faculty-position.vue` 确认校区型绑定未变
- 校区型 `CampusMultiPickerDialog.vue` 未改（`git diff --stat` 确认）

### 2.4 CSE dev smoke（可选 · 用户决定）

- 进入 `http://localhost:5173/app/basic-data/school/school/faculty/faculty-position?item=...`
- 分配岗位 → 选岗位 + 选「校区+学段+科目」→ 下一步
- 期望：
  - 弹窗标题 `【校区+学段+科目】权限`
  - label 右移位置有 `+` 圆按钮
  - 默认 1 空行；行数 = 1 时无 `-` 按钮
  - 点开选择框：3 列级联面板（校区→学段→科目）
  - 第 3 列（科目）只显示"该学段下的科目"（不是全校所有科目）
  - 选完后能正常提交；判重归入「科目已存在」

---

## 附录 · 关键 service 接口签名（来自 `src/service/school.ts`）

```ts
// 主路径（按 stageId 过滤）
export const queryAllowSubjectsList = defineService<{ stageId: string }, Record<string, any>[]>(
  async (params, config) => {
    return request.get('/backstage/subject/queryAllowSubjectsList', { params, ...config })
  },
)

// fallback（按 baseGradeId + stageId，CSE 路径 baseGradeId 传空字符串）
export const schoolGradeSubjectsList = defineService<{ baseGradeId: string, stageId: string }, Record<string, any>[]>(
  async (params, config) => {
    return request.post('/backstage/schoolConfig/schoolGradeSubjectsList', params, config)
  },
)
```

> 不要用 `schoolSubjectsList`（后端 `/backstage/schoolConfig/schoolSubjectsList` 是学校绑定的科目全集，stageId 被忽略）。

---

## 附录 · 不动文件清单（plan 期间禁止编辑）

- 校区型：`src/components/faculty/CampusMultiPickerDialog.vue`
- 6 个级联组件：`src/components/faculty/data-permission/*/xxx-cascader.vue`
- 5 个 model：`src/components/faculty/data-permission/*/xxx-picker-dialog.model.ts`
- 5 个 util：`src/components/faculty/data-permission/*/xxx-picker-dialog.util.ts`
- 5 个 scss：`src/components/faculty/data-permission/*/xxx-picker-dialog.scss`
- 注册表 / 列表聚合：`src/components/faculty/data-permission/{registry,list-cells,types}.ts`
- 页面：`src/pages/app/basic-data/school/school/faculty/faculty-position.vue`
- mocks：`src/mocks/faculty-position/*`
- service：`src/service/school.ts`、`src/service/baseData.ts`、`src/service/operate.ts`
- 其它 4 个 picker-dialog.vue（campus-grade / campus-grade-subject / campus-class / campus-class-subject）