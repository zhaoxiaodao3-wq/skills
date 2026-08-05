# 风格类型分布加载动画 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.5.0  
**类型：** feature  
**代码：** `apps/data-cockpit/.../mr-teacher-portrait/components/style-distribution-panel/style-distribution-panel.vue`

---

## 1. 目标

为「风格类型分布」横向堆叠柱图增强**入场生长动画**（柱从 0 长到目标值），错峰出现；resize 不重复播放。

## 2. 非目标

- 不遮罩转圈 / 骨架屏  
- 不改色值、布局、tooltip、交互  
- 不改热力图及其他面板  

## 3. 行为规格

### 3.1 入场（全量 `setOption(..., true)` 时）

在 `buildOption` 中设置（或等价）：

| 字段 | 值 |
|------|-----|
| `animation` | `true` |
| `animationDuration` | `600` |
| `animationEasing` | `'cubicOut'` |
| `animationDelay` | `(idx) => idx * 28`（按类目行错峰；系列内可共用类目 index） |

现有 `animationDuration: 300` 替换为上述配置。堆叠「男/女」与 track、count-label 系列均开启动画（默认即可），保证色条与人数文案同步生长。

### 3.2 Resize（merge 路径）

`scheduleChartResize` 内 merge 时传入：

```ts
chart.setOption({
  ...buildOption(rows.value, el),
  animation: false,
  animationDurationUpdate: 0,
}, false)
```

或 `setOption(opt, { notMerge: false, lazyUpdate: false })` 且 option 内 `animation: false`，避免拖宽时反复入场。

### 3.3 触发时机

- 首次挂载、`scenario` / `themeId` 变化 → `renderChart` → 全量替换 → **播放**入场  
- 仅宽度变化 → merge + 无动画  

## 4. 验收

- [x] 进入页面（或切换有数据/空态）可见柱条自左向右生长，约 600ms，行间有轻微错峰  
- [x] 拖拽/缩放容器宽度时柱条不「重新生长」闪动  
- [x] 主题 model-1/2/3 颜色与布局无回归；tooltip / 轴标签 hover 仍正常  
- [x] 无新增遮罩 DOM  

## 5. 风险

| 风险 | 缓解 |
|------|------|
| 错峰过长总时长 | 20×28ms + 600ms ≈ 1.1s 可接受；若嫌慢再降 delay |
| merge 仍带动画 | 显式 `animation: false` |

## 6. 一致性 / 还原度

- 一致性：空态仍为 0 人数结构，入场动画同样适用  
- 还原度自检：不适用（无新 Figma；动效增强，非稿面静态还原）  
