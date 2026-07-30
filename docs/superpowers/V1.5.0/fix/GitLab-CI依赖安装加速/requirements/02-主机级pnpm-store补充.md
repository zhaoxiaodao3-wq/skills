# 补充需求：主机级 pnpm store（方案 A 实证无效后）

**日期：** 2026-07-30  
**关联：** [01-原始需求.md](./01-原始需求.md)

## 现象

推送方案 A 后，`test` 分支 job（runner-04，commit `d0b91641`）仍：

- `Checking cache for 0_pnpm-lock-...` → **Cache file does not exist**
- `No URL provided`（无共享 cache server）
- `pnpm install`：`reused 0`，继续从 Nexus 全量下载 + ECONNRESET

说明 **YAML 已生效**，但 GitLab「项目目录内 cache 打包」在本环境不可用。

## 根因

1. Shell executor 每次 `Initialized empty Git repository`，构建目录不保留
2. 未配置共享 cache URL → 只能抽本机 cache 归档；归档若不存在则永远冷装
3. store 写在 `$CI_PROJECT_DIR/.pnpm-store` 会随构建目录被清掉；且依赖 GitLab 成功 Saving cache 才能下次还原
4. runner-03 / runner-04 虽不同名，日志主机均为 `iZwz9g6k7uizopil6mpgc7Z` → **可共用主机目录**

## 纠正方案

- `PNPM_STORE_DIR=/home/gitlab-runner/.cache/pnpm-store`（构建目录外、持久）
- `mkdir -p` + `pnpm config set store-dir` 指向该路径
- GitLab `cache` 仅辅助缓存 `node_modules/`（可选）；**依赖复用不依赖 cache 命中**

## 验收

- 同主机第二次及以后：`reused` ≫ 0，`downloaded` 明显下降
- 日志可仍有 `Cache file does not exist`（可忽略），只要 install 变快即达标
