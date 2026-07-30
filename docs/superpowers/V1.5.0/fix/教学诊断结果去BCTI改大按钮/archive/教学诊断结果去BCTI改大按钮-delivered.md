# 教学诊断结果去BCTI改大按钮 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-30  
**版本：** V1.5.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

`source=analysisAI` 时结果区不再展示 BCTI，改为居中大按钮「查看AI教学诊断分析」（并去掉左上角小按钮）；其它 source 仍用原 BCTI 结果组件。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-course-analysis/teach-analysis/index.vue` |
| 改 | `src/pages/analysis-web/ai-course-analysis/teach-analysis/components/CourseAnalysisResult.vue`（非 AI 路径，逻辑对齐原 BCTI） |
| 增 | `src/pages/analysis-web/ai-course-analysis/teach-analysis/components/CourseAnalysisResultAI.vue` |

## 验收结果

- [x] analysisAI：无 BCTI、无左上角小按钮、有居中大按钮，点击跳转同原 `goAnalysisDetail`
- [x] 非 analysisAI：保留原表 + 小按钮
- [x] analysisAI 不调用 `useTachingAnalysisResultProvide`（无多余 bcti 请求）

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | analysisAI 仅 CTA，不展示报告表数据 |
| 常量/mock/真数据 | N/A | 无新数据映射 |
| 多入口 | 通过 | `index.vue` 按 source 分流两个结果组件 |
| 失败/缺省 | 通过 | 跳转仍依赖 courseOpts 上的 diagnosis id |

## 还原度自检

不适用：无 Figma / 非 UI 还原专项

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 已写
- [x] validate 交付后已跑
