# 视频弹窗拖拽缩放 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-07-30
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

为课堂内容分析报告的时间戳视频浮窗增加锁定宽高比的拖拽缩放；缩放逻辑抽成可测 composable，与拖移/自动 fit 闭环互斥，不破坏原有播放与 chrome 行为。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/composables/useResizablePanel.ts` |
| 增 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/composables/useResizablePanel.spec.ts` |
| 增 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportTimeVideoResizeHandles.vue` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportTimeVideoDialog.vue` |

## 验收结果

- [x] 弹窗四角/四边可拖拽改变大小，过程跟手无抖动感
- [x] 缩放全程宽高比与视频一致（误差 ≤ 1px 取整）
- [x] 顶部拖移、seek、播放/暂停、关闭、无视频 warning 行为与改前一致
- [x] 用户缩放后，浏览器窗口变化不再强制恢复「自动最大适配」，仅保证浮窗仍在视口内
- [x] 再次打开或换 src 后恢复自动 fit（不残留上次手动尺寸）
- [x] 手柄不遮挡关闭按钮；不阻断视频 controls 主操作区
- [x] `useResizablePanel` 有单测覆盖核心计算（vitest 5 passed）

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 本需求不涉及报告空态文案/数据 |
| 常量/mock/真数据 | N/A | 无业务维度常量或接口映射 |
| 多入口 | 通过 | TypeA/B 均挂同一 `ReportTimeVideoDialog`，只改 Dialog 两侧生效 |
| 失败/缺省 | 通过 | 无 metadata 时用 480/320 比例；无视频仍由 `useReportTimeVideo` warning |

## 还原度自检

不适用：无 Figma / 非 UI 样式对照需求（交互能力增强）。

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
