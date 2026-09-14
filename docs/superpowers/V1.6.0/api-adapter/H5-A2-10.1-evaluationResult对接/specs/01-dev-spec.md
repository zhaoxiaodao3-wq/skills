# H5 A2 10.1 对接 evaluationResult · Dev Spec

**模块：** `api-adapter/H5-A2-10.1-evaluationResult对接`  
**档位：** 标准  
**日期：** 2026-09-09  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**对齐：** Web `api-adapter/A2-10.1-evaluationResult对接`（已 DELIVERED）

## 1. 目标

H5 A2 10.1 改为消费 `evaluationResult`；逻辑与 Web 一致；**不改** H5 10.1 样式与组件树。

## 2. 数据源

```text
extractA2ReportVo → evaluationResult
  ├── dimensionList[]
  └── totalCalc
```

与 Web `PostClassReportA2VO.evaluationResult` 同构；信封仍经现有 `extractA2ReportVo`。

## 3. 维度卡映射（保持现有 A2FieldCard 槽位）

| UI 槽位 | 取值 |
|---------|------|
| title | `dimensionName` |
| 档位 | `finalGrade` |
| 补偿标记 | `compensationCheck.compensationEffective === true` →「补偿触发」；否则空字符串（不展示假「--」徽章） |
| 得分 | `` `${dimensionScore}/${fullScore}` ``（`fullWidth`） |
| 核心依据 | `coreBasis`；缺/空 → `--` |

### 满分 `fullScore`（与 Web 一致）

| 维度名 | 满分 |
|--------|------|
| 小结设计（名含「小结设计」） | **固定 10**（忽略 `weight`） |
| 其它 | `round(Number(weight) * 100)` |

## 4. 底栏汇总（`totalCalc` → `A2ScoreSummary` rows）

| 行 | 字段 | H5 展示（现组件能力） |
|----|------|----------------------|
| 总分小计 | `sumOfDimensionScore` | `value` 直出 |
| 课堂时长T | `classDurationRaw` | `formatA2DurationDisplay`；空 → `--` |
| 时长系数 | `classDurationCoefficient` + hint | value：有 hint 则 `` `${coeff}（${hint}）` ``，否则仅 coeff；hint 规则同 Web（按 T） |
| 最终总分 | `finalTotalScore` | `` `${score}（=总分小计×时长系数）` ``；score 空则 `--` |
| 等级 | `overallGrade` + `overallGradeDesc` | `gradeCode` / `gradeBadge`（不再从 `hundredScore` 正则拆） |

时长系数 hint 文案（与 Web 相同，不改写接口系数）：

| T（分钟） | hint |
|-----------|------|
| T ≥ 30 | `T ≥ 30 → 1.00` |
| 20 ≤ T < 30 | `20 ≤ T < 30 → 0.80` |
| 10 ≤ T < 20 | `10 ≤ T < 20 → 0.70` |
| T < 10 | `T < 10 → 0.50` |

## 5. 删除 / 停用

- `mapScoreSummaryTail`、`SUMMARY_TAIL_LABELS` / `SUMMARY_TAIL_LABEL_SET`（若仅服务 10.1）
- `scoreTable` / `scoreDimRows` 基于 `scoring.summaryTable` 的 10.1 分支

**禁止波及：** 其它章节映射、封面/overview、温馨提示文案常量、`A2ScoringPreview` / `A2ScoreSummary` / `A2FieldCard` 样式。

## 6. 空态

无 `evaluationResult` 或空 `dimensionList` / 无 `totalCalc`：

- `dimensionCards: []`、对应 summary 行不生成或整段空
- **禁止**回退 `scoring.summaryTable`

## 7. 验收

1. 有 `evaluationResult` 时 10.1 出维度卡 + 底栏  
2. 得分形如 `29.4/35`；小结设计分母恒为 10  
3. 补偿仅 `compensationEffective===true` 显示「补偿触发」  
4. `coreBasis` 空 → `--`  
5. 时长系数 value 含动态 hint（有 T 可解析时）  
6. 无 `evaluationResult` → 空 10.1，不回退 summaryTable  
7. 视觉与改前一致（仅数据源变）

## 8. 实现落点

- `E:\code\H5\src\pages\share\analysisTeachingA2\adapters\mapA2ToView.ts`
- 按需：同目录 types（若显式声明 `evaluationResult`）
- **不改** `A2ScoringPreview.vue` / `A2ScoreSummary.vue`（除非类型缺字段阻断编译——本需求默认不缺）
