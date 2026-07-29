# 教师画像页面 — 教师风格分析三模块 HTTP 接入 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/03-dev-spec.md](../specs/03-dev-spec.md)

**Requirement:** [requirements/03-教师风格分析三模块HTTP接入.md](../requirements/03-教师风格分析三模块HTTP接入.md)

**Goal:** 在 02 已接入的 `getTeacherProfile` 链路上扩展 3 个 Adapter 与 slice，Mock OFF 时三模块走 HTTP 展示；Mock ON 时三模块强制 `FULL_MOCK_BASE` 且 Container 保持现网逻辑。

**Architecture:** 单接口 + `adaptTeacherProfileSlices` 扩展至 9 模块；`mergeTeacherPortraitAggregate` 增加 `styleModulesFromBase` 选项；3 个 Container 通过 `isTeacherPortraitMockEnabled()` 双轨展示。

**Tech Stack:** Vue 3 + TypeScript + vitest + ECharts + defineService

---

## 文件总览

| 操作 | 路径 |
|------|------|
| Modify | `src/pages/school/teacher-portrait/api/types/teacher-profile-rsp.vo.ts` |
| Create | `src/pages/school/teacher-portrait/adapters/personal-tag-cloud.adapter.ts` |
| Create | `src/pages/school/teacher-portrait/adapters/teaching-style-trend.adapter.ts` |
| Create | `src/pages/school/teacher-portrait/adapters/teaching-style-flexibility.adapter.ts` |
| Modify | `src/pages/school/teacher-portrait/adapters/index.ts` |
| Modify | `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts` |
| Modify | `src/pages/school/teacher-portrait/components/personal-tag-cloud/types.ts` |
| Modify | `src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudContainer.vue` |
| Modify | `src/pages/school/teacher-portrait/components/teaching-style-trend/types.ts` |
| Modify | `src/pages/school/teacher-portrait/components/teaching-style-trend/constants.ts` |
| Modify | `src/pages/school/teacher-portrait/components/teaching-style-trend/trend-chart-options.ts` |
| Modify | `src/pages/school/teacher-portrait/components/teaching-style-trend/TeachingStyleTrendContainer.vue` |
| Modify | `src/pages/school/teacher-portrait/components/teaching-style-trend/TeachingStyleTrendView.vue` |
| Modify | `src/pages/school/teacher-portrait/components/teaching-style-flexibility/types.ts` |
| Modify | `src/pages/school/teacher-portrait/components/teaching-style-flexibility/constants.ts` |
| Modify | `src/pages/school/teacher-portrait/components/teaching-style-flexibility/TeachingStyleFlexibilityContainer.vue` |
| Modify | `src/pages/school/teacher-portrait/components/teaching-style-flexibility/TeachingStyleFlexibilityView.vue` |
| Modify | `src/pages/school/teacher-portrait/mock/teacher-profile-api.mock.ts` |
| Modify | `src/pages/school/teacher-portrait/mock/teacher-portrait-aggregate.mock.ts` |
| Modify | `src/pages/school/teacher-portrait/composables/useTeacherPortraitData.ts` |

**禁止修改：** `myInfo`、`TeacherPortraitCard`、02 已交付的 6 个 Adapter 业务逻辑（仅随类型/门面编译通过）

---

### Task 1: 扩展 VO 类型（3 模块）

**Files:**
- Modify: `src/pages/school/teacher-portrait/api/types/teacher-profile-rsp.vo.ts`

- [ ] **Step 1: 在文件末尾追加 3 模块 VO 类型**

