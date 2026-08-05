# 风格类型分布交互与 Tooltip · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标与范围

修复 `mr-teacher-portrait-1` 子组件 **风格类型分布**（`style-distribution-panel`）：

1. 恢复 **ECharts** 横向堆叠条实现，交互回丝滑动画/hover。
2. Hover Tooltip **允许超出面板显示**，不裁切、不因 tip 挤出列表滚动条。
3. Tooltip **挂载到 `body`** 时，出现位置须贴合指针/条形，**不得跑偏**（见 §3）。

**不改：** 排序/空态/占比截断一位等业务规则；其它子组件；公共 `panel-chrome` 的全局 `overflow` 策略（避免牵动全页）。

**工作目录：** `E:\code\dataView\apps-development-platform\apps\data-cockpit`

## 2. 实现方案（已确认 A）

| 项 | 约定 |
|----|------|
| 渲染 | ECharts `bar` 横向堆叠（男 `#A3DC20` / 女 `#FF714B`），类目轴为风格组合标签 |
| 数据 | 继续 `resolveStyleDistribution` + `toSortedRows`；`formatTooltipHtml` 供 formatter |
| 容器 | 图表宿主占满 panel body；去掉自定义 DOM tip 与行内 `overflow:auto` 列表（滚动由 ECharts `dataZoom` 或类目过多时的轴滚动择一；优先 **图表内部滚动 / 完整展示可滚动 grid**，勿用会裁 tip 的外层 `overflow:auto` 包 tip） |
| 空态 | 仍走 `empty-state`，无数据不 init 图 |

## 3. Tooltip 挂 body 且位置不跑偏（强制）

`panel-chrome` / body 存在 `overflow: hidden`，故 tip 须离开裁切链：

```ts
tooltip: {
  appendToBody: true, // 或 appendTo: 'body'
  confine: false,
  // 返回值必须是「图表局部坐标」。ECharts moveTo → transformLocalCoord 会换到 body。
  // 禁止再叠加 getBoundingClientRect（会双重偏移跑偏）。
  position(point, _params, _dom, _rect, size) {
    return resolveAppendToBodyTooltipPosition(
      point,
      size.contentSize,
      size.viewSize,
    )
  },
  formatter: … // 复用 formatTooltipHtml
}
```

**验收定位：**

- tip 相对当前 hover 条：右下偏移约 12px（贴图表边界时翻到左侧/上方）。
- 组件在画布不同位置、拖放改尺寸后，tip 仍跟鼠标/条对齐。
- 组件卸载 / 切空态时 tip DOM 从 `body` 清除（`dispose`）。

样式对齐既有 tip：`background rgba(13,30,58,0.75~0.92)`、边框 `var(--tp-card-border)`、字色男绿女橙合计蓝占比青。

## 4. 交互与视觉

- `animationDuration` ~300ms；数据变更 `setOption` 过渡。
- `ResizeObserver` → `chart.resize()`。
- 条右侧或轴标签旁展示「N人」：可用 label / 额外 series；观感接近稿面双色条 + 人数。
- 主题：颜色走现有 token；不改 model-2/3 边框体系。

## 5. 改动文件（预期）

| 操作 | 路径 |
|------|------|
| 改 | `…/style-distribution-panel/style-distribution-panel.vue` |
| 可改 | `…/style-distribution-panel/style-distribution-panel.util.ts`（若补定位 helper） |
| 不改 | `panel-chrome.vue`（除非实测仍裁切且 appendToBody 无效，再单开说明） |

## 6. 验收清单

- [ ] 风格分布为 ECharts，非自定义 DOM 条列表 tip
- [ ] Hover tip 可溢出面板外完整显示，列表不因 tip 出现异常滚动条
- [ ] tip 挂 `body`，且相对 hover 位置无跑偏（含拖放缩放后）
- [ ] 卸载后 body 无残留 tip
- [ ] 空态 / 有数据 / 排序与占比截断行为与改前一致

## 样式对照（Figma）

本 fix 以交互为主；视觉对齐既有有数据稿节点「风格类型分布」`8048:37661`（条色、tip 字段色见上）。不新增整页 UI 还原范围。
