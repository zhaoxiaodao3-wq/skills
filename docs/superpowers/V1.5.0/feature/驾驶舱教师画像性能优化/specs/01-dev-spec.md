# 驾驶舱教师画像性能优化 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.5.0  
**类型：** feature  
**方案：** A（稳妥、不改视觉）  
**代码根：** `E:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/`

---

## 1. 背景与目标

组件已完成三主题与样式还原。审计发现主要瓶颈在：

1. ECharts `ResizeObserver` 无 debounce，且 resize 路径全量 `setOption(..., true)` + 动画  
2. 热力图 RO 与 `watch(layout.hostContentHeight)` 双通道重复渲染  
3. 教师卡 / 标签行头像 eager 加载  
4. 热力 mock 每次 rebuild；教师列表每次浅拷贝 48 项  
5. 主题切换时图表事件反复 off/on、全量 option 重建（可部分改善）

**目标：** 降低 resize / 首屏图片 / mock 重算开销；**不改变**布局、色值、毛玻璃、标题装饰与交互文案。

**非目标（本迭代不做）：**

- 替换 `backdrop-filter`  
- 虚拟滚动  
- `echarts/core` 按需引入  
- 热力图 IntersectionObserver 懒挂载  
- 改动画观感（KPI stagger、tag tween 时长可仅在「无障碍 / 非视觉」场景跳过，本迭代也不动 tag tween）

---

## 2. 范围与文件

| 改动 | 路径 |
|------|------|
| 必改 | `components/subject-style-heatmap/subject-style-heatmap.vue` |
| 必改 | `components/style-distribution-panel/style-distribution-panel.vue` |
| 必改 | `components/teacher-card/teacher-card.vue` |
| 必改 | `components/tag-panel/tag-row.vue` |
| 必改 | `mock/heatmap.mock.ts` |
| 必改 | `mock/teacher-list.mock.ts`（或 adapter 缓存层） |
| 可选微改 | 两 chart：主题色 `setOption` 改为 merge；去掉多余 `deep: true` |
| 不动 | `panel-chrome` 分层标题、KPI 图标资源、`tp-theme` 注入方式、4.5 行 CSS 视口 |

Harness 文档在 `frontend`；实现改动在 **data-cockpit**（非本仓 `src/`）。改代码前仍跑 `pnpm harness:check`。

---

## 3. 技术方案

### 3.1 ECharts resize（两图统一）

1. `ResizeObserver` 回调 **debounce 100–150ms**（共用小工具或组件内 `setTimeout` 即可）。  
2. **resize 热路径**仅调用 `chart.resize()`；**禁止**在 RO 回调里 `setOption(..., true)` 全量重建（除非宽高变化导致必须改 grid/cell 尺寸——见 3.2）。  
3. 数据 / scenario / theme 变化仍走既有 `renderChart` / `buildOption`，但：
   - 默认 `setOption(opt)` merge，或仅在结构变化时 `true`  
   - 可选：`animation: false` 仅挂在 resize 相关更新上；数据首次渲染可保留现有动画（不强制改视觉）  
4. `onUnmounted` 继续 dispose；debounce timer 一并 clear。

### 3.2 热力图双通道去重

现状：RO 写 `hostWidthRef` → `layout` 变 → `watch` 含 `hostContentHeight` → 再 `renderChart`，与 RO 内 setOption 叠加。

目标行为：

- **宽度变化导致 layout 变化**：只保留**一条**更新路径（推荐：RO debounce 后若 layout 关键变化则 `setOption` merge + `resize`；`watch` **不再**监听 `hostContentHeight`，仅监听 `scenario` / `themeId` / 数据）。  
- 避免同一次 resize 两次全量 rebuild。

### 3.3 头像懒加载（不改样式）

在以下 `<img>` 增加属性（不改 class / 尺寸）：

- `teacher-card.vue` 头像  
- `tag-row.vue` 头像  

```html
loading="lazy"
decoding="async"
```

### 3.4 Mock / 列表缓存

- `resolveHeatmap(scenario)`：按 `full` / `empty` 模块级缓存（与 style-distribution mock 一致）。  
- `resolveTeacherList`：避免无过滤时的无意义 `map` 浅拷贝；返回只读缓存引用，或过滤结果再拷贝。筛选逻辑行为不变。

### 3.5 图表 watch 微优化（可选但建议做）

- `style-distribution-panel`：去掉对 `rows` 的 `deep: true`（改监听 scenario / theme / 数据引用）。  
- 主题切换：尽量 patch 颜色相关字段，避免每次 `off`/`on` 重建监听（若改动面大可降级为「仅 resize 路径优化」）。

---

## 4. 验收标准

- [x] 两图在容器连续 resize 时无明显卡顿；Network/Performance 中无「每帧全量 setOption」级风暴  
- [x] 热力图单次宽度变化不会触发两次完整 `renderChart`  
- [x] 教师卡、标签行头像 DOM 带 `loading="lazy"` 与 `decoding="async"`  
- [x] `resolveHeatmap('full')` 连续调用返回同一缓存实例（empty 同理）  
- [x] 教师列表筛选 / 查询结果与优化前一致  
- [x] 三主题（model-1/2/3）视觉与交互无回归（截图或人工对照）  
- [x] `pnpm harness:check` 本模块无新增阻断性文档问题  

---

## 5. 风险与回滚

| 风险 | 缓解 |
|------|------|
| 热力宽度变化后 cell 尺寸不准 | layout 变化时仍 merge 更新 grid/label，并 `resize()` |
| merge setOption 残留旧 series | 数据场景切换时保留 `notMerge: true` 或显式 `replaceMerge` |
| lazy 导致快速滚动空白 | 浏览器原生行为；视口内仍会加载；不改布局 |

回滚：按文件还原上述 vue/mock 即可。

---

## 6. 一致性说明

- 空态 / 有数据路径不变，仅性能路径调整  
- mock 缓存不影响 adapter 将来接 API 时的接口形状  
- 多入口：仅 `mr-teacher-portrait` 单组件三主题  

---

## 7. 还原度自检

不适用：无 Figma / 非 UI 还原需求（方案 A 明确不改视觉）。
