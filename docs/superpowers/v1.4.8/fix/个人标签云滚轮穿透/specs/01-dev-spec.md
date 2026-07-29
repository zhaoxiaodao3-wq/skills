# 个人标签云滚轮穿透 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

教师画像个人标签云模块区使用 `overflow-y: auto` + `overscroll-behavior: contain`，在内容未溢出（无滚动条）时仍拦截滚轮，导致父级 `.teacher-portrait-main` 无法滚动。

## 2. 目标

- **无滚动条（内容未溢出）**：鼠标在标签云上滚轮 → 滚动整页（右侧 main）
- **有滚动条（内容溢出）**：鼠标在标签云上滚轮 → 仅滚动标签云内部，且不链式带动整页（`overscroll-behavior: contain`）

## 3. 非目标

- 不改标签云布局断点、视觉样式（滚动条宽度/颜色可保持）
- 不改其它组件滚动行为
- 不做「有滚动条滚到顶/底后继续滚整页」的二次链式（有滚动条时保持 contain）

## 4. 方案（已确认 A）

在 `PersonalTagCloudView.vue`：

1. 为 `.personal-tag-cloud-view__modules` 建 `ref`
2. 用 `ResizeObserver` + `watch` 数据/模块变化，计算 `scrollHeight > clientHeight + 1` 得到 `isScrollable`
3. CSS：
   - 默认：`overflow-y: auto`；**不要**默认 `overscroll-behavior: contain`
   - `.is-scrollable`：`overscroll-behavior: contain`
4. 若部分浏览器在「不可滚动的 overflow:auto」上仍吞滚轮：对非 scrollable 状态在 `wheel` 上把 `deltaY` 转发给最近的 `.teacher-portrait-main`（仅作兜底）

## 5. 改动范围

| 路径 | 变更 |
|------|------|
| `src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudView.vue` | scrollable 检测 + class / 可选 wheel 兜底 |

## 6. 验收标准

- [x] 标签云无溢出时，悬停其上滚轮可滚动整页 main
- [x] 标签云有溢出时，悬停其上滚轮只滚标签云内部
- [x] 有溢出时滚到顶/底不因 contain 误带动整页（与现有 contain 意图一致）
- [x] 窗口缩放 / 数据变化后行为仍正确
