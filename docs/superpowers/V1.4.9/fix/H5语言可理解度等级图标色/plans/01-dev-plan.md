# H5语言可理解度等级图标色 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 综合等级图标与综合得分同为 `#027AFF`  
**目标仓库：** `E:\code\H5`  
**日期：** 2026-07-22

### Task 1: CSS

**Modify:** `components/LanguageComprehensibilityPanel.vue`

- 使用 `:deep(svg path) { fill: #027aff; }`（对齐清晰度）

- [x] 两图标色一致

### Task 2: 交付

- archive + Spec 勾选 + `pnpm harness:check -- --match "等级图标色"`

- [x] DELIVERED
