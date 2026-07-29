# 教师画像完整页面 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 搭建教师画像聚合页：左右分栏、权限左栏、聚合接口单次请求与切片分发、右侧 10 子组件编排。

**架构：** 页面 `index.vue` 持有 `activeTeacherId`；`useTeacherPortraitData` 单次拉取 `TeacherPortraitAggregate`；`provide` 上下文 给子组件；左栏三组件独立列表接口。

**技术栈：** Vue 3 + TS + Element Plus + ECharts（模块内自建，不用 VueEcharts.vue）+ Figma MCP + Tailwind/scoped CSS

**依赖顺序：** 本计划 第 0–1 波 先行 → 各子组件实施计划 并行（第 2–3 波）→ 本计划 第 4 波 联调收尾

**交付状态：** 已完成（2026-07-03）

| 项 | 状态 |
|----|------|
| W0 基建（类型 / 工具 / ECharts / Context / Mock） | ✅ |
| W1 左栏三组件接入 | ✅ |
| W2–W3 右栏 10 子组件接入 | ✅ |
| W4 联调（四角色 / 单次请求 / 缺省态） | ✅ |
| `aggregate.ts` slice 类型回写 | ✅ |
| `pnpm run typecheck` | ✅ |
| Figma 1:1 精细走查 | ⏳ 见 [figma-review-2026-07-03.md](../specs/figma-review-2026-07-03.md)；P0 布局已修复 |

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `types/aggregate.ts` | 聚合数据类型与各 slice类型 |
| `utils/number-format.ts` | 占比/整数截断 |
| `composables/useTeacherPortraitChart.ts` | ECharts 生命周期 + 丝滑动效 |
| `composables/useTeacherPortraitContext.ts` | provide/inject |
| `composables/useTeacherPortraitData.ts` | 聚合请求 + 格式化 |
| `mock/teacher-portrait-aggregate.mock.ts` | 按教师 ID 的聚合 Mock |
| `mock/role-debug.ts` | 开发环境四角色切换（实际为 `components/RoleDebugBar.vue`） |
| `teacher-portrait/index.vue` | 页面组装 |

---

### 任务 1：类型定义

**涉及文件：**
- 新建： `src/pages/school/teacher-portrait/types/aggregate.ts`

- [x] **步骤 1： 定义聚合类型**

```ts
export type TeacherPortraitAggregate = {
  teacherPortrait: Record<string, unknown> | null
  myLessonPlan: Record<string, unknown> | null
  classroomContentEval: Record<string, unknown> | null
  teachingStyleFlexibility: Record<string, unknown> | null
  teachingStyleTrend: Record<string, unknown> | null
  classroomStructureClarity: Record<string, unknown> | null
  personalTagCloud: Record<string, unknown> | null
  questionType: Record<string, unknown> | null
  classroomLanguageBehavior: Record<string, unknown> | null
  languageComprehensibility: Record<string, unknown> | null
}
```

各子组件实施计划 实施时细化对应 slice 细化为具名 interface interface，并回写本文件。

---

### 任务 2：数值格式化工具

**涉及文件：**
- 新建： `src/pages/school/teacher-portrait/utils/number-format.ts`

- [x] **步骤 1： 实现截断函数**

```ts
/** 占比：保留 1 位小数，截断不四舍五入 */
export function truncateToOneDecimal(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) return null
  const truncated = Math.trunc(value * 10) / 10
  return truncated.toFixed(1)
}

/** 整数截断（上课时长、维度均分） */
export function truncateToInteger(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null
  return Math.trunc(value)
}

export function formatEmptyDisplay(value: unknown): string {
  if (value === null || value === undefined || value === '') return '--'
  return String(value)
}
```

- [x] **步骤 2： 本地验证**

在浏览器控制台或临时脚本验证：`truncateToOneDecimal(12.39) === '12.3'`，`truncateToInteger(128.75) === 128`。

---

### 任务 3：ECharts 组合式函数（自建，禁止 VueEcharts）

**涉及文件：**
- 新建： `src/pages/school/teacher-portrait/composables/useTeacherPortraitChart.ts`

- [x] **步骤 1： 实现 composable**

```ts
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { onBeforeUnmount, onMounted, shallowRef, watch, type Ref } from 'vue'

export const CHART_ANIMATION_BASE: Pick<EChartsOption, 'animation' | 'animationDuration' | 'animationDurationUpdate' | 'animationEasing' | 'animationEasingUpdate'> = {
  animation: true,
  animationDuration: 800,
  animationDurationUpdate: 400,
  animationEasing: 'cubicOut',
  animationEasingUpdate: 'cubicInOut',
}

export function useTeacherPortraitChart(
  containerRef: Ref<HTMLElement | null | undefined>,
  options: Ref<EChartsOption>,
) {
  const chart = shallowRef<echarts.ECharts | null>(null)

  const render = () => {
    if (!containerRef.value) return
    if (!chart.value) {
      chart.value = echarts.init(containerRef.value)
    }
    chart.value.setOption({ ...CHART_ANIMATION_BASE, ...options.value }, { notMerge: false })
  }

  onMounted(() => {
    render()
    if (containerRef.value) {
      useResizeObserver(containerRef, () => chart.value?.resize())
    }
  })

  watch(options, () => nextTick(render), { deep: true })

  onBeforeUnmount(() => {
    chart.value?.dispose()
    chart.value = null
  })

  return { chart, render }
}
```

---

### 任务 4：Context 与聚合数据

