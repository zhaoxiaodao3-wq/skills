# 组内即时关注组件 · 实施计划

> **For engineer:** 按任务顺序执行；**禁止 git commit**（用户规则：改动留工作区）。每 Task 做完验证再往下。
> **业务上下文：** `apps-development-platform/apps/data-board`；vue/vue-router API 自动导入；Element Plus 优先。

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Goal:** 交付 `group-focus` 业务组件（四态数据驱动 + 周次/科目筛选 + 3 行滚动表格 + 防竞态）+ mock 接口（#6/#7）+ 共享下拉样式抽取 + 三页面接入 + README。

**Architecture:** 状态/文案/列/统计全数据驱动；组件 props 仅 `showSubjectFilter`；下拉样式抽 `src/styles/el-select-filter.scss` 供两个组件共用。

---

## Task 1：类型 + mock 接口（#6/#7）

> **Skill:** — 无匹配（router.mjs --annotate 同批无建议）

**Files:**

- Modify: `apps/data-board/src/constants/overview.ts`（追加类型）
- Modify: `apps/data-board/src/api/overview.ts`（追加两个函数）

**Step 1：类型（追加到 constants/overview.ts 末尾）**

```ts
// ===== 组内即时关注 =====

export type FocusStatus = 'improve' | 'excellent' | 'stable' | 'empty'

export interface FocusTableColumn {
  key: string
  label: string
  /** 强调列（评分）：按状态主题色渲染（improve 红 / excellent 绿）。 */
  emphasis?: boolean
}

export interface FocusTableRow {
  key: string
  cells: Record<string, string>
}

export interface FocusStatItem {
  label: string
  value: string
  unit: string
}

export interface GroupFocusData {
  status: FocusStatus
  summary: string
  table?: { columns: FocusTableColumn[]; rows: FocusTableRow[] }
  stats?: FocusStatItem[]
}

export interface FocusFilterOption {
  id: string
  label: string
}
```

**Step 2：mock 接口（追加到 api/overview.ts 末尾）**

```ts
// ===== 组内即时关注 =====

// TODO(1.7.1-接口替换): [#6] 周次/科目列表接口。周次倒序（最新周第一）；
// subjects 仅年级长（showSubject=true）需要。
const FOCUS_WEEKS: FocusFilterOption[] = [
  { id: 'week-5', label: '第五周' },
  { id: 'week-4', label: '第四周' },
  { id: 'week-3', label: '第三周' },
  { id: 'week-2', label: '第二周' },
  { id: 'week-1', label: '第一周' },
]
const FOCUS_SUBJECTS: FocusFilterOption[] = [
  { id: 'subject-1', label: '语文' },
  { id: 'subject-2', label: '数学' },
  { id: 'subject-3', label: '英语' },
]

export function getFocusFilterOptionsApi(showSubject: boolean) {
  return delay({
    code: 200 as const,
    data: { weeks: FOCUS_WEEKS, subjects: showSubject ? FOCUS_SUBJECTS : [] },
  })
}

// TODO(1.7.1-接口替换): [#7] 组内即时关注数据接口。同一接口按周次/科目返回
// 不同状态（improve/excellent/stable/empty）。
const FOCUS_TABLE_COLUMNS: FocusTableColumn[] = [
  { key: 'className', label: '班级' },
  { key: 'teacherName', label: '授课教师' },
  { key: 'score', label: '评分', emphasis: true },
]

function buildFocusTable(scorePrefix: string, scoreColor: string) {
  const names = [['三年级2班', '刘辉'], ['四年级1班', '王芳'], ['五年级3班', '李强'], ['三年级1班', '赵敏'], ['六年级2班', '陈晨']]
  return {
    columns: FOCUS_TABLE_COLUMNS,
    rows: names.map(([className, teacherName], index) => ({
      key: `row-${index + 1}`,
      cells: { className, teacherName, score: `${scorePrefix[index]}分` },
    })),
  }
}

const FOCUS_DATA: Record<string, GroupFocusData> = {
  'week-5': {
    status: 'improve',
    summary: '第 5 周组内待改进课堂偏多（2/6 堂），建议关注课堂组织与讲解',
    table: buildFocusTable(['42', '55', '48', '60', '51'], '#FF2A2A'),
  },
  'week-4': {
    status: 'excellent',
    summary: '第 4 周组内待优秀课堂偏多（4/6 堂），值得肯定与推广',
    table: buildFocusTable(['93', '95', '91', '97', '92'], '#00B42A'),
  },
  'week-3': {
    status: 'stable',
    summary: '第 3 周组内整体平稳，暂无需特别关注',
    stats: [
      { label: '报告数', value: '7', unit: '份' },
      { label: '评分均分', value: '80', unit: '分' },
      { label: '最高分', value: '85', unit: '分' },
      { label: '最低分', value: '75', unit: '分' },
    ],
  },
  'week-2': {
    status: 'empty',
    summary: '第 2 周组内，暂无记录',
  },
  'week-1': {
    status: 'stable',
    summary: '第 1 周组内整体平稳，暂无需特别关注',
    stats: [
      { label: '报告数', value: '5', unit: '份' },
      { label: '评分均分', value: '82', unit: '分' },
      { label: '最高分', value: '88', unit: '分' },
      { label: '最低分', value: '76', unit: '分' },
    ],
  },
}

export function getGroupFocusApi(params: { weekId: string, subjectId?: string }) {
  return delay({ code: 200 as const, data: FOCUS_DATA[params.weekId] })
}
```

