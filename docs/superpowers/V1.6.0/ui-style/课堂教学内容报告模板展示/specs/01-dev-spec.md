# 课堂教学内容报告模板展示 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

顶栏 meta 行右侧展示「报告模板」；空 subType 显示 `--`。

## 2. 样式对照

| 项 | 值 |
|----|-----|
| color | `var(--web-semantic-white, #fff)` |
| font-family | `"PingFang SC"` |
| font-size | 16px |
| font-weight | 600 |
| line-height | normal |
| 布局 | meta 行左右分栏；右栏顶对齐、不换行挤左侧 |

## 3. 行为

| reportSubType | 展示 |
|---------------|------|
| A1/A2/B1/B2 | `报告模板：A1` 等 |
| 无 / null / '' / 非法 | `报告模板：--` |

说明：registry 内部缺省 A1/B1 **不变**；仅展示层不默认填 A1/B1。

## 4. 改动

- `ReportHeaderMeta.reportTemplate: string`（展示值，含 `--`）
- `resolveReportTemplateDisplay`（report-variant）
- a/b mapper 写入 header
- `ReportHeroHeader` 布局 + 样式

## 5. 验收

- [x] 无 subType → `报告模板：--`
- [x] 有 A2 → `报告模板：A2`
- [x] 右侧靠右、与第一行顶对齐；左侧换行不影响右侧位置语义
- [x] A/B 顶栏均可见

## 6. 还原度自检

适用（有样式对照表）；交付时对照 §2。
