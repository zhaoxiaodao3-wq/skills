# 班级教学评价排名 · Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 年级长概览新增「班级教学评价排名」组件（科目单选 + 排序柱状图 + dataZoom 滑块），并把 `grade-overview` 模块卡片化、新行左组件右留白。

**Architecture:** 同构既有业务组件模式：类型/mock 单点（替换点 #10/#11）、组件自驱（科目内部状态 + route.query 三键）、前端稳定排序与一位小数兜底；共享 `plugins/echarts.ts` 追加注册 `DataZoomComponent`。

**Tech Stack:** Vue 3 `<script setup>` + TS、ECharts 6 按需 + vue-echarts、Element Plus 图标、SCSS。

**仓库根：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**规则：** ❌ 全程禁止 git commit / push；每 Task 后 `npx vue-tsc --noEmit -p apps/data-board/tsconfig.app.json`。

---

### Task 1: 类型定义

> **Skill:** 无需 skill · 人工复核：纯类型追加

**Files:**
- Modify: `E:\code\dataView\apps-development-platform\apps\data-board\src\constants\overview.ts`（末尾）

追加 spec §2 的 `RankSubject` / `EvalRankItem` / `EvalRankData`（含注释：`classNo` 同分排序用、`classes` 组件内排序）。

**校验：** vue-tsc 0 error。

---

### Task 2: mock #10 / #11（api/overview.ts）

> **Skill:** 无需 skill · 人工复核：mock 数据构造

**Files:**
- Modify: `...\src\api\overview.ts`（type import + 末尾）

- `getEvalRankSubjectsApi({ campusId, semesterId, gradeId })` → 9 科目（语文…政治），标 `TODO(1.7.1-接口替换): [#10]`。
- `getEvalRankDataApi({ ..., subjectId })` → 标 `[#11]`：
  - `subject-2` 数学：12 班（演示滑块），**含两班同分**（验证 tie-break）
  - `subject-3` 英语：`{ classes: [] }` 空态
  - 默认：6 班设计稿同款（`avgScore` 89.8 起降序、`classNo` 1..6，`passRate`/`reportCount`/`teacherNames` 齐）
  - 非法 subjectId：返回空数组
- 数据**无序返回**（乱序），把排序交给组件前端逻辑验证。

**校验：** vue-tsc 0 error。

---

### Task 3: echarts 共享注册追加 DataZoom

> **Skill:** echarts · 置信度 0.90 · **自动激活**
> **执行前必读:** echarts skill——共享注册模块唯一改动点、追加 `DataZoomComponent`，禁止在组件内重复 `use`

**Files:**
- Modify: `...\src\plugins\echarts.ts`

```ts
import { DataZoomComponent, GridComponent, MarkLineComponent, TooltipComponent } from 'echarts/components'
echarts.use([BarChart, DataZoomComponent, GridComponent, MarkLineComponent, TooltipComponent, CanvasRenderer])
```

---

### Task 4: 组件 .data.ts / .model.ts

> **Skill:** 无需 skill · 人工复核：常量与类型导出

**Files:**
- Create: `...\src\components\class-eval-rank\class-eval-rank.data.ts`
  - `EVAL_RANK_COLORS = { bar: '#027AFF', chipActiveBg: '#E6F2FF', chipActiveBorder: '#80BCFF', chipActiveText: '#027AFF', chipBorder: '#E5E6EB', chipText: '#555', axisLabel: '#777', splitLine: '#E5E6EB', tooltipLabel: '#777', tooltipValue: '#333' }`
  - `COMPONENT_TEXTS = { title: '班级教学评价排名', viewLabel: '排名视角', emptyText: '暂无数据', rankTemplate: (n) => \`第 ${n} 名\`, ... }`
  - `escapeHtml` / `truncateOneDecimal`（同兄弟组件复制）
- Create: `...\class-eval-rank.model.ts`（`ClassEvalRankProps {}` + 类型 re-export）

---

### Task 5: 组件 .scss

> **Skill:** 无需 skill · 人工复核：按 spec §5 token

**Files:**
- Create: `...\class-eval-rank\class-eval-rank.scss`

同构兄弟组件骨架（根 gap 12、is-refreshing、标题行、空态三块），**差异**：
- `&__view-row { display:flex; align-items:center; gap:20px; }`，`&__view-label { font-size:16px; color:#333; }`
- `&__subject-list { display:flex; flex-wrap:wrap; gap:10px; }`
- `&__subject { h30, pad 0 20, r4, 14px; 未选: 白底/#E5E6EB 边/#555；&.is-active: #E6F2FF 底/#80BCFF 边/#027AFF 600；cursor pointer; }`
- `&__chart-card { padding: 20px; border: 1px solid #E5E6EB; r8; }`（按稿 20）
- `&__chart { height: 280px; }`

---

### Task 6: 组件 .vue（核心）