```ts
export type TagItemVO = { tagValue?: string; count?: number; rank?: number }
export type TagCategoryVO = {
  categoryName?: string
  categoryType?: string
  tags?: TagItemVO[]
}
export type PersonalTagCloudVO = {
  totalReportCount?: number
  tagCategories?: TagCategoryVO[]
}

export type StyleCountItemVO = {
  styleName?: string
  count?: number
  dominateCount?: number
  auxiliaryCount?: number
}
export type TrendPointVO = {
  reportLabel?: string
  reportTime?: number
  reportTopic?: string
  dominantStyle?: string
  auxiliaryStyle?: string
  stylePosition?: number
}
export type TeachingStyleTrendVO = {
  dominantStyle?: string
  auxiliaryStyle?: string
  styleCounts?: StyleCountItemVO[]
  trendPoints?: TrendPointVO[]
}

export type SituationStatVO = {
  situationName?: string
  strongCount?: number
  mediumCount?: number
  weakCount?: number
  dominantLevel?: string
  summary?: string
  description?: string
}
export type TeachingStyleElasticityVO = {
  dominantStyle?: string
  auxiliaryStyle?: string
  sciAverage?: number
  sciLevel?: string
  styleCounts?: StyleCountItemVO[]
  situationStats?: SituationStatVO[]
  elasticitySummary?: string
}
```

- [ ] **Step 2: 扩展 `TeacherProfileRspVO` 顶层**

```ts
export type TeacherProfileRspVO = {
  // ...02 已有 6 字段
  personalTagCloud?: PersonalTagCloudVO | null
  teachingStyleTrend?: TeachingStyleTrendVO | null
  teachingStyleElasticity?: TeachingStyleElasticityVO | null
}
```

- [ ] **Step 3: 运行 typecheck（预期仅 adapter/index 尚未扩展报错）**

Run: `pnpm typecheck`

---

### Task 2: 扩展 slice 类型

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/personal-tag-cloud/types.ts`
- Modify: `src/pages/school/teacher-portrait/components/teaching-style-trend/types.ts`
- Modify: `src/pages/school/teacher-portrait/components/teaching-style-flexibility/types.ts`

- [ ] **Step 1: 扩展 `PersonalTagCloudSlice`**

```ts
export type TagCloudTagSlice = { label: string; count: number; rank: number }

export type TagCloudModuleSlice = {
  type: TagCloudModuleType
  title: string
  counts?: Record<string, number>
  tags?: TagCloudTagSlice[]
}

export type PersonalTagCloudSlice = {
  totalReportCount?: number
  modules: TagCloudModuleSlice[]
}
```

- [ ] **Step 2: 扩展 `TeachingStyleTrendSlice` 与 ViewModel**

```ts
export type TeachingStyleTrendReportItem = {
  label?: string
  dominantStyle?: TeacherStyleName | string | null
  auxiliaryStyle?: TeacherStyleName | string | null
  dominantPosition?: number | null
  scores?: Partial<Record<TeacherStyleName, number>>
}

export type TeachingStyleTrendSlice = {
  reports: TeachingStyleTrendReportItem[]
}

export type TeachingStyleTrendViewModel = {
  isEmpty: boolean
  useApiMode: boolean
  labels: string[]
  yAxisOrder: readonly string[]
  dominantStyles: (TeacherStyleName | null)[]
  auxiliaryStyles: (TeacherStyleName | null)[]
  dominantPositions: (number | null)[]
  auxiliaryPositions: (number | null)[]
}
```

- [ ] **Step 3: 扩展 `TeachingStyleFlexibilitySlice` 与 ViewModel**

```ts
export type SituationItemSlice = {
  situationName: string
  summary: string
  level: ScenarioLevel
}

export type TeachingStyleFlexibilitySlice = {
  dominantStyle: TeachingStyleType | null
  auxiliaryStyle: TeachingStyleType | null
  styleScores: Partial<Record<TeachingStyleType, number>> | null
  scenarios?: Partial<Record<TeachingScenarioKey, ScenarioLevel>> | null
  stability?: StabilityLevel | null
  sciLevel?: string | null
  situations?: SituationItemSlice[] | null
  elasticitySummary?: string | null
}

export type SituationItemViewModel = {
  situationName: string
  summary: string
  level: ScenarioLevel | null
}

