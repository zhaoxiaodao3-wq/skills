# 概览顶部模块 · 实施计划

> **For engineer:** 按任务顺序执行；**每个 Task 完成即验证 + commit，做好再往下**。禁止跳步/合并跳步。执行方式（Inline / SDD）以 P3 确认为准。
> **业务上下文：** `apps-development-platform/apps/data-board`（port 8102）；vue/vue-router API 自动导入，**禁止手动 import**；Element Plus 优先二次定制；组件标准目录结构 + BEM。

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Goal:** 交付概览页顶部模块（筛选 `overview-filters`、跳转按钮 `overview-nav`、统计卡片 `overview-stat-cards`）+ 参数体系 hook + mock 接口，接入年级长/备课组长两页面，流程闭环（默认值/带参/URL 同步/带参跳转/权限显隐/hover），三组件 README，替换点 #4/#5 标注。

**Architecture:** 权限 → 页面配置（`constants/overview.ts` 单一映射）→ 页面组合三组件；参数逻辑收敛在 `use-overview-query`；接口契约由 `api/overview.ts` mock 实现（替换点 #4/#5）。设计 token 见 spec §4（Figma REST 提取，非目测）。

**Tech Stack:** Vue 3 + TS + Element Plus（el-select / el-button 二次定制）+ SCSS；无新增依赖。

---

## Task 1：领域类型 + 页面配置映射

> **Skill:** — 无匹配 · 置信度 —（人工测评 + router.mjs --annotate 一致：纯 TS 常量类型）

**Files:**

- Create: `apps/data-board/src/constants/overview.ts`

**Step 1：写类型与配置**

```ts
// apps/data-board/src/constants/overview.ts

import type { DataPermissionType } from '@/utils/data-permission.model'

/** 筛选字段键：五种下拉。 */
export type FilterFieldKey = 'campus' | 'semester' | 'grade' | 'subject' | 'stage'

/** 页面筛选选中值（值为选项 id），经 URL query 同步。 */
export type OverviewQuery = Partial<Record<FilterFieldKey, string>>

/** 下拉选项。 */
export interface FilterOption {
  id: string
  label: string
}

/** 筛选字段 → URL query 键。 */
export const FILTER_QUERY_KEYS: Record<FilterFieldKey, string> = {
  campus: 'campusId',
  semester: 'semesterId',
  grade: 'gradeId',
  subject: 'subjectId',
  stage: 'stageId',
}

/** 筛选字段中文名（label）。 */
export const FILTER_LABELS: Record<FilterFieldKey, string> = {
  campus: '校区',
  semester: '学期',
  grade: '年级',
  subject: '科目',
  stage: '学段',
}

/** 跳转按钮键。 */
export type OverviewNavKey = 'teacherList' | 'gradeOverview' | 'subjectOverview' | 'planLessons'

/** 统计卡片变体（按数据权限）。 */
export type StatVariant = 'principal' | 'grade' | 'subject' | 'plan'

/** 指标卡主题（决定渐变与 hover 边框色，见 spec §4.4/§4.5）。 */
export type StatCardTheme = 'purple' | 'blue' | 'green' | 'yellow' | 'red'

/** 指标卡插画键（对应 assets/illu-*.png）。 */
export type StatIllustrationKey = 'grades' | 'task' | 'average' | 'people' | 'doc'

/** 单个指标（label/icon 全数据驱动，组件不写死文案；label 为空不渲染）。 */
export interface StatMetric {
  value: string
  label: string
  theme: StatCardTheme
  illustration: StatIllustrationKey
}

/** 卡片接口数据（spec §3.4）。 */
export interface OverviewStatData {
  title: string
  subtitle: string
  metrics: [StatMetric, StatMetric, StatMetric]
}

/** 页面顶部模块配置：由数据权限唯一决定。 */
export interface OverviewPageConfig {
  fields: FilterFieldKey[]
  navKeys: OverviewNavKey[]
  variant: StatVariant
}

export const OVERVIEW_PAGE_CONFIGS: Record<DataPermissionType, OverviewPageConfig> = {
  campus: {
    fields: ['campus', 'semester'],
    navKeys: ['teacherList', 'gradeOverview', 'subjectOverview', 'planLessons'],
    variant: 'principal',
  },
  'campus-grade': {
    fields: ['campus', 'semester', 'grade'],
    navKeys: ['teacherList'],
    variant: 'grade',
  },
  'campus-stage-subject': {
    fields: ['campus', 'semester', 'stage', 'subject'],
    navKeys: ['teacherList'],
    variant: 'subject',
  },
  'campus-grade-subject': {
    fields: ['campus', 'semester', 'grade', 'subject'],
    navKeys: ['teacherList'],
    variant: 'plan',
  },
}
```

