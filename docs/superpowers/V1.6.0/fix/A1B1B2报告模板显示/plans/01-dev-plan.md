# A1/B1/B2 报告模板显示与字段统一 · 执行计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

> **Skill 路由（人工复核 · Mode A）：**
> 本次 plan 全为 TS 类型 + 字段名统一 + 单测。`.agents/routing/SKILL_ROUTING.md` 中 14 个候选 skill 逐一核对：
> - frontend-design / tailwind / improve-animations / tailwindcss-animations → 需 UI/样式/动效，本次**无视觉改动**
> - echarts → 无图表
> - accessibility → 无交互/无障碍改动
> - figma-long-page / ccar-pdf-static-html / clone-website → 无关
> - skill-creator / superpowers-harness-run → 不创建新 skill
> - 阿斯顿 → 不生成文档
>
> **结论：所有 Task 标注「无需 skill」。** 等价于 `router.mjs --annotate` 在当前 14 个 skill 下输出「无匹配」。开发按本 plan Inline 即可。

## Task 1: 扩展 `resolveReportTemplateDisplay` 形参

**Files:**

- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/utils/report-variant.ts`

**Steps:**

1. 在 `resolveReportTemplateDisplay(reportSubType?: string | null)` 增可选第二参 `defaultVariant?: ReportVariant`
2. 实现：合法值返回该子类型；否则返回 `defaultVariant ?? '--'`
3. 保留 1 个原始签名兼容：现有 7 个单测不动
4. 跑 `pnpm vitest run report-variant.spec.ts` 确认 7/7 通过

## Task 2: 新增 `reportVersion` 路径 + 4 个 mapper 默认场景单测

**Files:**

- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/utils/report-variant.spec.ts`

**Steps:**

1. 新增 `defaultVariant` 形参用例（无值→default，有值→value，有值覆盖 default）
2. 新增 `reportVersion` 优先级与 `reportSubType` 回退用例（测试面只到 helper；mapper 集成走 mock 验证）
3. 跑 vitest 确认 7+N 全通过

## Task 3: 改造 4 个 mapper（Batch · 同形替换）

**Files:**

- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a.mapper.ts` （`a.mapper.ts:1081`）
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.ts` （`a2.mapper.ts:1785-1788`）
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b.mapper.ts` （`b.mapper.ts:1361`）
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b2.mapper.ts` （`b2.mapper.ts:59`）

**Steps:**

1. 4 个 mapper 的 header 字段统一改名为 `reportTemplate`
2. 4 个 mapper 的值统一调用 `resolveReportTemplateDisplay(caseBasicInfo?.reportVersion ?? caseBasicInfo?.reportSubType, '<自身>')`
3. A2 mapper 删掉 `|| 'A2'` 冗余兜底

## Task 4: A2 顶栏类型 + hero header 同步

**Files:**

- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/types/classroom-content-analysis-a2-report.ts` （`TypeA2HeaderMeta.templateStyle → reportTemplate`）
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportA2HeroHeader.vue` （line 46 `header.templateStyle → header.reportTemplate`）

**Steps:**

1. 同步类型与模板引用
2. TS 编译须通过

## Task 5: 验证

1. `pnpm vitest run report-variant.spec.ts` 全绿
2. `pnpm tsc --noEmit` 编译通过（type 同步）
3. 模拟打开 A1/A2/B1/B2 各 1 条 case 数据，肉眼确认顶栏「报告模板：xxx」

## Task 6: 交付归档

1. 写 `archive/A1B1B2报告模板显示-delivered.md`，含强制「一致性自检」表格
2. 跑 `pnpm harness:check` 确认无本模块警告
3. 标记 `pnpm harness:status` 为 DELIVERED

## Task 7 (v2 增量): PDF 模板写死 · A1 / B1

**Files:**

- Modify: `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/A/A1/ClassroomContentAnalysisReportA.html` （line 1313）
- Modify: `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/B/B1/ClassroomContentAnalysisReportB.html` （line 1312）

**Steps:**

1. A1：把含 `th:text="${#strings.isEmpty(reportSubType) ...}"` 的 `<span>` 改成 `报告模板：A1`
2. B1：同上，改成 `报告模板：B1`
3. 不动 A2（已写死）、不动 B2（无该字段）
4. 更新 `archive/A1B1B2报告模板显示-delivered.md` 加 v2 增量小节
5. 跑 harness:check 确认本模块仍无警告

## 完成定义

- spec §5 全部验收勾选
- vitest 7+N 全绿
- TS 编译通过
- archive 一致性自检通过
- harness:check 无本模块警告
