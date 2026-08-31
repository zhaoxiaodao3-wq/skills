# 评价维度得分 A2B2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 教师画像「评价维度得分」支持 A1/A2、B1/B2 子类型轮播（独立计时、hover 暂停累计、GSAP 指示条水滴切换），A2/B2 五维五边形 + mock。

**Architecture:** 适配层把维度得分扩成「子类型列表」；抽 `useSubtypeCarousel` 累计式 5s 轮播（A/B 各一实例）；View 按当前子类型渲染标签/雷达/指示条，GSAP 做 crossfade 与指示条 morph；ECharts radar 按 5/6 轴动态构建。

**Tech Stack:** Vue 3 + TypeScript、ECharts、GSAP（新增依赖）、现有 teacher-portrait Container/View/adapter 模式

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- A1/B1 六维标题/满分/样式不变；仅加类型标签
- A2/B2 **五维五边形**，维度与满分见 spec §2.1；二者共用常量
- 轮播：未 hover 累计满 5000ms 切换；hover 暂停累计不重置；A/B 计时独立
- B 大类标题文案：`B类【基于教材与上课】`（完整「基于」）
- 单子类型：不轮播、隐藏指示条
- 非目标：环形图、等级汇总、得分趋势
- 先文档后实现已完成；本 plan 仅在 P3 + READY_TO_DEV 后改 `src/`
- Figma：`8785:61536`；指示条选中 20×4 / 未选 10×4 / gap 4px

## File Map

| 文件 | 职责 |
|------|------|
| `adapters/constants/content-eval-dimensions.ts` | 新增 `CATEGORY_2_DIMENSION_DEFS` |
| `api/types/teacher-profile-rsp.vo.ts` | VO 扩展子类型维度字段 |
| `types/aggregate.ts` + component `types.ts` | Slice / ViewModel 子类型形状 |
| `adapters/classroom-content-eval.adapter.ts` | 适配多子类型 + 旧字段兼容 |
| `mock/teacher-profile-api.mock.ts` | mock A2/B2 |
| `composables/useSubtypeCarousel.ts`（新建） | 累计式轮播 |
| `chart-options.ts` | 5/6 轴雷达排序与 option |
| `ClassroomContentEvalContainer.vue` / `View.vue` | 接线、标签、指示条、hover、GSAP |
| `package.json` | 增加 `gsap` |
| 对应 `*.spec.ts` | adapter / carousel / radar 单测 |

---

### Task 1: 维度常量 + VO + Slice 类型

> **Skill:** 无需 skill（纯类型/常量） · 置信度 n/a · [人工复核] CLI Mode A 无达标匹配

**Files:**
- Modify: `src/pages/school/teacher-portrait/adapters/constants/content-eval-dimensions.ts`
- Modify: `src/pages/school/teacher-portrait/api/types/teacher-profile-rsp.vo.ts`
- Modify: `src/pages/school/teacher-portrait/types/aggregate.ts`
- Modify: `src/pages/school/teacher-portrait/components/classroom-content-eval/types.ts`

**Interfaces:**
- Produces: `CATEGORY_2_DIMENSION_DEFS`；`DimensionSubtypeKey`；slice `dimensionScores.categoryA/B: DimensionSubtypeSlice[]`；ViewModel 对应字段

- [ ] **Step 1:** 在 `content-eval-dimensions.ts` 导出五维常量（名称/key/maxScore 对齐 spec §2.1）

- [ ] **Step 2:** VO 扩展：在 `PostClassReportDetailVO` 上增加可选子类型维度结构（如 `dimensionScoreBySubtype?: { A1?/A2? }` 或与 mock 约定一致的字段）；保留原 `dimensionScore` 兼容

- [ ] **Step 3:** 更新 `ClassroomContentEvalSlice.dimensionScores` 与 ViewModel：由「单数组」改为「子类型列表」；含 `key`/`label`/`dimensions`

- [ ] **Step 4:** 跑类型检查相关文件无新增错误（`pnpm exec vue-tsc` 或项目既有 check，按仓库习惯）

---

### Task 2: Adapter 适配 + Mock A2/B2

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] 路由图无 `api-ui-mapping` 达标命中；按本仓既有 adapter 模式手写即可

**Files:**
- Modify: `src/pages/school/teacher-portrait/adapters/classroom-content-eval.adapter.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/classroom-content-eval.adapter.spec.ts`（若无则创建）
- Modify: `src/pages/school/teacher-portrait/mock/teacher-profile-api.mock.ts`
- Test: adapter spec

**Interfaces:**
- Consumes: Task 1 常量与 VO
- Produces: `adaptClassroomContentEval` 返回两侧 `DimensionSubtypeSlice[]`；仅旧 `dimensionScore` 时回落为单元素 A1/B1

- [ ] **Step 1:** 写/改失败用例：旧结构 → `[A1]`/`[B1]`；新结构含 A2/B2 五维

- [ ] **Step 2:** 实现适配：按 defs 读分；缺子类型则不入列表；空列表与缺省策略与现网空态一致

- [ ] **Step 3:** mock `postClassReport` 同时提供 A1+A2、B1+B2 假分（2 类分值拉开）

- [ ] **Step 4:** 跑 adapter 单测通过

---

### Task 3: `useSubtypeCarousel` 累计轮播

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] 纯 composable + vitest，无路由达标 skill

