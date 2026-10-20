# 班级科间教学均衡诊断 · Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 年级长概览 `__chart-row` 右列新增「班级科间教学均衡诊断」横向条形图组件（三态着色 + 三态 tooltip + 阈值通道 + ⚠ 条件行）。

**Architecture:** 同构既有业务组件模式：类型/mock 单点（#12，含 `thresholds` 对接通道）、三色与固定文案单点 `.data.ts`、横向 bar（`yAxis.inverse`）+ markLine 失衡线 + 条右端 label、空图表口径沿用、`requestSeq` 防竞态、route 三键自驱。

**Tech Stack:** Vue 3 `<script setup>` + TS、ECharts 6 按需（Bar/Grid/Tooltip/MarkLine 已注册，**无需新增**，无 dataZoom）、vue-echarts、SCSS。

**仓库根：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**规则：** ❌ 禁止 git commit / push；每 Task 后 `npx vue-tsc --noEmit -p apps/data-board/tsconfig.app.json`；完成后跑 `eslint`/`stylelint`。

---

### Task 1: 类型定义

> **Skill:** 无需 skill · 人工复核：纯类型追加

**Files:**
- Modify: `E:\code\dataView\apps-development-platform\apps\data-board\src\constants\overview.ts`（末尾）

追加 spec §2 全部类型：`BalanceLevel` / `BalanceSubjectDev` / `BalanceDiagnosisItem` / `BalanceThresholds` / `BalanceDiagnosisData`（注释含分档规则与 ⚠ 计数含义）。

**校验：** vue-tsc 0 error。

---

### Task 2: mock #12（api/overview.ts）

> **Skill:** 无需 skill · 人工复核：mock 构造

**Files:**
- Modify: `...\src\api\overview.ts`（type import + 末尾）

- `getBalanceDiagnosisApi({ campusId, semesterId, gradeId })`，标 `TODO(1.7.1-接口替换): [#12]`。
- mock：`thresholds: { warn: 5, critical: 8 }` 写死；6 班 2 红/2 黄/2 绿、**乱序返回**、含一组同分（验证 tie-break）、红班含 `lowSubjectCount: 8`（⚠ 显示）与一个 `lowSubjectCount: 2`（不显示）；`className` 用「初二(6)班」样式、`classNo` 1..6；`rangeScore`/`deviation` 一位小数字符串。
- 索引访问注意 `noUncheckedIndexedAccess`（取元素加 `if` / `filter` 兜底）。

**校验：** vue-tsc 0 error。

---

### Task 3: 组件 .data.ts / .model.ts

> **Skill:** 无需 skill · 人工复核：常量与类型

**Files:**
- Create: `...\src\components\class-balance-diagnosis\class-balance-diagnosis.data.ts`
  - `LEVEL_COLORS = { red: '#FF2A2A', yellow: '#FF6F00', green: '#00B42A' }`（前端固定，仅三种）
  - `STATUS_TEXTS` / `ADVICE_TEXTS`（三档固定文案，key 为 `BalanceLevel`）
  - `DESCRIPTION_TEMPLATE(thresholds)`：说明长文模板（逐字按 spec §5/需求，阈值插值）
  - `TOOLTIP_LABELS`（状态判定/相对偏差极差/评价最高科/评价最低科/建议/全班性偏低句）
  - `escapeHtml` / `truncateOneDecimal`（复制同系列）
- Create: `...\class-balance-diagnosis.model.ts`（`ClassBalanceDiagnosisProps {}` + 类型 re-export）

---

### Task 4: 组件 .scss

> **Skill:** 无需 skill · 人工复核：按 spec §5 token

**Files:**
- Create: `...\class-balance-diagnosis\class-balance-diagnosis.scss`

同构兄弟骨架（根 gap 12、`is-refreshing`、标题行）+ `&__description { margin:0; font-size:16px; color:#555; }` + `&__chart-card { padding:20px; border:1px solid #e5e6eb; r8 }` + `&__chart { width:100% }`（高度由 JS 动态绑定，不写死）。**无空态块**（空图表口径）。

---

### Task 5: 组件 .vue（核心）

> **Skill:** echarts · 置信度 0.85 · **自动激活**
> **执行前必读:** echarts skill——横向 bar（`yAxis.inverse`）、markLine、series label position right、tooltip `confine` + escapeHtml、容器高度动态非零、`autoresize` + `notMerge`

**Files:**
- Create: `...\class-balance-diagnosis\class-balance-diagnosis.vue`

要点（对照 `class-eval-rank.vue` 改写）：

