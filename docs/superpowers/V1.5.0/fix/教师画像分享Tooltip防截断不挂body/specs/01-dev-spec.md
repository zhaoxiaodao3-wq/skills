# 教师画像分享 Tooltip 防截断不挂 body · 开发 Spec

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**已确认方案：** 方案 A — `confine: false` + **禁止** `appendTo: 'body'` + `MrEcharts` 可选 `overflow: visible` + 换行 max-width。

---

## 1. 目标与非目标

### 目标

- 长文 hover 完整可见（优先：布鲁姆饼图、教学内容评价雷达）  
- 不挂 body，避免跑页底 / 撑高页面  
- 仍用 ECharts 原生 tooltip  

### 非目标

- 不恢复 `appendTo: 'body'`  
- 不自研 Vue 浮层  
- 不默认改全站所有 `MrEcharts` 的 overflow（仅按需 prop）  

---

## 2. 实现要点（H5）

### 2.1 `MrEcharts.vue`

- 新增 prop，例如 `clipContent`（默认 `true`，保持现网）  
- `clipContent === false` 时容器 `overflow: visible`  
- 默认仍 `overflow: hidden`，不影响其它页面  

### 2.2 提问类型 · 布鲁姆

- `buildQuestionTypePieOption`：可选 `escapeClip?: boolean`（或仅布鲁姆调用时传入）  
  - `confine: false`  
  - **禁止** `appendTo`  
  - `extraCssText` 追加：`z-index: 20; white-space: normal; max-width: min(70vw, 240px);`（数值可微调）  
- `QuestionTypePanel`：布鲁姆 → `escapeClip` + `<MrEcharts :clip-content="false" />`；四何保持默认  

### 2.3 教学内容评价 · 雷达

- `buildClassroomContentEvalRadarOption`：同样 `confine: false`、无 appendTo、换行 max-width  
- 圆环 donut **不改**（短文）  
- 雷达用的 `MrEcharts`：`clip-content="false"`  
- 确认雷达槽 CSS `overflow: visible`（已有则保留）  

### 2.4 硬约束

改完后 `teacherProfile` 内搜索：`appendTo` 必须为 **0**。

---

## 3. 验收标准

- [x] 布鲁姆 / 内容评价雷达：长文完整、可换行  
- [x] hover 不导致页面被撑高、卡片不飞到文档底部（策略上禁止 appendTo body）  
- [x] 无 `appendTo: 'body'`  
- [x] 其它未改图与全站其它 MrEcharts 默认裁剪行为无回归  

---

## 4. 样式说明

无新 Figma；tooltip 视觉仍基于 `CHART_TOOLTIP_BASE`。