**Files:**
- Create: `src/pages/school/teacher-portrait/composables/useSubtypeCarousel.ts`
- Create: `src/pages/school/teacher-portrait/composables/useSubtypeCarousel.spec.ts`

**Interfaces:**
- Produces: `useSubtypeCarousel(options: { count: Ref<number> | number; intervalMs?: number })` → `{ index, pause, resume, goTo, stop }`；pause 不重置已累计时间

- [ ] **Step 1:** 写单测：累计满 interval 前进；pause 期间不前进；resume 后续满剩余时间才前进；`goTo` 清零累计；`count<=1` 不自动前进

- [ ] **Step 2:** 用 `vi.useFakeTimers()` 实现最小 composable（rAF 或 `setInterval` 切片累计均可，须可测）

- [ ] **Step 3:** 单测通过

---

### Task 4: Radar 5/6 轴 chart-options

> **Skill:** `echarts` · 置信度 0.70 · [low·自动激活] · 理由: 触发词命中 ECharts/雷达图；[人工复核] 必读本仓 echarts skill 后再改 option

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/classroom-content-eval/chart-options.ts`
- Modify: `src/pages/school/teacher-portrait/components/classroom-content-eval/chart-options.spec.ts`

**Interfaces:**
- Consumes: `dimensions.length` 为 5 或 6
- Produces: `buildClassroomContentEvalRadarOption` 对五维不再误用六维置换表

- [ ] **Step 1:** 六维保留现有 `RADAR_AXIS_DIMENSION_INDEX`；五维新增置换表（使顶点与 View 标签 class 对齐），写单测锁定 indicator 顺序

- [ ] **Step 2:** 实现分支；非法长度（非 5/6）走安全回退（按输入顺序或返回空图，与现网一致并在注释说明）

- [ ] **Step 3:** 单测通过

---

### Task 5: 安装 GSAP + View/Container 接线与动效

> **Skill:** `echarts` · 置信度 0.70 · [low·自动激活]（图表 setOption/生命周期）  
> **Skill（人工覆盖）:** 不采用 CLI 命中的 `improve-animations`（该 skill 只审计不改代码）→ 实现动效用 **GSAP**（可参考 ecosystem `martinholovsky/claude-skills-generator@gsap`，非仓内路由）；UI 对照用插件 `figma-implement-design` / `figma-implement-motion`（对照节点 `8785:61536`）

**Files:**
- Modify: `package.json` / lockfile（`pnpm add gsap`）
- Modify: `ClassroomContentEvalContainer.vue`
- Modify: `ClassroomContentEvalView.vue`（及必要 scoped CSS）
- 可选 Create: `components/classroom-content-eval/SubtypeCarouselDots.vue`（若 View 过重则拆）

**Interfaces:**
- Consumes: Task 2 ViewModel 子类型列表、Task 3 carousel、Task 4 radar
- Produces: A/B 独立 carousel；类型标签；hover 暂停；指示条三态 + GSAP 水滴；切换 crossfade

- [ ] **Step 1:** `pnpm add gsap`；按需 `import gsap from 'gsap'`

- [ ] **Step 2:** Container 将 `dimensionScores.categoryA/B` 映射为 View 子类型列表；缺省/空态路径与有数据路径一致（一致性自检）

- [ ] **Step 3:** View：每侧标题行加类型标签；`useSubtypeCarousel`×2；雷达 wrap `@mouseenter`/`@mouseleave` → pause/resume；指示条 click → `goTo`

- [ ] **Step 4:** 指示条样式对齐 Figma（选中 20×4 品牌色、未选 10×4 `#E5E6EB`、gap 4）；GSAP 切换 width/x morph；hover 未选中略增宽；`prefers-reduced-motion` 瞬时切换

- [ ] **Step 5:** 五维时标签定位 class 映射校验（不足 6 个时不访问越界 class）；切换时图表 opacity crossfade ~300–450ms

- [ ] **Step 6:** 本地打开 teacher-portrait，确认 mock 下 A/B 独立轮播、hover 续计、点击指示条、A1 六维与 A2 五维切换正确

---

### Task 6: 回归与交付准备

> **Skill:** 无需 skill · 置信度 n/a

**Files:**
- 相关 spec/测试；不扩 scope

- [ ] **Step 1:** 跑本模块相关单测 + 手动点验环形图/趋势无回归

- [ ] **Step 2:** 对照 spec §6 勾选验收；准备 archive 用的一致性/还原度证据（交付阶段再写 archive）

---

## Skill 路由标注

> Mode A：`annotatePlan` 对 Task 文本测评（Windows 下 CLI `isMain` 路径比对可能导致 `--annotate` 无 stdout，已用 import API 等效执行）。  
> 人工复核：Task 5 否决 `improve-animations`（只读审计）；动效按 GSAP + Figma motion 插件 skill。

| Task | Skill | 置信度 | 风险 | 备注 |
|------|-------|--------|------|------|
| 1 | — | — | — | 类型/常量 |
| 2 | — | — | — | adapter 手写 |
| 3 | — | — | — | composable |
| 4 | echarts | 0.70 | low | 自动激活 |
| 5 | echarts + GSAP/Figma motion（人工） | 0.70 / n/a | low | 否决 improve-animations |
| 6 | — | — | — | 回归 |
