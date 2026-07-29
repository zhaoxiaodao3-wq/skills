# 教师画像接口响应数据结构文档

> 对应后端类：`TeacherProfileRspVO`
> 作者：chenyuebo
> 日期：2026-07-03

---

## 一、顶层结构

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `myLessonPlan` | `MyLessonPlanVO` | 我的教案 |
| `postClassReport` | `PostClassReportVO` | 课堂教学内容评价 |
| `questionType` | `QuestionTypeVO` | 提问类型 |
| `classroomClarity` | `ClassroomClarityVO` | 课堂结构清晰度 |
| `speakingBehavior` | `SpeakingBehaviorVO` | 课堂语言行为 |
| `speakingComprehensibility` | `SpeakingComprehensibilityVO` | 语言可理解度 |

---

## 二、MyLessonPlanVO（我的教案）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `totalCount` | `number` | 总数 |
| `outstandingCount` | `number` | 卓越数量 |
| `outstandingRatio` | `number` | 卓越比例 |
| `excellentCount` | `number` | 优秀数量 |
| `excellentRatio` | `number` | 优秀比例 |
| `goodCount` | `number` | 良好数量 |
| `goodRatio` | `number` | 良好比例 |
| `needImprovementCount` | `number` | 待改进数量 |
| `needImprovementRatio` | `number` | 待改进比例 |
| `unsatisfactoryCount` | `number` | 不合格数量 |
| `unsatisfactoryRatio` | `number` | 不合格比例 |

---

## 三、PostClassReportVO（课堂教学内容评价）

### 3.1 顶层

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `summary` | `Summary` | 汇总 |
| `aReport` | `AReportDetail` | a类报告 |
| `bReport` | `BReportDetail` | b类报告 |

### 3.2 Summary（汇总）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `excellentCount` | `number` | 优秀 |
| `goodCount` | `number` | 良好 |
| `satisfactoryCount` | `number` | 合格 |
| `needImprovementCount` | `number` | 待改进 |
| `totalCount` | `number` | 总数 |

### 3.3 LevelStat（等级统计）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `excellentCount` | `number` | 优秀数量 |
| `excellentRatio` | `number` | 优秀比例 |
| `goodCount` | `number` | 良好数量 |
| `goodRatio` | `number` | 良好比例 |
| `satisfactoryCount` | `number` | 合格数量 |
| `satisfactoryRatio` | `number` | 合格比例 |
| `needImprovementCount` | `number` | 待改进数量 |
| `needImprovementRatio` | `number` | 待改进比例 |

### 3.4 DimensionDetail（维度分数详情）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `maxScore` | `number` | 满分 |
| `averageScore` | `number` | 平均分 |

### 3.5 AReportDetail（a类报告详情）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `totalCount` | `number` | 总数 |
| `levelStat` | `LevelStat` | 等级统计（结构见 3.3） |
| `dimensionScore` | `ADimensionScore` | 维度得分（结构见 3.5.1） |

#### 3.5.1 ADimensionScore（a类报告维度得分）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `lessonPlanFidelity` | `DimensionDetail` | 教案落实度（结构见 3.4） |
| `intellectualStimulation` | `DimensionDetail` | 思维启发度（结构见 3.4） |
| `difficultyBreakthrough` | `DimensionDetail` | 难点突破度（结构见 3.4） |
| `practiceEffectiveness` | `DimensionDetail` | 练习有效度（结构见 3.4） |
| `summaryCompleteness` | `DimensionDetail` | 小结完整度（结构见 3.4） |
| `pacingAppropriateness` | `DimensionDetail` | 节奏合理度（结构见 3.4） |

### 3.6 BReportDetail（b类报告详情）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `totalCount` | `number` | 总数 |
| `levelStat` | `LevelStat` | 等级统计（结构见 3.3） |
| `dimensionScore` | `BDimensionScore` | 维度得分（结构见 3.6.1） |

#### 3.6.1 BDimensionScore（b类报告维度得分）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `knowledgeMastery` | `DimensionDetail` | 知识落实度（结构见 3.4） |
| `intellectualStimulation` | `DimensionDetail` | 思维启发度（结构见 3.4） |
| `studentEngagement` | `DimensionDetail` | 学生参与度（结构见 3.4） |
| `logicalClarity` | `DimensionDetail` | 逻辑清晰度（结构见 3.4） |
| `practiceAndFeedbackEffectiveness` | `DimensionDetail` | 练习与反馈有效性（结构见 3.4） |
| `pacing` | `DimensionDetail` | 节奏把控度（结构见 3.4） |

---

## 四、QuestionTypeVO（提问类型）

### 4.1 顶层

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `fourQuestion` | `FourQuestion` | 四何问题 |
| `bloomTaxonomy` | `BloomTaxonomy` | 布鲁姆（课后报告A） |

### 4.2 FourQuestion（四何问题）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `whatIs` | `number` | 是何 |
| `how` | `number` | 如何 |
| `whatIf` | `number` | 若何 |
| `why` | `number` | 为何 |
| `subtotal` | `number` | 小计 |

### 4.3 BloomTaxonomy（布鲁姆分类）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `memoryComprehensionCount` | `number` | 记忆/理解类问题数 |
| `analysisEvaluationCount` | `number` | 分析/评价/创造类问题数 |
| `applicationCount` | `number` | 应用类问题数 |
| `subtotal` | `number` | 小计 |

---

