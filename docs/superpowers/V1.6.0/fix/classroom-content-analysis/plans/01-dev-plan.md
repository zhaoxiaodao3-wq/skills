# A2 报告 10.1「查看详情」弹窗 × evaluationResult 字段对接（Phase 5）

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 实施步骤

### Task 1: 引入 mapper 依赖（import + 常量）

- **文件**：`src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.ts`
- **改动**：
  - 复用现有 `TIER_ROWS_4PT` / `TIER_ROWS_3PT` / `TIER_ROWS_KNOWLEDGE`（从 `mock/a2-data/score-detail-dialog.ts` 引入）
  - 复用现有 `displayOrDash` / `formatA2DurationDisplay` / `buildDurationCoefficientHint`
- **预估**：3 行 import

### Task 2: 实现文案模板工具函数（5 个）

- **文件**：同上
- **改动**：
  - `buildSubtotalLine(dim, dimName): string` — 拼 4.1 小计
  - `buildGradeLine(dimName, finalGrade): string` — 拼 4.2 档位
  - `buildScoreLine(dimName, weight, usedCoefficient, dimensionScore): string` — 拼 4.3 维度得分
  - `buildJudgmentLabel(compensationEffective): string` — 拼 4.4 label
  - `buildUpgradeNote(compensationEffective, finalGrade): string | undefined` — 拼 4.4 upgradeNote
- **预估**：~60 行（含 JSDoc）

### Task 3: 实现档位常量选择器

- **文件**：同上
- **改动**：
  - `selectTierRows(fullScore, dimensionCode, dimName): A2ScoreDetailDimension['tierRows']` — 按 fullScore 选 4PT/3PT/KNOWLEDGE
- **预估**：~15 行

### Task 4: 实现 `mapEvaluationResultToScoreDetail` 主函数

- **文件**：同上
- **改动**：
  - 输入：`er?: A2EvaluationResultVO | null`
  - 输出：`A2ScoreDetailDialog`
  - 处理：
    - `dimensions[]` 循环：每个维度生成 `title` / `scoreRows` / `tierRows` / `summaryLines` / `compensation?`
    - 5 个维度都判断 `compensationCheck` 是否非空 → 生成 `compensation` 对象
    - `total.rows[]` 4 行（总分小计 / 课堂时长 / 最终总分 / 对应等级）
  - 兜底：`er` 为 null/undefined 时返回 `A2_SCORE_DETAIL_DIALOG_MOCK`
- **预估**：~80 行

### Task 5: 替换两处 `scoreDetail` 赋值

- **文件**：同上
- **改动**：
  - line 1572：`scoreDetail: A2_SCORE_DETAIL_DIALOG_MOCK,` → `scoreDetail: mapEvaluationResultToScoreDetail(vo.evaluationResult),`
  - line 1591：同上
- **预估**：2 行

### Task 6: tsc 验证

- 命令：`pnpm exec tsc --noEmit`
- 预期：0 错误

### Task 7: 跑既有 mapper spec

- 命令：`pnpm exec vitest run src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.spec.ts`
- 预期：通过
- **如果新增 mapper 函数有覆盖价值，追加 1 个最小 spec**：测试 `mapEvaluationResultToScoreDetail(null)` 返回 mock；测试 `(mock er)` 返回的 dimensions.length === 5 且第 1 个维度含 compensation

### Task 8: archive 追加 Phase 5 段

- **文件**：`docs/superpowers/V1.6.0/fix/classroom-content-analysis/archive/classroom-content-analysis-delivered.md`
- **内容**：
  - 改动摘要（1 句）
  - 改动文件清单
  - 验收勾选（对应 spec 第 8 节）
  - 一致性自检（4 项）
  - Harness 闭环

## 风险与回退

- **文案 format 偏差**：5 个模板规则参考 mock，但实际可能有空格、加粗等细微差异。**回退**：调整模板
- **mock 留作 fallback**：`er` 为 null 时返回原 mock，行为不变
- **TypeScript 编译错误**：mapper 输出类型与 `A2ScoreDetailDialog` 不匹配。**回退**：调整 mapper 字段类型

## 涉及文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.ts` |
| 改 | `docs/superpowers/V1.6.0/fix/classroom-content-analysis/archive/classroom-content-analysis-delivered.md`（追加）|

不涉及：
- mock 文件
- 弹窗组件
- 后端
- 路由
- 样式

## Skill 路由标注（Mode A）

**机器评测**：`node .agents/routing/router.mjs --annotate` 因工具 CLI 输出捕获问题（router 内部 `console.log` 未在 PowerShell 管道显示）返回沉默；改用 `import('router.mjs').loadGraph(...)` 手工加载图谱（13 分类、14 skill，`globalConfig.minConfidence=0.7, maxSkillsPerPlan=5, autoActivateRiskLevel=low`），逐 skill 评估必要性：

| Skill | 类别 | 风险 | 置信度（人工评估） | 命中？ |
|-------|------|------|-------------------|--------|
| `superpowers-harness-run` | cat-dev-superpowers | low | 0.0 | ❌ 本任务在 harness 流程内，不再次激活自身 |
| `superpowers-harness` | cat-dev-superpowers | low | 0.0 | ❌ 同上 |
| `superpowers-demand-workflow` | cat-dev-superpowers | low | 0.0 | ❌ 目录已建，不重新走 |
| `skill-creator` | cat-dev-misc | medium | 0.0 | ❌ 不创建新 skill |
| `frontend-design` | cat-fe-general | low | 0.1 | ❌ 不做 UI 设计 |
| `tailwind-design-system` | cat-fe-style | low | 0.0 | ❌ 不涉及样式 |
| `improve-animations` | cat-fe-style | low | 0.0 | ❌ 不涉及动画 |
| `tailwindcss-animations` | cat-fe-style | low | 0.0 | ❌ 不涉及动画 |
| `echarts` | cat-fe-viz | low | 0.0 | ❌ 不涉及图表 |
| `accessibility` | cat-fe-a11y | low | 0.0 | ❌ 弹窗 a11y 已就绪，不动 |
| `figma-long-page` | cat-fe-design | low | 0.0 | ❌ 不涉及 figma |
| `ccar-pdf-static-html` | cat-fe-design | medium | 0.0 | ❌ 不涉及 PDF 模板 |
| `clone-website` | cat-fe-clone | medium | 0.0 | ❌ 不复刻网站 |
| `阿斯顿` | cat-doc | low | 0.0 | ❌ 不做文档处理 |

**人工复核结论**：本 plan 任务**不需要 skill 标注**——纯 TypeScript mapper 改造 + 字符串模板拼接，无 UI / 可视化 / figma / 样式 / 动画 / a11y 涉及。所有 skill 的适用条件都不命中。
