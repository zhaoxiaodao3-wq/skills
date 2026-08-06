# 驾驶舱教师画像详情页 · 交付快照

**模块：** feature/驾驶舱教师画像详情页  
**实现仓：** data-cockpit `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail`  
**版本：** V1.5.0  
**日期：** 2026-08-06  
**Figma：** [教师画像-新开窗口 `8030:30782`](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8030-30782)

## 交付摘要

1. 详情长页落地：组合件卡片 `window.open` 打开 `/preview/teacher-portrait-detail`，页签标题「教师画像」，无左栏，S1～S6 区块按 Figma 大节完成 Vue + SCSS 还原并接入固定 `tenantUserId` 数据。
2. 三主题（model-1/2/3）边框与 accent 与组合件同源；支持 `prefers-reduced-motion` 降级。
3. 进入页面动画（spec §12，方案 B）：页头 0ms、S1 80ms、S2 160ms、S3 240ms、S4 320ms、S5 400ms、S6 480ms 错峰淡入上移；单区块 500ms `ease-out`，`animation-fill-mode: both`；仅动画 `opacity` / `transform: translateY`。
4. 代码提交：`E:/code/dataView/apps-development-platform` `d2023e5`。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 动画仅挂数据就绪分支（`raw || forceEmptyPreview`）内区块；空状态直显不浮现 |
| 常量/mock/真数据 | N/A | 本增量仅动效，未改数据映射 |
| 多入口 | 通过 | 组合件卡片与路由直开均走同一详情页动画 |
| 失败/缺省 | 通过 | loading / error 分支无动画；`prefers-reduced-motion: reduce` 下 `animation: none` |

## 还原度自检

- Figma 节点：`8030:30782`（整页），关键节 S1 `8030:30788`、S2 `8030:30896`、S3 `8030:31033`、S4 `8030:31222`、S5 `8030:31356`
- 对照方式：headless Chrome 本地截图 `C:\tmp\tp-enter-early.png`（600ms，动画进行中）与 `C:\tmp\tp-enter-late.png`（3000ms，动画完成），对比区块错峰顺序与终态版式
- 偏差清单：本增量仅新增 opacity/translateY 入场动画，未改变既有版式与三主题边框
- 结论：符合 spec §12.1 / §12.2，三主题动画表现一致

## 验收勾选

- [x] 数据就绪后页头 + S1～S6 依次错峰淡入上移，顺序与 delay 符合 12.1
- [x] `prefers-reduced-motion: reduce` 下无动画直接显示
- [x] loading / error 分支无浮现动画
- [x] 三主题（model-1/2/3）动画表现一致
