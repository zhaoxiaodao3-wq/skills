# 教师画像页面 — 预对接部分字段 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 建立 `TeacherProfileRspVO`（5 字段）→ aggregate slice 的 Adapter 链路，mock 源改为 API 形态 JSON 经 Adapter 注入，5 个组件渲染不变。

**Architecture:** 方案 B — 5 个 per-slice adapter + `adaptTeacherProfileSlices` 门面；mock 层合并 adapter 产出与其余 slice。

**Tech Stack:** Vue 3 + TypeScript + vitest

---

## 文件总览

| 操作 | 路径 |
|------|------|
| Create | `src/pages/school/teacher-portrait/api/types/teacher-profile-rsp.vo.ts` |
| Create | `src/pages/school/teacher-portrait/adapters/constants/content-eval-dimensions.ts` |
| Create | `src/pages/school/teacher-portrait/adapters/my-lesson-plan.adapter.ts` |
| Create | `src/pages/school/teacher-portrait/adapters/classroom-content-eval.adapter.ts` |
| Create | `src/pages/school/teacher-portrait/adapters/classroom-structure-clarity.adapter.ts` |
| Create | `src/pages/school/teacher-portrait/adapters/classroom-language-behavior.adapter.ts` |
| Create | `src/pages/school/teacher-portrait/adapters/language-comprehensibility.adapter.ts` |
| Create | `src/pages/school/teacher-portrait/adapters/index.ts` |
| Create | `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts` |
| Create | `src/pages/school/teacher-portrait/mock/teacher-profile-api.mock.ts` |
| Modify | `src/pages/school/teacher-portrait/mock/teacher-portrait-aggregate.mock.ts` |

**禁止修改：** `types/aggregate.ts`、5 个 Container/View、`useTeacherPortraitData.ts` 逻辑结构

---

### Task 1: 接口原始类型 `TeacherProfileRspVO`（5 字段）

**Files:**
- Create: `src/pages/school/teacher-portrait/api/types/teacher-profile-rsp.vo.ts`

- [ ] **Step 1: 新建类型文件**

按接口文档 + PostClassReport 变更说明定义（`dimensionScore` 各字段为 `number`，非嵌套对象）：

```ts
/** 教师画像 API 响应 — 本次预对接仅建模 5 个顶层字段 */
export type TeacherProfileRspVO = {
  myLessonPlan?: MyLessonPlanVO | null
  postClassReport?: PostClassReportVO | null
  classroomClarity?: ClassroomClarityVO | null
  speakingBehavior?: SpeakingBehaviorVO | null
  speakingComprehensibility?: SpeakingComprehensibilityVO | null
}

export type MyLessonPlanVO = {
  totalCount?: number
  outstandingCount?: number
  outstandingRatio?: number
  excellentCount?: number
  excellentRatio?: number
  goodCount?: number
  goodRatio?: number
  needImprovementCount?: number
  needImprovementRatio?: number
  unsatisfactoryCount?: number
  unsatisfactoryRatio?: number
}

export type PostClassReportLevelStat = {
  excellentCount?: number
  excellentRatio?: number
  goodCount?: number
  goodRatio?: number
  satisfactoryCount?: number
  satisfactoryRatio?: number
  needImprovementCount?: number
  needImprovementRatio?: number
}

/** A 类 dimensionScore — 2026-07-07 起各字段为裸分值 */
export type ADimensionScoreVO = {
  lessonPlanFidelity?: number
  intellectualStimulation?: number
  difficultyBreakthrough?: number
  practiceEffectiveness?: number
  summaryCompleteness?: number
  pacingAppropriateness?: number
}

export type BDimensionScoreVO = {
  knowledgeMastery?: number
  intellectualStimulation?: number
  studentEngagement?: number
  logicalClarity?: number
  practiceAndFeedbackEffectiveness?: number
  pacing?: number
}

export type PostClassReportVO = {
  summary?: {
    excellentCount?: number
    goodCount?: number
    satisfactoryCount?: number
    needImprovementCount?: number
    totalCount?: number
  }
  aReport?: {
    totalCount?: number
    levelStat?: PostClassReportLevelStat
    dimensionScore?: ADimensionScoreVO
  }
  bReport?: {
    totalCount?: number
    levelStat?: PostClassReportLevelStat
    dimensionScore?: BDimensionScoreVO
  }
}

export type ClarityDetailVO = {
  maxScore?: number
  averageScore?: number
}

export type ClassroomClarityVO = {
  goalClarity?: ClarityDetailVO
  stageClarity?: ClarityDetailVO
  logicClarity?: ClarityDetailVO
  summaryClarity?: ClarityDetailVO
  totalScore?: number
  level?: string
}

export type SpeakingBehaviorVO = {
  praiseEncourage?: number
  acceptFeeling?: number
  adoptIdea?: number
  criticize?: number
  giveInstruction?: number
  total?: number
}

export type SpeakingComprehensibilityVO = {
  vocabulary?: number
  syntax?: number
  content?: number
  total?: number
  level?: string
}
```

