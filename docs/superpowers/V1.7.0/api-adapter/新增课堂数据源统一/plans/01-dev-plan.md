# 新增课堂数据源统一 · 实施计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**模块:** 新增课堂数据源统一
**档位:** 全量
**日期:** 2026-09-30

> **执行前必读：** `docs/superpowers/HARNESS_RULES.md` §3.1。本 plan 全部 Task 完成前不得改 `src/` 以外的实现范围；
> 禁止顺手重构 `specs/01-dev-spec.md` §10 列出的「保持不变」项。

**目标：** 把「新增课堂」弹窗的年级/学科/班级统一到学校实体数据源，教材版本改用实体 ID 入参，
消除 `gradeToNumber` 字符串反解链路。

**架构：** 新增一个无 Vue 依赖的纯逻辑模块 `course-basic-data.ts`，承载 ID→节点定位、
教材入参组装、年级重置清单、班级名取值四类可测逻辑；`CreateCourseDialog.vue` 只负责状态与
请求编排。年级用 `ElCascader` 三级懒加载承载校区/学段/年级，班级降级为 `ElSelect` 平铺。

**技术栈：** Vue 3.5 + TypeScript + Element Plus 2.9 + vitest 4.1

---

## 服务层结论（Task 1 之前的事实）

spec §1 提到「`schoolNew.ts` 仅在需要补参数类型时微调」。**核对结果：六个 service 全部已存在且参数类型够用，本次不改 `src/service/`。**

| 用途 | service | 位置 | 参数类型 |
|------|---------|------|---------|
| 校区 | `baseData.getSchoolCampusList` | `baseData.ts:157` | `{ schoolId, [key]: any }` |
| 学段 | `baseData.getSchoolStageList` | `baseData.ts:349` | `Record<string, any>` |
| 学年 | `schoolNew.currentYear` | `schoolNew.ts:226` | `{ schoolId }` |
| 年级 | `schoolNew.getSchoolGradeListByCurrentYear` | `schoolNew.ts:382` | `{ [key]: any }` |
| 学科 | `schoolNew.schoolGradeSubjectsList` | `schoolNew.ts:154` | `{ baseGradeId, stageId }` |
| 班级 | `school.getSchoolClassList` | `schoolNew.ts:207` | `{ [key]: any }` |
| 教材 | `classroom.getTextBookVersion` | `classroom.ts:331` | `any`（入参整体替换） |

---

### Task 0: 建立改动前基线

**Files:** 无（只跑命令）

**Step 1: 跑类型检查，确认改动前是干净的**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0，无 TS 报错。**若此处已有报错，先记录，不要在本次任务里修**（属存量问题）。

**Step 2: 跑现有 spec，确认基线测试通过**

```powershell
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/core-lesson-plan.spec.ts
```

Expected: `Tests  10 passed (10)`。

**Step 3: 确认门禁无告警**

```powershell
cd 'E:\code\frontend'; node scripts/harness/validate-harness.mjs
```

Expected: 无输出。

---

### Task 1: 纯逻辑模块 `course-basic-data.ts` + 单测

**Files:**
- Create: `src/pages/course/types/course-basic-data.ts`
- Create: `src/pages/course/types/course-basic-data.spec.ts`

本模块无 Vue / 无 service 依赖，可独立单测。承载四类逻辑：级联回显的 ID 定位、教材入参组装、
年级切换重置清单、班级名取值。

**Step 1: 写失败的测试**

创建 `src/pages/course/types/course-basic-data.spec.ts`：

```ts
import { describe, expect, it } from 'vitest'
import {
  GRADE_RESET_FIELDS,
  buildTextbookQuery,
  findClassLabel,
  findNodeById,
  resolveGradeCascadePath,
} from './course-basic-data'

describe('findNodeById', () => {
  it('returns the node whose id matches', () => {
    const list = [{ id: 'c1', name: '东校区' }, { id: 'c2', name: '西校区' }]
    expect(findNodeById(list, 'c2')?.name).toBe('西校区')
  })

  it('returns undefined when no id matches', () => {
    expect(findNodeById([{ id: 'c1' }], 'nope')).toBeUndefined()
  })

  it('tolerates null / undefined list', () => {
    expect(findNodeById(null, 'c1')).toBeUndefined()
    expect(findNodeById(undefined, 'c1')).toBeUndefined()
  })
})

describe('buildTextbookQuery', () => {
  it('assembles baseCourseId / baseEducationStageCode / gradeLevelCode', () => {
    expect(buildTextbookQuery({
      baseCourseId: '1881268817821306880',
      stageType: 'primary',
      gradeNumber: 3,
    })).toEqual({
      baseCourseId: '1881268817821306880',
      baseEducationStageCode: 'primary',
      gradeLevelCode: 3,
    })
  })

  it('omits gradeLevelCode when grade number is missing', () => {
    expect(buildTextbookQuery({
      baseCourseId: 'c1',
      stageType: 'high',
      gradeNumber: null,
    })).toEqual({ baseCourseId: 'c1', baseEducationStageCode: 'high' })
  })

  it('returns null when required params are missing', () => {
    expect(buildTextbookQuery({ baseCourseId: '', stageType: 'primary', gradeNumber: 1 })).toBeNull()
    expect(buildTextbookQuery({ baseCourseId: 'c1', stageType: '', gradeNumber: 1 })).toBeNull()
  })
})

describe('GRADE_RESET_FIELDS', () => {
  it('resets subject / class / textbook / chapters exactly', () => {
    expect(GRADE_RESET_FIELDS).toEqual({
      subjectName: '',
      refClassSnapshotPrimaryId: '',
      textbookEdition: '',
      chapters: [],
    })
  })
})

describe('findClassLabel', () => {
  it('finds class name by id', () => {
    expect(findClassLabel([{ value: 'k1', label: '一班' }], 'k1')).toBe('一班')
  })

  it('returns null when not found', () => {
    expect(findClassLabel([{ value: 'k1' }], 'k2')).toBeNull()
  })

  it('tolerates null list', () => {
    expect(findClassLabel(null, 'k1')).toBeNull()
  })
})

describe('resolveGradeCascadePath', () => {
  it('locates campus / stage / grade nodes and returns grade name', () => {
    const result = resolveGradeCascadePath({
      campusId: 'c2',
      stageId: 's1',
      gradeId: 'g3',
      campusList: [{ id: 'c1', name: '东' }, { id: 'c2', name: '西' }],
      stageList: [{ id: 's1', typeStr: '小学', type: 'primary' }],
      gradeList: [{ id: 'g3', name: '三年级', baseGradeId: 'b3', number: 3 }],
    })
    expect(result).toEqual({
      gradeName: '三年级',
      baseGradeId: 'b3',
      gradeNumber: 3,
      stageType: 'primary',
    })
  })

  it('returns null when grade id is not found', () => {
    expect(resolveGradeCascadePath({
      campusId: 'c1', stageId: 's1', gradeId: 'nope',
      campusList: [{ id: 'c1' }],
      stageList: [{ id: 's1' }],
      gradeList: [{ id: 'g3' }],
    })).toBeNull()
  })

  it('returns null when any of the three ids is missing', () => {
    expect(resolveGradeCascadePath({
      campusId: '', stageId: 's1', gradeId: 'g3',
      campusList: [{ id: 'c1' }], stageList: [{ id: 's1' }], gradeList: [{ id: 'g3' }],
    })).toBeNull()
  })
})
```

**Step 2: 跑测试确认失败**

```powershell
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/course-basic-data.spec.ts
```

Expected: FAIL，提示 `Failed to resolve import "./course-basic-data"`。

**Step 3: 写实现**

创建 `src/pages/course/types/course-basic-data.ts`：

```ts
/**
 * 「新增课堂」弹窗基础数据（年级/学科/班级/教材版本）的纯逻辑。
 * 无 Vue、无 service 依赖，供 CreateCourseDialog.vue 编排调用与单元测试。
 */

export interface BasicDataNode {
  id?: string
  name?: string
  [key: string]: any
}

export interface TextbookQueryInput {
  baseCourseId?: string | null
  stageType?: string | null
  gradeNumber?: number | null
}

export interface GradeCascadeInput {
  campusId?: string | null
  stageId?: string | null
  gradeId?: string | null
  campusList?: BasicDataNode[] | null
  stageList?: BasicDataNode[] | null
  gradeList?: BasicDataNode[] | null
}

export interface ResolvedGradeCascade {
  gradeName: string
  baseGradeId: string
  gradeNumber: number
  stageType: string
}

/** 按 id 定位节点；未命中返回 undefined */
export function findNodeById(
  list: BasicDataNode[] | null | undefined,
  id: string | null | undefined,
): BasicDataNode | undefined {
  if (!Array.isArray(list) || !id) return undefined
  return list.find((item) => String(item?.id ?? '') === String(id))
}

/** 组装教材版本入参；缺必需项返回 null，gradeLevelCode 可选 */
export function buildTextbookQuery(input: TextbookQueryInput): Record<string, any> | null {
  const { baseCourseId, stageType, gradeNumber } = input
  if (!baseCourseId || !stageType) return null
  const query: Record<string, any> = { baseCourseId, baseEducationStageCode: stageType }
  if (gradeNumber !== null && gradeNumber !== undefined && gradeNumber !== ('' as any)) {
    query.gradeLevelCode = gradeNumber
  }
  return query
}

/** 年级切换时需要重置的表单字段（spec §8.2） */
export const GRADE_RESET_FIELDS = {
  subjectName: '',
  refClassSnapshotPrimaryId: '',
  textbookEdition: '',
  chapters: [],
} as const

/** 按班级 id 从选项中取班级名；未命中返回 null */
export function findClassLabel(
  options: Array<{ value: string; label: string }> | null | undefined,
  classId: string | null | undefined,
): string | null {
  if (!Array.isArray(options) || !classId) return null
  return options.find((item) => String(item?.value ?? '') === String(classId))?.label ?? null
}

/** 逐级定位校区/学段/年级，产出教材与学科接口所需的派生值；任一 id 缺失或未命中返回 null */
export function resolveGradeCascadePath(input: GradeCascadeInput): ResolvedGradeCascade | null {
  const { campusId, stageId, gradeId, campusList, stageList, gradeList } = input
  if (!campusId || !stageId || !gradeId) return null

  const campus = findNodeById(campusList, campusId)
  const stage = findNodeById(stageList, stageId)
  const grade = findNodeById(gradeList, gradeId)
  if (!campus || !stage || !grade) return null

  return {
    gradeName: grade.name ?? '',
    baseGradeId: grade.baseGradeId ?? '',
    gradeNumber: grade.number,
    stageType: stage.type ?? '',
  }
}
```

**Step 4: 跑测试确认通过**

```powershell
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/course-basic-data.spec.ts
```