（`FocusTableColumn` / `GroupFocusData` / `FocusFilterOption` 加入 api 文件顶部已有的 `import type { ... } from '@/constants/overview'`。）

**Step 3：验证（vue-tsc 0 error）**

---

## Task 2：共享下拉样式抽取

> **Skill:** — 无匹配

**Files:**

- Create: `apps/data-board/src/styles/el-select-filter.scss`
- Modify: `apps/data-board/src/components/overview-filters/overview-filters.scss`（改为 @use，视觉不变）

**Step 1：共享文件（把 overview-filters 内的 `&__select` :deep 块迁出为 `%el-select-filter` 占位或 mixin）**

```scss
// apps/data-board/src/styles/el-select-filter.scss
// 概览系列筛选下拉共用（el-select 二次定制：200x30 灰底无边框，spec：概览顶部 §4.2）

@mixin el-select-filter {
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
```

**Step 2：overview-filters.scss 改造**

```scss
@use '../../styles/el-select-filter';

.overview-filters {
  // …不变…

  &__select {
    @include el-select-filter.el-select-filter;
  }
}
```

**Step 3：验证**

- vue-tsc 0 error
- 浏览器刷新：顶部筛选下拉外观不变（回归确认）

---

## Task 3：group-focus 组件

> **Skill:** — 无匹配（EP 图标 + 轻列表；样式 token 见 spec §4）

**Files:**

- Create: `apps/data-board/src/components/group-focus/group-focus.model.ts`
- Create: `apps/data-board/src/components/group-focus/group-focus.data.ts`
- Create: `apps/data-board/src/components/group-focus/group-focus.vue`
- Create: `apps/data-board/src/components/group-focus/group-focus.scss`

**Step 1：类型**

```ts
// group-focus.model.ts

import type { GroupFocusData } from '@/constants/overview'

export interface GroupFocusProps {
  /** 年级长页面传 true：显示科目筛选。 */
  showSubjectFilter?: boolean
}
```

**Step 2：静态数据（status 主题映射，EP 图标）**

```ts
// group-focus.data.ts

import type { FocusStatus } from '@/constants/overview'
import { CircleCheckFilled, InfoFilled, WarningFilled } from '@element-plus/icons-vue'
import type { Component } from 'vue'

export interface FocusTheme {
  barClass: string
  iconClass: string
  icon: Component
}

export const FOCUS_THEMES: Record<FocusStatus, FocusTheme> = {
  improve: { barClass: 'is-improve', iconClass: 'is-improve', icon: WarningFilled },
  excellent: { barClass: 'is-excellent', iconClass: 'is-excellent', icon: CircleCheckFilled },
  stable: { barClass: 'is-stable', iconClass: 'is-stable', icon: InfoFilled },
  empty: { barClass: 'is-stable', iconClass: 'is-stable', icon: InfoFilled },
}
```

**Step 3：组件**

