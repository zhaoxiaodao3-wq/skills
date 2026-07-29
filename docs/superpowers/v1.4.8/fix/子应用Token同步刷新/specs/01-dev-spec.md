# 子应用 Token 同步刷新 — 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 根因

1. `main.ts` 启动时优先使用 localStorage 中旧的 `AUTH_INFO`，即使 Cookie 已被主应用更新。
2. `App.vue` 的 `visibilitychange` 仅比较 localStorage 与 `sessionStorage.sessionToken`；当 localStorage 未更新而 Cookie 已更新时，检测不到变化。
3. 缺少 `storage` 事件监听，主应用在同源其他 Tab 更新 localStorage 时子应用 Tab 无响应。

## 2. 方案（含本地开发补充）

### 2.1 测试/生产（子应用 Cookie 同步，保持不变）

Cookie Token 与 localStorage 不一致时以 Cookie 为准；`visibilitychange` / `storage` 事件触发刷新。

### 2.2 本地开发（`pnpm dev:test` + `.env.test.local`）

**根因**：`main.ts` 优先读 localStorage 旧 `AUTH_INFO`，覆盖 `.env.test.local` 中新的 `VITE_DEBUG_TOKEN`。

**修复**：

1. `DEV` 模式下 `VITE_DEBUG_TOKEN` **优先于** localStorage
2. Vite 插件提供 `/__dev_env_token__` 读取 `.env.{mode}.local` 磁盘最新值
3. 保存 `.env*.local` 时自动 `full-reload`
4. `App.vue` 在 DEV 下调 `syncDebugTokenFromEnvFile()` 而非 Cookie 同步

## 3. 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/utils/user-session.ts` |
| 改 | `src/App.vue` |
| 改 | `src/main.ts` |
| 新增 | `scripts/vite/env-local-dev-token-plugin.ts` |
| 改 | `vite.config.ts` |

## 4. 验收标准

### 测试/生产

- [x] 主应用切换账号后回到子应用 Tab 自动刷新
- [x] 同源 Tab 更新 `AUTH_INFO` 后子应用刷新

### 本地开发

- [x] `pnpm dev:test` 下修改 `env/.env.test.local` 的 `VITE_DEBUG_TOKEN` 保存后自动刷新
- [x] 无需手动删除 localStorage 旧 Token
- [x] 未修改 Token 时不异常刷新
