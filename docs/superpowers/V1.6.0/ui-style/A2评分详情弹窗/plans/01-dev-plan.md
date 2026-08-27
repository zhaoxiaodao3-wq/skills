# A2 评分等级详情弹窗 · 执行计划

> **For agentic workers:** 按 Task 顺序执行；每 Task 完成后 lint / 相关单测。  
> **Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 第十章「查看详情」打开 Figma `8674:32751` 一比一弹窗（mock 全量），并优化按钮 hover/active/focus。

**Architecture:** 独立 `ReportA2ScoreDetailDialog`（`el-dialog` + 可滚动 body）；数据来自 `TypeA2Report.scoreDetail` mock；`ReportTypeA2View` 接线 `@detail`；样式复用 `cca-report-tokens.scss`。

**Tech Stack:** Vue 3 · Element Plus · SCSS · TypeScript mock

**档位:** 全量  
**日期:** 2026-08-27  
**P1/P2:** ✅ 已确认

---

## Global Constraints

- Figma `8674:32751` 为 UI SSOT；维度顺序 **五→四→三→二→一→总分**
- 弹窗宽 1000px；内容 padding 40；表宽 920
- 色/字复用 `$cca-brand` / `$cca-gray-*` / `$cca-brand-bg-light`
- **不改** PDF 生成器；PDF 仍 `hideDetailButton`
- 改 `src/` 前须 `READY_TO_DEV` + P3

---

## Skill 路由（待 `--annotate` 写入各 Task）

| Phase | skill | 置信度 |
|-------|-------|--------|
| 门禁 | `superpowers-harness-run` | 高 |
| 弹窗 UI | `figma-design-to-code` | 高 |
| 长内容结构 | `figma-long-page`（参考分段，非整页还原） | 中 |
| 归档 | `superpowers-demand-workflow` | 高 |

---

## Task 1 · 类型 + mock 数据

**文件：**
- `types/classroom-content-analysis-a2-report.ts` — 新增 `A2ScoreDetailDialog` 等类型；`TypeA2Report` 增加 `scoreDetail?`
- `mock/a2-data/score-detail-dialog.ts` — 从 Figma 节点文案提取五维度 + 补偿 + 总分 mock
- `mock/classroom-content-analysis-a2.mock.ts` — 挂载 `scoreDetail`

**验收：**
- [ ] TypeScript 编译通过
- [ ] mock 含 5 维度 + 维度一 compensation + total

> **Skill:** （无强制）— 数据层

---

## Task 2 · 弹窗组件 `ReportA2ScoreDetailDialog.vue`

**新建：** `components/ReportA2ScoreDetailDialog.vue`

**内容：**
- `el-dialog`：width 1000、append-to-body、destroy-on-close
- 顶栏：标题 + 关闭（16px）
- 滚动 body：维度块组件化（同文件内 section）
  - 节标题（蓝竖条）
  - 评分项表（表头 `#F3F9FF` / 字 `#027AFF`）
  - 档位系数表
  - 蓝底小计区
  - 维度一：补偿检查表 + 勾叉 SVG（内联或 assets）
- 总分与等级区 + 绿色徽章

**样式：** scoped SCSS + `cca-report-tokens`；对照 spec §7

**验收：**
- [ ] Storybook/页面内手动打开可见完整长内容
- [ ] 视觉与 Figma 截图对齐（间距/色/字号）

> **Skill:** `figma-design-to-code` — 高

---

## Task 3 · 按钮态 + 接线

**修改：**
- `ReportA2ScoreSummary.vue` — hover / active / focus-visible
- `ReportA2BlockRenderer.vue` — 透传 `@detail`（若未透传）
- `ReportTypeA2View.vue` — `scoreDetailVisible` ref；`@detail` 打开弹窗；传入 `report.scoreDetail`

**验收：**
- [ ] 第十章点击「查看详情」打开弹窗
- [ ] 关闭可用；按钮三态可感知

> **Skill:** （无强制）

---

## Task 4 · 测试 + 门禁 + 归档

**修改：**
- `mock/classroom-content-analysis-a2-structure.spec.ts` — 断言 `scoreDetail` 存在、dimensions.length === 5

**命令：**
```bash
pnpm harness:status -- --match "A2评分详情弹窗"
pnpm harness:check
# vitest 相关 spec
```

**归档：** `archive/A2-score-detail-dialog-delivered.md`

**验收：**
- [ ] 单测通过
- [ ] harness 无本模块阻断项
- [ ] PDF 仍无「查看详情」

> **Skill:** `superpowers-demand-workflow` — 高

---

## 测试计划（手动）

1. 打开 A2 报告 Web 页（`?reportSubType=A2`）
2. 滚至第十章 → 点击「查看详情」
3. 检查五维度顺序、表头色、补偿表、总分区
4. 按钮 hover / 按下 / Tab focus
5. 确认 PDF HTML 无该按钮