export type TeachingStyleFlexibilityViewModel = {
  isEmpty: boolean
  useApiCopy: boolean
  dominantStyle: TeachingStyleType | null
  auxiliaryStyle: TeachingStyleType | null
  styleScores: Record<TeachingStyleType, number>
  scenarios: Record<TeachingScenarioKey, ScenarioLevel | null>
  stability: StabilityLevel | null
  stabilityTitle?: string | null
  stabilityDescription?: string | null
  situations?: SituationItemViewModel[]
}
```

---

### Task 3: API mock fixture 增加 3 模块

**Files:**
- Modify: `src/pages/school/teacher-portrait/mock/teacher-profile-api.mock.ts`

- [ ] **Step 1: 在 `FULL_TEACHER_PROFILE_API` 追加文档 §五 JSON 中 3 模块**

使用 [V1.4.8_教师画像_教师风格分析模块_接口字段设计.md](../docs/V1.4.8_教师画像_教师风格分析模块_接口字段设计.md) §2.4 / §3.4 / §4.4 示例数据（`personalTagCloud`、`teachingStyleTrend`、`teachingStyleElasticity`）。

- [ ] **Step 2: 确认 `getTeacherProfileApiMock` 返回类型仍兼容 `TeacherProfileRspVO`**

Run: `pnpm typecheck`

---

### Task 4: adaptPersonalTagCloud（TDD）

**Files:**
- Create: `src/pages/school/teacher-portrait/adapters/personal-tag-cloud.adapter.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
import { adaptPersonalTagCloud } from './personal-tag-cloud.adapter'

