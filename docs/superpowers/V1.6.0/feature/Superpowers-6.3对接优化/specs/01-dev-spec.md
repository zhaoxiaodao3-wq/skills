# Superpowers 6.3 对接优化 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.6.0  
**分类：** feature  
**基线：** 官方 Superpowers **v6.3.0** + 接入包 **P0 + P1 + P2**

## 1. 背景与目标

本仓库工作流 = **官方 skill（插件）** + **自建 Harness（仓库）**。  
官方 skill 通过升级插件更新，**不**把官方 `SKILL.md` 拷进仓库。  
自建层负责目录四层、阶段门禁、暂停点、交付自检，并把 6.3 有价值的行为接到编排里。

### 目标

1. **P0**：本机官方插件升到 v6.3.0（用户操作；文档给出验收项）
2. **P1**：自建流程接入需求分析三档（轻量 / 标准 / 全量），保留四层目录与核心门禁
3. **P2**：开发阶段（尤其 Subagent-Driven）对齐 6.3 SDD 关键约束（禁嵌套子代理、显式模型、`Spec:` 强制、同形 Task 可批量）

### 非目标

- 不整包覆盖/拷贝官方 skill 进 `.agents/skills/`
- 不取消 P 暂停点；不改为官方默认「bounded 可不写 plan」
- 不接 Devin / Hermes / Grok / Gemini / Codex 专项编排
- 不改业务 `src/`（本需求只改 docs + 自建 skills / 规则）

## 2. 职责边界

| 层 | 内容 | 更新方式 |
|----|------|----------|
| 官方 skill | brainstorming、writing-plans、subagent-driven-development、finishing-a-development-branch… | 升插件至 6.3.0 |
| 自建 | `superpowers-harness-run`、`superpowers-harness`、`superpowers-demand-workflow`、`HARNESS_RULES`、`SUPERPOWERS_RULES`、`.cursorrules` | 改仓库并提交 |

**冲突优先级（强制）：** 用户规则 / `SUPERPOWERS_RULES` / harness-run **高于** 官方 skill 默认落盘路径与「可跳过文档」行为。

**路径覆盖：** 官方若指引写入 `docs/superpowers/specs/` 等扁平路径，必须改写到：

```text
docs/superpowers/{version}/{type}/{模块名}/specs|plans|requirements|archive/
```

## 3. P0 · 官方插件升级（用户侧）

| 项 | 要求 |
|----|------|
| Cursor | Superpowers 插件 → **6.3.0** |
| Claude Code | `superpowers@claude-plugins-official` → **6.3.0** |
| 验收 | 新开会话；bootstrap / SessionStart 无报错；Agent 能加载含三档分类的 brainstorming |

本模块 archive 交付时记录：用户是否已完成升级（是/否/部分）。

## 4. P1 · 需求分析三档（核心）

启动 `/harness` 或 `superpowers-harness-run` 后，在 Step 0 状态查询之后、建目录/写文档之前：

1. **分类**并**口头宣告**档位（轻量 / 标准 / 全量）
2. 允许用户一句话改档
3. 按档走下方分支

映射：

| 本地档位 | 官方 6.3 | 典型场景 |
|----------|----------|----------|
| 轻量 | spike | 可行性、探查、答案为主、产物可丢 |
| 标准 | bounded | 边界清晰的小改（含小 fix / 小改动）；已有代码路径可改 |
| 全量 | architectural | 新能力、多文件、接口/UI、有设计决策 |

### 4.1 轻量

- 可 `create-demand` 建模块，写入 `requirements/`；结论可写入 `archive/`（如 `spike-结论.md`）
- **不强制**完整 `01-dev-spec.md` / `01-dev-plan.md`
- **默认不改**正式业务 `src/`；若必须写探针代码，须标明可丢，且实现前仍须用户确认
- 阶段：可不进入 `READY_TO_DEV`；状态行标明 `档位: 轻量`

### 4.2 标准（收编并扩展原「fix 轻量通道」）

触发不再仅限 `type=fix`，改为满足 **标准档**（描述明确、改动面小、无架构决策）。原 fix 轻量条件作为标准档的充分条件之一。

