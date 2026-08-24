# 实施 Plan · 课堂教学内容分析 A2/B2

**Spec:** [../specs/spec.md](../specs/spec.md) · **Requirement:** [../requirements/requirements.md](../requirements/requirements.md)

**Goal:** Registry + Family/Variant 支持 A2/B2，保持 A/B（A1/B1）零回归。

---

## Phase 0 — 基建（已完成）

### Task 1: report-variant.ts

- [x] `parseReportVariant` / `ReportFamily` / `ReportVariant`
- [x] `isReportFamilyA` / `isReportFamilyB`
- [x] `report-variant.spec.ts`

### Task 2: classroom-content-report-registry.ts

- [x] `ClassroomContentReportConfig` 接口
- [x] family 默认 status/share
- [x] 显式注册 A1/A2/B1/B2
- [x] `getClassroomContentReportConfig` + unknown → B1

### Task 3: classroom-content-analysis.vue

- [x] `parseReportVariant` + `getClassroomContentReportConfig`
- [x] payload / hasReportData / status 走 config
- [x] `<component :is="config.view">`

### Task 4: 类型与白名单扩展

- [x] `DiagnosisReportType` 含 A1/A2/B1/B2
- [x] `resolveDiagnosisReportType` / `analysis-report-category`
- [x] family 工具替换 labels / evaluation-score-level

### Task 5: 列表筛选回退

- [x] `ai-autonomous-analysis/index.vue` 仅 A类/B类

### Task 6: 收窄外围侵入

- [x] 回退 `key-knowledge-points-comparison.vue`
- [x] 外围工具加「仅大类」注释

### Task 7: 类型统一到 report-variant

- [x] `DIAGNOSIS_REPORT_TYPES` / `isKnownDiagnosisReportType`
- [x] 消费方 re-export，删除手写白名单
- [x] 单测补 A1/B1

### Task 8: 独立 mapper + 显式 registry

- [x] 新建 `a2.mapper.ts` / `b2.mapper.ts`
- [x] 去掉 a/b.mapper version 参数
- [x] registry 去掉 factory，改为显式块
- [x] mock 用 `isReportFamilyA`

---

## Phase 1 — A2/B2 内容（待后端）

- [ ] 确认 aReport/bReport 或 V2 字段结构
- [ ] 在 a2/b2.mapper 实现章节映射
- [ ] 可选 ReportTypeA2View / ReportTypeB2View
- [ ] mock + 单测补充

---

## Phase 2 — 外围（按需）

- [ ] score-trend 若接口含 A2/B2
- [ ] 静态预览页

---

## 新增 A3 时（Checklist）

1. [ ] `report-variant.ts` 枚举
2. [ ] 新建 `a3.mapper.ts`
3. [ ] registry 复制 A2 块
4. [ ] 可选新 View
5. [ ] 单测
6. [ ] **不改** 列表 / 对比页 / 状态机
