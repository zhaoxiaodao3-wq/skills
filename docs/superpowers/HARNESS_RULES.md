# Harness 执行规则

> **强制**：开发类任务前须同时读取本文件与 `SUPERPOWERS_RULES.md`。  
> 本文件**叠加** Superpowers 规则，**不替代**它。

## 1. 当前模式：宽松

| 场景 | Agent 层 | 机械层 | Git hook |
|------|----------|--------|----------|
| 无模块就改 `src/` | 强制走 create-demand | ⚠️ 警告 | 不阻断 |
| 无 spec/plan 就改 `src/` | 强制走 brainstorming/plans | ⚠️ 警告 | 不阻断 |
| 写入旧扁平路径 | 禁止 | ⚠️ 警告 | 不阻断 |
| spec/plan 缺头部链接 | 提示补全 | ⚠️ 警告 | 不阻断 |
| 交付快照缺「一致性自检」 | 禁止报 DELIVERED | ⚠️ `ARCHIVE_MISSING_CONSISTENCY_CHECK` | 不阻断 |
| 适用 UI 缺「还原度自检」 | 禁止报 DELIVERED | ⚠️ `ARCHIVE_MISSING_FIDELITY_CHECK` | 不阻断 |
| ui-style spec 缺样式对照 | 禁止进开发结论闭环 | ⚠️ `SPEC_MISSING_FIGMA_STYLE_TABLE` | 不阻断 |

自查：

```bash
pnpm harness:status              # 查询模块阶段（对话中推荐）
pnpm harness:check                 # 校验 staged + 文档结构
pnpm harness:strict              # 严格模式
node scripts/harness/validate-harness.mjs
node scripts/harness/status.mjs --match "<模块名>"
```

严格模式（Phase 2）：`pnpm harness:strict`

## 2. 官方 skill 与自建 Harness

本仓库工作流 = **官方 skill（插件）** + **自建 Harness（仓库）**。

| 层 | 内容 | 更新方式 |
|----|------|----------|
| 官方 skill | brainstorming、writing-plans、subagent-driven-development、finishing-a-development-branch… | **升插件**至对应版本；**不**把官方 `SKILL.md` 拷进仓库 |
| 自建 | `superpowers-harness-run`、`superpowers-harness`、`superpowers-demand-workflow`、`HARNESS_RULES`、`SUPERPOWERS_RULES`、`.cursorrules` | 改仓库并提交 |

**冲突优先级（强制）：** 用户规则 / `SUPERPOWERS_RULES` / harness-run **高于** 官方 skill 默认落盘路径与「可跳过文档」行为。

### 2.1 路径覆盖

官方若指引写入 `docs/superpowers/specs/` 等扁平路径，必须改写到：

```text
docs/superpowers/{version}/{type}/{模块名}/specs|plans|requirements|archive/
```

（`current` 解析见 `SUPERPOWERS_RULES.md` §1。）

## 3. 需求分析三档

启动 `/harness` 或 `superpowers-harness-run` 后，在建目录 / 写文档之前须**分类并口头宣告**档位；允许用户一句话改档。

| 本地档位 | 官方 6.3 | 典型场景 | 与阶段门禁 |
|----------|----------|----------|------------|
| 轻量 | spike | 可行性、探查、答案为主、产物可丢 | 可不进 `READY_TO_DEV`；**默认不改**正式业务 `src/`（探针须标明可丢且先确认） |
| 标准 | bounded | 边界清晰的小改（含小 fix）；已有代码路径可改 | 须短 spec/plan + skill 标注；**改 `src/` 前须 `READY_TO_DEV`** |
| 全量 | architectural | 新能力、多文件、接口/UI、有设计决策 | 完整链 + P1/P2/P3；**改 `src/` 前须 `READY_TO_DEV`** |

> **门禁关系：** 标准 / 全量须达到 `READY_TO_DEV` 才改实现文件；轻量默认不改正式实现。

## 3.1 暂停点边界（强制 · 防「先改代码后补文档」）

> **Agent 层硬门禁**（与 git hook 是否宽松无关）：违反则本回合视为流程失败，须停手并复盘，不得继续改实现或报 DELIVERED。

### 什么算「实现」

下列任一操作都算进入开发，**必须先满足 §5 `READY_TO_DEV` + 用户 P3 放行**：

- 改本仓 `src/`、样式、测试中的业务断言
- 改外链/旁路工程中的业务产物（如 PDF/HTML 模板、`lessonTemplates`、后端 VO 接线等）——**不因「只改 HTML / 只改模板」而豁免文档门禁**

下列**不算**实现（可在 READY_TO_DEV 前做）：只读探查、写/改 `docs/superpowers/.../{requirements,specs,plans}`、跑 `harness:status` / `router --annotate`、口头方案。

### P1 / P2 / P3 分别是什么

