# 课堂教学内容报告子类型 · 执行计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

> **Skill 路由：** Mode A 测评无前端专用 skill；交付阶段走 `superpowers-harness`（一致性自检 / harness:check）。开发按本 plan Inline 即可。

## Task 1: 双字段契约与 parseReportVariant

**Files:**

- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/utils/report-variant.ts`
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/utils/report-variant.spec.ts`
- Modify: `src/types/teaching-diagnosis-case-basic-info.ts`

**Steps:**

1. 将诊断大类白名单收窄为 **仅** `A|B|G`；新增 `ReportSubType = A1|A2|B1|B2`
2. `CaseBasicInfo` 增加可选 `reportSubType?: ReportSubType | null`（后端暂无，可空）
3. `parseReportVariant(reportType, reportSubType?)`：无 subType 时 **A→A1、B→B1**；有则用 subType
4. 更新单测：缺省映射、有 subType、reportType 非法/非 ABG
5. 跑 `vitest` 针对该 spec 文件
6. **不再**把 A1/A2/B1/B2 当作合法 `reportType`

## Task 2: 页面与 registry 接线（Batch: 同形接线）

**Files:**

- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/registry/classroom-content-report-registry.ts`
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/classroom-content-analysis.vue`
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/utils/case-basic-info.ts`（如需）
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/utils/analysis-report-category.ts`（如需）

**Steps:**

1. registry 入口改为 `getClassroomContentReportConfigByType(reportType, reportSubType?)`
2. 页面从 `caseBasicInfo.reportSubType` 读取并传入
3. 菜单/已知类型校验：大类只认 A/B/G；子类型不污染菜单分支
4. 确认 A/B View、mapper 调用链不变

## 完成定义

- harness:check 无本模块警告
- 验收项全部勾选
- 交付 archive 含一致性自检
