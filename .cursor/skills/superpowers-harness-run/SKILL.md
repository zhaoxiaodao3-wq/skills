---
name: superpowers-harness-run
description: >-
  Superpowers Harness 完整开发流程唯一入口（含 fix）：create-demand → brainstorming（确认）
  → writing-plans（确认）→ 开发 → 归档 → validate。任何改 src/ 的任务必须走本技能，
  且必须经过三次用户确认暂停（P1/P2/P3），fix 也不可跳过。用户说 /harness、修 bug、实现、改页面时必须使用。
  与 superpowers-harness、brainstorming、writing-plans 配合。
---

# Superpowers Harness 完整流程

用户只需描述**要什么**，本技能负责走完整 Harness 工程链路。

**技能源码根目录：** `E:\code\frontend-local\`（`.agents/skills/` 与 `.cursor/skills/` 下副本均从此处维护）。**禁止**只改 `e:\code\frontend\` 的 junction 链接侧而不同步 `frontend-local` 源文件。

**启动时宣告：**「正在使用 superpowers-harness-run 执行 Harness 完整流程。」

## 核心原则（最高优先级）

1. **每一次**改 `src/` 的需求（含 fix、纠正、补充）都走**同一套完整流程**，无「快速通道」可跳过用户确认。
2. **文档与代码不可同轮完成**：未获用户确认前，禁止在同一轮回复里既写 spec/plan 又改 `src/`。
3. **需求变更 ≠ 直接改代码**：用户纠正/补充需求时，先更新 requirements → 重新走确认 → 再开发。

## 强制暂停点（不可跳过）

| # | 时机 | Agent 必须做什么 | 继续条件 |
|---|------|------------------|----------|
| **P1** | 探索代码后、写 spec 前 | 输出推荐方案 + 1 个备选；**末尾明确提问** | 用户回复「确认 / 可以 / 按推荐」等肯定 |
| **P2** | spec 写完后 | 展示 spec 路径与摘要；**末尾写「请 review spec，确认后我继续写 plan」** | 用户明确确认 spec |
| **P3** | plan 写完后 | 展示 plan 路径；**让用户选择执行方式**（Subagent / Inline） | 用户选择执行方式 |

**仅当 P1+P2+P3 均满足后**，才可进入 Step D 改 `src/`。

违反 P1–P3 视为未走 Harness，即使文档已存在也不改代码。

## 何时使用

- 任何会改动 `src/` 的开发类任务
- 用户说「做个需求」「修一下」「实现」「对接」「改页面」
- 用户**没有**显式说 harness，但任务属于开发范畴
- 用户希望「一条对话走完全流程」

## 不要误触发

- 纯问答、代码 review、解释现有逻辑（只读）
- 用户明确说「跳过文档直接改」→ **仍须 P1 方案确认**；可缩短文档，**不可跳过 P2/P3**

## fix 类型说明（不是捷径）

fix 只意味着**文档可更短**，**不意味着**可跳过流程或暂停点：

| 可精简 | 不可省略 |
|--------|----------|
| spec ≤80 行 | P1 方案确认 |
| plan 1～2 个 Task | P2 spec 确认 |
| brainstorming 一轮呈现 | P3 执行方式选择 |
| | requirements / spec / plan / archive / validate |

## 需求变更与纠正（DELIVERED 或开发中）

用户在同一模块上纠正、补充需求（如「其实主要是本地开发问题」）：

1. 新增 `{模块}/requirements/02-xxx.md`（递增编号），**不覆盖** 01
2. 回到 **P1**：说明变更对 spec 的影响，等用户确认
3. 更新 spec / plan，再走 **P2 → P3**
4. 此前已写代码若与新区间冲突，**先说明差异**，用户确认后再改

**禁止**听到纠正后直接 patch `src/`。

## 执行前必读

1. `docs/superpowers/HARNESS_RULES.md`
2. `docs/superpowers/SUPERPOWERS_RULES.md`

## Step 0：机械阶段查询（每次启动必做）

```bash
pnpm harness:status -- --match "<模块名关键词或路径片段>"
```

- 无匹配 → `NO_MODULE`，从 Step A 开始
- 有匹配 → 以 CLI 输出的 `阶段` / `下一步` 为准，**不要凭印象猜**
- 每次回复开头输出状态行：

  ```
  [Harness] fix/模块名 | 阶段: NO_SPEC | 下一步: P1 方案确认（等待用户）
  ```

## ~~fix 轻量通道~~（已废弃）

原「fix 轻量通道」易误解为可跳过确认。**一律按上文「fix 类型说明」执行。**

## 从用户消息解析

| 字段 | 推断规则 |
|------|----------|
| **分类 type** | 新页面/能力→`feature`；UI/Figma→`ui-style`；接口/字段→`api-adapter`；bug/小修→`fix` |
| **模块名** | 用户给的名称；或从 `src/` 路径推断；2～20 字中文 |
| **需求摘要** | 写入 `requirements/01-原始需求.md` 的正文 |
| **关联路径** | 用户提到的组件/页面路径，用于 fuzzy 匹配已有模块 |

## 阶段判断

扫描 `docs/superpowers/` 下当前版本目录（读 `current-version.txt` 或 `v*` 最新）：

```
docs/superpowers/vX.X/{type}/{模块名}/
  requirements/
  specs/01-dev-spec.md
  plans/01-dev-plan.md
  archive/
