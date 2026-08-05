# 驾驶舱教师画像跨屏等比适配 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 仅在 `mr-teacher-portrait-1` 内建立统一等比 `scale`，使整卡（KPI + 中三栏 + 热力）在任意容器尺寸下视觉接近 1920 稿，且不影响其它驾驶舱组件。

**Architecture:** 壳层 `ResizeObserver` 算 `scale = clamp(min(cw/1860, ch/1454), …)`，经 `provide` + CSS `--tp-scale` 下发；子块字号/间距与 ECharts 关键尺寸乘 scale。热力继续「设计格 × scale」，色阶贴底预留底栏。禁止整卡 `transform:scale` / 改全局 `ratioX`。

**Tech Stack:** Vue 3 + SCSS、ECharts、既有 panel-chrome；参考 `mr-teacher-learning-panel` 的 `buildScaledMetrics`。

**工作目录：** `E:\code\dataView\apps-development-platform\apps\data-cockpit`

---

## 文件地图

| 文件 | 职责 |
|------|------|
| `src/views/preview/mr-teacher-portrait-1/composables/use-portrait-scale.ts` | 新建：测容器、算 scale、返回 CSS 变量辅助 |
| `mr-teacher-portrait-1.vue` / `.scss` | 挂载 rootRef、provide、设 `--tp-scale`；壳 gap 随 scale |
| `components/kpi-strip/kpi-strip.vue` | inject scale；数值/标签/图标尺寸 |
| `components/shared/panel-chrome/panel-chrome.vue` | 标题条高/字号 × scale |
| `components/style-distribution-panel/style-distribution-panel.vue` | axisLabel/fontSize 等 × scale |
| `components/teacher-list-panel/teacher-list-panel.vue` | 筛选条/按钮关键高度 × scale（渐进） |
| `components/tag-panel/tag-panel.vue` + `tag-row.vue` | 条高/字号 × scale |
| `components/subject-style-heatmap/subject-style-heatmap.vue` | 与壳 scale 对齐或自测容器；底栏贴底 |
| `src/constants/canvas-design.ts` | **默认不改** |

---

### Task 1: 壳层 scale composable + provide

**Files:**
- Create: `.../mr-teacher-portrait-1/composables/use-portrait-scale.ts`
- Modify: `.../mr-teacher-portrait-1/mr-teacher-portrait-1.vue`
- Modify: `.../mr-teacher-portrait-1/mr-teacher-portrait-1.scss`

- [ ] **Step 1:** 新建 composable

```ts
// DESIGN_W=1860, DESIGN_H=1454（与 TEACHER_PORTRAIT_CONTENT_HEIGHT 对齐）
// MIN_SCALE=0.45, MAX_SCALE=3
// scale = clamp(min(cw/Dw, ch/Dh), MIN, MAX)
// 返回 { scale, rootRef }，内部 ResizeObserver
```

- [ ] **Step 2:** 壳 `provide('tpScale', scale)`，根节点 `:style="{ '--tp-scale': scale }"`；`gap` 等改为 `calc(20px * var(--tp-scale, 1))`（或绑定 style）
- [ ] **Step 3:** 预览：容器接近设计尺寸时 `scale≈1`；缩小容器时 scale 下降

---

### Task 2: KPI + panel-chrome

**Files:**
- Modify: `components/kpi-strip/kpi-strip.vue`
- Modify: `components/shared/panel-chrome/panel-chrome.vue`

- [ ] **Step 1:** `inject('tpScale', ref(1))`；数值 30、标签 14、图标 48、卡 gap 20 × scale（字号设下限）
- [ ] **Step 2:** 标题条高 32、标题字 16 × scale
- [ ] **Step 3:** 肉眼对比 1920 与缩小容器

---

### Task 3: 风格分布 + 标签 + 列表（渐进）

**Files:**
- Modify: `style-distribution-panel.vue`
- Modify: `tag-panel.vue` / `tag-row.vue`
- Modify: `teacher-list-panel.vue`

- [ ] **Step 1:** 风格分布 ECharts `axisLabel.fontSize`、tooltip 等 × scale；`setOption` 随 scale watch
- [ ] **Step 2:** 标签条高度/字号/进度条轨道 × scale
- [ ] **Step 3:** 列表：input/按钮 height、字号 × scale；卡片可仅 padding/字号
- [ ] **Step 4:** 确认查询/重置 loading 行为未回归

---

### Task 4: 热力统一 scale + 底栏贴底

**Files:**
- Modify: `components/subject-style-heatmap/subject-style-heatmap.vue`

- [ ] **Step 1:** 优先 `inject('tpScale')`；无则保留自测容器作 fallback
- [ ] **Step 2:** 设计格 186.89×24 × scale；无缝无 border 间隙；色停不变
- [ ] **Step 3:** 底栏：`xLabelArea + legendGap + legendArea` 计入 scale 预算；`visualMap.bottom` 贴底 inset；plot 顶部对齐，禁止居中反推 bottom 叠内容
- [ ] **Step 4:** 拖放容器：格子同比；滑块不压科目字/矩阵

---

### Task 5: 验收与 Harness 交付

**Files:**
- Modify: 无（或仅文档）
- Create: `docs/superpowers/V1.5.0/ui-style/驾驶舱教师画像跨屏等比适配/archive/驾驶舱教师画像跨屏等比适配-delivered.md`

- [ ] **Step 1:** `pnpm harness:check`（在 frontend 仓库）
- [ ] **Step 2:** 验收清单对照 spec §6 勾选
- [ ] **Step 3:** A 一致性自检 + B 还原度自检写入 archive
- [ ] **Step 4:** 再跑 `harness:check` / `harness:status` 至 DELIVERED
- [ ] **Step 5:** **不自动 commit**（除非用户要求）

---

## 风险备忘

- 勿改 `restore-datav` 全局 rem / `ratioX`
- 勿给整卡加 `transform: scale`
- `.tp-bottom` flex 比例若与内部 scale 冲突，以内部 plot 等比 + 底栏预留为准，壳 flex 可微调但不扩大 scope 到其它组件