- [ ] **Step 2: 类型检查**

Run: `pnpm typecheck`
Expected: PASS（新文件无引用错误）

---

### Task 2: 课堂教学内容评价维度常量

**Files:**
- Create: `src/pages/school/teacher-portrait/adapters/constants/content-eval-dimensions.ts`

- [ ] **Step 1: 新建常量（对齐 spec §3.2.1）**

```ts
export type ContentEvalDimensionDef = {
  key: string
  name: string
  maxScore: number
}

export const CATEGORY_A_DIMENSION_DEFS: ContentEvalDimensionDef[] = [
  { key: 'lessonPlanFidelity', name: '教案落实度', maxScore: 20 },
  { key: 'intellectualStimulation', name: '思维启发度', maxScore: 25 },
  { key: 'difficultyBreakthrough', name: '难点突破度', maxScore: 25 },
  { key: 'practiceEffectiveness', name: '练习有效度', maxScore: 15 },
  { key: 'summaryCompleteness', name: '小结完整度', maxScore: 5 },
  { key: 'pacingAppropriateness', name: '节奏合理度', maxScore: 10 },
]

export const CATEGORY_B_DIMENSION_DEFS: ContentEvalDimensionDef[] = [
  { key: 'knowledgeMastery', name: '知识落实度', maxScore: 25 },
  { key: 'intellectualStimulation', name: '思维启发度', maxScore: 20 },
  { key: 'studentEngagement', name: '学生参与度', maxScore: 15 },
  { key: 'logicalClarity', name: '逻辑清晰度', maxScore: 15 },
  { key: 'practiceAndFeedbackEffectiveness', name: '练习与反馈有效性', maxScore: 15 },
  { key: 'pacing', name: '节奏把控度', maxScore: 10 },
]
```

- [ ] **Step 2: typecheck**

Run: `pnpm typecheck`
Expected: PASS

---

### Task 3: 我的教案 Adapter + 单测

**Files:**
- Create: `src/pages/school/teacher-portrait/adapters/my-lesson-plan.adapter.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`（新建并追加用例）

- [ ] **Step 1: 实现 adapter**

```ts
import type { MyLessonPlanVO } from '../api/types/teacher-profile-rsp.vo'
import type { MyLessonPlanSlice } from '../types/aggregate'
import { MY_LESSON_PLAN_LEVEL_DEFS } from '../components/my-lesson-plan/types'

const API_FIELD_MAP: Record<
  (typeof MY_LESSON_PLAN_LEVEL_DEFS)[number]['key'],
  { countKey: keyof MyLessonPlanVO; ratioKey: keyof MyLessonPlanVO }
> = {
  excellent: { countKey: 'outstandingCount', ratioKey: 'outstandingRatio' },
  great: { countKey: 'excellentCount', ratioKey: 'excellentRatio' },
  good: { countKey: 'goodCount', ratioKey: 'goodRatio' },
  needsImprovement: { countKey: 'needImprovementCount', ratioKey: 'needImprovementRatio' },
  unqualified: { countKey: 'unsatisfactoryCount', ratioKey: 'unsatisfactoryRatio' },
}

function toRatioPercent(ratio: number | undefined): number | null {
  if (typeof ratio !== 'number') return null
  return ratio * 100
}

export function adaptMyLessonPlan(vo: MyLessonPlanVO | null | undefined): MyLessonPlanSlice | null {
  if (!vo) return null

  return {
    levels: MY_LESSON_PLAN_LEVEL_DEFS.map((def) => {
      const fields = API_FIELD_MAP[def.key]
      const count = vo[fields.countKey]
      const ratio = vo[fields.ratioKey]
      return {
        key: def.key,
        label: def.label,
        count: typeof count === 'number' ? Math.trunc(count) : 0,
        ratio: toRatioPercent(ratio),
      }
    }),
  }
}
```

- [ ] **Step 2: 写单测**

