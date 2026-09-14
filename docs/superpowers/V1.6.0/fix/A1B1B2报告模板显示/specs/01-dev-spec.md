# A1/B1/B2 报告模板显示与字段统一 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

让 `classroom-content-analysis` 页在 4 个子版本（A1/A2/B1/B2）下，顶栏「报告模板：xxx」都能显示正确的子类型值；并把 4 个 mapper 输出 header 字段名统一为 `reportTemplate`。

## 2. 字段契约（沿用前置模块）

| 字段 | 类型 | 来源 | 含义 |
|------|------|------|------|
| `CaseBasicInfo.reportType` | `'A' \| 'B' \| 'G'` | 后端已有 | 大类（路由不依赖此值做子版本判断） |
| `CaseBasicInfo.reportSubType` | `'A1' \| 'A2' \| 'B1' \| 'B2' \| null` | 后端暂未下发（前端预留/mock） | 子类型备选 |
| `CaseBasicInfo.reportVersion` | `string \| null` | **后端实际下发** | 子类型权威字段 |

**读取优先级：** `reportVersion ?? reportSubType`。两者都缺时按 mapper 自身默认。

## 3. 关键设计

### 3.1 共享 helper（建议加在 `utils/report-variant.ts`）

扩展现有 `resolveReportTemplateDisplay` 增加可选默认参数；4 个 mapper 共用一份逻辑：

```ts
/**
 * 顶栏「报告模板」展示值。
 * - 传入 reportVersion/reportSubType 任一合法值 → 返回该子类型
 * - 都不合法且未传 defaultVariant → 返回 '--'
 * - 都不合法但传了 defaultVariant → 返回 defaultVariant（适用 mapper 自身默认）
 */
export function resolveReportTemplateDisplay(
  reportVersionOrSubType?: string | null,
  defaultVariant?: ReportVariant,
): string {
  const valid = normalizeReportSubType(reportVersionOrSubType)
  if (valid) return valid
  return defaultVariant ?? '--'
}
```

> **不引入新函数**：保留原函数名 + 增加可选第二参，保持现有 7 个单测不动。

### 3.2 4 个 mapper 统一写法

每个 mapper 顶栏字段都叫 `reportTemplate`，调用：

| Mapper | 调用 |
|--------|------|
| `a.mapper.ts` | `reportTemplate: resolveReportTemplateDisplay(caseBasicInfo?.reportVersion ?? caseBasicInfo?.reportSubType, 'A1')` |
| `a2.mapper.ts` | `reportTemplate: resolveReportTemplateDisplay(caseBasicInfo?.reportVersion ?? caseBasicInfo?.reportSubType, 'A2')` |
| `b.mapper.ts` | `reportTemplate: resolveReportTemplateDisplay(caseBasicInfo?.reportVersion ?? caseBasicInfo?.reportSubType, 'B1')` |
| `b2.mapper.ts` | `reportTemplate: resolveReportTemplateDisplay(caseBasicInfo?.reportVersion ?? caseBasicInfo?.reportSubType, 'B2')` |

> A2 mapper 当前还残留 `|| 'A2'` 兜底 + 输出字段名 `templateStyle`，本次一并清掉。

### 3.3 类型与组件同步

- `classroom-diagnosis/types/classroom-content-analysis-a2-report.ts` → `TypeA2HeaderMeta.templateStyle` 改为 `reportTemplate: string`。
- `classroom-diagnosis/components/ReportA2HeroHeader.vue` 模板中 `header.templateStyle` 改为 `header.reportTemplate`。
- `classroom-diagnosis/components/ReportHeroHeader.vue`（A1/B1/B2 共用）已经是 `header.reportTemplate`，不动。

## 4. 改动范围

