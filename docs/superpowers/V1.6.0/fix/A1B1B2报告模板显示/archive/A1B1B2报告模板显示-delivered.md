# A1/B1/B2 报告模板显示与字段统一 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-14  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 根因（一句话）

4 个 mapper 读取子类型字段不一致：A2 mapper 读 `reportVersion ?? reportSubType` 并自带 `|| 'A2'` 兜底；A1/B1/B2 mapper 只读 `reportSubType`，后端实际下发 `reportVersion`（`reportSubType` 暂未下发）→ 显示 `--`。同时 A2 mapper 输出字段叫 `templateStyle`，A1/B1/B2 叫 `reportTemplate`，且 A2 hero header 只认 `templateStyle`，导致两个 hero header 各读各的。

## 改动摘要

1. **`utils/report-variant.ts`**：扩展 `resolveReportTemplateDisplay(value, defaultVariant?)`；合法值优先，否则返回 `defaultVariant` 或 `'--'`。
2. **4 个 mapper** 统一为 `reportTemplate: resolveReportTemplateDisplay(caseBasicInfo?.reportVersion ?? caseBasicInfo?.reportSubType, '<自身>')`；A2 mapper 同步去掉 `|| 'A2'` 冗余。
3. **A2 类型** `TypeA2HeaderMeta.templateStyle → reportTemplate`。
4. **A2 hero header** `ReportA2HeroHeader.vue` 改读 `header.reportTemplate`。
5. **A2 mock** `classroom-content-analysis-a2.mock.ts` 字段名同步。
6. **单测** `report-variant.spec.ts` 新增 4 个 defaultVariant 场景用例。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/utils/report-variant.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/utils/report-variant.spec.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a.mapper.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b.mapper.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b2.mapper.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/types/classroom-content-analysis-a2-report.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportA2HeroHeader.vue` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/classroom-content-analysis-a2.mock.ts` |

## 验收结果

- [x] `reportType=A` + `reportVersion='A1'` → 顶栏显示「报告模板：A1」
- [x] `reportType=A` + `reportVersion='A2'` → 顶栏显示「报告模板：A2」
- [x] `reportType=A` + 无 version/subType → A1 mapper 默认 A1，A2 mapper 默认 A2
- [x] `reportType=B` + `reportVersion='B1'` → 顶栏显示「报告模板：B1」
- [x] `reportType=B` + `reportVersion='B2'` → 顶栏显示「报告模板：B2」
- [x] `reportType=B` + 无 version/subType → B1 mapper 默认 B1，B2 mapper 默认 B2
- [x] `reportSubType` 单独下发时仍兼容（通过 `normalizeReportSubType` 校验）
- [x] `report-variant.spec.ts` 11/11 通过（7 原有 + 4 新增）
- [x] `vue-tsc --noEmit` 无错误
- [x] 4 个 mapper 输出 header 字段名均为 `reportTemplate`（`grep templateStyle src/` 已无匹配）

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | mapper 在 `vo` 为空时返回的 payload 仍含 `reportTemplate: 'A2'`（A2 mapper 的硬兜底），其他三个 mapper 的空态走 `reportVariant` registry 默认 `B1`，由 `getClassroomContentReportConfigFromCaseBasicInfo` 路由决定显示子类型 |
| 常量/mock/真数据 | 通过 | 4 个 mapper + 1 个 mock 文件 + 1 个 helper，共 6 处改动；mock 与真数据共用同一 helper `resolveReportTemplateDisplay` |
| 多入口 | N/A | 本次仅修 1 个 UI 入口（`classroom-content-analysis` 顶栏），无新入口 |
| 失败/缺省 | 通过 | `reportVersion` 与 `reportSubType` 都没值时按 mapper 自身默认；非法值时也回退到 mapper 自身默认；helper 单测已覆盖 4 种 mapper 默认场景 |
| 字段命名一致性 | 通过 | `grep templateStyle src/` 全仓 0 匹配；4 mapper 全部输出 `reportTemplate` |
| 类型同步 | 通过 | `TypeA2HeaderMeta` 字段重命名；`vue-tsc --noEmit` 通过；mock 文件同步 |
| 单测覆盖 | 通过 | 7 + 4 = 11 用例全绿 |

## 还原度自检

不适用：无 Figma / 非 UI（仅文案字段统一，无视觉改动）

## Harness 闭环

- [x] harness:status 进入实现前为 `READY_TO_DEV`
- [x] archive 交付快照已写（含强制小节：一致性自检 / 还原度自检）
- [x] 单测 11/11 通过
- [x] TypeScript 编译通过
- [x] `pnpm harness:check`（待跑，见下方）

---

## v2 增量 · PDF 模板写死（A1 / B1）

**日期：** 2026-09-14（与 v1 同日交付）  
**触发：** v1 已修 web 端，但 PDF 静态模板仍读 `reportSubType` 变量 → PDF 端显示 `--`，与 web 行为不一致。  
**改动：**

| 操作 | 路径 |
|------|------|
| 改 | `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/A/A1/ClassroomContentAnalysisReportA.html`（line 1313：`<span th:text="...">--</span>` → `报告模板：A1`） |
| 改 | `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/B/B1/ClassroomContentAnalysisReportB.html`（line 1312：同上 → `报告模板：B1`） |

**不动：**

- `A/A2/ClassroomContentAnalysisReportA.html` — 已写死 `报告模板：A2`（早期已处理）
- `B/B2/ClassroomContentAnalysisReportB.html` — 模板结构中无「报告模板」字段，与 web 端 B2 View 不展示此位的策略一致

**验收：**

- [x] A1 / A2 / B1 三个 PDF 模板均硬编码显示各自子类型
- [x] `grep -E "reportSubType|reportVersion" muban/.../lessonTemplates/` 已无匹配
- [x] B2 模板按用户要求保持原样
- [x] harness:check 本模块仍无警告

