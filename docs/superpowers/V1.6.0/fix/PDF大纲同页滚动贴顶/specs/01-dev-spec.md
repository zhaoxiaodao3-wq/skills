# PDF大纲同页滚动贴顶 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

PDF 预览右侧大纲来自 `pdf.js getOutline()`。当前 `jumpOutlinePageNumber` 仅 `getPageIndex(dest)` → `jumpPage(pageNumber)`，忽略页内位置；同页再点子节无滚动。

## 2. 目标

1. 同页点击子节（如已看到 1.1 时再点 1.2）仍滚动，使该标题靠近视口顶部。
2. 跨页点击同样将目标标题滚到视口顶部（允许约 8～16px padding）。
3. 不改变大纲树数据来源（仍用 PDF outline）。

## 3. 方案

改 `AppViewerAnalysis.vue`：

| 步骤 | 行为 |
|------|------|
| 解析 dest | 得到 `pageIndex`；若 dest 含 XYZ/Fit 等，尽量取页内 top（PDF 坐标 → 视口/渲染坐标系） |
| 回退定位 | dest 无可用 Y 时：在 `pdfPages[page].lines` 中按 `outlineItem.title` 精确/包含匹配，取该行 `y`（注意渲染 scale=2 与 `viewportScale` 换算） |
| 滚动 | 计算 `scrollTop`，使目标行/坐标落在 `pdfViewer` 视口顶部附近；**即使 pageNumber 未变也执行 scrollTo** |
| 缩放兼容 | 滚动换算须兼容 `ScaleContainer` 的 `transform: scale`（优先用 `getBoundingClientRect` 相对 viewer，或统一用已存 width/height/scale 公式） |

`jumpMenuItemPageNumber`：若存在 `page` 却只 `return page` 未跳转的缺陷，一并改为真正 `jumpPage` / 带 Y 滚动（同组件一致性）。

## 4. 非目标

- 不改 muban / `src/report` 模板
- 不改为传自定义 `:menu` 替代 outline（除非 dest+文本均失败再议）
- 不改 PDF 生成服务

## 5. 验收

- [x] 实现同页仍滚动 + 目标贴顶（`jumpToPageOffset` + dest Y / 标题 Y）
- [x] dest 解析失败有标题回退，避免静默无反应
- [x] menu 跳转与 outline 一致真正滚动
- [ ] 本地预览：点「一、课堂整体总结」后再点同屏「1.2 亮点展示」确认贴顶
