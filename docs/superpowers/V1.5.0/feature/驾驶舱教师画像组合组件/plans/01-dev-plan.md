# 驾驶舱教师画像组合组件 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.  
> **长稿还原：** 全程遵循 `figma-long-page`（分段 `get_design_context`，禁止整页一次还原；每段对照截图精修后再进入下一段）。

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 在 data-cockpit 落地 `mr-teacher-portrait-1`（identifier `teacher-portrait-1`）：KPI + 风格分布 + 教师列表 + 个人标签 + 学科热力，支持有数据/空态、整卡拖放适配、model-1 视觉与 model-2/3 主题预留。

**Architecture:** 壳组件只做布局与 `theme` 下发；五子块独立 Mock/空态；风格分布与热力用 ECharts；标签面板自定义 DOM+进度动画；头像回退移植 OSS 规则到本应用 `utils`。

**Tech Stack:** Vue 3 + TS + SCSS、Element Plus、ECharts、`@miray/utils` request、restore-datav glob 注册。

**工作目录：** `E:\code\dataView\apps-development-platform\apps\data-cockpit`

**Figma：** 有数据 `8048:37563` · 空态 `8048:36733` · fileKey `vmbLwcwclGPoT3fWJWv7de`

**分段节点（figma-long-page §2 拆帧）：**

| 段 | 节点 | 子组件 |
|----|------|--------|
| A | `8048:37626` | kpi-strip |
| B | `8048:37661` | style-distribution-panel |
| C | `8048:37846` | teacher-list-panel |
| D | `8048:38282` | tag-panel |
| E | `8048:38461` | subject-style-heatmap |
| 空态 | `8048:36733` | shared/empty-state |

---

### Task 0: 脚手架与常量/工具

**Files:**
- Create: `src/views/preview/mr-teacher-portrait-1/mr-teacher-portrait-1.vue`
- Create: `src/views/preview/mr-teacher-portrait-1/mr-teacher-portrait-1.scss`
- Create: `src/views/preview/mr-teacher-portrait-1/constants/styles.ts`
- Create: `src/views/preview/mr-teacher-portrait-1/constants/tags.ts`
- Create: `src/views/preview/mr-teacher-portrait-1/utils/sort-styles.ts`
- Create: `src/views/preview/mr-teacher-portrait-1/utils/portrait-url.ts`
- Create: `src/views/preview/mr-teacher-portrait-1/utils/format.ts`
- Create: `src/views/preview/mr-teacher-portrait-1/components/shared/empty-state/empty-state.vue`
- Create: `src/views/preview/mr-teacher-portrait-1/components/shared/panel-chrome/panel-chrome.vue`

- [ ] **Step 1:** 创建目录与壳骨架：根节点 `100%` flex 列布局（上 KPI / 中三栏 / 底热力）；`props: name?, theme?, baseYearId?, refreshTimestamp?`；`:class` 绑定 `model-1|2|3`。

```vue
<!-- mr-teacher-portrait-1.vue 骨架要点 -->
<div class="mr-teacher-portrait-1" :class="themeClass" style="width:100%;height:100%;">
  <div class="tp-kpi"><!-- slot later --></div>
  <div class="tp-middle">
    <div class="tp-col tp-col--left" /><div class="tp-col tp-col--center" /><div class="tp-col tp-col--right" />
  </div>
  <div class="tp-bottom" />
</div>
```

- [ ] **Step 2:** 写入 `constants/styles.ts`：5 种风格、等级序（严厉规训→…→温暖引导）、图 1 固定 20 组合序、`STYLE_PAIR_LABEL` 格式 `主导+辅助`。

- [ ] **Step 3:** 写入 `constants/tags.ts`：话语 9 / 情感 5 / 权力 5 枚举（同个人标签云，无学科）。

- [ ] **Step 4:** `utils/sort-styles.ts`：按人数↓→主导等级↓→辅助等级↓；`utils/format.ts`：`trunc1(n)` 一位小数截断；`utils/portrait-url.ts`：移植 OSS 查图逻辑（参考 frontend `teacher-style-portrait.ts`）。

- [ ] **Step 5:** `panel-chrome`（32px 标题条）+ `empty-state`（星球图本地化 +「暂无数据」）；空态资源从 Figma MCP 下载到 `src/assets/images/teacher-portrait-1/`。

- [ ] **Step 6:** 本地打开 `/restore-datav` 或 echarts-demo 占位验证壳能挂载（glob 自动识别 `mr-teacher-portrait-1`）。

---

### Task 1: 段 A · KPI 数据汇总

**Files:**
- Create: `.../components/kpi-strip/kpi-strip.vue` (+ scss)
- Create: `.../mock/kpi.mock.ts`

- [ ] **Step 1:** `figma-long-page`：对 `8048:37626` 调 `get_design_context`（`skillNames: figma-design-to-code`），对照截图，**禁止**整页还原。

- [ ] **Step 2:** 实现 5 卡：图标 SVG 优先；色值按 spec §3.1 / §7；`full` 显示数字，`empty` 显示 `--` / `-/20`。

- [ ] **Step 3:** Mock `full` / `empty`；壳接入 KPI；视觉精修对照 KPI 截图（边框 `#FAAD14`、圆角 6、字号 30/14）。

---

### Task 2: 段 B · 风格类型分布（ECharts）

**Files:**
- Create: `.../components/style-distribution-panel/style-distribution-panel.vue`
- Create: `.../components/style-distribution-panel/style-distribution-panel.util.ts`
- Create: `.../mock/style-distribution.mock.ts`

