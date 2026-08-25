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

> **门禁关系：** 标准 / 全量须达到 `READY_TO_DEV` 才改 `src/`；轻量默认不改正式 `src/`。

## 4. P2 · Subagent-Driven（SDD）约束

仅在用户选择 **Subagent-Driven** 或 plan 明确走 SDD 时强制；Inline 不强制官方 ledger。

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
create-demand → brainstorming → writing-plans → skill routing 标注 plan → 开发 → 交付自检(A→B) → archive → validate
```

阶段枚举：

| 阶段 | 条件 | 动作 |
|------|------|------|
| `NO_MODULE` | current/ 下无对应模块 | create-demand |
| `NO_SPEC` | 有 requirements，无 specs/01-dev-spec.md | brainstorming |
| `NO_PLAN` | 有 spec，无 plans/01-dev-plan.md | writing-plans |
| `READY_TO_DEV` | 有 spec 且有 plan | 允许改 src/（标准 / 全量） |

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
- 未完成 spec/plan 时主动引导修改 `src/`（宽松模式下用户坚持则警告后继续）
- 未完成适用的 A/B 自检就声称「逻辑已闭环」或「已对齐 Figma」
- 将官方 skill 的 `SKILL.md` 拷贝进仓库（须通过升插件更新）

## 10. 升级路径

1. **Phase 1（当前）**：宽松模式，积累 `.harness/warnings.log`
2. **Phase 2**：启用 `--strict`；fix 类型可配置豁免
3. **Phase 3**：pre-commit 默认 strict