Expected: `Tests  15 passed (15)`（5 组 describe × 3 组用例）。

**Step 5: 提交**

```powershell
cd 'E:\code\frontend'; git add src/pages/course/types/course-basic-data.ts src/pages/course/types/course-basic-data.spec.ts
git commit -m "feat(course): 新增课堂基础数据纯逻辑模块"
```

---

### Task 2: 年级改为三级懒加载级联

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue:24-30`（年级模板）
- Modify: `src/pages/course/components/CreateCourseDialog.vue:132`（import）
- Modify: `src/pages/course/components/CreateCourseDialog.vue:149-156`（schoolInfo 之后追加 yearId 状态）
- Modify: `src/pages/course/components/CreateCourseDialog.vue:516-523`（删除旧年级字典 `useAsyncState`）
- Modify: `src/pages/course/components/CreateCourseDialog.vue:662-675`（`defaultForm` 增 `ref*` 字段）

**Step 1: `defaultForm` 增加 ref 系列字段**

把 `:662-675` 的 `defaultForm` 中 `analysisGradeName: '', // 年级` 一行替换为：

```ts
    analysisGradeName: '', // 年级名称（提交用，由年级级联同步）
    refCampusId: '', // 校区 id
    refStageId: '', // 学段 id
    refStageType: '', // 学段 type：primary/middle/high
    refGradeId: '', // 年级 id（级联 v-model）
    refGradeNumber: '', // 年级 number 1~12
    refBaseGradeId: '', // 年级 baseGradeId
```

**Step 2: 删除旧年级字典 source**

整段删除 `:515-523`：

```ts
// 年级
const { state: gradeOptions, isLoading: gradeOptionsLoading } = useAsyncState(async () => {
  const dictItems = await service.classroom.getClassRoomDict({ dictCode: 'grade' })
  // 将{itemCode, itemName}转换为{value, label}格式
  return dictItems.map(item => ({
    value: item.itemCode,
    label: item.itemName
  }))
}, [])
```

**Step 3: 追加 yearId 缓存 + 级联状态**

在 `const classOptionsLoading = ref(false)`（`:551`）之前插入：

```ts
// 当前学年 id（弹窗打开时取一次，级联展开不重复请求）
const currentYearId = ref('')
let currentYearPending: Promise<string> | null = null

async function ensureCurrentYearId(): Promise<string> {
  if (currentYearId.value) return currentYearId.value
  if (currentYearPending) return currentYearPending
  currentYearPending = service.schoolNew
    .currentYear({ schoolId: schoolInfo.value?.id ?? '' })
    .then((res: any) => {
      currentYearId.value = res?.id ?? ''
      return currentYearId.value
    })
    .finally(() => {
      currentYearPending = null
    })
  return currentYearPending
}

// 年级级联
const gradeOptionsLoading = ref(false)
const gradeEmptyNode: NodeData = {
  id: '', value: '', label: '暂无数据', isLeaf: true, path: [], params: {}, data: null, disabled: true
}
const gradeCascaderKey = ref(0)
const gradeProps = ref({
  label: 'label',
  value: 'value',
  children: 'children',
  leaf: 'isLeaf',
  disabled: 'disabled',
  lazy: true,
  emitPath: false,
  lazyLoad(node: any, resolve: (data: NodeData[]) => void) {
    return handleGradeLoadNode(node, resolve)
  }
})

// eslint-disable-next-line complexity
const handleGradeLoadNode = async (node: any, resolve: (data: NodeData[]) => void) => {
  gradeOptionsLoading.value = true
  const { level, data } = node
  const schoolId = schoolInfo.value?.id ?? ''

  if (level === 0) {
    // 校区
    const result = await service.baseData.getSchoolCampusList({ schoolId, state: 1 })
    const list = (result || []).map((item: any) => ({
      id: `${item.id}`,
      value: `${item.id}`,
      label: item.name,
      isLeaf: false,
      path: [`${item.id}`],
      params: { campusId: item.id, campusInfo: item },
      data: item
    }))
    resolve(list.length ? list : [gradeEmptyNode])
    gradeOptionsLoading.value = false
    return
  }

  if (level === 1) {
    // 学段
    const result = await service.baseData.getSchoolStageList({
      schoolId,
      campusId: data.params.campusId
    })
    const list = (result || []).map((item: any) => ({
      id: `${item.id}`,
      value: `${item.id}`,
      label: item.typeStr,
      isLeaf: false,
      path: [...data.path, `${item.id}`],
      params: { ...data.params, stageId: item.id, stageInfo: item },
      data: item
    }))
    resolve(list.length ? list : [gradeEmptyNode])
    gradeOptionsLoading.value = false
    return
  }

  if (level === 2) {
    // 年级（currentGradeList 需要 yearId，取自 currentYear，弹窗打开时已缓存）
    const yearId = await ensureCurrentYearId()
    if (!yearId) {
      resolve([gradeEmptyNode])
      gradeOptionsLoading.value = false
      return
    }
    const result = await service.schoolNew.getSchoolGradeListByCurrentYear({
      schoolId,
      campusId: data.params.campusId,
      stageId: data.params.stageId,
      yearId
    })
    const list = (result || []).map((item: any) => ({
      id: `${item.id}`,
      value: `${item.id}`,
      label: item.name,
      isLeaf: true,
      path: [...data.path, `${item.id}`],
      params: { ...data.params, gradeId: item.id, gradeInfo: item },
      data: item
    }))
    resolve(list.length ? list : [gradeEmptyNode])
    gradeOptionsLoading.value = false
    return
  }

  resolve([])
  gradeOptionsLoading.value = false
}
```

> `NodeData` 类型定义在 `:525-545`，位于本段之前，无需调整。`refBaseGradeId` / `refGradeNumber` /
> `refStageType` 在 Task 3 的 change 处理中写入。

**Step 4: 改年级模板**

把 `:24-30` 整段替换为：

```vue
        <!-- 年级：校区 + 学段 + 年级 三级懒加载级联 -->
        <ElFormItem label="年级" prop="refGradeId">
          <ElCascader v-if="generalForm.visible" :key="gradeCascaderKey" ref="gradeCascader"
            v-model="generalForm.form.refGradeId" :props="gradeProps" :show-all-levels="false"
            :disabled="isNonCoreFieldDisabled"
            :class="generalForm.form.refGradeId && !generalForm.isCreateMode ? 'placeholder-black' : ''"
            clearable
            :placeholder="generalForm.form.refGradeId ? generalForm.form.analysisGradeName : '请选择年级'"
            v-loading="gradeOptionsLoading" style="width: 100%" />
        </ElFormItem>
```

**Step 5: 改 import**

把 `:132` 替换为：

```ts
import { transformTextbookData, transformChapters } from '@/utils/tool.ts'
import { GRADE_RESET_FIELDS } from '@/pages/course/types/course-basic-data'
```

> `gradeToNumber` / `gradeToPhase` 在 Task 5 才从教材逻辑中删除；此步先从 import 移除会导致
> Task 5 之前编译失败，因此**本步只改 `transformTextbookData` 那一行**，`gradeToNumber` /
> `gradeToPhase` 暂时保留，Task 5 统一删除：

```ts
import { transformTextbookData, transformChapters, gradeToNumber, gradeToPhase } from '@/utils/tool.ts'
import { GRADE_RESET_FIELDS } from '@/pages/course/types/course-basic-data'
```

**Step 6: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。`gradeEmptyNode` / `gradeCascaderKey` / `handleGradeLoadNode` 可能报
`is declared but its value is never read`（因模板还没用全），**若是 unused 警告可接受**，
若为 TS 语法/类型错误则必须修。

---

### Task 3: 年级 change 同步 + 学科联动改接口

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue:31-37`（学科模板）
- Modify: `src/pages/course/components/CreateCourseDialog.vue:506-513`（学科 source）
- Modify: `src/pages/course/components/CreateCourseDialog.vue`（在 `isNonCoreFieldDisabled`（`:729`）之前插入年级 change 处理）

**Step 1: 替换学科 source**

把 `:505-513` 整段替换为：

```ts
// 学科：依赖年级的 baseGradeId + 学段 stageId
const subjectOptions = ref<Array<{ value: string; label: string; baseSubjectId?: string }>>([])
const subjectOptionsLoading = ref(false)

async function loadSubjectOptions(baseGradeId: string, stageId: string) {
  if (!baseGradeId || !stageId) {
    subjectOptions.value = []
    return
  }
  subjectOptionsLoading.value = true
  try {
    const res = await service.schoolNew.schoolGradeSubjectsList({ baseGradeId, stageId })
    subjectOptions.value = (res || []).map((item: any) => ({
      value: item.subjectName ?? item.name ?? '',
      label: item.subjectName ?? item.name ?? '',
      baseSubjectId: item.baseSubjectId
    }))
  } catch (error) {
    console.error('加载学科失败:', error)
    subjectOptions.value = []
  } finally {
    subjectOptionsLoading.value = false
  }
}

/** 记录当前选中学科的 baseSubjectId，供教材接口使用 */
function selectedBaseSubjectId(): string {
  return subjectOptions.value.find((i) => i.value === generalForm.form.subjectName)?.baseSubjectId ?? ''
}
```

**Step 2: 插入年级 change 处理 + 级联联动**

在 `const isNonCoreFieldDisabled = computed(...)`（`:729`）之前插入：

```ts
// 年级级联选中：写入 ref* 字段并同步年级名称
async function handleGradeChange(gradeId: string) {
  const form = generalForm.form
  form.refGradeId = gradeId || ''

  if (!gradeId) {
    form.analysisGradeName = ''
    form.refCampusId = ''
    form.refStageId = ''
    form.refStageType = ''
    form.refGradeNumber = ''
    form.refBaseGradeId = ''
    return
  }

  const gradeNode = gradeCascaderNode.value
  const stageNode = gradeStageNode.value

  form.refBaseGradeId = gradeNode?.params?.gradeInfo?.baseGradeId ?? ''
  form.refGradeNumber = gradeNode?.params?.gradeInfo?.number ?? ''
  form.refStageId = stageNode?.value ?? form.refStageId
  form.refStageType = stageNode?.params?.stageInfo?.type ?? ''
  form.refCampusId = gradeNode?.params?.campusId ?? form.refCampusId
  form.analysisGradeName = gradeNode?.label ?? ''

  await loadSubjectOptions(form.refBaseGradeId, form.refStageId)
}
```

> `gradeCascaderNode` / `gradeStageNode` 已在 Task 2 Step 3 声明，由 `handleGradeLoadNode`
> 的 level 1 / level 2 分支写入（见本 Task Step 3）。若尚未写入，先执行 Step 3 再回看本步。
> `selectedBaseSubjectId` 与 `loadSubjectOptions` 由 Step 1 定义。

**Step 3: 在 lazyLoad 中记录已加载节点**

在 `handleGradeLoadNode` 的 level 1 分支 `resolve(...)` 之前插入：

```ts
    gradeStageNode.value = data