## 五、ClassroomClarityVO（课堂结构清晰度）

### 5.1 顶层

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `goalClarity` | `ClarityDetail` | 目标清晰度 |
| `stageClarity` | `ClarityDetail` | 环节清晰度 |
| `logicClarity` | `ClarityDetail` | 逻辑清晰度 |
| `summaryClarity` | `ClarityDetail` | 总结清晰度 |
| `totalScore` | `number` | 综合得分 |
| `level` | `string` | 等级 |

### 5.2 ClarityDetail（清晰度分数详情）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `maxScore` | `number` | 满分 |
| `averageScore` | `number` | 平均分 |

---

## 六、SpeakingBehaviorVO（课堂语言行为）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `praiseEncourage` | `number` | 表扬鼓励 |
| `acceptFeeling` | `number` | 接纳感受 |
| `adoptIdea` | `number` | 采纳意见 |
| `criticize` | `number` | 批评 |
| `giveInstruction` | `number` | 强制指令 |
| `total` | `number` | 总计 |

---

## 七、SpeakingComprehensibilityVO（语言可理解度）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `vocabulary` | `number` | 词汇可理解度得分（0～35） |
| `syntax` | `number` | 句法可理解度得分（0～35） |
| `content` | `number` | 内容可理解度得分（0～30） |
| `total` | `number` | 综合得分（0～100，通常为三分项之和） |
| `level` | `string` | 等级 |

> 前端 gauge 满分：`vocabulary`/`syntax` = 35，`content` = 30；接口不返回各维度 `maxScore`，由前端常量补全。

---

## 八、JSON 示例

```json
{
  "myLessonPlan": {
    "totalCount": 50,
    "outstandingCount": 10,
    "outstandingRatio": 0.20,
    "excellentCount": 15,
    "excellentRatio": 0.30,
    "goodCount": 18,
    "goodRatio": 0.36,
    "needImprovementCount": 5,
    "needImprovementRatio": 0.10,
    "unsatisfactoryCount": 2,
    "unsatisfactoryRatio": 0.04
  },
  "postClassReport": {
    "summary": {
      "excellentCount": 12,
      "goodCount": 20,
      "satisfactoryCount": 10,
      "needImprovementCount": 5,
      "totalCount": 47
    },
    "aReport": {
      "totalCount": 25,
      "levelStat": {
        "excellentCount": 5,
        "excellentRatio": 0.20,
        "goodCount": 10,
        "goodRatio": 0.40,
        "needImprovementCount": 10,
        "needImprovementRatio": 0.40
      },
      "dimensionScore": {
        "lessonPlanFidelity": { "maxScore": 100, "averageScore": 85.5 },
        "intellectualStimulation": { "maxScore": 100, "averageScore": 78.3 },
        "difficultyBreakthrough": { "maxScore": 100, "averageScore": 82.1 },
        "practiceEffectiveness": { "maxScore": 100, "averageScore": 80.0 },
        "summaryCompleteness": { "maxScore": 100, "averageScore": 76.8 },
        "pacingAppropriateness": { "maxScore": 100, "averageScore": 83.2 }
      }
    },
    "bReport": {
      "totalCount": 22,
      "levelStat": {
        "excellentCount": 7,
        "excellentRatio": 0.32,
        "goodCount": 10,
        "goodRatio": 0.45,
        "needImprovementCount": 5,
        "needImprovementRatio": 0.23
      },
      "dimensionScore": {
        "knowledgeMastery": { "maxScore": 100, "averageScore": 86.0 },
        "intellectualStimulation": { "maxScore": 100, "averageScore": 79.5 },
        "studentEngagement": { "maxScore": 100, "averageScore": 81.2 },
        "logicalClarity": { "maxScore": 100, "averageScore": 84.3 },
        "practiceAndFeedbackEffectiveness": { "maxScore": 100, "averageScore": 77.6 },
        "pacing": { "maxScore": 100, "averageScore": 82.8 }
      }
    }
  },
  "questionType": {
    "fourQuestion": {
      "whatIs": 30,
      "how": 25,
      "whatIf": 10,
      "why": 15,
      "subtotal": 80
    },
    "bloomTaxonomy": {
      "memoryComprehensionCount": 35,
      "analysisEvaluationCount": 20,
      "applicationCount": 25,
      "subtotal": 80
    }
  },
  "classroomClarity": {
    "goalClarity": { "maxScore": 25, "averageScore": 20.5 },
    "stageClarity": { "maxScore": 25, "averageScore": 19.8 },
    "logicClarity": { "maxScore": 25, "averageScore": 21.2 },
    "summaryClarity": { "maxScore": 25, "averageScore": 18.6 },
    "totalScore": 80,
    "level": "良好"
  },
  "speakingBehavior": {
    "praiseEncourage": 15,
    "acceptFeeling": 8,
    "adoptIdea": 12,
    "criticize": 2,
    "giveInstruction": 20,
    "total": 57
  },
  "speakingComprehensibility": {
    "vocabulary": 28,
    "syntax": 30,
    "content": 22,
    "total": 80,
    "level": "良好"
  }
}
```

---

## 九、类型说明

| 后端类型 | 前端类型 | 备注 |
|----------|----------|------|
| `Integer` | `number` | 整型数字 |
| `BigDecimal` | `number` | 高精度小数，前端按普通数字处理即可 |
| `String` | `string` | 字符串 |
| 嵌套对象 | `object` | 见各章节详细定义 |