仍须：

1. 探索（只读）→ 短方案 + 替代一句 → **一次确认（对齐官方「实现前批准」）**
2. 写短 `specs/01-dev-spec.md`（建议 ≤80 行）+ 短 `plans/01-dev-plan.md`（1～2 Task）
3. skill 路由标注（可极简）
4. `harness:check`；改 `src/` 前 `READY_TO_DEV`
5. 交付：一致性自检 + archive（还原度不适用则注明）

暂停点：P1 可与短方案合并为一次；P2 对短 spec 确认可合并或极短；P3 执行方式仍问一次（可默认推荐 Inline）。

### 4.3 全量

- 现有完整链不变：create-demand → brainstorming（读官方 skill，落盘按本地路径）→ writing-plans → skill 路由 → P3 → 开发 → 交付自检 A→B → archive
- UI/Figma 样式对照等本地门禁不变
- P1 / P2 / P3 全开

### 4.4 文档落点

| 文件 | 改动 |
|------|------|
| `.agents/skills/superpowers-harness-run/SKILL.md` | 增加「档位分类」；用三档收编「fix 轻量通道」；状态行含档位 |
| `docs/superpowers/HARNESS_RULES.md` | 增加三档表、路径覆盖、与官方 skill 关系 |
| `docs/superpowers/SUPERPOWERS_RULES.md` | 流程节补充三档；强调禁止扁平路径 + 官方不落仓 |
| `.cursorrules` | 一行：需求分析分档（轻量/标准/全量），入口仍 harness-run |
| `.cursor/skills/` 下对应副本 | 与 `.agents/skills` 源同步（若为 junction 则只改源） |

## 5. P2 · 开发阶段对齐 6.3 SDD 约束

仅在用户选择 **Subagent-Driven** 或 plan 明确走 SDD 时强制；Inline 不强制官方 ledger。

| 约束 | 要求 |
|------|------|
| `Spec:` | plan 头部必须含指向本模块 `specs/01-dev-spec.md` 的链接（已有则强化为硬规则） |
| 禁嵌套子代理 | 实现者/评审者不得再派子代理；仅 harness 控制器派发 |
| 显式模型 | 每次 Task/子代理派发须写明模型（禁止静默继承最贵） |
| 批量 | 同形微任务可在 plan 标 `Batch:`；SDD 时可一次派发 |
| 冲突 | 非灾难冲突可记录裁决后继续；破坏性/不可逆须停人 |
| 官方 SDD 机制 | ledger、单评审双结论、证据重读等 **跟插件内官方 skill**，本地只引用不复制实现 |

`HARNESS_RULES` / harness-run Step C·D 写入上述条文。

## 6. 明确不接入

- Devin / Hermes / Grok / Gemini / Codex 平台专项流程
- 官方「bounded 不写 plan」原样行为
- Visual companion：可选提及，不强制；不作为本迭代必达

## 7. 验收标准

- [x] 规格与需求一致：P0 升级说明 + P1 三档 + P2 SDD 约束均有落点文件
- [x] `superpowers-harness-run` 含档位分类与三档分支；原 fix 轻量被标准档收编
- [x] `HARNESS_RULES` / `SUPERPOWERS_RULES` / `.cursorrules` 已同步职责边界与路径覆盖
- [x] 未引入官方 skill 文件副本进仓库
- [x] 未改业务 `src/`
- [x] 本模块交付 archive 含一致性自检；还原度自检注明不适用
- [x] （用户）Cursor/Claude 插件已升 6.3.0 或 archive 记录未完成原因

## 8. 风险与缓解

| 风险 | 缓解 |
|------|------|
| 官方 brainstorming 仍暗示扁平路径 | harness-run 每步写死本地路径；规则优先级声明 |
| 标准档过宽导致文档过薄 | 标准档仍强制短 spec/plan + READY_TO_DEV |
| 插件未升导致三档语义缺失 | P0 验收项；未升时 Agent 仍按本地三档表执行 |

## 9. 还原度自检

不适用：无 Figma / 非 UI（流程与文档变更）。
