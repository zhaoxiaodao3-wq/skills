# 薄弱教学环节组件 · 实施计划

> **For engineer:** 按任务顺序执行；**禁止 git commit**（用户规则）。每 Task 做完验证（vue-tsc 0 error）再往下。
> **业务上下文：** `apps-development-platform/apps/data-board`；el-dialog/el-table/el-pagination 经 unplugin 自动声明；echarts 按需注册见 `src/plugins/echarts.ts`；筛选下拉共享样式 `styles/el-select-filter.scss`（mixin `el-select-filter`，宽度在本组件覆盖为 160）。

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Goal:** 交付 weak-link-table（薄弱表格）+ teacher-detail-dialog（公共空壳）+ class-subject-drill-dialog（公共下钻三区块）+ mock #13~#16 + grade-overview 接入 + README ×3。

---

## Task 1：类型 + mock 接口（#13~#16）

> **Skill:** — 无匹配

**Files:**

- Modify: `apps/data-board/src/constants/overview.ts`（追加类型）
- Modify: `apps/data-board/src/api/overview.ts`（追加 4 个函数）

**Step 1：类型（追加）**

```ts
// ===== 薄弱教学环节 / 下钻弹窗 =====

export interface WeakLinkItem {
  key: string
  className: string
  subjectName: string
  classAvgScore: string
  gradeAvgScore: string
  gap: string
  improveRate: string
  reportCount: string
  teacherName: string
}

export interface DrillTeacherItem {
  key: string
  teacherName: string
  reportCount: string
  durationText: string
  passRate: string
  gradeDist: { grade: string, count: number }[]
}

export interface DrillTrendPoint {
  weekLabel: string
  score: string
  grade: string
  teacherName: string
}

export interface DrillReportItem {
  key: string
  generatedAt: string
  weekLabel: string
  dateRange: string
  durationText: string
  reportUrl: string
  teacherName: string
  category: string   // 'A' | 'B'
  grade: string      // 优秀/良好/合格/待改进
}
```

**Step 2：mock（追加；import type 补 4 个类型）**

