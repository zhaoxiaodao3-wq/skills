---
name: superpowers-harness
description: >-
  Superpowers Harness 门禁与迁移：开发类任务入口，判断需求阶段（create-demand /
  brainstorming / writing-plans / 开发），防止 Agent 跳过 spec/plan 直接改代码。
  用户说新功能、改页面、修 bug、开发、实现、安装 harness、bootstrap 时必须使用。
  与 superpowers-demand-workflow 配合；新项目用 bootstrap-harness 安装。
---

# Superpowers Harness 门禁

在 `superpowers-demand-workflow`（文档落位）之上叠加流程门禁与机械校验。

## 何时使用

- 用户提出开发类任务：新功能、改页面、修 bug、实现、开发
- 需要判断当前需求处于哪个阶段
- 需要安装 Harness 到新项目（bootstrap-harness）
- commit 前自查：`node scripts/harness/validate-harness.mjs`

## 执行前必读

1. `docs/superpowers/HARNESS_RULES.md`
2. `docs/superpowers/SUPERPOWERS_RULES.md`

## 阶段判断

扫描 `docs/superpowers/current/{type}/*/` 下所有模块。

匹配优先级：

1. 用户明确模块名 → 精确匹配
2. 用户给出 `src/` 路径 → 按路径片段 fuzzy 匹配模块名
3. 无法匹配 → 新需求，从 create-demand 开始

| 阶段 | 条件 | 调用 |
|------|------|------|
| NO_MODULE | 无对应模块目录 | `superpowers-demand-workflow` (create-demand) |
| NO_SPEC | 无 specs/01-dev-spec.md | `brainstorming` |
| NO_PLAN | 无 plans/01-dev-plan.md | `writing-plans` |
| READY_TO_DEV | 有 spec 且有 plan | 允许开发 |

## 与 demand-workflow 衔接

- **demand-workflow** 管目录与文档落位
- **harness** 管能不能写代码、技能路由、校验迁移
- 未完成 spec/plan 时**不得**引导修改 `src/`
- 宽松模式：用户坚持跳过时警告并提示后续补文档

## 宽松模式

- `validate-harness.mjs` 默认宽松：警告 + exit 0
- `--strict`：有警告时 exit 1
- 日志：`.harness/warnings.log`

## 新项目安装

**Windows：**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".agents\skills\superpowers-harness\scripts\bootstrap-harness.ps1"
```

**macOS/Linux：**

```bash
bash .agents/skills/superpowers-harness/scripts/bootstrap-harness.sh
```

## AI 检查清单

- [ ] 已读 HARNESS_RULES + SUPERPOWERS_RULES
- [ ] 已判断阶段并路由到正确技能
- [ ] 未 READY_TO_DEV 时不改 src/
- [ ] 文档写入 current/ 下正确子目录
- [ ] commit 前提示运行 validate-harness 自查
