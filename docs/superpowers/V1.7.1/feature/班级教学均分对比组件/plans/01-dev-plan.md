# 班级教学均分对比组件 · 实施计划

> **For engineer:** 按任务顺序执行；**禁止 git commit**（用户规则）。每 Task 做完验证再往下。
> **业务上下文：** `apps-development-platform/apps/data-board`；echarts 6 + vue-echarts 8 已有依赖（根 package.json）；vue/vue-router API 自动导入。

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Goal:** 交付 `class-score-compare` 图表组件（echarts 柱状图 + 组均虚线 + 状态柱色 + 自定义 tooltip + 横向滚动 + 空态 + 防竞态联动）+ mock 接口 #8 + 接入 plan-lessons + README。

**Architecture:** 组件自包含（无 props，监听 route.query 四键重拉）；echarts 按需引入（echarts/core + BarChart/Grid/Tooltip/MarkLine + CanvasRenderer）；数据契约全接口返回，前端仅 Y 兜底截断与柱色比较。

---

## Task 1：类型 + mock 接口（#8）

> **Skill:** — 无匹配

**Files:**

- Modify: `apps/data-board/src/constants/overview.ts`（追加类型）
- Modify: `apps/data-board/src/api/overview.ts`（追加 #8）

**Step 1：类型（追加）**

```ts
// ===== 班级教学均分对比 =====

export interface ClassScoreItem {
  key: string
  className: string
  avgScore: string
  reportCount: string
  passRate: string
  teacherNames: string[]
}

export interface ClassScoreCompareData {
  classCount: number
  groupAvgScore: string
  classes: ClassScoreItem[]
}
```

**Step 2：mock（追加到 api/overview.ts；import type 补 `ClassScoreCompareData, ClassScoreItem`）**

```ts
// ===== 班级教学均分对比 =====

// TODO(1.7.1-接口替换): [#8] 班级教学均分对比接口。X（classCount）/Y（groupAvgScore，
// 后端截断保留 1 位小数）/每班数据均由后端聚合返回（A、B 一起计算的口径在后端）。
function buildClassScores(count: number, base: number): ClassScoreItem[] {
  const teachers = [['王敏'], ['李强', '周芳'], ['张伟'], ['刘洋', '陈晨'], ['赵磊'], ['孙丽'], ['王敏'], ['李强'], ['张伟'], ['刘洋']]
  return Array.from({ length: count }, (_, index) => {
    const avgScore = base + (index % 4) * 4 - 6
    return {
      key: `class-${index + 1}`,
      className: `${index + 1}班`,
      avgScore: String(avgScore),
      reportCount: String(6 + index * 2),
      passRate: `${Math.min(100, 60 + index * 8)}%`,
      teacherNames: teachers[index],
    }
  })
}

export function getClassScoreCompareApi(_params: {
  campusId?: string
  semesterId?: string
  gradeId?: string
  subjectId?: string
}) {
  const subjectId = _params.subjectId ?? ''
  let data: ClassScoreCompareData
  if (subjectId === 'subject-2') {
    // 数学：10 个班（演示横向滚动）
    data = { classCount: 10, groupAvgScore: '74.5', classes: buildClassScores(10, 70) }
  } else if (subjectId === 'subject-3') {
    // 英语：空态
    data = { classCount: 0, groupAvgScore: '0', classes: [] }
  } else {
    // 默认：设计稿同款 6 班（1/2 班 80 高于 71.4 蓝柱，3~6 班低于橙柱）
    data = { classCount: 6, groupAvgScore: '71.4', classes: buildClassScores(6, 74) }
  }
  return delay({ code: 200 as const, data })
}
```

> 实现注意：默认场景 6 班数据需与设计稿视觉一致（2 根蓝柱在左、4 根橙柱）。`buildClassScores(6, 74)` 产出均分 74+(-6~6)——实现后如柱色分布与设计稿不符（应 1/2 班 ≥71.4 蓝，3~6 班 <71.4 橙），微调 base 或偏移序列。Y 兜底截断另测（Task 4）。

**Step 3：验证** vue-tsc 0 error。

---

## Task 2：class-score-compare 组件

> **Skill:** echarts · 置信度 0.9 · **需人工确认后激活**
> **理由:**（router.mjs --annotate 命中 + 人工测评）Task 含 ECharts 柱状图构建（echarts/core 按需注册、BarChart、markLine、自定义 tooltip）。**开发本 Task 前必须先读 `echarts` skill**（`C:\Users\YIL\.agents\skills\echarts\SKILL.md`），按其规范使用按需引入与常见坑（容器高度、resize、dispose）。

**Files:**