```ts
// ===== 薄弱教学环节 / 下钻弹窗 =====

// TODO(1.7.1-接口替换): [#13] 薄弱教学环节列表。按差距降序返回；差距后端算好
//（年级同科评分均值 − 班科评分均分，正差距为薄弱），保留一位小数字符串。
const WEAK_LINK_ITEMS: WeakLinkItem[] = [
  ['初二（6）班', '数学', '58.7', '71.4', '+12.7', '60%', '12', '王辉'],
  ['初一（5）班', '物理', '62.9', '71.4', '+8.5', '70%', '9', '李华'],
  ['初三（7）班', '化学', '65.1', '71.4', '+6.3', '55%', '11', '张明'],
  ['初二（3）班', '英语', '67.8', '71.4', '+3.6', '48%', '14', '陈静'],
  ['初一（2）班', '数学', '69.2', '71.4', '+2.2', '45%', '10', '王辉'],
  ['初三（1）班', '物理', '70.0', '71.4', '+1.4', '42%', '8', '刘强'],
  ['初二（5）班', '语文', '70.6', '71.4', '+0.8', '40%', '13', '赵雪'],
  ['初一（4）班', '英语', '71.1', '71.4', '+0.3', '38%', '9', '陈静'],
].map(([className, subjectName, classAvgScore, gradeAvgScore, gap, improveRate, reportCount, teacherName], index) => ({
  key: `weak-${index + 1}`,
  className, subjectName, classAvgScore, gradeAvgScore, gap, improveRate, reportCount, teacherName,
})) as WeakLinkItem[]

export function getWeakLinkListApi(_params: { campusId?: string, semesterId?: string, gradeId?: string }) {
  return delay({ code: 200 as const, data: { items: WEAK_LINK_ITEMS } })
}

// TODO(1.7.1-接口替换): [#14] 下钻弹窗-任教组合。semesterText 用于一句话说明。
export function getDrillTeachersApi(_params: { className: string, subjectName: string, campusId?: string, semesterId?: string }) {
  const data = {
    semesterText: '2025–2026 下学期',
    teachers: [
      { key: 't-1', teacherName: '林欣', reportCount: '6', durationText: '246 分钟', passRate: '100%', gradeDist: [{ grade: '优秀', count: 3 }, { grade: '良好', count: 2 }, { grade: '合格', count: 1 }, { grade: '待改进', count: 0 }] },
      { key: 't-2', teacherName: '周丽', reportCount: '4', durationText: '168 分钟', passRate: '75%', gradeDist: [{ grade: '优秀', count: 1 }, { grade: '良好', count: 2 }, { grade: '合格', count: 1 }, { grade: '待改进', count: 0 }] },
      { key: 't-3', teacherName: '吴平', reportCount: '3', durationText: '121 分钟', passRate: '33.3%', gradeDist: [{ grade: '优秀', count: 0 }, { grade: '良好', count: 1 }, { grade: '合格', count: 1 }, { grade: '待改进', count: 1 }] },
    ],
  }
  return delay({ code: 200 as const, data })
}

// TODO(1.7.1-接口替换): [#15] 下钻弹窗-报告评价变化趋势。同周多份 weekLabel 带 -N 后缀。
const DRILL_TREND_POINTS: DrillTrendPoint[] = Array.from({ length: 18 }, (_, index) => {
  const week = index + 1
  const sameWeek = week <= 2
  const build = (suffix: number, score: string, grade: string, teacherName: string): DrillTrendPoint => ({
    weekLabel: `第${week}周${sameWeek ? `-${suffix}` : ''}`,
    score, grade, teacherName,
  })
  if (sameWeek) {
    return week === 1
      ? build(1, '78', '良好', '林欣')
      : build(2, '85', '优秀', '林欣')
  }
  const cycle = index % 4
  const scores = ['72', '88', '81', '90']
  const grades = ['良好', '优秀', '良好', '优秀']
  const teachers = ['林欣', '周丽', '吴平', '林欣']
  return build(1, scores[cycle], grades[cycle], teachers[cycle])
})

export function getDrillTrendApi(_params: { className: string, subjectName: string, campusId?: string, semesterId?: string }) {
  return delay({ code: 200 as const, data: { points: DRILL_TREND_POINTS } })
}

// TODO(1.7.1-接口替换): [#16] 下钻弹窗-课堂报告列表。全量返回（筛选/分页由前端做，
// 真实接口可改为服务端分页，契约扩展 page/pageSize 即可）。
const DRILL_REPORTS: DrillReportItem[] = Array.from({ length: 30 }, (_, index) => {
  const day = 28 - index
  const week = Math.min(18, Math.floor(index / 2) + 1)
  const categories = index % 2 === 0 ? 'A' : 'B'
  const grades = ['优秀', '良好', '合格', '待改进']
  const teachers = ['林欣', '周丽', '吴平']
  return {
    key: `report-${index + 1}`,
    generatedAt: `2026-03-${String(day).padStart(2, '0')} 14:3${index % 10}`,
    weekLabel: `第${week}周`,
    dateRange: `03.${String(day - 3).padStart(2, '0')} ~ 03.${day}`,
    durationText: `${38 + (index % 12)} 分钟`,
    reportUrl: `https://example.com/report/mock-${index + 1}`,
    teacherName: teachers[index % 3],
    category: categories,
    grade: grades[index % 4],
  }
})

export function getDrillReportsApi(_params: { className: string, subjectName: string, campusId?: string, semesterId?: string }) {
  return delay({ code: 200 as const, data: { reports: DRILL_REPORTS } })
}
```

**Step 3：验证** vue-tsc 0 error。

---

## Task 2：plugins/echarts.ts 补 LineChart

> **Skill:** echarts（已加载：共享注册模块单点扩展）

**Files:**

- Modify: `apps/data-board/src/plugins/echarts.ts`

```ts
import { BarChart, LineChart } from 'echarts/charts'
// …
echarts.use([BarChart, LineChart, GridComponent, MarkLineComponent, TooltipComponent, CanvasRenderer])
```

**验证** vue-tsc 0 error。

---

## Task 3：teacher-detail-dialog 公共空壳

> **Skill:** — 无匹配

**Files:**

- Create: `apps/data-board/src/components/teacher-detail-dialog/teacher-detail-dialog.model.ts`
- Create: `apps/data-board/src/components/teacher-detail-dialog/teacher-detail-dialog.vue`
- Create: `apps/data-board/src/components/teacher-detail-dialog/teacher-detail-dialog.scss`
- Create: `apps/data-board/src/components/teacher-detail-dialog/README.md`

**Step 1：model**

```ts
export interface TeacherDetailOpenParams {
  teacherName: string
  campusId?: string
  semesterId?: string
}
```

**Step 2：组件**

```vue
<template>
  <el-dialog
 v-model="visible"
    title="教师详情"
    width="560px"
    append-to-body
    class="teacher-detail-dialog"
  >
    <div class="teacher-detail-dialog__teacher">{{ teacherName }}</div>
    <!-- TODO(1.7.1-教师详情): 弹窗内容待设计稿/接口就绪后实现，当前为占位 -->
    <div class="teacher-detail-dialog__placeholder">教师详情内容待实现</div>
  </el-dialog>