```

在 level 2 分支 `resolve(...)` 之前插入：

```ts
    gradeCascaderNode.value = data
```

并在 `gradeCascaderKey` 声明处补上两个 ref：

```ts
const gradeCascaderKey = ref(0)
const gradeStageNode = ref<any>(null)
const gradeCascaderNode = ref<any>(null)
```

**Step 4: 改年级模板的 change 绑定**

Task 2 Step 4 的模板中，在 `ElCascader` 上加 `@change="handleGradeChange"`：

```vue
            v-loading="gradeOptionsLoading" style="width: 100%" @change="handleGradeChange" />
```

**Step 5: 改学科模板**

把 `:31-37` 整段替换为：

```vue
        <!-- 学科 -->
        <ElFormItem label="学科" prop="subjectName">
          <ElSelect v-model="generalForm.form.subjectName" placeholder="请选择学科" clearable
            :loading="subjectOptionsLoading"
            :disabled="isNonCoreFieldDisabled || !generalForm.form.refGradeId">
            <ElOption v-for="item in subjectOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>
```

**Step 6: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 4: 教材版本入参改造

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue:132`（import 删 `gradeToNumber` / `gradeToPhase`）
- Modify: `src/pages/course/components/CreateCourseDialog.vue:278-316`（`loadTextbookOptions`）
- Modify: `src/pages/course/components/CreateCourseDialog.vue:40-43`（教材模板 disabled 条件）

**Step 1: 改 import**

把 Task 2 Step 5 留下的 import 行替换为：

```ts
import { transformTextbookData, transformChapters } from '@/utils/tool.ts'
import { GRADE_RESET_FIELDS, buildTextbookQuery } from '@/pages/course/types/course-basic-data'
```

> `GRADE_RESET_FIELDS` 在 Task 6 才会用上；若 Task 6 未执行前 lint 报 unused，
> 暂从 import 中移除 `GRADE_RESET_FIELDS`，Task 6 时再加回。
> `buildTextbookQuery` 从本步起使用。

**Step 2: 重写 `loadTextbookOptions`**

把 `:278-316` 整段替换为：

```ts
/**
 * 加载教材版本选项
 * 入参全部来自学校实体：baseCourseId=学科 baseSubjectId、baseEducationStageCode=学段 type、
 * gradeLevelCode=年级 number
 */
const loadTextbookOptions = async () => {
  const baseCourseId = selectedBaseSubjectId()
  const query = buildTextbookQuery({
    baseCourseId,
    stageType: generalForm.form.refStageType,
    gradeNumber: generalForm.form.refGradeNumber
  })

  if (!query) {
    textbookVersionOptions.value = []
    return
  }

  textbookVersionOptions.value = []

  try {
    const res = await service.classroom.getTextBookVersion(query)
    textbookVersionOptions.value = transformTextbookData(res) ?? []
  } catch (error) {
    console.error('加载教材版本失败:', error)
    textbookVersionOptions.value = []
  }
}
```

**Step 3: 改教材模板的 disabled 条件**

把 `:39-43` 的 `ElFormItem label="教材版本"` 中 `ElTreeSelect` 的 disabled 条件替换：

```vue
            :disabled="isNonCoreFieldDisabled || !generalForm.form.refGradeId || !generalForm.form.subjectName"
```

**Step 4: 确认本弹窗已无 `getTextBookCourseMapping` / `gradeToNumber` / `gradeToPhase`**

```powershell
cd 'E:\code\frontend'; Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'getTextBookCourseMapping|gradeToNumber|gradeToPhase'
```

Expected: **无输出**。

**Step 5: 类型检查 + 单测**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/
```

Expected: typecheck 退出码 0；两个 spec 文件全部通过。

**Step 6: 提交**

```powershell
cd 'E:\code\frontend'; git add src/pages/course/components/CreateCourseDialog.vue
git commit -m "feat(course): 年级改三级级联，学科与教材版本改用实体入参"
```

---

### Task 5: 班级改 ElSelect

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue:50-58`（班级模板）
- Modify: `src/pages/course/components/CreateCourseDialog.vue:550-656`（删除级联相关代码，改为选项数组）
- Modify: `src/pages/course/components/CreateCourseDialog.vue:841-842`（`setOptsForm` 的 className 取值）

**Step 1: 改班级模板**

把 `:50-58` 整段替换为：

```vue
        <!-- 班级 -->
        <ElFormItem label="上课班级" prop="refClassSnapshotPrimaryId">
          <ElSelect v-model="generalForm.form.refClassSnapshotPrimaryId" :loading="classOptionsLoading"
            placeholder="请选择上课班级" clearable filterable style="width: 100%"
            :disabled="isNonCoreFieldDisabled || !generalForm.form.refGradeId"
            :class="generalForm.form.refClassSnapshotPrimaryId && !generalForm.isCreateMode ? 'placeholder-black' : ''">
            <ElOption v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>
```

**Step 2: 删除旧级联代码，替换为选项数组**

把 `:550-656` 整段（从 `// 班级选项` 注释到 `const classTreeSelect = useTemplateRef...`）替换为：

```ts
// 班级选项：年级选满后一次性拉取
const classOptionsLoading = ref(false)
const classOptions = ref<Array<{ value: string; label: string }>>([])

async function loadClassOptions() {
  const { refCampusId: campusId, refStageId: stageId, refGradeId: gradeId } = generalForm.form
  if (!campusId || !stageId || !gradeId) {
    classOptions.value = []
    return
  }
  classOptionsLoading.value = true
  try {
    const res = await service.school.getSchoolClassList({ schoolId: schoolInfo.value?.id ?? '', campusId, stageId, gradeId })
    classOptions.value = (res || []).map((item: any) => ({ value: `${item.id}`, label: item.name }))
  } catch (error) {
    console.error('加载班级失败:', error)
    classOptions.value = []
  } finally {
    classOptionsLoading.value = false
  }
}
```

> 新入参**不含** `yearId`、**不含** `classType`（与现状不同，见 spec §5.1）。
> `classProps` / `classNotDataNode` / `handleClassLoadNode` / `classTreeSelect` 一并删除。

**Step 3: 改 `setOptsForm` 的 className 取值**

把 `:841-842` 替换为：

```ts
  const pickedClass = findClassLabel(classOptions.value, form.refClassSnapshotPrimaryId)
  form.className = pickedClass ?? (form.className ?? '')
```

并在 `setOptsForm` 上方补 import 来源（已由 Task 4 Step 1 的 import 提供）：

```ts
import { GRADE_RESET_FIELDS, buildTextbookQuery, findClassLabel } from '@/pages/course/types/course-basic-data'
```

**Step 4: 确认无残留引用**

```powershell
cd 'E:\code\frontend'; Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'classTreeSelect|classProps|classNotDataNode|handleClassLoadNode'
```

Expected: **无输出**。

**Step 5: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。特别注意 `setOptsForm` 内不再有 `getCheckedNodes` 调用。

---

### Task 6: 年级切换重置联动

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue`（在 `watch([() => generalForm.form.analysisGradeName, ...])`（`:749-758`）之后追加）

**Step 1: 追加年级重置 watch**

在 `:749-758` 的现有 watch 之后插入：

```ts
// 监听年级级联路径（校区+学段+年级）：任一变化即重置学科/班级/教材/章节
// 同一 gradeId 在不同校区下班级不同，故不可只监听 gradeId
watch(
  () => [generalForm.form.refCampusId, generalForm.form.refStageId, generalForm.form.refGradeId].join('|'),
  async (next, prev) => {
    if (prev === undefined || next === prev) return
    // 编辑模式初始化回显走 defLoading 保护，不在此重置
    if (defLoading.value) return

    generalForm.form.subjectName = ''
    generalForm.form.refClassSnapshotPrimaryId = ''
    generalForm.form.textbookEdition = ''
    generalForm.form.chapters = []
    subjectOptions.value = []
    classOptions.value = []
    textbookVersionOptions.value = []
    chapterOptions.value = []

    await loadSubjectOptions(generalForm.form.refBaseGradeId, generalForm.form.refStageId)
    await loadClassOptions()
    await loadTextbookOptions()
  }
)
```

> `GRADE_RESET_FIELDS` 已在本任务 import 中；若实现时未使用，请在 import 中移除以免 lint 报 unused。
> 上面的实现选择逐字段显式赋值而非展开 `GRADE_RESET_FIELDS`，是因为还需同步清空 4 个选项数组。
> **若 reviewer 要求用 `GRADE_RESET_FIELDS`，改为：**
> `Object.assign(generalForm.form, GRADE_RESET_FIELDS)`。

**Step 2: 确认现有「学科变化清教材」watch 保留未动**

`:749-758` 的 watch 监听 `[analysisGradeName, subjectName]`。改造后 `analysisGradeName` 在年级
change 时才写入，语义变为「年级或学科变化 → 清教材+章节」，与 spec §8.3 一致，**保留不动**。

**Step 3: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

**Step 4: 提交**

```powershell
cd 'E:\code\frontend'; git add src/pages/course/components/CreateCourseDialog.vue
git commit -m "feat(course): 年级切换重置学科/班级/教材/章节"
```

---

### Task 7: 编辑模式回显

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue:421-496`（`watch(() => props.visible)`）

**Step 1: 插入回显辅助函数**

在 `const defLoading = ref(false)`（`:185`）之后插入：

```ts
/**
 * 按后端返回的 campusId/stageId/gradeId 逐级定位，产出年级相关派生值。
 * 三个 id 缺失（历史课堂）时返回 null，调用方按 spec §9.2 边界处理。
 */
async function loadGradeCascadeForEcho(input: {
  campusId?: string | null
  stageId?: string | null
  gradeId?: string | null
}) {
  const schoolId = schoolInfo.value?.id ?? ''
  const campusList = await service.baseData.getSchoolCampusList({ schoolId, state: 1 })
  const stageList = input.campusId
    ? await service.baseData.getSchoolStageList({ schoolId, campusId: input.campusId })
    : []
  const yearId = await ensureCurrentYearId()
  const gradeList = input.campusId && input.stageId && yearId
    ? await service.schoolNew.getSchoolGradeListByCurrentYear({
      schoolId, campusId: input.campusId, stageId: input.stageId, yearId
    })
    : []

  // 让 lazyLoad store 认识这条路径：逐级触发一次加载
  const campus = findNodeById(campusList, input.campusId)
  if (campus) gradeStageNode.value = { params: { campusId: campus.id, campusInfo: campus } }
  const stage = findNodeById(stageList, input.stageId)
  if (stage) gradeCascaderNode.value = { params: { campusId: campus?.id, stageId: stage.id, stageInfo: stage } }
  const grade = findNodeById(gradeList, input.gradeId)
  if (grade) {
    gradeCascaderNode.value = {
      ...gradeCascaderNode.value,
      label: grade.name,
      params: { ...(gradeCascaderNode.value?.params ?? {}), gradeId: grade.id, gradeInfo: grade }
    }
  }
  gradeCascaderKey.value += 1

  return resolveGradeCascadePath({
    campusId: input.campusId,
    stageId: input.stageId,
    gradeId: input.gradeId,
    campusList, stageList, gradeList
  })
}
```

