# 本地菜单跳转卡顿 — 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1: 开发态 Token 快路径检测（`user-session.ts`）

**文件：** `src/utils/user-session.ts`

- [x] 新增 `syncDevDebugToken(): Promise<void>`，封装 DEV 同步逻辑
- [x] 新增 `checkTokenChangedSinceSnapshot(): Promise<boolean>`
- [x] 保留 `hasTokenChangedSinceSnapshot()` 供其他调用方使用（不删）

---

## Task 2: App.vue 防抖 + 条件刷新

**文件：** `src/App.vue`

- [x] 将 `checkAndReloadOnTokenChange` 改为调用 `checkTokenChangedSinceSnapshot`
- [x] visibility 回调 300ms 防抖
- [x] storage 事件仍直接调用（不经防抖）
- [x] 更新 import

---

## Task 3: AppMenu 复用 useRouteMenu

**文件：** `src/components/AppLayout/components/AppMenu.vue`

- [x] 新增 `skipAutoNavigate` props
- [x] 删除重复菜单逻辑，改用 `useRouteMenu`

**文件：** `src/components/AppLayout/AppLayout.vue`

- [x] 传入 `:skip-auto-navigate="loading"`
- [x] 删除 `console.log`

---

## Task 4: Harness 校验与归档

- [x] 改 `src/` 前：`pnpm harness:status` + `pnpm harness:check`
- [x] 对改动文件跑 lint
- [x] 勾选 `specs/01-dev-spec.md` 验收项
- [x] 写 `archive/本地菜单跳转卡顿-delivered.md`
- [x] 改完后：`pnpm harness:check`

## 手动验收清单

1. `pnpm dev:test`，登录后连续点 10 个不同侧边栏菜单 → 均稳定跳转
2. 切到其他 Tab 再回来（Token 未改）→ 无整页刷新、Network 无 `/__dev_env_token__`
3. 修改 `env/.env.test.local` 的 `VITE_DEBUG_TOKEN` 保存 → 仍能触发刷新（Vite full-reload 或 Token 检测）

---

## Task 5: 开发 server 预扫描 pages 依赖（requirements/02）

**文件：** `vite.config.ts`

- [x] `defineConfig` 解构 `command`，`isServe = command === 'serve'`
- [x] 仅 `isServe` 时设置 `optimizeDeps.entries` + `holdUntilCrawlEnd`
- [x] 仅 `isServe` 时设置 `server.warmup.clientFiles`
- [x] `pnpm build` 路径不注入上述配置

**验证：** 重启 dev server 后首次访问新路由无整页刷新；`pnpm build` 行为不变。