- Create: `apps/data-board/src/components/class-score-compare/class-score-compare.model.ts`
- Create: `apps/data-board/src/components/class-score-compare/class-score-compare.data.ts`
- Create: `apps/data-board/src/components/class-score-compare/class-score-compare.vue`
- Create: `apps/data-board/src/components/class-score-compare/class-score-compare.scss`
- Create: `apps/data-board/src/plugins/echarts.ts`（按需注册，全应用共享）

**Step 1：按需注册（plugins/echarts.ts）**

```ts
// apps/data-board/src/plugins/echarts.ts

import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

echarts.use([BarChart, GridComponent, MarkLineComponent, TooltipComponent, CanvasRenderer])

export { echarts, VChart }
```

**Step 2：类型**

```ts
// class-score-compare.model.ts

import type { ClassScoreCompareData } from '@/constants/overview'

export interface ClassScoreCompareProps {}
```

**Step 3：主题常量**

```ts
// class-score-compare.data.ts

export const SCORE_COLORS = {
  normal: '#027AFF',
  below: '#FF6F00',
  markLine: '#555555',
  axisLabel: '#777777',
  splitLine: '#E5E6EB',
} as const

export const COMPONENT_TEXTS = {
  title: '班级教学均分对比',
  summaryTemplate: (count: number, avg: string) =>
    `${count} 个班教学均分与组均评分 ${avg} 的差距（虚线）；红色=低于组均评分的班级，建议听评课与教研帮扶优先覆盖`,
  markLineLabel: '平均分',
  emptyText: '暂无数据',
} as const
```

**Step 4：组件**

```vue
<!-- class-score-compare.vue -->
<template>
  <div class="class-score-compare">
    <div class="class-score-compare__title">
      <span class="class-score-compare__bar" />
      <span class="class-score-compare__title-text">班级教学均分对比</span>
    </div>
    <p class="class-score-compare__description">{{ summaryText }}</p>

    <div v-if="hasClasses" class="class-score-compare__chart-card">
      <div class="class-score-compare__chart-scroll">
        <VChart
          class="class-score-compare__chart"
          :option="chartOption"
          autoresize
        />
      </div>
    </div>
    <div v-else-if="ready" class="class-score-compare__empty">
      <span class="class-score-compare__empty-icon">
        <el-icon><Promotion /></el-icon>
      </span>
      <span class="class-score-compare__empty-text">暂无数据</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClassScoreCompareData } from '@/constants/overview'
import type { ClassScoreCompareProps } from './class-score-compare.model'
import { getClassScoreCompareApi } from '@/api/overview'
import { VChart } from '@/plugins/echarts'
import { Promotion } from '@element-plus/icons-vue'
import { COMPONENT_TEXTS, SCORE_COLORS } from './class-score-compare.data'

defineProps<ClassScoreCompareProps>()

const data = ref<ClassScoreCompareData | null>(null)
const ready = ref(false)
const refreshing = ref(false)

let requestSeq = 0

/** Y 兜底截断：保留一位小数、不四舍五入（数值化失败原样返回）。 */
function truncateOneDecimal(value: string) {
  const num = Number(value)
  if (Number.isNaN(num)) {
    return value
  }
  return String(Math.floor(num * 10) / 10)
}

const summaryText = computed(() => {
  const count = data.value?.classCount ?? 0
  const avg = truncateOneDecimal(data.value?.groupAvgScore ?? '0')
  return COMPONENT_TEXTS.summaryTemplate(count, avg)
})

const hasClasses = computed(() => (data.value?.classes.length ?? 0) > 0)

const chartOption = computed(() => {
  if (!data.value) {
    return {}
  }
  const groupAvg = Number(truncateOneDecimal(data.value.groupAvgScore))
  const classes = data.value.classes
  return {
    grid: { left: 40, right: 60, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: classes.map(item => item.className),
      axisLabel: { color: SCORE_COLORS.axisLabel, fontSize: 12 },
      axisLine: { lineStyle: { color: SCORE_COLORS.splitLine } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: { color: SCORE_COLORS.axisLabel, fontSize: 12 },
      splitLine: { lineStyle: { type: 'dashed', color: SCORE_COLORS.splitLine } },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: { dataIndex: number }) => {
        const item = classes[params.dataIndex]
        const teachers = item.teacherNames.join('、')
        return [
          `<span style="font-size:14px;font-weight:600;color:#333">${item.className}</span>`,
          `<span style="color:#555">教学均分</span> <b style="color:#333">${item.avgScore}</b> ｜ <span style="color:#555">份数</span> <b style="color:#333">${item.reportCount}份</b> ｜ <span style="color:#555">达标率</span> <b style="color:#333">${item.passRate}</b>`,
          `<span style="color:#555">授课教师</span> <b style="color:#333">${teachers}</b>`,
        ].join('<br>')
      },
    },
    series: [
      {
        type: 'bar',
        barWidth: 26,
        data: classes.map(item => ({
          value: Number(item.avgScore),
          itemStyle: {
            color: Number(item.avgScore) < groupAvg ? SCORE_COLORS.below : SCORE_COLORS.normal,
          },
        })),
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { type: 'dashed', color: SCORE_COLORS.markLine },
          label: {
            formatter: COMPONENT_TEXTS.markLineLabel,
            color: SCORE_COLORS.markLine,
            fontSize: 12,
            position: 'end',
          },
          data: [{ yAxis: groupAvg }],
        },
      },
    ],
  }
})

async function loadData() {
  const route = useRouter().currentRoute.value
  const seq = ++requestSeq
  refreshing.value = true
  const result = await getClassScoreCompareApi({
    campusId: route.query.campusId as string | undefined,
    semesterId: route.query.semesterId as string | undefined,
    gradeId: route.query.gradeId as string | undefined,
    subjectId: route.query.subjectId as string | undefined,
  })
  if (seq !== requestSeq) return
  data.value = result.data
  refreshing.value = false
}

onMounted(async () => {
  await loadData()
  ready.value = true
})

// 页面顶部筛选变化 → 重新请求（筛选键同步由 use-overview-query 负责）
const route = useRoute()
watch(
  () => [route.query.campusId, route.query.semesterId, route.query.gradeId, route.query.subjectId],
  () => {
    if (ready.value) loadData()
  },
)
</script>

<style scoped lang="scss">
@use './class-score-compare';
</style>
```

