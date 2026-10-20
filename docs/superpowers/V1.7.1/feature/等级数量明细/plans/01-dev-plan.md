# 等级数量明细 · Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 四页公共「等级数量明细」模块：同事区截图占位 + 通用表格组件（可配置列/筛选/分页），两页同步卡片化。

**Architecture:** 配置驱动通用组件（`permission` → `LEVEL_DETAIL_PAGE_CONFIGS` 列与筛选字段）；类型/mock 单点（#13/#14）；el-table + el-pagination 二次定制；四页页尾 `__module` 追加。

**Tech Stack:** Vue 3 `<script setup>` + TS、Element Plus（el-table/el-pagination/el-select）、SCSS（共享 `el-select-filter.scss`）。**无 ECharts**。

**仓库根：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**规则：** ❌ 禁止 git commit / push；每 Task 后 `npx vue-tsc --noEmit -p apps/data-board/tsconfig.app.json` + `eslint`/`stylelint`。

---

### Task 1: 类型与页面配置（constants/overview.ts）

> **Skill:** 无需 skill · 人工复核：纯类型/常量追加

**Files:**
- Modify: `E:\code\dataView\apps-development-platform\apps\data-board\src\constants\overview.ts`（末尾 + `DataPermissionType` import）

追加 spec §2 全部：`LevelDetailPeriodType` / `LevelDetailFilterOption(s)` / `LevelDetailColumnKey` / `LevelDetailRow` / `LevelDetailPageData` / `LevelDetailPageConfig` / `LEVEL_DETAIL_PAGE_CONFIGS`（四页 filterFields + columns，列文案权威=用户四截图；首列 key `period`）。注意 `DataPermissionType` 从 `@/utils/data-permission.model` 引入（若未引）。

**校验：** vue-tsc 0 error。

---

### Task 2: mock #13 / #14（api/overview.ts）

> **Skill:** 无需 skill · 人工复核：mock 构造

**Files:**
- Modify: `...\src\api\overview.ts`（type import + 末尾）

- `getLevelDetailFilterOptionsApi({ periodType, campusId?, semesterId?, gradeId? })`：`periods` 按 periodType 给周（第1~18周，含「全部」id=''）或月（2026-01…）；`grades`/`subjects`/`classes` 按需给；标 `TODO(1.7.1-接口替换): [#13]`。
- `getLevelDetailPageApi({...筛选, page, pageSize})`：内置 15 条按周期升序数据（含 `delta` 四态 `+1/-1/0/-`、`improve` 含 0 与 2、`total` 后端算好），**按 page/pageSize 真实切片**、返回 `{ list, total: 15 }`；筛选非法回退全量；`periodType='month'` 返回月周期样例；标 `[#14]`。
- 索引访问注意 `noUncheckedIndexedAccess`。

**校验：** vue-tsc 0 error。

---

### Task 3: 组件 .data.ts / .model.ts

> **Skill:** 无需 skill · 人工复核：常量与类型

**Files:**
- Create: `...\src\components\level-detail-table\level-detail-table.data.ts`
  - `COLUMN_LABELS: Record<LevelDetailColumnKey, string>`（周期/日期范围/年级/科目/班级/优秀/良好/合格/待改进/合计/优秀△/良好△/合格△/待改进△）
  - `FILTER_LABELS`（period→周期、grade→年级、subject→科目、class→班级）
  - `DELTA_COLORS`（`+`→`#00B42A`、`-`(非单横线)→`#FF2A2A`、`0`/`-`→`#555`）+ `deltaStyle(value)` 返回 `{ color, fontWeight }`
  - `COMPONENT_TEXTS = { title: '等级数量明细', emptyText: '暂无数据', allOption: '全部' }`
- Create: `...\level-detail-table.model.ts`（`LevelDetailTableProps { permission, periodType? }` + 类型 re-export）

---

### Task 4: 组件 .scss

> **Skill:** 无需 skill · 人工复核：按 spec §5 token

**Files:**
- Create: `...\level-detail-table\level-detail-table.scss`

- 根：flex col gap 10；`is-refreshing` opacity .6
- `&__header { display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; }`
- `&__title { font-size:16px; font-weight:600; color:#333; }`
- `&__filters { display:flex; gap:20px; }` `&__filter { gap:10px; label 14/400 #333 }`（下拉样式 `@use '@/styles/el-select-filter'` mixin，按 group-focus 用法）
- `&__table`（与 `.el-table` 同元素）：`--el-table-header-bg-color:#F3F9FF`、表头行高 42/字 16/600 `#333`、行高 42/字 16/400 `#555`、行底边 `#F2F3F5`、单元格纵向居中；空态沿组件库
- 分页容器 `&__pagination { display:flex; justify-content:flex-end? }`——按稿跳转在左：直接用 layout 序（jumper 在前，整体右对齐 `justify-content: flex-end`），页码激活色 `#027AFF`

---

### Task 5: 组件 .vue（核心）

> **Skill:** 无需 skill · 人工复核：表格/分页为 Element Plus 常规用法（非 echarts）

**Files:**
- Create: `...\level-detail-table\level-detail-table.vue`

要点（对照 `group-focus.vue` 的 el-table 用法）：