**Step 2：验证 + commit**

```bash
pnpm -C apps/data-board exec vue-tsc -p tsconfig.app.json --noEmit   # Expected: 0 error
git add apps/data-board/src/constants/overview.ts
git commit -m "feat(data-board): 概览顶部模块类型与页面配置映射"
```

---

## Task 2：mock 接口（替换点 #4 / #5）

> **Skill:** — 无匹配 · 置信度 —

**Files:**

- Create: `apps/data-board/src/api/overview.ts`

**Step 1：写 mock 接口（签名即未来契约）**

```ts
// apps/data-board/src/api/overview.ts

import type {
  FilterFieldKey,
  FilterOption,
  OverviewStatData,
  StatVariant,
} from '@/constants/overview'

/** 模拟接口延迟，验证加载态与闭环流程。 */
function delay<T>(value: T, ms = 200) {
  return new Promise<T>(resolve => setTimeout(() => resolve(value), ms))
}

// TODO(1.7.1-接口替换): [#4] 筛选选项接口。就绪后改为共享 http 调用，
// 响应结构保持 { code, data }；选项按权限由后端过滤。
const ALL_FILTER_OPTIONS: Record<FilterFieldKey, FilterOption[]> = {
  campus: [
    { id: 'campus-1', label: 'A校区' },
    { id: 'campus-2', label: 'B校区' },
  ],
  semester: [
    { id: 'semester-1', label: '2026 - 2027 上学期' },
    { id: 'semester-2', label: '2026 - 2027 下学期' },
    { id: 'semester-3', label: '2025 - 2026 上学期' },
  ],
  grade: [
    { id: 'grade-1', label: '一年级' },
    { id: 'grade-2', label: '二年级' },
    { id: 'grade-3', label: '三年级' },
  ],
  subject: [
    { id: 'subject-1', label: '语文' },
    { id: 'subject-2', label: '数学' },
    { id: 'subject-3', label: '英语' },
  ],
  stage: [
    { id: 'stage-1', label: '初中' },
    { id: 'stage-2', label: '高中' },
  ],
}

export function getOverviewFilterOptionsApi(fields: FilterFieldKey[]) {
  const data: Partial<Record<FilterFieldKey, FilterOption[]>> = {}
  for (const field of fields) {
    data[field] = ALL_FILTER_OPTIONS[field]
  }
  return delay({ code: 200 as const, data })
}

// TODO(1.7.1-接口替换): [#5] 概览统计卡片接口。就绪后改为共享 http 调用，
// 同一接口按权限返回不同数据（文案/label/插画/主题由数据驱动）。
const OVERVIEW_STAT_DATA: Record<StatVariant, OverviewStatData> = {
  principal: {
    title: 'A校区',
    subtitle: '',
    metrics: [
      { value: '92%', label: '', theme: 'green', illustration: 'task' },
      { value: '81', label: '覆盖教师数', theme: 'yellow', illustration: 'people' },
      { value: '2610', label: '份报告', theme: 'red', illustration: 'doc' },
    ],
  },
  grade: {
    title: '初二',
    subtitle: '全科目',
    metrics: [
      { value: '84%', label: '达标率', theme: 'green', illustration: 'task' },
      { value: '33', label: '覆盖教师数', theme: 'yellow', illustration: 'people' },
      { value: '966', label: '份报告', theme: 'red', illustration: 'doc' },
    ],
  },
  subject: {
    title: '初中',
    subtitle: '语文',
    metrics: [
      { value: '82', label: '本学科评分均分', theme: 'blue', illustration: 'average' },
      { value: '100%', label: '达标率', theme: 'green', illustration: 'task' },
      { value: '279', label: '份报告', theme: 'red', illustration: 'doc' },
    ],
  },
  plan: {
    title: '初二',
    subtitle: '语文',
    metrics: [
      { value: '81', label: '组评分均分', theme: 'blue', illustration: 'average' },
      { value: '84%', label: '达标率', theme: 'green', illustration: 'task' },
      { value: '115', label: '份报告', theme: 'red', illustration: 'doc' },
    ],
  },
}

export function getOverviewStatApi(variant: StatVariant) {
  return delay({ code: 200 as const, data: OVERVIEW_STAT_DATA[variant] })
}
```

