---
description: 按 Superpowers Harness 完整流程处理开发需求（含三档分档与用户确认暂停）
---

请读取并严格遵循 **superpowers-harness-run** 技能与 `docs/superpowers/HARNESS_RULES.md` **§3.1**，对以下需求执行 Harness 完整流程。

**硬性要求：**

1. 先 `pnpm harness:status -- --match "<关键词>"`，回复开头输出 `[Harness]` 状态行（**必须含档位：轻量 / 标准 / 全量**）
2. **入口后先分档**并口头宣告；允许用户一句话改档（见 `HARNESS_RULES.md` §3）
3. **标准 / 全量**暂停点（不可因「改动小 / 只改 HTML」跳过）：
   - **P1** 方案确认 → 仅允许写/改文档
   - **P2** 对已落盘 spec 确认（用户宜回复含 `spec OK`）→ 仍禁止改实现
   - **P3** 执行方式（`Inline` / `SDD`）→ 且 `READY_TO_DEV` 后才能改实现
4. **「确认 / 方案 OK / 只改某某」≠ P2+P3 已放行**；范围修订按 P1 处理，只更新文档后停住
5. **强制先文档后实现**：禁止先改 `src/` / 模板等实现文件再补 requirements/spec/plan
6. **轻量**：默认不改正式实现；探查结论可落 `requirements/` / `archive/`；例外改代码仍须用户确认
7. fix / 纠正 / 补充需求 **不得跳过** 对应档位的暂停点
8. 改实现前后运行 `pnpm harness:check`（标准 / 全量须 `READY_TO_DEV`）
9. writing-plans 后须 skill routing：`node .agents/routing/router.mjs --annotate <plan>`
10. 官方 skill 以插件为准；Bounded 短设计**不能**绕过本仓库短 spec/plan 落盘

需求：

$ARGUMENTS
