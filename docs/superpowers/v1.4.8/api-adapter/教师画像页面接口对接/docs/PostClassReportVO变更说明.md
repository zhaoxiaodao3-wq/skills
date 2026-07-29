# PostClassReportVO 接口变更说明

## 变更日期

2026-07-07

## 变更概述

`PostClassReportVO`（课堂教学内容评价）中的 `DimensionDetail` 内部类已移除，原维度得分字段的类型由 `DimensionDetail` 对象改为 `BigDecimal`（直接返回平均分数值）。

## 影响范围

- **接口路径**：返回 `TeacherProfileRspVO` 的接口（`postClassReport` 字段）
- **影响类**：`PostClassReportVO.ADimensionScore`、`PostClassReportVO.BDimensionScore`

---

## 变更详情

### 移除的内部类

```java
// 已移除
public static class DimensionDetail {
    private Integer maxScore;      // 满分
    private BigDecimal averageScore; // 平均分
}
```

### ADimensionScore（A类报告维度得分）

| 字段名 | 中文含义 | 变更前类型 | 变更后类型 |
|--------|----------|------------|------------|
| `lessonPlanFidelity` | 教案落实度 | `DimensionDetail` | `BigDecimal` |
| `intellectualStimulation` | 思维启发度 | `DimensionDetail` | `BigDecimal` |
| `difficultyBreakthrough` | 难点突破度 | `DimensionDetail` | `BigDecimal` |
| `practiceEffectiveness` | 练习有效度 | `DimensionDetail` | `BigDecimal` |
| `summaryCompleteness` | 小结完整度 | `DimensionDetail` | `BigDecimal` |
| `pacingAppropriateness` | 节奏合理度 | `DimensionDetail` | `BigDecimal` |

### BDimensionScore（B类报告维度得分）

| 字段名 | 中文含义 | 变更前类型 | 变更后类型 |
|--------|----------|------------|------------|
| `knowledgeMastery` | 知识落实度 | `DimensionDetail` | `BigDecimal` |
| `intellectualStimulation` | 思维启发度 | `DimensionDetail` | `BigDecimal` |
| `studentEngagement` | 学生参与度 | `DimensionDetail` | `BigDecimal` |
| `logicalClarity` | 逻辑清晰度 | `DimensionDetail` | `BigDecimal` |
| `practiceAndFeedbackEffectiveness` | 练习与反馈有效性 | `DimensionDetail` | `BigDecimal` |
| `pacing` | 节奏把控度 | `DimensionDetail` | `BigDecimal` |

---

## JSON 结构对比

### 变更前

```json
{
  "aReport": {
    "totalCount": 10,
    "levelStat": {
      "excellentCount": 3,
      "excellentRatio": 0.30,
      "goodCount": 5,
      "goodRatio": 0.50,
      "satisfactoryCount": 2,
      "satisfactoryRatio": 0.20,
      "needImprovementCount": 0,
      "needImprovementRatio": 0.00
    },
    "dimensionScore": {
      "lessonPlanFidelity": {
        "maxScore": 100,
        "averageScore": 85.5
      },
      "intellectualStimulation": {
        "maxScore": 100,
        "averageScore": 78.3
      }
    }
  }
}
```

### 变更后

```json
{
  "aReport": {
    "totalCount": 10,
    "levelStat": {
      "excellentCount": 3,
      "excellentRatio": 0.30,
      "goodCount": 5,
      "goodRatio": 0.50,
      "satisfactoryCount": 2,
      "satisfactoryRatio": 0.20,
      "needImprovementCount": 0,
      "needImprovementRatio": 0.00
    },
    "dimensionScore": {
      "lessonPlanFidelity": 85.5,
      "intellectualStimulation": 78.3
    }
  }
}
```

---

## 前端适配要点

1. **维度得分直接是数值**：不再需要 `.averageScore` 取值，直接使用字段值即可
2. **满分数据移除**：不再返回 `maxScore`，如需展示"得分/满分"格式，请与后端另行确认满分取值逻辑
3. **B类报告的 `dimensionScore` 同样变更**，字段名不同但结构一致：
   - `knowledgeMastery`, `intellectualStimulation`, `studentEngagement`, `logicalClarity`, `practiceAndFeedbackEffectiveness`, `pacing`

### 代码适配示例

```javascript
// 变更前
const score = data.aReport.dimensionScore.lessonPlanFidelity.averageScore;
const max = data.aReport.dimensionScore.lessonPlanFidelity.maxScore;
display(`${score}/${max}`);

// 变更后
const score = data.aReport.dimensionScore.lessonPlanFidelity;
display(score); // 直接使用数值
```

---

## 完整 PostClassReportVO 结构树（变更后）

```
PostClassReportVO
├── summary: Summary
│   ├── excellentCount: Integer
│   ├── goodCount: Integer
│   ├── satisfactoryCount: Integer
│   ├── needImprovementCount: Integer
│   └── totalCount: Integer
├── aReport: AReportDetail
│   ├── totalCount: Integer
│   ├── levelStat: LevelStat
│   │   ├── excellentCount: Integer
│   │   ├── excellentRatio: BigDecimal
│   │   ├── goodCount: Integer
│   │   ├── goodRatio: BigDecimal
│   │   ├── satisfactoryCount: Integer
│   │   ├── satisfactoryRatio: BigDecimal
│   │   ├── needImprovementCount: Integer
│   │   └── needImprovementRatio: BigDecimal
│   └── dimensionScore: ADimensionScore
│       ├── lessonPlanFidelity: BigDecimal       ← 变更
│       ├── intellectualStimulation: BigDecimal  ← 变更
│       ├── difficultyBreakthrough: BigDecimal   ← 变更
│       ├── practiceEffectiveness: BigDecimal    ← 变更
│       ├── summaryCompleteness: BigDecimal      ← 变更
│       └── pacingAppropriateness: BigDecimal    ← 变更
└── bReport: BReportDetail
    ├── totalCount: Integer
    ├── levelStat: LevelStat (同上)
    └── dimensionScore: BDimensionScore
        ├── knowledgeMastery: BigDecimal                  ← 变更
        ├── intellectualStimulation: BigDecimal           ← 变更
        ├── studentEngagement: BigDecimal                 ← 变更
        ├── logicalClarity: BigDecimal                    ← 变更
        ├── practiceAndFeedbackEffectiveness: BigDecimal  ← 变更
        └── pacing: BigDecimal                            ← 变更
```