**Step 2：验证 + commit**

```bash
pnpm -C apps/data-board exec vue-tsc -p tsconfig.app.json --noEmit
git add apps/data-board/src/api/overview.ts
git commit -m "feat(data-board): 概览顶部模块 mock 接口（替换点 #4/#5）"
```

---

## Task 3：插画资源落位

> **Skill:** — 无匹配 · 置信度 —

**Files:**

- Create: `apps/data-board/src/components/overview-stat-cards/assets/{illu-grades,illu-task,illu-average,illu-people,illu-doc}.png`

**Step 1：复制插画（已从 Figma 3x 导出，见文档仓库 assets/illustrations/）**

```bash
cp "E:/code/frontend-local/docs/superpowers/V1.7.1/feature/概览顶部模块/requirements/assets/illustrations/illu-grades.png" "E:/code/frontend-local/docs/superpowers/V1.7.1/feature/概览顶部模块/requirements/assets/illustrations/illu-task.png" "E:/code/frontend-local/docs/superpowers/V1.7.1/feature/概览顶部模块/requirements/assets/illustrations/illu-average.png" "E:/code/frontend-local/docs/superpowers/V1.7.1/feature/概览顶部模块/requirements/assets/illustrations/illu-people.png" "E:/code/frontend-local/docs/superpowers/V1.7.1/feature/概览顶部模块/requirements/assets/illustrations/illu-doc.png" "E:/code/dataView/apps-development-platform/apps/data-board/src/components/overview-stat-cards/assets/"
```

Expected: 5 个文件存在（`ls` 验证）。

**Step 2：commit**

```bash
git add apps/data-board/src/components/overview-stat-cards/assets
git commit -m "feat(data-board): 概览卡片插画资源（Figma 3x 导出）"
```

---

## Task 4：筛选组件 overview-filters

> **Skill:** — 无匹配 · 置信度 —（Element Plus 二次定制；无 figma-MCP 还原工具，样式对照走 spec §4.2 token）

**Files:**

- Create: `apps/data-board/src/components/overview-filters/overview-filters.model.ts`
- Create: `apps/data-board/src/components/overview-filters/overview-filters.data.ts`
- Create: `apps/data-board/src/components/overview-filters/overview-filters.vue`
- Create: `apps/data-board/src/components/overview-filters/overview-filters.scss`

**Step 1：类型**

```ts
// overview-filters.model.ts

import type { FilterFieldKey, FilterOption, OverviewQuery } from '@/constants/overview'

export interface OverviewFiltersProps {
  /** 要渲染的筛选项及顺序（来自页面配置）。 */
  fields: FilterFieldKey[]
  /** 选项数据（页面 hook 拉取后传入）。 */
  options: Partial<Record<FilterFieldKey, FilterOption[]>>
  /** 选中值（v-model）。 */
  modelValue: OverviewQuery
}

export type OverviewFiltersEmits = (event: 'update:modelValue', value: OverviewQuery) => void
```

**Step 2：静态数据**

