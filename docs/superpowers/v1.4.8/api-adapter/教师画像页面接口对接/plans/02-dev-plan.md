# 教师画像页面 — 真实 HTTP 接入与 VO 变更适配 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/02-dev-spec.md](../specs/02-dev-spec.md)

**Requirement:** [requirements/02-真实HTTP接入与VO变更适配.md](../requirements/02-真实HTTP接入与VO变更适配.md)

**Goal:** 接入 `getTeacherProfile` HTTP，更新 ClassroomClarity / SpeakingComprehensibility VO 与 Adapter，扩展 slice 与 Container 优先展示接口 `level`/`classroomFeature`，Mock 开关控制 mock | HTTP 双轨。

**Architecture:** 01 已有 5 Adapter + 门面不变；02 更新 2 个 VO/Adapter、扩展 2 slice、新增 HTTP service、`useTeacherPortraitData` 双轨取数，其余 aggregate 仍 merge `FULL_MOCK_BASE`。

**Tech Stack:** Vue 3 + TypeScript + vitest + defineService + Element Plus ElMessage

---

## 文件总览

| 操作 | 路径 |
|------|------|
| Create | `src/pages/school/teacher-portrait/api/get-teacher-profile.ts` |
| Create | `src/pages/school/teacher-portrait/api/merge-teacher-portrait-aggregate.ts` |
| Modify | `src/pages/school/teacher-portrait/api/types/teacher-profile-rsp.vo.ts` |
| Modify | `src/pages/school/teacher-portrait/components/classroom-structure-clarity/types.ts` |
| Modify | `src/pages/school/teacher-portrait/components/language-comprehensibility/types.ts` |
| Modify | `src/pages/school/teacher-portrait/adapters/classroom-structure-clarity.adapter.ts` |
| Modify | `src/pages/school/teacher-portrait/adapters/language-comprehensibility.adapter.ts` |
| Modify | `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts` |
| Modify | `src/pages/school/teacher-portrait/mock/teacher-profile-api.mock.ts` |
| Modify | `src/pages/school/teacher-portrait/mock/teacher-portrait-aggregate.mock.ts` |
| Modify | `src/pages/school/teacher-portrait/composables/teacher-portrait-debug.ts` |
| Modify | `src/pages/school/teacher-portrait/composables/useTeacherPortraitData.ts` |
| Modify | `src/pages/school/teacher-portrait/composables/useTeacherPortraitContext.ts` |
| Modify | `src/pages/school/teacher-portrait/components/RoleDebugBar.vue` |
| Modify | `src/pages/school/teacher-portrait/teacher-portrait/index.vue` |
| Modify | `src/pages/school/teacher-portrait/components/classroom-structure-clarity/ClassroomStructureClarityContainer.vue` |
| Modify | `src/pages/school/teacher-portrait/components/language-comprehensibility/LanguageComprehensibilityContainer.vue` |

**禁止修改：** 01 未变更的 3 个 Adapter 业务逻辑、`my-lesson-plan.adapter.ts` / `classroom-content-eval.adapter.ts` / `classroom-language-behavior.adapter.ts` 内部实现（仅随 fixture 类型编译通过）

---

### Task 1: 更新 VO 类型（ClassroomClarity + SpeakingComprehensibility）

**Files:**
- Modify: `src/pages/school/teacher-portrait/api/types/teacher-profile-rsp.vo.ts`

- [ ] **Step 1: 删除 `ClarityDetailVO`，替换 `ClassroomClarityVO`**

```ts
export type ClassroomClarityVO = {
  goalClarityScore?: number
  stageClarityScore?: number
  logicClarityScore?: number
  summaryClarityScore?: number
  totalScore?: number
  level?: string | null
  classroomFeature?: string | null
}
```

- [ ] **Step 2: 替换 `SpeakingComprehensibilityVO`**

```ts
export type SpeakingComprehensibilityVO = {
  vocabularyScore?: number
  syntaxScore?: number
  contentScore?: number
  totalScore?: number
  level?: string | null
  classroomFeature?: string | null
}
```

- [ ] **Step 3: 运行 typecheck 确认仅 adapter/mock 报错（预期）**

Run: `pnpm typecheck`
Expected: 报错集中在 `classroom-structure-clarity.adapter.ts`、`language-comprehensibility.adapter.ts`、`teacher-profile-api.mock.ts`