1. 模板：`__header`（title + `__filters` 按 `config.filterFields` v-for 出 `el-select`（200 宽，options 含「全部」，v-model 内部 `filterValues[field]`，`@change="onFilterChange"`)）→ `el-table`（`:data="list"` class 合并 `__table`，`:empty-text`，`v-loading` 不用——用 `is-refreshing` 透明度）按 `config.columns` v-for `el-table-column`（`:label="COLUMN_LABELS[c]`、`min-width`：period/dateRange 150 其余 100、`__cell` scoped slot：Δ 列用 `deltaStyle` 内联样式，其余默认文本）→ `el-pagination`（`v-model:current-page`、`:page-size="10"`、`:total`、`layout="jumper, total, prev, pager, next"`、`@current-change="loadData"`）。
2. Props：`permission`（`LEVEL_DETAIL_PAGE_CONFIGS[permission]`）、`periodType = 'week'`。
3. 状态：`options = ref<LevelDetailFilterOptions|null>`、`filterValues = reactive<Record<string,string>>({})`、`list`、`total`、`page = ref(1)`、`ready`、`refreshing`、`requestSeq`；`const PAGE_SIZE = 10`。
4. `onFilterChange`：`page.value = 1; loadData()`。
5. `loadData()`：#14 入参 = 当前筛选值（空串不传）+ periodType + route 三键 + page/pageSize；`requestSeq` 防竞态。
6. `onMounted`：拉 #13 → 各 filterValues 默认 `''`（全部）→ `loadData()` → `ready=true`。
7. `watch(() => props.periodType)`：重拉 #13 + 重置筛选与页码 + 重拉数据；`watch(route.query 三键)`：就绪后 `loadData()`。
8. 空态：el-table 内置（`COLUMN_LABELS`/`emptyText` 单点）。

**校验：** vue-tsc 0 error。

---

### Task 6: 占位资源 + 四页接入 + 两页卡片化

**Files:**
- Copy: `requirements/assets/ph-trend-module-header@2x.png`、`ph-trend-section@2x.png` → `...\src\assets\placeholders\`
- Modify: `grade-overview` / `plan-lessons` / `subject-overview-2` / `principal-cockpit-2` 的 `.vue` + `.scss`

每页：
1. scss 追加 `&__module`（白 r8 pad 30 20 gap 20）与 `&__placeholder-trend`（flex col gap 20，img 100%）（类名前缀按页面）。
2. 模板页尾追加 `__module`：两张占位 img（alt 注明待同事组件）+ `<level-detail-table :permission="PAGE_PERMISSION" />` + import。
3. **subject-overview-2**：根改透明 gap 10 pad 20；`__card`(top+statcards)、`__card`(group-focus)、`__module`（原根上白卡样式移除，`&__top` 保留）。
4. **principal-cockpit-2**：同上，`__card`(top+statcards)、`__module`。
5. grade/plan：既有结构不动，仅追加 `__module`（含占位+组件）。

**校验：** vue-tsc 0 error；四页占位/卡片化后无样式回归（`plan-lessons__placeholder`、等级分布占位 TODO 3 处不動）。

---

### Task 7: 组件 README（使用说明 + 对接说明）

**Files:**
- Create: `...\components\level-detail-table\README.md`

结构：用途（四页公共等级明细）/ 用法（`<level-detail-table :permission="..." period-type="week" />`，props 表、内部状态说明、`periodType` 联动通道）/ 列与筛选配置表（四页差异，引用 `LEVEL_DETAIL_PAGE_CONFIGS`）/ Δ 着色规则（按设计稿）/ 分页（10 条、重置规则）/ 数据契约 / **占位删除清单**（同事组件接入时：删 `__module` 内两 img + 两 png 资源 + 占位容器）/ 替换点 #13 #14 对接指引（入出参、口径：服务端分页、周期升序、Δ 字符串、合计后端）。

---

### Task 8: 验证（spec §6 验收 1~10）

1. `vue-tsc` 0 error；`pnpm build:data-board:develop` 成功。
2. `eslint --fix` + 复检、`stylelint --fix` + 复检、`ls-lint`。
3. 浏览器自检：四页页尾模块与占位、卡片化两页无回归、列/筛选按页正确、periodType 切月、分页 2 页与重置、Δ 四态着色、空态、竞态。
4. 与 Figma 渲染/用户截图对照（还原度自检素材）。

**⚠️ 全程不 commit；完成后 Step E：A 一致性 → B 还原度 → archive → validate。**

---

## Skill 路由汇总（router.mjs --annotate + 人工复核）

- CLI：`node E:\code\frontend-local\.agents\routing\router.mjs --annotate <本 plan>`（2026-10-19）→ `echarts` 0.70 命中
- 人工复核：**全部否决**——本模块**无任何图表**（Tech Stack 已注明「无 ECharts」，命中来自关键词误报）；Task 1~8 均为类型/mock/常量/SCSS/el-table/el-pagination/布局/文档，无需路由 skill
- `riskLevel`：低（无 high / 无需人工确认）
- Element Plus 表格先例：参照已交付 `group-focus.vue`（el-table 二定制：CSS 变量定义在与 `.el-table` 同元素的 class 上）
