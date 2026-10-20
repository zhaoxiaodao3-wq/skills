# 组内教师对比组件 · Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 在 `plan-lessons` 页面新增「组内教师对比」柱状图组件，与班级教学均分对比同排各半宽，替换右侧占位图。

**Architecture:** 复刻已交付 `class-score-compare` 的自包含组件模式：类型与 mock 集中在 `constants/overview.ts` / `api/overview.ts`（替换点 #9），组件自驱 `route.query` 四键、请求序号防竞态；页面侧补 `chart-row` 双列 grid 并删除占位。

**Tech Stack:** Vue 3 `<script setup>` + TS、ECharts 6 按需（`src/plugins/echarts.ts` 已注册 Bar/Grid/Tooltip/MarkLine，无需新增）、Element Plus 图标、SCSS。

**仓库根：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**规则：** ❌ 全程禁止 `git commit` / `git push`（改动留工作区）；每 Task 完成后跑 `vue-tsc` 相关校验。

---

### Task 1: 类型定义（constants/overview.ts）

> **Skill:** 无需 skill · 置信度 — · 人工复核：纯类型追加，无路由命中

**Files:**
- Modify: `E:\code\dataView\apps-development-platform\apps\data-board\src\constants\overview.ts`（文件末尾追加）

**Step 1: 追加 TeacherScore 系列类型**

```ts
// ===== 组内教师对比 =====

export interface TeacherScoreItem {
  key: string
  teacherName: string
  avgScore: string
  improveRate: string
  passRate: string
  teacherNames: string[]
}

export interface TeacherScoreCompareData {
  teacherCount: number
  groupAvgScore: string
  teachers: TeacherScoreItem[]
}
```

**Step 2: 校验** `npx vue-tsc --noEmit -p apps/data-board/tsconfig.app.json`（或根 `pnpm` 对应 type-check）→ 0 error。

---

### Task 2: mock 接口 #9（api/overview.ts）

> **Skill:** 无需 skill · 置信度 — · 人工复核：mock 数据构造，无图表/样式逻辑

**Files:**
- Modify: `E:\code\dataView\apps-development-platform\apps\data-board\src\api\overview.ts`（import 区 + 文件末尾追加）

**Step 1: 补 import**：`TeacherScoreCompareData`、`TeacherScoreItem` 加入现有 `from '@/constants/overview'` 的 type import。

**Step 2: 追加 mock**

```ts
// ===== 组内教师对比 =====

// TODO(1.7.1-接口替换): [#9] 组内教师对比接口。X（teacherCount）/Y（groupAvgScore，
// 后端截断 1 位小数）/每位教师字段均由后端聚合返回；均分降序与 A+B 口径在后端。
const TEACHER_SCORE_NAMES = ['林欣', '周丽', '吴平', '郑凯', '孙悦', '马涛', '何静', '高翔', '罗晨', '谢芳']

function buildTeacherScores(count: number, base: number): TeacherScoreItem[] {
  return Array.from({ length: count }, (_, index) => {
    const avgScore = base - index * 3.2
    return {
      key: `teacher-${index + 1}`,
      teacherName: TEACHER_SCORE_NAMES[index] ?? `教师${index + 1}`,
      avgScore: avgScore.toFixed(1),
      improveRate: `${(4 + index * 1.7).toFixed(1)}%`,
      passRate: `${(92 - index * 4.3).toFixed(1)}%`,
      teacherNames: [TEACHER_SCORE_NAMES[index] ?? `教师${index + 1}`],
    }
  })
}

export function getTeacherScoreCompareApi(_params: {
  campusId?: string
  semesterId?: string
  gradeId?: string
  subjectId?: string
}) {
  const subjectId = _params.subjectId ?? ''
  let data: TeacherScoreCompareData
  if (subjectId === 'subject-3') {
    // 英语：空态
    data = { teacherCount: 0, groupAvgScore: '0', teachers: [] }
  } else if (subjectId === 'subject-2') {
    // 数学：10 位（演示横向滚动），含截断样例 71.45 → '71.4' 由组均值体现
    data = { teacherCount: 10, groupAvgScore: '74.5', teachers: buildTeacherScores(10, 86) }
  } else {
    // 默认：设计稿同款 3 人（林欣 82.5 蓝 / 周丽 71.0 橙 / 吴平 60.4 橙，组均 71.4）
    data = { teacherCount: 3, groupAvgScore: '71.4', teachers: buildTeacherScores(3, 82.5) }
  }
  return delay({ code: 200 as const, data })
}
```

> 注：默认分支让第 2 位（82.5-3.2=79.3…）高于 71.4 蓝、后续橙——实现时按需微调 base/步长，保证 3 柱中至少 1 橙 2 蓝或贴近设计稿（林欣>组均、周丽/吴平<组均）。以浏览器目测为准，mock 数值可调。

