# A2 PDF 高优三项补齐 Implementation Plan

> **For agentic workers:** Inline execution（用户已要求补修三项）.

**Goal:** 补齐 basicInfo 拆分、effectivenessSummary、时长系数 hint。

**Architecture:** 仅改 A2 正文 Thymeleaf；对齐 Web mapper。

**Tech Stack:** Thymeleaf HTML

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

### Task 1：三项模板补齐

> **Skill:** `ccar-pdf-static-html` 置信度 0.85 · low

- [x] 改 `ClassroomContentAnalysisReportA.html` 三处绑定  
- [x] fixture 补 `effectivenessSummary`；验证短课时 hint（可选）  
- [x] `preview-a2-thymeleaf-pdf --mode=full --with-cover` 抽查  
- [x] archive + harness:check  