| 暂停点 | 用户在确认什么 | **不**等于 |
|--------|----------------|------------|
| **P1** | 方案 / 设计方向（可含收窄范围、改字段规则） | ≠ 可以写 spec 后立刻改代码；≠ 可以跳过 plan |
| **P2** | 已落盘的 `specs/01-dev-spec.md`（短 spec 也须明示确认） | ≠ 可以开始改实现 |
| **P3** | 执行方式（Inline / Subagent-Driven） | 仅此之后才允许改实现 |

### 明确禁止的误判

| 用户说法（示例） | 正确理解 | 错误理解 |
|------------------|----------|----------|
| 「只改 HTML / 只改模板 / 字段跟 web 一致」 | **P1 方案修订** → 更新 requirements/spec，**停**，再要 P2/P3 | 当成可直接改文件 |
| 「确认」「方案 OK」「可以」 | 默认只确认**当前停在的那一档**（P1 或 P2）；若未点名 P3，**仍须问 P3** | 当成 P1+P2+P3 一次性放行 |
| 「帮我操作」「直接改」 | 仍走完整暂停点；用户坚持跳过则按宽松模式**警告**后继续 | 静默跳过文档 |

### 强制顺序（标准 / 全量）

```
① 只读探查 + P1 方案（对话）     ← 禁止改实现
② create-demand + requirements
③ 写 specs/01-dev-spec.md → P2   ← 禁止改实现
④ 写 plans/01-dev-plan.md
⑤ router --annotate → 写入 plan
⑥ P3 执行方式确认
⑦ harness:status 为 READY_TO_DEV
⑧ 改实现文件
⑨ 交付自检 A→B → archive → validate
```

**同回合禁令：**

1. **禁止**在同一助手回合内：先改实现文件，再补写 requirements/spec/plan  
2. **禁止**在同一助手回合内：首次改实现 + 写 `*-delivered.md` 并报 DELIVERED（须先完成实现与自检，再单独收尾或明确分步）  
3. **禁止**用官方 brainstorming 的 Bounded「对话短设计、不写 spec」绕过本仓库 Harness：本地标准/全量**仍须**短 spec/plan 落盘  

### 官方 Bounded vs 本地标准档

| | 官方 brainstorming Bounded | 本仓库 Harness 标准档 |
|--|---------------------------|----------------------|
| 设计形态 | 可在对话给短设计 | 短设计 = P1，确认后**仍须**落盘 spec/plan |
| 实现门禁 | 设计获批后可实现 | **仅** P2+P3 + `READY_TO_DEV` 后可实现 |

**冲突时以本文件 + harness-run 为准**（见 §2）。

## 4. Subagent-Driven（SDD）约束

> 仅在 **P3 选择 Subagent-Driven** 或 plan 明确走 SDD 时强制；Inline 不强制官方 ledger。

| 约束 | 要求 |
|------|------|
| `Spec:` | plan 头部必须含指向本模块 `specs/01-dev-spec.md` 的链接（硬规则） |
| 禁嵌套子代理 | 实现者 / 评审者不得再派子代理；仅 harness 控制器派发 |
| 显式模型 | 每次 Task / 子代理派发须写明模型（禁止静默继承最贵） |
| 批量 | 同形微任务可在 plan 标 `Batch:`；SDD 时可一次派发 |
| 冲突 | 非灾难冲突可记录裁决后继续；破坏性 / 不可逆须停人 |
| 官方 SDD 机制 | ledger、单评审双结论、证据重读等 **跟插件内官方 skill**，本地只引用不复制实现 |

## 5. 阶段门禁

推荐顺序：

```
create-demand → P1 → spec(P2) → plan → skill routing → P3 → READY_TO_DEV → 开发 → 交付自检(A→B) → archive → validate
```

> 细则与「何谓实现 / 禁止先改后补文档」见 **§3.1**。

阶段枚举：

| 阶段 | 条件 | 动作 |
|------|------|------|
| `NO_MODULE` | current/ 下无对应模块 | create-demand |
| `NO_SPEC` | 有 requirements，无 specs/01-dev-spec.md | brainstorming → **停在 P2** |
| `NO_PLAN` | 有 spec，无 plans/01-dev-plan.md | writing-plans + annotate → **停在 P3** |
| `READY_TO_DEV` | 有 spec 且有 plan | **仅在 P3 已确认后**允许改实现文件（标准 / 全量） |

## 6. 交付自检门禁（A 一致性 / B 还原度）

> 技能源码在外链目录 `frontend-local`（`frontend` 下 `.agents/skills`、`.cursor/skills` 指向该处）。改流程须同步改 **外链 skill**，不要只改 junction 表象路径。

### 6.1 顺序（强制）

写 archive / 报 `DELIVERED` 之前：

1. **A 一致性自检**（全部 `feature` / `ui-style` / `api-adapter` / `fix`）
2. **B 还原度自检**（仅 `ui-style`，或 `feature` 且 requirements 含 Figma）；否则 archive 注明「还原度自检：不适用」
3. 勾选 spec 验收 → 写 archive（含强制小节）→ `pnpm harness:check`

### 6.2 A · 一致性自检

