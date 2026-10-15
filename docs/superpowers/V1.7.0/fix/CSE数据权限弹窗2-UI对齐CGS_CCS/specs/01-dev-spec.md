# CSE 数据权限弹窗 2 · UI 对齐 CGS / CCS · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**类型：** fix  
**档位：** 标准  
**版本：** V1.7.0  
**日期：** 2026-09-23  
**状态：** 待 P2 确认

---

## 1. 改造范围（仅 1 个文件）

`E:\code\two\frontend\src\components\faculty\data-permission\campus-stage-subject\campus-stage-subject-picker-dialog\campus-stage-subject-picker-dialog.vue`

> 单文件改动；其它 4 个 picker-dialog / cascader.vue / util.ts / model.ts / scss 全部不动。

---

## 2. 模板结构（严格对齐 CGS / CCS）

```vue
<template>
  <ElDialog
    :model-value="modelValue"
    width="640px"
    :close-on-click-modal="false"
    class="campus-stage-subject-picker-dialog"
    @update:model-value="emit('update:modelValue', $event)"
    @closed="emit('closed')"
  >
    <template #title>
      <span>【校区+学段+科目】权限</span>
    </template>

    <div v-loading="treeLoading" class="campus-stage-subject-picker-dialog__body">
      <div class="campus-stage-subject-picker-dialog__head">
        <div class="campus-stage-subject-picker-dialog__label">
          <span class="campus-stage-subject-picker-dialog__required">*</span>
          <span>请添加校区学段科目（必填）</span>
        </div>
        <ElButton
          class="campus-stage-subject-picker-dialog__add"
          round
          size="small"
          @click="addRow"
        >
          <ElIcon><IconEpPlus /></ElIcon>
        </ElButton>
      </div>

      <div class="campus-stage-subject-picker-dialog__list">
        <div
          v-for="(row, idx) in rows"
          :key="idx"
          class="campus-stage-subject-picker-dialog__row"
        >
          <campus-stage-subject-cascader
            :model-value="row"
            :tree="tree"
            @update:model-value="onRowChange(idx, $event)"
          />
          <ElButton
            v-if="canRemoveRow(rows.length)"
            class="campus-stage-subject-picker-dialog__remove"
            round
            size="small"
            @click="removeRow(idx)"
          >
            <ElIcon><IconEpMinus /></ElIcon>
          </ElButton>
        </div>
      </div>
    </div>

    <template #footer>
      <ElButton round @click="emit('update:modelValue', false)">取消</ElButton>
      <ElButton v-if="showPrevStep" round @click="emit('prevStep')">上一步</ElButton>
      <ElButton
        round
        type="primary"
        :loading="submitLoading"
        :disabled="submitLoading"
        @click="onSubmit"
      >确定</ElButton>
    </template>
  </ElDialog>
</template>
```

### 关键模板要点

| 区域 | 要求 |
|------|------|
| `__head` | flex 容器（scss 已预置 `display:flex; align-items:center; justify-content:space-between`），label 在左、+ 在右 |
| `+` 按钮 | `round size="small"` + `<ElIcon><IconEpPlus /></ElIcon>`；class = `campus-stage-subject-picker-dialog__add` |
| `-` 按钮 | `round size="small"` + `<ElIcon><IconEpMinus /></ElIcon>`；class = `campus-stage-subject-picker-dialog__remove`；`v-if="canRemoveRow(rows.length)"`（不是 `:disabled`） |
| 行内组件 | `<campus-stage-subject-cascader>`（kebab-case；参考 CGS / CCS 用法） |
| footer | 取消 / 上一步（v-if showPrevStep）/ 确定 |

---

## 3. Script 结构（对齐 CGS）

