# 教师画像 A2/B2 接口对接 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**关联路径：** `src/pages/school/teacher-portrait/`（VO / adapter / mock / spec）  
**接口依据：** `getTeacherProfile` 增量字段 `a2DimensionScore` / `b2DimensionScore`

## 1. 目标

将真实 HTTP 响应中的 A2、B2 五维平均分接入已有「评价维度得分」子类型列表，使关 Mock 时也能展示 A2/B2 雷达数据。

**非目标：** UI/轮播/等级卡样式；驾驶舱旁路；删除 legacy `dimensionScore` / `dimensionScoreBySubtype`。

## 2. 接口字段（权威）

| 报告 | 路径 | 说明 |
|------|------|------|
| A2 | `data.postClassReport.aReport.a2DimensionScore` | 可空 Object |
| B2 | `data.postClassReport.bReport.b2DimensionScore` | 可空 Object |

`V2DimensionScore`（内部均可空 number）：

| 字段 | 含义 | 满分（前端常量，不变） |
|------|------|------------------------|
| `knowledgeMastery` | 知识落实度 | 35 |
| `logicalClarity` | 逻辑清晰度 | 25 |
| `introductionDesign` | 导入设计 | 20 |
| `studentEngagement` | 学生参与度 | 10 |
| `summaryDesign` | 小结设计 | 10 |

> 纠正既有设计假设：不再使用 `knowledgeImplementation` 作为 API/常量 key。

## 3. VO 变更

在 `PostClassReportDetailVO` 增加：

```ts
a2DimensionScore?: V2DimensionScore | null
b2DimensionScore?: V2DimensionScore | null
```

其中 `V2DimensionScore` 五键均为 `number | null`（解析时仍兼容裸 number / DimensionDetail）。

语义约定：A 侧读 `aReport.a2DimensionScore`，B 侧读 `bReport.b2DimensionScore`（即使类型挂在同一 DetailVO 上，另一侧字段忽略）。

保留既有：

- `dimensionScore` → A1/B1
- `dimensionScoreBySubtype` → 兼容旧 mock/假想结构

## 4. Adapter 取值优先级

对每个大类 `category ∈ {A,B}`：

1. **Type1（A1/B1）**  
   - `bySubtype[A1|B1]`（若有）  
   - 否则 `dimensionScore`（legacy）  
   - 否则零分占位（保持现行为）

2. **Type2（A2/B2）**  
   - **优先** `a2DimensionScore` / `b2DimensionScore`（新接口）  
   - 否则 `bySubtype[A2|B2]`  
   - 若仍无有效 Type2 分值：**仍 push 空 A2/B2 子类型**（五维 score=0，标签可见）——**产品选项 B**  
   - **`FILL_MISSING_DIMENSION_SUBTYPE_2_MOCK` 置 `false`**：禁止再注入 MOCK 假分  

3. 「有效分值」判定：沿用 `hasAnyDimensionScore`；全 null / 空对象 / 缺字段 → 无效 → 空子类型占位。

字段读取：继续用现有 `readDimensionScore`；`CATEGORY_2_DIMENSION_DEFS[].key` 改为 `knowledgeMastery` 等与接口一致。

### 4.1 空态与轮播

| 条件 | A2/B2 表现 |
|------|------------|
| 有有效 `a2/b2DimensionScore` | 真分数 + 标签 |
| 无字段 / null / 全空 | **标签仍在**，雷达走**子类型视觉空态**（透明面/无线），可轮播 |
| 整模块无任何有效课后报告数据 | 整块面板 `buildEmptyViewModel`（与现网一致；空态默认仍以 A1/B1 轴为主，若实现上需带空 A2/B2 以选项 B 为准可在 plan 写明） |

## 5. Mock / 单测

- `FILL_MISSING_DIMENSION_SUBTYPE_2_MOCK = false`
- `MOCK_A2_DIMENSION_SCORE` / `MOCK_B2_*`：key 改为 `knowledgeMastery`（仅本地 fixture / 调试用，adapter 不再自动注入）
- `teacher-profile-api.mock.ts`：在 `aReport`/`bReport` 上增加真实路径 `a2DimensionScore`/`b2DimensionScore`（可与 `dimensionScoreBySubtype` 并存）
- `teacher-profile.adapter.spec.ts`：  
  - 新增：仅含新字段真分时 A2/B2 正确  
  - 新增：无 2 类字段时仍有空 A2/B2（0 分），无 MOCK 假分  
  - 更新既有 A2/B2 用例的 key

## 6. 验收标准

- [x] VO 含可空 `a2DimensionScore` / `b2DimensionScore`
- [x] Adapter 优先新字段；`knowledgeMastery` 映射到五维雷达「知识落实度」
- [x] 缺/空 2 类字段时：**仍展示 A2/B2 标签**，雷达为空态（0 分），**不**注入 MOCK 假分（`FILL_MISSING_DIMENSION_SUBTYPE_2_MOCK=false`）
- [x] 仅 legacy `dimensionScore` 时 A1/B1 行为不变
- [x] 相关 adapter 单测通过
- [x] 关页面 Mock、真接口有 A2/B2 数据时，评价维度得分可见对应标签与分值

## 7. 风险与兼容

| 风险 | 处理 |
|------|------|
| 旧 mock 仍写 `knowledgeImplementation` | 同步改 mock + 单测 |
| 后端暂不返回 2 类字段 | 空 A2/B2 占位（选项 B），不报错、不假分 |
| `areport`/`breport` 小写 | 继续走现有 `normalizePostClassReportVo` |
