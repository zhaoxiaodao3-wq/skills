# Superpowers-6.3对接优化 · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-08-25  
**版本：** V1.6.0  
**档位：** 全量（流程/规则变更）  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

将官方 Superpowers v6.3.0 的需求分析三档与 SDD 关键约束接入自建 Harness：目录四层与暂停门禁保留；官方 skill 靠升插件更新、不落仓库；标准档收编原 fix 轻量通道。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `.agents/skills/superpowers-harness-run/SKILL.md` |
| 改 | `.cursor/skills/superpowers-harness-run/SKILL.md`（与 agents 同步） |
| 改 | `docs/superpowers/HARNESS_RULES.md` |
| 改 | `docs/superpowers/SUPERPOWERS_RULES.md` |
| 改 | `.cursorrules`（frontend-local；frontend 侧已对齐） |
| 增 | `docs/superpowers/V1.6.0/feature/Superpowers-6.3对接优化/`（requirements / specs / plans / archive） |

## 验收结果

- [x] P0 升级说明写入 spec（用户侧升插件见下）
- [x] P1 三档已写入 harness-run + HARNESS_RULES
- [x] P2 SDD 约束已写入 harness-run Step C/D + HARNESS_RULES §4
- [x] 职责边界 / 路径覆盖 / 官方不落仓已同步
- [x] 未引入官方 skill 副本；未改业务 `src/`
- [x] **P0：** Cursor / Claude 插件缓存已升至 6.3.0（2026-08-25 直接升级）

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 无 UI / 无业务数据路径 |
| 常量/mock/真数据 | N/A | 无业务常量或接口映射 |
| 多入口 | 通过 | `.agents` 与 `.cursor` 下 harness-run 已同步；`.cursorrules` local/frontend 已对齐 |
| 失败/缺省 | N/A | 无运行时缺省态 |

## 还原度自检

不适用：无 Figma / 非 UI（流程与文档变更）

## P0 插件升级记录

| 端 | 状态 | 路径 / 说明 |
|----|------|-------------|
| Cursor Superpowers | **6.3.0**（`b36e082`） | `~\.cursor\plugins\cache\cursor-public\superpowers\d884ae04…` checkout `v6.3.0` |
| Claude Code superpowers | **6.3.0**（`b36e082`） | `~\.claude\plugins\cache\…\superpowers\6.3.0`；`installed_plugins.json` 已改指向 |

## Harness 闭环

- [x] validate 开发前已跑（READY_TO_DEV）
- [x] archive 交付快照已写
- [x] validate 交付后已跑（见交付后 status）
