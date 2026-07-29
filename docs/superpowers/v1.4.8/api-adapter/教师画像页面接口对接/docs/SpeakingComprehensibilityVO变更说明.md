# SpeakingComprehensibilityVO 结构变更说明

> 接口：`GET /analysis/v2/teachingDiagnosis/getTeacherProfile`  
> 影响字段：`data.speakingComprehensibility`  
> 变更日期：2026-07-09  
> 作者：chenyuebo

---

## 一、变更概要

`SpeakingComprehensibilityVO` 中三个维度字段名和综合得分字段名均追加 `Score` 后缀，类型由 `Integer` 改为 `BigDecimal`（含一位小数），同时新增 `classroomFeature` 字段。

---

## 二、变更前后对比

### 2.1 变更前

```json
{
  "speakingComprehensibility": {
    "vocabulary": 28,
    "syntax": 30,
    "content": 22,
    "total": 80,
    "level": "良好"
  }
}
```

### 2.2 变更后

```json
{
  "speakingComprehensibility": {
    "vocabularyScore": 28.5,
    "syntaxScore": 30.0,
    "contentScore": 22.0,
    "totalScore": 80.5,
    "level": "良好",
    "classroomFeature": "语言表达清晰，学生易于理解"
  }
}
```

---

## 三、字段明细

| 字段名（变更前） | 字段名（变更后） | 类型（变更前） | 类型（变更后） | 说明 |
|--------|--------|--------|--------|------|
| `vocabulary` | `vocabularyScore` | `number` (Integer) | `number` (BigDecimal，一位小数) | 词汇可理解度得分（满分35） |
| `syntax` | `syntaxScore` | `number` (Integer) | `number` (BigDecimal，一位小数) | 句法可理解度得分（满分35） |
| `content` | `contentScore` | `number` (Integer) | `number` (BigDecimal，一位小数) | 内容可理解度得分（满分30） |
| `total` | `totalScore` | `number` (Integer) | `number` (BigDecimal，一位小数) | 综合得分（满分100） |
| `level` | `level` | `string` | `string` | 等级（不变） |
| - | `classroomFeature` | - | `string` | 课堂特征（新增）|

---

## 四、前端适配指引

1. 字段名变更：`vocabulary` → `vocabularyScore`、`syntax` → `syntaxScore`、`content` → `contentScore`、`total` → `totalScore`
2. 取值由 `data.speakingComprehensibility.vocabulary` 改为 `data.speakingComprehensibility.vocabularyScore`（其余类推）
3. **类型变更**：四个数值字段从 `Integer` 改为带一位小数的 `BigDecimal`，返回值由 `28` 变为 `28.5`，前端需确保展示时正确处理小数
4. **新增字段**：`classroomFeature`（string），值为课堂特征描述文本，无数据时为 `null`
5. `level` 字段不受影响，无需改动
6. 满分值（vocabulary 满分35、syntax 满分35、content 满分30、totalScore 满分100）不再通过接口返回，前端如有展示需要可硬编码

---

## 五、完整 JSON 示例

```json
{
  "code": 200,
  "data": {
    "myLessonPlan": { "..." },
    "postClassReport": { "..." },
    "questionType": { "..." },
    "classroomClarity": { "..." },
    "speakingBehavior": { "..." },
    "speakingComprehensibility": {
      "vocabularyScore": 28.5,
      "syntaxScore": 30.0,
      "contentScore": 22.0,
      "totalScore": 80.5,
      "level": "良好",
      "classroomFeature": "语言表达清晰，学生易于理解"
    }
  }
}
```
