# 驾驶舱教师画像样式还原 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 在预览 1920 宽下，按 Figma `8048-37563` 分区对齐 `mr-teacher-portrait-1` 的字号/色/间距/装饰，不改业务契约与画布逻辑。

**Architecture:** 仅改 `data-cockpit` 下组合组件 Vue/SCSS 与热力图 ECharts option；开发前 `pnpm harness:check`；每区对照 Figma MCP token；交付前做一致性 + 还原度自检并写 archive。

**Tech Stack:** Vue 3 + SCSS + ECharts；Figma MCP；代码根 `E:\code\dataView\apps-development-platform\apps\data-cockpit\src\views\preview\mr-teacher-portrait-1\`

**Harness 文档根:** `e:\code\frontend\docs\superpowers\V1.5.0\ui-style\驾驶舱教师画像样式还原\`

---

## 文件地图

| 文件 | 职责 |
|------|------|
| `mr-teacher-portrait-1.scss` | 壳 gap / 栏宽比 / 区高 |
| `components/kpi-strip/kpi-strip.vue` | KPI 五卡样式；删除 1400 断点压字 |
| `components/shared/panel-chrome/panel-chrome.vue` | 面板标题条 |
| `components/style-distribution-panel/style-distribution-panel.vue` | 风格分布行 |
| `components/teacher-card/teacher-card.vue` | 教师卡 |
| `components/teacher-list-panel/teacher-list-panel.vue` | 列表筛选项/空态字 |
| `components/tag-panel/tag-panel.vue` + `tag-row.vue` | 标签条 |
| `components/subject-style-heatmap/subject-style-heatmap.vue` | 热力 ECharts + extra 字 |
| `components/shared/empty-state/empty-state.vue` | 空态字号色 |

---

### Task 0: Harness 门禁

**Files:** 无代码

- [ ] **Step 1:** 在 `e:\code\frontend` 运行：

```bash
pnpm harness:status -- --match "驾驶舱教师画像样式还原"
pnpm harness:check
```

Expected: 本模块 `READY_TO_DEV`；相关警告先处理。

- [ ] **Step 2:** 确认不引入 `--tp-scale`；代码改动仅限上表目录。

---

### Task 1: 壳层间距与栏宽

**Files:**
- Modify: `.../mr-teacher-portrait-1/mr-teacher-portrait-1.scss`

- [ ] **Step 1:** 核对 `.mr-teacher-portrait-1` `gap: 20px`；`.tp-middle` `gap: 20px`；`$tp-col-side-basis: calc(356 / 1860 * 100%)`；KPI `min-height: 90px`；底栏 `min-height` 合理。

- [ ] **Step 2:** 预览 1920 目视 KPI→中栏→底栏竖间距约 20。

---

### Task 2: KPI 五卡

**Files:**
- Modify: `.../components/kpi-strip/kpi-strip.vue`

对照节点 `8048:37626`（spec §3.2）。

- [ ] **Step 1:** 删除或禁用 `@media (max-width: 1400px)` 中缩小 `font-size` / `gap` / `padding` 的规则（保留 30/14/30px gap）。

- [ ] **Step 2:** 核对外框 `#FAAD14` / `6px` / `p:4`；内层渐变与 `gap:30` `px:30` `py:10`；五色数值：`#0BAAFF` / `#28DCD1`+`#DBFAFF` / `#A3DC20` / `#FF714B` / `#FAF616`。

- [ ] **Step 3:** 1920 预览对照 Figma KPI 截图，偏差记入待 archive 清单。

---

### Task 3: 面板标题壳

**Files:**
- Modify: `.../components/shared/panel-chrome/panel-chrome.vue`

对照 `8048:37662`。

- [ ] **Step 1:** 标题条高 32、字 16/600、左垫 40、角标 14×14；标题色按稿 `#FFF` 或注明沿用 `#DBFAFF`。

- [ ] **Step 2:** 三个面板 + 热力标题条目视一致。

---

### Task 4: 风格类型分布

**Files:**
- Modify: `.../components/style-distribution-panel/style-distribution-panel.vue`

对照 `8048:37670`。

- [ ] **Step 1:** 标签/人数 `12px` `#DBFAFF`；色条高 `20px`；行 gap ≈`8px`；轨底 `rgba(40,220,209,0.2)`；人数区 `pr:10`。

- [ ] **Step 2:** 预览对照左栏列表。

---

### Task 5: 教师列表与教师卡

**Files:**
- Modify: `teacher-list-panel.vue`、`teacher-card.vue`
- Figma: 中栏标题 `8048:37847` 及下方卡片（开发时 `get_design_context`）

- [ ] **Step 1:** MCP 拉取一张教师卡节点，记下姓名字号、标签字、头像尺寸、内边距。

- [ ] **Step 2:** 改 SCSS 对齐；筛选项/空态字不破坏层级。

- [ ] **Step 3:** 预览中栏对照。

---

### Task 6: 标签面板

**Files:**
- Modify: `tag-panel.vue`、`tag-row.vue`
- Figma: 右栏 `8048:38283` 下内容

- [ ] **Step 1:** MCP 拉一行标签 token（字 12、条高、头像串间距）。

- [ ] **Step 2:** 改样式并对齐预览。

---

### Task 7: 热力图

**Files:**
- Modify: `subject-style-heatmap.vue`
- Figma: `8048:38461` / `8048:38475`

- [ ] **Step 1:** MCP 核对行高≈24、行标签宽≈138、格内数字与轴字；「共 N 位」12/16 层级。

- [ ] **Step 2:** 调整 ECharts `axisLabel` / `label` / `visualMap.textStyle` / grid；保持连续色阶青绿系。

- [ ] **Step 3:** 预览底栏对照；像素级差异可标「可接受」。

---

### Task 8: 空态与收尾自检

**Files:**
- Modify: `empty-state.vue`（若需）
- Create: `archive/驾驶舱教师画像样式还原-delivered.md`

- [ ] **Step 1:** 空态 scenario 扫一眼壳层/文案。

- [ ] **Step 2:** 勾选 spec §5；写一致性自检 + 还原度自检（含 Figma 节点与偏差清单）。

- [ ] **Step 3:**

```bash
pnpm harness:check
pnpm harness:status -- --match "驾驶舱教师画像样式还原"
```

Expected: `DELIVERED`；无本模块 `ARCHIVE_MISSING_*` / `SPEC_MISSING_FIGMA_STYLE_TABLE`。

- [ ] **Step 4:** 用户未要求则不 commit。

---

## 执行方式（P3 · 待用户选择）

1. **Subagent-Driven（推荐）** — 按 Task 派生子代理，逐任务验收  
2. **Inline Execution** — 本对话按 plan 连续改代码  

选定前**不要**改 `src/`（含 data-cockpit 下本组件）。
