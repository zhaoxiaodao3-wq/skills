# A2 报告文案空态补丁 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修正 A2 报告 C1～C6 文案/表头/mock 结构，并按清单落实字段 `--` / 整块「暂无数据」空态（Web + H5 同步）。

**Architecture:** 以 Web `a2-data` mock 与 Bloom/问题链契约为准改结构；H5 `a2-mock` + preview 对齐；空态走既有 `mapRowWithDash` / `displayValue` / flags 探针 / H5 Empty Probe，按 spec §3.2 补覆盖。

**Tech Stack:** Vue 3 + TypeScript；Web classroom-diagnosis A2；H5 analysisTeachingA2

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 先文档后实现；仅 P3 + READY_TO_DEV 后改代码
- Web + H5 语义同步；不改 a1/b1/b2
- 3.4.1 分析项可合并原两列内容；以后端为准
- 空态：字段 `--`；整块「暂无数据」；flags 不适用沿用 emptyNote

---

### Task 1: Web · C1 课堂时长去括号

> **Skill:** （无强制）· 置信度 — · 直接改 mock  
> **理由:** 单字段文案，不触发专用 skill

- [ ] 改 `classroom-content-analysis-a2.mock.ts`：`durationDisplay` 去掉 `（…）`
- [ ] 核对 mapper/展示无二次拼接时间区间

### Task 2: Web · C2～C3 3.4 表头与 mock

> **Skill:** （无强制）· 置信度 — · 直接改 mock  
> **理由:** 表头/行数据调整，沿用现有 table block

- [ ] `chapter-new-knowledge.ts` 3.4.1：四列「分析项、观察内容、评价、理由」；合并知识类型+推荐方式进分析项
- [ ] 3.4.2 / 3.4.3：观察内容 label →「观察内容（从音转文提取）」
- [ ] 跑/更新相关 structure spec（若有断言列名）

### Task 3: Web · C4～C6 3.6 mock 与契约

> **Skill:** vue-skills · 置信度 0.75 · 自动激活（若改 Bloom 组件）  
> **理由:** 维度三契约可能改 Vue 组件渲染

- [ ] 维度二标题去掉「（对标诊断）」
- [ ] 维度三改为三组「标题 + 内容」（低阶占比 / 结构判断 / 核心发现）；同步 Bloom 组件渲染
- [ ] 3.6.2（三）拆为三条：目标指向、与重难点的关联、目标达成效果

### Task 4: H5 · 同步 C1～C6

> **Skill:** vue-skills · 置信度 0.8 · 自动激活  
> **理由:** H5 Vue mock + preview 对齐

- [ ] 更新 `analysisTeachingA2/mock/a2-mock.ts` 与相关 types/preview
- [ ] 3.4.1 FieldCard / 表头文案对齐；3.6 维度三与目标指向列表对齐

### Task 5: 空态清单 + 开关

> **Skill:** vue-skills · 置信度 0.75 · 自动激活  
> **理由:** 空态展示与探针/Empty Probe 组件行为

- [ ] 按 spec §3.2 勾选：Web flags 探针 / H5 Empty Probe 覆盖字段 `--` 与整块「暂无数据」
- [ ] 补缺：无数据整块占位文案统一为「暂无数据」（不适用句除外）
- [ ] 联调开关可切换验收

### Task 6: 验收与交付

> **Skill:** superpowers-harness · 置信度 0.85 · 自动激活  
> **理由:** archive + harness:check / status

- [ ] `pnpm harness:check`；勾选 spec §6
- [ ] 写 `archive/A2报告文案空态补丁-delivered.md`（含一致性自检；还原度可写不适用或简要）
- [ ] `harness:status` → DELIVERED