---

### Task 2: 扩展 slice 类型

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/classroom-structure-clarity/types.ts`
- Modify: `src/pages/school/teacher-portrait/components/language-comprehensibility/types.ts`

- [ ] **Step 1: 扩展 `ClassroomStructureClaritySlice`**

```ts
export type ClassroomStructureClaritySlice = {
  dimensions: StructureDimensionItem[]
  level?: string | null
  classroomFeature?: string | null
}
```

- [ ] **Step 2: 扩展 `LanguageComprehensibilitySlice`**

```ts
export type LanguageComprehensibilitySlice = {
  totalScore: number
  dimensions: {
    vocabulary: ComprehensibilityDimensionSlice
    syntax: ComprehensibilityDimensionSlice
    content: ComprehensibilityDimensionSlice
  }
  level?: string | null
  classroomFeature?: string | null
}
```

---

### Task 3: 更新 API mock fixture（新 VO 形态）

**Files:**
- Modify: `src/pages/school/teacher-portrait/mock/teacher-profile-api.mock.ts`

- [ ] **Step 1: 替换 `classroomClarity` 块**

```ts
classroomClarity: {
  goalClarityScore: 22,
  stageClarityScore: 20,
  logicClarityScore: 18,
  summaryClarityScore: 12,
  totalScore: 72,
  level: '中等',
  classroomFeature: '结构较清晰，偶尔有模糊之处',
},
```

- [ ] **Step 2: 替换 `speakingComprehensibility` 块**

```ts
speakingComprehensibility: {
  vocabularyScore: 20,
  syntaxScore: 20,
  contentScore: 10,
  totalScore: 50,
  level: '中等',
  classroomFeature: '语言较通俗，偶有难懂之处',
},
```

- [ ] **Step 3: 更新 `getTeacherProfileApiMock` 签名（支持 empty）**

```ts
import { isTeacherPortraitDebugEmpty } from '../composables/teacher-portrait-debug'

export function getTeacherProfileApiMock(teacherId: string): TeacherProfileRspVO {
  if (teacherId === 'teacher-empty' || isTeacherPortraitDebugEmpty()) {
    return EMPTY_TEACHER_PROFILE_API
  }
  return API_MOCK_BY_TEACHER_ID[teacherId] ?? FULL_TEACHER_PROFILE_API
}
```

> 注：`isTeacherPortraitDebugEmpty()` 仅在 **Mock ON** 路径调用此函数时生效；HTTP 路径不调用 mock。

---

### Task 4: 课堂结构清晰度 Adapter（TDD）

**Files:**
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/classroom-structure-clarity.adapter.ts`

- [ ] **Step 1: 更新失败测试（新 VO）**

将 `adaptClassroomStructureClarity` 测试改为：

```ts
describe('adaptClassroomStructureClarity', () => {
  it('maps *Score fields to dimensions and passes level/classroomFeature', () => {
    const slice = adaptClassroomStructureClarity({
      goalClarityScore: 22,
      stageClarityScore: 20,
      logicClarityScore: 18,
      summaryClarityScore: 12,
      level: '中等',
      classroomFeature: '结构较清晰，偶尔有模糊之处',
    })
    expect(slice?.dimensions[1]).toMatchObject({
      key: 'segmentClarity',
      label: '环节清晰度',
      score: 20,
      maxScore: 25,
    })
    expect(slice?.level).toBe('中等')
    expect(slice?.classroomFeature).toBe('结构较清晰，偶尔有模糊之处')
  })
})
```

- [ ] **Step 2: 运行测试确认 FAIL**

Run: `pnpm exec vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts -t adaptClassroomStructureClarity`
Expected: FAIL（仍读 `averageScore`）

- [ ] **Step 3: 重写 adapter**