```

匹配优先级：模块名精确 → 路径 fuzzy → 无匹配则新需求。

| 阶段 | 条件 | 下一步 |
|------|------|--------|
| `NO_MODULE` | 无对应目录 | Step A：create-demand |
| `NO_SPEC` | 无 spec | Step B：brainstorming |
| `NO_PLAN` | 无 plan | Step C：writing-plans |
| `READY_TO_DEV` | spec + plan 齐全 | Step D：开发 |
| `DELIVERED` | 已有 archive 且需求有变 | 新 requirements + 从 P1 重来 |

**改 `src/` 前必须是 `READY_TO_DEV` 且 P1/P2/P3 均已确认。**

---

## Step A：建模块（NO_MODULE）

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/create-demand.ps1 -Type <type> -Name "<模块名>"
```

- 将用户需求写入 `{模块}/requirements/01-原始需求.md`
- 回报创建的目录路径
- 继续 Step B（**停在 P1，不要写 spec**）

## Step B：brainstorming（NO_SPEC）

**必须读取并遵循 `brainstorming` 技能**，不得跳过设计确认直接写代码。

1. 探索项目上下文（相关 `src/`、已有 docs）
2. 一次只问一个澄清问题（必要时）
3. 提出 2～3 方案 + 推荐
4. **P1 暂停**：等用户确认方案（见「强制暂停点」）
5. 用户确认后，写 `{模块}/specs/01-dev-spec.md`，头部：

   ```markdown
   **Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
   ```

6. spec 自检（无 TBD、无矛盾）
7. **UI/Figma 样式对照（READY_TO_DEV 前必做）：**
   - 类型为 `ui-style`，或类型为 `feature` 且 `requirements/` 中含 `figma.com` 链接 → spec **必须**含 `## 样式对照（Figma）`（或同义标题）
   - 表格至少含：字号/字重/色、间距、圆角/边框、关键尺寸；并注明 Figma 节点
   - 须用 Figma MCP / `get_design_context` 或截图取值，**禁止**凭印象填表
   - 缺此节时 `harness:check` 会 ⚠️ `SPEC_MISSING_FIGMA_STYLE_TABLE`；Agent 不得进入 READY_TO_DEV
8. **P2 暂停**：请用户 review spec，确认后再 Step C

## Step C：writing-plans（NO_PLAN）

**必须读取并遵循 `writing-plans` 技能。**

1. 基于 spec 写 `{模块}/plans/01-dev-plan.md`
2. plan 头部含 `**Spec:**` 链接
3. 任务粒度 2～5 分钟，含具体文件路径与代码片段
4. **P3 暂停**：提供两种执行方式让用户选：
   - Subagent-Driven（推荐）
   - Inline Execution
5. **用户选定后**才可 Step D

## Step D：开发（READY_TO_DEV）

**改 `src/` 之前：**

```bash
pnpm harness:status -- --match "<模块名>"
pnpm harness:check
```

- 有警告则汇报；本模块相关警告须先修复
- 宽松模式下其他模块历史警告可记录但不阻断

**开发期间：**

- 严格按 plan 执行；连续执行，仅在 plan 规定的确认点暂停
- 每完成一个 Task 做 lint / 相关测试
- **禁止**扩大 scope（不顺手重构无关代码）

**开发完成后 → Step E**

## Step E：Harness 交付收尾

**顺序强制：先 A 一致性自检 → 再 B 还原度自检（适用时）→ 写 archive → validate → 方可报 DELIVERED。**

禁止在未完成适用自检的情况下声称「已对齐 Figma」或「逻辑已闭环」。

### E.1 A · 一致性自检（全部模块类型）

写 archive **之前**，逐项检查（无关项标 **N/A** 并写原因）：