</template>

<script setup lang="ts">
import type { TeacherDetailOpenParams } from './teacher-detail-dialog.model'

const visible = ref(false)
const teacherName = ref('')
const params = ref<TeacherDetailOpenParams | null>(null)

function open(openParams: TeacherDetailOpenParams) {
  params.value = openParams
  teacherName.value = openParams.teacherName
  visible.value = true
}

defineExpose({ open })
</script>

<style scoped lang="scss">
@use './teacher-detail-dialog';
</style>
```

```scss
// teacher-detail-dialog.scss
.teacher-detail-dialog {
  &__teacher {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 160px;
    margin-top: 16px;
    background-color: #f2f3f5;
    border-radius: 8px;
    color: #999;
    font-size: 14px;
  }
}
```

**验证** vue-tsc 0 error。

---

## Task 4：weak-link-table 薄弱表格

> **Skill:** — 无匹配

**Files:**

- Create: `apps/data-board/src/components/weak-link-table/weak-link-table.model.ts`
- Create: `apps/data-board/src/components/weak-link-table/weak-link-table.vue`
- Create: `apps/data-board/src/components/weak-link-table/weak-link-table.scss`
- Create: `apps/data-board/src/components/weak-link-table/README.md`

**Step 1：model**

```ts
import type { WeakLinkItem } from '@/constants/overview'

export interface WeakLinkTableProps {}

export interface WeakLinkTableEmits {
  (event: 'teacherClick', item: WeakLinkItem): void
  (event: 'drillClick', item: WeakLinkItem): void
}