**涉及文件：**
- 新建： `src/pages/school/teacher-portrait/composables/useTeacherPortraitContext.ts`
- 新建： `src/pages/school/teacher-portrait/composables/useTeacherPortraitData.ts`
- 新建： `src/pages/school/teacher-portrait/mock/teacher-portrait-aggregate.mock.ts`

- [x] **步骤 1： Context key 与 inject**

```ts
// useTeacherPortraitContext.ts
import type { InjectionKey, Ref, ComputedRef } from 'vue'
import type { UserRole } from '@/utils/user-role'
import type { TeacherPortraitAggregate } from '../types/aggregate'

export type TeacherPortraitContext = {
  activeTeacherId: Ref<string | null>
  role: ComputedRef<UserRole>
  loading: Ref<boolean>
  aggregate: Ref<TeacherPortraitAggregate | null>
  setActiveTeacherId: (id: string | null) => void
}

export const TEACHER_PORTRAIT_CONTEXT_KEY: InjectionKey<TeacherPortraitContext> =
  Symbol('teacher-portrait-context')
```

- [x] **步骤 2： useTeacherPortraitData — watch teacherId 单次请求**

```ts
export function useTeacherPortraitData(activeTeacherId: Ref<string | null>) {
  const loading = ref(false)
  const aggregate = ref<TeacherPortraitAggregate | null>(null)

  async function fetchAggregate(teacherId: string) {
    loading.value = true
    try {
      // TODO: 替换为真实 service；开发期走 mock
      aggregate.value = await fetchTeacherPortraitAggregateMock(teacherId)
    } catch {
      aggregate.value = null
    } finally {
      loading.value = false
    }
  }

  watch(activeTeacherId, (id) => {
    if (!id) {
      aggregate.value = null
      return
    }
    fetchAggregate(id)
  }, { immediate: true })

  return { loading, aggregate }
}
```

- [x] **步骤 3： Mock 至少 3 个 teacherId**

`teacher-001` 全量、`teacher-partial` 部分 slice 为空、`teacher-empty` 全空。

---

### 任务 5：页面壳 index.vue

**涉及文件：**
- 修改： `src/pages/school/teacher-portrait/teacher-portrait/index.vue`

- [x] **步骤 1： Figma MCP 拉取布局**

调用 Figma MCP `get_design_context`，`fileKey=vmbLwcwclGPoT3fWJWv7de`，`nodeId=6696:12844`，提取左右栏宽度、间距、背景色。

- [x] **步骤 2： 实现左右分栏 + 权限左栏占位**

```vue
<template>
  <div class="teacher-portrait-page flex flex-col h-[100vh] overflow-hidden">
    <h1 class="text-[30px] text-[#333] mb-[20px] shrink-0">教师画像</h1>
    <div class="flex flex-1 min-h-0 gap-[20px]">
      <aside class="shrink-0 overflow-y-auto max-h-full w-[/* Figma 左栏宽 */]">
        <TeacherListContainer v-if="showTeacherList" ... />
        <TeachingGroupContainer v-else-if="showTeachingGroup" ... />
        <MyInfoContainer v-else-if="showMyInfo" ... />
      </aside>
      <main class="flex-1 overflow-y-auto min-h-0 space-y-[/* Figma 间距 */]">
        <!-- 按 规格顺序引入 10 个 Container，v-for 或显式排列 -->
      </main>
    </div>
  </div>
</template>
```

- [x] **步骤 3： 初始化 activeTeacherId 逻辑**

```ts
const flags = getCurrentUserRoleFlags()
const activeTeacherId = ref<string | null>(null)

onMounted(() => {
  if (flags.isTeacher) {
    activeTeacherId.value = getCurrent当前用户信息()?.userLoginIdentity?.identityId ?? null
  }
})

function handleTeacherSelect(id: string) {
  activeTeacherId.value = id
}

function handleMemberSelect(id: string | null) {
  activeTeacherId.value = id
}
```

- [x] **步骤 4： provide context**

```ts
const { loading, aggregate } = useTeacherPortraitData(activeTeacherId)
provide(TEACHER_PORTRAIT_CONTEXT_KEY, {
  activeTeacherId,
  role: computed(() => getCurrentUserRole()),
  loading,
  aggregate,
  setActiveTeacherId: (id) => { activeTeacherId.value = id },
})
```

---

### 任务 6：开发环境角色 Mock 切换

**涉及文件：**
- 新建： `src/pages/school/teacher-portrait/components/RoleDebugBar.vue`（内联于页面，未单独建 `mock/role-debug.ts`）

- [x] **步骤 1： 仅 `import.meta.env.DEV` 下渲染切换条**

覆盖 Admin / SchoolAdmin / GroupAdmin / Teacher，切换时重置 `activeTeacherId` 并按 规格第 7 节规则重新初始化。

---

### 任务 7：联调验收（第 4 波）

- [x] 四角色左栏组件正确
- [x] 切换教师仅 1 次聚合请求（浏览器网络面板验证）
- [x] `activeTeacherId=null` 时 10 组件均缺省
- [x] 左右独立滚动
- [x] 右栏顺序含个人标签云第 7 位

---

## 子组件实施计划 索引

| 波次 | 模块实施计划 | 状态 |
|------|-----------|------|
| W1 | 教师列表、教学小组、我的信息 | ✅ |
| W2 | 教学风格与弹性特征 → 教师画像 | ✅ |
| W3 | 我的教案、课堂教学内容评价、教学风格变化趋势、课堂结构清晰度、个人标签云、提问类型、课堂语言行为、语言可理解度 | ✅ |
