# 学科风格人次分布默认科目 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 热力空态默认展示 mock 科目。

**Architecture:** adapter 固定 `HEATMAP_SUBJECTS` 9 科目 × 20 风格矩阵，接口数据匹配填充；面板空态兜底同构。

**Tech Stack:** Vue 3 + TypeScript + ECharts（data-cockpit）

---

### Task 1：默认科目兜底

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/subject-style-heatmap/subject-style-heatmap.vue`

- [x] Step 1: `adaptTeacherStyleHeatmap` 固定 9 科目矩阵并匹配填充
- [x] Step 2: `buildEmptyHeatmap` 兜底同样固定 9 科目

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/学科风格人次分布默认科目-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
