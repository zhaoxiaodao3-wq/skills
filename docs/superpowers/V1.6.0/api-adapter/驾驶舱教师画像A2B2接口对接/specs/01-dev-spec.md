# 驾驶舱教师画像 A2/B2 接口对接 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**实现仓：** `apps/data-cockpit` · `src/views/preview/mr-teacher-portrait/detail/`  
**对齐：** 校端 `api-adapter/教师画像A2B2接口对接`（语义一致，路径不同）

## 1. 目标

将 `getTeacherProfile` 的 `a2DimensionScore` / `b2DimensionScore` 接入驾驶舱评价维度雷达；缺数据时子类型空态 + 轮播（选项 B）。

**非目标：** 环图/趋势样式大改；校端仓库改动。

## 2. 接口字段（与校端同一权威）

| 报告 | 路径 |
|------|------|
| A2 | `postClassReport.aReport.a2DimensionScore` |
| B2 | `postClassReport.bReport.b2DimensionScore` |

五维：`knowledgeMastery` / `logicalClarity` / `introductionDesign` / `studentEngagement` / `summaryDesign`（均可空 number）。

## 3. VO

`PostClassReportDetailVO` 增加：

```ts
a2DimensionScore?: V2DimensionScore | null
b2DimensionScore?: V2DimensionScore | null
```

保留 `dimensionScore`、`dimensionScoreBySubtype`。`Category2` 首键改为 `knowledgeMastery`（可保留 deprecated `knowledgeImplementation` 兼容）。

## 4. Adapter

对 A/B 各大类：

1. Type1：bySubtype[A1|B1] → legacy `dimensionScore` → 空 A1/B1 占位  
2. Type2：优先 `a2|b2DimensionScore` → bySubtype[A2|B2] → **空 Type2 占位**  
3. `FILL_MISSING_DIMENSION_SUBTYPE_2_MOCK = false`

## 5. View / 雷达空态

| 层 | 要求 |
|----|------|
| ViewModel 子类型 | 增加 `isEmpty: boolean`（全分 ≤0 或面板空） |
| `dimension-radar-panel` | 雷达 option 使用**当前激活子类型**的空态，而非仅 props 整块 `isEmpty` |
| 整块空态 | subtypes 含 `[A1,A2]` / `[B1,B2]`，指示条可轮播 |

## 6. 改动文件（预估）

- `detail/api/types/teacher-profile-rsp.vo.ts`
- `detail/adapters/constants/content-eval-dimensions.ts`
- `detail/adapters/classroom-content-eval.adapter.ts`
- `detail/mock/content-eval-dimension-subtype.mock.ts`
- 评价维度 Container/ViewModel 映射处（若有）
- `detail/components/classroom-content-eval/dimension-radar-panel.vue`
- 相关 types

## 7. 验收标准

- [x] VO 含可空 a2/b2 字段；key=`knowledgeMastery`
- [x] Adapter 优先真字段；假分开关关闭；缺数据有空 A2/B2
- [x] 雷达按子类型空态渲染；`subtypeCount>1` 可轮播
- [x] A1/B1、levelStat、totalCount 不受损
- [ ] 详情页真接口冒烟：有分见真图，无分见空态轮播

## 8. 风险

| 风险 | 处理 |
|------|------|
| 驾驶舱无 vitest 单测 | 以手工冒烟 + 与校端对照为主；有测则补 |
| areport 小写 | 沿用现有 normalize |
