# 教师画像分享 Tooltip 定位异常 · 开发 Spec

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**已确认方案：** 方案 A — 去掉 `appendTo: 'body'`，恢复 ECharts `confine: true`；全量排查后仅修有问题的 2 处；局部 overflow 兼顾可读。

---

## 1. 目标与非目标

### 目标

- hover 卡片不再飞到页底、不撑高页面、不无故大幅越出视口  
- 继续使用 **ECharts 原生 tooltip**（仅改配置，不做自研浮层）  
- 全量核对教师画像分享页所有图表，消除同类 `appendTo: 'body'`  

### 非目标

- 不改 `MrEcharts` 全局 overflow（避免波及其它页面）  
- 不做自定义 Vue tooltip 组件  

---

## 2. 全量排查结论

| 文件 | 结论 |
|------|------|
| `CHART_TOOLTIP_BASE` | `confine: true`，OK |
| speaking / clarity / style-trend / style-radar / lesson-plan / content-eval 圆环 | 继承 BASE，OK |
| score-trend | `confine: true`，OK |
| **question-type-chart** + Panel `escapeContainer` | **须改**：去掉 body / confine:false |
| **classroom-content-eval-chart 雷达** | **须改**：去掉 body / confine:false |

---

## 3. 实现要点（H5）

### 3.1 布鲁姆 / 提问类型

- `question-type-chart.ts`：删除 `escapeContainer` 分支中的 `appendTo: 'body'`、`confine: false`；可删除整个 `escapeContainer` 参数与 Panel 传参，恢复统一 BASE  
- `QuestionTypePanel.vue`：去掉 `{ escapeContainer: ... }`  
- 图槽已有 `overflow: visible`（`.qt-panel__chart-slot`），保留；tooltip 用 `confine: true` 限制在图容器附近  

可选：BASE 或布鲁姆 tooltip 增加 `white-space: normal`（不挂 body），减少长标签挤出感。

### 3.2 教学内容评价雷达

- `classroom-content-eval-chart.ts` 的 `buildClassroomContentEvalRadarOption`：去掉 `confine: false`、`appendTo: 'body'` 及注释中「挂到 body」说明  
- 恢复仅 `...CHART_TOOLTIP_BASE`（或显式 `confine: true`）  
- 若雷达槽仍裁切：仅对该雷达外层容器设 `overflow: visible`（查 `ClassroomContentEvalPanel` 雷达槽样式），**不**再挂 body  

### 3.3 验收前再扫一遍

改完后对 `teacherProfile` 再搜 `appendTo` / `confine: false`，期望 **0 处**。

---

## 4. 验收标准

- [x] `teacherProfile` 下无 `appendTo: 'body'`、无主动 `confine: false`  
- [x] 布鲁姆饼图、内容评价雷达 hover：卡片跟手，不跑页底、不撑高页面  
- [x] 其它图表（四何、清晰度、趋势、教案、语言行为、风格雷达等）回归正常  
- [x] 仍为 ECharts 原生 tooltip  

---

## 5. 样式说明

无新 Figma；沿用 `CHART_TOOLTIP_BASE` 视觉。