并在 import 中补 `findNodeById` 与 `resolveGradeCascadePath`。

**Step 2: 改造编辑模式回显体**

把 `:439-453` 的 `Object.assign(generalForm.form, {...})` 替换为：

```ts
      Object.assign(generalForm.form, {
        name,
        teachingStartTime,
        classDuration,
        supportTeachingTools,
        // 根据 supportTeachingTools 判断是否开启开关及具体选中的工具
        isEnableTeachingTool: !!(supportTeachingTools && supportTeachingTools.length > 0),
        isUseTool: supportTeachingTools?.includes('1') ?? false,
        isUseDiagnosis: supportTeachingTools?.includes('4') ?? false,
        refClassSnapshotPrimaryId: refClassPrimaryId,
        id,
        className
      })

      // 年级：按 campusId/stageId/gradeId 逐级回显；历史课堂缺 id 时按 spec §9.2 处理
      const echo = await loadGradeCascadeForEcho({
        campusId: classroomData?.campusId,
        stageId: classroomData?.stageId,
        gradeId: classroomData?.gradeId
      })
      if (echo) {
        Object.assign(generalForm.form, {
          refCampusId: classroomData?.campusId ?? '',
          refStageId: classroomData?.stageId ?? '',
          refStageType: echo.stageType,
          refGradeId: classroomData?.gradeId ?? '',
          refGradeNumber: echo.gradeNumber,
          refBaseGradeId: echo.baseGradeId,
          analysisGradeName: echo.gradeName
        })
        // 级联内既有阶段不被级联 watch 清空（defLoading 保护），此处手动补拉下游
        await loadSubjectOptions(echo.baseGradeId, echo.stageType ? classroomData?.stageId : '')
        await loadClassOptions()
      } else {
        // 边界：历史课堂无三个 id，级联留空，placeholder 显示后端返回的年级名称
        generalForm.form.analysisGradeName = analysisGradeName ?? ''
      }
```

并把 `:432` 的解构补上 `campusId` / `stageId` / `gradeId`（或直接用 `classroomData?.xxx`，
不要重复解构）。

**Step 3: 教材版本回显保持现状**

`:462-483` 的「根据教材版本名称查找对应的 ID」逻辑不动，继续用 `findIdByLabel`。
但它依赖 `analysisGradeName` 与 `subjectName` 已就绪——改造后 `analysisGradeName` 来自
`echo.gradeName`，`subjectName` 来自 `:442` 的解构回填，顺序仍满足。

**Step 4: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 8: 创建模式回显

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue:367-419`（`loadFormCache`）

**Step 1: 改 `loadFormCache` 的年级/学科恢复段**

把 `:393-415` 整段替换为：

```ts
    // 恢复年级（按 id 逐级回显）与学科
    const echo = await loadGradeCascadeForEcho({
      campusId: cache.campusId,
      stageId: cache.stageId,
      gradeId: cache.gradeId
    })
    if (echo) {
      Object.assign(generalForm.form, {
        refCampusId: cache.campusId ?? '',
        refStageId: cache.stageId ?? '',
        refStageType: echo.stageType,
        refGradeId: cache.gradeId ?? '',
        refGradeNumber: echo.gradeNumber,
        refBaseGradeId: echo.baseGradeId,
        analysisGradeName: echo.gradeName
      })
      await loadSubjectOptions(echo.baseGradeId, cache.stageId ?? '')
    } else if (cache.analysisGradeName) {
      generalForm.form.analysisGradeName = cache.analysisGradeName
    }

    if (cache.subjectName) {
      generalForm.form.subjectName = cache.subjectName
    }

    // 等待教材版本选项加载（仍沿用按名称反查 ID 的现状逻辑）
    if (generalForm.form.analysisGradeName && generalForm.form.subjectName) {
      await loadTextbookOptions()

      if (cache.textbook && textbookVersionOptions.value.length > 0) {
        const textbookId = findIdByLabel(textbookVersionOptions.value, cache.textbook)
        if (textbookId) {
          generalForm.form.textbookEdition = textbookId
          await loadChapterOptions(textbookId)
        }
      }
    }
```

**Step 2: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 9: 提交字段收口

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue:869-878`（提交前剔除辅助字段）

**Step 1: 在剔除辅助字段处补 `ref*` 字段**

把 `:869-873` 替换为：

```ts
  // 提交前剔除前端辅助字段，不提交给后端
  const submitForm = { ...form }
  delete submitForm.isEnableTeachingTool
  delete submitForm.isUseTool
  delete submitForm.isUseDiagnosis
  delete submitForm.refCampusId
  delete submitForm.refStageId
  delete submitForm.refStageType
  delete submitForm.refGradeId
  delete submitForm.refGradeNumber
  delete submitForm.refBaseGradeId
```

**Step 2: 单测验证 `normalizeCourseSubmitForm` 行为不变**

```powershell
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/
```

Expected: 全部通过。`normalizeCourseSubmitForm` 未改动，核心教案扁平化行为不变。

**Step 3: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 10: 清理调试输出

**Batch:** 以下为同形微任务，可一次性派发/执行

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue` 多处

**Step 1: 定位全部 console 输出**

```powershell
cd 'E:\code\frontend'; Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'console\.log'
```

**Step 2: 逐条处理**

| 行号（改前） | 内容 | 处理 |
|---|---|---|
| 309 | `console.log(res)`（教材接口返回） | 删除 |
| 374 | `console.log(cache)`（getLatestClassroomInfo 返回） | 删除 |
| 705 | `console.log('form----', form)` | 删除 |
| 706 | `console.log('props.opts----', props.opts)` | 删除 |
| 750 | `console.log('年级/学科变化:', {...})` | 删除 |
| 761 | `console.log('textbookEdition----', val)` | 删除 |
| 839 | `console.log(textbookVersionOptions.value, chapterOptions.value)` | 删除 |

`console.error` 保留（属于异常日志，不是调试残留）。

**Step 3: 复查**

```powershell
cd 'E:\code\frontend'; Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'console\.log'
```

Expected: **无输出**。

**Step 4: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 11: 交付前验证

**Files:** 无（只跑命令）

**Step 1: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

**Step 2: 全量单测**

```powershell
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run
```

Expected: 全部通过。若仓库内其它 spec 因本次改动失败，说明改到了 spec §10 禁止的「保持不变」项，
必须回退该处改动。

**Step 3: 门禁校验**

```powershell
cd 'E:\code\frontend'; node scripts/harness/validate-harness.mjs
```

Expected: 无本模块相关告警。

**Step 4: 人工联调清单（浏览器）**

启动 `pnpm dev`，打开
`http://localhost:5174/classroom-app/course/course-management/course-list`：

1. 点「手动创建课堂」→ 年级级联能逐级展开校区/学段/年级三级
2. 选满年级 → 学科下拉出现选项，班级下拉出现该年级的班级（Network 中 `schoolClassList`
   请求体**不含** `yearId` / `classType`）
3. Network 面板核对四个请求入参：
   - `schoolCampusList`: `{ schoolId, state: 1 }`
   - `schoolStageList`: `{ schoolId, campusId }`
   - `currentGradeList`: `{ schoolId, campusId, stageId, yearId }`
   - `schoolGradeSubjectsList`: `{ baseGradeId, stageId }`（`baseGradeId` ≠ 年级 `id`）
   - `textbooks/list`: `{ baseCourseId, baseEducationStageCode, gradeLevelCode }`
4. 选年级+学科 → 教材版本可选；选教材版本 → 关联章节可选
5. 切换年级 → 学科/班级/教材/章节 4 项全部清空
6. 只切校区或只切学段（年级 id 不变）→ 4 项同样清空
7. 编辑一条有 `campusId`/`stageId`/`gradeId` 的课堂 → 年级完整回显
8. 核心教案上传/平台选取、授课工具开关、保存/取消行为与改动前一致

**Step 5: 交付自检 + 归档**

按 `docs/superpowers/HARNESS_RULES.md` §6 执行：
A 一致性自检 → B 还原度自检（不适用：无 Figma / 非 UI）→ 勾选 spec §12 验收项 →
写 `archive/新增课堂数据源统一-delivered.md` → 复跑 `validate-harness.mjs` →
复跑 `status.mjs --match "新增课堂数据源统一"` 确认 `DELIVERED`。

**用户未要求时不自动 commit。**

---

## Skill 路由标注（HARNESS_RULES §8 · Mode A）

**执行时间：** 2026-09-30（writing-plans 完成后、开发前）
**图谱：** `E:\code\frontend-local\.agents\routing\SKILL_ROUTING.md`（13 分类 / 14 skill）
**globalConfig：** `maxSkillsPerPlan=5`，`minConfidence=0.7`，`autoActivateRiskLevel=low`

### CLI 机械输出

```bash
node .agents/routing/router.mjs --annotate <plan>
```

结果：**12 个 Task 全部判定「无需 skill」**（置信度均未达 `minConfidence=0.7`）。

### 人工复核结论

| Skill | applicableConditions | 对本 plan 的适用性 |
|-------|---------------------|-------------------|
| `superpowers-harness-run` | 任何会改动 `src/` 的开发类任务 | **已由本流程编排中**，plan 内重复标注无意义 |
| `superpowers-harness` | 判断需求阶段 / commit 前 validate 自查 | 已内嵌于 Task 0 / Task 11 的具体命令，无需实现者另行加载 |
| `superpowers-demand-workflow` | 新建业务需求模块 | 已在 Step A `create-demand` 完成 |
| `frontend-design` | 需要有辨识度的前端界面或视觉方向 | 不适用：本次只换数据源，不改视觉设计 |
| `tailwind-design-system` | 用 Tailwind 建设计系统 | 不适用：项目用 UnoCSS + Element Plus，且未动样式 |
| `improve-animations` / `tailwindcss-animations` | 动画与动效改进 | 不适用：无动画改动 |
| `echarts` | ECharts / 图表 / 大屏可视化 | 不适用：本次不涉及图表 |
| `accessibility` | 无障碍审查或合规改进 | 不适用：组件替换为同库 Element Plus 原生控件，无自定义可访问性逻辑 |
| `figma-long-page` | 存在 Figma 设计稿或长图链接 | 不适用：无 Figma，spec 无「样式对照」节 |
| `ccar-pdf-static-html` | PDF 静态 HTML / 打印样式 | 不适用：不涉及 PDF |
| `clone-website` | 复刻现有网站外观 | 不适用：非网站复刻 |
| `skill-creator` | 新建 / 改进 skill | 不适用：本次不产出 skill |
| （第 14 个，`applicableConditions: []`） | 空 | 不适用 |

