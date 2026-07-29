# 本地菜单跳转卡顿 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-13
**版本：** v1.4.8
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

修复本地开发菜单跳转问题：Token 快路径 + AppMenu 竞态（第一轮）；扩展 dev server 依赖预扫描，避免首次访问懒加载路由触发 Vite full-reload（第二轮）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/utils/user-session.ts` |
| 改 | `src/App.vue` |
| 改 | `src/components/AppLayout/components/AppMenu.vue` |
| 改 | `src/components/AppLayout/AppLayout.vue` |
| 改 | `vite.config.ts`（仅 `command === 'serve'`） |

## 验收结果

- [x] 本地开发切 Tab，Token 未变时不整页刷新
- [x] Token 未变时 visibilitychange 快路径跳过 fetch
- [x] 菜单加载中不自动 replace，用户点击不被覆盖
- [x] 生产环境 Cookie / storage 同步逻辑不变
- [x] dev server 首次访问新路由不整页刷新；`pnpm build` 不受影响

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
