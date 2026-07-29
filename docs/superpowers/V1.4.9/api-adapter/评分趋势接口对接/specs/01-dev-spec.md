# 评分趋势接口对接 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：独立 `getScoreTrend` + adapter 映射；Container 按 `activeTeacherId` 拉取；`score`/`scoreLevel` 空值保留并展示 `--`。图表布局与样式不改。

## 1. 目标

1. 用真实接口替换评分趋势 Mock 数据源
2. 将 `ScoreTrendVO` 转为现有 `ScoreTrendReportItem`（含等级枚举映射）
3. 空值友好：分数/等级缺失时保留条目，文案 `--`

## 2. 方案与范围

| 操作 | 路径 |
|------|------|
| 新增 | `api/get-score-trend.ts` |
| 新增 | `api/types/score-trend.vo.ts` |
| 新增 | `adapters/score-trend.adapter.ts`（可选 `*.spec.ts`） |
| 改 | `components/classroom-content-eval/types.ts`（`score`/`gradeKey` 可空） |
| 改 | `score-trend-chart-options.ts`（tooltip `--`；空 score 折线点为 `null`） |
| 改 | `ClassroomContentEvalContainer.vue`（独立请求 + 注入 ViewModel） |
| 保留 | `score-trend.mock.ts`（默认不引用） |

**不改：** View 布局、ScoreTrendPanel 壳样式、环图/雷达业务。

## 3. API

```ts
// GET /analysis/v2/teachingDiagnosis/scoreTrend?tenantUserId=
getScoreTrend({ tenantUserId: string }): Promise<ScoreTrendVO[]>
```

`ScoreTrendVO`：

```ts
{
  id: number
  name: string
  scoreLevel: string | null  // EXCELLENT | GOOD | QUALIFIED | NEED_IMPROVEMENT
  score: number | null
  reportType: string         // A | B
  genTime: string
}
```

与现有 `getTeachingStatistics` / `defineService` 写法对齐。

## 4. Adapter 映射

| VO | ViewModel | 规则 |
|----|-----------|------|
| `reportType` | `reportType` | 仅 `A`/`B` 合法；否则**丢弃整条** |
| `score` | `score: number \| null` | 非数字 → `null`（保留条目） |
| `name` | `lessonName` | trim；空 → `'--'` |
| `genTime` | `generatedAt` | 空格时间规范化（如 `T` 替换）；空 → `''` |
| `scoreLevel` | `gradeKey` / `gradeLabel` | 见下表 |

### 等级映射

| `scoreLevel` | `gradeKey` | `gradeLabel` |
|--------------|------------|--------------|
| `EXCELLENT` | `excellent` | 优秀 |
| `GOOD` | `good` | 良好 |
| `QUALIFIED` | `pass` | 合格 |
| `NEED_IMPROVEMENT` | `needsImprovement` | 待改进 |
| 空 / 未知 | `null` | `--` |

排序：adapter 输出后仍走现有 `sortScoreTrendReportsDesc`（按 `generatedAt` 降序）。

## 5. Container 数据流

```
activeTeacherId 变化
  → 无 id：scoreTrend = { reports: [], isEmpty: true }
  → 有 id：getScoreTrend → adapt → sort → scoreTrend
  → catch：空态（不 toast 阻断整页；可选 console）
```

- 与 `aggregate.classroomContentEval` **解耦**：环图空态时趋势仍可有数据（反之亦然）
- `viewModel.scoreTrend` 始终来自上述请求结果，**不再**调用 Mock
- 请求竞态：用请求世代号 / 比对当前 `activeTeacherId`，丢弃过期响应

## 6. 图表空值行为

- `score == null`：系列 data 该点为 `null`（断点/不连线处按 ECharts 默认），tooltip 评分文案 `--`
- `gradeKey == null`：tooltip 评级文案 `--`，色点用中性灰（如 `#c9cdd4`）
- `isEmpty`：仅当 `reports.length === 0`（接口空数组或失败）

## 7. 验收清单

- [x] 真实接口有数据时 A/B 折线与 tooltip 正确
- [x] `EXCELLENT/GOOD/QUALIFIED/NEED_IMPROVEMENT` → 优秀/良好/合格/待改进 + 色点
- [x] `score`/`scoreLevel` 为空保留条目，文案 `--`
- [x] `reportType` 非法条目被过滤
- [x] 空列表 / 失败 → 趋势空态，环图雷达不受影响
- [x] 切换教师后趋势更新；无教师不发请求
- [x] 默认生产路径不使用 Mock
