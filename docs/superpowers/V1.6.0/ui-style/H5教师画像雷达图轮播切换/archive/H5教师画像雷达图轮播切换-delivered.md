# H5 教师画像雷达图轮播切换 · 交付归档

**归档类型：** ui-style 交付快照
**归档日期：** 2026-09-14
**版本：** V1.6.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

将 web 端已实现的 A1/A2、B1/B2 子类型轮播切换 + 子类型标签 + 圆点指示器 + 淡入淡出动画，**适配到 H5 端教师画像分享页**。H5 端主样式（竖排布局、donut、legend、grade-card、score-trend、面板色）完全保留。改造点全部集中在 `ClassroomContentEvalPanel` 及其 adapter。

## 改动文件

| 操作 | 路径 | 说明 |
|---|---|---|
| 新增 | `E:/code/H5/src/pages/share/teacherProfile/composables/useSubtypeCarousel.ts` | 5s 自动 / hover pause / goTo 规范化 / onScopeDispose 清理；从 web 端 1:1 移植 |
| 改 | `E:/code/H5/src/pages/share/teacherProfile/adapters/adapt-classroom-content-eval.ts` | 新增 `ContentEvalSubtypeKey/Vm`、`CATEGORY_2_DIMENSION_DEFS`、`ContentEvalDimensionDef`；`ClassroomContentEvalVm` 增 `dimensionSubtypesA/B`；新增 `hasAnyDimensionScore` / `readSubtypeScore` / `mapSubtypeDimensions` / `buildSubtype` / `adaptCategorySubtypes`；`ReportDetail` 内部类型扩展 4 个新字段 |
| 改 | `E:/code/H5/src/pages/share/teacherProfile/components/ClassroomContentEvalPanel.vue` | 脚本：新增 `useSubtypeCarousel` 实例 + `activeSubtypeA/B` / `activeDimensionsA/B` computed + `getRadarLabelClass` 双套（5/6 维）；模板：标题行加 `type-tag`、radar-wrap 加 `mouseenter/leave` 暂停、`Transition` 仅包裹 chart slot（label 直接 v-for）、按 count 渲染 dots 圆点；样式：新增 `radar-title-row` / `type-tag` / `dots` / `dot` / `dot--active` / `tp-radar-fade-*` |
| 新增 | `E:/code/H5/src/pages/share/teacherProfile/composables/__tests__/useSubtypeCarousel.spec.ts` | 占位文件（指向 local-docs/test-recipes/）；保留目录结构供未来接入 vitest |
| 新增 | `E:/code/H5/src/pages/share/teacherProfile/adapters/__tests__/adapt-classroom-content-eval.spec.ts` | 占位文件（指向 local-docs/test-recipes/）；保留目录结构供未来接入 vitest |
| 新增 | `E:/code/H5/local-docs/test-recipes/useSubtypeCarousel.test-recipe.ts` | 7 用例 vitest 单测草稿（count<=1 / 自动切换 / pause-resume / goTo 规范化 / goTo 重置 / count 越界）|
| 新增 | `E:/code/H5/local-docs/test-recipes/adapt-classroom-content-eval.test-recipe.ts` | 6 用例 vitest 单测草稿（空 VO / 旧 dimensionScore / a2|b2 / bySubtype 嵌套 / 全空 isEmpty / 向后兼容）|

无 package.json 变更；无新依赖。

## 验收结果

- [x] `adapt-classroom-content-eval.ts` 输出包含 `dimensionSubtypesA: ContentEvalSubtypeVm[]` 和 `dimensionSubtypesB: ContentEvalSubtypeVm[]`
- [x] A1/A2、B1/B2 子类型能从接口 `aReport.dimensionScoreBySubtype` 或 `a2DimensionScore` / `b2DimensionScore` 正确解析（adapter `readSubtypeScore` 三级回退：bySubtype → 类型特定字段 → null）
- [x] 旧字段 `categoryA.dimensions` / `categoryB.dimensions` 仍保留（向后兼容，未删除）
- [x] `useSubtypeCarousel` composable 文件存在，导出 API（index/pause/resume/goTo/stop）与 web 端一致
- [x] `ClassroomContentEvalPanel.vue` 显示子类型标签（A1/A2/B1/B2，type-tag 圆角 4px、12px Medium、白底带类别色边框）
- [x] `ClassroomContentEvalPanel.vue` 在子类型 ≥2 时显示圆点指示器
- [x] 圆点 active 态：A 类 #027aff / B 类 #00bcbc（与 web 端颜色一致）
- [x] 5s 自动切换；hover 雷达图区域暂停（`mouseenter` → pause，`mouseleave` → resume）；离开恢复
- [x] 点击圆点立即切换（`@click="carousel.goTo(index)"`）
- [x] 切换有淡入淡出动画（CSS transition 320ms ease，`Transition mode="out-in"`）
- [x] 移动端 touch 行为不依赖 hover（dots 圆点点击）
- [x] 单一子类型（count === 1）不显示圆点（`v-if="countA > 1"` / `v-if="countB > 1"`）
- [x] 空数据态（isEmpty === true）不崩：adapter 空态分支返回 4 个空 subtype 占位，radar option `isEmpty` 走空态
- [x] H5 端面板整体样式不改变：竖排布局、donut 100×100、legend 12px 字号、grade-card 紫色边框、score-trend 完全保持
- [x] 不引入新依赖
- [x] H5 项目 `share/teacherProfile` 路径下 typecheck 无新错误（vue-tsc --noEmit 过滤后零输出）
- [x] `pnpm harness:check` 无本模块相关 warning

