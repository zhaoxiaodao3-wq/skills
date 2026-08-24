# 开发 Spec · 课堂教学内容分析 A2/B2

**Requirement:** [../requirements/requirements.md](../requirements/requirements.md)  
**操作指南:** [../README.md](../README.md)  
**状态：** Phase 0 已交付

---

## 0. 已确认决策

| # | 问题 | 结论 |
|---|------|------|
| 0 | 产品模型 | 仅 A/B 大类；子版本 A1/A2/B1/B2 |
| 1 | 数据字段 | 暂 `aReport`/`bReport`；registry `resolveReportData` 可换 |
| 2 | 状态 | family 级共用 |
| 3 | UI | per-variant `view`；A1=ReportTypeAView |
| 4 | 分享 | family 默认；per-variant 可覆盖 |
| 5 | 列表 | 仅 A类/B类 |
| 6 | 命名 | 现有组件不改名 |
| 7 | mapper | 每子版本独立文件，无 version 参数 |
| 8 | 类型 | `report-variant.ts` 单一真相源；兼容 A/A1、B/B1 |

---

## 1. 成功标准

| # | 标准 | 状态 |
|---|------|------|
| S1 | `A`/`B` 行为与线上一致 | ✅ |
| S2 | `A2`/`B2` 正确解析并展示 | ✅ Phase 0 |
| S3 | 入口页无 `=== 'A'` 硬编码 | ✅ |
| S4 | 外围仅 family 级 | ✅ |
| S5 | 加版本 primarily registry + mapper | ✅ |

---

## 2. 架构

### 数据流

```
raw reportType → parseReportVariant → registry[variant]
  → view / mapPayload / hasReportData / resolvePageStatus / share
```

### 文件结构

```
utils/report-variant.ts
mappers/a.mapper.ts · a2.mapper.ts · b.mapper.ts · b2.mapper.ts
registry/classroom-content-report-registry.ts
classroom-content-analysis.vue
```

### Registry 注册表

| variant | view | data | mapper | status/share |
|---------|------|------|--------|--------------|
| A1 | ReportTypeAView | aReport | a.mapper | family A |
| A2 | ReportTypeAView | aReport | a2.mapper | family A |
| B1 | ReportTypeBView | bReport | b.mapper | family B |
| B2 | ReportTypeBView | bReport | b2.mapper | family B |

### 类型模型

```typescript
// report-variant.ts
export const DIAGNOSIS_REPORT_TYPES = ['A','A1','A2','B','B1','B2','G'] as const

const KNOWN_VARIANTS = {
  A: 'A1', A1: 'A1', A2: 'A2',
  B: 'B1', B1: 'B1', B2: 'B2',
}
```

对外展示/接口仍用后端 raw；内部 variant 仅前端路由。

---

## 3. 方案选择

**采用：** Registry + Family/Variant + 独立 mapper 文件。

**拒绝：**
- 全局 A2→A 映射（丢版本信息）
- 每版本整份复制 View/Mapper（除非 UI 差异大）

---

## 4. 外围侵入策略

| 文件 | 策略 |
|------|------|
| classroom-content-analysis + registry | 子版本区分（必要） |
| report-variant.ts | 解析（必要） |
| case-basic-info / analysis-report-category | 白名单（必要） |
| classroom-content-labels / evaluation-score-level | 大类（轻量） |
| key-knowledge-points-comparison | **不改** |
| ai-autonomous-analysis 列表 | **仅 A/B 筛选** |

---

## 5. 阶段

### Phase 0（已交付）

registry、report-variant、a2/b2 mapper、入口改造、类型统一、列表不增筛、收窄外围侵入。

### Phase 1（待后端）

在 a2/b2.mapper 实现真实章节映射；可选独立 View。

### Phase 2（按需）

score-trend、静态预览页等。

---

## 6. 风险

| 风险 | 缓解 |
|------|------|
| A2 JSON 差异大 | 独立 mapper |
| 未知 reportType | fallback B1 + warn |
| 分享 path 独立 | registry share 覆盖 |

---

## 7. 验收

- [x] A/B/A2/B2 路由正确
- [x] 无硬编码分支
- [x] 列表不增 A2/B2 筛
- [x] 单测通过
- [ ] A2/B2 独立内容映射（Phase 1）
