# A2 评分等级详情弹窗 · 交付归档

**日期:** 2026-08-27  
**Harness:** ui-style/A2评分详情弹窗  
**Figma:** `8674:32751`  
**P3:** Inline

---

## 交付范围

- [x] `ReportA2ScoreDetailDialog.vue` — 1000px 弹窗，五维度 + 补偿 + 总分
- [x] `mock/a2-data/score-detail-dialog.ts` — Figma 全量 mock
- [x] `TypeA2Report.scoreDetail` 类型与 mock 挂载
- [x] `ReportTypeA2View` 接线 `@detail` → 弹窗
- [x] `ReportA2ScoreSummary` 按钮 hover / active / focus-visible
- [x] 结构单测 `scoreDetail` 断言
- [x] PDF 未改动（仍无「查看详情」）

## 关键文件

| 文件 | 说明 |
|------|------|
| `components/ReportA2ScoreDetailDialog.vue` | 弹窗 UI |
| `components/ReportA2ScoreSummary.vue` | 按钮交互态 |
| `components/ReportTypeA2View.vue` | visible 状态 + 弹窗挂载 |
| `components/ReportA2BlockRenderer.vue` | `@detail` 透传 |
| `mock/a2-data/score-detail-dialog.ts` | mock 数据 |
| `types/classroom-content-analysis-a2-report.ts` | 类型定义 |

## 验收

- 第十章「查看详情」→ 打开「评分等级计算」弹窗
- 维度顺序：五 → 四 → 三 → 二 → 一 → 总分与等级
- 维度一含补偿检查表 + 判定
- 按钮三态可感知
