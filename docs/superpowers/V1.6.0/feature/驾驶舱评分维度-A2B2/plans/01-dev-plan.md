# 驾驶舱评分维度 A2B2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 驾驶舱教师画像详情 A/B「评分维度得分」雷达支持 A1/A2、B1/B2 子类型轮播（独立计时、hover 暂停累计、GSAP 指示条），A2/B2 五维 + 缺省 mock。

**Architecture:** 对齐校端已交付逻辑：adapter 输出子类型列表并在缺 2 类时补 mock；`useSubtypeCarousel` 累计 5s；`tp-dimension-radar-panel` 内渲染标签/指示条/切换动画；chart-options 支持 5/6 轴。实现全部在外链 data-cockpit。

**Tech Stack:** Vue 3 + TS、ECharts、GSAP（新增）、驾驶舱既有 panel-chrome / tp-chart-animation

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 实现根：`e:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/`
- 不改本仓 `frontend` 校端业务代码（可只读对齐）
- A1/B1 六维不变；A2/B2 五维见 spec §2.1
- 轮播：累计 5000ms；hover 不重置；A/B 各一实例
- Mock：仅 `FILL_MISSING_DIMENSION_SUBTYPE_2_MOCK` 补雷达 2 类，不开关其它模块全局 mock
- 非目标：S2 环图、等级汇总、评分趋势
- 指示条：选中 20×4 / 未选 10×4 / gap 4；颜色跟 variant A/B
- P3 + READY_TO_DEV 前禁止改实现文件

## File Map（均相对 detail/）

| 文件 | 职责 |
|------|------|
| `adapters/constants/content-eval-dimensions.ts` | `CATEGORY_2_DIMENSION_DEFS` |
| `api/types/teacher-profile-rsp.vo.ts` | `dimensionScoreBySubtype` |
| `mock/content-eval-dimension-subtype.mock.ts`（新建） | A2/B2 假分 + FILL 开关 |
| `adapters/classroom-content-eval.adapter.ts` | 子类型适配 + 缺 2 类填充 |
| `types/classroom-content-eval.ts` | Slice / ViewModel 子类型 |
| `composables/use-subtype-carousel.ts`（新建） | 累计轮播 |
| `components/classroom-content-eval/chart-options.ts` | 5/6 轴 |
| `components/classroom-content-eval/dimension-radar-panel.vue` | 标签、dots、GSAP、hover |
| `composables/use-detail-profile.ts` + 必要时 `index.vue` | 接线 subtypes |
| `apps/data-cockpit/package.json` | `gsap` |

**对齐参考（只读）：** `e:/code/frontend/src/pages/school/teacher-portrait/` 下 adapter / carousel / View 指示条实现

---

### Task 1: 常量 + VO + 类型

> **Skill:** 无需 skill · 置信度 n/a

**Files:**
- Modify: `…/detail/adapters/constants/content-eval-dimensions.ts`
- Modify: `…/detail/api/types/teacher-profile-rsp.vo.ts`
- Modify: `…/detail/types/classroom-content-eval.ts`

- [ ] **Step 1:** 增加 `CATEGORY_2_DIMENSION_DEFS`（与校端五维一致）
- [ ] **Step 2:** VO 增加 `Category2DimensionScoreVO`、`dimensionScoreBySubtype`
- [ ] **Step 3:** Slice/ViewModel：`dimensionScores` / `dimensionSubtypesA|B` 改为子类型列表；保留 `dimensionsA|B` 作首子类型兼容或删除并改接线

---

### Task 2: Mock + Adapter

> **Skill:** 无需 skill · 置信度 n/a · [人工] 对齐校端 FILL 策略

**Files:**
- Create: `…/detail/mock/content-eval-dimension-subtype.mock.ts`
- Modify: `…/detail/adapters/classroom-content-eval.adapter.ts`
- 若有 adapter 单测则更新；无则补最小单测（按仓内 vitest 习惯）

- [ ] **Step 1:** 写入 `MOCK_A2/B2` + `FILL_MISSING_DIMENSION_SUBTYPE_2_MOCK=true`
- [ ] **Step 2:** `adaptCategorySubtypes`：bySubtype / legacy `dimensionScore`→A1/B1；有真实 1 类且缺 2 类时注入 mock
- [ ] **Step 3:** 验证仅 legacy 分时输出 `[A1,A2]` / `[B1,B2]`

---

### Task 3: useSubtypeCarousel

> **Skill:** 无需 skill · 置信度 n/a

**Files:**
- Create: `…/detail/composables/use-subtype-carousel.ts`
- Create: 对应 `*.spec.ts`（若仓内可跑 vitest）

- [ ] **Step 1:** 移植校端行为：累计 interval、pause/resume、goTo、count<=1
- [ ] **Step 2:** fake timers 单测（有测试基建则写）

---

### Task 4: chart-options 5/6 轴

> **Skill:** `echarts` · 置信度 0.70 · [low·自动激活]

**Files:**
- Modify: `…/detail/components/classroom-content-eval/chart-options.ts`

- [ ] **Step 1:** 六维保留原置换表；五维增加对齐表（可对齐校端 `[0,4,3,2,1]`，再按驾驶舱标签 class 微调）
- [ ] **Step 2:** `dimensions.length` 非 5/6 时按输入顺序回退

---

### Task 5: 面板 UI + GSAP + 接线

> **Skill:** `echarts` · 置信度 0.70 · [low·自动激活]  
> **Skill（人工）：** GSAP 实现动效（参考校端 View）；驾驶舱无单独 Figma，指示条尺寸跟校端；**不**用只读 `improve-animations`

**Files:**
- Modify: `apps/data-cockpit/package.json`（`pnpm add gsap` 于该 app）
- Modify: `dimension-radar-panel.vue`
- Modify: `use-detail-profile.ts`、必要时 `index.vue`

- [ ] **Step 1:** 安装 gsap
- [ ] **Step 2:** ViewModel 输出 `dimensionSubtypesA/B`；index 传给两面板
- [ ] **Step 3:** 面板 props 改为 `subtypes`（或内部 carousel）；类型标签；hover pause；dots + GSAP morph；五维 label class
- [ ] **Step 4:** 本地打开 teacher-portrait-detail，HTTP 下确认仅雷达出现 A1↔A2 / B1↔B2，其它模块仍真数据

---

### Task 6: 回归与交付

> **Skill:** 无需 skill

- [ ] **Step 1:** 目测 S2/趋势无回归；A1 六维与改前一致
- [ ] **Step 2:** 勾选 spec §6；写本模块 `archive/驾驶舱评分维度-A2B2-delivered.md`（含一致性/还原度）；`pnpm harness:check`

---

## Skill 路由标注

> Mode A：对 Task 文本测评；Task 5 否决 `improve-animations`（只审计）。

| Task | Skill | 置信度 | 备注 |
|------|-------|--------|------|
| 1–3、6 | — | — | |
| 4 | echarts | 0.70 | 自动激活 |
| 5 | echarts + GSAP（人工） | 0.70 / n/a | 外链 data-cockpit |