```vue
<!-- group-focus.vue -->
<template>
  <div v-if="ready" class="group-focus" :class="{ 'is-refreshing': refreshing }">
    <div class="group-focus__header">
      <div class="group-focus__heading">
        <div class="group-focus__title">
          <span class="group-focus__bar" />
          <span class="group-focus__title-text">组内即时关注</span>
        </div>
        <span class="group-focus__description">基于所选教学周的组内课堂，一句话提示该周需关注事项</span>
      </div>
      <div class="group-focus__filters">
        <div class="group-focus__filter">
          <span class="group-focus__filter-label">周次</span>
          <el-select
            class="group-focus__select"
            :model-value="weekId"
            @update:model-value="onWeekChange"
          >
            <el-option
              v-for="option in weeks"
              :key="option.id"
              :label="option.label"
              :value="option.id"
            />
          </el-select>
        </div>
        <div v-if="showSubjectFilter" class="group-focus__filter">
          <span class="group-focus__filter-label">科目</span>
          <el-select
            class="group-focus__select"
            :model-value="subjectId"
            @update:model-value="onSubjectChange"
          >
            <el-option
              v-for="option in subjects"
              :key="option.id"
              :label="option.label"
              :value="option.id"
            />
          </el-select>
        </div>
      </div>
    </div>

    <template v-if="data">
      <div
        class="group-focus__summary"
        :class="theme.barClass"
      >
        <span class="group-focus__summary-icon" :class="theme.iconClass">
          <el-icon><component :is="theme.icon" /></el-icon>
        </span>
        <span class="group-focus__summary-text">{{ data.summary }}</span>
      </div>

      <div v-if="data.table" class="group-focus__section">
        <span class="group-focus__section-title">优秀课堂</span>
        <div class="group-focus__table">
          <div class="group-focus__table-head">
            <span
              v-for="column in data.table.columns"
              :key="column.key"
              class="group-focus__table-cell"
            >
              {{ column.label }}
            </span>
          </div>
          <div class="group-focus__table-body">
            <div
              v-for="row in data.table.rows"
              :key="row.key"
              class="group-focus__table-row"
            >
              <span
                v-for="column in data.table.columns"
                :key="column.key"
                class="group-focus__table-cell"
                :class="{ 'is-emphasis': column.emphasis }"
              >
                {{ row.cells[column.key] }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="data.stats" class="group-focus__section">
        <span class="group-focus__section-title">本周课堂速览</span>
        <div class="group-focus__stats">
          <div
            v-for="item in data.stats"
            :key="item.label"
            class="group-focus__stat"
          >
            <span class="group-focus__stat-label">{{ item.label }}</span>
            <span class="group-focus__stat-value">
              {{ item.value }}<i class="group-focus__stat-unit">{{ item.unit }}</i>
            </span>
          </div>
        </div>
      </div>

      <div v-else class="group-focus__section">
        <span class="group-focus__section-title">本周课堂速览</span>
        <div class="group-focus__empty">
          <span class="group-focus__empty-icon">
            <el-icon><Promotion /></el-icon>
          </span>
          <span class="group-focus__empty-text">本周暂无课堂记录</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { FocusFilterOption, GroupFocusData } from '@/constants/overview'
import type { GroupFocusProps } from './group-focus.model'
import { getFocusFilterOptionsApi, getGroupFocusApi } from '@/api/overview'
import { FOCUS_THEMES } from './group-focus.data'

const props = defineProps<GroupFocusProps>()

const weeks = ref<FocusFilterOption[]>([])
const subjects = ref<FocusFilterOption[]>([])
const weekId = ref('')
const subjectId = ref('')
const data = ref<GroupFocusData | null>(null)
const ready = ref(false)
const refreshing = ref(false)

const theme = computed(() => FOCUS_THEMES[data.value?.status ?? 'stable'])

/** 请求序号防竞态：仅采纳最后一次请求结果。 */
let requestSeq = 0

async function loadData() {
  const seq = ++requestSeq
  refreshing.value = true
  const result = await getGroupFocusApi({ weekId: weekId.value, subjectId: subjectId.value || undefined })
  if (seq !== requestSeq) return
  data.value = result.data
  refreshing.value = false
}

function onWeekChange(value: string) {
  weekId.value = value
}

function onSubjectChange(value: string) {
  subjectId.value = value
}

watch([weekId, subjectId], () => {
  if (weekId.value) loadData()
})

onMounted(async () => {
  const result = await getFocusFilterOptionsApi(props.showSubjectFilter ?? false)
  weeks.value = result.data.weeks
  subjects.value = result.data.subjects
  weekId.value = weeks.value[0]?.id ?? ''
  subjectId.value = subjects.value[0]?.id ?? ''
  if (weekId.value) {
    await loadData()
  }
  ready.value = true
})
</script>

<style scoped lang="scss">
@use './group-focus';
</style>
```

> 实现注意：`Promotion` 图标直接从 `@element-plus/icons-vue` 自动导入不可用（该库未配 Auto Import），模板中使用的图标组件需在 script 显式 import 后以 `<component :is>` 使用，或补充 import。以 `group-focus.data.ts` 引入三个状态图标 + 组件内 `import { Promotion } from '@element-plus/icons-vue'` 为准。

**Step 4：样式（spec §4 全部 token；表格可视区 3 行滚动）**