```ts
import type { ClassroomClarityVO } from '../api/types/teacher-profile-rsp.vo'
import type { ClassroomStructureClaritySlice } from '../types/aggregate'
import { STRUCTURE_CLARITY_DIMENSIONS } from '../components/classroom-structure-clarity/constants'

const API_SCORE_KEY_BY_SLICE_KEY: Record<string, keyof ClassroomClarityVO> = {
  goalClarity: 'goalClarityScore',
  segmentClarity: 'stageClarityScore',
  logicClarity: 'logicClarityScore',
  summaryClarity: 'summaryClarityScore',
}

export function adaptClassroomStructureClarity(
  vo: ClassroomClarityVO | null | undefined,
): ClassroomStructureClaritySlice | null {
  if (!vo) return null

  const dimensions = STRUCTURE_CLARITY_DIMENSIONS.map((def) => {
    const apiKey = API_SCORE_KEY_BY_SLICE_KEY[def.key]
    const score = vo[apiKey]
    return {
      key: def.key,
      label: def.label,
      score: typeof score === 'number' ? score : 0,
      maxScore: def.maxScore,
    }
  })

  return {
    dimensions,
    level: vo.level ?? null,
    classroomFeature: vo.classroomFeature ?? null,
  }
}
```

- [ ] **Step 4: 运行测试确认 PASS**

Run: `pnpm exec vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts -t adaptClassroomStructureClarity`
Expected: PASS

---

### Task 5: 语言可理解度 Adapter（TDD）

**Files:**
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/language-comprehensibility.adapter.ts`

- [ ] **Step 1: 更新失败测试**

```ts
describe('adaptLanguageComprehensibility', () => {
  it('maps *Score fields, decimals, level and classroomFeature', () => {
    const slice = adaptLanguageComprehensibility({
      vocabularyScore: 28.5,
      syntaxScore: 30,
      contentScore: 22,
      totalScore: 80.5,
      level: '良好',
      classroomFeature: '语言表达清晰，学生易于理解',
    })
    expect(slice?.totalScore).toBe(80.5)
    expect(slice?.dimensions.vocabulary).toEqual({ score: 28.5, maxScore: 35 })
    expect(slice?.level).toBe('良好')
    expect(slice?.classroomFeature).toBe('语言表达清晰，学生易于理解')
  })
})
```

- [ ] **Step 2: 运行测试确认 FAIL**

Run: `pnpm exec vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts -t adaptLanguageComprehensibility`
Expected: FAIL

- [ ] **Step 3: 重写 adapter**

```ts
const SCORE_KEY_BY_DIM: Record<string, keyof SpeakingComprehensibilityVO> = {
  vocabulary: 'vocabularyScore',
  syntax: 'syntaxScore',
  content: 'contentScore',
}

export function adaptLanguageComprehensibility(
  vo: SpeakingComprehensibilityVO | null | undefined,
): LanguageComprehensibilitySlice | null {
  if (!vo) return null

  const dimensions = Object.fromEntries(
    COMPREHENSIBILITY_DIMENSIONS.map((def) => {
      const apiKey = SCORE_KEY_BY_DIM[def.key]
      const score = vo[apiKey]
      return [
        def.key,
        {
          score: typeof score === 'number' ? score : 0,
          maxScore: def.defaultMaxScore,
        },
      ]
    }),
  ) as LanguageComprehensibilitySlice['dimensions']

  return {
    totalScore: typeof vo.totalScore === 'number' ? vo.totalScore : 0,
    dimensions,
    level: vo.level ?? null,
    classroomFeature: vo.classroomFeature ?? null,
  }
}
```

- [ ] **Step 4: 更新集成测试期望值**

`adaptTeacherProfileSlices` 中 `languageComprehensibility?.dimensions.vocabulary.score` 仍为 `20`（与 fixture 一致）。

Run: `pnpm exec vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`
Expected: ALL PASS

---

### Task 6: HTTP 服务

**Files:**
- Create: `src/pages/school/teacher-portrait/api/get-teacher-profile.ts`

- [ ] **Step 1: 新建 service**

```ts
import { defineService } from '@/utils/define-service'
import request from '@/utils/request'
import type { TeacherProfileRspVO } from './types/teacher-profile-rsp.vo'

export type GetTeacherProfileParams = {
  tenantUserId: string
}