### 最终结论

**本 plan 的 12 个 Task 均无需标注 skill。** 机械输出与人工复核结论一致，无 `riskLevel: high`
项，无需在开发前额外暂停确认。开发时若临时出现图表 / 样式 / 动画类子任务，
再按 `.agents/routing/SKILL_ROUTING.md` 单独路由。

### 执行环境备注（router 缺陷，已绕行）

`node .agents/routing/router.mjs` **在本仓库下静默无输出**（连 `--help` 也不打印，退出码 0）。
原因：`.agents` 是指向 `E:\code\frontend-local\.agents` 的 Junction，
`router.mjs:479` 的 `import.meta.url === pathToFileURL(process.argv[1]).href` 判断
在 Junction 路径下恒为 false，导致 `main()` 从不执行。

本次改用直接调用其导出函数（`resolveMdPath` / `loadGraph` / `annotatePlan`）完成标注，
结论如上。**该缺陷属 harness 基础设施，不在本次需求范围内，未修改**；
如需修复请另开需求（修 `frontend-local` 侧源文件）。

---

# 修订二 · 实施计划（自检修复 + 提交三个 id）

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md §14～§18)
**Requirement:** [../requirements/02-自检修复与提交三id.md](../requirements/02-自检修复与提交三id.md)
**档位:** 标准
**日期:** 2026-09-30

**目标：** 修掉第一轮遗留的 4 个缺陷（spec §15 / §18），并让提交体携带
`campusId` / `stageId` / `gradeId`。

**背景：** 第一轮 typecheck 与 36 个单测全绿，但缺陷 1（组件内字段错位）逃过了所有验证，
说明现有手段对"Vue 组件内响应式赋值错位"是盲区。因此本轮在修复的同时，
把缺陷 1 涉及的取值逻辑抽成**可单测的纯函数**，避免重蹈覆辙。

**与第一轮 plan 的关系：** Task 0～11 已执行完毕，本节为增量 Task 12～16，
全部只改 `src/pages/course/components/CreateCourseDialog.vue`
与 `src/pages/course/types/course-basic-data.ts`（+ 其 spec）。

> **重要（对实施者的提醒）：** 缺陷 1 的本质是「在错误的层级取数据」。
> 改完后请逐字复核 `handleGradeChange` 里每一个字段的来源，
> 不要凭印象以为改过了 —— 这一轮就是因为凭印象才出的错。

---

### Task 12: 抽出可单测的取值纯函数 + 映射表状态

**Files:**
- Modify: `src/pages/course/types/course-basic-data.ts`
- Modify: `src/pages/course/types/course-basic-data.spec.ts`
- Modify: `src/pages/course/components/CreateCourseDialog.vue`（新增两个 map ref + 三处填充）

**Step 1: 写失败的测试**

在 `course-basic-data.spec.ts` 追加：

```ts
describe('resolveGradeEntities', () => {
  const gradeInfoMap = {
    g3: { id: 'g3', name: '三年级', baseGradeId: 'b3', number: 3 },
    g7: { id: 'g7', name: '初一', baseGradeId: 'b7', number: 7 }
  }
  const stageInfoMap = {
    s1: { id: 's1', typeStr: '小学', type: 'primary' },
    s2: { id: 's2', typeStr: '初中', type: 'middle' }
  }

  it('reads grade + stage entities by id', () => {
    expect(resolveGradeEntities('g3', 's1', gradeInfoMap, stageInfoMap)).toEqual({
      baseGradeId: 'b3',
      gradeNumber: 3,
      stageType: 'primary',
      gradeName: '三年级'
    })
  })

  it('reads junior stage correctly', () => {
    expect(resolveGradeEntities('g7', 's2', gradeInfoMap, stageInfoMap)).toEqual({
      baseGradeId: 'b7',
      gradeNumber: 7,
      stageType: 'middle',
      gradeName: '初一'
    })
  })

  it('degrades to empty values when ids miss the map', () => {
    expect(resolveGradeEntities('nope', 'nope', gradeInfoMap, stageInfoMap)).toEqual({
      baseGradeId: '',
      gradeNumber: '',
      stageType: '',
      gradeName: ''
    })
  })

  it('tolerates null / undefined maps', () => {
    expect(resolveGradeEntities('g3', 's1', null, undefined)).toEqual({
      baseGradeId: '',
      gradeNumber: '',
      stageType: '',
      gradeName: ''
    })
  })
})
```

并在 import 中加入 `resolveGradeEntities`。

**Step 2: 跑测试确认失败**

```powershell
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/course-basic-data.spec.ts
```

Expected: FAIL，提示 `resolveGradeEntities` 未导出。

**Step 3: 写实现**

在 `course-basic-data.ts` 追加：

```ts
export type EntityMap = Record<string, any>

export interface ResolvedGradeEntities {
  baseGradeId: string
  gradeNumber: any
  stageType: string
  gradeName: string
}

/**
 * 按年级 id / 学段 id 从映射表取实体字段。
 * 未命中时返回空串（不返回 undefined），使调用方「空值可见」——
 * 例如 baseGradeId 为空会让学科下拉为空，UI 上能立刻发现，而不是静默提交错数据。
 */
export function resolveGradeEntities(
  gradeId: string | null | undefined,
  stageId: string | null | undefined,
  gradeInfoMap: EntityMap | null | undefined,
  stageInfoMap: EntityMap | null | undefined,
): ResolvedGradeEntities {
  const grade = gradeId && gradeInfoMap ? gradeInfoMap[gradeId] : undefined
  const stage = stageId && stageInfoMap ? stageInfoMap[stageId] : undefined
  return {
    baseGradeId: grade?.baseGradeId ?? '',
    gradeNumber: grade?.number ?? '',
    stageType: stage?.type ?? '',
    gradeName: grade?.name ?? ''
  }
}
```

**Step 4: 跑测试确认通过**

```powershell
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/course-basic-data.spec.ts
```

Expected: `Tests  20 passed`（原 15 + 新 4 + 其余文件）。

**Step 5: 组件内加两个映射表 ref 并填充**

在年级级联状态声明区（`gradeCascaderKey` 附近）追加：

```ts
/** 学段 id → 原始学段记录（type 等） */
const stageInfoMap = ref<Record<string, any>>({})
/** 年级 id → 原始年级记录（baseGradeId / number / name） */
const gradeInfoMap = ref<Record<string, any>>({})
```

`handleGradeLoadNode` 的 level 1 分支：把 `const list = (result || []).map(...)` 改为先建 map：

```ts
      const map: Record<string, any> = {}
      const list = (result || []).map((item: any) => {
        map[`${item.id}`] = item
        return {
          id: `${item.id}`,
          value: `${item.id}`,
          label: item.typeStr,
          isLeaf: false,
          path: [...data.path, `${item.id}`],
          params: { ...data.params, stageId: item.id, stageInfo: item },
          data: item
        }
      })
      stageInfoMap.value = map
```

level 2 分支同样处理：

```ts
      const map: Record<string, any> = {}
      const list = (result || []).map((item: any) => {
        map[`${item.id}`] = item
        return {
          id: `${item.id}`,
          value: `${item.id}`,
          label: item.name,
          isLeaf: true,
          path: [...data.path, `${item.id}`],
          params: { ...data.params, gradeId: item.id, gradeInfo: item },
          data: item
        }
      })
      gradeInfoMap.value = map
```

`loadGradeCascadeForEcho` 内，在 `hydrateGradeCascadePath` 调用之前填充（保证回显后用户改选时 map 完整）：

```ts
  // 回显预取到的列表同样填充映射表，避免用户回显后改选年级时 map 为空
  const sMap: Record<string, any> = {}
  ;(stageList || []).forEach((it: any) => { sMap[`${it.id}`] = it })
  stageInfoMap.value = sMap
  const gMap: Record<string, any> = {}
  ;(gradeList || []).forEach((it: any) => { gMap[`${it.id}`] = it })
  gradeInfoMap.value = gMap
```

**Step 6: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 13: 重写 `handleGradeChange`（修缺陷 1 + 缺陷 3）

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue`（`handleGradeChange`）

**Step 1: 整体替换函数体**

```ts
async function handleGradeChange(gradeValue: unknown) {
  // 级联为受控组件（无 v-model），refGradeId 只在此写入，保证 5 个 ref* 在同一同步块内写完
  const gradeId = typeof gradeValue === 'string' ? gradeValue : ''
  const form = generalForm.form
  form.refGradeId = gradeId

  if (!gradeId) {
    form.analysisGradeName = ''
    form.refCampusId = ''
    form.refStageId = ''
    form.refStageType = ''
    form.refGradeNumber = ''
    form.refBaseGradeId = ''
    subjectOptions.value = []
    classOptions.value = []
    return
  }

  // campusId / stageId 取自 level 2 的父节点 params（该层级的父节点就是学段节点，层级正确）
  const parentNode = gradeCascaderNode.value
  form.refStageId = `${parentNode?.params?.stageId ?? ''}` || form.refStageId
  form.refCampusId = `${parentNode?.params?.campusId ?? ''}` || form.refCampusId

  // 年级 / 学段实体一律从映射表取，不再从节点 ref 反读（缺陷 1 根因）
  const entities = resolveGradeEntities(
    gradeId,
    form.refStageId,
    gradeInfoMap.value,
    stageInfoMap.value
  )
  form.refBaseGradeId = entities.baseGradeId
  form.refGradeNumber = entities.gradeNumber
  form.refStageType = entities.stageType
  form.analysisGradeName = entities.gradeName

  // 学科 / 班级的重载由下方「年级级联路径」watch 统一负责（缺陷 3：避免重复请求）
}
```

**Step 2: 补 import**

把 `course-basic-data` 的 import 补上 `resolveGradeEntities`：

```ts
import {
  GRADE_RESET_FIELDS,
  buildTextbookQuery,
  findClassLabel,
  findNodeById,
  resolveGradeCascadePath,
  resolveGradeEntities,
} from '@/pages/course/types/course-basic-data'
```

**Step 3: 逐字复核每个字段的来源（关键）**

对照表，**确认没有一项来自节点 ref 的 `gradeInfo` / `stageInfo`**：

| 字段 | 来源 | 层级是否正确 |
|---|---|---|
| `refGradeId` | 级联 change 事件值 | — |
| `refStageId` | level 2 父节点 `params.stageId`（父节点 = 学段节点） | ✓ |
| `refCampusId` | level 2 父节点 `params.campusId` | ✓ |
| `refBaseGradeId` | `gradeInfoMap[gradeId].baseGradeId` | ✓ |
| `refGradeNumber` | `gradeInfoMap[gradeId].number` | ✓ |
| `refStageType` | `stageInfoMap[stageId].type` | ✓ |
| `analysisGradeName` | `gradeInfoMap[gradeId].name` | ✓ |

**Step 4: 确认旧的两个节点 ref 用法已全部清除**

```powershell
cd 'E:\code\frontend'; Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'params\?\.gradeInfo|params\?\.stageInfo|gradeStageNode\.value\?\.value|gradeStageNode\.value\?\.params'
```

Expected: **仅** level 1 / level 2 构建 `list` 时写入 `params` 的那几处可以命中；
`handleGradeChange` 内**不得**有命中。

**Step 5: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。`gradeStageNode` 若因不再被读取而报 unused，删掉该 ref 及其 level 1 赋值。

---

### Task 14: 级联改受控，去掉 `v-model`（修缺陷 2）

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue`（年级 ElCascader）