## 一致性自检

| 检查项 | 结果 | 证据 |
|---|---|---|
| 空态 vs 有数据 | 通过 | `adaptClassroomContentEval` 空态分支返回 `[A1空, A2空, B1空, B2空]` 4 个 subtype 占位；panel 仍渲染子类型标签与雷达图（值 0），`Transition` 正常淡入 |
| 常量 / mock / 真数据 | 通过 | 维度常量 `CATEGORY_A/B/2_DIMENSION_DEFS` 与 web 端完全一致；adapter 全部走真实接口字段，无 mock 残留 |
| 多入口 | 通过 | `dimensionSubtypesA/B` 通过 `dimensionScoreBySubtype` 嵌套与 `a2DimensionScore`/`b2DimensionScore` 平铺两种接口结构兼容；`dimensionScore` 旧字段保留为 A1/B1 默认回退 |
| 失败 / 缺省 | 通过 | `hasAnyDimensionScore` 对 `null` / `undefined` / 全空对象 / 仅含 NaN 都返回 false → 对应 subtype `isEmpty = true`；`readSubtypeScore` 任一字段缺失都安全降级 |

## 还原度自检

适用（带 Figma 节点 8785-61536 链接 + feature 性质）。

- **Figma 节点**：原始 8785-61536（需登录）；本实现对照 web 端 CSS 已落地的 `6696:12987/20326` + H5 端现有 `7485:14625/14642/14681/14743` 注释节点
- **对照方式**：spec 内置「样式对照」表（5.1-5.4）逐项列字号/字重/色、间距、圆角/边框、关键尺寸 vs web 端差异；实现按表执行
- **偏差清单**：
  - 标签 padding：H5 6px vs web 8px（H5 端收紧，符合移动端密度）
  - 圆点静态 8×8 vs web 10×10（H5 rem 缩放下偏小更精致；active 16×8 vs web 20×10，比例等效）
  - 圆点容器 padding-top：H5 4px vs web 0（H5 端加大可点击热区）
  - 动画时长 320ms vs web 380ms（移动端略快）
  - dots active 取色：H5 用 BEM 组合选择器 `.dot--a.dot--active` 显式取色，避开了 CSS `:has`（部分低端 WebView 不支持）
- **结论**：可交付。H5 端与 web 端视觉/交互对齐；色板 / 字号 / 圆角 / 间距均在合理偏差范围内（移动端适配考虑）

## Harness 闭环

- [x] validate 开发前已跑（`pnpm harness:check` 仅历史模块旧 warning，不阻断）
- [x] spec 验收项已勾选（见上）
- [x] 一致性自检已完成并写入 archive
- [x] 还原度自检已完成
- [x] archive 交付快照已写（本文件）
- [x] validate 交付后已跑（`pnpm harness:check` 无本模块新增 warning）
- [x] **lint 二次校验**：H5 `pnpm lint` 三个文件 → 0 error（3 个历史 warning 来自 `utils/pm.ts`，与本模块无关）
- [x] **typecheck 二次校验**：H5 `vue-tsc --noEmit` 过滤 `share/teacherProfile` → 0 error
- [x] **测试草稿已落盘**：`local-docs/test-recipes/useSubtypeCarousel.test-recipe.ts`（7 用例）+ `local-docs/test-recipes/adapt-classroom-content-eval.test-recipe.ts`（6 用例），文件头 `@ts-nocheck` 暂避 vue-tsc；**未实际运行**（H5 项目无 vitest，需 `pnpm add -D vitest` 后再 `pnpm test`）。src/ 下 `__tests__/useSubtypeCarousel.spec.ts` 与 `__tests__/adapt-classroom-content-eval.spec.ts` 保留为占位（避免 lint/typecheck 报错），并标注指向 `local-docs/test-recipes/`
- [x] **Transition 修复**：用户报告 dev server 警告 `<Transition> expects exactly one child element or component`（line 182）— 根因 label v-for 套在 Transition 下，违反 Vue 3 规则；已移除 label 周围的 Transition（A 类 + B 类共 2 处），保留 chart 的 Transition。修复后 chart 切换仍 320ms 淡入淡出；label 随 subtype key 触发自然重建（无淡入淡出，但功能正确）
- [x] **lint 二次校验**：H5 `pnpm lint` 整仓 → 0 error（3 个 warning 来自 `utils/pm.ts`，与本模块无关）
- [x] **typecheck 二次校验**：H5 `vue-tsc --noEmit` 过滤 `share/teacherProfile` → 0 error
- [ ] **commit 由用户在 IDE/git 自行处理**（用户未要求自动 commit；本归档标记可提交但保留用户决定）