export const getTeacherProfile = defineService<GetTeacherProfileParams, TeacherProfileRspVO>(
  async function (params, config) {
    return request.get('/analysis/v2/teachingDiagnosis/getTeacherProfile', {
      params,
      ...config,
    })
  },
)
```

- [ ] **Step 2: typecheck**

Run: `pnpm typecheck`
Expected: PASS（或仅剩未改完的数据层报错）

---

### Task 7: Mock 开关 + RoleDebugBar UI

**Files:**
- Modify: `src/pages/school/teacher-portrait/composables/teacher-portrait-debug.ts`
- Modify: `src/pages/school/teacher-portrait/composables/useTeacherPortraitContext.ts`
- Modify: `src/pages/school/teacher-portrait/components/RoleDebugBar.vue`
- Modify: `src/pages/school/teacher-portrait/teacher-portrait/index.vue`

- [ ] **Step 1: 扩展 debug composable**

```ts
export const teacherPortraitUseMockData = ref(true)

export function isTeacherPortraitMockEnabled(): boolean {
  return teacherPortraitUseMockData.value
}
```

- [ ] **Step 2: Context 暴露 `useMockData`**

`useTeacherPortraitContext.ts` 的 context 类型与 `index.vue` provide 增加：

```ts
useMockData: typeof teacherPortraitUseMockData
```

- [ ] **Step 3: RoleDebugBar 增加 Mock 开关行**

```vue
<div class="role-debug-bar__row">
  <span class="role-debug-bar__title">Mock 数据</span>
  <ElSwitch v-model="useMockModel" active-text="开" inactive-text="关" />
</div>
```

```ts
const useMockModel = defineModel<boolean>('useMock', { default: true })
```

更新 `roleHint`：Mock 关 → 提示「5 模块走 getTeacherProfile HTTP」。

- [ ] **Step 4: index.vue 绑定**

```vue
<RoleDebugBar
  v-model:role="debugRole"
  v-model:data-mode="teacherPortraitDebugDataMode"
  v-model:use-mock="teacherPortraitUseMockData"
  ...
/>
```

---

### Task 8: 抽取 aggregate merge + 双轨取数

**Files:**
- Create: `src/pages/school/teacher-portrait/api/merge-teacher-portrait-aggregate.ts`
- Modify: `src/pages/school/teacher-portrait/mock/teacher-portrait-aggregate.mock.ts`
- Modify: `src/pages/school/teacher-portrait/composables/useTeacherPortraitData.ts`

- [ ] **Step 1: 抽取 merge 函数**

新建 `merge-teacher-portrait-aggregate.ts`（从 mock 文件迁出 `FULL_MOCK_BASE` + merge 逻辑）：

```ts
import type { TeacherPortraitAggregate } from '../types/aggregate'
import type { TeacherProfileAdaptedSlices } from '../adapters'

export function mergeTeacherPortraitAggregate(
  adapted: TeacherProfileAdaptedSlices,
  overrides: Partial<TeacherPortraitAggregate> = {},
): TeacherPortraitAggregate {
  return {
    ...FULL_MOCK_BASE,
    myLessonPlan: adapted.myLessonPlan,
    classroomContentEval: adapted.classroomContentEval,
    classroomStructureClarity: adapted.classroomStructureClarity,
    classroomLanguageBehavior: adapted.classroomLanguageBehavior,
    languageComprehensibility: adapted.languageComprehensibility,
    ...overrides,
  }
}

export function emptyTeacherPortraitAggregate(): TeacherPortraitAggregate {
  return { ...EMPTY_MOCK }
}
```

`teacher-portrait-aggregate.mock.ts` 改为 import 上述函数，`buildAggregateFromApi` 调用 `mergeTeacherPortraitAggregate(adaptTeacherProfileSlices(vo))`。

- [ ] **Step 2: 实现 `resolveTeacherProfileVo`**

在 `useTeacherPortraitData.ts` 或同目录 `resolve-teacher-profile-vo.ts`：

```ts
async function resolveTeacherProfileVo(tenantUserId: string): Promise<TeacherProfileRspVO> {
  if (isTeacherPortraitMockEnabled()) {
    return getTeacherProfileApiMock(tenantUserId)
  }
  const data = await getTeacherProfile({ tenantUserId })
  return data ?? {}
}
```

- [ ] **Step 3: 改造 `fetchAggregate`**

```ts
import { ElMessage } from 'element-plus'
import { adaptTeacherProfileSlices } from '../adapters'
import { getTeacherProfile } from '../api/get-teacher-profile'
import { mergeTeacherPortraitAggregate, emptyTeacherPortraitAggregate } from '../api/merge-teacher-portrait-aggregate'
import { getTeacherProfileApiMock } from '../mock/teacher-profile-api.mock'
import { isTeacherPortraitMockEnabled, teacherPortraitUseMockData, teacherPortraitDebugDataMode } from './teacher-portrait-debug'