**Step 3: 校验** vue-tsc 0 error。

---

### Task 3: 组件 .data.ts 常量与工具

> **Skill:** 无需 skill · 置信度 0.70→否决 · 人工复核：router 命中源于注释关键词，实际为纯常量/转义工具，与图表无关

**Files:**
- Create: `E:\code\dataView\apps-development-platform\apps\data-board\src\components\teacher-score-compare\teacher-score-compare.data.ts`

**Step 1: 写入**

```ts
export const TEACHER_SCORE_COLORS = {
  normal: '#027AFF',
  below: '#FF6F00',
  markLine: '#555555',
  axisLabel: '#777777',
  splitLine: '#E5E6EB',
} as const

export const COMPONENT_TEXTS = {
  title: '组内教师对比',
  summaryTemplate: (count: number, avg: string) =>
    `组内 ${count} 位教师，按评分均分排序；红色=低于组均评分，虚线=组均评分 ${avg}`,
  markLineLabel: '平均分',
  emptyText: '暂无数据',
} as const

/** tooltip HTML 注入转义（echarts skill：HTML formatter 必须转义）。 */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** 保留一位小数、不四舍五入；数值化失败原样返回。 */
export function truncateOneDecimal(value: string) {
  const num = Number(value)
  if (Number.isNaN(num)) return value
  return String(Math.floor(num * 10) / 10)
}
```

---

### Task 4: 组件 .model.ts

> **Skill:** 无需 skill · 置信度 — · 人工复核：纯类型导出

**Files:**
- Create: `...\components\teacher-score-compare\teacher-score-compare.model.ts`

```ts
import type { TeacherScoreCompareData } from '@/constants/overview'

export interface TeacherScoreCompareProps {}

export type { TeacherScoreCompareData }
```

---

### Task 5: 组件 .scss（样式 token 按 spec §5）

> **Skill:** 无需 skill · 置信度 — · 人工复核：SCSS 同构抄写，token 已在 spec §5 固定

**Files:**
- Create: `...\components\teacher-score-compare\teacher-score-compare.scss`

结构与 `class-score-compare.scss` 完全同构（BEM 类名换 `teacher-score-compare`；根 `gap: 12px`、卡 `padding: 12px` 与兄弟组件一致——spec §5 裁决），仅差异点：

```scss
.teacher-score-compare {
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: opacity 0.2s ease;

  &.is-refreshing { opacity: 0.6; }
  &__title { display: flex; align-items: center; gap: 4px; }
  &__bar { width: 4px; height: 16px; background-color: #027aff; }
  &__title-text { font-size: 20px; font-weight: 600; color: #333; }
  &__description { margin: 0; font-size: 16px; color: #555; }
  &__chart-card { padding: 12px; background-color: #fff; border: 1px solid #e5e6eb; border-radius: 8px; }
  &__chart-scroll { overflow-x: auto; }
  &__chart { width: 100%; height: 260px; }
  &__empty { /* 同 class 组件空态规格 */ }
  &__empty-icon { /* 同 */ }
  &__empty-text { /* 同 */ }
}
```

（空态三块直接对照 `class-score-compare.scss:52-77` 抄写、类名替换。）

---

### Task 6: 组件 .vue（核心）

> **Skill:** echarts · 置信度 0.85 · **自动激活**（router 0.70 + 人工上调）
> **理由:** ECharts option 构建、tooltip HTML formatter（转义/confine）、markLine、VChart lifecycle/merge 更新
> **执行前必读:** echarts skill，遵循其共享注册模块（**不重复注册**）、`confine`、escapeHtml、`update-options notMerge` 等检查点

**Files:**
- Create: `...\components\teacher-score-compare\teacher-score-compare.vue`

要点（对照 `class-score-compare.vue` 逐段改写）：

1. 模板：标题行（bar + `COMPONENT_TEXTS.title`）→ `{{ summaryText }}` → `v-if hasTeachers` 图表卡（`VChart` + `chartWidth`）→ `v-else-if ready` 空态。
2. `summaryText = summaryTemplate(teacherCount, truncateOneDecimal(groupAvgScore))`。
3. `chartWidth = count > 7 ? count * 68 + 'px' : '100%'`。
4. `chartOption`：
   - grid `{ left: 40, right: 70, top: 20, bottom: 30 }`
   - yAxis `min: min => Math.floor((min - 4) / 5) * 5`、splitLine dashed `#E5E6EB`、label 12px `#777`
   - xAxis 类目 `teacherName`、label 12px `#777`、axisLine `#E5E6EB`、axisTick false
   - tooltip `confine: true`，三行：
     ```
     <b 14px/600 #333>{teacherName}</b>
     <span #555>平均分</span> <b>{avgScore}</b> ｜ <span #555>待改进率</span> <b>{improveRate}</b> ｜ <span #555>达标率</span> <b>{passRate}</b>
     <span #555>授课教师</span> <b>{teacherNames.join('、')}</b>
     ```
     全部经 `escapeHtml`。
   - series bar `barWidth: 50`，`itemStyle.color = avg < groupAvg ? below : normal`
   - markLine silent、dashed `#555`（`opacity: 0.5`）、label `平均分` position end、`yAxis: Number(truncateOneDecimal(groupAvgScore))`
