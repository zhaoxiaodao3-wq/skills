# H5教师画像页面标题 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**目标仓库：** `E:\code\H5`  
**日期：** 2026-07-21  
**方案：** 在 `main.ts` 的 `noAuth` 分支设置标题，**仅**教师画像路由

## 1. 目标

进入 `/teacher-profile` 时，`document.title`（网站标题）为「教师画像」。

## 2. 改动

**文件：** `E:\code\H5\src\main.ts`

在 `if (to.meta?.noAuth)` 内、`next()` 之前：

- 当 `to.name === 'TeacherProfile'`（或 path 为 `/teacher-profile`）时：  
  `document.title = (to.meta.title as string) || '教师画像'`
- **不**改其它 `noAuth` 页（如课后报告 A/B）的标题行为

## 3. 验收

- [x] 打开 `/teacher-profile`（含 query）时，浏览器/微信顶栏标题为「教师画像」
- [x] 其它 `noAuth` 页（如课后报告 A/B）标题行为与改前一致（本需求不改）
- [x] 未改 frontend `src/`

## 4. 非目标

- 不统一处理全部 noAuth 路由标题
- 不改路由 `meta.title` 文案（已是「教师画像」）
