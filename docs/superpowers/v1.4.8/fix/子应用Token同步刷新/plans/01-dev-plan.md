# 子应用 Token 同步刷新 — 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1: 扩展 user-session Token 同步能力

- [x] 新增 `syncAuthInfoFromCookie`、`refreshAuthInfoFromLocalStorage`
- [x] 新增 sessionToken 快照读写 helper
- [x] 移除 `getToken` 调试 `console.log`

## Task 2: App.vue 统一 Token 变更检测

- [x] 提取 `checkAndReloadOnTokenChange`
- [x] visibilitychange 先 sync 再检测
- [x] 监听 storage 事件（AUTH_INFO）

## Task 3: main.ts 启动时同步 Cookie

- [x] init 阶段调用 `syncAuthInfoFromCookie` 后再 setLocal

## Task 4: 验证与归档

- [x] `pnpm harness:check`
- [x] 写 archive 交付快照