在 `teacher-profile.adapter.spec.ts` 追加：

```ts
import { describe, expect, it } from 'vitest'
import { adaptMyLessonPlan } from './my-lesson-plan.adapter'

describe('adaptMyLessonPlan', () => {
  it('maps flat fields to levels with ratio ×100 without truncating', () => {
    const slice = adaptMyLessonPlan({
      outstandingCount: 3,
      outstandingRatio: 0.08649,
      excellentCount: 8,
      excellentRatio: 0.2295,
      goodCount: 12,
      goodRatio: 0.3437,
      needImprovementCount: 8,
      needImprovementRatio: 0.2291,
      unsatisfactoryCount: 4,
      unsatisfactoryRatio: 0.1142,
    })
    expect(slice?.levels[0]).toMatchObject({ key: 'excellent', label: '卓越', count: 3 })
    expect(slice?.levels[0].ratio).toBeCloseTo(8.649, 5)
  })

  it('returns null when vo is null', () => {
    expect(adaptMyLessonPlan(null)).toBeNull()
  })
})
```

- [ ] **Step 3: 运行测试**

Run: `npx vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`
Expected: PASS

---

### Task 4: 课堂教学内容评价 Adapter

**Files:**
- Create: `src/pages/school/teacher-portrait/adapters/classroom-content-eval.adapter.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`

- [ ] **Step 1: 实现 adapter**

核心逻辑：

- `adaptLevelStat(levelStat)` → 4 档 levels，`satisfactory→pass`，ratio×100
- `adaptDimensionScores(dimensionScore, defs)` → `{ name, score, maxScore }[]`，score 直接读裸值
- title 使用 `'A类【基于教案与上课】'` / `'B类【基于教材与上课】'`（与 Container 常量一致）

```ts
import type { PostClassReportVO, PostClassReportLevelStat } from '../api/types/teacher-profile-rsp.vo'
import type { ClassroomContentEvalSlice } from '../types/aggregate'
import { CLASSROOM_CONTENT_EVAL_LEVEL_DEFS } from '../components/classroom-content-eval/types'
import {
  CATEGORY_A_DIMENSION_DEFS,
  CATEGORY_B_DIMENSION_DEFS,
} from './constants/content-eval-dimensions'

const CATEGORY_A_TITLE = 'A类【基于教案与上课】'
const CATEGORY_B_TITLE = 'B类【基于教材与上课】'

const LEVEL_API_KEYS = [
  { key: 'excellent' as const, count: 'excellentCount', ratio: 'excellentRatio' },
  { key: 'good' as const, count: 'goodCount', ratio: 'goodRatio' },
  { key: 'pass' as const, count: 'satisfactoryCount', ratio: 'satisfactoryRatio' },
  { key: 'needsImprovement' as const, count: 'needImprovementCount', ratio: 'needImprovementRatio' },
]

function adaptLevels(levelStat: PostClassReportLevelStat | undefined) {
  const defMap = new Map(CLASSROOM_CONTENT_EVAL_LEVEL_DEFS.map((d) => [d.key, d]))
  return LEVEL_API_KEYS.map(({ key, count, ratio }) => {
    const def = defMap.get(key)!
    const c = levelStat?.[count]
    const r = levelStat?.[ratio]
    return {
      key,
      label: def.label,
      count: typeof c === 'number' ? Math.trunc(c) : 0,
      ratio: typeof r === 'number' ? r * 100 : null,
    }
  })
}

function adaptDimensions(
  dimensionScore: Record<string, number | undefined> | undefined,
  defs: typeof CATEGORY_A_DIMENSION_DEFS,
) {
  return defs.map((def) => ({
    name: def.name,
    score: typeof dimensionScore?.[def.key] === 'number' ? dimensionScore[def.key]! : 0,
    maxScore: def.maxScore,
  }))
}

export function adaptClassroomContentEval(
  vo: PostClassReportVO | null | undefined,
): ClassroomContentEvalSlice | null {
  if (!vo?.summary || !vo.aReport || !vo.bReport) return null

  return {
    reportCount: vo.summary.totalCount ?? 0,
    categoryAReportCount: vo.aReport.totalCount ?? 0,
    categoryBReportCount: vo.bReport.totalCount ?? 0,
    categoryA: {
      title: CATEGORY_A_TITLE,
      levels: adaptLevels(vo.aReport.levelStat),
    },
    categoryB: {
      title: CATEGORY_B_TITLE,
      levels: adaptLevels(vo.bReport.levelStat),
    },
    gradeSummary: {
      excellent: vo.summary.excellentCount ?? 0,
      good: vo.summary.goodCount ?? 0,
      pass: vo.summary.satisfactoryCount ?? 0,
      needsImprovement: vo.summary.needImprovementCount ?? 0,
    },
    dimensionScores: {
      categoryA: adaptDimensions(vo.aReport.dimensionScore, CATEGORY_A_DIMENSION_DEFS),
      categoryB: adaptDimensions(vo.bReport.dimensionScore, CATEGORY_B_DIMENSION_DEFS),
    },
  }
}
```

