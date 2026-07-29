# 自主分析列表 B 类教材匹配状态标红 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：仅改列表「报告类型」列样式；条件 `reportType === 'B' && textbookAsrMatchStatus == 3` 时文案标红。

## 1. 目标

AI 自主分析列表中，B 类且 `textbookAsrMatchStatus === 3` 时，「报告类型」文案显示为红色；其它逻辑不变。

## 2. 改动范围

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue` |

**不改：** 筛选、接口、其它列、诊断页 textbookAsr 工具映射。

## 3. 实现要点

1. 辅助函数（或内联 class）：

```ts
function isReportTypeHighlightRed(row: {
  reportType?: string | null
  textbookAsrMatchStatus?: number | string | null
}): boolean {
  return row?.reportType === 'B' && Number(row?.textbookAsrMatchStatus) === 3
}
```

2. 「报告类型」列模板：

```vue
<span :class="{ 'report-type--danger': isReportTypeHighlightRed(row) }">
  {{ getReportTypeDisplay(row) }}
</span>
```

3. 样式：红色用项目常见危险色（如 `#F53F3F` / `#F56C6C`），仅作用于该 span。

4. `getReportTypeDisplay` 返回 `-`（如 revising）时：条件仍可能为 true，但展示为 `-`；若 `-` 也标红无妨，或仅在有有效报告类型文案时加 class（推荐：**仅当展示文案不是 `-` 时标红**）。

## 4. 前置假设

列表接口行数据已包含 `textbookAsrMatchStatus`；若字段缺失则不标红（`Number(undefined) !== 3`）。

## 5. 验收

- [x] `reportType=B` 且 `textbookAsrMatchStatus=3` 且展示非 `-` → 报告类型红色
- [x] 其它组合 → 默认色
- [x] 筛选/分页/其它列无回归
