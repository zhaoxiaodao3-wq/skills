# Harness 交付自检门禁 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **甲**）：在 HARNESS_RULES / harness-run / archive 模板中强制「一致性自检」与（适用时）「还原度自检」；`harness:check` 对缺失小节发出 ⚠️，宽松模式不阻断 git。

## 1. 目标

1. 交付前强制做多路径逻辑一致性自检，避免空态/有数据等半截修复。
2. UI/Figma 类需求：spec 阶段写样式对照表，交付前写还原度自检，提升第一遍还原度。
3. 机械层只校验「章节是否存在」，不解析表格内容（半硬）。

## 2. 流程位置

```
开发完成
  → A 一致性自检（全部模块）
  → B 还原度自检（适用时）
  → 勾选 spec 验收
  → 写 archive（含强制小节）
  → pnpm harness:check
  → 报 DELIVERED
```

禁止在未完成适用自检的情况下声称「已对齐 Figma」或「逻辑已闭环」。

## 3. A · 一致性自检（全部类型）

### 3.1 Agent 清单（harness-run Step E）

涉及文案、维度名、默认值、展示映射时必须检查（无关标 N/A）：

| 检查项 | 含义 |
|--------|------|
| 空态 vs 有数据 | Container/View 空态 hardcode 与 adapter/真数据路径是否一致 |
| 常量 / mock / 真数据 | 维度常量、mock、接口映射文案/数值是否同源 |
| 多入口 | A/B 类、列表/详情等是否只改一侧 |
| 失败 / 缺省 | `--`、0、隐藏与有数据语义是否合理 |

### 3.2 archive 强制小节

交付快照必须含二级标题：`## 一致性自检`，表格含上述检查项及「通过 / N/A」与证据。

### 3.3 harness:check

若模块存在 `archive/*-delivered.md` 但正文无 `## 一致性自检` → ⚠️ 警告码建议：`ARCHIVE_MISSING_CONSISTENCY_CHECK`。

## 4. B · 设计稿还原（条件适用）

### 4.1 适用

- 类型为 `ui-style`，或
- 类型为 `feature` 且 `requirements/` 中出现 Figma 链接（`figma.com`）

不适用：archive 写 `## 还原度自检` + 一行「不适用：无 Figma / 非 UI」。

### 4.2 Spec 阶段 — 样式对照表

`specs/01-dev-spec.md` 必须含 `## 样式对照（Figma）`（或同义标题），至少含：字号/字重/色、间距、圆角/边框、关键尺寸；并注明 Figma 节点。

开发前须用 Figma MCP/`get_design_context` 或截图取值，禁止凭印象填表。

`ui-style` 模块若有 spec 但无样式对照节 → ⚠️ 建议码：`SPEC_MISSING_FIGMA_STYLE_TABLE`。

### 4.3 交付前 — 还原度自检

适用模块的 delivered archive 必须含 `## 还原度自检`，包括：节点、对照方式、偏差清单（无则写无关键偏差）、结论（可交付/需返工）。

缺则 ⚠️：`ARCHIVE_MISSING_FIDELITY_CHECK`。

### 4.4 顺序

同一交付：先完成 A，再完成 B，再 archive。

## 5. 改动文件（实现本规格时）

| 操作 | 路径 |
|------|------|
| 改 | `docs/superpowers/HARNESS_RULES.md`（增加交付自检章节） |
| 改 | `.agents/skills/superpowers-harness-run/SKILL.md`（Step E 强制双自检） |
| 改 | `.cursor/skills/.../superpowers-harness*`（若有副本则同步要点） |
| 改 | `scripts/harness/validators/...`（archive/spec 章节存在性检查） |
| 改 | archive 模板说明（写在 HARNESS_RULES 或 GUIDE） |

**不改：** 业务 `src/`（本需求是流程基建）。

## 6. 非目标（本期不做）

- 自动对比空态字符串与常量的 AST/grep 强校验
- 像素级自动 diff、阻断 commit（仍为宽松 ⚠️）
- Visual Companion 强制化

## 7. 验收

- [x] HARNESS_RULES / harness-run 写明 A→B 与适用范围
- [x] archive 缺「一致性自检」时 harness:check 出 ⚠️（staged）
- [x] 适用 UI 模块缺「还原度自检」或 ui-style spec 缺样式对照时出 ⚠️（staged）
- [x] 文档明确：Agent 未补全不得报 DELIVERED
- [x] 外链 skill 源 `frontend-local` 的 `.agents` / `.cursor` 均已更新
