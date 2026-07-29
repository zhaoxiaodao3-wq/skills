# Superpowers 文档外链迁移 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**日期：** 2026-07-29  
**分类：** feature  
**方案：** 文档实体迁入 `frontend-local`（skills.git）+ 本仓 JUNCTION 外链 + 清理本仓 git 历史

---

## 1. 背景与目标

将 `docs/superpowers/` 从 frontend 业务仓剥离，迁入已有旁路仓 `E:\code\frontend-local`（远程 `skills.git`），本仓通过 Windows JUNCTION（及其他 OS 的 symlink）保持路径 `docs/superpowers` 不变，从而：

1. 减小 frontend 跟踪内容与（清历史后）`.git` 体积
2. 文档与 skills 同仓独立管理、独立提交
3. Agent / Harness 仍使用约定路径 `docs/superpowers/`，无需改路径约定

**约束：** Git submodule 只能挂整仓，不能挂 `frontend-local` 的子目录；故挂载方式为 junction/symlink，而非把 skills.git submodule 到 `docs/superpowers`。

---

## 2. 目标架构

```
E:\code\frontend-local\                 ← skills.git
  .agents\skills\...
  docs\superpowers\                     ← 文档实体（从 frontend 迁入）
    current-version.txt
    SUPERPOWERS_RULES.md
    HARNESS_RULES.md
    V1.5.0\...
    ...

E:\code\frontend\                       ← 业务仓
  docs\superpowers  → JUNCTION → E:\code\frontend-local\docs\superpowers
  scripts\link-superpowers-docs.ps1     ← 一键建链
  docs\README.md（或等价说明）
  .gitignore                            ← 忽略 docs/superpowers/
```

| 改动类型 | 仓库 |
|----------|------|
| 需求/spec/plan/archive、规则 md | frontend-local |
| `src/`、`scripts/harness` 等业务 | frontend |
| skill 流程源码 | frontend-local（既有约定） |

---

## 3. 功能需求

### 3.1 文档迁移

- [ ] 在 `E:\code\frontend-local\docs\superpowers\` 落盘本仓 `docs/superpowers/` **全部**现有内容（含历史版本目录与本模块）
- [ ] 在 frontend-local（skills.git）提交并推送文档树
- [ ] 迁移完成前不得删除本仓唯一副本

### 3.2 本仓外链

- [ ] frontend 停止跟踪 `docs/superpowers/**` 正文
- [ ] 删除本仓物理 `docs/superpowers` 后建立 JUNCTION 指向 `E:\code\frontend-local\docs\superpowers`
- [ ] 提供 `scripts/link-superpowers-docs.ps1`（幂等：已是正确 junction 则跳过；存在非链接目录则报错提示）
- [ ] 可选：`scripts/link-superpowers-docs.sh`（`ln -s`）供非 Windows
- [ ] `docs/README.md`（或根 README 专节）写明：路径约定、建链命令、文档改在 frontend-local 提交
- [ ] `.gitignore` 忽略 `docs/superpowers/`，防止误提交

### 3.3 历史清理

- [ ] 使用 `git filter-repo`（或团队等价工具）从 frontend **全部历史**移除路径 `docs/superpowers/`
- [ ] 清理范围仅限该路径；不动 `src/` 及其他 `docs/`
- [ ] 执行前团队知情；执行后按需 force push（实施窗口单独约定）
- [ ] 清理后本仓 `git ls-files docs/superpowers` 为空（说明类文件若放在 `docs/` 而非该目录下则除外）

### 3.4 兼容与验收

- [ ] 外链建立后 `pnpm harness:status` / `pnpm harness:check` 可正常解析文档树
- [ ] 经外链写入的文件实际落在 `frontend-local\docs\superpowers\...`
- [ ] **不**将整个 skills.git submodule 到 `docs/superpowers`
- [ ] **不**修改 Harness 对路径字符串 `docs/superpowers` 的约定（除非验收证明必须改；本 spec 默认不改）

### 3.5 CI（默认）

- [ ] 本机开发依赖外链；CI **不强制**挂载 `docs/superpowers`
- [ ] 若现有 CI job 已读取该目录，实施时单独补 clone+建链或将该检查标为可选（发现后再改，不阻塞主路径）

---

## 4. 非目标

- 新建独立「仅文档」空仓再 submodule（已否决，落点固定为 frontend-local）
- 清理 frontend 中其他路径的历史
- 改变 Superpowers 四层目录规范（`{version}/{type}/{模块}/...`）
- 自动 commit / 自动 force push（须人工确认）

---

## 5. 风险与对策

| 风险 | 对策 |
|------|------|
| force push 影响同事本地仓 | 提前通知；清历史单独窗口；他人 re-clone 或按说明复位 |
| 未建 junction 导致 harness 失败 | setup 脚本 + README；文档中写清报错表现 |
| 误提交文档进 frontend | `.gitignore` |
| frontend-local 未 pull 文档落后 | 改文档前 pull skills 仓 |
| 无 `git-filter-repo` | 实施前安装；否则文档化等效步骤后暂停 |

---

## 6. 验收清单

- [ ] `frontend-local/docs/superpowers/` 含完整文档树且已在 skills.git 提交
- [ ] `frontend/docs/superpowers` 为指向上述路径的 JUNCTION（或等价 symlink）
- [ ] frontend `.gitignore` 含 `docs/superpowers/`
- [ ] 存在建链脚本与 README 说明
- [ ] `pnpm harness:status -- --match "文档外链迁移"` 仍能看到本模块
- [ ] 历史清理后 frontend 不再在 git 历史中保留 `docs/superpowers/` 路径（filter-repo 完成且团队确认 push 策略）
- [ ] 抽样：新建或修改一处 requirements 文件，确认磁盘路径在 frontend-local 下

---

## 7. 实施注意

1. **顺序：** 迁出并提交 frontend-local → 本仓去跟踪并建 junction → 再 filter-repo  
2. **本模块 spec/plan** 迁移后位于外链后的同一逻辑路径，验收时用 harness 验证即可  
3. 清历史会改写 git 对象；与常规 PR 流程分离，plan 中单独 Task
