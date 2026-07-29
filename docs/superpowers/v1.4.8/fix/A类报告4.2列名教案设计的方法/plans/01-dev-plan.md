# A类报告4.2列名教案设计的方法 · 开发计划

> **For agentic workers:** 按 Task 顺序执行。

**Goal:** 4.2 表格列名「教案设计的深度」改为「教案设计的方法」。  
**Architecture:** 仅字符串替换，不改 prop。  
**Tech Stack:** TypeScript / HTML  
**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

## Task 1：替换主用源文件

在下列文件中将 `教案设计的深度` 全部替换为 `教案设计的方法`：

- `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a.mapper.ts`
- `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/type-a-chapters.ts`
- `src/pages/analysis-web/ai-teaching-diagnosis/template-thymeleaf/ClassroomContentAnalysisReport.html`
- `src/report/ClassroomContentAnalysisReportA.html`
- `src/report/report/ClassroomContentAnalysisReportA.html`

跳过 `ClassroomContentAnalysisReport copy.html`。

用 ripgrep 确认主用路径无残留。

## Task 2：门禁与交付

1. 改码前 `pnpm harness:check`
2. 勾选 spec；写 `archive/A类报告4.2列名教案设计的方法-delivered.md`
3. 再跑 `pnpm harness:check` / `pnpm harness:status`