**Step 1: 改模板**

把年级 `ElCascader` 上的 `v-model="generalForm.form.refGradeId"` 改为
`:model-value="generalForm.form.refGradeId"`：

```vue
          <ElCascader v-if="generalForm.visible" :key="gradeCascaderKey" ref="gradeCascader"
            :model-value="generalForm.form.refGradeId" :props="gradeProps" :show-all-levels="false"
            :disabled="isNonCoreFieldDisabled"
            :class="generalForm.form.refGradeId && !generalForm.isCreateMode ? 'placeholder-black' : ''"
            clearable v-loading="gradeOptionsLoading" style="width: 100%"
            :placeholder="generalForm.form.refGradeId ? generalForm.form.analysisGradeName : '请选择年级'"
            @change="handleGradeChange" />
```

**Step 2: 确认级联无其它写值路径**

```powershell
cd 'E:\code\frontend'; Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'form\.refGradeId\s*='
```

Expected: **只有 2 处** —— `handleGradeChange` 内 1 处、回显 `Object.assign` 内 1 处。
模板中不得再有 `v-model` 写该字段。

---

### Task 15: 提交携带三个 id + 变更比对（修缺陷 4）

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue`（`setOptsForm` / `handleUpdateSubmit`）

**Step 1: `setOptsForm` 改为改名提交**

把 `setOptsForm` 中这段：

```ts
  delete submitForm.refCampusId
  delete submitForm.refStageId
  delete submitForm.refStageType
  delete submitForm.refGradeId
  delete submitForm.refGradeNumber
  delete submitForm.refBaseGradeId
```

替换为：

```ts
  // 三个 id 改名提交（spec §14.1），与 classRoomGetById 返回字段同名
  submitForm.campusId = submitForm.refCampusId
  submitForm.stageId = submitForm.refStageId
  submitForm.gradeId = submitForm.refGradeId
  delete submitForm.refCampusId
  delete submitForm.refStageId
  delete submitForm.refStageType
  delete submitForm.refGradeId
  delete submitForm.refGradeNumber
  delete submitForm.refBaseGradeId
```

> `refStageType` / `refGradeNumber` / `refBaseGradeId` 仍剔除：仅供前端调
> 教材 / 学科接口使用，不入库（spec §14.1）。

**Step 2: `handleUpdateSubmit` 三个 `ref*` 改为单独比对**

把该函数中「跳过 `ref*`」的分支替换为：

```ts
  async handleUpdateSubmit(form: any) {
    let flag = false
    // 年级级联的三个 id：列表行里没有，需与后端返回值单独比对（spec §18.4）
    if (
      (form.refCampusId ?? '') !== (props.opts?.campusId ?? '') ||
      (form.refStageId ?? '') !== (props.opts?.stageId ?? '') ||
      (form.refGradeId ?? '') !== (props.opts?.gradeId ?? '')
    ) {
      flag = true
    }
    for (const key in form) {
      if (key === 'isUseTool') continue
      // 三个 id 已在上面比对；其余 ref* 是纯辅助字段，列表行里没有，不参与比对
      if (key.startsWith('ref') && key !== 'refClassSnapshotPrimaryId') continue
      if (key === 'refClassSnapshotPrimaryId') {
        if (form[key] !== props.opts.refClassPrimaryId) {
          flag = true
        }
      } else {
        if (form[key] !== props.opts[key]) {
          flag = true
        }
      }
    }
    if (flag) {
      setOptsForm(form)
    } else {
      // 未发生变更则直接关闭弹窗
      generalForm.visible = false
    }
  },
```

> **注意：** `props.opts` 在新建态是 `{}`，此时三个 id 都为空字符串，
> 与 `form` 初始值一致 → 不会误判为有变更。

**Step 3: 确认提交体不含 `ref*` 残留**

```powershell
cd 'E:\code\frontend'; Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'delete submitForm\.'
```

Expected: 命中 6 处 `isEnableTeachingTool` / `isUseTool` / `isUseDiagnosis` /
`refCampusId` / `refStageId` / `refStageType` / `refGradeId` / `refGradeNumber` /
`refBaseGradeId` 中除三个 id 外的全部；且能看到 `submitForm.campusId = ...` 三行赋值。

**Step 4: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 16: 修订二交付验证

**Files:** 无（只跑命令）

**Step 1: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0，无 `error TS`。

**Step 2: 本模块单测**

```powershell
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/
```

Expected: 全通过（`course-basic-data.spec.ts` 应为 20 个用例）。

**Step 3: 门禁**

```powershell
cd 'E:\code\frontend'; node scripts/harness/validate-harness.mjs
```

Expected: 无本模块相关告警。

**Step 4: 静态自检四缺陷**

```powershell
cd 'E:\code\frontend'
Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'params\?\.gradeInfo|params\?\.stageInfo'
```

Expected: 仅命中 level 1/2 构建 `list` 的写入处，`handleGradeChange` 内无命中（缺陷 1）。

```powershell
Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'v-model="generalForm\.form\.refGradeId"'
```

Expected: **无输出**（缺陷 2）。

```powershell
Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'submitForm\.campusId|submitForm\.stageId|submitForm\.gradeId'
```

Expected: 各命中 1 处（缺陷 4）。

**Step 5: 浏览器联调（必须由人工执行）**

对照 spec §17 验收项逐条走。**重点看 Network 请求体实际值：**

1. `schoolGradeSubjectsList` 的 `baseGradeId` 非空、且 ≠ 年级条目的 `id`
2. `schoolGradeSubjectsList` 的 `stageId` 是学段 id（**不是校区 id**）
3. `textbooks/list` 的 `gradeLevelCode` 非空
4. `schoolClassList` 的 `stageId` / `gradeId` 正确
5. `teachingClassroom/insert` 请求体含 `campusId` / `stageId` / `gradeId`，
   且不含任何 `ref*` 字段
6. 每次选年级，学科 / 班级 / 教材接口**各只出现一次**
7. 编辑保存后重开，三个 id 能回显
8. 历史课堂（无三 id）打开时级联留空，保存被必填校验拦住

**Step 6: 交付自检 + 归档**

按 `docs/superpowers/HARNESS_RULES.md` §6 执行，写
`archive/新增课堂数据源统一-v2-delivered.md`（保留第一轮归档不动），
再跑 `validate-harness.mjs` 与 `status.mjs --match "新增课堂数据源统一"`。

**用户未要求时不自动 commit。**

---

## 修订二 Skill 路由标注（Mode A）

**图谱：** `E:\code\frontend-local\.agents\routing\SKILL_ROUTING.md`
**执行方式：** 同第一轮，router CLI 因 Junction 缺陷静默，改用其导出函数直接测评。

**机械结论：** Task 12～16 全部未达 `minConfidence=0.7`，无建议 skill。

**人工复核：** 与第一轮同一批 14 个 skill，逐一比对 `applicableConditions`：

| Skill | 结论 |
|-------|------|
| `superpowers-harness-run` / `superpowers-harness` / `superpowers-demand-workflow` | 流程控制，已在各自环节生效，plan 内不重复标注 |
| `frontend-design` / `tailwind-design-system` / `improve-animations` / `tailwindcss-animations` | 不适用：本次为缺陷修复，零样式改动 |
| `echarts` / `accessibility` / `figma-long-page` / `ccar-pdf-static-html` / `clone-website` | 不适用：与本次无关 |
| `skill-creator` | 不适用：不产出 skill |
| `debug-pro-1.0.0`（若在图谱中） | **人工提级标注**：本轮是 4 个缺陷的根因定位与修复，Task 13 要求逐字复核字段来源。虽未在 CLI 达标，但建议实施时按系统化调试思路操作「先确认层级、再改数据源」 |

**最终结论：** 12～16 无强制标注；Task 13 建议按根因分析纪律执行（逐字段溯源），不额外加载 skill。

---

# 修订三 · 实施计划（联调反馈：3 个缺陷）

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)（§19～§22）
**Requirement:** [../requirements/03-学科班级不随年级重新查询.md](../requirements/03-学科班级不随年级重新查询.md)
**档位:** 标准
**日期:** 2026-09-30

**目标：** 修掉联调反馈的 3 个缺陷——A 学科/班级**间歇性**不查询、B 学科响应字段取错、
C `gradeId` 口径用了 `id` 而非年级记录的 `gradeId`。

**与前两轮 plan 的关系：** Task 0～16 已执行完毕，本节为增量 Task 17～21。
改动面：`CreateCourseDialog.vue` + `course-basic-data.ts`（新增 1 个纯函数）+ 其 spec。

> **纪律提醒（本轮教训）：** 前三轮连续踩中「猜字段名 / 猜响应结构」类问题
> （`baseGradeId` vs `id`、学科响应字段、`gradeId` vs `id`）。
> 本轮实施时，**凡涉及接口字段的地方一律不再加 `??` 兜底**——
> 字段名错了就该显式炸出来，兜底只会把错误藏起来、拖到联调才暴露。

---

### Task 17: `findGradeByGradeId` 纯函数 + 单测（TDD）

**Files:**
- Modify: `src/pages/course/types/course-basic-data.ts`
- Modify: `src/pages/course/types/course-basic-data.spec.ts`

**Step 1: 写失败的测试**

在 `course-basic-data.spec.ts` 追加（import 中加入 `findGradeByGradeId`）：

```ts
describe('findGradeByGradeId', () => {
  // currentGradeList 返回项中 id 与 gradeId 是不同字段，这是本函数存在的原因
  const gradeList = [
    { id: '1001', gradeId: '2001', name: '初一', baseGradeId: 'b7', number: 7 },
    { id: '1002', gradeId: '2002', name: '初二', baseGradeId: 'b8', number: 8 }
  ]

  it('matches by the gradeId field, not by id', () => {
    expect(findGradeByGradeId(gradeList, '2002')?.name).toBe('初二')
  })

  it('does not match when the id happens to equal another entry gradeId', () => {
    // 若错误地按 id 匹配，'1001' 会命中第一项；按 gradeId 匹配则不应命中
    expect(findGradeByGradeId(gradeList, '1001')).toBeUndefined()
  })

  it('returns undefined when no gradeId matches', () => {
    expect(findGradeByGradeId(gradeList, 'nope')).toBeUndefined()
  })

  it('tolerates null / undefined list', () => {
    expect(findGradeByGradeId(null, '2001')).toBeUndefined()
    expect(findGradeByGradeId(undefined, '2001')).toBeUndefined()
  })
})
```

**Step 2: 跑测试确认失败**

```powershell
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/course-basic-data.spec.ts
```

Expected: FAIL，提示 `findGradeByGradeId` 未导出。

**Step 3: 写实现**

在 `course-basic-data.ts` 追加：

```ts
/**
 * 按年级记录的 `gradeId` 字段定位年级节点。
 *
 * `/backstage/schoolConfig/currentGradeList` 的返回项中 `id` 与 `gradeId` 是
 * 两个不同字段：级联值、`schoolClassList` 入参、课堂提交三处统一用 `gradeId`，
 * 因此不能用通用的 `findNodeById`（它按 `id` 匹配）。
 */