```ts
// overview-filters.data.ts

import { FILTER_LABELS } from '@/constants/overview'

export { FILTER_LABELS }
```

**Step 3：组件**

```vue
<!-- overview-filters.vue -->
<template>
  <div class="overview-filters">
    <div v-for="field in fields" :key="field" class="overview-filters__item">
      <span class="overview-filters__label">{{ FILTER_LABELS[field] }}</span>
      <el-select
        class="overview-filters__select"
        :model-value="modelValue[field]"
        placeholder="请选择"
        @update:model-value="onSelect(field, $event)"
      >
        <el-option
          v-for="option in options[field]"
          :key="option.id"
          :label="option.label"
          :value="option.id"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OverviewFiltersProps } from './overview-filters.model'
import type { FilterFieldKey, OverviewQuery } from '@/constants/overview'
import { FILTER_LABELS } from './overview-filters.data'

const props = defineProps<OverviewFiltersProps>()
const emit = defineEmits<OverviewFiltersEmits>()

function onSelect(field: FilterFieldKey, value: string) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<style scoped lang="scss">
@use './overview-filters';
</style>
```

**Step 4：样式（spec §4.2 token：宽200 高30 灰底 #F2F3F5 圆角4 无边框）**

```scss
// overview-filters.scss

.overview-filters {
  display: flex;
  align-items: center;
  gap: 20px;

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__label {
    font-size: 14px;
    line-height: 20px;
    color: #333333;
  }

  // el-select 二次定制：灰底、无边框、高 30
  &__select {
    width: 200px;

    :deep(.el-select__wrapper) {
      min-height: 30px;
      height: 30px;
      padding: 0 10px;
      background-color: #f2f3f5;
      border-radius: 4px;
      box-shadow: none;

      &:hover,
      &.is-focused {
        box-shadow: none;
        background-color: #ebedf0;
      }

      .el-select__placeholder,
      .el-select__selected-item {
        font-size: 14px;
        color: #333333;
      }
    }
  }
}
```

> 实现注意：Element Plus 版本不同 wrapper 结构有差异（`el-select__wrapper` 为 2.4+ 结构）。实现时以 `components.d.ts` 中注册的 el-select 实际渲染 DOM 为准调整 `:deep` 选择器；下拉面板（popper）默认样式保留。

**Step 5：验证 + commit**

```bash
pnpm -C apps/data-board exec vue-tsc -p tsconfig.app.json --noEmit
git add apps/data-board/src/components/overview-filters
git commit -m "feat(data-board): 概览筛选组件"
```

---

## Task 5：跳转按钮组件 overview-nav

> **Skill:** — 无匹配 · 置信度 —

**Files:**

- Create: `apps/data-board/src/components/overview-nav/overview-nav.model.ts`
- Create: `apps/data-board/src/components/overview-nav/overview-nav.data.ts`
- Create: `apps/data-board/src/components/overview-nav/overview-nav.vue`
- Create: `apps/data-board/src/components/overview-nav/overview-nav.scss`

**Step 1：类型**

```ts
// overview-nav.model.ts

import type { OverviewNavKey, OverviewQuery } from '@/constants/overview'

export interface OverviewNavProps {
  /** 要展示的跳转按钮（来自页面配置，校区权限四项、其他仅教师列表）。 */
  navKeys: OverviewNavKey[]
  /** 携带的筛选参数。 */
  query: OverviewQuery
}
```

**Step 2：静态数据（按钮 → 路由映射；教师列表为预留路径）**

```ts
// overview-nav.data.ts

import type { OverviewNavKey } from '@/constants/overview'

export interface NavItem {
  label: string
  path: string
}

export const NAV_ITEMS: Record<OverviewNavKey, NavItem> = {
  teacherList: { label: '教师列表', path: '/teacher-list' },
  gradeOverview: { label: '年级长概览', path: '/grade-overview' },
  subjectOverview: { label: '学科组长概览', path: '/subject-overview' },
  planLessons: { label: '备课组长概览', path: '/plan-lessons' },
}
```