| 检查项 | 含义 |
|--------|------|
| 空态 vs 有数据 | Container/View 空态 hardcode 与 adapter/真数据路径是否一致 |
| 常量 / mock / 真数据 | 维度常量、mock、接口映射文案/数值是否同源 |
| 多入口 | A/B 类、列表/详情等是否只改一侧 |
| 失败 / 缺省 | `--`、0、隐藏与有数据语义是否合理 |

### E.2 B · 还原度自检（条件适用）

**适用：** 类型为 `ui-style`，或类型为 `feature` 且 `requirements/` 含 `figma.com`。

**不适用：** archive 的 `## 还原度自检` 写一行「不适用：无 Figma / 非 UI」。

适用时须对照 spec 的 `## 样式对照（Figma）` 与实现，记录：Figma 节点、对照方式、偏差清单、结论（可交付 / 需返工）。

### E.3 写 archive 并 validate

1. 勾选 `specs/01-dev-spec.md` 验收项
2. 写 `{模块}/archive/{模块名}-delivered.md`，使用模板（**必须含**下方两个强制小节）：

```markdown
# {模块名} · 交付归档

**归档类型：** {type} 交付快照
**归档日期：** {YYYY-MM-DD}
**版本：** {current version}
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

（1～3 句说明为什么改）

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/...` |

## 验收结果

- [x] （对应 spec 第 6 节各项）

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 / N/A | … |
| 常量/mock/真数据 | 通过 / N/A | … |
| 多入口 | 通过 / N/A | … |
| 失败/缺省 | 通过 / N/A | … |

## 还原度自检

（适用 ui-style / 带 Figma 的 feature；否则写：不适用：无 Figma / 非 UI）
- Figma 节点：…
- 对照方式：…
- 偏差清单：无关键偏差 / …
- 结论：可交付 / 需返工

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
```

3. 再跑：

   ```bash
   pnpm harness:check
   ```

4. 再跑 `pnpm harness:status`，确认阶段为 `DELIVERED`
5. 汇报 Harness 闭环清单（见下方）

**用户未要求时不要自动 commit。**

---

## Harness 闭环清单（交付时必报）

```
- [ ] 模块目录四层齐全
- [ ] requirements / spec / plan 链接正确
- [ ] 改 src/ 前 validate-harness 已跑
- [ ] spec 验收项已勾选
- [ ] 一致性自检已完成并写入 archive
- [ ] 还原度自检已完成或已注明不适用
- [ ] archive 交付快照已写
- [ ] commit 前 validate-harness 已跑
- [ ] harness:check 无本模块 ARCHIVE_MISSING_* / SPEC_MISSING_FIGMA_STYLE_TABLE 警告（否则不得报 DELIVERED）
```

## 子技能调用顺序

```
superpowers-harness-run（本技能，总编排）
  ├─ superpowers-harness（阶段判断、门禁规则）
  ├─ superpowers-demand-workflow（目录规范）
  ├─ brainstorming（spec）
  ├─ writing-plans（plan）
  └─ executing-plans 或 subagent-driven-development（开发）
```

**禁止**在未完成 spec/plan **且未经 P1/P2/P3 用户确认** 时调用 executing-plans 或直接改 `src/`。

## Agent 禁止事项（自查）

- ❌ 探索完代码后直接写 spec + plan + 改 `src/`（同一条回复）
- ❌ 用户纠正需求后直接改代码
- ❌ 以「fix 很简单」为由跳过 P1/P2/P3
- ❌ 用户未选执行方式就开始 Step D
- ❌ 模块已 DELIVERED 但需求变了，不新建 requirements 直接 patch

## 用户最简用法

用户只需：

```
语言可理解度组件缺省态 gauge 不要显示 0.0
```

或附加本技能：

```
/harness 语言可理解度 gauge 缺省态显示整数 0
```

Agent 自动推断 `fix` + 模块名 + 走全流程。

## 分类默认值

| 用户说法 | type |
|----------|------|
| 修 bug、修复、兼容、显示不对 | `fix` |
| 新页面、新功能、新增 | `feature` |
| Figma、UI 还原、样式 | `ui-style` |
| 接口、字段、对接、adapter | `api-adapter` |

不确定时问用户一次，不要猜测多次。

## 与 superpowers-harness 的分工

| 技能 | 职责 |
|------|------|
| `superpowers-harness` | 门禁规则、validate-harness、阶段枚举 |
| `superpowers-harness-run` | **端到端编排**，替用户串联全部步骤 |

两者同时可用：本技能内含 harness 门禁，无需用户再提「按 harness 流程」。
