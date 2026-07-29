# 报告预览 Tab 顺序调整 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：调整 `buildReportPreviewMenu` 子项顺序。

## 1. 目标

「报告预览与下载」下 Tab（含 mergeLabel「AI」后展示名）顺序为：

1. AI教学分析报告（仅 A/B）
2. AI课堂实录报告
3. AI课堂分析报告

## 2. 改动

**文件：** `src/pages/analysis-web/ai-teaching-diagnosis.vue`

**函数：** `buildReportPreviewMenu`

```ts
function buildReportPreviewMenu(reportCategory: AnalysisReportCategory) {
  const children = []
  if (reportCategory === 'A' || reportCategory === 'B') {
    children.push({
      label: '教学分析报告',
      path: '/analysis-web/ai-teaching-diagnosis/report/ai-teaching-analysis-report',
      mergeLabel: 'AI',
    })
  }
  children.push(
    {
      label: '课堂实录报告',
      path: '.../ai-classroom-record-report',
      mergeLabel: 'AI',
    },
    {
      label: '课堂分析报告',
      path: '.../ai-classroom-analysis-report',
      mergeLabel: 'AI',
    },
  )
  return { label: '报告预览与下载', path: '.../report', children }
}
```

- `buildAiSelfAnalysisLoadingPages` 占位：仍为实录 → 分析（无报告类型，无教学分析项）
- 其它菜单块（如 resourceType 旧分支）本期不改

## 3. 非目标

- 不改 path / mergeLabel / 其它侧栏分组

## 4. 验收

- [x] A/B：Tab 顺序为教学分析 → 课堂实录 → 课堂分析
- [x] G：仍为课堂实录 → 课堂分析
- [x] 路由与文案前缀行为不变
