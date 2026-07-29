# Harness交付自检门禁 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-20
**版本：** V1.4.9
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

在 Harness 交付链路落地半硬门禁：先 A 一致性自检、再 B 还原度自检（适用时）；同步更新项目 `HARNESS_RULES`、外链 skill（`frontend-local`）与 `harness:check` 章节存在性校验。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `docs/superpowers/HARNESS_RULES.md` |
| 改 | `scripts/harness/validators/doc-structure.js`（及 nested 副本） |
| 改 | `scripts/harness/validators/__tests__/doc-structure.spec.js` |
| 改 | `E:\code\frontend-local\.agents\skills\superpowers-harness-run\SKILL.md` |
| 改 | `E:\code\frontend-local\.cursor\skills\superpowers-harness-run\SKILL.md` |
| 改 | `E:\code\frontend-local\.agents\skills\superpowers-harness\SKILL.md` |
| 改 | `E:\code\frontend-local\.cursor\skills\superpowers-harness\SKILL.md` |
| 改 | `E:\code\frontend-local\.cursor\skills\superpowers-harness\superpowers-harness\SKILL.md` |
| 改 | `E:\code\frontend-local\.agents\skills\superpowers-demand-workflow\SKILL.md` |
| 改 | `E:\code\frontend-local\.cursor\skills\superpowers-demand-workflow\SKILL.md` |

## 验收结果

- [x] HARNESS_RULES / harness-run 写明 A→B 与适用范围
- [x] staged 交付快照缺「一致性自检」→ `ARCHIVE_MISSING_CONSISTENCY_CHECK`
- [x] staged ui-style spec 缺样式对照 → `SPEC_MISSING_FIGMA_STYLE_TABLE`
- [x] 外链 skill 双端（agents/cursor）已更新
- [x] doc-structure 单测 6 通过

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 流程基建，无业务双路径文案 |
| 常量/mock/真数据 | N/A | 同上 |
| 多入口 | 通过 | `.agents` 与 `.cursor` 外链 skill 均已改；validators 双副本已同步 |
| 失败/缺省 | 通过 | 非适用还原度写「不适用」；历史 archive 仅 staged 时校验，避免全量刷屏 |

## 还原度自检

不适用：无 Figma / 非 UI（流程规则基建）

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