- [ ] **Step 2: 单测 — 裸分值 + maxScore 补全**

```ts
import { adaptClassroomContentEval } from './classroom-content-eval.adapter'

describe('adaptClassroomContentEval', () => {
  it('maps dimensionScore bare numbers and fills maxScore from constants', () => {
    const slice = adaptClassroomContentEval({
      summary: { excellentCount: 13, goodCount: 17, satisfactoryCount: 8, needImprovementCount: 4, totalCount: 42 },
      aReport: {
        totalCount: 24,
        levelStat: { excellentCount: 8, excellentRatio: 0.3337, goodCount: 10, goodRatio: 0.4166, satisfactoryCount: 4, satisfactoryRatio: 0.1668, needImprovementCount: 2, needImprovementRatio: 0.0834 },
        dimensionScore: { lessonPlanFidelity: 16.4, intellectualStimulation: 20.5, difficultyBreakthrough: 20.5, practiceEffectiveness: 12.3, summaryCompleteness: 4.1, pacingAppropriateness: 8.2 },
      },
      bReport: {
        totalCount: 18,
        levelStat: { excellentCount: 5, excellentRatio: 0.2778, goodCount: 7, goodRatio: 0.3889, satisfactoryCount: 4, satisfactoryRatio: 0.2224, needImprovementCount: 2, needImprovementRatio: 0.1114 },
        dimensionScore: { knowledgeMastery: 20.5, intellectualStimulation: 20.5, studentEngagement: 6.7, logicalClarity: 20.5, practiceAndFeedbackEffectiveness: 4.1, pacing: 6.7 },
      },
    })
    expect(slice?.dimensionScores.categoryA[0]).toEqual({ name: '教案落实度', score: 16.4, maxScore: 20 })
    expect(slice?.dimensionScores.categoryA[1].maxScore).toBe(25)
  })
})
```

- [ ] **Step 3: 运行测试**

Run: `npx vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`
Expected: PASS

---

### Task 5: 课堂结构清晰度 Adapter

**Files:**
- Create: `src/pages/school/teacher-portrait/adapters/classroom-structure-clarity.adapter.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`

- [ ] **Step 1: 实现**

```ts
import type { ClassroomClarityVO } from '../api/types/teacher-profile-rsp.vo'
import type { ClassroomStructureClaritySlice } from '../types/aggregate'
import { STRUCTURE_CLARITY_DIMENSIONS } from '../components/classroom-structure-clarity/constants'

const API_KEY_BY_SLICE_KEY: Record<string, keyof ClassroomClarityVO> = {
  goalClarity: 'goalClarity',
  segmentClarity: 'stageClarity',
  logicClarity: 'logicClarity',
  summaryClarity: 'summaryClarity',
}

export function adaptClassroomStructureClarity(
  vo: ClassroomClarityVO | null | undefined,
): ClassroomStructureClaritySlice | null {
  if (!vo) return null

  const dimensions = STRUCTURE_CLARITY_DIMENSIONS.map((def) => {
    const apiKey = API_KEY_BY_SLICE_KEY[def.key]
    const detail = vo[apiKey]
    return {
      key: def.key,
      label: def.label,
      score: typeof detail?.averageScore === 'number' ? detail.averageScore : 0,
      maxScore: typeof detail?.maxScore === 'number' ? detail.maxScore : def.maxScore,
    }
  })

  return { dimensions }
}
```

- [ ] **Step 2: 单测 + vitest run**

- [ ] **Step 3: vitest PASS**

---

### Task 6: 课堂语言行为 Adapter

**Files:**
- Create: `src/pages/school/teacher-portrait/adapters/classroom-language-behavior.adapter.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`

- [ ] **Step 1: 实现**

