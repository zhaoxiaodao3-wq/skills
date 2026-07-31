# 评价维度得分 Tooltip 自适应位置 Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 评价维度得分雷达 A/B tooltip 按空间自适应左右/上下，避免左侧出屏。

**代码根目录：** `E:\code\H5`

---

### Task 1: position 回调

**Files:**
- Modify: `src/pages/share/teacherProfile/chart-options/classroom-content-eval-chart.ts`
- Optional Create: `src/pages/share/teacherProfile/chart-options/tooltip-position.ts`

- [ ] 实现 `createAdaptiveTooltipPosition(gap = 8)`，按 contentSize/viewSize 钳制
- [ ] 挂到 `buildClassroomContentEvalRadarOption` 的 `tooltip.position`
- [ ] 不引入 appendTo；donut 不动

---

### Task 2: 归档

- [ ] teacherProfile 无新增 appendTo
- [ ] archive + harness:check → DELIVERED
