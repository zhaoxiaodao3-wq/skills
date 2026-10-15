# 分析弹窗学科过滤 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 自主分析 / 课堂实录两页调用 `schoolGradeSubjectsList` 时带上与课程页一致的固定 `subjectNames`，其它入口不变。

**Architecture:** 抽出共享常量 `SUBJECT_NAMES`；两个弹窗各加默认关闭的 prop，为 true 时才在学科列表请求中传 `subjectNames`；仅两页打开开关。

**Tech Stack:** Vue 3 + TypeScript（Options 无关，`defineProps` 对象写法与现有一致）

---

## 背景事实（实现者必读）

| 事实 | 位置 |
|------|------|
| 课程页固定 9 科 | `src/pages/course/components/CreateCourseDialog.vue:644-669` |
| 教学诊断弹窗学科请求 | `src/pages/school/components/CreateAITeachingDiagnosisDialog.vue:822`（`loadSubjectOptionsEntity`，仅 `useEntityBasicData=true` 时走到） |
| 课堂实录弹窗学科请求 | `src/pages/school/components/CreateAIClassroomRecordDialog.vue:338`（`loadSubjectOptions`） |
| 自主分析页接线 | `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue:220-221`（已传 `use-entity-basic-data`） |
| 课堂实录页接线 | `src/pages/school/analysis-management/ai-classroom-record-analysis/index.vue:106` |
| service 类型已支持 | `src/service/schoolNew.ts:155`（`subjectNames?: string[]`） |
| 常量目录惯例 | `src/constant/`（`common.ts` + `index.ts` 导出） |
| 其它复用入口 | `ai-csms-teaching-analysis`、`ai-teaching-diagnosis-analysis` **未**传 `use-entity-basic-data`，当前不会打到该接口；prop 默认 false 保证将来也不误伤 |

---

### Task 1: 共享常量 SUBJECT_NAMES

**Files:**
- Modify: `src/constant/common.ts`
- Modify: `src/constant/index.ts`
- Modify: `src/pages/course/components/CreateCourseDialog.vue:643-654`

**Step 1: 在 `src/constant/common.ts` 末尾追加常量**

```ts
/** schoolGradeSubjectsList 固定入参：限定可选学科范围（与课程列表页一致） */
export const SUBJECT_NAMES = [
  '语文',
  '数学',
  '英语',
  '物理',
  '化学',
  '生物',
  '地理',
  '历史',
  '道德与法治'
] as const
```

**Step 2: `src/constant/index.ts` 增加导出**

```ts
export { FILETYPES, SUBJECT_NAMES } from './common'
```

（保持 `export * from './quota'` 不变。）

**Step 3: `CreateCourseDialog.vue` 改为引用常量**

删除本地 `const SUBJECT_NAMES = [...]`（约 643-654 行），改为：

```ts
import { SUBJECT_NAMES } from '@/constant'
```

调用处 `subjectNames: SUBJECT_NAMES` 保持不动。类型上 `as const` 为只读元组，传入 `string[]` 时用 `[...SUBJECT_NAMES]` 或放宽 service 入参为 `readonly string[]`——**推荐** service 侧改为 `subjectNames?: readonly string[]`（见 Task 4），调用处直接 `subjectNames: SUBJECT_NAMES` 即可。

**Step 4: 自检**

- 课程页请求体仍含 9 科 `subjectNames`，顺序与字面量与改前一致。

---

### Task 2: CreateAIClassroomRecordDialog · prop 门控

**Files:**
- Modify: `src/pages/school/components/CreateAIClassroomRecordDialog.vue`

**Step 1: 增加 prop（在 `defineProps`，约 139 行）**

```ts
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  /**
   * 是否传入固定 subjectNames 过滤学科范围（与课程列表页一致）。
   * 默认 false，保持其它入口不传该参数。
   */
  filterSubjectNames: {
    type: Boolean,
    default: false
  }
})
```

**Step 2: `loadSubjectOptions`（约 331-351 行）按 prop 传参**