交付前检查（无关项标 N/A）：空态 vs 有数据；常量/mock/真数据；多入口；失败/缺省。

archive 必须含二级标题：`## 一致性自检`（含结果表与证据）。

### 6.3 B · 还原度自检

**Spec 阶段（适用模块）：** `specs/01-dev-spec.md` 须含 `## 样式对照`（或「样式对照（Figma）」），写明节点与关键 token（字号/色/间距/圆角等）；须对照 Figma MCP/截图，禁止凭印象。

**交付阶段（适用模块）：** archive 须含 `## 还原度自检`（节点、对照方式、偏差清单、结论）。非适用写「不适用：无 Figma / 非 UI」。

### 6.4 archive 模板（交付快照必含章节）

```markdown
## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 / N/A | … |
| 常量/mock/真数据 | 通过 / N/A | … |
| 多入口 | 通过 / N/A | … |
| 失败/缺省 | 通过 / N/A | … |

## 还原度自检

不适用：无 Figma / 非 UI
（若适用则改为：Figma 节点 / 对照方式 / 偏差清单 / 结论）
```

### 6.5 机械层说明

`pnpm harness:check` 对 **staged** 的 `*-delivered.md` / 适用 `01-dev-spec.md` 检查上述标题是否存在（不解析表格内容）。缺则 ⚠️，宽松模式不阻断 git；**Agent 层仍视为未闭环，须补全后再报 DELIVERED**。

## 7. 技能调用顺序

| 阶段 | 技能 |
|------|------|
| **开发类任务入口（推荐）** | `superpowers-harness-run` |
| 门禁判断 | `superpowers-harness` |
| 建目录 | `superpowers-demand-workflow` |
| 写 spec | `brainstorming` |
| 写 plan | `writing-plans` |
| **plan 内 skill 标注** | 读 `.agents/routing/SKILL_ROUTING.md` + `router.mjs --annotate`（见 §8） |
| 执行开发 | `executing-plans` 或按 plan 开发（遵循 plan 内 skill 标注） |

## 8. Skill 路由（Mode A · Superpowers 流程内）

> 权威路由图：`.agents/routing/SKILL_ROUTING.md`（机器块 JSON + 人类说明）  
> 可视化编辑：`.agents/routing/panel/`（可选，非执行依赖）

**触发时机：** `writing-plans` 写完 `plans/01-dev-plan.md` 之后、`READY_TO_DEV` 之前（Harness Step C 收尾）。

**Agent 必做：**

1. 阅读 `SKILL_ROUTING.md` 使用说明与 `globalConfig`（`maxSkillsPerPlan` / `minConfidence` / `autoActivateRiskLevel`）
2. 对 plan 中**每个 Task** 做必要性测评：结合 Task 描述 + 各 skill 的 `applicableConditions` / `unsuitableConditions`
3. 运行机械辅助（输出建议 skill 与置信度）：

   ```bash
   node .agents/routing/router.mjs --annotate docs/superpowers/current/{type}/{模块}/plans/01-dev-plan.md
   ```

4. 将 CLI 结果（及人工复核结论）写入 plan 各 Task 下，例如：

   ```markdown
   ### Task 2: 实现 gauge 缺省态

   > **Skill:** echarts · 置信度 0.85 · 自动激活
   > **理由:** 步骤含图表缺省态展示
   ```

5. **Step D 开发**时：读取 Task 内标注，**必须先读并遵循**对应 skill；`riskLevel: high` 或标注「需人工确认」时暂停确认

**Mode B（不走 Superpowers 流程）：** 自由文本匹配 triggers：

```bash
node .agents/routing/router.mjs "任务描述"
node .agents/routing/router.mjs --list      # 列出路由图 skill
node .agents/routing/router.mjs --validate  # 校验 SKILL_ROUTING.md 机器块
```

**维护：** 新增/调整 skill 时更新 `SKILL_ROUTING.md` 机器块；Harness bootstrap 会幂等安装 `.agents/routing/`。

## 9. 禁止事项

- 写入 `docs/superpowers/specs/`、`plans/`、`archive/`、`reports/` 等旧扁平路径
- **先改实现、后补** requirements/spec/plan（含「只改 HTML/模板」）
- 将「确认 / 方案 OK / 只改某某」误判为 P2+P3 已放行
- 未完成 spec/plan / P3 时主动引导修改实现文件（宽松模式下用户坚持则**警告**后继续）
- 未完成适用的 A/B 自检就声称「逻辑已闭环」或「已对齐 Figma」
- 将官方 skill 的 `SKILL.md` 拷贝进仓库（须通过升插件更新）
- 用官方 Bounded「对话短设计即可实现」绕过本仓库短 spec/plan 落盘要求

## 10. 升级路径

1. **Phase 1（当前）**：宽松模式，积累 `.harness/warnings.log`
2. **Phase 2**：启用 `--strict`；fix 类型可配置豁免
3. **Phase 3**：pre-commit 默认 strict