```ts
import type { SpeakingBehaviorVO } from '../api/types/teacher-profile-rsp.vo'
import type { ClassroomLanguageBehaviorSlice } from '../types/aggregate'

const BEHAVIOR_COUNT_KEYS: (keyof SpeakingBehaviorVO)[] = [
  'praiseEncourage',
  'acceptFeeling',
  'adoptIdea',
  'criticize',
  'giveInstruction',
]

function computeRatio(count: number, total: number): number | null {
  if (total <= 0) return null
  return (count / total) * 100
}

export function adaptClassroomLanguageBehavior(
  vo: SpeakingBehaviorVO | null | undefined,
): ClassroomLanguageBehaviorSlice | null {
  if (!vo) return null

  const subtotal = typeof vo.total === 'number' ? Math.trunc(vo.total) : 0
  const items = BEHAVIOR_COUNT_KEYS.map((key) => {
    const count = typeof vo[key] === 'number' ? Math.trunc(vo[key]!) : 0
    return { count, ratio: computeRatio(count, subtotal) }
  })

  return { subtotal, items }
}
```

- [ ] **Step 2: 单测 total=0 → ratio null**

- [ ] **Step 3: vitest PASS**

---

### Task 7: 语言可理解度 Adapter

**Files:**
- Create: `src/pages/school/teacher-portrait/adapters/language-comprehensibility.adapter.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`

- [ ] **Step 1: 实现**

```ts
import type { SpeakingComprehensibilityVO } from '../api/types/teacher-profile-rsp.vo'
import type { LanguageComprehensibilitySlice } from '../types/aggregate'
import { COMPREHENSIBILITY_DIMENSIONS } from '../components/language-comprehensibility/constants'

export function adaptLanguageComprehensibility(
  vo: SpeakingComprehensibilityVO | null | undefined,
): LanguageComprehensibilitySlice | null {
  if (!vo) return null

  const scoreByKey: Record<string, number | undefined> = {
    vocabulary: vo.vocabulary,
    syntax: vo.syntax,
    content: vo.content,
  }

  const dimensions = Object.fromEntries(
    COMPREHENSIBILITY_DIMENSIONS.map((def) => [
      def.key,
      {
        score: typeof scoreByKey[def.key] === 'number' ? scoreByKey[def.key]! : 0,
        maxScore: def.maxScore,
      },
    ]),
  ) as LanguageComprehensibilitySlice['dimensions']

  return {
    totalScore: typeof vo.total === 'number' ? vo.total : 0,
    dimensions,
  }
}
```

- [ ] **Step 2: 单测 maxScore 35/35/30**

- [ ] **Step 3: vitest PASS**

---

### Task 8: 门面 `adaptTeacherProfileSlices`

**Files:**
- Create: `src/pages/school/teacher-portrait/adapters/index.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`

- [ ] **Step 1: 实现门面**

```ts
import type { TeacherProfileRspVO } from '../api/types/teacher-profile-rsp.vo'
import type {
  ClassroomContentEvalSlice,
  ClassroomLanguageBehaviorSlice,
  ClassroomStructureClaritySlice,
  LanguageComprehensibilitySlice,
  MyLessonPlanSlice,
} from '../types/aggregate'
import { adaptMyLessonPlan } from './my-lesson-plan.adapter'
import { adaptClassroomContentEval } from './classroom-content-eval.adapter'
import { adaptClassroomStructureClarity } from './classroom-structure-clarity.adapter'
import { adaptClassroomLanguageBehavior } from './classroom-language-behavior.adapter'
import { adaptLanguageComprehensibility } from './language-comprehensibility.adapter'

export type TeacherProfileAdaptedSlices = {
  myLessonPlan: MyLessonPlanSlice | null
  classroomContentEval: ClassroomContentEvalSlice | null
  classroomStructureClarity: ClassroomStructureClaritySlice | null
  classroomLanguageBehavior: ClassroomLanguageBehaviorSlice | null
  languageComprehensibility: LanguageComprehensibilitySlice | null
}

export function adaptTeacherProfileSlices(vo: TeacherProfileRspVO): TeacherProfileAdaptedSlices {
  return {
    myLessonPlan: adaptMyLessonPlan(vo.myLessonPlan),
    classroomContentEval: adaptClassroomContentEval(vo.postClassReport),
    classroomStructureClarity: adaptClassroomStructureClarity(vo.classroomClarity),
    classroomLanguageBehavior: adaptClassroomLanguageBehavior(vo.speakingBehavior),
    languageComprehensibility: adaptLanguageComprehensibility(vo.speakingComprehensibility),
  }
}

export { adaptMyLessonPlan, adaptClassroomContentEval, adaptClassroomStructureClarity, adaptClassroomLanguageBehavior, adaptLanguageComprehensibility }
```

