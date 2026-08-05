# 驾驶舱教师画像跨屏等比适配 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md) · [requirements/02-方案确认.md](../requirements/02-方案确认.md)

## 1. 目标与范围

在 **任意 cmpnt 容器尺寸**下，使 `mr-teacher-portrait-1` 整卡视觉比例接近 **1920 宽体系设计稿**（像同一张图在缩放），且**不影响**其它驾驶舱组件。

| 项 | 值 |
|----|-----|
| 应用 | `apps-development-platform/apps/data-cockpit` |
| 目录 | `src/views/preview/mr-teacher-portrait-1/` |
| 方案 | **A**：组件内统一等比 `scale`（参考 `mr-teacher-learning-panel`） |
| 范围 | **整卡**：KPI + 中三栏 + 底热力 |
| 有数据稿 | [8048-37563](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8048-37563&m=dev)（约 1920×1643） |
| 热力节点 | [8048-38471](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8048-38471&m=dev) |

### 包含

- 壳层建立 **设计基准框** + `ResizeObserver` → 统一 `scale = min(cw/dw, ch/dh)`（可设下限，如 0.45）
- KPI / 面板标题 / 列表控件 / 标签条 / 热力（含 ECharts 字号、plot、色阶）关键尺寸与间距随 `scale`
- 热力：格子宽高同比；色阶贴底，不与矩阵/列标重叠
- 仅必要时增补 `teacher-portrait-1` 专用常量/特判；**禁止**改全局 `ratioX/ratioY`、其它 `mr-*`

### 不包含

- 其它图表组件适配改造
- model-2/3 新视觉
- 接口/mock 数据结构变更
- 整卡 `transform: scale` / `vw`/`vh` 主策略

## 2. 与现有画布适配的关系

| 层 | 职责 | 本期是否改 |
|----|------|------------|
| `restore-datav` 外框缩放 | 组件 width/height/left/top；画像高度特判 `1454 × (屏宽/1920)` | **不改**（除非验收发现框高与内部 scale 严重冲突，再单开确认） |
| `--cmpnt-scale-x/y` | 部分统计卡内部用 | **画像可不依赖**；画像用自身容器 scale |
| 画像内部 | 当前多为填满 + 局部热力 scale | **本期统一改造** |

## 3. 架构设计

```
mr-teacher-portrait-1.vue
  └─ usePortraitScale(rootRef)  // 或 composable / provide
        DESIGN = { w: 1860, h: 1454 }  // 与 TEACHER_PORTRAIT 内容量纲对齐
        scale = clamp(min(cw/Dw, ch/Dh), MIN, MAX)
        provide('tpScale', scale) / CSS var --tp-scale
  ├─ kpi-strip          // 字号·间距 × scale
  ├─ style-distribution // ECharts axis/label/barGap 相关 × scale
  ├─ teacher-list       // input/按钮/卡片 × scale（可渐进）
  ├─ tag-panel          // 条高/字号 × scale
  └─ subject-style-heatmap
        // 保留「设计格 × scale」；底栏：列标区 + gap + 色阶贴底
```

### 3.1 scale 约定

- **统一用 `min(sx, sy)`** 做字号与「必须保持比例」的尺寸（格子、图标）
- 允许少量轴向拉伸仅用于 flex 填空白（背景/轨道），**不得**单独拉格子宽高比
- `scale === 1` 时与现有 1920 样式还原数值一致（对齐 `ui-style/驾驶舱教师画像样式还原`）

### 3.2 热力底栏（已确认痛点）

```
[plot 等比]
[xLabelArea × scale]   // 科目文字
[legendGap × scale]
[legendArea × scale]   // visualMap，bottom 贴容器底
```

`visualMap.bottom` 取色阶带内贴底 inset，**禁止**再用「内容块居中原点」反推导致叠内容。

## 4. 样式对照（Figma）

> 基准取自既有样式还原 spec + 本次 MCP `8048:38471`（2026-08-03）。实现以 **scale=1 时等于下表** 为准。

### 4.1 壳层（`8048:37563`）