**Step 3：组件（目标路由未注册 → 降级不跳转）**

```vue
<!-- overview-nav.vue -->
<template>
  <div class="overview-nav">
    <el-button
      v-for="key in navKeys"
      :key="key"
      class="overview-nav__button"
      @click="onNav(key)"
    >
      {{ NAV_ITEMS[key].label }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import type { OverviewNavProps } from './overview-nav.model'
import type { OverviewNavKey } from '@/constants/overview'
import { NAV_ITEMS } from './overview-nav.data'

const props = defineProps<OverviewNavProps>()
const router = useRouter()

function onNav(key: OverviewNavKey) {
  const target = NAV_ITEMS[key]
  const registered = router.getRoutes().some(route => route.path === target.path)
  if (!registered) {
    // 目标页面未建（如学科组长概览）：降级不跳转
    return
  }
  router.push({ path: target.path, query: { ...props.query } })
}
</script>

<style scoped lang="scss">
@use './overview-nav';
</style>
```

> 注意：`/teacher-list` 未注册，按此逻辑也会降级不跳——**与 spec 冲突**（spec 要求预留直接 push）。实现按此修正：`teacherList` 跳过注册检查（预留路径直接 push，由现有 404 通配重定向兜底）：
>
> ```ts
> if (key !== 'teacherList' && !registered) return
> ```

**Step 4：样式（spec §4.3）**

```scss
// overview-nav.scss

.overview-nav {
  display: flex;
  align-items: center;
  gap: 20px;

  // el-button 二次定制：蓝字浅蓝底蓝边框（hover 为补充设计：加深底色）
  &__button {
    height: 36px;
    padding: 0 20px;
    border-radius: 4px;
    background-color: #f3f9ff;
    border-color: #80bcff;
    color: #027aff;
    font-size: 14px;
    font-weight: 600;

    &:hover,
    &:focus {
      background-color: #e9f4ff;
      border-color: #027aff;
      color: #027aff;
    }
  }
}
```

**Step 5：验证 + commit**

```bash
pnpm -C apps/data-board exec vue-tsc -p tsconfig.app.json --noEmit
git add apps/data-board/src/components/overview-nav
git commit -m "feat(data-board): 概览跳转按钮组件"
```

---

## Task 6：统计卡片组件 overview-stat-cards

> **Skill:** — 无匹配 · 置信度 —（插画用导出 PNG；渐变/hover token 见 spec §4.4/§4.5）

**Files:**

- Create: `apps/data-board/src/components/overview-stat-cards/overview-stat-cards.model.ts`
- Create: `apps/data-board/src/components/overview-stat-cards/overview-stat-cards.data.ts`
- Create: `apps/data-board/src/components/overview-stat-cards/overview-stat-cards.vue`
- Create: `apps/data-board/src/components/overview-stat-cards/overview-stat-cards.scss`

**Step 1：类型**

```ts
// overview-stat-cards.model.ts

import type { OverviewStatData, StatVariant } from '@/constants/overview'

export interface OverviewStatCardsProps {
  /** 卡片数据变体（按页面数据权限）。 */
  variant: StatVariant
}

export type OverviewStatCardsEmits = (event: 'titleClick') => void
```

**Step 2：静态数据（插画资源映射）**

```ts
// overview-stat-cards.data.ts

import type { StatIllustrationKey } from '@/constants/overview'
import illuAverage from './assets/illu-average.png'
import illuDoc from './assets/illu-doc.png'
import illuGrades from './assets/illu-grades.png'
import illuPeople from './assets/illu-people.png'
import illuTask from './assets/illu-task.png'

export const ILLUSTRATION_SRC: Record<StatIllustrationKey, string> = {
  grades: illuGrades,
  task: illuTask,
  average: illuAverage,
  people: illuPeople,
  doc: illuDoc,
}
```

> 实现注意：png 模块导入需要类型声明——`src/vite-env.d.ts` 若已有 `/// <reference types="vite/client" />` 则天然支持；若 vue-tsc 报错，在该文件补 `declare module '*.png'`。

