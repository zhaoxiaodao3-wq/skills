# 教师画像A2B2接口对接 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**Goal:** 真实 `a2DimensionScore` / `b2DimensionScore` 进入评价维度得分 A2/B2；A1/B1 与其它画像模块字段只读路径不变。

**Architecture:** 仅扩展 VO + `adaptCategorySubtypes` 取值链；UI/轮播不动。Type2 优先新字段，其次 `dimensionScoreBySubtype`，最后 mock 补齐开关。

**Tech Stack:** Vue 3 + TypeScript；Vitest（现有 `teacher-profile.adapter.spec.ts`）

**兼容硬约束（不破坏原接口数据）：**

- 不改 `dimensionScore`（A1/B1）解析与展示
- 不改 `levelStat` / `summary` / 其它 9 个顶层业务字段 adapter
- 不改雷达 UI、轮播、等级卡
- 新增字段可空；缺省时行为见选项 B（空 A2/B2 占位，非假分）

**空态（选项 B）：** 无/空 `a2|b2DimensionScore` → 仍有 A2/B2 标签 + 五维 0；`FILL_MISSING_DIMENSION_SUBTYPE_2_MOCK=false`。

---

### Task 1: VO + 五维常量 key 对齐

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] 纯类型/常量/mock key 对齐，CLI 无强制匹配

**Files:**

- Modify: `src/pages/school/teacher-portrait/api/types/teacher-profile-rsp.vo.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/constants/content-eval-dimensions.ts`
- Modify: `src/pages/school/teacher-portrait/mock/content-eval-dimension-subtype.mock.ts`

- [ ] **Step 1:** 增加 `V2DimensionScore` 与 `PostClassReportDetailVO.a2DimensionScore` / `b2DimensionScore`（可空）
- [ ] **Step 2:** `CATEGORY_2_DIMENSION_DEFS` 首维 key：`knowledgeImplementation` → `knowledgeMastery`
- [ ] **Step 3:** `MOCK_A2_*` / `MOCK_B2_*` 同步改 key；**`FILL_MISSING_DIMENSION_SUBTYPE_2_MOCK = false`**
- [ ] **Step 4:** 类型检查无报错（相关文件）

---

### Task 2: Adapter 优先读新字段 + 空 A2/B2 占位 + 单测

> **Skill:** test-runner · 置信度 0.75 · [人工复核] 以 adapter 单测门禁验收；实现按本 plan

**Files:**

- Modify: `src/pages/school/teacher-portrait/adapters/classroom-content-eval.adapter.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`
- Modify: `src/pages/school/teacher-portrait/mock/teacher-profile-api.mock.ts`

- [ ] **Step 1:** 单测：仅有新字段真分 → A2/B2 分值正确
- [ ] **Step 2:** 单测：无 `a2DimensionScore`（有 A1）→ 仍有 A2 项且五维为 0；不再出现 MOCK 假分（如 28.4）
- [ ] **Step 3:** `adaptCategorySubtypes`：优先新字段；无效时 `buildEmptySubtype`/`adaptDimensions(undefined)` push 空 Type2；删除/绕过假分注入分支
- [ ] **Step 4:** fixture mock 增加真实路径字段；更新旧用例 key
- [ ] **Step 5:** 跑 `teacher-profile.adapter.spec.ts` 全绿
- [ ] **Step 6:** 手工：关页面 Mock；无 2 类字段时标签在、雷达空；有字段时真分

---

### Task 3: 交付归档

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] 文档归档

**Files:**

- Create: `docs/superpowers/V1.6.0/api-adapter/教师画像A2B2接口对接/archive/教师画像A2B2接口对接-delivered.md`

- [ ] **Step 1:** 勾选 spec 验收项
- [ ] **Step 2:** 写 archive（含一致性自检；还原度写 N/A）
- [ ] **Step 3:** `pnpm harness:check` + `pnpm harness:status -- --match "教师画像A2B2接口对接"` → DELIVERED