| Token | Figma（scale=1） | 适配方式 |
|-------|------------------|----------|
| 内容宽 | 1860 | DESIGN.w |
| KPI | 1860×90 | 高/字号 × scale |
| 中三栏 | 1860×685；列 356/1108/356；gap 20 | flex 比保留；gap × scale |
| 底栏 | 1860×639 | 区高随容器；内部 plot 等比 |
| 区块竖向 gap | 20 | × scale |
| 字色 | `#DBFAFF` | 不变 |
| 强调青 | `#28DCD1` | 不变 |

### 4.2 KPI（`8048:37626`）

| Token | Figma | 适配 |
|-------|-------|------|
| 卡 gap | 20 | × scale |
| 数值字 | Semibold 30 | × scale（下限 ≥14） |
| 标签字 | Regular 14 | × scale（下限 ≥10） |
| 图标 | 约 48×48 | × scale |

### 4.3 面板标题

| Token | Figma | 适配 |
|-------|-------|------|
| 标题条高 | 32 | × scale |
| 标题字 | Semibold 16 | × scale |

### 4.4 热力（`8048:38471`）

| Token | Figma | 适配 |
|-------|-------|------|
| 行高（格高） | 24 | 格高 = 24 × scale |
| 格宽 | (1820−138)/9 ≈ 186.89 | 格宽 = 186.89 × scale |
| 行标签 | Regular 12 `#DBFAFF`；spacer 138 | × scale |
| 列标签 | Regular 14 `#DBFAFF`；高 30 | × scale |
| 格内数字 | Medium 12 白 | × scale（下限 10） |
| 色阶条 | 180×18；两端文案 12；gap 8 | × scale |
| 色停 | 0.2 / 0.4 / 0.6 / 0.8 / `#28DCD1` | 不变 |
| 格子间隙 | **无**（无缝色块） | 禁止再加 border 当间隙 |

### 4.5 风格分布 / 列表 / 标签（摘要）

| 区域 | 关键 token（scale=1） | 适配 |
|------|----------------------|------|
| 风格分布行高逻辑 | 条宽比约 71% 带宽 | 保持比例；字号 12 × scale |
| 列表筛选 | 输入高 30、字 14 | × scale |
| 标签进度条 | 既有动画逻辑 | 高度/字号 × scale |

## 5. 非目标与风险

| 风险 | 缓解 |
|------|------|
| 与 `restore-datav` 画像高度特判双重缩放 | 内部 scale 以**实际 DOM 容器**为准；验收时在 1920 与缩放过容器各测一次 |
| 列表 EP 控件难精细缩放 | 优先壳与图表；控件可第二优先级 |
| 过小不可读 | `MIN_SCALE` + 字号下限 |

## 6. 验收标准

- [x] 仅改动教师画像相关文件（及经确认的画像专用常量）；其它 `mr-*` 行为不变
- [x] 容器接近设计框时，观感与现 1920 样式还原一致（`scale≈1`）
- [x] 容器放大/缩小：KPI/中栏/热力整体比例稳定，热力格子不单向拉扁
- [x] 热力色阶滑块不与矩阵或科目文字重叠
- [x] 无整卡 `transform: scale`、无 `vw`/`vh` 主适配
- [x] 空态 / 有数据场景均可预览，无回归空白

## 7. 实现落点（文件）

| 路径 | 动作 |
|------|------|
| `mr-teacher-portrait-1.vue` / `.scss` | 挂载 scale、provide / `--tp-scale` |
| `components/kpi-strip/*` | 关键尺寸随 scale |
| `components/shared/panel-chrome/*` | 标题条随 scale |
| `components/style-distribution-panel/*` | ECharts option × scale |
| `components/teacher-list-panel/*` | 渐进：筛选条/卡片关键尺寸 |
| `components/tag-panel/*` | 条/字号 × scale |
| `components/subject-style-heatmap/*` | 统一 DESIGN scale + 底栏贴底 |
| `src/constants/canvas-design.ts` | **默认不动**；仅当画像基准常量需对齐时最小改动 |