**Step 3：组件**

```vue
<!-- overview-stat-cards.vue -->
<template>
  <div v-if="stat" class="overview-stat-cards">
    <div
      class="overview-stat-cards__card overview-stat-cards__card--title"
      @click="emit('titleClick')"
    >
      <div class="overview-stat-cards__text">
        <span class="overview-stat-cards__value">{{ stat.title }}</span>
        <span v-if="stat.subtitle" class="overview-stat-cards__label">{{ stat.subtitle }}</span>
      </div>
      <img class="overview-stat-cards__illustration" :src="ILLUSTRATION_SRC.grades" alt="" />
    </div>
    <div
      v-for="(metric, index) in stat.metrics"
      :key="index"
      class="overview-stat-cards__card"
      :class="`overview-stat-cards__card--${metric.theme}`"
    >
      <div class="overview-stat-cards__text">
        <span class="overview-stat-cards__value">{{ metric.value }}</span>
        <span v-if="metric.label" class="overview-stat-cards__label">{{ metric.label }}</span>
      </div>
      <img
        class="overview-stat-cards__illustration"
        :src="ILLUSTRATION_SRC[metric.illustration]"
        alt=""
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OverviewStatCardsEmits, OverviewStatCardsProps } from './overview-stat-cards.model'
import { getOverviewStatApi } from '@/api/overview'
import { ILLUSTRATION_SRC } from './overview-stat-cards.data'

const props = defineProps<OverviewStatCardsProps>()
const emit = defineEmits<OverviewStatCardsEmits>()

const stat = ref<OverviewStatData | null>(null)

onMounted(async () => {
  const result = await getOverviewStatApi(props.variant)
  stat.value = result.data
})
</script>

<style scoped lang="scss">
@use './overview-stat-cards';
</style>
```

**Step 4：样式（spec §4.4 / §4.5 全部 token）**

```scss
// overview-stat-cards.scss

.overview-stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  &__card {
    position: relative;
    height: 112px;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid transparent;
    overflow: hidden;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    // 指标卡主题渐变（常显）
    &--blue { background: linear-gradient(135deg, #d7e6ff 0%, #eef6ff 100%); }
    &--green { background: linear-gradient(135deg, #cff5ee 0%, #f1faf9 100%); }
    &--yellow { background: linear-gradient(135deg, #ffefd7 0%, #fffbf6 100%); }
    &--red { background: linear-gradient(135deg, #ffe2e2 0%, #fff7f7 100%); }
    &--purple { background: linear-gradient(135deg, #e0e2ff 0%, #f5f5fe 100%); }

    // hover 补齐设计（spec §4.5）：标题卡紫、指标卡同主题色
    &:hover {
      box-shadow: 0 4px 12px rgba(139, 85, 255, 8%);
    }
    &--title:hover {
      background: linear-gradient(135deg, #e0e2ff 0%, #f5f5fe 100%);
      border-color: #8b55ff;
      box-shadow: 0 4px 12px rgba(139, 85, 255, 5%);
    }
    &--title:hover .overview-stat-cards__value {
      color: #8b55ff;
    }
    &--blue:hover { border-color: #80bcff; box-shadow: 0 4px 12px rgba(2, 122, 255, 8%); }
    &--green:hover { border-color: #38dcbe; box-shadow: 0 4px 12px rgba(0, 222, 155, 8%); }
    &--yellow:hover { border-color: #ffc43c; box-shadow: 0 4px 12px rgba(255, 132, 0, 8%); }
    &--red:hover { border-color: #ff9a9a; box-shadow: 0 4px 12px rgba(255, 42, 42, 8%); }
  }

  &__card--title .overview-stat-cards__value {
    color: #333333;
    transition: color 0.2s ease;
  }

  &__text {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__value {
    font-size: 36px;
    font-weight: 600;
    line-height: 50px;
    color: #333333;
  }

  &__label {
    font-size: 16px;
    line-height: 22px;
    color: #777777;
  }

  &__illustration {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 120px;
    height: 84px;
    pointer-events: none;
  }
}
```