| 文件 | 改动 |
|------|------|
| `src/pages/analysis-web/ai-teaching-diagnosis/utils/report-variant.ts` | `resolveReportTemplateDisplay` 增加可选 `defaultVariant` 形参 |
| `src/pages/analysis-web/ai-teaching-diagnosis/utils/report-variant.spec.ts` | 新增 4 个 mapper 默认场景 + `reportVersion` 路径用例 |
| `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a.mapper.ts` | 改读 `reportVersion ?? reportSubType` + `defaultVariant='A1'` |
| `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.ts` | 改读 `reportVersion ?? reportSubType` + `defaultVariant='A2'`；输出字段名 `templateStyle → reportTemplate` |
| `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b.mapper.ts` | 改读 `reportVersion ?? reportSubType` + `defaultVariant='B1'` |
| `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-b2.mapper.ts` | 改读 `reportVersion ?? reportSubType` + `defaultVariant='B2'` |
| `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/types/classroom-content-analysis-a2-report.ts` | `TypeA2HeaderMeta.templateStyle` 改名为 `reportTemplate` |
| `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportA2HeroHeader.vue` | 模板里 `header.templateStyle` 改 `header.reportTemplate` |

**不改：**

- `classroom-content-report-registry.ts` / `parseReportVariant` / `getClassroomContentReportConfigByType`
- `ReportTypeAView` / `ReportTypeBView` / `ReportTypeA2View` / `ReportTypeB2View`
- `classroom-content-analysis.vue`（页面读取入口已在 `getClassroomContentReportConfigFromCaseBasicInfo` 中兼容 `reportVersion ?? reportSubType`，见 `registry/classroom-content-report-registry.ts:148`）
- `CaseBasicInfo` 类型（已含两个字段）
- `api-adapter/课堂教学内容报告子类型` 已交付的 spec/plan/archive

## 5. 验收

按 `requirements/01-原始需求.md §5` 全部用例通过；`pnpm vitest run report-variant.spec.ts` 全绿。

## 6. 非目标

- 不动菜单 AB/G 分类
- 不等待后端字段正式上线（mock 路径同样需通过）
- 不改 A2/B2 的 UI 区块结构

## 7. 还原度自检

不适用：无 Figma / 非 UI（仅文案字段，无视觉改动）

---

## 8. v2 增量 · PDF 模板同步写死（外链 muban 仓）

**触发：** 前端 v1 已让 web 顶栏正常显示，但 PDF 静态模板仍读 `reportSubType` 变量；后端实际未下发该字段 → PDF 端显示 `--`，与 web 行为不一致。

**目标：** 同步把 A1 / B1 / A2 PDF 模板的「报告模板：xxx」写死为各自子类型；B2 模板当前无该字段，不动。

**模板现状 & 目标：**

| 文件 | 现状 | 目标 |
|------|------|------|
| `muban/analysis-service/src/main/resources/lessonTemplates/A/A1/ClassroomContentAnalysisReportA.html:1313` | `报告模板：<span th:text="${#strings.isEmpty(reportSubType) ? '--' : reportSubType}">--</span>` | 写死 `报告模板：A1` |
| `muban/analysis-service/src/main/resources/lessonTemplates/A/A2/ClassroomContentAnalysisReportA.html:1502` | 已写死 `报告模板：A2` | 不动 |
| `muban/analysis-service/src/main/resources/lessonTemplates/B/B1/ClassroomContentAnalysisReportB.html:1312` | 读 `reportSubType` 变量 | 写死 `报告模板：B1` |
| `muban/analysis-service/src/main/resources/lessonTemplates/B/B2/ClassroomContentAnalysisReportB.html` | 无该字段 | 不动 |

**改动范围（v2 增量）：** 仅 2 个文件、2 行字符串替换。

**为什么 B2 不动：** B2 PDF 模板当前结构里没有「报告模板」字段（与 web 端 B2 View 的 hero 也不展示此位），保持与 A2 一致策略（写死 = 与 web 行为匹配 = PDF 端不需后端下发 `reportSubType`/`reportVersion`）。

**为什么走这个模块：** 同一根因（`reportSubType` 字段后端未下发）、同一 fix（写死避免显示 `--`）、同一交付日；不另起 fix 模块，与 web 改动作为一组完整 fix 归档。