> **Skill:** echarts · 置信度 0.85 · **自动激活**
> **执行前必读:** echarts skill——`confine`、escapeHtml、dataZoom 动态 show、VChart `autoresize` + `notMerge`、容器非零高度

**Files:**
- Create: `...\class-eval-rank\class-eval-rank.vue`

要点（对照 `teacher-score-compare.vue` 改写）：

1. 模板：标题行 → `v-if subjectsReady` 排名视角行（label + 胶囊 `v-for`，`:class="{ 'is-active': item.id === subjectId }"`，`@click="selectSubject(item.id)"`）→ 图表卡（`v-if hasClasses` VChart）→ `v-else-if ready` 空态。
2. 状态：`subjects = ref<RankSubject[]>`、`subjectId = ref('')`、`data = ref<EvalRankData|null>`、`ready`、`refreshing`、`requestSeq`。
3. `selectSubject(id)`：`if (id === subjectId.value) return`（单选不取消、不重拉）；`subjectId.value = id; loadData()`。
4. `sortedClasses = computed`：`[...classes]` 按 `Number(avgScore) desc → classNo asc` 稳定排序。
5. `summary`：无描述文案行（spec 未要求）；tooltip 数值走 `truncateOneDecimal`（avgScore）。
6. `chartOption`：
   - grid `{ left: 40, right: 20, top: 20, bottom: 40 }`
   - yAxis `min: min => Math.floor((min - 4) / 5) * 5`、splitLine dashed、label 12px
   - xAxis 类目 className、label 12px、axisTick false
   - `dataZoom: [{ type: 'slider', xAxisIndex: 0, bottom: 4, show: sortedClasses.length > 7 }]`
   - tooltip 三行（班级名 14/600；`第 N 名 ｜ 班级平均分 ｜ 达标率 ｜ 报告数`；`授课教师`），N = `params.dataIndex + 1`，全部 escapeHtml + `confine: true`
   - series bar `barWidth: 50`、单色 `bar`
7. 数据流：`onMounted` → `getEvalRankSubjectsApi` → `subjectId = subjects[0]?.id ?? ''` → `loadData()` → `ready=true`；`watch(route.query campusId/semesterId/gradeId)` 就绪后 `loadData()`；`requestSeq` 防竞态。
8. `<style scoped lang="scss">@use './class-eval-rank';</style>`。

**校验：** vue-tsc 0 error。

---

### Task 7: grade-overview 卡片化 + 接入

**Files:**
- Modify: `...\src\views\grade-overview\grade-overview.scss`（按 spec §4 重构：根透明 gap10 pad20、`__card`、`__chart-row`、`__chart-card`）
- Modify: `...\src\views\grade-overview\grade-overview.vue`

模板按 spec §4 顺序：`__card`(top+stat) → `__card`(GroupFocus) → 等级分布占位 img 直置 → 热力图占位 img 直置 → `__chart-row`（左 `__chart-card`→`<ClassEvalRank />`，右不放元素）；保留两个 `TODO(1.7.1-临时占位)` 注释。

**校验：** vue-tsc 0 error；全局 `临时占位` 仍 3 处。

---

### Task 8: 组件 README

**Files:**
- Create: `...\components\class-eval-rank\README.md`

对照 `teacher-score-compare/README.md` 结构：使用方式 / 交互说明（单选规则）/ 图表说明（排序、滑块、tooltip）/ 数据契约 / 替换点 #10 #11。

---

### Task 9: 验证（spec §6 验收 1~10）

1. `vue-tsc` 0 error；`pnpm build:data-board:develop` 成功。
2. 浏览器实测（dev 8102 已在跑）：卡片化灰底间隙、新行左卡右留白、单选交互（点击已选中不重拉）、同分 tie-break、`89.89→89.8` 截断、数学 12 班滑块、英语空态、竞态、tooltip 三行、兄弟页面零回归。
3. 截图与 `requirements/assets/figma-eval-rank@3x.png` 比对（还原度自检素材）。

**⚠️ 全程不 commit；完成后 Step E：A 一致性 → B 还原度 → archive → validate。**

---

## Skill 路由汇总（router.mjs --annotate + 人工复核）

- CLI：`node E:\code\frontend-local\.agents\routing\router.mjs --annotate <本 plan>`（2026-10-16）→ `echarts` 0.70 共 5 处命中（Tech Stack / 图表相关 Task 行）
- 人工复核：**Task 3 = echarts 0.90**（共享注册模块追加 DataZoom，唯一改动点）、**Task 6 = echarts 0.85 自动激活**（chartOption/dataZoom/tooltip/lifecycle）、**Task 9 = echarts 参照**（图表实测）；Task 1/2/4/5/7/8 否决（类型/mock/SCSS/布局/文档）
- `riskLevel`：低（无 high / 无需人工确认标注）
- 开发时每 Task 前读标注；Task 3/6 必读 echarts skill