```ts
<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { ref, watch } from 'vue'
import { service } from '@/service'
import type { CascaderNode } from '../campus-stage-subject-cascader/campus-stage-subject-cascader.util'
import type { ScopeRow } from './campus-stage-subject-picker-dialog.util'
import type { SchoolFacultyPermissionScopeDTO } from '@/utils/faculty-data-permission'
import CampusStageSubjectCascader from '../campus-stage-subject-cascader/campus-stage-subject-cascader.vue'
import { canRemoveRow, initScopes, validateScopes } from './campus-stage-subject-picker-dialog.util'

const props = withDefaults(defineProps<{
  modelValue: boolean
  showPrevStep: boolean
  defaultScopes: SchoolFacultyPermissionScopeDTO[]
  skipResetOnOpen?: boolean
  schoolId: string
}>(), { skipResetOnOpen: false })

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'prevStep': []
  'submit': [scopes: SchoolFacultyPermissionScopeDTO[]]
  'closed': []
}>()

const rows = ref<ScopeRow[]>([null])
const tree = ref<CascaderNode[]>([])
const treeLoading = ref(false)
const submitLoading = ref(false)

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    treeLoading.value = true
    try {
      // 1) 校区列表
      const campuses: any[] = (await service.baseData.getSchoolCampusList({
        schoolId: props.schoolId,
        state: 1,
      })) ?? []

      // 2) 校区 → 学段（每校区并行，单一失败不影响其他）
      const stageResults = await Promise.allSettled(
        campuses.map(c => service.baseData.getSchoolStageList({ schoolId: props.schoolId, campusId: c.id })),
      )
      const stageLists: any[][] = stageResults.map(r => (r.status === 'fulfilled' ? (r.value ?? []) : []))

      // 3) 学段 → 科目（每学段并行）
      //    路径 1: queryAllowSubjectsList({ stageId }) — 按 stageId 过滤（推荐）
      //    路径 2: schoolGradeSubjectsList({ baseGradeId: '', stageId }) — fallback
      const subjectResults = await Promise.all(
        stageLists.map((stages, ci) => Promise.allSettled(
          stages.map((s: any) => loadStageSubjects(String(s.id))),
        )),
      )

      // 组装 CascaderNode[]（id = 原始 id，不拼前缀；cascader.util 据此还原）
      tree.value = campuses.map((c, ci) => ({
        id: String(c.id),
        name: c.name,
        children: (stageLists[ci] ?? []).map((s: any, si: number) => ({
          id: String(s.id),
          name: s.typeStr ?? s.name,
          children: (subjectResults[ci]?.[si]?.status === 'fulfilled' ? (subjectResults[ci]?.[si]?.value ?? []) : []),
        })),
      }))

      rows.value = initScopes(props.defaultScopes ?? [])
    }
    finally {
      treeLoading.value = false
    }
  },
)

async function loadStageSubjects(stageId: string): Promise<CascaderNode[]> {
  try {
    const list: any[] = (await service.school.queryAllowSubjectsList({ stageId })) ?? []
    if (list.length) {
      return list.map((sub: any) => ({
        id: String(sub.id),
        name: sub.name ?? sub.subjectName ?? '',
      }))
    }
    // 主路径空数组：尝试 fallback
    const fb: any[] = (await service.school.schoolGradeSubjectsList({ baseGradeId: '', stageId })) ?? []
    return fb.map((sub: any) => ({
      id: String(sub.id),
      name: sub.name ?? sub.subjectName ?? '',
    }))
  }
  catch {
    try {
      const fb: any[] = (await service.school.schoolGradeSubjectsList({ baseGradeId: '', stageId })) ?? []
      return fb.map((sub: any) => ({
        id: String(sub.id),
        name: sub.name ?? sub.subjectName ?? '',
      }))
    }
    catch {
      return []
    }
  }
}

function addRow() {
  rows.value.push(null)
}

function removeRow(idx: number) {
  rows.value.splice(idx, 1)
}

function onRowChange(idx: number, value: SchoolFacultyPermissionScopeDTO | null) {
  rows.value[idx] = value
}

function onSubmit() {
  const result = validateScopes(rows.value)
  if (!result.ok) {
    ElMessage.warning(result.message!)
    return
  }
  submitLoading.value = true
  emit('submit', result.scopes!)
  setTimeout(() => {
    submitLoading.value = false
  }, 300)
}
</script>

<style lang="scss" scoped src="./campus-stage-subject-picker-dialog.scss" />
```

### 关键 Script 要点

| 决策 | 理由 |
|------|------|
| rows 操作：直接 mutate（`push / splice / [i]=`） | 与 CGS / CCS 风格一致；spec 不强制 |
| service 主路径 `queryAllowSubjectsList({ stageId })` | 后端 `/backstage/subject/queryAllowSubjectsList` 真正按 stageId 过滤（CSE 业务需求） |
| service fallback `schoolGradeSubjectsList({ baseGradeId: '', stageId })` | mock / 旧后端兜底 |
| 三层并行：`Promise.allSettled` 包校区层，`Promise.all(Promise.allSettled)` 包学段层 | 与 CGS / CCS 一致；单条失败不阻断 |
| 树节点 id 用原始 `String(c.id) / String(s.id) / String(sub.id)` | cascader.util.ts 通过 `tree.find(n => n.id === campusId/stageId/subjectId)` 还原；必须原始 id |
| `loadStageSubjects(stageId)` 用 try/catch 兜底 | 与 CGS 同形；spec §5「风险与回退」 |
| `subjectResults[ci]?.[si]?.status === 'fulfilled'` 兜底 | 处理 Promise.allSettled 状态 |