describe('adaptPersonalTagCloud', () => {
  it('maps tagCategories to modules with dynamic tags', () => {
    const slice = adaptPersonalTagCloud({
      totalReportCount: 15,
      tagCategories: [
        {
          categoryName: '话语特色',
          categoryType: 'speech',
          tags: [
            { tagValue: '学科语言规范者', count: 12, rank: 1 },
            { tagValue: '提问达人', count: 8, rank: 2 },
          ],
        },
        {
          categoryName: '学科适配(数学)',
          categoryType: 'subject_math',
          tags: [{ tagValue: '中度适配', count: 7, rank: 1 }],
        },
      ],
    })
    expect(slice?.totalReportCount).toBe(15)
    expect(slice?.modules[0]).toMatchObject({
      type: 'discourse',
      title: '话语特色',
      tags: [
        { label: '学科语言规范者', count: 12, rank: 1 },
        { label: '提问达人', count: 8, rank: 2 },
      ],
    })
    expect(slice?.modules[1].type).toBe('subject')
  })

  it('returns null when no tags', () => {
    expect(adaptPersonalTagCloud({ tagCategories: [] })).toBeNull()
    expect(adaptPersonalTagCloud(null)).toBeNull()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts -t adaptPersonalTagCloud`
Expected: FAIL — module not found

- [ ] **Step 3: 实现 adapter**

```ts
import type { PersonalTagCloudVO } from '../api/types/teacher-profile-rsp.vo'
import type { PersonalTagCloudSlice, TagCloudModuleSlice } from '../components/personal-tag-cloud/types'
import type { TagCloudModuleType } from '../components/personal-tag-cloud/tag-sort'

function mapCategoryType(categoryType: string | undefined): TagCloudModuleType {
  if (categoryType === 'speech') return 'discourse'
  if (categoryType === 'emotion') return 'emotion'
  if (categoryType === 'power') return 'power'
  if (categoryType?.startsWith('subject')) return 'subject'
  return 'discourse'
}

function readCount(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return Math.trunc(value)
  return 0
}

function readRank(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return Math.trunc(value)
  return 0
}

export function adaptPersonalTagCloud(
  vo: PersonalTagCloudVO | null | undefined,
): PersonalTagCloudSlice | null {
  if (!vo?.tagCategories?.length) return null

  const modules: TagCloudModuleSlice[] = []

  for (const category of vo.tagCategories) {
    const tags = (category.tags ?? [])
      .map((tag) => ({
        label: String(tag.tagValue ?? '').trim(),
        count: readCount(tag.count),
        rank: readRank(tag.rank),
      }))
      .filter((tag) => tag.label !== '')

    if (!tags.length) continue

    modules.push({
      type: mapCategoryType(category.categoryType),
      title: String(category.categoryName ?? '').trim() || '未命名分类',
      tags,
    })
  }

  if (!modules.length) return null

  return {
    totalReportCount: readCount(vo.totalReportCount),
    modules,
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts -t adaptPersonalTagCloud`
Expected: PASS

---

### Task 5: adaptTeachingStyleTrend（TDD）

**Files:**
- Create: `src/pages/school/teacher-portrait/adapters/teaching-style-trend.adapter.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
import { adaptTeachingStyleTrend } from './teaching-style-trend.adapter'

describe('adaptTeachingStyleTrend', () => {
  it('maps trendPoints to reports with label and position', () => {
    const slice = adaptTeachingStyleTrend({
      trendPoints: [
        {
          reportLabel: 'A1',
          dominantStyle: '温暖引导型',
          auxiliaryStyle: '权威传授型',
          stylePosition: 0,
        },
        {
          reportLabel: 'A2',
          dominantStyle: '理性启发型',
          auxiliaryStyle: '温暖引导型',
          stylePosition: 1,
        },
      ],
    })
    expect(slice?.reports).toHaveLength(2)
    expect(slice?.reports[0]).toMatchObject({
      label: 'A1',
      dominantStyle: '温暖引导型',
      auxiliaryStyle: '权威传授型',
      dominantPosition: 0,
    })
    expect(slice?.reports[1].label).toBe('A2')
  })

  it('returns null when trendPoints empty', () => {
    expect(adaptTeachingStyleTrend({ trendPoints: [] })).toBeNull()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts -t adaptTeachingStyleTrend`
Expected: FAIL

- [ ] **Step 3: 实现 adapter**

```ts
import { normalizeTeacherStyleName } from '@/pages/analysis-web/ai-teaching-diagnosis/teacher-style-analysiis/constants/teacher-style-portrait'
import type { TeachingStyleTrendVO } from '../api/types/teacher-profile-rsp.vo'
import type { TeachingStyleTrendSlice } from '../components/teaching-style-trend/types'

function readPosition(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    const pos = Math.trunc(value)
    return pos >= 0 && pos <= 4 ? pos : null
  }
  return null
}

export function adaptTeachingStyleTrend(
  vo: TeachingStyleTrendVO | null | undefined,
): TeachingStyleTrendSlice | null {
  const points = vo?.trendPoints
  if (!points?.length) return null

  const reports = points.map((point) => ({
    label: String(point.reportLabel ?? '').trim() || undefined,
    dominantStyle: normalizeTeacherStyleName(point.dominantStyle),
    auxiliaryStyle: normalizeTeacherStyleName(point.auxiliaryStyle),
    dominantPosition: readPosition(point.stylePosition),
  }))

  return { reports }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts -t adaptTeachingStyleTrend`
Expected: PASS

---

### Task 6: adaptTeachingStyleElasticity（TDD）

**Files:**
- Create: `src/pages/school/teacher-portrait/adapters/teaching-style-flexibility.adapter.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
import { adaptTeachingStyleElasticity } from './teaching-style-flexibility.adapter'

describe('adaptTeachingStyleElasticity', () => {
  it('maps styleCounts, situationStats and elasticitySummary', () => {
    const slice = adaptTeachingStyleElasticity({
      dominantStyle: '温暖引导型',
      auxiliaryStyle: '权威传授型',
      sciLevel: '高弹性',
      styleCounts: [
        { styleName: '温暖引导型', count: 22 },
        { styleName: '权威传授型', count: 18 },
      ],
      situationStats: [
        {
          situationName: '导入新知时',
          dominantLevel: '强',
          summary: '引人入胜',
        },
        {
          situationName: '课堂气氛低落时',
          dominantLevel: '弱',
          summary: '有待提高',
        },
      ],
      elasticitySummary: '教师能根据教学情境灵活切换风格。',
    })
    expect(slice?.dominantStyle).toBe('温暖引导型')
    expect(slice?.sciLevel).toBe('高弹性')
    expect(slice?.styleScores?.温暖引导型).toBe(22)
    expect(slice?.situations?.[0]).toEqual({
      situationName: '导入新知时',
      summary: '引人入胜',
      level: 'strong',
    })
    expect(slice?.situations?.[1].level).toBe('weak')
    expect(slice?.elasticitySummary).toContain('灵活切换')
    expect(slice?.scenarios).toBeUndefined()
    expect(slice?.stability).toBeUndefined()
  })

  it('returns null when vo is null', () => {
    expect(adaptTeachingStyleElasticity(null)).toBeNull()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts -t adaptTeachingStyleElasticity`
Expected: FAIL

- [ ] **Step 3: 实现 adapter**

```ts
import { normalizeTeacherStyleName } from '@/pages/analysis-web/ai-teaching-diagnosis/teacher-style-analysiis/constants/teacher-style-portrait'
import type { TeachingStyleElasticityVO } from '../api/types/teacher-profile-rsp.vo'
import type { ScenarioLevel, TeachingStyleType } from '../components/teaching-style-flexibility/constants'
import type { SituationItemSlice, TeachingStyleFlexibilitySlice } from '../components/teaching-style-flexibility/types'

function readCount(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return Math.trunc(value)
  return 0
}

function mapDominantLevel(level: string | undefined): ScenarioLevel {
  if (level === '强') return 'strong'
  if (level === '弱') return 'weak'
  return 'medium'
}

function isTeachingStyleType(value: string | null): value is TeachingStyleType {
  return value !== null && ['温暖引导型', '理性启发型', '激情讲授型', '权威传授型', '严厉规训型'].includes(value)
}

export function adaptTeachingStyleElasticity(
  vo: TeachingStyleElasticityVO | null | undefined,
): TeachingStyleFlexibilitySlice | null {
  if (!vo) return null

  const dominantRaw = normalizeTeacherStyleName(vo.dominantStyle)
  const auxiliaryRaw = normalizeTeacherStyleName(vo.auxiliaryStyle)
  const dominantStyle = isTeachingStyleType(dominantRaw) ? dominantRaw : null
  const auxiliaryStyle = isTeachingStyleType(auxiliaryRaw) ? auxiliaryRaw : null

  const styleScores: Partial<Record<TeachingStyleType, number>> = {}
  for (const item of vo.styleCounts ?? []) {
    const name = normalizeTeacherStyleName(item.styleName)
    if (isTeachingStyleType(name)) {
      styleScores[name] = readCount(item.count)
    }
  }

  const situations: SituationItemSlice[] = (vo.situationStats ?? [])
    .map((stat) => ({
      situationName: String(stat.situationName ?? '').trim(),
      summary: String(stat.summary ?? '').trim(),
      level: mapDominantLevel(stat.dominantLevel),
    }))
    .filter((item) => item.situationName !== '')

  const sciLevel = vo.sciLevel?.trim() || null
  const elasticitySummary = vo.elasticitySummary?.trim() || null

  const hasStyleScores = Object.keys(styleScores).length > 0
  const hasSituations = situations.length > 0
  if (!hasStyleScores && !hasSituations && !sciLevel && !elasticitySummary) {
    return null
  }

  return {
    dominantStyle,
    auxiliaryStyle,
    styleScores: hasStyleScores ? styleScores : null,
    sciLevel,
    situations: hasSituations ? situations : null,
    elasticitySummary,
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts -t adaptTeachingStyleElasticity`
Expected: PASS

---

### Task 7: 扩展 adaptTeacherProfileSlices 门面

**Files:**
- Modify: `src/pages/school/teacher-portrait/adapters/index.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`

- [ ] **Step 1: 扩展 `TeacherProfileAdaptedSlices` 与门面**

```ts
import type { PersonalTagCloudSlice } from '../components/personal-tag-cloud/types'
import type { TeachingStyleTrendSlice } from '../components/teaching-style-trend/types'
import type { TeachingStyleFlexibilitySlice } from '../components/teaching-style-flexibility/types'
import { adaptPersonalTagCloud } from './personal-tag-cloud.adapter'
import { adaptTeachingStyleTrend } from './teaching-style-trend.adapter'
import { adaptTeachingStyleElasticity } from './teaching-style-flexibility.adapter'

export type TeacherProfileAdaptedSlices = {
  // ...02 六模块
  personalTagCloud: PersonalTagCloudSlice | null
  teachingStyleTrend: TeachingStyleTrendSlice | null
  teachingStyleFlexibility: TeachingStyleFlexibilitySlice | null
}

export function adaptTeacherProfileSlices(vo: TeacherProfileRspVO): TeacherProfileAdaptedSlices {
  return {
    // ...02 六模块
    personalTagCloud: adaptPersonalTagCloud(vo.personalTagCloud),
    teachingStyleTrend: adaptTeachingStyleTrend(vo.teachingStyleTrend),
    teachingStyleFlexibility: adaptTeachingStyleElasticity(vo.teachingStyleElasticity),
  }
}
```

- [ ] **Step 2: 扩展 `emptyAdaptedTeacherProfileSlices`（mock 文件）**

```ts
export function emptyAdaptedTeacherProfileSlices(): TeacherProfileAdaptedSlices {
  return {
    // ...02 六模块 null
    personalTagCloud: null,
    teachingStyleTrend: null,
    teachingStyleFlexibility: null,
  }
}
```

- [ ] **Step 3: 追加门面集成测试**

```ts
describe('adaptTeacherProfileSlices', () => {
  it('adapts all 9 modules from FULL_TEACHER_PROFILE_API', () => {
    const slices = adaptTeacherProfileSlices(FULL_TEACHER_PROFILE_API)
    expect(slices.personalTagCloud?.modules.length).toBeGreaterThan(0)
    expect(slices.teachingStyleTrend?.reports.length).toBeGreaterThan(0)
    expect(slices.teachingStyleFlexibility?.sciLevel).toBeTruthy()
  })
})
```

- [ ] **Step 4: 运行全量 adapter 测试**

Run: `pnpm vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`
Expected: PASS

---

### Task 8: merge 双轨（styleModulesFromBase）

**Files:**
- Modify: `src/pages/school/teacher-portrait/mock/teacher-portrait-aggregate.mock.ts`
- Modify: `src/pages/school/teacher-portrait/composables/useTeacherPortraitData.ts`

- [ ] **Step 1: 扩展 merge 签名与逻辑**

```ts
export type MergeTeacherPortraitOptions = {
  styleModulesFromBase?: boolean
}

export function mergeTeacherPortraitAggregate(
  adapted: TeacherProfileAdaptedSlices,
  overrides: Partial<TeacherPortraitAggregate> = {},
  options: MergeTeacherPortraitOptions = {},
): TeacherPortraitAggregate {
  const useBaseStyleModules = options.styleModulesFromBase ?? false

  return {
    ...FULL_MOCK_BASE,
    myLessonPlan: adapted.myLessonPlan,
    classroomContentEval: adapted.classroomContentEval,
    questionType: adapted.questionType,
    classroomStructureClarity: adapted.classroomStructureClarity,
    classroomLanguageBehavior: adapted.classroomLanguageBehavior,
    languageComprehensibility: adapted.languageComprehensibility,
    personalTagCloud: useBaseStyleModules
      ? FULL_MOCK_BASE.personalTagCloud
      : adapted.personalTagCloud,
    teachingStyleTrend: useBaseStyleModules
      ? FULL_MOCK_BASE.teachingStyleTrend
      : adapted.teachingStyleTrend,
    teachingStyleFlexibility: useBaseStyleModules
      ? FULL_MOCK_BASE.teachingStyleFlexibility
      : adapted.teachingStyleFlexibility,
    ...overrides,
  }
}
```

- [ ] **Step 2: `buildAggregateFromApi` 传入 `styleModulesFromBase: true`**

```ts
return mergeTeacherPortraitAggregate(adapted, overrides, { styleModulesFromBase: true })
```

- [ ] **Step 3: HTTP 路径传入 `styleModulesFromBase: false`**

```ts
aggregate.value = mergeTeacherPortraitAggregate(adapted, {}, { styleModulesFromBase: false })
```

- [ ] **Step 4: 运行 typecheck**

Run: `pnpm typecheck`
Expected: PASS（Container 未改前可能有个别 ViewModel 字段报错，Task 9–11 修复）

---

### Task 9: PersonalTagCloudContainer 双轨

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudContainer.vue`

- [ ] **Step 1: 引入 `isTeacherPortraitMockEnabled`**

- [ ] **Step 2: 新增 `buildModulesFromApiTags`**

```ts
function buildModulesFromApiTags(slice: PersonalTagCloudSlice): TagCloudModuleViewModel[] {
  return slice.modules.map((module) => ({
    type: module.type,
    title: formatModuleTitle(module.type, module.title),
    tags: [...(module.tags ?? [])].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.rank - b.rank
    }),
  }))
}
```

- [ ] **Step 3: viewModel 分支**

```ts
const useMock = isTeacherPortraitMockEnabled()

if (!slice?.modules?.length) {
  return { isDefaultEmpty: true, modules: buildDefaultEmptyModules() }
}

return {
  isDefaultEmpty: false,
  modules: useMock ? buildModulesFromSlice(slice) : buildModulesFromApiTags(slice),
}
```

- [ ] **Step 4: 手工验证**

Mock ON → 固定词表；Mock OFF + HTTP 有数据 → 接口标签动态展示。

---

### Task 10: TeachingStyleTrend 双轨（Container + chart）

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teaching-style-trend/constants.ts`
- Modify: `src/pages/school/teacher-portrait/components/teaching-style-trend/trend-chart-options.ts`
- Modify: `src/pages/school/teacher-portrait/components/teaching-style-trend/TeachingStyleTrendContainer.vue`
- Modify: `src/pages/school/teacher-portrait/components/teaching-style-trend/TeachingStyleTrendView.vue`

- [ ] **Step 1: 新增 API 纵轴常量**

```ts
import type { TeacherStyleName } from '@/pages/analysis-web/ai-teaching-diagnosis/teacher-style-analysiis/constants/teacher-style-portrait'

export const TEACHING_STYLE_Y_AXIS_API: readonly TeacherStyleName[] = [
  '温暖引导型',
  '理性启发型',
  '权威传授型',
  '激情讲授型',
  '严厉规训型',
]
```

- [ ] **Step 2: 扩展 `buildTeachingStyleTrendChartOption`**

增加参数 `options: { yAxisOrder: readonly string[]; usePositionData: boolean }`。

- HTTP 模式：`series.data` 使用 `dominantPositions` / `auxiliaryPositions`（数值 0–4）
- Mock 模式：保持传风格名字符串（category yAxis 兼容）
- tooltip 仍用 `dominantStyles[idx]` / `auxiliaryStyles[idx]` 展示风格名

- [ ] **Step 3: Container 构建 ViewModel**

```ts
const useMock = isTeacherPortraitMockEnabled()
const yAxisOrder = useMock ? TEACHER_STYLE_ORDER : TEACHING_STYLE_Y_AXIS_API

const labels = useMock
  ? slice.reports.map((_, idx) => buildReportLabel(idx))
  : slice.reports.map((r) => r.label ?? '')

// 辅助风格 → API 纵轴 index
function resolveAuxiliaryPosition(style: TeacherStyleName | null): number | null {
  if (!style) return null
  const idx = yAxisOrder.indexOf(style)
  return idx >= 0 ? idx : null
}

for (const report of slice.reports) {
  const { dominant, auxiliary } = resolveDominantAndAuxiliaryStyles(report)
  dominantStyles.push(dominant)
  auxiliaryStyles.push(auxiliary)
  dominantPositions.push(useMock ? (dominant ? yAxisOrder.indexOf(dominant) : null) : (report.dominantPosition ?? null))
  auxiliaryPositions.push(useMock ? resolveAuxiliaryPosition(dominant) : resolveAuxiliaryPosition(auxiliary))
}

return {
  isEmpty: false,
  useApiMode: !useMock,
  labels,
  yAxisOrder,
  dominantStyles,
  auxiliaryStyles,
  dominantPositions,
  auxiliaryPositions,
}
```

- [ ] **Step 4: View 传入 chart options 新参数**

```ts
buildTeachingStyleTrendChartOption(
  props.data.labels,
  props.data.dominantStyles,
  props.data.auxiliaryStyles,
  props.data.isEmpty,
  {
    yAxisOrder: props.data.yAxisOrder,
    usePositionData: props.data.useApiMode,
    dominantPositions: props.data.dominantPositions,
    auxiliaryPositions: props.data.auxiliaryPositions,
  },
)
```

---

### Task 11: TeachingStyleFlexibility 双轨（Container + View）

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teaching-style-flexibility/constants.ts`
- Modify: `src/pages/school/teacher-portrait/components/teaching-style-flexibility/TeachingStyleFlexibilityContainer.vue`
- Modify: `src/pages/school/teacher-portrait/components/teaching-style-flexibility/TeachingStyleFlexibilityView.vue`

- [ ] **Step 1: 新增 `mapSciLevelToStability`**

```ts
export function mapSciLevelToStability(sciLevel: string | null | undefined): StabilityLevel | null {
  if (!sciLevel) return null
  if (sciLevel.includes('高')) return 'high'
  if (sciLevel.includes('低')) return 'low'
  if (sciLevel.includes('中')) return 'medium'
  return null
}
```

- [ ] **Step 2: Container 分支构建 ViewModel**

```ts
const useMock = isTeacherPortraitMockEnabled()

if (useMock) {
  // 现有 normalizeSlice + scenarios/stability
  return { isEmpty: false, useApiCopy: false, ...mockFields }
}

// HTTP 模式
return {
  isEmpty: false,
  useApiCopy: true,
  dominantStyle: slice.dominantStyle,
  auxiliaryStyle: slice.auxiliaryStyle,
  styleScores: slice.styleScores,
  scenarios: emptyScenarios,
  stability: mapSciLevelToStability(slice.sciLevel),
  stabilityTitle: slice.sciLevel ? `课中教学稳定性${slice.sciLevel}` : '课中教学稳定性',
  stabilityDescription: slice.elasticitySummary ?? null,
  situations: slice.situations?.map((s) => ({
    situationName: s.situationName,
    summary: s.summary,
    level: s.level,
  })),
}
```

- [ ] **Step 3: View 模板分支**

- `useApiCopy === false`：保留 `TEACHING_SCENARIO_KEYS` + `getScenarioLabel` + `getStabilityTitle/Description`
- `useApiCopy === true`：`v-for` 渲染 `data.situations`；标题用 `stabilityTitle`；描述用 `stabilityDescription`；标签文案用 `situation.summary`

---

### Task 12: 全量验证

**Files:**（无新增）

- [ ] **Step 1: 运行 adapter 全量测试**

Run: `pnpm vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`
Expected: PASS

- [ ] **Step 2: 运行 typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: 手工验收清单**

| 场景 | 预期 |
|------|------|
| Mock ON + teacher-001 | 三模块与改前一致 |
| Mock OFF + 真实接口 | 标签云动态、趋势横轴 A1、纵轴权威在激情之上、弹性展示 sciLevel + summary |
| Mock OFF + 缺字段 | 对应模块空态 |
| 断网 | toast + 九模块空态 |

---

## Spec 覆盖自检

| Spec 章节 | 对应 Task |
|-----------|-----------|
| §3 数据流 / merge 双轨 | Task 8 |
| §4 VO 类型 | Task 1 |
| §5 Slice 契约 | Task 2 |
| §6 Adapter | Task 4–7 |
| §7 Container 双轨 | Task 9–11 |
| §8 Mock fixture | Task 3 |
| §10 测试 | Task 4–7、12 |
| §11 验收 | Task 12 |

无遗漏；无 TBD 占位。
