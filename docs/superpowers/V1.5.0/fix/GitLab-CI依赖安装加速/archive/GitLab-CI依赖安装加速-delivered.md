# GitLab-CI依赖安装加速 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-30  
**版本：** V1.5.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

1. 初版：lockfile cache key + 项目内 `.pnpm-store`（GitLab cache）。实测 shell executor 下 **cache 归档不存在**，`reused 0`，无效。  
2. 纠正：pnpm store 改到 runner **主机持久目录** `/home/gitlab-runner/.cache/pnpm-store`（不依赖 GitLab cache 命中）。

## 改动文件

| 操作 | 路径 | 仓库 |
|------|------|------|
| 改 | `.gitlab-ci.yml` | frontend |
| 改 | `docs/README.md`（文档仓外链说明补充） | frontend |
| 增 | 本模块 requirements / specs / plans / archive | frontend-local（经 Junction） |
| 增 | `requirements/02-主机级pnpm-store补充.md` | frontend-local |

## 验收结果

- [x] `.gitlab-ci.yml` 已改为主机级 `PNPM_STORE_DIR` + `--frozen-lockfile --prefer-offline`
- [ ] 同主机第二次 pipeline：`reused`↑ / install 耗时下降（**待用户验证**；可忽略仍报 Cache file does not exist）
- [x] artifacts / only / docker-build / update-yaml 未改坏
- [x] 文档落在 `V1.5.0/fix/GitLab-CI依赖安装加速/`

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 无业务 UI / 数据态 |
| 常量/mock/真数据 | N/A | 仅 CI 配置 |
| 多入口 | 通过 | 仅改全局 cache + build job；docker-build/update-yaml 未动 |
| 失败/缺省 | 通过 | `--frozen-lockfile` 在 lock 不一致时失败属预期；跨 runner 无共享 cache 时可能冷装（spec 已知限制） |

## 还原度自检

不适用：无 Figma / 非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑（见对话中 `pnpm harness:check`）