```scss
// group-focus.scss
@use '../../styles/el-select-filter';

.group-focus {
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: opacity 0.2s ease;

  &.is-refreshing {
    opacity: 0.6;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    row-gap: 12px;
  }

  &__heading {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__bar {
    width: 4px;
    height: 16px;
    background-color: #027aff;
  }

  &__title-text {
    font-size: 20px;
    font-weight: 600;
    color: #333333;
  }

  &__description {
    font-size: 16px;
    color: #555555;
  }

  &__filters {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__filter {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__filter-label {
    font-size: 14px;
    color: #333333;
  }

  &__select {
    @include el-select-filter.el-select-filter;
  }

  &__summary {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 70px;
    padding: 0 20px;
    border-radius: 8px;

    &.is-improve { background-color: #fff5f5; }
    &.is-excellent { background-color: #f3fcf5; }
    &.is-stable { background-color: #f2f3f5; }
  }

  &__summary-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    color: #ffffff;
    font-size: 20px;

    &.is-improve { background-color: #ff2a2a; }
    &.is-excellent { background-color: #00b42a; }
    &.is-stable { background-color: #aaaaaa; }
  }

  &__summary-text {
    font-size: 20px;
    color: #333333;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333333;
  }

  // 轻列表：可视区 3 行（表头 42 + 3×42），超出滚动
  &__table {
    border: 1px solid #f3f9ff;
    border-radius: 8px;
    overflow: hidden;

    .group-focus__table-body {
      max-height: 126px;
      overflow-y: auto;
    }
  }

  &__table-head,
  &__table-row {
    display: flex;
    align-items: center;
    gap: 28px;
    min-height: 42px;
    padding: 0 20px;
  }

  &__table-head {
    background-color: #f3f9ff;

    .group-focus__table-cell {
      font-size: 16px;
      font-weight: 600;
      color: #333333;
    }
  }

  &__table-row {
    border-bottom: 1px solid #f2f3f5;

    &:last-child {
      border-bottom: none;
    }

    .group-focus__table-cell {
      font-size: 16px;
      color: #555555;

      &.is-emphasis {
        font-weight: 600;

        .is-improve & { color: #ff2a2a; }
        .is-excellent & { color: #00b42a; }
      }
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: 5px;
    height: 109px;
    padding: 20px;
    background-color: #f3f9ff;
    border-radius: 8px;
  }

  &__stat-label {
    font-size: 16px;
    color: #555555;
  }

  &__stat-value {
    font-size: 30px;
    font-weight: 600;
    color: #333333;
  }

  &__stat-unit {
    font-style: normal;
    font-size: 16px;
    font-weight: 400;
    color: #555555;
  }

  &__empty {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 109px;
    padding: 0 20px;
    background-color: #f2f3f5;
    border-radius: 8px;
  }

  &__empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    background-color: #ffffff;
    color: #777777;
    font-size: 20px;
  }

  &__empty-text {
    font-size: 20px;
    color: #333333;
  }
}
```

> 实现注意：① 评分列着色依赖祖先状态类——`.is-improve` / `.is-excellent` 当前挂在提示条上，需把状态类同时挂到根容器（组件模板根 `<div class="group-focus" :class="theme.barClass + …">` 实现时把 `barClass` 也绑到根，或将着色规则改为基于提示条同级选择器）；实现时以「根容器持有状态类」落地。② `summary-icon` 白色图标通过 `color` + el-icon 继承实现。

**Step 5：验证**

vue-tsc 0 error。

---

## Task 4：三页面接入

> **Skill:** — 无匹配

**Files:**

- Modify: `apps/data-board/src/views/grade-overview/grade-overview.vue`（`<GroupFocus :show-subject-filter="true" />` 加在 OverviewStatCards 之后）
- Modify: `apps/data-board/src/views/plan-lessons/plan-lessons.vue`（`<GroupFocus />`）
- Modify: `apps/data-board/src/views/subject-overview-2/subject-overview-2.vue`（`<GroupFocus />`）

每个页面补 import。**Step 验证：** vue-tsc 0 error。

---

## Task 5：端到端实测 + README + 归档

> **Skill:** — 无匹配

**Step 1：浏览器实测（mock=campus-grade）**

1. `grade-overview`：组件渲染，周次+科目两下拉，默认「第五周/语文」，提示条红色待改进 + 表格（评分红、5 行、可视 3 行滚动）
2. 切「第四周」→ 绿色优秀 + 表格评分绿；切「第三周」→ 灰色平稳 + 4 速览卡；切「第二周」→ 灰色空态（纸飞机 + 文案）
3. `plan-lessons` / `subject-overview-2`：仅周次下拉，四态同上可切换
4. 快速连续切换周次 → 无旧数据覆盖（防竞态）
5. `principal-cockpit-2`：无此组件
6. 顶部筛选下拉外观不变（共享样式无回归）
7. 截图四态对照 Figma 渲染图

**Step 2：构建**

```bash
pnpm build:data-board:develop
```

**Step 3：README（group-focus/README.md：使用方式/四态说明/数据契约/完成情况/对接指引 #6/#7）**

**Step 4：交付自检（A 一致性 + B 还原度均适用）→ 勾 spec 验收 → archive → 闭环清单**
