# GitLab CI 依赖安装加速 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 改进 `.gitlab-ci.yml` 的 pnpm 缓存与 install 参数，使同 lockfile 下二次 CI 构建明显加速。

**Architecture:** Cache key 绑定 `pnpm-lock.yaml`；缓存 `.pnpm-store` + `node_modules`；install 前指定 store-dir；使用 `--frozen-lockfile --prefer-offline`。

**Tech Stack:** GitLab CI YAML、pnpm、既有 shell/bash runner

---

## 文件职责

| 路径 | 职责 |
|------|------|
| `.gitlab-ci.yml` | 唯一实现文件（本仓 frontend） |
| 本模块 archive | 交付快照（文档仓 V1.5.0） |

---

### Task 1: 改写 `.gitlab-ci.yml` cache 与 build 脚本

**Files:**
- Modify: `.gitlab-ci.yml`

- [ ] **Step 1:** 将顶部全局 `cache:` 改为基于 lockfile，例如：

```yaml
cache:
  key:
    files:
      - pnpm-lock.yaml
  paths:
    - .pnpm-store/
    - node_modules/
```

- [ ] **Step 2:** 在 `build` job 的 `script` 中，于 `pnpm install` 之前增加 store 配置：

```yaml
build:
  stage: build
  script:
    - pnpm config set store-dir "$CI_PROJECT_DIR/.pnpm-store"
    - pnpm install --frozen-lockfile --prefer-offline
    - pnpm build --mode=$CI_COMMIT_REF_NAME
```

- [ ] **Step 3:** 确认未改动 `artifacts`、`only`、以及 `docker-build` / `update-yaml` 两段逻辑
- [ ] **Step 4:** 自检 YAML 缩进与现有风格一致（2 空格）
- [ ] **Step 5:** 跑 `pnpm harness:check`（改的是 CI 非 src，记录结果即可）

---

### Task 2: 交付归档（文档仓）

**Files:**
- Modify: `docs/superpowers/V1.5.0/fix/GitLab-CI依赖安装加速/specs/01-dev-spec.md`（勾选可本地勾选的项）
- Create: `docs/superpowers/V1.5.0/fix/GitLab-CI依赖安装加速/archive/GitLab-CI依赖安装加速-delivered.md`

- [ ] **Step 1:** 写 archive：改动摘要、改动文件表、验收项；一致性自检（N/A 偏多：无 UI 数据态）；还原度自检写「不适用：无 Figma / 非 UI」
- [ ] **Step 2:** 注明：完整耗时对比依赖用户在 GitLab 上再跑两次 pipeline 验证
- [ ] **Step 3:** `pnpm harness:status -- --match "CI依赖"` 与 `pnpm harness:check`
- [ ] **Step 4:** 提醒：CI 改动在 **frontend** 仓提交；文档在 **frontend-local** 仓提交（勿混仓）

---

## 执行注意

- 用户未要求时不要自动 commit / push
- 勿通过 Junction 对 `docs/superpowers` 做 `git rm`（写穿风险）
