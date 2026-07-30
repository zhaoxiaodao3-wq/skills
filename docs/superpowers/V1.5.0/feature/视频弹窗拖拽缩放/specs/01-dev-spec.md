# 视频弹窗拖拽缩放 · 开发 Spec

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**已确认方案：** 方案 A — 自研 `useResizablePanel` + 角/边手柄，**始终锁定视频宽高比**。

---

## 1. 目标与非目标

### 目标

- 课堂内容分析报告页的时间戳视频浮窗（`ReportTimeVideoDialog`）支持用户拖拽缩放尺寸。
- 缩放过程丝滑：pointer 跟手、无布局抖动、松手后尺寸稳定。
- 缩放时**始终保持视频元数据宽高比**（`videoWidth / videoHeight`；无元数据时用默认 480:320）。
- 不影响既有能力：顶部拖移、seek 播放、chrome 显隐、关闭、无视频提示、Teleport 层级。
- 缩放逻辑组件化：可单测、可复用，与弹窗业务编排解耦。

### 非目标

- 不引入 interact.js / vue3-draggable-resizable 等新依赖。
- 不做自由比例拉伸（禁止画面被 `object-fit: fill` 拉变形）。
- 不改报告页业务数据流 / `useReportTimeVideo` 的 open/close/seek API（除非为透传尺寸状态所必需，本需求默认不改）。
- 不做双指 pinch（本期仅鼠标/触控笔 pointer；触控可走同一套 pointer 事件，不单独做手势识别）。

---

## 2. 现状与冲突点

| 能力 | 现状 | 与缩放关系 |
|------|------|------------|
| 尺寸 | `panelSize` + `fitPanelToVideo()` 按视口自适应 | 用户缩放后不得被自动 fit 覆盖 |
| 拖移 | 顶部 `__drag` 条 mousedown | 与缩放手柄热区隔离 |
| 窗口 resize | 直接再调 `fitPanelToVideo` | 用户已手动缩放时改为 **仅 clamp 进视口** |
| 视频 | `object-fit: fill` + 容器等比例 | 锁比例后 fill 与容器一致，不变形 |

---

## 3. 架构

```
ReportTimeVideoDialog.vue          # 编排：位置 / 尺寸 / 拖移 / 缩放 / chrome / 视频
  ├─ useResizablePanel.ts          # 纯逻辑：edge 缩放、比例、min/max、锚点修正
  └─ ReportTimeVideoResizeHandles.vue  # 薄 UI：角/边手柄 + cursor（可选独立文件）
```

- **A/B 报告视图**（`ReportTypeAView` / `ReportTypeBView`）继续只挂 `ReportTimeVideoDialog`，无需改 props。
- `useReportTimeVideo` 职责不变。

### 3.1 `useResizablePanel` 契约（建议）

```ts
type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

type UseResizablePanelOptions = {
  position: Ref<{ x: number; y: number }>
  size: Ref<{ width: number; height: number }>
  getAspectRatio: () => number  // > 0
  minWidth?: number             // 默认 320
  minHeight?: number            // 由 minWidth / ratio 推导亦可
  maxMargin?: number            // 相对视口边距，默认 16
}

// 返回：
// startResize(edge, pointerEvent) — 绑定 pointermove/up（建议 pointerId capture）
// stopResize() / dispose()
// isResizing: Ref<boolean>
```

行为要点：

1. **锁比例**：以主导轴（水平边看 Δwidth，垂直边看 Δheight，角点取对视觉更跟手的一轴）换算另一维。
2. **锚点**：拖左边/上边/左上/右上等时，同步修正 `position`，使对边/对角固定。
3. **边界**：`width/height` ∈ [min, 视口 − margin]；完成后对 `position` 做与现有一致的 `clamp`。
4. **与拖移互斥**：`isResizing` 为 true 时忽略拖移；拖移激活时不启动缩放。

### 3.2 手柄 UI

- 露出 **四角 + 四边中点**（8 向），视觉尽量克制：默认近透明，hover/active 略亮；不遮挡底部原生 controls 中心区（底边手柄可收窄高度，如 6–8px）。
- 右下角可略强调（常见主拖点），但不做花哨徽章。
- `pointer-events` 仅手柄可点；中间视频与顶部拖条行为不变。
- chrome 隐藏时：手柄可同步降低存在感（opacity），但仍可拖（或与关闭钮同策略：隐藏时 pointer-events none——**推荐手柄在 chrome 隐藏时仍可拖**，避免「找不到缩放」；关闭钮逻辑保持现有）。

### 3.3 `userHasResized` 闭环

| 事件 | 行为 |
|------|------|
| 打开弹窗 / 换 src | `userHasResized = false`，恢复 `DEFAULT_SIZE` → metadata 后 `fitPanelToVideo` |
| 用户完成一次缩放 | `userHasResized = true` |
| `loadedmetadata` | 若未手动缩放 → fit；若已手动 → **不改尺寸**，仅保证比例一致（可选：按新 ratio 校正高度） |
| `window.resize` | 未手动 → `fitPanelToVideo`；已手动 → `clampSizeToViewport` + `clampPosition` |
| 关闭 | 清理 pointer 监听；重置标志在下次打开时处理即可 |

---

## 4. 交互与体验

- **跟手**：`requestAnimationFrame` 合并或直接同步更新均可；禁止对 width/height 加 CSS transition（避免拖尾）。
- **光标**：各 edge 对应 `n-resize` / `se-resize` 等。
- **选中**：缩放中 `user-select: none`；`preventDefault` 避免拖出选区。
- **最小尺寸**：建议 `minWidth = 320`，`minHeight = minWidth / ratio`（且高度不低于约 180 时以更严的一维为准）。
- **最大尺寸**：不超过 `window.innerWidth/Height − 2 * margin`（margin ≈ 16）。

---

## 5. 文件改动清单

| 路径 | 动作 |
|------|------|
| `.../composables/useResizablePanel.ts` | 新增 |
| `.../composables/useResizablePanel.spec.ts` | 新增（比例、min、左边拖位置修正） |
| `.../components/ReportTimeVideoResizeHandles.vue` | 新增（薄 UI） |
| `.../components/ReportTimeVideoDialog.vue` | 接入缩放 + `userHasResized` 策略 |

不改：`useReportTimeVideo.ts`、TypeA/B View（除非发现必须透传，本 spec 不预期）。

---

## 6. 验收标准

- [x] 弹窗四角/四边可拖拽改变大小，过程跟手无抖动感
- [x] 缩放全程宽高比与视频一致（误差 ≤ 1px 取整）
- [x] 顶部拖移、seek、播放/暂停、关闭、无视频 warning 行为与改前一致
- [x] 用户缩放后，浏览器窗口变化不再强制恢复「自动最大适配」，仅保证浮窗仍在视口内
- [x] 再次打开或换 src 后恢复自动 fit（不残留上次手动尺寸，除非产品另有要求——**本需求不持久化**）
- [x] 手柄不遮挡关闭按钮；不阻断视频 controls 主操作区
- [x] `useResizablePanel` 有单测覆盖核心计算

---

## 7. 风险与对策

| 风险 | 对策 |
|------|------|
| 底边手柄挡 controls | 底边命中区变薄；角点为主 |
| 缩放与拖移抢事件 | 互斥标志 + 手柄不落在 `__drag` 条上 |
| 窗口 resize 覆盖用户尺寸 | `userHasResized` 分支 |
| fill 变形 | 强制锁比例 |

---

## 8. 样式说明

本需求为交互能力增强，**无 Figma 链接**；手柄样式对齐现有浮窗黑底半透明控件语言（与关闭钮一致），不做新视觉体系。
