# 入口根路径菜单未选中 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-15
**版本：** v1.4.8
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

修复访问 `/classroom-app/` 根路径时因 `skipAutoNavigate=loading` 竞态导致自动导航被跳过后未重试、侧栏无选中的问题：在 `useRouteMenu` 中于 skip 从 true→false 时补一次自动导航。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/composables/useRouteMenu.ts` |

## 验收结果

- [x] 打开 `/classroom-app/`（或本地等价 base 下的 `/`），加载完成后自动进入首个叶子菜单
- [x] 侧栏对应菜单项高亮
- [x] 直接进入已有业务 path 时，不被自动导航覆盖
- [x] 资源仍在 loading（skip=true）时不提前自动跳转

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