- [ ] **Step 1:** 分段拉取 `8048:37661` design context + screenshot。

- [ ] **Step 2:** ECharts 横向堆叠条（男绿/女橙）；category 为排序后 20 项；tooltip 含男/女/合计/`trunc1` 占比%；面板内滚。

- [ ] **Step 3:** Mock：`full`、`with-zeros`（20 行全 0 仍展示）、`empty`（走 empty-state）。

- [ ] **Step 4:** ResizeObserver → `chart.resize()`；hover tooltip 对照 Figma 浮层样式精修。

---

### Task 3: 段 C · 教师列表

**Files:**
- Create: `.../components/teacher-list-panel/teacher-list-panel.vue`
- Create: `.../components/teacher-card/teacher-card.vue`
- Create: `.../mock/teacher-list.mock.ts`
- Create: `.../mock/subjects.mock.ts`

- [ ] **Step 1:** 分段拉取 `8048:37846`。

- [ ] **Step 2:** 筛区：`el-input` / `el-select`×2 / 风格多选标签 + 重置/查询；查询**只**刷新本列表数据。

- [ ] **Step 3:** `teacher-card`：头像（接口优先 → portrait-url）、姓名、性别标、学科标、风格文案；hover `scale` + 亮边。

- [ ] **Step 4:** Mock 科目含「全部」「无」及若干学科；列表 `full` / 查无空态 / 接口 empty。

- [ ] **Step 5:** 精修筛选区与卡片网格（约 4 列）对照截图。

---

### Task 4: 段 D · 个人标签（自定义进度条）

**Files:**
- Create: `.../components/tag-panel/tag-panel.vue`
- Create: `.../components/tag-panel/tag-row.vue`
- Create: `.../components/tag-panel/use-progress-tween.ts`
- Create: `.../mock/tag-panel.mock.ts`

- [ ] **Step 1:** 分段拉取 `8048:38282`。

- [ ] **Step 2:** 三 Tab；每 Tab 固定枚举全量行；`count===0` **不隐藏**；排序数量↓→等级↑。

- [ ] **Step 3:** `use-progress-tween`：从当前 width% tween 到目标（400–600ms ease-out）；首次从 0；数字可跟随。

- [ ] **Step 4:** 每行最多 3 头像+姓名；头像 hover 高亮。

- [ ] **Step 5:** Mock `full`（含部分 0）、`empty`（整包无内容→空态）；验证两场景。

---

### Task 5: 段 E · 学科风格热力

**Files:**
- Create: `.../components/subject-style-heatmap/subject-style-heatmap.vue`
- Create: `.../mock/heatmap.mock.ts`

- [ ] **Step 1:** 分段拉取 `8048:38461`；交互对照  
  `C:\Users\YIL\Documents\WXWork\...\teacher-style-dashboard\assets\charts.js` 热力段（tooltip / emphasis / visualMap）。

- [ ] **Step 2:** ECharts `heatmap`；X=科目 Mock 序；Y=图 1 固定 20 序；label 显示数值。

- [ ] **Step 3:** Mock `full` / `empty`；resize；精修色阶与图例位置。

---

### Task 6: 壳组装、主题、画布尺寸、空态总检

**Files:**
- Modify: `mr-teacher-portrait-1.vue` 挂载全部子组件
- Modify: hangar `canvas-editor` 经脚本写入默认尺寸
- Run: `node apps/data-cockpit/scripts/sync-figma-canvas-size.mjs`（在 monorepo 根，按项目文档）

- [ ] **Step 1:** 壳按 flex 比例组装；中三栏定高内滚；各子块独立 mock 开关可临时用 query 或常量切换。

- [ ] **Step 2:** `theme` class 预留 model-2/3（可空样式）。

- [ ] **Step 3:** 写入 `COMPONENT_DEFAULT_SIZE_RATIO['teacher-portrait-1']`（内容区外框，KPI+中+底）。

- [ ] **Step 4:** **figma-long-page 精修关：** 对照有数据整页截图 + 空态 `8048:36733`；检查断 CSS、间距、滚动条、动画。

- [ ] **Step 5:** `pnpm harness:check`（frontend 文档侧）；data-cockpit 侧手动验证 restore-datav 拖放缩放。

---

### Task 7: Harness 交付归档（frontend 文档仓）

**Files:**
- Create: `docs/superpowers/V1.5.0/feature/驾驶舱教师画像组合组件/archive/驾驶舱教师画像组合组件-delivered.md`

- [ ] **Step 1:** 勾选 spec §6 验收项。

- [ ] **Step 2:** 写 archive（含一致性自检 + 还原度自检；Figma 节点与偏差清单）。

- [ ] **Step 3:** `pnpm harness:check` + `pnpm harness:status -- --match "驾驶舱教师画像"` → 期望 `DELIVERED`。

- [ ] **Step 4:** 用户未要求则不 commit。

---

## Spec 覆盖自检

| Spec 项 | Task |
|---------|------|
| 壳+identifier+适配 | 0, 6 |
| KPI | 1 |
| 风格分布排序/tooltip/ECharts | 2 |
| 教师列表筛选隔离/头像 | 3 |
| 标签非 ECharts/0不隐藏/空态/动画 | 4 |
| 热力+HTML 交互 | 5 |
| theme 预留、画布、精修 | 6 |
| 双 Figma 空/有数据 | 1–6 |
| archive | 7 |