---

## 4. service 接口契约（按 `E:\code\two\frontend\src\service\school.ts` 现签名）

| 接口 | 路径 | 参数 | 返回 | 用途 |
|------|------|------|------|------|
| `service.baseData.getSchoolCampusList` | `/backstage/schoolBase/schoolBaseCampusList` | `{ schoolId, state: 1 }` | `Array<{ id, name, ... }>` | 第一层校区 |
| `service.baseData.getSchoolStageList` | `/backstage/schoolBase/schoolBaseStageList` | `{ schoolId, campusId }` | `Array<{ id, name/typeStr, ... }>` | 第二层学段 |
| `service.school.queryAllowSubjectsList` ⭐ 主路径 | `/backstage/subject/queryAllowSubjectsList` | `{ stageId }` | `Array<{ id, name/subjectName, ... }>` | **按 stageId 过滤的科目** |
| `service.school.schoolGradeSubjectsList` ⭐ fallback | `/backstage/schoolConfig/schoolGradeSubjectsList` | `{ baseGradeId, stageId }` | `Array<{ id, name/subjectName, ... }>` | CSE 路径下 `baseGradeId` 传空字符串 |

> **不要用** `service.school.schoolSubjectsList` —— 后端 `/backstage/schoolConfig/schoolSubjectsList` 返回「学校绑定的科目」全集，**stageId 参数无效**。

---

## 5. 不动项（严格）

| 层 | 不动 |
|----|------|
| 校区型 | `CampusMultiPickerDialog.vue` |
| 行内级联 | `campus-stage-subject-cascader/{vue,model.ts,util.ts,scss}` |
| 契约 / 校验 / 样式 | `campus-stage-subject-picker-dialog.{model.ts, util.ts, scss}` |
| 其它 picker-dialog | `campus-grade / campus-grade-subject / campus-class / campus-class-subject` 共 4 个 .vue |
| 注册表 / 列表聚合 | `registry.ts / list-cells.ts / types.ts` |
| 页面 | `faculty-position.vue` |
| mocks | `src/mocks/faculty-position/*` |
| service | `school.ts / baseData.ts / operate.ts`（仅调用，不改） |

---

## 6. 验收（写入 archive 前必勾）

- [ ] `+` 按钮位于 `__head` 末尾（label 右移），`round size="small"` + `<ElIcon><IconEpPlus /></ElIcon>`
- [ ] `-` 按钮在每行尾部，`round size="small"` + `<ElIcon><IconEpMinus /></ElIcon>`
- [ ] `-` 按钮用 `v-if="canRemoveRow(rows.length)"`（不是 `:disabled`）；行数 = 1 时隐藏
- [ ] 模板不再含 `+ 添加一行` / `删除` 文字按钮
- [ ] script 不再用 `schoolSubjectsList`
- [ ] script 用 `queryAllowSubjectsList({ stageId })` 主路径 + `schoolGradeSubjectsList({ baseGradeId: '', stageId })` fallback
- [ ] rows 操作：直接 mutate（与 CGS 风格一致）
- [ ] `pnpm eslint <file>` 0 error
- [ ] 校区型 + 其它 4 个 picker-dialog 行为不变（回归门禁）

---

## 7. 风险与回退

| 风险 | 缓解 |
|------|------|
| `queryAllowSubjectsList` 后端返回非数组或失败 | `loadStageSubjects` 双层 try/catch 兜底；fallback `schoolGradeSubjectsList`；最终回退 `[]` |
| mock 链路下 `queryAllowSubjectsList` 不存在 | fallback 触发；不会阻断 |
| 行内级联组件名大小写 | 模板用 kebab-case `campus-stage-subject-cascader`（与上一轮 plan §偏离一致） |

---

## 8. 还原度自检

不适用。本次为 UI 行为修复（fix），无 Figma / 无像素对照需求；与 CGS / CCS 观感对齐即可。