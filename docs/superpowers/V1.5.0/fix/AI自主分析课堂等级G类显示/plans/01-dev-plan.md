# AI 自主分析课堂等级 G 类显示 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** `scoreLevel` 为 null 显示 `-`，NONE 显示「无」样式，报告类型不再参与判断。

**Architecture:** `SCORE_LEVEL_NONE = 'NONE'`；移除 reportType/G 判断；`getScoreLevelLabel / getScoreLevelStyle` 只按 scoreLevel 分流。

**Tech Stack:** Vue 3 + TypeScript + SCSS（frontend）

---

### Task 1：课堂等级分流

**Files:**
- Modify: `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue`

- [x] Step 1: `SCORE_LEVEL_NONE = 'NONE'`，筛选直接传 `'NONE'`
- [x] Step 2: 移除 reportType/G 判断，`scoreLevel == null` 显示 `-`，NONE 显示「无」

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/AI自主分析课堂等级G类显示-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
