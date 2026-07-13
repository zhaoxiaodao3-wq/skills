---
name: create-demand-dir
description: >-
  [已废弃独立触发] 幂等创建 Superpowers 需求模块目录。
  请使用 superpowers-harness-run 或 superpowers-demand-workflow，不要单独 @ 本技能。
  仅当 harness-run 内部需要执行 create-demand 脚本时参考本文件步骤。
---

# create-demand-dir

> **推荐**：完整流程请使用 `superpowers-demand-workflow` 技能。

## 何时使用

- 仅需快速建目录、不涉及完整工作流时
- `superpowers-demand-workflow` 已引导后的目录创建步骤

## 执行

1. 读取 `docs/superpowers/SUPERPOWERS_RULES.md`
2. 运行：
   ```bash
   ./scripts/create-demand.sh --type <type> --name "<name>"
   ```
   Windows: `scripts\create-demand.bat --type <type> --name "<name>"`
3. 必建：`requirements/`、`archive/`、`specs/`、`plans/`
4. 回报路径清单

## 参数

| 参数 | 说明 |
|------|------|
| type | feature / ui-style / api-adapter / fix |
| name | 中文模块名 |