**Step 5：验证 + commit**

```bash
pnpm -C apps/data-board exec vue-tsc -p tsconfig.app.json --noEmit
git add apps/data-board/src/components/overview-stat-cards
git commit -m "feat(data-board): 概览统计卡片组件"
```

---

## Task 7：参数体系 hook use-overview-query

> **Skill:** — 无匹配 · 置信度 —

**Files:**

- Create: `apps/data-board/src/hooks/use-overview-query.ts`

**Step 1：hook（默认值回填 + URL 同步）**

```ts
// apps/data-board/src/hooks/use-overview-query.ts

import type { FilterFieldKey, FilterOption, OverviewQuery } from '@/constants/overview'
import { FILTER_QUERY_KEYS } from '@/constants/overview'
import { getOverviewFilterOptionsApi } from '@/api/overview'

/**
 * 概览页参数体系单一入口：
 * 1. 挂载拉取选项；2. URL 参数优先回填、非法/缺省选第一项；
 * 3. 选中变化 router.replace 同步 URL（刷新/分享不丢参）。
 */
export function useOverviewQuery(fields: FilterFieldKey[]) {
  const route = useRoute()
  const router = useRouter()

  const options = ref<Partial<Record<FilterFieldKey, FilterOption[]>>>({})
  const query = ref<OverviewQuery>({})
  const ready = ref(false)

  onMounted(async () => {
    const result = await getOverviewFilterOptionsApi(fields)
    options.value = result.data

    const next: OverviewQuery = {}
    for (const field of fields) {
      const list = result.data[field] ?? []
      const fromUrl = route.query[FILTER_QUERY_KEYS[field]]
      const matched = list.find(option => option.id === fromUrl)
      next[field] = (matched ?? list[0])?.id ?? ''
    }
    query.value = next
    ready.value = true
  })

  watch(query, (value) => {
    const urlQuery: Record<string, string> = {}
    for (const [field, id] of Object.entries(value)) {
      if (id) {
        urlQuery[FILTER_QUERY_KEYS[field as FilterFieldKey]] = id
      }
    }
    router.replace({ query: urlQuery })
  }, { deep: true })

  return { options, query, ready }
}
```

**Step 2：验证 + commit**

```bash
pnpm -C apps/data-board exec vue-tsc -p tsconfig.app.json --noEmit
git add apps/data-board/src/hooks/use-overview-query.ts
git commit -m "feat(data-board): 概览参数体系 hook"
```

---

## Task 8：页面接入（grade-overview / plan-lessons）

> **Skill:** — 无匹配 · 置信度 —

**Files:**

- Modify: `apps/data-board/src/views/grade-overview/grade-overview.vue`
- Modify: `apps/data-board/src/views/plan-lessons/plan-lessons.vue`

**Step 1：grade-overview.vue（plan-lessons 同构，替换常量与类名）**

```vue
<!-- apps/data-board/src/views/grade-overview/grade-overview.vue -->
<template>
  <DataPermissionGuard required="campus-grade">
    <div class="grade-overview">
      <div v-if="ready" class="grade-overview__top">
        <OverviewFilters v-model="query" :fields="config.fields" :options="options" />
        <OverviewNav :nav-keys="config.navKeys" :query="query" />
      </div>
      <OverviewStatCards :variant="config.variant" />
    </div>
  </DataPermissionGuard>
</template>

<script setup lang="ts">
import type { DataPermissionType } from '@/utils/data-permission.model'
import DataPermissionGuard from '@/components/data-permission-guard/data-permission-guard.vue'
import OverviewFilters from '@/components/overview-filters/overview-filters.vue'
import OverviewNav from '@/components/overview-nav/overview-nav.vue'
import OverviewStatCards from '@/components/overview-stat-cards/overview-stat-cards.vue'
import { OVERVIEW_PAGE_CONFIGS } from '@/constants/overview'
import { useOverviewQuery } from '@/hooks/use-overview-query'

const PAGE_PERMISSION: DataPermissionType = 'campus-grade'
const config = OVERVIEW_PAGE_CONFIGS[PAGE_PERMISSION]
const { options, query, ready } = useOverviewQuery(config.fields)
</script>

<style scoped lang="scss">
@use './grade-overview';
</style>
```

