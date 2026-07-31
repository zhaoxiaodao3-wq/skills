# AB 类报告公式换行 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景与目标

课堂教学内容分析页（AB 类报告）的「计算过程」正文经 `ReportInfoCard` 渲染。长公式 / 数学式子无断词时可能横向溢出。目标：内容区增加 `word-wrap: break-word`，在容器宽度内换行。

## 2. 范围

| 纳入 | 排除 |
|------|------|
| A/B 类共用的 `ReportInfoCard` 正文样式 | 改数据结构、mapper、接口 |
| 计算过程相关正文：paragraph / list / plain-lines / field-value | 标题、徽章、页头等非正文区 |
| `classroom-content-analysis` 页可见效果 | 其他诊断页无关组件重构 |

## 3. 方案

在 `ReportInfoCard.vue` 的 scoped 样式中，为以下选择器增加 `word-wrap: break-word`：

- `.cca-info-card__paragraph`
- `.cca-info-card__list`
- `.cca-info-card__plain-lines`
- `.cca-info-card__field-value`

`CalcProcessDisclosureRow` / `summaryCard` / `EqualHeightCardGrid` 均复用该组件，A/B 自动覆盖。

不单独改 `CalcProcessDisclosureRow` 深度选择器（覆盖不全）。

## 4. 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportInfoCard.vue` |

## 5. 验收标准

- [x] 计算过程卡片正文（含长公式字符串）在窄宽下可换行，不横向撑破卡片
- [x] A 类与 B 类报告计算过程均生效（共用组件）
- [x] 原有 `white-space: pre-wrap` 等换行语义保持，仅新增 `word-wrap: break-word`
- [x] 无业务逻辑 / 类型 / mapper 变更

## 6. 非目标

- 不引入 KaTeX / MathJax 等公式渲染库
- 不调整字号、字重、间距等视觉 token
