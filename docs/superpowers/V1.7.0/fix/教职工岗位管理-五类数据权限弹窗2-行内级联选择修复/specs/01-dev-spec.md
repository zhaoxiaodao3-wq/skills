# 教职工岗位管理 · 五类数据权限弹窗 2 · 行内级联选择修复 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**类型：** fix  
**档位：** 标准  
**版本：** V1.7.0  
**日期：** 2026-09-23  
**状态：** 待 P2 确认

---

## 1. 修复范围（5 个 picker-dialog）

| # | 类型（枚举） | 路径（`E:\code\two\frontend\src\components\faculty\data-permission\`） | 级联深度 |
|---|-------------|---------------------------------------------------|----------|
| 1 | 校区+年级（campus_grade） | `campus-grade/campus-grade-picker-dialog/campus-grade-picker-dialog.vue` | 校区→学段→**年级**（3 段） |
| 2 | 校区+年级+科目（campus_grade_subject） | `campus-grade-subject/campus-grade-subject-picker-dialog/campus-grade-subject-picker-dialog.vue` | 校区→学段→年级→**科目**（4 段） |
| 3 | 校区+班级（campus_class） | `campus-class/campus-class-picker-dialog/campus-class-picker-dialog.vue` | 校区→学段→年级→**班级**（4 段） |
| 4 | 校区+班级+科目（campus_class_subject） | `campus-class-subject/campus-class-subject-picker-dialog/campus-class-subject-picker-dialog.vue` | 校区→学段→年级→班级→**科目**（5 段） |
| 5 | 校区+学段+科目（campus_stage_subject） | `campus-stage-subject/campus-stage-subject-picker-dialog/campus-stage-subject-picker-dialog.vue` | 校区→学段→**科目**（3 段，**直挂学段**） |

> 注意：CSE 跳过年级，科目直挂学段下；与「校区+学段+科目」原需求一致（叶子=科目）。

---

## 2. 改造后应有的弹窗结构（统一骨架）

### 2.1 模板（伪）

```vue
<template>
  <ElDialog
    :model-value="modelValue"
    width="640px"
    :close-on-click-modal="false"
    :class="`${DIALOG_CLASS}`"
    @update:model-value="emit('update:modelValue', $event)"
    @closed="emit('closed')"
  >
    <template #title>
      <span>【{TITLE}】权限</span>
    </template>

    <div v-loading="treeLoading" :class="`${DIALOG_CLASS}__body`">
      <div :class="`${DIALOG_CLASS}__head`">
        <div :class="`${DIALOG_CLASS}__label`">
          <span :class="`${DIALOG_CLASS}__required`">*</span>
          <span>请添加 {LABEL}（必填）</span>
        </div>
        <ElButton
          :class="`${DIALOG_CLASS}__add`"
          round size="small"
          @click="addRow"
        >
          <ElIcon><IconEpPlus /></ElIcon>
        </ElButton>
      </div>

      <div :class="`${DIALOG_CLASS}__list`">
        <div
          v-for="(row, idx) in rows"
          :key="idx"
          :class="`${DIALOG_CLASS}__row`"
        >
          <XxxCascader
            :model-value="row"
            :tree="tree"
            @update:model-value="onRowChange(idx, $event)"
          />
          <ElButton
            v-if="canRemoveRow(rows.length)"
            :class="`${DIALOG_CLASS}__remove`"
            round size="small"
            @click="removeRow(idx)"
          >
            <ElIcon><IconEpMinus /></ElIcon>
          </ElButton>
        </div>
      </div>
    </div>

    <template #footer>
      <ElButton round @click="emit('update:modelValue', false)">
        取消
      </ElButton>
      <ElButton v-if="showPrevStep" round @click="emit('prevStep')">
        上一步
      </ElButton>
      <ElButton
        round type="primary"
        :loading="submitLoading"
        :disabled="submitLoading"
        @click="onSubmit"
      >
        确定
      </ElButton>
    </template>
  </ElDialog>
</template>
```

### 2.2 关键 Script 行为

```ts
const rows = ref<ScopeRow[]>([null])  // 默认 1 空行
const tree = ref<CascaderNode[]>([])
const treeLoading = ref(false)
const submitLoading = ref(false)
const currentYearId = ref<string>('')

watch(() => props.modelValue, async (open) => {
  if (!open) return
  // 1) 加载当前学年（仅需要年级时拉一次）
  // 2) 并行拉校区列表
  // 3) 对每个校区并行拉学段
  // 4) 对每个学段并行拉年级 / 或直挂科目 / 或拉班级
  // 5) 对每个年级拉科目（如 CGS/CCS/CSE）
  // 6) 构造 CascaderNode[] 完整树
  // 7) 跳过重置？ → 直接 emit('closed') 由上层管；不跳走就 init rows = initScopes(defaultScopes)
})
```

### 2.3 树构造表（按枚举）

| Type | 第一层 | 第二层 | 第三层 | 第四层 | 第五层 | service 列表 |
|------|--------|--------|--------|--------|--------|--------------|
| CG | 校区 | 学段 | 年级 | — | — | campus / stage / gradeByCurrentYear |
| CGS | 校区 | 学段 | 年级 | 科目 | — | campus / stage / gradeByCurrentYear / gradeSubjectsList |
| CC | 校区 | 学段 | 年级 | 班级 | — | campus / stage / gradeByCurrentYear / getSchoolClassList |
| CCS | 校区 | 学段 | 年级 | 班级 | 科目 | campus / stage / gradeByCurrentYear / getSchoolClassList / schoolGradeSubjectsList |
| CSE | 校区 | 学段 | 科目 | — | — | campus / stage / schoolSubjectsList（直挂学段） |