```ts
import { SUBJECT_NAMES } from '@/constant'

const res = await service.schoolNew.schoolGradeSubjectsList({
  baseGradeId,
  stageId,
  ...(props.filterSubjectNames ? { subjectNames: SUBJECT_NAMES } : {})
})
```

**Step 3: 自检**

- `filterSubjectNames` 默认 false 时请求体与改前一致（无 `subjectNames` 键）。

---

### Task 3: CreateAITeachingDiagnosisDialog · prop 门控

**Files:**
- Modify: `src/pages/school/components/CreateAITeachingDiagnosisDialog.vue`

**Step 1: 增加 prop（`defineProps`，约 337-368 行）**

```ts
/**
 * 是否传入固定 subjectNames 过滤学科范围（与课程列表页一致）。
 * 默认 false，保持其它入口不传该参数。
 */
filterSubjectNames: {
  type: Boolean,
  default: false
}
```

**Step 2: `loadSubjectOptionsEntity`（约 816-833 行）按 prop 传参**

```ts
import { SUBJECT_NAMES } from '@/constant'

const res = await service.schoolNew.schoolGradeSubjectsList({
  baseGradeId,
  stageId,
  ...(props.filterSubjectNames ? { subjectNames: SUBJECT_NAMES } : {})
})
```

**Step 3: 自检**

- `useEntityBasicData=false` 的入口不走此函数；`filterSubjectNames` 默认 false 时行为与改前一致。

---

### Task 4: 两页接线 + service 注释

**Files:**
- Modify: `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue:220-221`
- Modify: `src/pages/school/analysis-management/ai-classroom-record-analysis/index.vue:106`
- Modify: `src/service/schoolNew.ts:153-155`
- （若 Task 1 选择放宽类型）Modify: `src/service/schoolNew.ts:155` 入参类型

**Step 1: 自主分析页打开开关**

```vue
<CreateAITeachingDiagnosisDialog v-model:visible="createDiagnosisDialogVisible" :show-tips="true"
  :use-translated-video="true" use-entity-basic-data filter-subject-names
  @submit="handleDiagnosisSubmit" />
```

**Step 2: 课堂实录页打开开关**

```vue
<CreateAIClassroomRecordDialog v-model:visible="createRecordDialogVisible" filter-subject-names
  @submit="handleDiagnosisSubmit" />
```

**Step 3: 更新 `schoolNew.ts` 注释**

```ts
// 查询学校年级绑定的科目 /backstage/schoolConfig/schoolGradeSubjectsList
// subjectNames 可选：按学科名过滤返回范围；是否传入由调用方决定（课程页 / 自主分析 / 课堂实录传固定 9 科）
export const schoolGradeSubjectsList = defineService<{ baseGradeId: string, stageId: string, subjectNames?: readonly string[] }, Record<string, any>[]>(async function (params, config) {
  return request.post('/backstage/schoolConfig/schoolGradeSubjectsList', params, config)
})
```

**Step 4: 其它入口确认不改动**

- `ai-csms-teaching-analysis/index.vue`、`ai-teaching-diagnosis-analysis/index.vue` **不**加 `filter-subject-names`

---

### Task 5: 验证

**Files:** 无新文件

**Step 1: 类型检查 / lint**

```bash
pnpm lint
# 若有 vue-tsc / typecheck 脚本则一并执行
```

**Step 2: 对照 spec 验收手工核对**

- [ ] 自主分析新建弹窗请求体含 `subjectNames`，9 科与课程页一致
- [ ] 课堂实录新建弹窗请求体含 `subjectNames`，同上
- [ ] 课程列表弹窗请求体与改前一致
- [ ] CSMS / 教学诊断弹窗请求体不含 `subjectNames`
- [ ] `SUBJECT_NAMES` 单源

**Step 3: 不自动 commit**（用户未要求）

---

## Skill 路由标注

> **Skill:** 无需专项 skill（置信度 0.9）——纯 Vue prop + 常量提取 + 两处请求参数对齐，不涉及设计系统 / 图表 / 文档格式。  
> 人工复核：确认无 `ui-ux-pro-max` / `vue-skills` 必要触发条件；`vue-skills` 仅在 Vue 专家问题时用，本任务为直接改参。  
> riskLevel: low
