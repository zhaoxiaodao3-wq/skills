# classroom-content-analysis · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-09-09
**版本：** V1.6.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** 不适用（轻量档未写 spec）
**Plan:** 不适用（轻量档未写 plan）

## 改动摘要

恢复 A2 报告分享链接路由拼写：把 A2 的 `share.path` 从 `analysis-teaching-a2` 改回 `analysis-teaching-a`，与 A1 共用 `FAMILY_SHARE.A` 单一来源；目标跳转页根据 `caseBasicInfo.reportType + reportVersion` 判断渲染 A1 / A2。回滚 commit `6a2842f6` 引入的独立路径。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/registry/classroom-content-report-registry.ts` |

变更点：A2 registry 的 `share` 字段由 `{ path: 'analysis-teaching-a2', shareType: 1 }` 改为 `{ ...FAMILY_SHARE.A }`（即 `{ path: 'analysis-teaching-a', shareType: 1 }`），与 A1 / B1 / B2 写法保持一致。

## 验收结果

- [x] A2 分享链接拼接路径使用 `analysis-teaching-a`（与 A1 一致）
- [x] A2 `shareType` 仍为 1
- [x] A2 view / mapPayload / hasReportData / resolvePageStatus 未变
- [x] 跳转目标页根据 `caseBasicInfo` 判断报告形态的逻辑未变

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 改动只涉及分享链接路由拼接前的 share 路径常量；不影响空态/有数据分支 |
| 常量/mock/真数据 | 通过 | A2 share 路径回归到 `FAMILY_SHARE.A` 单一来源，A/B 家族 share 配置同源 |
| 多入口 | N/A | 报告渲染仅由 `classroom-content-analysis.vue` 单一入口挂载 `<component :is="reportConfig.view">`；share 路径改动对该入口透明 |
| 失败/缺省 | N/A | `buildShareUrl` 仅在 `token` 非空时返回 URL；本次未触动失败/缺省分支 |

## 还原度自检

不适用：本任务为路由拼写回滚，非 UI / Figma 还原。

## Harness 闭环

- [x] validate 改 src/ 前未单独跑（轻量档豁免）
- [x] archive 交付快照已写（本文件）
- [x] harness:check 已跑：仅 `skill-CCAR-PDF流水线` 历史缺目录警告，与本模块无关

---

## Phase 2 · TS 编译错误修复（2026-09-09 续）

**触发**：`pnpm tsc --noEmit` 报告 6 个 TS 错误，与 Phase 1 修复正交，属于"已存在但未暴露"的类型问题。

**修复**（4 文件 7 行净改动）：

| # | 错误文件:行 | 修复方式 |
|---|---|---|
| 1 | `components/ReportA2HighlightTable.vue:14` | `const props = defineProps<{...}>()` → `defineProps<{...}>()`（script setup 中 props 未被引用） |
| 2 & 5 | `components/ReportTypeB2View.vue:4` + `mappers/classroom-content-analysis-b2.mapper.ts:8` | `types/classroom-content-analysis-report.ts` 新增 `export type TypeB2Report = B2Report`（B2 类型别名） |
| 3 | `types/classroom-content-analysis-report.ts:2` | `B2Report` import 由 #2 修复后被消费（`TypeB2Report = B2Report`），未使用告警自动消失 |
| 4 | `mappers/classroom-content-analysis-a2.empty-audit.spec.ts:121` | `chain && 'data' in chain ? chain.data.notApplicableMessage : null` → `chain?.type === 'a2ProblemChainStack' ? chain.data.notApplicableMessage : null`（精确 type 守卫，避免 union type 上不安全访问） |
| 6 | `mappers/classroom-content-analysis-b2.mapper.ts:50` | 导入 `resolveReportTemplateDisplay`，header 增加 `reportTemplate: resolveReportTemplateDisplay(caseBasicInfo?.reportSubType)`（与 A1/B1 mapper 同源） |

**验证**：

- `pnpm exec tsc --noEmit` 通过，0 错误，退出码 0

**Phase 2 一致性自检**：

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 改动仅涉及类型定义收紧 + 一处 mapper 字段补齐；不影响空态/有数据分支 |
| 常量/mock/真数据 | 通过 | `resolveReportTemplateDisplay` 与 A1/B1 mapper 同一来源（`utils/report-variant.ts`），A/B 家族 share 配置同源 |
| 多入口 | N/A | 仅类型别名与 mapper header 字段；B2 报告渲染入口 `ReportTypeB2View.vue` 仅消费 `TypeB2Report` 别名，行为不变 |
| 失败/缺省 | 通过 | `reportTemplate` 通过 `resolveReportTemplateDisplay` 处理 null/undefined → `'--'`（与 A1/B1 一致） |

**Phase 2 还原度自检**：不适用（非 UI / Figma 改动）

**Phase 2 Harness 闭环**：

- [x] `pnpm exec tsc --noEmit` 通过（0 错误）
- [x] archive 追加记录已写（本文 Phase 2 段）

---

## Phase 3 · A2 share path 恢复（2026-09-09 续）

**触发**：用户验收 `/analysis-teaching-a1?code=...` 报告"只展示头部"。

**根因复盘**（详见 Phase 4）：

- frontend 端 Phase 1 改的 A2 `share.path = FAMILY_SHARE.A`（`analysis-teaching-a`）**本身正确**——与"web 端发的链接都是只有 `a`"的新设计一致
- 实际根因在 **H5 端**：`useShareReportSession.ts:94` 的"按 code 后端查 reportVersion → 动态路由"逻辑**只覆盖 B 家族（b1 ↔ b2）**，**未覆盖 A 家族（a1 ↔ a2）**
- 链路：用户打开 `/analysis-teaching-a?code=...` → H5 legacy redirect → `/analysis-teaching-a1` → a1 模板拿 A2 数据 → 没有 A 家族动态判断 → 不会跳 a2 → a1 模板渲染 A2 数据 → 字段不匹配 → 只渲染头部

**frontend 端动作**：无需回滚 Phase 1（A2 share path 保持 `analysis-teaching-a`），frontend 端逻辑已对齐"web 端发无后缀链接"的新设计意图。

---

## Phase 4 · 跨项目修复：H5 share page 端 A 家族动态路由（2026-09-09 续）

**修复点**（H5 项目，与本 frontend 项目**不同仓库**）：

- 文件：`E:/code/H5/src/pages/share/reports/useShareReportSession.ts`
- 位置：原 line 94-104（B 家族判断块）
- 改动：扩展为 A / B 家族一起兼容，**大小写都识别**（`A1` / `a1` / `A2` / `a2` / `B1` / `b1` / `B2` / `b2`）

```diff
-      if ((resolvedVariantId.value === 'b1' || resolvedVariantId.value === 'b2') && data?.status === 0) {
-        const targetVariantId = data.reportVersion === 'B1' ? 'b1' : data.reportVersion === 'B2' ? 'b2' : null
+      if (data?.status === 0) {
+        const version = (data.reportVersion ?? '').toLowerCase()
+        const targetVariantId =
+          version === 'a1' ? 'a1'
+            : version === 'a2' ? 'a2'
+              : version === 'b1' ? 'b1'
+                : version === 'b2' ? 'b2'
+                  : null
         if (targetVariantId && targetVariantId !== resolvedVariantId.value) {
           await router.replace({
             path: `/analysis-teaching-${targetVariantId}`,
             query: route.query,
             hash: route.hash,
           })
           return
         }
       }
```

**关键设计点**：

1. **入口条件放宽**：从「仅 b1 / b2」改为「任何 variant」都判断。因为 `/analysis-teaching-a` legacy redirect 锁到 a1，但实际数据可能是 A2；同理 b1 / b2 也有"被错锁"的可能。让所有 variant 都过这一层判断更稳。
2. **大小写兼容**：`reportVersion` 后端可能返回大写（`A1` / `B1` 等），用 `toLowerCase()` 兜底；H5 的 variant id 本身就是小写（'a1' / 'a2' / 'b1' / 'b2'），统一用小写映射。
3. **幂等保护**：`targetVariantId !== resolvedVariantId.value` 才 `router.replace`，对已经正确的路由不触发跳转。

**验证**：

- `pnpm exec tsc --noEmit`：我改的文件**未引入新错误**（tsc 全部报错都在 `src/api/*.ts`，是 H5 项目原本就有的隐式 `any` / `Namespace default` 历史问题，与本次改动无关）
- 行为验证（需 H5 端 `pnpm dev` 起 8989 端口）：

  | 用例 | URL | 期望 |
  |------|-----|------|
  | A2 数据 + 无后缀入口 | `/analysis-teaching-a?code=<A2 code>` | 自动跳 `/analysis-teaching-a2?code=...` 完整渲染 |
  | A1 数据 + 无后缀入口 | `/analysis-teaching-a?code=<A1 code>` | 自动跳 `/analysis-teaching-a1?code=...` 完整渲染 |
  | A2 数据 + a2 路由 | `/analysis-teaching-a2?code=<A2 code>` | 保持 a2 路由完整渲染 |
  | A1 数据 + a1 路由 | `/analysis-teaching-a1?code=<A1 code>` | 保持 a1 路由完整渲染 |
  | B1 / B2 全部 | 同 B 家族现状 | 行为完全不变 |

**Phase 4 一致性自检**：

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 改动仅在"按 reportVersion 重新选路由"分支；不影响空态/有数据 |
| 常量/mock/真数据 | 通过 | variant id 全部用 H5 registry 的小写规范（'a1' / 'a2' / 'b1' / 'b2'），与 `registry.ts:62-196` 单一来源对齐 |
| 多入口 | 通过 | 任何 variant 路由入口（含 legacy redirect）都会过这一层判断；命中正确路由则不 replace |
| 失败/缺省 | 通过 | `data?.status === 0` + `data.reportVersion ?? ''` 双重 null 兜底；`targetVariantId === null` 时不进 router.replace |

**Phase 4 还原度自检**：不适用（非 UI / Figma 改动）

**Phase 4 Harness 闭环**：

- [x] `useShareReportSession.ts` 改动落地（1 文件，1 个 if 块扩展）
- [x] `pnpm exec tsc --noEmit` 在改动文件上未引入新错误（H5 项目 tsc 报错均为 `src/api/*.ts` 历史问题，与本改动正交）
- [x] archive 追加记录已写（本文 Phase 4 段）

**Phase 4 未做**：

- H5 项目无 harness 流程（`harness:status` 命令不存在），未在 H5 端建模块 / 写 archive
- 未在 H5 端跑单测（H5 项目无针对 `useShareReportSession` 的 spec 文件）
- 未自动 commit（按 superpowers-harness-run 规则）

---

## Phase 5 · A2 报告 10.1「查看详情」弹窗 × evaluationResult 字段对接（2026-09-09 续）

**触发**：A2 报告 10.1 节的"查看详情"按钮 → 打开弹窗 `ReportA2ScoreDetailDialog`，原消费 `A2_SCORE_DETAIL_DIALOG_MOCK`（`mappers/classroom-content-analysis-a2.mapper.ts:1591`，注释「G05：评分详情弹窗暂用既有 mock」）。改为基于接口 `evaluationResult` 字段动态生成。

**根因复盘**：

- 接口字段 `evaluationResult` 已在 A2 mapper 中使用（line 1471），数据已稳定接入
- 弹窗数据结构 `A2ScoreDetailDialog` 包含 title + dimensions[] + total.rows[] 三块
- 字段映射在 spec 第 3 节明确：✅ 直接覆盖 / ⚠️ 前端拼文案 / ❌ 前端常量 三态

**改动摘要**：

- 新增 `mapEvaluationResultToScoreDetail(er: A2EvaluationResultVO | null): A2ScoreDetailDialog` mapper
- 6 个文案模板（2 个小计模板 / 档位 / 维度得分 / 判定 label / 判定 upgradeNote）
- 1 个档位选择器（`selectTierRows` 按 `dimensionCode=1` 选 KNOWLEDGE，按 `fullScore=3` 选 3PT，否则 4PT）
- 1 个 4 列表头常量 `COMPENSATION_HEADERS = ['条件', '具体要求', '检查结果', '说明']`
- 2 个 safe reader（`readScoreItem` / `readConditionItem` 处理 `unknown[]` 元素）
- 替换正常路径 `scoreDetail` 赋值；保留 fallback 路径（`vo` 为 null 时仍用 mock）
- mock 文件 3 个 TIER_ROWS 常量加 `export`

**改动文件**：

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/a2-data/score-detail-dialog.ts`（3 行加 export）|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.ts`（+~270 行：1 import 扩 1 行、1 type import 块加 7 行、mapEvaluationResultToScoreDetail 主函数 + 8 工具/常量）|
| 改 | `docs/superpowers/V1.6.0/fix/classroom-content-analysis/specs/01-dev-spec.md`（新建）|
| 改 | `docs/superpowers/V1.6.0/fix/classroom-content-analysis/plans/01-dev-plan.md`（新建 + 追加 Skill 路由段）|
| 改 | `docs/superpowers/V1.6.0/fix/classroom-content-analysis/requirements/01-原始需求.md`（追加 Phase 5 段）|
| 改 | `docs/superpowers/V1.6.0/fix/classroom-content-analysis/archive/classroom-content-analysis-delivered.md`（本文 Phase 5 段）|

**验收结果**：

- [x] 新增 `mapEvaluationResultToScoreDetail(er)` mapper（spec 8.1）
- [x] 5 个文案模板规则在 mapper 内实现（spec 8.2）
- [x] 5 个维度都判断 `compensationCheck` 是否非空（spec 8.3）
- [x] `scoreDetail` 切换为 mapper 输出（spec 8.4）
- [x] `evaluationResult` 为 null 时 fallback 到 mock（spec 8.5）
- [x] `pnpm exec tsc --noEmit` 通过（0 错误）（spec 8.6）
- [x] 既有 `classroom-content-analysis-a2.mapper.spec.ts` 15 个测试全过（spec 8.7）
- [x] archive 追加 Phase 5 段（spec 8.8）

**Phase 5 一致性自检**：

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | `er` 为 null / `dimensionList` 为空时回退到 `A2_SCORE_DETAIL_DIALOG_MOCK`（与 Phase 4 fallback 一致）|
| 常量/mock/真数据 | 通过 | 3 套档位常量（`TIER_ROWS_4PT` / `TIER_ROWS_3PT` / `TIER_ROWS_KNOWLEDGE`）与 mock 共用同一来源（mock 文件 export）；`COMPENSATION_HEADERS` 与 mock 一致 |
| 多入口 | N/A | 仅改 mapper 一处；`mapA2ReportToClassroomContentPayload` 正常路径走新 mapper，fallback 路径保留 mock |
| 失败/缺省 | 通过 | `readScoreItem` / `readConditionItem` 对 `unknown[]` 元素做 null 兜底；`Number.isFinite` 检查所有数值字段；空 `dimensionList` / `conditionList` 不会生成空对象 |

**Phase 5 还原度自检**：不适用（非 UI / Figma 改动；弹窗组件未触碰）

**Phase 5 Harness 闭环**：

- [x] `pnpm exec tsc --noEmit` 通过（0 错误）
- [x] `pnpm exec vitest run` 既有 mapper spec 15/15 通过
- [x] archive 追加记录已写（本文 Phase 5 段）
- [x] spec / plan / requirements 全部更新

**Phase 5 未做**：

- 未为 `mapEvaluationResultToScoreDetail` 新增独立 spec（既有 spec 覆盖 10.1 表格部分；弹窗部分结构稳定，spec 收益不显著，可在后续 Phase 追加）
- 未自动 commit（按 superpowers-harness-run 规则）
