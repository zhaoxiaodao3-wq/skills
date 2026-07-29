# 入口根路径菜单未选中 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

访问 `/classroom-app/`（应用内 `route.path === '/'`）时，侧栏依赖 `useRouteMenu` 在无匹配菜单时自动跳到首个叶子。近期 fix「本地菜单跳转卡顿」通过 `AppLayout` 传入 `:skip-auto-navigate="loading"`，在资源加载期间禁止自动导航，但 **`loading`/`skip` 变为 false 后未重试**，导致根路径常停在空首页且无菜单高亮。

## 2. 目标

- 入口根路径在菜单就绪且允许导航后，自动进入首个叶子菜单并高亮
- 保留 loading 期间不抢用户/并发导航的防护

## 3. 非目标

- 不改 Vite `BASE_URL` / nginx
- 不改路由表增加硬编码 `/` redirect
- 不回退「本地菜单跳转卡顿」中的 skip 机制本身
- 不收窄 `loading` 计算（本期用方案 A：skip 变 false 后补跳）

## 4. 方案（已确认 A）

在 `src/composables/useRouteMenu.ts`：

1. 抽取「在允许时执行自动导航」逻辑（与 `initMenuList` 末段一致：有 `defaultNavigatePath` 且路由不在菜单 → 跳默认；否则 `!active && !skip` → `handleMenuItemClick(首项)`）
2. 新增 `watch`：监听 `options?.skipAutoNavigate?.()`（或等价布尔），当 **从 true → false**，且菜单已有数据、当前仍无 active / 路由仍不在菜单内时，再执行一次自动导航
3. 已有业务路由（`active` 已有或 `isRouteInMenu()`）时**不**覆盖用户当前页

`AppLayout.vue` / `AppMenu.vue` 可保持现有 props 传参，无需改签名。

## 5. 改动范围

| 路径 | 变更 |
|------|------|
| `src/composables/useRouteMenu.ts` | skip 变 false 后补自动导航 |

## 6. 验收标准

- [x] 打开 `/classroom-app/`（或本地等价 base 下的 `/`），加载完成后自动进入首个叶子菜单
- [x] 侧栏对应菜单项高亮
- [x] 直接进入已有业务 path 时，不被自动导航覆盖
- [x] 资源仍在 loading（skip=true）时不提前自动跳转