export function findGradeByGradeId(
  list: BasicDataNode[] | null | undefined,
  gradeId: string | null | undefined,
): BasicDataNode | undefined {
  if (!Array.isArray(list) || !gradeId) return undefined
  return list.find((item) => String(item?.gradeId ?? '') === String(gradeId))
}
```

**Step 4: 跑测试确认通过**

```powershell
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/course-basic-data.spec.ts
```

Expected: `Tests  24 passed`（原 20 + 新 4）。

---

### Task 18: 缺陷 C · `gradeId` 口径统一

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue`

**Step 1: `resolveGradeCascadePath` 改用 `findGradeByGradeId`**

把该函数中定位年级节点的一行：

```ts
  const grade = findNodeById(gradeList, gradeId)
```

改为：

```ts
  // 年级按 gradeId 字段匹配（currentGradeList 的 id 与 gradeId 是不同字段）
  const grade = findGradeByGradeId(gradeList, gradeId)
```

`campus` / `stage` 仍用 `findNodeById`（按 `id` 匹配，保持不变）。import 中加入 `findGradeByGradeId`。

**Step 2: level 2 节点 value 改用 `gradeId`**

把 level 2 分支中构建 `list` 的部分：

```ts
      const gMap: Record<string, any> = {}
      const list = (result || []).map((item: any) => {
        gMap[`${item.id}`] = item
        return {
          id: `${item.id}`,
          value: `${item.id}`,
```

改为：

```ts
      const gMap: Record<string, any> = {}
      const list = (result || []).map((item: any) => {
        // 统一口径：级联值 / schoolClassList 入参 / 课堂提交都用 gradeId 字段
        gMap[`${item.gradeId}`] = item
        return {
          id: `${item.gradeId}`,
          value: `${item.gradeId}`,
```

**Step 3: `loadGradeCascadeForEcho` 的 map 键同步**

把该函数内填充 `gradeInfoMap` 的一行：

```ts
  ;(gradeList || []).forEach((it: any) => { gMap[`${it.id}`] = it })
```

改为：

```ts
  ;(gradeList || []).forEach((it: any) => { gMap[`${it.gradeId}`] = it })
```

**Step 4: 确认三处「无需改动」的地方确实无需改**

```powershell
cd 'E:\code\frontend'; Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'getSchoolClassList|submitForm\.gradeId|opts\?\.gradeId'
```

Expected: `getSchoolClassList` 的入参仍为 `gradeId: refGradeId`；`submitForm.gradeId = submitForm.refGradeId`；
比对仍为 `form.refGradeId ?? '' !== props.opts?.gradeId ?? ''`。**三者都不需要修改**，
因为 `refGradeId` 的语义已在 Step 2 换为年级记录的 `gradeId`。

**Step 5: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 19: 缺陷 A · 两步修复（顺序不可颠倒）

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue`

> **Step 1 必须先于 Step 2。** 反序会产出「create 模式回显误触发清空+重载」的中间态。

**Step 1: 先给 create 模式回显补 `defLoading` 保护**

把 `watch(() => props.visible, ...)` 中的 create 分支：

```ts
  } else if (val) {
    // 创建模式：加载用户之前的选择
    isCoreLessonPlanLocked.value = false
    await loadFormCache()
  }
```

改为：

```ts
  } else if (val) {
    // 创建模式：加载用户之前的选择
    isCoreLessonPlanLocked.value = false
    // 与编辑模式一致：回显期间禁止「年级级联路径」watch 触发重置
    defLoading.value = true
    try {
      await loadFormCache()
    } finally {
      defLoading.value = false
    }
  }
```

**Step 2: 再删 `prev === undefined` 守卫**

把重置 watch 的回调首行：

```ts
    if (prev === undefined || next === prev) return
```

改为：

```ts
    // Vue watch 首次触发时 prev 恒为 undefined，原守卫会吞掉用户的第一次年级选择
    if (next === prev) return
```

**Step 3: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。若 `prev` 因不再使用而报 unused，保留形参（Vue watch 回调签名需要）即可，
或改为 `_prev`。

---

### Task 20: 缺陷 B · 学科响应字段名

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue`（`loadSubjectOptions`）

**Step 1: 改响应映射**

把：

```ts
    subjectOptions.value = (res || []).map((item: any) => {
      const name = item.subjectName ?? item.name ?? ''
      return { value: name, label: name, baseSubjectId: item.baseSubjectId }
    })
```

改为：

```ts
    // 响应字段为 name / id（用户实测）。不加 ?? 兜底：字段名再变应显式暴露
    subjectOptions.value = (res || []).map((item: any) => ({
      value: item.name,
      label: item.name,
      baseSubjectId: item.id
    }))
```

**Step 2: 确认全仓无残留 `item.baseSubjectId` 取值**

```powershell
cd 'E:\code\frontend'; Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'item\.baseSubjectId|\.subjectName'
```

Expected: **无输出**（`baseSubjectId` 作为前端字段名存在，但不再是接口取值来源；
`subjectName` 已完全不用——它是提交给后端的字段名，不是响应字段名）。

> 注意：`form.subjectName` 仍会出现在模板与提交体中，那是**前端表单字段名**，
> 本检查只针对 `item.` 前缀的响应取值。

**Step 3: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 21: 修订三交付验证

**Files:** 无（只跑命令）

**Step 1: 类型检查 + 单测**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/
```

Expected: typecheck 退出码 0；单测全通过（`course-basic-data.spec.ts` 应为 24 个用例）。

**Step 2: 门禁**

```powershell
cd 'E:\code\frontend'; node scripts/harness/validate-harness.mjs
```

Expected: 无本模块相关告警。

**Step 3: 三缺陷静态自检**

```powershell
cd 'E:\code\frontend'; $f='src\pages\course\components\CreateCourseDialog.vue'
Select-String -Path $f -Pattern 'prev === undefined'
```

Expected: **无输出**（缺陷 A）。

```powershell
Select-String -Path $f -Pattern 'value: `\$\{item\.id\}`'
```

Expected: 仅 level 0 / level 1（校区、学段）命中；**level 2（年级）不得命中**（缺陷 C）。

```powershell
Select-String -Path $f -Pattern 'item\.baseSubjectId|item\.subjectName'
```

Expected: **无输出**（缺陷 B）。

**Step 4: 浏览器联调（必须人工执行）**

对照 spec §21 + §22.5 验收项。**关键：两个 create 场景都要测**（有/无上次创建记录），
因为缺陷 A 是间歇的，只测一种场景会漏。

优先级最高的前 6 条：

1. **无上次记录**的新建弹窗 → 第一次选年级 → 学科/班级请求**都发出**
2. **有上次记录**的新建弹窗 → 第一次选年级 → 同样都发出
3. `schoolGradeSubjectsList` 的 `baseGradeId` 非空；响应能正常渲染出学科名
4. `schoolClassList` 的 `gradeId` = 年级记录的 `gradeId`（**≠** 该项的 `id`）
5. `teachingClassroom/insert` 的 `gradeId` 同样 = 年级记录的 `gradeId`
6. 教材版本下拉能出选项（`baseCourseId` 取自学科项的 `id`）
7. 编辑一条课堂 → 年级级联正确回显
8. 每次选年级，学科/班级/教材各只请求一次

**Step 5: 交付自检 + 归档**

按 `docs/superpowers/HARNESS_RULES.md` §6 执行，写
`archive/新增课堂数据源统一-v3-delivered.md`（前两轮归档保留不动），
再跑 `validate-harness.mjs` 与 `status.mjs --match "新增课堂数据源统一"`。

**用户未要求时不自动 commit。**

---

## 修订三 Skill 路由标注（Mode A）

**图谱：** `E:\code\frontend-local\.agents\routing\SKILL_ROUTING.md`
**执行方式：** router CLI 因 Junction 缺陷静默（详见第一轮「执行环境备注」），改用其导出函数直接测评。

**机械结论：** Task 17～21 全部未达 `minConfidence=0.7`，无建议 skill。

**人工复核：** 与前两轮同一批 14 个 skill，`applicableConditions` 逐条比对结论不变——
本次为事件守卫 + 字段口径修正，无 UI / 样式 / 动画 / 图表 / Figma / PDF 成分。

**提级标注（人工）：** Task 18、20 属「接口字段口径」类修改。前三轮连续在此处出错
（`baseGradeId` vs `id`、学科响应字段、`gradeId` vs `id`），故在这两个 Task 的
skill 标注中显式写入纪律：**不加 `??` 兜底，字段名变化必须显式暴露**。
该纪律不依赖任何 skill，靠 plan 内的显式指令约束即可。

**最终结论：** Task 17～21 无 skill 标注。

---

# 修订四 · 实施计划（级联改用完整路径）

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)（§23～§24）
**Requirement:** [../requirements/04-年级级联改用完整路径.md](../requirements/04-年级级联改用完整路径.md)
**档位:** 标准
**日期:** 2026-09-30

**目标：** 修掉「切换来切换去就突然不请求」，根因是 v2 引入的受控级联回归
（未接 `@update:modelValue` → 点非叶子节点时值错位 → 后续 `change` 失效），
并顺带修掉「只切校区/学段时旧选项不重置」。

**与前三轮 plan 的关系：** Task 0～21 已执行完毕，本节为增量 Task 22～25。
改动仅 `CreateCourseDialog.vue` 一个文件；`course-basic-data.ts` **不动**
（`resolveGradeEntities` / `findGradeByGradeId` 现有 44 例已覆盖）。

> **本轮性质提示（与前三轮不同）：** 前三轮修的都是「字段取错」，
> 可用静态检查 + 单测验证。本轮改的是**交互触发机制**，
> 静态检查只能证明「代码按 spec 写了」，**证明不了 Element Plus 的 change 行为符合预期**。
> 因此 spec §24.6 第 1、2、3 条（连续切换、跨校区切换、只切校区清空）
> **必须由人工连点验证**，不得以静态检查通过为由跳过。

---

### Task 22: 级联改回 `v-model` + 去掉 `emitPath: false`

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue`

