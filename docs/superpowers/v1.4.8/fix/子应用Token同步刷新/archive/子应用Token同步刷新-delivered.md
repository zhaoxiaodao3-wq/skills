# 子应用 Token 同步刷新 — 交付快照

## 改动摘要

1. **测试/生产**：主应用切换账号后 Cookie → localStorage 同步并刷新
2. **本地开发**：`VITE_DEBUG_TOKEN` 优先于 localStorage；Vite 插件读取 `.env.test.local` 最新 Token

## 改动文件

| 文件 | 说明 |
|------|------|
| `src/utils/user-session.ts` | debug token 同步、Cookie 同步、session 快照 |
| `src/App.vue` | DEV/非 DEV 分支检测刷新 |
| `src/main.ts` | 启动时 DEV 优先应用 debug token |
| `scripts/vite/env-local-dev-token-plugin.ts` | 开发态读 env.local + 变更 full-reload |
| `vite.config.ts` | 注册插件 |

## 本地开发用法

1. 在 `env/.env.test.local` 设置 `VITE_DEBUG_TOKEN=<最新token>`
2. `pnpm dev:test`
3. 更新 Token 后**保存文件** → 页面自动刷新生效，无需清 localStorage

## 验证

- [x] `pnpm typecheck` 通过
- [x] `pnpm harness:check` 通过（无关模块警告除外）

## 手动验收建议

1. 打开子应用 Tab，记录当前账号
2. 切到主应用 Tab 切换账号
3. 回到子应用 Tab → 应自动刷新并使用新账号
4. 未切换账号时正常使用，无异常刷新