- [ ] **Step 2: 集成测 — 完整 API mock fixture**

- [ ] **Step 3: vitest PASS**

---

### Task 9: API 形态 Mock 数据

**Files:**
- Create: `src/pages/school/teacher-portrait/mock/teacher-profile-api.mock.ts`

- [ ] **Step 1: 从现有 FULL_* slice 反推 API JSON**

将 `teacher-portrait-aggregate.mock.ts` 中 5 个 FULL slice 的数值反算为 API 形态：

- ratio 字段：`slice.ratio / 100`
- myLessonPlan key 反向映射
- postClassReport dimensionScore 用 slice score 裸值
- 其余字段按 §5 反向

导出：

```ts
import type { TeacherProfileRspVO } from '../api/types/teacher-profile-rsp.vo'

export const FULL_TEACHER_PROFILE_API: TeacherProfileRspVO = { /* ... */ }
export const PARTIAL_TEACHER_PROFILE_API: TeacherProfileRspVO = { /* 缺 myLessonPlan 等 */ }
export const EMPTY_TEACHER_PROFILE_API: TeacherProfileRspVO = {}

export function getTeacherProfileApiMock(teacherId: string): TeacherProfileRspVO {
  // 与 MOCK_BY_TEACHER_ID 场景对齐
}
```

- [ ] **Step 2: 断言 adapter(FULL_API) 与现有 FULL slice 结构等价**

在 spec 或临时脚本中 deepEqual 关键字段（允许浮点误差）

---

### Task 10: 改造 aggregate mock 注入链路

**Files:**
- Modify: `src/pages/school/teacher-portrait/mock/teacher-portrait-aggregate.mock.ts`

- [ ] **Step 1: 移除 5 个 FULL_* slice 常量直接写入 FULL_MOCK**

保留 FULL_MY_LESSON_PLAN 等作为 **期望快照**（用于 spec 对比），或迁移到 spec fixtures。

- [ ] **Step 2: 在 fetch 中合并 adapter 产出**

```ts
import { adaptTeacherProfileSlices } from '../adapters'
import { getTeacherProfileApiMock } from './teacher-profile-api.mock'

export async function fetchTeacherPortraitAggregateMock(teacherId: string): Promise<TeacherPortraitAggregate> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  if (isTeacherPortraitDebugEmpty()) return EMPTY_MOCK

  const base = MOCK_BY_TEACHER_ID[teacherId] ?? FULL_MOCK_BASE
  const apiVo = getTeacherProfileApiMock(teacherId)
  const adapted = adaptTeacherProfileSlices(apiVo)

  return {
    ...base,
    myLessonPlan: adapted.myLessonPlan,
    classroomContentEval: adapted.classroomContentEval,
    classroomStructureClarity: adapted.classroomStructureClarity,
    classroomLanguageBehavior: adapted.classroomLanguageBehavior,
    languageComprehensibility: adapted.languageComprehensibility,
  }
}
```

`FULL_MOCK_BASE` 仅含非本次 5 模块 slice。

- [ ] **Step 3: 浏览器冒烟**

Run: `pnpm dev:test`，打开教师画像页，确认 5 模块有数据/缺省态与改前一致

---

### Task 11: 全量验证

- [ ] **Step 1: vitest 全量 adapter 测试**

Run: `npx vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`
Expected: 全部 PASS

- [ ] **Step 2: typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: 确认 Container 零改动**

Run: `git diff src/pages/school/teacher-portrait/components/`
Expected: 无 diff（5 个 Container/View 未改）

---

## 自检（Plan vs Spec）

| Spec 要求 | 对应 Task |
|-----------|-----------|
| TeacherProfileRspVO 类型 | Task 1 |
| 5 adapter + 门面 | Task 3–8 |
| postClassReport 裸分值 + maxScore 常量 | Task 2, 4 |
| ratio ×100 不 trunc | Task 3 单测 |
| mock API 形态 + adapter 注入 | Task 9, 10 |
| Container 零改动 | Task 11 Step 3 |
| vitest + typecheck | Task 11 |

---

## 执行方式

Plan 已保存至本文件。两种执行选项：

1. **Subagent-Driven（推荐）** — 每 Task 派发子代理，任务间 review
2. **Inline Execution** — 当前会话按 Task 顺序直接实现

请告知选择哪种方式开始编码。