async function fetchAggregate(teacherId: string) {
  loading.value = true
  try {
    if (isTeacherPortraitMockEnabled() && isTeacherPortraitDebugEmpty()) {
      aggregate.value = emptyTeacherPortraitAggregate()
      return
    }
    const vo = isTeacherPortraitMockEnabled()
      ? getTeacherProfileApiMock(teacherId)
      : await getTeacherProfile({ tenantUserId: teacherId })
    const adapted = adaptTeacherProfileSlices(vo ?? {})
    aggregate.value = mergeTeacherPortraitAggregate(adapted, MOCK_BY_TEACHER_ID[teacherId] ? undefined : {})
  } catch {
    ElMessage.error('教师画像数据加载失败')
    aggregate.value = mergeTeacherPortraitAggregate({
      myLessonPlan: null,
      classroomContentEval: null,
      classroomStructureClarity: null,
      classroomLanguageBehavior: null,
      languageComprehensibility: null,
    })
  } finally {
    loading.value = false
  }
}

watch([activeTeacherId, teacherPortraitDebugDataMode, teacherPortraitUseMockData], ...)
```

> HTTP 失败时 5 slice 置 null，其余 `FULL_MOCK_BASE` 仍展示 mock 卡片/标签云。

- [ ] **Step 4: 保留 `fetchTeacherPortraitAggregateMock` 供单测**

mock 文件 export 不变，内部复用 merge。

---

### Task 9: Container 优先接口 level / classroomFeature

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/classroom-structure-clarity/ClassroomStructureClarityContainer.vue`
- Modify: `src/pages/school/teacher-portrait/components/language-comprehensibility/LanguageComprehensibilityContainer.vue`

- [ ] **Step 1: ClassroomStructureClarityContainer**

```ts
const grade = resolveClarityGrade(totalScore)
const apiLevel = slice.level?.trim()
const apiFeature = slice.classroomFeature?.trim()

return {
  ...
  gradeLabel: apiLevel || grade.label,
  gradeFeature: apiFeature || grade.description,
  gradeColor: grade.color,
  gradeBgColor: grade.bgColor,
  gradeBorderColor: grade.borderColor,
  ...
}
```

- [ ] **Step 2: LanguageComprehensibilityContainer**

```ts
const grade = resolveComprehensibilityGrade(slice.totalScore)
const apiLevel = slice.level?.trim()
const apiFeature = slice.classroomFeature?.trim()

return {
  ...
  gradeLabel: apiLevel || grade.label,
  gradeFeature: apiFeature || grade.feature,
  ...
}
```

- [ ] **Step 3: 手工验证**

Mock ON + full → 汇总区展示 fixture 中 `level` / `classroomFeature` 文案。

---

### Task 10: 全量验证

- [ ] **Step 1: vitest**

Run: `pnpm exec vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`
Expected: ALL PASS

- [ ] **Step 2: typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: 手工联调清单**

| 场景 | 预期 |
|------|------|
| Mock ON + full | 5 模块有数据；结构/可理解度汇总区为 fixture 文案 |
| Mock ON + empty | 5 模块空态；左栏仍可按角色 empty 规则 |
| Mock OFF + 选教师 | Network 见 `getTeacherProfile?tenantUserId=` |
| Mock OFF + 接口 `{}` | 5 模块空态，不读本地 empty fixture |
| Mock OFF + 断网/500 | ElMessage + 5 模块空态 |

---

## Spec 覆盖自检

| Spec 章节 | 对应 Task |
|-----------|-----------|
| §4 HTTP 服务 | Task 6 |
| §5 Mock 开关矩阵 | Task 3, 7, 8 |
| §6 类型更新 | Task 1, 2 |
| §7 Adapter | Task 4, 5 |
| §8 Container | Task 9 |
| §11 测试 | Task 4, 5, 10 |

---

## 不在本计划

- 其余 aggregate HTTP
- 接口 MD 文档同步
- 语言可理解度一位小数展示
