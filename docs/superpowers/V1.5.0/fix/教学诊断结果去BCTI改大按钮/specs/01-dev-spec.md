# 教学诊断结果去 BCTI 改大按钮 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**日期：** 2026-07-30  
**分类：** fix  
**版本：** V1.5.0  
**方案：** A — 仅 `source=analysisAI` 去掉 BCTI，中间大按钮；其它 source 保留原表

---

## 1. 目标

在 `teach-analysis` 结果页（`CourseAnalysisResult.vue`）：

- 当 `route.query.source === 'analysisAI'`（AI教学诊断 / AI自主分析）时：
  - **不展示** bcti4 总分、指标表、专项指数等 UI
  - **删除** 标题行左上角小按钮「查看AI教学诊断分析」
  - 在原内容区域居中放置**大按钮**「查看AI教学诊断分析」，点击调用既有 `goAnalysisDetail`
- 当 **非** `analysisAI` 时：保持现有 BCTI 展示与左上角小按钮，行为不变

---

## 2. 改动文件

| 路径 | 改动 |
|------|------|
| `src/pages/analysis-web/ai-course-analysis/teach-analysis/components/CourseAnalysisResult.vue` | 按 source 分支模板；analysisAI 精简脚本中仅大按钮所需逻辑 |

尽量不改其它文件；不改 `goAnalysisDetail` 跳转语义。

---

## 3. 行为与 UI

### 3.1 `source === 'analysisAI'`

- [ ] 标题区仅保留文案「AI教学诊断分析」，**无**小按钮
- [ ] `article` 内不再渲染 bcti 相关 DOM
- [ ] 居中大按钮文案：`查看AI教学诊断分析`
- [ ] 大按钮样式明显大于原 `.ai-btn`（建议：高度约 48～56px，字号约 16～18，可沿用 `type="primary"`）
- [ ] `@click` 与原 `goAnalysisDetail` 相同（新开 `/analysis-web/ai-teaching-diagnosis`，带 `id` + `resourceType=AI自主分析`）
- [ ] 可移除本分支下仅服务于表格的 computed/helpers（`bcti4`/`indices`/`getIndiceInfo` 等），或保留但未使用需避免死代码——**优先删除 analysisAI 路径用不到的逻辑**；非 analysisAI 仍要用的逻辑保留

### 3.2 `source !== 'analysisAI'`

- [ ] 左上角小按钮保留
- [ ] BCTI 表与专项指数逻辑/UI 与改前一致
- [ ] `goAnalysisDetail` 仍按原分支拼 query（无 `resourceType` 或按原逻辑）

### 3.3 加载态

- [ ] analysisAI 大按钮态：不必再为 bcti 拉表数据做整块 `v-loading` 表格；若仍调用 `useTachingAnalysisResultProvide`，不因此阻塞大按钮展示（大按钮不依赖 bcti 数据）
- [ ] 非 analysisAI：保持原 `v-loading` 行为

说明：若 analysisAI 下 `useTachingAnalysisResultProvide` 仅服务于已删除的 BCTI，可评估是否仍需调用；**以不影响跳转与其它页面为准**。跳转只用 `courseOpts` 的 id 字段，不依赖 `analysisResult`。analysisAI 分支可不调用该 provide，或保留调用但不渲染结果——推荐 analysisAI **不依赖** bcti 结果数据，避免多余请求（若 provide 有副作用需确认；能安全跳过则跳过）。

---

## 4. 非目标

- 不改诊断详情页 `/ai-teaching-diagnosis` 本身
- 不改 CourseAIForm / 创建分析流程
- 不做 Figma 级还原（产品未提供稿，仅放大按钮）

---

## 5. 验收

- [ ] `source=analysisAI`：无 BCTI 表/分数/专项指数；无左上角小按钮；有居中大按钮；点击与原小按钮跳转一致
- [ ] 其它 source：结果页仍为原 BCTI + 小按钮
- [ ] 无 eslint/类型明显错误（去掉无用 bcti 引用）

---

## 6. 风险

| 风险 | 对策 |
|------|------|
| 误伤非 analysisAI | 严格用 `source === 'analysisAI'` 分支模板 |
| 多余请求 | analysisAI 尽量不拉 bcti；确认 provide 无全局必须副作用 |
