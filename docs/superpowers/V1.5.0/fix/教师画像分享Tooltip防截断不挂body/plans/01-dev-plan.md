# 教师画像分享 Tooltip 防截断不挂 body Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 布鲁姆饼图与内容评价雷达长文 tooltip 完整显示；禁止 appendTo body；MrEcharts 按需 overflow visible。

**代码根目录：** `E:\code\H5`

---

### Task 1: MrEcharts clipContent

**Files:** `src/components/MrEcharts.vue`

- [ ] 增加 prop `clipContent` 默认 `true`
- [ ] false 时 `.echarts-container { overflow: visible }`，true 保持 hidden

---

### Task 2: 布鲁姆饼图

**Files:**
- `chart-options/question-type-chart.ts`
- `components/QuestionTypePanel.vue`

- [ ] option：`escapeClip` → confine:false，无 appendTo，extraCssText 换行+max-width
- [ ] 布鲁姆传 escapeClip + `:clip-content="false"`；四何默认

---

### Task 3: 内容评价雷达

**Files:**
- `chart-options/classroom-content-eval-chart.ts`
- `components/ClassroomContentEvalPanel.vue`（雷达两处 MrEcharts）

- [ ] 雷达 tooltip：confine:false，无 appendTo，换行 max-width
- [ ] 雷达 MrEcharts：`clip-content="false"`；圆环不动

---

### Task 4: 复查归档

- [ ] teacherProfile 无 `appendTo`
- [ ] archive + harness:check → DELIVERED