export type { WeakLinkItem }
```

**Step 2：组件（要点）**

```vue
<template>
  <div class="weak-link-table">
    <div class="weak-link-table__title">
      <span class="weak-link-table__bar" />
      <span class="weak-link-table__title-text">薄弱教学环节</span>
    </div>
    <p class="weak-link-table__description">
      按「年级同科评分均值 − 班科评分均分」差距降序的最薄弱「班级 × 科目」教学组
    </p>
    <el-table
      v-loading="loading"
      class="weak-link-table__table"
      :data="items"
      height="252"
    >
      <el-table-column type="index" label="#" width="56" />
      <el-table-column prop="className" label="班级" min-width="110" />
      <el-table-column prop="subjectName" label="科目" min-width="70" />
      <el-table-column prop="classAvgScore" label="班科评分均分" min-width="120">
        <template #default="{ row }">
          <span class="weak-link-table__strong">{{ truncateOneDecimal(row.classAvgScore) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="gradeAvgScore" label="年级同科评分均值" min-width="140">
        <template #default="{ row }">{{ truncateOneDecimal(row.gradeAvgScore) }}</template>
      </el-table-column>
      <el-table-column prop="gap" label="差距" min-width="80">
        <template #default="{ row }">
          <span class="weak-link-table__gap">{{ truncateOneDecimal(row.gap) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="improveRate" label="待改进率" min-width="90" />
      <el-table-column prop="reportCount" label="报告数" min-width="80" />
      <el-table-column prop="teacherName" label="责任教师" min-width="96">
        <template #default="{ row }">
          <el-link
            class="weak-link-table__link"
            :underline="false"
            @click="onTeacher(row)"
          >{{ row.teacherName }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="72" fixed="right">
        <template #default="{ row }">
          <el-link
            class="weak-link-table__link"
            :underline="false"
            @click="onDrill(row)"
          >下钻</el-link>
        </template>
      </el-table-column>
    </el-table>

    <TeacherDetailDialog ref="teacherDialogRef" @closed="undefined" />
    <ClassSubjectDrillDialog ref="drillDialogRef" />
  </div>
</template>
```

> 实现注意：① `truncateOneDecimal` 从 class-score-compare 抽到共享（见 Task 6 Step 1）后 import；② 内置弹窗：`teacherDialogRef.open(...)` / `drillDialogRef.open(...)`（弹窗组件 Task 3/5 提供 `open` expose），同时 `emit('teacherClick'|'drillClick', row)`；③ el-table 定制 token（表头 `#F3F9FF`、行文字 `#555`、hover）复用 group-focus 的 :deep 变量写法（CSS 变量直接定义在 `__table` 元素上——同元素坑已踩过，勿写后代选择器）；④ `height="252"` = 表头 42 + 5 行；⑤ loading 用 `el-table` 的 `v-loading` 指令（Element Plus 自动导入指令需确认：`vLoading` 在 app.use(ElementPlus) 全量安装下可用）。

**Step 3：数据流**

```ts
const route = useRoute()
const items = ref<WeakLinkItem[]>([])
const loading = ref(false)
let requestSeq = 0

async function loadData() { /* requestSeq 防竞态，getWeakLinkListApi({ campusId, semesterId, gradeId }) */ }
onMounted(loadData)
watch(() => [route.query.campusId, route.query.semesterId, route.query.gradeId], loadData)
```

**验证** vue-tsc 0 error（弹窗组件未建时先注释内置弹窗两行？不行——**执行顺序**：本 Task 在 Task 3 之后、Task 5 之前，需 Task 5 的弹窗存在才能编译。**调整执行顺序：Task 3 → Task 5 → Task 4**（ weak-link-table 依赖两个弹窗组件）。验证仍每 Task 独立做。

---

## Task 5：class-subject-drill-dialog 下钻弹窗

> **Skill:** echarts · 置信度 0.85 · 自动激活（趋势折线图；规范已加载：共享注册、confine、escapeHtml、类目轴）

**Files:**

- Create: `apps/data-board/src/components/class-subject-drill-dialog/class-subject-drill-dialog.model.ts`
- Create: `apps/data-board/src/components/class-subject-drill-dialog/class-subject-drill-dialog.data.ts`
- Create: `apps/data-board/src/components/class-subject-drill-dialog/class-subject-drill-dialog.vue`
- Create: `apps/data-board/src/components/class-subject-drill-dialog/class-subject-drill-dialog.scss`
- Create: `apps/data-board/src/components/class-subject-drill-dialog/README.md`

**Step 1：model**

```ts
export interface ClassSubjectDrillOpenParams {
  className: string
  subjectName: string
  campusId?: string
  semesterId?: string
}
```

**Step 2：data（主题常量）**

```ts
export const GRADE_COLORS: Record<string, string> = {
  优秀: '#00B42A',
  良好: '#027AFF',
  合格: '#FF6F00',
  待改进: '#FF2A2A',
}
export const GRADE_ORDER = ['待改进', '合格', '良好', '优秀'] // 类目轴自下而上
export const TREND_TABS = ['分数趋势', '等级趋势'] as const
export const REPORT_CATEGORIES = ['A', 'B']
export const REPORT_GRADES = ['优秀', '良好', '合格', '待改进']
// escapeHtml 复用 class-score-compare.data.ts 的导出
```

**Step 3：组件骨架（三区块 + open expose）**

```vue
<template>
  <el-dialog
    v-model="visible"
    :title="`${className} · ${subjectName}（班级 × 科目详情）`"
    width="1000px"
    append-to-body
    class="class-subject-drill-dialog"
  >
    <div v-loading="loading" class="class-subject-drill-dialog__body">
      <!-- 区块一：任教组合 -->
      <section class="class-subject-drill-dialog__section">
        <div class="class-subject-drill-dialog__section-title">任教组合</div>
        <p class="class-subject-drill-dialog__hint">
          统计学期 {{ semesterText }}，在该班上过「{{ subjectName }}」的教师共 {{ teachers.length }} 人——同一教师可能因替课多次授课
        </p>
        <el-table :data="teachers" class="class-subject-drill-dialog__table">
          <el-table-column prop="teacherName" label="授课教师" min-width="100">
            <template #default="{ row }">
              <el-link class="class-subject-drill-dialog__link" :underline="false" @click="openTeacher(row.teacherName)">{{ row.teacherName }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="reportCount" label="报告数" min-width="80" />
          <el-table-column prop="durationText" label="任课时长" min-width="100" />
          <el-table-column prop="passRate" label="达标率" min-width="80" />
          <el-table-column label="等级分布" min-width="220">
            <template #default="{ row }">
              <span
                v-for="dist in row.gradeDist"
                :key="dist.grade"
                class="class-subject-drill-dialog__pill"
                :style="{ backgroundColor: gradeColors[dist.grade] }"
              >{{ dist.grade }} {{ dist.count }}</span>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <!-- 区块二：报告评价变化趋势 -->
      <section class="class-subject-drill-dialog__section">
        <div class="class-subject-drill-dialog__trend-head">
          <div class="class-subject-drill-dialog__section-title">报告评价变化趋势</div>
          <div class="class-subject-drill-dialog__tabs">
            <button
              v-for="tab in TREND_TABS"
              :key="tab"
              type="button"
              class="class-subject-drill-dialog__tab"
              :class="{ 'is-active': activeTab === tab }"
              @click="activeTab = tab"
            >{{ tab }}</button>
          </div>
        </div>
        <div class="class-subject-drill-dialog__chart-card">
          <VChart class="class-subject-drill-dialog__chart" :option="trendOption" autoresize />
        </div>
      </section>

      <!-- 区块三：课堂报告列表 -->
      <section class="class-subject-drill-dialog__section">
        <div class="class-subject-drill-dialog__section-title">课堂报告列表</div>
        <div class="class-subject-drill-dialog__filters">
          <!-- 4 个 el-select：姓名/周次/报告类别/等级（options 见 data，均含'全部'首项） -->
        </div>
        <el-table :data="pagedReports" class="class-subject-drill-dialog__table">
          <!-- 列：报告生成时间/周次/日期范围/上课时长/查看(window.open)/上课教师(可点教师详情) -->
        </el-table>
        <el-pagination
          v-model:current-page="page"
          class="class-subject-drill-dialog__pagination"
          :page-size="20"
          :total="filteredReports.length"
          layout="total, prev, pager, next, jumper"
        />
      </section>

      <!-- 内嵌教师详情弹窗（公共空壳） -->
      <TeacherDetailDialog ref="teacherDialogRef" />
    </div>
  </el-dialog>
</template>
```

**Step 4：数据流与趋势 option（要点）**

```ts
const visible = ref(false)
const loading = ref(false)
const className = ref('')
const subjectName = ref('')
const params = ref<ClassSubjectDrillOpenParams | null>(null)
const semesterText = ref('')
const teachers = ref<DrillTeacherItem[]>([])
const points = ref<DrillTrendPoint[]>([])
const reports = ref<DrillReportItem[]>([])
const activeTab = ref<(typeof TREND_TABS)[number]>('分数趋势')
// 筛选四值 + page；filteredReports 计算属性（category/grade/teacher/week 过滤，保持原顺序=时间倒序）
// pagedReports = filteredReports.slice((page-1)*20, page*20)

function open(openParams: ClassSubjectDrillOpenParams) { /* 记录参数 + visible=true + 并行拉 #14/#15/#16（各自 requestSeq） */ }

const trendOption = computed(() => {
  const isScore = activeTab.value === '分数趋势'
  const weekLabels = points.value.map(p => p.weekLabel)
  return {
    grid: { left: 50, right: 24, top: 16, bottom: 30 },
    xAxis: { type: 'category', data: weekLabels, axisLabel: { color: '#777777', fontSize: 12, interval: 0, rotate: weekLabels.length > 12 ? 30 : 0 }, axisTick: { show: false } },
    yAxis: isScore
      ? { type: 'value', scale: true, axisLabel: { color: '#777777', fontSize: 12 }, splitLine: { lineStyle: { type: 'dashed', color: '#E5E6EB' } } }
      : { type: 'category', data: GRADE_ORDER, axisLabel: { color: '#777777', fontSize: 12 }, splitLine: { lineStyle: { type: 'dashed', color: '#E5E6EB' } } },
    tooltip: { trigger: 'item', confine: true, formatter: (p: { dataIndex: number }) => { /* 分数：教师/分数/周数；等级：等级/周数（escapeHtml） */ } },
    series: [{
      type: 'line',
      data: points.value.map(p => isScore ? Number(p.score) : p.grade),
      lineStyle: { color: '#027AFF', width: 2 },
      itemStyle: { color: '#027AFF' },
      symbol: 'circle',
      symbolSize: 6,
    }],
  }
})
```

> 实现注意：① 等级趋势 series data 为类目字符串（echarts 支持 category 值）；② `openTeacher(name)` → `teacherDialogRef.value?.open({ teacherName: name, campusId: params.value?.campusId, semesterId: params.value?.semesterId })`；③ 「查看」`window.open(row.reportUrl, '_blank')`；④ 筛选变化时 `page = 1`；⑤ 关闭弹窗不销毁状态（下次 open 重拉覆盖）；⑥ el-dialog header 关闭按钮用内置 X（`:show-close="true"` 默认）。

**Step 5：样式**（区块竖排 gap 24；section-title = 3x12 蓝竖条 + 16px/600；tabs 胶囊选中蓝底白字；chart-card 边框 `#E5E6EB` r8 高 270；pill 圆角 999 白字 12px padding 2 8；筛选行 4×160 下拉 + gap 12；分页右对齐 margin-top 12）

**验证** vue-tsc 0 error。

---

## Task 6：weak-link-table 完成 + 共享截断函数抽取

> **Skill:** — 无匹配

**Files:**

- Create: `apps/data-board/src/utils/overview.ts` 内追加 `truncateOneDecimal`（从 class-score-compare.vue 迁出为共享导出；class-score-compare、weak-link-table、drill dialog 三处统一 import）
- Modify: `apps/data-board/src/components/class-score-compare/class-score-compare.vue`（改 import）
- Create/Modify: weak-link-table（Task 4 骨架 + 弹窗接线 + README）

> 说明：weak-link-table 依赖 Task 3/5 的弹窗组件，故本 Task 排在其后完成接线；`truncateOneDecimal` 抽共享属小重构（三组件复用，符合「util 复用」规范）。

**验证** vue-tsc 0 error。

---

## Task 7：页面接入

> **Skill:** — 无匹配

**Files:**

- Modify: `apps/data-board/src/views/grade-overview/grade-overview.vue`

图表行之后追加：

```vue
<div class="grade-overview__card">
  <WeakLinkTable />
</div>
```

（import WeakLinkTable。）**验证** vue-tsc 0 error。

---

## Task 8：端到端实测 + README ×3 + 归档

> **Skill:** echarts（趋势图验证遵循 skill 检查点）

**Step 1：浏览器实测（mock=campus-grade，grade-overview）**

1. 薄弱表格：10 列、8 条、可视 5 行滚动；差距红色降序 +12.7→+0.3；责任教师/下钻蓝色
2. 点责任教师 → 教师详情空壳弹窗（标题+姓名+占位）
3. 点下钻 → 弹窗：标题「初二（6）班 · 数学（班级 × 科目详情）」；任教组合 3 人（教师可点详情、等级分布四色胶囊）；趋势默认分数折线、切等级趋势类目轴（待改进→合格→良好→优秀 自下而上）、切换不重拉；同周点「第1周」标签
4. 报告列表：4 筛选生效（姓名=林欣 → 12 条内过滤；等级=待改进 → 过滤）、分页 total 30 共 2 页、翻页、时间倒序；「查看」新窗口 mock url
5. 弹窗宽 1000、内容 80vh 滚动
6. 顶部筛选（年级）变化 → 表格重拉；其他组件无回归

**Step 2：构建** `pnpm build:data-board:develop`

**Step 3：README ×3**（weak-link-table / teacher-detail-dialog / class-subject-drill-dialog：使用方式 + 完成情况 + 对接指引 #13~#16）

**Step 4：交付自检（A 一致性 + B 还原度）→ 勾 spec 验收 → archive → 闭环清单**
