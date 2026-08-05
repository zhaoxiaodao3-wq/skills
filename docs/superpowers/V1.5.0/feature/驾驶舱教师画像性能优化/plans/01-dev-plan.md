# 驾驶舱教师画像性能优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改视觉的前提下，降低教师画像组合件 ECharts resize、头像加载与 mock 重算开销。

**Architecture:** 统一两图 ResizeObserver debounce + resize 热路径只 `chart.resize()`；热力图去掉 RO/watch 双通道；头像加原生 lazy；heatmap/teacher-list mock 做模块级缓存。

**Tech Stack:** Vue 3 + ECharts 5 + SCSS；代码在 data-cockpit `mr-teacher-portrait`。

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 方案 A：不改布局、色值、`backdrop-filter`、标题装饰、交互文案
- 不做虚拟列表 / echarts 按需拆包 / 热力懒挂载
- 实现路径：`E:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/`
- 改代码前：`pnpm harness:status -- --match "驾驶舱教师画像性能优化"` + `pnpm harness:check`（frontend 仓）

---

## File Map

| 文件 | 职责 |
|------|------|
| `mock/heatmap.mock.ts` | scenario 级缓存 |
| `mock/teacher-list.mock.ts` | 无过滤时返回缓存引用 |
| `components/teacher-card/teacher-card.vue` | 头像 lazy |
| `components/tag-panel/tag-row.vue` | 头像 lazy |
| `components/style-distribution-panel/style-distribution-panel.vue` | RO debounce + 仅 resize；去 deep watch |
| `components/subject-style-heatmap/subject-style-heatmap.vue` | RO debounce + 双通道去重 |
| （可选）同目录小 util | `debounce` 若两组件重复则抽 `utils/debounce.ts` |

---

### Task 1：Mock 缓存

**Files:**
- Modify: `mock/heatmap.mock.ts`
- Modify: `mock/teacher-list.mock.ts`

- [ ] Step 1: `heatmap.mock.ts` 增加模块级 `cacheFull` / `cacheEmpty`，`resolveHeatmap` 按 scenario 返回缓存（首次 build）
- [ ] Step 2: `resolveTeacherList('full')` 返回稳定只读列表（避免每次 `map` 浅拷贝）；`empty` 仍返回 `[]`；若现有筛选依赖可变拷贝，仅在「将要 mutate」前拷贝
- [ ] Step 3: 人工确认：开发态切换「有数据/空状态」热力与列表仍正确

---

### Task 2：头像 lazy（不改样式）

**Files:**
- Modify: `components/teacher-card/teacher-card.vue`
- Modify: `components/tag-panel/tag-row.vue`

- [ ] Step 1: 两处头像 `<img>` 增加 `loading="lazy"` `decoding="async"`
- [ ] Step 2: 确认 class / 尺寸 / 回退头像逻辑不变

---

### Task 3：风格分布图 ECharts resize

**Files:**
- Modify: `components/style-distribution-panel/style-distribution-panel.vue`

- [ ] Step 1: 抽出 debounce（约 120ms）；`disposeChart` / `onUnmounted` 清理 timer
- [ ] Step 2: `ResizeObserver` 回调改为 debounce 后仅 `chart.resize()`（**不要** `setOption(..., true)`）
- [ ] Step 3: `watch` 去掉 `deep: true`；依赖改为 `scenario` + `themeId` + 稳定数据信号（如 `rows` 长度或 scenario 驱动的 resolve）
- [ ] Step 4: 数据/主题变化仍走 `renderChart`；scenario 切换可保留 `setOption(opt, true)`，同主题刷新优先 merge
- [ ] Step 5: 本地拖拽预览容器宽度，确认柱图不错位、无卡顿

---

### Task 4：热力图 ECharts resize + 双通道去重

**Files:**
- Modify: `components/subject-style-heatmap/subject-style-heatmap.vue`

- [ ] Step 1: 同样 debounce RO；`onUnmounted` 清理
- [ ] Step 2: RO 热路径：更新 `hostWidthRef` 后，若仅宽度变化 → `setOption(buildOption, false)` merge（因 cell 尺寸依赖宽）+ `resize()`；**禁止**未 debounce 的连续全量重建
- [ ] Step 3: `watch` **移除** `layout.value.hostContentHeight`；仅 watch `[props.scenario, themeId.value]`（及必要数据），触发 `renderChart`
- [ ] Step 4: 确认 `renderChart` 只在数据/主题变时调用；resize 不再二次 `renderChart`
- [ ] Step 5: 本地缩放宽度，核对热力格子与色阶不错位、不闪两次

---

### Task 5：验收与 Harness 交付

- [ ] Step 1: 三主题快速目视（KPI / 列表 / 两图 / 标签）无回归
- [ ] Step 2: 勾选 `specs/01-dev-spec.md` §4 验收项
- [ ] Step 3: 写 `archive/驾驶舱教师画像性能优化-delivered.md`（含一致性自检；还原度自检写「不适用」）
- [ ] Step 4: `pnpm harness:check` + `pnpm harness:status -- --match "驾驶舱教师画像性能优化"` 确认 `DELIVERED`
- [ ] Step 5: **用户未要求则不 commit**

---

## 执行方式（待用户 P3 选择）

1. **Subagent-Driven（推荐）**：按 Task 派生子代理，每 Task 验收后继续  
2. **Inline Execution**：本对话按 Task 顺序直接改代码  