**Step 1: 去掉 `emitPath: false`，新增路径 ref**

把 `gradeProps` 声明中：

```ts
  lazy: true,
  emitPath: false,
  lazyLoad(node: any, resolve: (data: NodeData[]) => void) {
```

改为：

```ts
  lazy: true,
  lazyLoad(node: any, resolve: (data: NodeData[]) => void) {
```

并在 `gradeCascaderKey` 附近新增：

```ts
/** 级联选中路径：[campusId, stageId, gradeId?]；未选年级时为前两项 */
const gradeCascaderValue = ref<string[]>([])
```

**Step 2: 模板改回 `v-model`**

把年级 `ElCascader` 上：

```vue
            :model-value="generalForm.form.refGradeId" :props="gradeProps" :show-all-levels="false"
```

改为：

```vue
            v-model="gradeCascaderValue" :props="gradeProps" :show-all-levels="false"
```

FormItem 的 `prop="refGradeId"` **保持不变**（必填校验的是"是否选了年级"）。

**Step 3: 确认受控痕迹已清除**

```powershell
cd 'E:\code\frontend'; Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern ':model-value="generalForm\.form\.refGradeId"|emitPath'
```

Expected: **无输出**。

**Step 4: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 23: 重写 `handleGradeChange`（完整路径解析 + 重置 + 加载）

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue`

**Step 1: 整体替换函数体**

把现有 `handleGradeChange` 全文替换为：

```ts
/**
 * 年级级联变化（唯一触发点：重置与加载都在这里完成，不再依赖 watch）。
 *
 * 用完整路径而非「父节点 params 反推 id」，原因：
 * - 反推依赖「哪一层的 lazyLoad 最后执行过」，层级一错就取到空值
 * - 完整路径让「只切了校区/学段、年级未变」成为可观测信号，
 *   否则旧年级的学科/班级选项会残留在下拉里
 */
async function handleGradeChange(path: unknown) {
  // 完整路径 [campusId, stageId, gradeId?]；点非叶子节点时为较短路径，清空时为 null
  const p: string[] = Array.isArray(path) ? path.map((v) => `${v}`) : []
  const campusId = p[0] ?? ''
  const stageId = p[1] ?? ''
  const gradeId = p[2] ?? ''

  const form = generalForm.form
  form.refCampusId = campusId
  form.refStageId = stageId
  form.refGradeId = gradeId

  // 一律先重置下游。chapters 每次新建，避免复用 GRADE_RESET_FIELDS 里的共享数组引用
  Object.assign(form, { ...GRADE_RESET_FIELDS, chapters: [] })
  subjectOptions.value = []
  classOptions.value = []
  textbookVersionOptions.value = []
  chapterOptions.value = []

  // 只切了校区 / 学段、尚未选年级：清空后即止（学科与班级接口都需要年级相关入参）
  if (!gradeId) {
    form.analysisGradeName = ''
    form.refStageType = ''
    form.refGradeNumber = ''
    form.refBaseGradeId = ''
    return
  }

  // 年级 / 学段实体一律从映射表取
  const entities = resolveGradeEntities(gradeId, stageId, gradeInfoMap.value, stageInfoMap.value)
  form.refBaseGradeId = entities.baseGradeId
  form.refGradeNumber = entities.gradeNumber
  form.refStageType = entities.stageType
  form.analysisGradeName = entities.gradeName

  await loadSubjectOptions(form.refBaseGradeId, form.refStageId)
  await loadClassOptions()
}
```

**Step 2: 确认已不再从父节点取 id**

```powershell
cd 'E:\code\frontend'; Select-String -Path 'src\pages\course\components\CreateCourseDialog.vue' -Pattern 'gradeCascaderNode'
```

Expected: 仍可命中（Task 24 才删），但 **`handleGradeChange` 体内不得命中**。
取函数体核对：

```powershell
$c = Get-Content 'src\pages\course\components\CreateCourseDialog.vue' -Encoding UTF8
$s = ($c | Select-String 'async function handleGradeChange' | Select-Object -First 1).LineNumber
$c[($s-1)..($s+38)] | Select-String 'gradeCascaderNode|parentNode'
```

Expected: **无输出**。

**Step 3: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 24: 删除重置 watch 与 `gradeCascaderNode`，回显适配

**Files:**
- Modify: `src/pages/course/components/CreateCourseDialog.vue`

> **Step 顺序：** 必须先做完 Task 22/23 再执行本步——watch 的删除依赖
> `handleGradeChange` 已接管全部职责，否则会短暂失去「重置 + 加载」。

**Step 1: 删除重置 watch**

删除整个 watch 块（含其上两行注释）：

```ts
// 监听年级级联路径（校区+学段+年级）：任一变化即重置学科/班级/教材/章节
// 同一 gradeId 在不同校区下班级不同，故不可只监听 gradeId
watch(
  () => [
    generalForm.form.refCampusId,
    generalForm.form.refStageId,
    generalForm.form.refGradeId
  ].join('|'),
  async (next, prev) => {
    ...
  }
)
```

**Step 2: 删除 `gradeCascaderNode` 的声明与两处赋值**

- 声明处（与 `gradeCascader` 附近）：
  ```ts
  /** 年级级联的父节点（= 学段节点），change 时从中取 campusId / stageId */
  const gradeCascaderNode = ref<any>(null)
  ```
  整行删除。
- `handleGradeLoadNode` level 2 分支中的 `gradeCascaderNode.value = data` —— 删除。
- `loadGradeCascadeForEcho` 中构造 `gradeCascaderNode.value = {...}` 的整段 `if` —— 删除。

**Step 3: 回显时补上级联路径**

在 `loadGradeCascadeForEcho` 写完 `gradeCascaderKey.value += 1` 之后，追加：

```ts
  // 回显时同步级联选中路径。v-model 直接写值不会触发 @change，故不会误触发重置与加载
  if (campus && stage && grade) {
    gradeCascaderValue.value = [`${campus.id}`, `${stage.id}`, `${grade.id}`]
  } else {
    gradeCascaderValue.value = []
  }
```

**Step 4: 三项残留自检**

```powershell
cd 'E:\code\frontend'; $f='src\pages\course\components\CreateCourseDialog.vue'
Select-String -Path $f -Pattern 'gradeCascaderNode'
```

Expected: **无输出**。

```powershell
Select-String -Path $f -Pattern 'refCampusId,'
```

Expected: **无输出**（重置 watch 的监听源已删；`refCampusId: campusId` 解构形式不含逗号，命中即为残留）。

```powershell
Select-String -Path $f -Pattern 'emitPath|:model-value="generalForm\.form\.refGradeId"'
```

Expected: **无输出**。

**Step 5: 类型检查 + 单测**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/
```

Expected: typecheck 退出码 0；单测 44 例全通过（本轮不应新增用例）。

---

### Task 25: 修订四交付验证

**Files:** 无（只跑命令）

**Step 1: 门禁**

```powershell
cd 'E:\code\frontend'; node scripts/harness/validate-harness.mjs
```

Expected: 无本模块相关告警。

**Step 2: 静态自检汇总**

| 检查 | 命令 | Expected |
|------|------|----------|
| 无 `gradeCascaderNode` | `Select-String 'gradeCascaderNode'` | 无输出 |
| 无重置 watch | `Select-String 'refCampusId,'` | 无输出 |
| 无 `emitPath` | `Select-String 'emitPath'` | 无输出 |
| 无受控写法 | `Select-String ':model-value="generalForm\.form\.refGradeId"'` | 无输出 |
| 路径 ref 已使用 | `Select-String 'gradeCascaderValue'` | 至少 3 处（声明、模板 v-model、handleGradeChange） |

**Step 3: 浏览器联调（必须人工执行 —— 本轮重点）**

⚠️ **本轮修的是交互触发机制，静态检查证明不了行为正确。**
spec §24.6 前 3 条必须人工连点验证：

1. **连续切换 5 个以上不同年级**（同一校区/学段）→ 每一次都要发出学科 + 班级请求
2. **跨校区切年级** → 每一次都要发出请求
3. **切换校区但不选年级** → 学科/班级/教材/章节下拉**立即清空**，不残留旧年级选项
4. 切换校区后不选年级直接点保存 → 必填校验拦住
5. 级联点清空 X → ref* 归零、显示 placeholder
6. 编辑模式打开 → 级联正确显示已选路径 + 正常 label
7. 创建模式打开（有上次记录）→ 级联正确显示，且**没有**多余请求
8. 每次选年级，学科/班级/教材各只请求一次
9. 核心教案、授课工具、保存/取消行为不变

**若第 1 条仍失败：** 说明 Element Plus 在懒加载 + 完整路径下 `change` 的触发时机
与预期不同。请把「点了什么 → Network 里发了哪些请求」告诉我，
**不要靠加守卫/兜底掩盖**。

**Step 4: 交付自检 + 归档**

按 `docs/superpowers/HARNESS_RULES.md` §6 执行，写
`archive/新增课堂数据源统一-v4-delivered.md`（前三轮归档保留不动），
再跑 `validate-harness.mjs` 与 `status.mjs --match "新增课堂数据源统一"`。

**用户未要求时不自动 commit。**

---

## 修订四 Skill 路由标注（Mode A）

**图谱：** `E:\code\frontend-local\.agents\routing\SKILL_ROUTING.md`
**执行方式：** router CLI 因 Junction 缺陷静默（详见第一轮「执行环境备注」），改用其导出函数直接测评。

**机械结论：** Task 22～25 全部未达 `minConfidence=0.7`，无建议 skill。

**人工复核：** 与前三轮同一批 14 个 skill，`applicableConditions` 逐条比对结论不变。
本轮涉及 Element Plus 组件的受控/非受控与事件行为，**图谱中无对应 skill**
（`frontend-design` 针对视觉方向、`tailwind-design-system` 针对样式系统，均不适用）。

**最终结论：** Task 22～25 无 skill 标注。

**提级标注（人工）：** Task 25 Step 3 标注为「需人工确认」——
本轮改的是交互触发机制，静态验证不足以闭环，必须由人工连点验证。