5. 数据流：`onMounted` → `loadData()`（`getTeacherScoreCompareApi` 四键）→ `ready=true`；`watch(route.query 四键)` 就绪后重拉；`requestSeq` 防竞态；`refreshing` 控制 `is-refreshing`。
6. `<style scoped lang="scss">@use './teacher-score-compare';</style>`。

**校验：** vue-tsc 0 error；`components.d.ts` 由 dev/build 自动更新。

---

### Task 7: 页面接入 + 布局 + 占位删除

> **Skill:** 无需 skill · 置信度 — · 人工复核：模板/SCSS 布局与资源删除

**Files:**
- Modify: `...\src\views\plan-lessons\plan-lessons.vue`
- Modify: `...\src\views\plan-lessons\plan-lessons.scss`
- Delete: `...\src\assets\placeholders\ph-teacher-sort.png`

**Step 1:** `plan-lessons.scss` 追加：

```scss
&__chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;

  @media (max-width: 1280px) {
    grid-template-columns: 1fr;
  }
}
```

**Step 2:** `plan-lessons.vue`：import `TeacherScoreCompare`；`chart-row` 内删除占位 `<img>`（含 `TODO(1.7.1-临时占位)` 注释），替换为 `<TeacherScoreCompare />`。

**Step 3:** 删除 `src/assets/placeholders/ph-teacher-sort.png`。

**Step 4:** 确认全局 `TODO(1.7.1-临时占位)` 由 3 处剩 2 处；`TODO(1.7.1-接口替换)` 新增 #9。

---

### Task 8: 组件 README

> **Skill:** 无需 skill · 置信度 — · 人工复核：文档编写

**Files:**
- Create: `...\components\teacher-score-compare\README.md`

对照 `class-score-compare/README.md` 结构：用途、用法（`<TeacherScoreCompare />` 自驱）、props/数据契约、替换点 #9、接入方式。

---

### Task 9: 验证（spec §6 验收 1~10）

> **Skill:** echarts · 置信度 0.60 · 人工复核：验证步骤含图表渲染实测（横滚/空态/tooltip），执行时参照 echarts skill 检查点核对；无需新 skill

1. `vue-tsc` 0 error；`pnpm build:data-board:develop` 构建成功。
2. `pnpm dev:data-board` 浏览器实测：
   - 双列同行、各半宽（1680）；≤1280 塌单列无横溢；
   - 默认 3 柱降序 + 橙蓝阈值 + 71.4 虚线 label + Y 轴 55~80 形态；
   - 截断：临时改 mock `groupAvgScore: '71.45'` → 描述显示 71.4（验证后还原）；
   - tooltip 三行内容/转义/confine；
   - 数学 10 人 → 横滚；英语 → 空态；
   - 快速切换筛选 → 只采纳最后一次；
   - 与 Figma 渲染图 `requirements/assets/figma-teacher-compare@3x.png` 截图比对（交付还原度自检）；
   - class-score-compare、group-focus、顶部模块无回归。

**⚠️ 全程不 commit；完成后进入 Step E 交付自检（A 一致性 → B 还原度 → archive → validate）。**

---

## 开发中修订（2026-10-16 用户反馈，文档先行已同步 spec/requirements）

1. Task 6 tooltip 改为**两行**（去掉「授课教师」行），`teacherNames` 字段从契约/mock/README 移除。
2. Task 7 布局升级为**模块卡片化**（设计稿 9913:46440）：`plan-lessons` 根透明 gap 10；顶部/关注包 `__card`（pad 20）；等级分布占位 png 直置；`__chart-row` 两卡 `__chart-card`（pad 30/20、彼此 gap 10）。

---

## Skill 路由汇总（router.mjs --annotate + 人工复核）

- CLI 运行：`node E:\code\frontend-local\.agents\routing\router.mjs --annotate <本 plan>`（2026-10-16）
- 命中：`echarts` 0.70（Tech Stack 行 / escapeHtml 注释 / 图表模板行）→ 人工上调 **Task 6 = 0.85 自动激活**，Task 9 参照 0.60；Task 1/2/3/4/5/7/8 否决为无需 skill（纯类型/mock/SCSS/布局/文档）
- `riskLevel`：低（无 high、无需人工确认的标注）；`maxSkillsPerPlan` 未超限
- 开发时每个 Task 前读上方标注；Task 6 必读 echarts skill
