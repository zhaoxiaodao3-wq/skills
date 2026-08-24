# 课堂教学内容分析 · A2/B2 报告类型扩展

> **分支：** `v1.6.0/llb`（基于 develop）  
> **分类：** api-adapter  
> **状态：** Phase 0 已交付（2026-08-24）  
> **Harness：** [requirements/requirements.md](./requirements/requirements.md) · [specs/spec.md](./specs/spec.md) · [plans/plan.md](./plans/plan.md) · [archive/delivered.md](./archive/delivered.md)

---

## 1. 需求变更记录（全部）

### 1.1 原始需求

- 后端新增 `A2`、`B2`；原有 `A`/`B` 不变（分别等价 **A1/B1**）
- 不破坏现有 A/B 行为；支持后续 A3/A4…
- 最小改动：复用 View/Mapper/状态机，避免整份复制
- 先 spec/plan 确认再改 `src/`

### 1.2 列表页不增筛选（2026-08-24）

- **列表页**报告类型筛选保持 **A类 / B类** 两项，不增 A2/B2
- 课堂教学内容分析页 registry 能力不变
- 表格若后端返回 `A2`/`B2`，`getReportTypeLabel` fallback 显示原值

### 1.3 两大类 + 子版本模型（2026-08-24 确认）

| 层级 | 含义 | 列表筛选 |
|------|------|----------|
| **大类 Family** | 对外仅 A / B | 仅 A类/B类 |
| **子版本 Variant** | A1/A2、B1/B2 | 不做 |

- 现有 `ReportTypeAView` / `ReportTypeBView` **不改名**（= A1/B1）
- 新子版本用新组件名（如 `ReportTypeA2View`）
- A2 不算新大类：仍走 A 家族 status / 分享 / 标签

### 1.4 A/A1、B/B1 双写法兼容（2026-08-24）

- 后端可能发 `A` 或 `A1`、`B` 或 `B1`，前端都要认
- **单一真相源** `report-variant.ts` 统一枚举与白名单
- 子版本差异**只在报告页**；重难点对比等页不读子版本

### 1.5 架构调整：独立 mapper + 显式 registry（2026-08-24）

- 废弃 a/b.mapper 的 `version` 参数
- 每个子版本独立 mapper 文件（`a2.mapper.ts` / `b2.mapper.ts`）
- registry 显式注册 A1/A2/B1/B2 各一块

---

## 2. 产品模型

```
后端 reportType (A/A1/A2/B/B1/B2/G)
    ↓
report-variant.ts          ← 枚举、解析、大类判断（单一真相源）
    ↓
registry[variant]          ← 仅课堂教学内容分析报告页
    ├─ view
    ├─ mapPayload → 独立 mapper
    ├─ hasReportData
    ├─ resolvePageStatus（按大类）
    └─ share（按大类，可 per-variant 覆盖）
```

| 子版本 | 后端 raw | mapper | View |
|--------|----------|--------|------|
| A1 | `A` / `A1` | `classroom-content-analysis-a.mapper.ts` | `ReportTypeAView` |
| A2 | `A2` | `classroom-content-analysis-a2.mapper.ts`（Phase 0 委托 a） | `ReportTypeAView` |
| B1 | `B` / `B1` | `classroom-content-analysis-b.mapper.ts` | `ReportTypeBView` |
| B2 | `B2` | `classroom-content-analysis-b2.mapper.ts`（Phase 0 委托 b） | `ReportTypeBView` |

---

## 3. 已交付改动

### 新增

| 路径 | 作用 |
|------|------|
| `utils/report-variant.ts` | 枚举、解析、family 工具 |
| `utils/report-variant.spec.ts` | 单测 |
| `registry/classroom-content-report-registry.ts` | 显式注册表 |
| `mappers/classroom-content-analysis-a2.mapper.ts` | A2 |
| `mappers/classroom-content-analysis-b2.mapper.ts` | B2 |

### 修改

| 路径 | 改动 |
|------|------|
| `classroom-content-analysis.vue` | registry + 动态组件 |
| `a.mapper.ts` / `b.mapper.ts` | 仅 A1/B1，无 version |
| `case-basic-info.ts` | `isKnownDiagnosisReportType` |
| `analysis-report-category.ts` | 统一白名单 |
| `classroom-content-labels.ts` | 大类 tag |
| `evaluation-score-level.ts` | 大类对比来源 |
| `mock/classroom-content-static-payload.ts` | `isReportFamilyA` |
| 类型文件 | re-export from report-variant |

### 明确不改

- `key-knowledge-points-comparison.vue` — 仍用 `diagnosisHasCoreLessonPlan`
- `ai-autonomous-analysis/index.vue` — 列表仅 A类/B类
- `ReportTypeAView` / `ReportTypeBView` — 不改名

---

## 4. 新增子类型（以 A3 为例）

1. **`report-variant.ts`** — `CLASSROOM_CONTENT_REPORT_RAW_TYPES`、`KNOWN_VARIANTS`、`VARIANT_META` 加 A3
2. **新建** `mappers/classroom-content-analysis-a3.mapper.ts`（禁止在 a.mapper 堆 version）
3. **`registry`** — 复制 A2 块，改 import / 函数名 / view
4. **View** — 布局不同时新建 `ReportTypeA3View.vue`
5. **单测** — `report-variant.spec.ts` 补 A3
6. **不用改** — 列表筛选、重难点对比、状态机、其它业务页

### registry 配置项

| 配置项 | 何时改 |
|--------|--------|
| `view` | 布局不同 |
| `resolveReportData` | 后端换 key（如 `aReportV2`） |
| `mapPayload` | 章节结构变化 → 独立 mapper |
| `hasReportData` | 判空规则变化 |
| `resolvePageStatus` | 一般不改（跟大类） |
| `share` | 分享 path/type 独立时 |

---

## 5. 常见坑

| 现象 | 处理 |
|------|------|
| `A1` 掉进 G 类菜单 | `DIAGNOSIS_REPORT_TYPES` 须含 A1/B1 |
| A2 内容仍是 A1 | 改 `a2.mapper.ts`，不是 a.mapper |
| 在 a.mapper 堆 version | **禁止**；新建独立 mapper |
| mock 预览不对 | static-payload 用 `isReportFamilyA` |

---

## 6. 路径速查

```
src/pages/analysis-web/ai-teaching-diagnosis/
├── utils/report-variant.ts
├── classroom-diagnosis/
│   ├── classroom-content-analysis.vue
│   ├── registry/classroom-content-report-registry.ts
│   └── components/ReportTypeAView.vue · ReportTypeBView.vue
└── mappers/
    ├── classroom-content-analysis-a.mapper.ts    # A1
    ├── classroom-content-analysis-a2.mapper.ts   # A2
    ├── classroom-content-analysis-b.mapper.ts    # B1
    └── classroom-content-analysis-b2.mapper.ts   # B2
```

---

## 7. 待 Phase 1

- [ ] A2/B2 独立章节映射（待后端 JSON）
- [ ] 可选：`ReportTypeA2View` 若布局与 A1 不同

**一句话：产品上只有 A/B 两大类；每个子版本 = 独立 mapper + registry 显式块；枚举只在 `report-variant.ts` 改。**
