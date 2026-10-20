# 本地开发菜单兜底 · 开发规格（标准档）

**Requirement:** [requirements/02-dev-menu-fallback.md](../requirements/02-dev-menu-fallback.md)
**前置交付:** [archive/01-概览路由与数据权限-delivered.md](../archive/01-概览路由与数据权限-delivered.md)
**类型：** feature（标准档）
**状态：** 待 P2 确认

## 现状与问题

- 菜单与路由放行只认后端 `getUserAppResourceApi`（myAppResource）返回的资源；后端尚未为 data-board 配置资源 → 菜单为空，登录态下访问 `/grade-overview`、`/plan-lessons` 被现有守卫重定向回 `/`，本地看不到任何页面。
- 团队决策「菜单只接受后端加载，删掉前端兜底」（f6b119a）→ 生产构建不允许有菜单兜底。

## 方案（P1 已确认：仅本地开发菜单兜底）

`import.meta.env.DEV`（仅 `pnpm dev` 本地开发）**且**后端返回资源为空数组时，`permission` store 的 `resources` 使用本地开发兜底资源；其余情况（生产构建、后端已返回资源）行为不变。

> **`import.meta.env.DEV` 语义（用户已确认）：** 判断的是「dev server 还是构建」，与 `--mode` 无关。`pnpm run dev:test`（`vite --mode test`，用户当前本地跑法）下 `DEV=true`，兜底生效；所有 `vite build`（含 `build:test`）下 `DEV=false`，兜底不参与。即：任何本地预览模式（develop/test/master）均兜底，任何构建产物均不兜底。

## 改动

**新增 `src/constants/dev-menu-fallback.ts`：**

- 导出 `DEV_FALLBACK_RESOURCES: ApplicationResource[]`，两条伪资源：`/grade-overview`（年级长概览）、`/plan-lessons`（备课组长概览），同组 `label: '数据看板'`，`buttonList` 为空（不发放任何按钮权限）
- 头部注释带 `TODO(1.7.1-接口替换): [#3]` 标记：后端配置菜单资源后删除本文件与 store 引用

**修改 `src/stores/modules/permission.ts` 的 `loadResources()`：**

```ts
resources.value = parseApplicationResources(result.data)
// TODO(1.7.1-接口替换): [#3] 仅本地开发且后端资源为空时兜底菜单；后端配置后自动让位。
if (import.meta.env.DEV && resources.value.length === 0) {
  resources.value = DEV_FALLBACK_RESOURCES
}
```

单一改动点：菜单（读 `store.resources`）与路由守卫（读 `store.resources`）天然一致，无需两处特判。

## 行为说明

| 场景 | 行为 |
|------|------|
| 本地 dev + 后端资源为空 | 菜单显示「数据看板」分组两项，可点击进入；访问 `/` 自动跳第一个兜底资源 `/grade-overview` |
| 本地 dev + 后端已返回资源 | 兜底不生效，完全走后端 |
| 生产构建 | `DEV=false`，兜底逻辑不参与打包 |
| 数据权限 | 不受影响：守卫组件照常按 mock 判定（`campus` 全可见；改 mock 值可看「无数据权限」提示） |
| `/principal-cockpit` | 不在兜底资源中，登录态访问仍按现有守卫重定向（本次只开放两个页面） |

## 接口替换点

**#3（本次新增）**：DEV 菜单兜底。后端在 myAppResource 配置本应用 `/grade-overview`、`/plan-lessons` 资源后，删除 `dev-menu-fallback.ts` 与 store 内引用。

## 验收标准

1. [x] 本地 `pnpm dev`（后端资源为空的现状）：菜单出现两个页面并可进入，`/grade-overview`、`/plan-lessons` 不再被重定向（浏览器实测：菜单「数据看板」分组两项可见可点，URL 停留不重定向）
2. [x] 改 mock 数据权限值后，无权限页面显示错误提示（实测 `campus-grade-subject` 时年级长概览显示「无数据权限 / 所需：校区+年级」，备课组长概览正常空白）
3. [x] `pnpm build:data-board:develop` 成功，产物中兜底逻辑不生效（DEV=false）
4. [x] `principal-cockpit` 与按钮权限行为不变（不在兜底资源中；兜底 `buttonList` 为空不发放按钮权限）
5. [x] vue-tsc 0 error