> CG/CGS/CC/CCS 的学段→年级链路都走 `service.school.getSchoolGradeListByCurrentYear({ schoolId, campusId, stageId, yearId })`。  
> CSE 的学段→科目链路走 `service.school.schoolSubjectsList({ schoolId })` 或 `schoolGradeSubjectsList({ baseGradeId: '', stageId })`（沿用当前已被改乱前的实现细节，spec 不锁死参数以保持 plan 灵活）。

### 2.4 行为契约

| 行为 | 实现 |
|------|------|
| 打开弹窗 | `rows = initScopes(props.defaultScopes)`：defaultScopes 非空则回填；否则 `[null]` |
| 加一行 | `addRow()`：在 rows 末尾 push 一个 `null` |
| 删一行 | `removeRow(idx)`：`rows.splice(idx, 1)`；至少保留 1 行（`canRemoveRow(rows.length)` 决定是否显示删除按钮） |
| 行内级联变化 | `onRowChange(idx, scope)`：`rows[idx] = scope` |
| 确定 | `onSubmit()`：`validateScopes(rows)` → 失败 toast 文案（来自 util）/ 不关弹框；成功 `submitLoading=true` → `emit('submit', scopes)` → 300ms 后 `submitLoading=false` |
| 取消 | `emit('update:modelValue', false)` |
| 上一步 | `emit('prevStep')`（仅 `showPrevStep=true` 显示） |
| 关闭（closed） | `emit('closed')`；由上层 page 决定是否重置 `skipResetByKind` |

### 2.5 校验文案（按各自 util）

| Type | 空行校验 | 全段重复校验 |
|------|----------|--------------|
| CG | 请完整选择校区年级 | 年级已存在 |
| CGS | 请完整选择校区年级科目 | 科目已存在 |
| CC | 请完整选择校区班级 | 班级已存在 |
| CCS | 请完整选择校区班级科目 | 科目已存在 |
| CSE | 请完整选择校区学段科目 | 科目已存在 |

> 这些文案已在各自 `*-picker-dialog.util.ts` 中实现（沿用不动）。vue 不硬编码，统一走 `validateScopes(rows).message`。

---

## 3. 不动项（严格）

| 层 | 不动 |
|----|------|
| 校区型弹窗 | `CampusMultiPickerDialog.vue`（用户确认正确） |
| 行内级联组件 | 6 个 `*-cascader.vue`（已是 ElCascader + 接收 props.tree，正确） |
| 契约 | 5 个 `*-picker-dialog.model.ts`（Props/Emits 已是页面期望） |
| 校验 | 5 个 `*-picker-dialog.util.ts`（`validateScopes / hasDuplicateScopes / canRemoveRow / initScopes` 已是 spec 行为） |
| 样式骨架 | 5 个 `*-picker-dialog.scss`（已预置 `__head/__list/__row/__add/__remove`） |
| 注册表 | `registry.ts / types.ts / list-cells.ts`（不涉及本期改造） |
| 页面 | `faculty-position.vue`（已正确接入 5 个 picker-dialog） |
| mocks | `src/mocks/faculty-position/*`（本期 UI 层修复，不动 mock 数据） |

---

## 4. 验收（写入 archive 前必勾）

- [ ] 5 个 picker-dialog 的 `<template>` 不再含 `ElTree` / `show-checkbox` / `treeRef` / `handleLoadNode`
- [ ] 5 个 picker-dialog 的 `<script>` 维护 `rows: ScopeRow[]`，无 `getCheckedNodes` / `applyDefaultChecked` 一次性提交逻辑
- [ ] 5 个 picker-dialog 打开时 `rows = initScopes(defaultScopes)`；defaultScopes 空 → `[null]`；非空 → 回填
- [ ] `+` 按钮增行；行数 > 1 时每行显示删除按钮；行数 = 1 时隐藏删除
- [ ] 5 个 picker-dialog 内部树加载完成后再 `initRows`，避免空行级联展示空
- [ ] 行内级联可选通至叶子（CG→年级；CGS→科目；CC→班级；CCS→科目；CSE→科目）
- [ ] 空行校验 → 弹对应文案（按上表）
- [ ] 段全同判重 → 弹对应文案（按上表）
- [ ] 【取消】只关本弹窗
- [ ] 【上一步】仅 `showPrevStep=true` 时显示；emit `prevStep`
- [ ] 【确定】成功 / 失败行为：成功 emit `submit(scopes)`（外层决定后续）；失败 toast 不关窗
- [ ] 校区型弹窗 `CampusMultiPickerDialog.vue` 行为不变（回归门禁）
- [ ] 5 个 picker-dialog.vue + 5 个 cascader.vue ESLint 0 error

---

## 5. 风险与回退

| 风险 | 缓解 |
|------|------|
| 一次性加载整棵树慢（科目/班级多时） | Plan 阶段标注：tree 加载失败时 `treeLoading=false` 仍允许用户点行内选择（空树提示「暂无可选项」）；且每个 service 调用用 `Promise.allSettled`，单条失败不影响其他 |
| 误改 cascader.vue | Plan 阶段明确不读不写 cascader.vue；若发现其不符合预期，先停下报用户决策 |
| 校区型回归 | Plan Task 1 = 跑校区型弹窗烟雾验证（lint + 现有逻辑能力未变） |

---

## 6. 还原度自检

不适用：本次为 UI 行为修复（fix），无 Figma / 无像素对照需求；用户截图只用于确认行内级联 + 多行 +/- 行为骨架。