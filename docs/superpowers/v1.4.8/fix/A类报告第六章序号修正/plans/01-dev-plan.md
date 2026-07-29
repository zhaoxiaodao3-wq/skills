# A类报告第六章序号修正 · 开发计划

> **For agentic workers:** 按 Task 顺序执行。

**Goal:** A 类报告第六章小节序号改为连续 6.1–6.5，去掉「6.2-6.3」。  
**Architecture:** 仅改展示标题字符串，不改锚点 id / API。  
**Tech Stack:** TypeScript mapper + HTML/Thymeleaf  
**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

## Task 1：mapper + mock

**文件：**

- `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a.mapper.ts`
- `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/type-a-chapters.ts`

替换：

```
6.2-6.3 本堂课做得好的地方  →  6.2 本堂课做得好的地方
6.4 综合对比…              →  6.3 综合对比…
6.5 下堂课改进建议         →  6.4 下堂课改进建议
6.6 下堂课备课建议         →  6.5 下堂课备课建议
```

注意：从大到小替换数字，或整串替换，避免 `6.4`→`6.3` 后再被误伤成更小序号。

## Task 2：A 报告 HTML / Thymeleaf

同步替换同类标题字符串：

- `src/pages/analysis-web/ai-teaching-diagnosis/template-thymeleaf/ClassroomContentAnalysisReport.html`
- `src/report/ClassroomContentAnalysisReportA.html`
- `src/report/report/ClassroomContentAnalysisReportA.html`（若存在）
- TOC：`ClassroomContentAnalysisReportTocA.html`（两处路径，若硬编码含 6.2-6.3 / 6.4–6.6）

用 ripgrep 确认 `src` 内 A 类路径无残留 `6.2-6.3`（可忽略 `copy.html`、纯文档 md）。

## Task 3：门禁与交付

1. 改码前 `pnpm harness:check`
2. 勾选 spec；写 `archive/A类报告第六章序号修正-delivered.md`
3. 再跑 `pnpm harness:check` / `pnpm harness:status`