1. 模板：标题行 → 说明 `<p class="__description">{{ description }}</p>`（阈值插值）→ `v-if="ready"` 图表卡（`VChart` `:style="{ height: chartHeight }"`）。**无空态分支**。
2. 状态：`data = ref<BalanceDiagnosisData|null>`、`ready`、`refreshing`、`requestSeq`。
3. `sortedClasses`：`rangeScore` desc → `classNo` asc 稳定排序。
4. `chartHeight = Math.max(180, count * 27 + 36)`。
5. `chartOption`：
   - grid `{ left: 90, right: 140, top: 10, bottom: 30 }`（left 容纳班级名 16px，right 容纳条端标注）
   - `yAxis: { type:'category', data: classNames, inverse: true, axisLabel: { color:'#777', fontSize:16 }, axisLine/show:false, axisTick:false }`
   - `xAxis: { type:'value', min:0, max: dynamicMax(对齐10倍数), axisLabel:{ color:'#AAAAAA', fontSize:12 }, splitLine:{ lineStyle:{ color:'#F2F3F5' } } }`
   - series bar：`barWidth: 16`，`data: [{ value, itemStyle: { color: LEVEL_COLORS[level] } }]`，`label: { position:'right', color:'#777', fontSize:14, formatter: '最低科 {name} {dev}' }`
   - `markLine`：`xAxis: thresholds.warn`、`#FF2A2A` opacity .5 dash 4,4、label 底部 `失衡线 {warn}` 12px `#FF2A2A`、`silent:true`、`symbol:'none'`
   - tooltip `confine:true`，formatter（全部 escapeHtml + `truncateOneDecimal`）：
     - 行1 `{className} ｜ 科间均衡诊断`（14/600 #333）
     - 行2 `状态判定：{STATUS_TEXTS[level]}`（值色 = LEVEL_COLORS[level]）
     - 行3 `相对偏差极差：{rangeScore} 分（失衡线 {warn} / 红线 {critical}）`
     - 行4/5 `评价最高科/评价最低科：{name}（{deviation}）`（name 600 #333，dev #555）
     - 行6 `建议：{ADVICE_TEXTS[level]}`
     - 行7（`lowSubjectCount >= 3` 才 push）`⚠ 全班性偏低：{N} 科教师评价低于年级同科评分均值 3 分以上（提示班级课堂环境/管理因素，该找班主任而非单科教师）`，整行 `#FF2A2A`
     - tooltip 容器边框三态色：用 `extraCssText` 或 formatter 外层 `<div style="border:1px solid {color};border-radius:8px;padding:12px;background:#fff">`（二选一，实测为准；`confine` 仍生效）
6. 数据流：`onMounted` → `getBalanceDiagnosisApi` 三键 → `ready=true`；`watch(route.query 三键)` 就绪后重拉；`requestSeq` 防竞态。
7. `<style scoped lang="scss">@use './class-balance-diagnosis';</style>`。

**校验：** vue-tsc 0 error。

---

### Task 6: 页面接入（右列补卡）

**Files:**
- Modify: `...\src\views\grade-overview\grade-overview.vue`

`__chart-row` 右侧留白处补：

```html
<div class="grade-overview__chart-card">
  <ClassBalanceDiagnosis />
</div>
```

+ import。scss / 其它结构**零改动**。

**校验：** vue-tsc 0 error。

---

### Task 7: 组件 README（组件说明 + 对接说明）

**Files:**
- Create: `...\components\class-balance-diagnosis\README.md`

结构（对照 `class-eval-rank/README.md`，用户明确要求两段齐全）：
- **组件说明**：用途（科间均衡度指标含义）、使用方式（`<ClassBalanceDiagnosis />`，无 props、route 三键自驱、与左侧科目单选不联动）、图表说明（横向条/三色/失衡线/排序/动态高度/空图表）、tooltip 三态与 ⚠ 行条件（`lowSubjectCount >= 3`，N=计数，**写清楚**）、固定文案 vs 接口值的分工表
- **对接说明**：替换点 #12 入参/出参全字段表、`thresholds` 通道说明（后端下发即全站文案+线生效）、`level` 分档由后端、1 位小数口径、排序兜底、映射写在 `api/overview.ts` 组件零改动

---

### Task 8: 验证（spec §6 验收 1~10）

1. `vue-tsc` 0 error；`pnpm build:data-board:develop` 成功。
2. `npx eslint --fix` + 复检、`stylelint --fix` + 复检、`ls-lint`。
3. 浏览器自检清单：右列同排半宽、降序/同分、三色、条右标注不裁剪、失衡线、tooltip 三态边框与状态值着色、⚠ 8 显示 / 2 不显示、阈值 mock 改 6/10 联动、`16.15→16.1` 截断、空图表、三筛选重拉竞态、左组件无回归。
4. 与 `requirements/assets/figma-balance-diagnosis@3x.png` + 用户截图对照（还原度自检素材）。

**⚠️ 全程不 commit；完成后 Step E：A 一致性 → B 还原度 → archive（含组件说明/对接说明交付确认）→ validate。**

---

## Skill 路由汇总（router.mjs --annotate + 人工复核）

- CLI：`node E:\code\frontend-local\.agents\routing\router.mjs --annotate <本 plan>`（2026-10-16）→ `echarts` 0.70（Tech Stack / 图表 Task 行命中）
- 人工复核：**Task 5 = echarts 0.85 自动激活**（横向 bar/markLine/label/tooltip confine/动态高度 lifecycle，执行前必读）；**Task 8 参照**（图表实测）；Task 1/2/3/4/6/7 否决（类型/mock/常量/SCSS/布局/文档）
- `riskLevel`：低（无 high / 无需人工确认）
- `plugins/echarts.ts` **零改动**（Bar/Grid/Tooltip/MarkLine 已注册，无 dataZoom 需求）
