# GitLab CI 依赖安装加速 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**日期：** 2026-07-30  
**分类：** fix  
**版本：** V1.5.0（文档实体：frontend-local）  
**方案：** A — 修 GitLab CI 的 pnpm 缓存（不改 Nexus/Runner 基建）

---

## 1. 背景与目标

GitLab CI `build` job 中 `pnpm install` 约十余分钟：缓存未命中、仅缓存 `node_modules/` 对 pnpm 不足，且大量包从 Nexus 下载并遇 `ECONNRESET` 重试。

本规格仅通过改进 `.gitlab-ci.yml` 的 cache 与 install 策略，使 **同 `pnpm-lock.yaml` 下二次构建** 显著加快。

---

## 2. 改动范围

| 路径 | 操作 |
|------|------|
| `.gitlab-ci.yml` | 改 cache key/paths；build job 设置 store-dir；改 install 参数 |
| `src/` | 不改 |
| Nexus / Runner 共享 cache | 不做（属方案 C） |

文档（本模块 spec/plan/archive）只写在文档仓 `V1.5.0/fix/GitLab-CI依赖安装加速/`。

---

## 3. 行为要求

### 3.1 Cache

- [x] Cache **key** 基于 `pnpm-lock.yaml`（GitLab `cache:key:files`）
- [x] Cache **paths** 至少包含：`.pnpm-store/`；建议同时包含 `node_modules/`
- [x] 可选：`cache:policy: pull-push`（默认即可，保证 job 结束后写回）

### 3.2 build job

- [x] install 前执行：将 pnpm store 指到项目内目录，例如  
  `pnpm config set store-dir "$CI_PROJECT_DIR/.pnpm-store"`  
  （Windows runner 若非 bash，需与现网 `shell` + bash 日志一致；当前日志为 bash，按 POSIX 写法）
- [x] 安装命令：`pnpm install --frozen-lockfile --prefer-offline`
- [x] 构建命令保持：`pnpm build --mode=$CI_COMMIT_REF_NAME`
- [x] `artifacts` / `only`（master、develop、test、csms）保持不变
- [x] `docker-build` / `update-yaml` 阶段不因本改动而破坏

### 3.3 明确不做

- [x] 不修改业务源码
- [x] 不引入必须依赖「共享 cache URL」才能工作的配置（本机 runner 本地 cache 即可）
- [x] 不在本规格内修复 Nexus `ECONNRESET`（可后续方案 B/C）

---

## 4. 预期效果

| 场景 | 预期 |
|------|------|
| 首次 pipeline 或 lockfile 变更 | install 仍可能较慢；应成功写出 cache |
| 同 runner、同 lockfile 再次构建 | cache 提取成功；`pnpm install` 约 1～3 分钟量级（视机器而定）；`reused`↑ / `downloaded`↓ |
| 跨 runner 且无共享 cache | 可能再次冷装（已知限制，可接受） |

---

## 5. 验收清单

- [ ] `.gitlab-ci.yml` 已按第 3 节改完
- [ ] 同分支连续两次 pipeline：第二次出现 cache 命中相关日志（非 `Cache file does not exist`，或至少 store 复用迹象）
- [ ] 第二次 `pnpm install` 耗时相对第一次明显下降
- [ ] `dist/` 产物仍产出；后续 docker-build 可继续用 artifacts
- [ ] 文档落在 `V1.5.0/fix/GitLab-CI依赖安装加速/`，未误写 v1.0

---

## 6. 风险

| 风险 | 对策 |
|------|------|
| Shell executor 无共享 cache server | 依赖 runner 本机 cache；文档说明需同一 runner 才稳定命中 |
| `--frozen-lockfile` 在 lock 与 package 不一致时失败 | 保持仓库 lock 与依赖同步；失败即暴露问题，属预期 |
| 旧 `node_modules/`  alone 缓存语义变化 | 以 `.pnpm-store` 为主，避免只靠残缺 node_modules |