**Step 2：页面样式（模块容器，spec §4.1）**

```scss
// grade-overview.scss（plan-lessons.scss 同构）

.grade-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  min-height: 100%;

  &__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
}
```

（目录需补 `grade-overview/grade-overview.scss`、`plan-lessons/plan-lessons.scss`。）

**Step 3：验证 + commit**

```bash
pnpm -C apps/data-board exec vue-tsc -p tsconfig.app.json --noEmit
git add apps/data-board/src/views/grade-overview apps/data-board/src/views/plan-lessons
git commit -m "feat(data-board): 两个概览页接入顶部模块"
```

---

## Task 9：三组件 README

> **Skill:** — 无匹配 · 置信度 —

**Files:**

- Create: `apps/data-board/src/components/overview-filters/README.md`
- Create: `apps/data-board/src/components/overview-nav/README.md`
- Create: `apps/data-board/src/components/overview-stat-cards/README.md`

**Step 1：README 统一模板（各组件填充）**

```markdown
# overview-xxx（中文名）

一句话职责。

## 使用方式

（props/事件说明 + 代码示例，从 plan 对应 Task 复制）

## 当前完成情况

- [x] UI 还原（mock 数据驱动）
- [x] 交互（默认值 / URL 同步 / 跳转 / hover）
- [ ] 真实接口（当前 mock，见替换点 #N）

## 接口对接指引

替换点：`TODO(1.7.1-接口替换): [#N]`（`src/api/overview.ts`）；契约：函数签名不变，组件零改动；字段：`FilterOption { id, label }` / `OverviewStatData`（见 `src/constants/overview.ts`）。
```

**Step 2：commit**

```bash
git add apps/data-board/src/components/overview-filters/README.md apps/data-board/src/components/overview-nav/README.md apps/data-board/src/components/overview-stat-cards/README.md
git commit -m "docs(data-board): 概览三组件 README"
```

---

## Task 10：端到端验证 + 构建校验 + 交付自检

> **Skill:** — 无匹配 · 置信度 —

**Step 1：类型 + 构建**

```bash
pnpm -C apps/data-board exec vue-tsc -p tsconfig.app.json --noEmit
pnpm build:data-board:develop
```

**Step 2：浏览器端到端实测（用户 dev:test server，逐项验证 spec §7）**

1. `/grade-overview`：三筛选默认第一项（A校区/2026-2027上学期/一年级）；URL 被 replace 为 `?campusId=campus-1&semesterId=semester-1&gradeId=grade-1`；卡片：初二/全科目 + 84%/33/966（绿/黄/红渐变 + 插画）
2. 带参进入 `/grade-overview?gradeId=grade-2`：年级下拉选中「二年级」
3. 改筛选 → URL 同步；点「备课组长概览」→ `/plan-lessons` 且 query 透传、筛选还原为所选值
4. mock 改 `campus`：四按钮全显；点「学科组长概览」降级不跳；点「教师列表」push `/teacher-list`（被 404 重定向回概览，预期）；卡片：A校区无副标题、92% 无 label
5. mock 改回 `campus-grade`；`/plan-lessons`：四筛选、仅教师列表按钮、卡片初二/语文 + 81 组评分均分（蓝渐变）
6. hover 走查：标题卡紫渐变紫边紫标题；指标卡同主题色边框；0.2s 过渡
7. 与 `figma-top-grade.png` 渲染对照走查（还原度自检底稿）
8. `principal-cockpit`、菜单兜底、按钮权限行为不变

**Step 3：交付自检（A 一致性 + B 还原度均适用）→ 勾 spec 验收 → archive → 闭环清单**
