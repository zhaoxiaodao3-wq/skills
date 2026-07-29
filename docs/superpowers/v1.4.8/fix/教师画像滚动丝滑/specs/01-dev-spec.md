# 教师画像滚动丝滑 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

「个人标签云滚轮穿透」在无溢出时用 JS 改 `scrollTop` 转发滚轮，导致整页滚动失去原生惯性、感觉卡顿。需改为原生滚动路径，并顺带保证 main 区域滚动体验。

## 2. 目标

- 标签云**无溢出**：滚轮以原生方式滚动 `.teacher-portrait-main`（丝滑）
- 标签云**有溢出**：原生滚动标签云内部，且 `overscroll-behavior: contain` 不连带整页
- 不使用 `wheel` + 手动 `scrollTop` 转发

## 3. 非目标

- 不引入 smooth scroll 动画库 / `scroll-behavior: smooth`（程序化滚动，对滚轮无益且可能发飘）
- 不重构整页布局
- 不改变上期业务规则（有条滚内部 / 无条滚整页）

## 4. 方案（已确认 A）

### 4.1 PersonalTagCloudView

- 移除 `onModulesWheel` 及 `passive: false` 监听
- CSS：
  - 默认 `.modules`：`overflow-y: hidden`（不形成可拦截滚轮的 scrollport）
  - `.modules.is-scrollable`：`overflow-y: auto; overscroll-behavior: contain`
- 保留 ResizeObserver + modules watch 更新 `isScrollable`

### 4.2 页面 main（轻量）

- 确认 `.teacher-portrait-main` 保持原生 `overflow-y: auto`
- 如需：补 `-webkit-overflow-scrolling: touch`（移动端）；**不加** JS 滚轮处理

## 5. 改动范围

| 路径 | 变更 |
|------|------|
| `.../personal-tag-cloud/PersonalTagCloudView.vue` | 去掉 wheel 转发；overflow 按 isScrollable 切换 |
| `.../teacher-portrait/index.vue` | 仅当 main 缺原生滚动友好声明时轻量补充 |

## 6. 验收标准

- [x] 无溢出时悬停标签云滚轮，整页滚动手感为浏览器原生（无逐帧感）
- [x] 有溢出时悬停标签云只滚内部，仍丝滑（原生 overflow）
- [x] 有/无滚动条规则与上期一致
- [x] 直接在 main 空白区滚轮仍正常丝滑
