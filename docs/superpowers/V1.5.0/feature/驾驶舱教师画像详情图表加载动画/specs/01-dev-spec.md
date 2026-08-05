# 驾驶舱教师画像详情图表加载动画 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.5.0  
**类型：** feature  
**实现仓：** `E:/code/dataView/apps-development-platform/apps/data-cockpit`  
**参考：** 校端 `useTeacherPortraitChart.ts` 的 `CHART_ANIMATION_BASE`；列表页「风格类型分布加载动画」

**P1 结论：** 方案 A（用户确认）

---

## 1. 目标

1. 详情页**有数据**时，图表入场具备统一生长动画（约 800ms / `cubicOut`）。  
2. **ECharts**：统一基线 + 空态关闭动画；resize / 尺寸 merge **不重播**入场。  
3. **非 ECharts**：补齐个人标签云进度条生长；语言可理解度 gauge 已有 rAF，对齐时长并尊重减动效。  
4. `prefers-reduced-motion: reduce` 时关闭生长动画（瞬时到位）。

## 2. 非目标

- 不做数字 count-up、错峰 delay（风格类型分布那套不强制套到全部详情图）  
- 不改等级汇总等纯数字卡片  
- 不改列表页风格类型分布（已 DELIVERED）  
- 不改空态骨架本身的视觉（空态仍 `animation: false`）

---

## 3. ECharts 约定

### 3.1 统一基线

新增（建议路径）：

`detail/composables/tp-chart-animation.ts`

```ts
export const TP_CHART_ANIMATION_BASE = {
  animation: true,
  animationDuration: 800,
  animationDurationUpdate: 400,
  animationEasing: 'cubicOut',
  animationEasingUpdate: 'cubicInOut',
} as const

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 有数据入场用基线；空态 / 减动效 → 关动画 */
export function resolveTpChartAnimation(enabled: boolean) {
  if (!enabled || prefersReducedMotion()) {
    return {
      animation: false,
      animationDuration: 0,
      animationDurationUpdate: 0,
    }
  }
  return { ...TP_CHART_ANIMATION_BASE }
}
```

各 `chart-options` / `*trend*-options` 在返回 option 时 **spread** `resolveTpChartAnimation(!isEmpty && !showEmptyChart)`（或等价），覆盖零散 `animation: true/false`。

### 3.2 覆盖面板

| 面板 | option 文件 | 备注 |
|------|-------------|------|
| 我的教案 | `my-lesson-plan/chart-options.ts` | 补 `!isEmpty` 门控（现状多依赖默认） |
| A/B 环图 | `classroom-content-eval/chart-options.ts` | donut；顶层 + series 一致 |
| A/B 雷达 | 同上 radar builder | 补顶层门控 |
| 评分趋势 | `score-trend-chart-options.ts` | 已有门控 → 换基线 |
| 教学风格弹性 | `teaching-style-flexibility/chart-options.ts` | 已有门控 → 换基线 |
| 教学风格趋势 | `trend-chart-options.ts` | 已有门控 → 换基线 |
| 结构清晰度 | `classroom-structure-clarity/chart-options.ts` | 已有门控 → 换基线 |
| 提问类型 | `question-type/chart-options.ts` | 顶层 + series |
| 语言行为 | `classroom-language-behavior/chart-options.ts` | 顶层 + series |

### 3.3 Panel 层

- 去掉各 panel 里「仅 reduce-motion 时 `option.animation = false`」的重复逻辑，**统一走 `resolveTpChartAnimation`**（若 panel 仍手动改 option，改为调用同一 helper）。  
- ResizeObserver 触发的 `chart.resize()` **不** `setOption` 全量重播；若某处 resize 路径会 `setOption`，须 `animation: false`（对齐风格类型分布规范）。

---

## 4. CSS / SVG

### 4.1 个人标签云（必补）

`personal-tag-cloud.vue`：

- `.tp-personal-tag-cloud__bar`：`transition: width 0.8s cubic-bezier(0.215, 0.61, 0.355, 1)`（≈ cubicOut）  
- 入场：首次渲染宽从 `0` → 目标百分比（`nextTick` / `requestAnimationFrame`）；`isDefaultEmpty` 或 `count<=0` 保持 `0` / 最小宽策略不变但**不播动画**（或瞬时）  
- `prefers-reduced-motion`：`transition: none`，直接目标宽

### 4.2 语言可理解度 gauge（已有）

`comprehensibility-gauge.vue`：

- 保持 800ms cubicOut rAF  
- `prefers-reduced-motion` 或 `score<=0`：取消 rAF，瞬时 `animatedFilled = target`

### 4.3 等级汇总等

不做动画。

---

## 5. 验收标准

- [ ] 有数据首次进入详情：柱/环/雷达/折线可见约 800ms 生长  
- [ ] DEV「空状态」：图表无生长动画（骨架静默）  
- [ ] 窗口缩放：不重复完整入场动画  
- [ ] 标签云条从左向右生长；空态无异常跳动  
- [ ] gauge 有数据时弧线生长；减动效系统设置下瞬时到位  
- [ ] 三主题切换无回归；tooltip / 交互正常  

## 6. 还原度自检

不适用：无 Figma / 动效增强，非静态稿还原。
