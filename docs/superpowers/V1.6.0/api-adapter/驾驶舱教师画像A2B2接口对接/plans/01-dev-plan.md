# 驾驶舱教师画像A2B2接口对接 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**Goal:** 驾驶舱详情页评价维度雷达接入真实 `a2/b2DimensionScore`；缺数据时 A2/B2 可轮播且雷达子类型空态（对齐校端）。

**实现根目录：** `E:\code\dataView\apps-development-platform\apps\data-cockpit\src\views\preview\mr-teacher-portrait\detail\`

**Architecture:** VO + adapter 取值链 + 雷达面板按当前子类型 `isEmpty`；不改环图/趋势主逻辑。

**Tech Stack:** Vue 3 + TypeScript + ECharts（驾驶舱）

**兼容：** 不破坏 A1/B1、`levelStat`、`totalCount`、其它 profile 模块。

---

### Task 1: VO + 常量 + mock

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] 类型/常量对齐

**Files:**

- Modify: `api/types/teacher-profile-rsp.vo.ts`
- Modify: `adapters/constants/content-eval-dimensions.ts`
- Modify: `mock/content-eval-dimension-subtype.mock.ts`

- [ ] **Step 1:** 增加 `V2DimensionScore`、`a2DimensionScore`/`b2DimensionScore`
- [ ] **Step 2:** `CATEGORY_2` 首键 → `knowledgeMastery`；MOCK 同步；`FILL_MISSING=false`

---

### Task 2: Adapter 优先真字段 + 空 Type2 占位

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] 对齐校端 adapter 语义

**Files:**

- Modify: `adapters/classroom-content-eval.adapter.ts`

- [ ] **Step 1:** `adaptCategorySubtypes` 增加 `type2FromApi`；优先新字段 → bySubtype → 空占位
- [ ] **Step 2:** `adaptClassroomContentEval` 传入 `a2/b2DimensionScore`
- [ ] **Step 3:** 假分注入仅在开关 true 时（默认 false）

---

### Task 3: 子类型空态 + 雷达按激活子类型渲染

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] UI 透传 isEmpty

**Files:**

- Modify: `types/classroom-content-eval.ts`（或等价 ViewModel types）
- Modify: 组装 ViewModel 的 container / composable（定位后写入）
- Modify: `components/classroom-content-eval/dimension-radar-panel.vue`

- [ ] **Step 1:** 子类型 VM 增加 `isEmpty`
- [ ] **Step 2:** map 时全分≤0 → `isEmpty=true`；整块空态含 A1+A2 / B1+B2
- [ ] **Step 3:** 雷达 `buildRadarOption` 使用 `activeSubtype.isEmpty ?? props.isEmpty`；watch 同步
- [ ] **Step 4:** 详情页冒烟：无 2 类字段可轮播空态；有字段见真分

---

### Task 4: 交付归档

> **Skill:** 无需 skill · 置信度 n/a · [人工复核]

**Files:**

- Create: `docs/superpowers/V1.6.0/api-adapter/驾驶舱教师画像A2B2接口对接/archive/驾驶舱教师画像A2B2接口对接-delivered.md`

- [ ] **Step 1:** 勾选 spec 验收项
- [ ] **Step 2:** 写 archive（一致性自检；还原度 N/A）
- [ ] **Step 3:** `pnpm harness:check` + status → DELIVERED
