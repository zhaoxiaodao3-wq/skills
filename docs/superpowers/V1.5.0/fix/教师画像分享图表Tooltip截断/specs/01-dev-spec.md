# 教师画像分享图表 Tooltip 截断 · 开发 Spec

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**已确认方案：** 仅修复「提问类型 → 布鲁姆分类」饼图 tooltip 被裁切；四何及其它图表不动。

---

## 1. 目标与非目标

### 目标

H5 教师画像分享页中，**布鲁姆分类**饼图 hover/触控 tooltip 完整展示长分类名（如「分析/评价/创造类」），不被图槽或 `MrEcharts overflow:hidden` 截断。

### 非目标

- 不改四何问题饼图 tooltip 行为  
- 不改 `CHART_TOOLTIP_BASE` 全局默认  
- 不改 `MrEcharts.vue`  
- 不改其它模块图表  

---

## 2. 根因（本点）

- `buildQuestionTypePieOption` 使用 `CHART_TOOLTIP_BASE`（`confine: true`）  
- 图槽约 80px + 容器 `overflow: hidden`  
- 布鲁姆标签较长，confine 后易裁切  

---

## 3. 实现要点

**代码落点：** `E:\code\H5`

| 文件 | 改动 |
|------|------|
| `chart-options/question-type-chart.ts` | `buildQuestionTypePieOption` 增加选项（如 `escapeContainer?: boolean`）；为 true 时覆盖：`confine: false`、`appendTo: 'body'`，`extraCssText` 含 z-index（如 9999）及可选 `white-space: normal` / `max-width: 70vw` |
| `components/QuestionTypePanel.vue` | 调用时：布鲁姆组开启 `escapeContainer`（可用 `group.title === '布鲁姆分类'` 或 adapter 增加 `tooltipEscapeContainer` 字段；推荐后者更稳，或传 `variant`） |

推荐识别方式（二选一，实现时选更清晰的）：

1. `QuestionTypeGroupVm` 增加 `id: 'sihe' | 'bloom'`，Panel 按 `id === 'bloom'` 传参  
2. 或 Panel 根据 `group.title === '布鲁姆分类'`（与 adapter 现有 title 一致）

非法/空态：tooltip 仍 `show: !showEmptyChart`，逻辑不变。

参考已有个案：`classroom-content-eval-chart.ts` 雷达 tooltip 的 `appendTo: 'body'`。

---

## 4. 验收标准

- [x] 布鲁姆分类饼图 hover/点按后，完整显示「记忆/理解类」「应用类」「分析/评价/创造类」及数量，无截断  
- [x] 四何问题饼图视觉与交互与改前一致  
- [x] 其它分享页图表无回归  

---

## 5. 样式说明

无 Figma 新稿；tooltip 样式沿用 `CHART_TOOLTIP_BASE` 边框/阴影，仅解除容器限制。
