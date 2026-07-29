# ClassroomClarityVO 结构变更说明

> 接口：`GET /analysis/v2/teachingDiagnosis/getTeacherProfile`  
> 影响字段：`data.classroomClarity`  
> 变更日期：2026-07-08  
> 作者：chenyuebo

---

## 一、变更概要

`ClassroomClarityVO` 中四个维度字段由嵌套对象 `ClarityDetail` 改为 `Integer`（整型数字），字段名追加 `Score` 后缀，同时删除 `ClarityDetail` 内部类。

---

## 二、变更前后对比

### 2.1 变更前

```json
{
  "classroomClarity": {
    "goalClarity":    { "maxScore": 25, "averageScore": 20.5 },
    "stageClarity":   { "maxScore": 25, "averageScore": 19.8 },
    "logicClarity":   { "maxScore": 25, "averageScore": 21.2 },
    "summaryClarity": { "maxScore": 25, "averageScore": 18.6 },
    "totalScore": 80,
    "level": "良好"
  }
}
```

### 2.2 变更后

```json
{
  "classroomClarity": {
    "goalClarityScore": 21,
    "stageClarityScore": 20,
    "logicClarityScore": 21,
    "summaryClarityScore": 19,
    "totalScore": 80,
    "level": "良好",
    "classroomFeature": "讲授型"
  }
}
```

---

## 三、字段明细

| 字段名（变更前） | 字段名（变更后） | 类型（变更前） | 类型（变更后） | 说明 |
|--------|--------|--------|--------|------|
| `goalClarity` | `goalClarityScore` | `ClarityDetail` | `number` (Integer) | 目标清晰度平均分 |
| `stageClarity` | `stageClarityScore` | `ClarityDetail` | `number` (Integer) | 环节清晰度平均分 |
| `logicClarity` | `logicClarityScore` | `ClarityDetail` | `number` (Integer) | 逻辑清晰度平均分 |
| `summaryClarity` | `summaryClarityScore` | `ClarityDetail` | `number` (Integer) | 总结清晰度平均分 |
| `totalScore` | `totalScore` | `number` | `number` | 综合得分（不变） |
| `level` | `level` | `string` | `string` | 等级（不变） |
| - | `classroomFeature` | - | `string` | 课堂特征（新增）|

---

## 四、前端适配指引

1. 字段名变更：`goalClarity` → `goalClarityScore`、`stageClarity` → `stageClarityScore`、`logicClarity` → `logicClarityScore`、`summaryClarity` → `summaryClarityScore`
2. 取值方式变更：四个维度字段**从对象取值改为直接读取数字**（原 `data.classroomClarity.goalClarity.averageScore` → `data.classroomClarity.goalClarityScore`）
3. **新增字段**：`classroomFeature`（string），值为课堂特征描述，无数据时为 `null`
4. `totalScore` 和 `level` 字段不受影响，无需改动
5. 满分值（原 `maxScore`）不再通过接口返回，前端如有展示需要可硬编码为 25（四个清晰度维度满分均为 25）

---

## 五、完整 JSON 示例

```json
{
  "code": 200,
  "data": {
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
    "postClassReport": { "..." },
    "questionType": { "..." },
    "classroomClarity": {
      "goalClarityScore": 21,
      "stageClarityScore": 20,
      "logicClarityScore": 21,
      "summaryClarityScore": 19,
      "totalScore": 80,
      "level": "良好",
      "classroomFeature": "结构较清晰，偶尔有模糊之处"
    },
    "speakingBehavior": { "..." },
    "speakingComprehensibility": { "..." }
  }
}
```
