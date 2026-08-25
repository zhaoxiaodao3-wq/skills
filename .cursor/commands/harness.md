---
description: 按 Superpowers Harness 完整流程处理开发需求（含三档分档与用户确认暂停）
---

请读取并严格遵循 **superpowers-harness-run** 技能，对以下需求执行 Harness 完整流程。

**硬性要求：**

1. 先 `pnpm harness:status -- --match "<关键词>"`，回复开头输出 `[Harness]` 状态行（**必须含档位：轻量 / 标准 / 全量**）
2. **入口后先分档**并口头宣告；允许用户一句话改档（见 `HARNESS_RULES.md` §3）
3. **标准 / 全量**：P1 方案确认 → P2 spec 确认 → P3 执行方式选择 → 然后才能改 `src/`
4. **轻量**：默认不改正式业务 `src/`；探查结论可落 `requirements/` / `archive/`；若例外改代码仍须用户确认
5. fix / 纠正 / 补充需求 **不得跳过** 对应档位的暂停点
6. 改 `src/` 前后运行 `pnpm harness:check`（标准 / 全量须 `READY_TO_DEV`）
7. writing-plans 后须 skill routing：`node .agents/routing/router.mjs --annotate <plan>`
8. 官方 skill 以插件为准，不把官方 `SKILL.md` 拷进仓库

需求：

$ARGUMENTS
