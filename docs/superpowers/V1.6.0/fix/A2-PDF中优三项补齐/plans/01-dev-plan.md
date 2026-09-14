# A2 PDF 中优三项补齐 Implementation Plan

> **For agentic workers:** Inline execution（用户已要求中优三项一并补修）.

**Goal:** Bloom 去序号、评价 joinEval、编号补零。

**Architecture:** 仅改 A2 正文 Thymeleaf + 预览 runtime 补齐 `listJoin`/`instanceof`。

**Tech Stack:** Thymeleaf HTML

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

### Task 1：三项模板补齐

> **Skill:** `ccar-pdf-static-html` 置信度 0.85 · low

- [x] 改 `ClassroomContentAnalysisReportA.html`  
- [x] 预览脚本支持 `listJoin` / `instanceof List`  
- [x] fixture 覆盖编号 Bloom + 数组 evaluation  
- [x] preview 抽查 + archive  
