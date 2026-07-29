# Superpowers 文档外链迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 将 `docs/superpowers` 实体迁入 `E:\code\frontend-local`，本仓以 JUNCTION 外链保持路径，并清理 frontend git 历史中该路径。

**Architecture:** 文档与 skills 同仓（skills.git）；frontend 仅保留路径约定 + 建链脚本 + gitignore；Harness/Agent 仍读写 `docs/superpowers/`，开发流程不变。

**Tech Stack:** PowerShell JUNCTION（`mklink /J`）、可选 bash symlink、`git filter-repo`、既有 `pnpm harness:*`

---

## 文件职责

| 路径 | 职责 |
|------|------|
| `E:\code\frontend-local\docs\superpowers\**` | 文档实体（迁入后唯一真源） |
| `E:\code\frontend\docs\superpowers` | JUNCTION，不进 git |
| `scripts/link-superpowers-docs.ps1` | Windows 幂等建链 |
| `scripts/link-superpowers-docs.sh` | 非 Windows symlink（可选） |
| `docs/README.md` | 外链说明与协作约定 |
| `.gitignore` | 忽略 `docs/superpowers/` |

---

### Task 1: 迁文档到 frontend-local 并提交

**Files:**
- Create: `E:\code\frontend-local\docs\superpowers\**`（从本仓整树复制）
- Commit: skills.git（frontend-local）

- [ ] **Step 1:** 确认本仓 `docs\superpowers` 完整可读；确认 `E:\code\frontend-local` 为 skills.git 且可提交
- [ ] **Step 2:** 若 `frontend-local\docs\superpowers` 已存在则先备份/确认空；再递归复制本仓整树到该路径
- [ ] **Step 3:** 抽样对比文件数与 `current-version.txt`、`V1.5.0\feature\Superpowers文档外链迁移\specs\01-dev-spec.md` 存在
- [ ] **Step 4:** 在 frontend-local：`git add docs/superpowers` → 提交（中文 message，如 `docs: 迁入 frontend superpowers 文档树`）→ `git push`（用户未禁止 push 到 skills 仓时可推；若需用户确认则暂停询问）
- [ ] **Step 5:** **暂停确认**：告知用户迁移副本已在 frontend-local 且已提交，再进入 Task 2（本仓删物理目录）

---

### Task 2: 本仓去跟踪、建 JUNCTION、gitignore、脚本与 README

**Files:**
- Modify: `E:\code\frontend\.gitignore`
- Create: `E:\code\frontend\scripts\link-superpowers-docs.ps1`
- Create: `E:\code\frontend\scripts\link-superpowers-docs.sh`（可选但建议做）
- Create: `E:\code\frontend\docs\README.md`
- Delete from index: `docs/superpowers/**`（本仓）

- [ ] **Step 1:** `git rm -r --cached docs/superpowers`（若仍被跟踪）；**不要**在未建 junction 前丢失 frontend-local 副本
- [ ] **Step 2:** 删除本仓物理目录 `docs\superpowers`（确认 frontend-local 已有完整副本）
- [ ] **Step 3:** 编写并运行 `scripts/link-superpowers-docs.ps1`：
  - 默认目标：`E:\code\frontend-local\docs\superpowers`
  - 若路径已是指向该目标的 JUNCTION → 成功退出
  - 若存在普通目录 → 报错退出，提示先迁走
  - 否则 `cmd /c mklink /J "<repo>\docs\superpowers" "<frontend-local>\docs\superpowers"`
- [ ] **Step 4:** `.gitignore` 增加一行：`docs/superpowers/`
- [ ] **Step 5:** 写 `docs/README.md`：架构一句话、Windows/macOS 建链命令、文档提交在 frontend-local、Harness 路径不变
- [ ] **Step 6:** 验证：`Get-Item docs\superpowers | Select LinkType, Target`；`pnpm harness:status -- --match "文档外链迁移"` 能匹配本模块
- [ ] **Step 7:** frontend 提交（不含清历史）：gitignore、脚本、README、移除文档跟踪。Message 例：`chore: 将 superpowers 文档外链至 frontend-local`

---

### Task 3: 清历史（单独窗口，需用户最终确认 force push）

**Files:**
- 操作对象：frontend `.git` 历史中的 `docs/superpowers/`

- [ ] **Step 1:** 确认已安装 `git filter-repo`（`git filter-repo --version`）；未装则安装或暂停
- [ ] **Step 2:** **再次向用户确认**可以改写历史并 force push（本 Task 默认不自动 push）
- [ ] **Step 3:** 在干净工作区执行（示例）：

```bash
git filter-repo --path docs/superpowers/ --invert-paths --force
```

  （若需保留 remote：filter-repo 后按官方说明恢复 `origin`）
- [ ] **Step 4:** 验证 `git log --all -- docs/superpowers` 无输出；`.gitignore` / 脚本 / README 仍在
- [ ] **Step 5:** 重建 junction（filter-repo 不应删工作区外链目标，但若 `docs/superpowers` 消失则重跑建链脚本）
- [ ] **Step 6:** 用户明确要求后再 `git push --force-with-lease`（**禁止擅自 force push**）

---

### Task 4: 验收与交付归档

**Files:**
- Modify: `specs/01-dev-spec.md`（勾选验收项）
- Create: `archive/Superpowers文档外链迁移-delivered.md`

- [ ] **Step 1:** 跑 `pnpm harness:check` 与 `pnpm harness:status -- --match "文档外链迁移"`
- [ ] **Step 2:** 抽样：在外链路径新建临时文件再删除，确认落在 `frontend-local\docs\superpowers`
- [ ] **Step 3:** 勾选 spec 第 6 节验收项；写 archive（含一致性自检 / 还原度自检：不适用非 UI）
- [ ] **Step 4:** 再跑 `pnpm harness:check`；回报 DELIVERED 与闭环清单

---

## 执行注意

- Task 1 → 2 之间必须有「frontend-local 已提交」的确认，防止丢文档
- Task 3 与常规 commit 分离；force push 仅用户明示
- 不修改 `scripts/harness` 内路径字符串（外链后仍有效）
