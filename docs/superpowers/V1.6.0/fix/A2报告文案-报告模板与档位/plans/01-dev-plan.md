# A2 报告文案（报告模板与档位）Implementation Plan

> **For agentic workers:** Inline（用户：「就按你的方案改」）.

**Goal:** Web/PDF A2 头「模板样式」→「报告模板」；确认无「挡位」。

**Architecture:** 文案常量级替换；生成器同步防回退。

**Tech Stack:** Vue + Thymeleaf HTML

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

### Task 1：文案替换

> **Skill:** （无强制）直改 · low

- [x] `ReportA2HeroHeader.vue` + 类型注释  
- [x] `ClassroomContentAnalysisReportA.html` + `gen-ccar-a2-static-html.mts`  
- [x] 扫描「挡位」  
- [x] archive + harness:check  
