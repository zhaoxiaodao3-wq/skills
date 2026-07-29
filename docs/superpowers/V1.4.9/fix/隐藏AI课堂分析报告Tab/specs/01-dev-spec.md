# 隐藏AI课堂分析报告Tab · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景与目标

AI 自主分析（`resourceType=AI自主分析`）报告预览中隐藏「AI课堂分析报告」Tab，避免入口继续展示该报告。

## 2. 范围

### 在范围内

- `src/pages/analysis-web/ai-teaching-diagnosis.vue`
  - `buildReportPreviewMenu`：去掉 `ai-classroom-analysis-report` 子项
  - `buildAiSelfAnalysisLoadingPages`：同步去掉占位菜单中的同项

### 不在范围内

- 非 AI自主分析（default / CSMS）菜单中的「AI课堂分析报告」
- 删除 `report/ai-classroom-analysis-report.vue` 路由/页面文件
- 强制重定向已打开的该 URL（菜单隐藏即可）

## 3. 方案（已确认 A）

仅改 AI自主分析 两处菜单构建函数，不再 push/声明该 children。保留同组「教学分析报告」「课堂实录报告」。

## 4. 验收标准

- [x] AI自主分析「报告预览与下载」下看不到「AI课堂分析报告 / 课堂分析报告」
- [x] 加载占位菜单亦不展示该项
- [x] 「教学分析报告」「课堂实录报告」仍在
- [x] 其它 resourceType 菜单未误改

## 5. 还原度自检

不适用：无 Figma / 菜单显隐。