> **实现注意（执行者必读）：**
> ① `useRouter()`/`useRoute()` 由 Auto Import 提供；`route` 引用需在 watch 之前声明（代码顺序已排好，实现时保持）。
> ② tooltip formatter 的 HTML 字符串需防 XSS——数据为 mock/后端可信文本，本期不做转义，README 注明。
> ③ 根容器 `.class-score-compare` 的 `is-refreshing` 降透明度类实现（同 group-focus）。
> ④ `hasClasses=false` 且 mock 返回空数组时 ready 后渲染空态块。

**Step 5：样式**

```scss
// class-score-compare.scss
.class-score-compare {
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: opacity 0.2s ease;

  &.is-refreshing {
    opacity: 0.6;
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
    color: #333;
  }

  &__description {
    margin: 0;
    font-size: 16px;
    color: #555;
  }

  &__chart-card {
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    background-color: #ffffff;
    padding: 12px;
  }

  &__chart-scroll {
    overflow-x: auto;
  }

  // 班级多时图表按班级数扩展宽度，外层滚动（10 班 × 118 ≈ 1180 > 容器宽）
  &__chart {
    width: 100%;
    min-width: 700px;
    height: 260px;
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
    color: #777;
    font-size: 20px;
  }

  &__empty-text {
    font-size: 20px;
    color: #333;
  }
}
```

> 实现注意：横向滚动方案落地为「echarts 容器 min-width 固定 + 数据多时按 `classes.length × 118px` 动态 style width」（`chartStyle` computed：`:style="{ width: chartWidth }"`，`chartWidth = classes.length > 8 ? `${classes.length * 118}px` : '100%'`）。实现时按此补充，滚动条出现在 `__chart-scroll`。

**Step 6：验证** vue-tsc 0 error。

---

## Task 3：接入 plan-lessons

> **Skill:** — 无匹配

**Files:**

- Modify: `apps/data-board/src/views/plan-lessons/plan-lessons.vue`

GroupFocus 之后追加 `<ClassScoreCompare />` + import。**验证：** vue-tsc 0 error。

---

## Task 4：端到端实测 + README + 归档

> **Skill:** echarts（调试验证遵循 skill 的渲染/resize 检查点）

**Step 1：浏览器实测（mock=campus-grade，plan-lessons 页）**

1. 默认（语文）：6 柱（1/2 班蓝、3~6 班橙）+ 71.4 虚线「平均分」右端 label；描述文案 X=6、Y=71.4
2. tooltip 悬停 2 班：班级名/教学均分/份数/达标率/授课教师
3. 科目切数学：10 班横向滚动（滚动条出现），防竞态
4. 科目切英语：空态块「暂无数据」
5. Y 兜底：mock 临时改 groupAvgScore='71.45' → 显示 71.4（不四舍五入）
6. 顶部模块/组内即时关注无回归

**Step 2：构建** `pnpm build:data-board:develop`

**Step 3：README（class-score-compare/README.md：使用/图表配置/数据契约/性能说明/完成情况/对接 #8）**

**Step 4：归档（一致性 + 还原度均适用）**
