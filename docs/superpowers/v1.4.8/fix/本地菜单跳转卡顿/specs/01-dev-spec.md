# 本地菜单跳转卡顿 — 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 根因

### 1.1 开发态 Token 检查误触发整页刷新（根因 A）

- `App.vue` 在每次 `visibilitychange`（切 Tab、开 DevTools 等）都会 `await syncDebugTokenFromEnvFile()`，产生网络等待 → **卡顿**
- 同步后 `hasTokenChangedSinceSnapshot()` 与 `sessionStorage` 快照比较，若 localStorage / env 文件与快照不一致 → `router.go(0)` **整页刷新**
- 刷新会**打断**进行中的 `router.push`，表现为「像刷新了但没跳过去」

### 1.2 菜单自动导航与用户点击竞态（根因 B）

- `AppMenu.vue` 在 `watch(props.menu)` 和 `onMounted` 时调用 `initMenuList()`
- 当 `active` 为空时强制 `router.replace(第一个叶子菜单)`
- `applicationMenu` 异步从 `[]` 变为完整菜单时，与用户 `router.push` 并发 → **导航被覆盖**

`useRouteMenu.ts` 已有 `skipAutoNavigate` 防护，但 `AppMenu` 未复用。

## 2. 方案

### 2.1 收敛开发态 Token 刷新（根因 A）

**`src/utils/user-session.ts`**

- 新增 `checkDevTokenChanged(): Promise<boolean>`（或等价逻辑）：
  1. **快路径**：`getToken() === getSessionTokenSnapshot()` 时直接返回 `false`，**不发起 fetch**
  2. 仅当快路径失败时，才执行 `syncDebugTokenFromEnv()` + `syncDebugTokenFromEnvFile()`
  3. 同步后若 `getToken()` 仍与快照相同 → 更新快照并返回 `false`（消除误判）
  4. 仅当 `getToken()` 确实变化 → 返回 `true`

**`src/App.vue`**

- `checkAndReloadOnTokenChange` 改为调用上述方法；生产路径保持 Cookie / localStorage 逻辑不变
- `visibilitychange` 处理器增加 **300ms 防抖**，避免连续触发
- 仅在 Token **确实变化**时执行 `updateUserInfo` + `updateAuthInfo` + `router.go(0)`

### 2.2 修复 AppMenu 导航竞态（根因 B）

**`src/components/AppLayout/components/AppMenu.vue`**

- 删除与 `useRouteMenu` 重复的菜单树 / active / 自动导航逻辑
- 改为使用 `useRouteMenu(computed(() => props.menu))`
- 通过 props 接收 `skipAutoNavigate`（由父组件传入）

**`src/components/AppLayout/AppLayout.vue`**

- 向 `AppMenu` 传入 `:skip-auto-navigate="loading"`，应用资源未就绪时不自动跳转
- 移除调试用的 `console.log`

自动导航规则（与 `useRouteMenu` 一致）：

- 仅在菜单就绪、`skipAutoNavigate` 为 false、且**当前路由不在菜单内**时，跳转首个叶子菜单
- 菜单后续更新时只刷新列表与高亮，**不重复** `replace`

## 3. 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/utils/user-session.ts` |
| 改 | `src/App.vue` |
| 改 | `src/components/AppLayout/components/AppMenu.vue` |
| 改 | `src/components/AppLayout/AppLayout.vue` |

**不改动**：`useRouteMenu.ts`（仅复用）、Vite 插件、nginx / 反代相关。

## 4. 非目标

- 不恢复本地 nginx 反代方案
- 不修改 `useRouterTabs`（本次范围外，若仍有问题另开 fix）
- 不优化 DEV 懒加载 chunk 体积

## 5. 验收标准

### Token 刷新

- [x] 本地开发切 Tab 再回来，Token 未变时**不**触发 `router.go(0)`
- [x] Token 未变时 `visibilitychange` **不**发起 `/__dev_env_token__` 请求（快路径）
- [x] 修改 `env/.env.*.local` 中 `VITE_DEBUG_TOKEN` 后，仍能正确检测变化并刷新（与现有 Token 同步能力兼容）

### 菜单导航

- [x] 应用菜单异步加载完成后，不覆盖用户已点击的目标路由
- [x] 连续点击不同侧边栏菜单 10 次，均能稳定跳转，无整页刷新
- [x] 当前路由已在菜单内时，菜单 prop 更新**不**触发 `replace` 到首个菜单

### 回归

- [x] 测试/生产环境 Cookie + `storage` 同步刷新行为不变
- [x] `analysis-web` 等已使用 `useRouteMenu` 的页面行为不变

---

## 6. 补充：首次访问路由整页刷新（requirements/02）

**Requirement:** [requirements/02-首次路由刷新.md](../requirements/02-首次路由刷新.md)

### 6.1 根因 C

- `vite-plugin-pages` 使用 `importMode: "async"`，dev server 首次访问懒加载路由时发现新依赖
- 默认 `optimizeDeps.entries` 仅扫描 `index.html`，触发 Vite optimizeDeps 重优化 → **full-reload**
- 测试/生产为构建产物，构建时已打包全部 chunk，无此问题

### 6.2 方案

**`vite.config.ts`**（**仅 `command === 'serve'`** 时生效，即 `pnpm dev` / `pnpm dev:test`；`pnpm build` 不受影响）

- `optimizeDeps.entries` 增加 `src/pages/**/*.{vue,ts,js}`
- `optimizeDeps.holdUntilCrawlEnd: true`
- `server.warmup.clientFiles` 预热 pages / layouts

### 6.3 验收标准（02）

- [x] dev server 启动后，首次点击未访问过的菜单**不**触发浏览器整页刷新
- [x] `pnpm build` 产物与构建配置**无变化**（`command === 'build'` 时不注入上述配置）
