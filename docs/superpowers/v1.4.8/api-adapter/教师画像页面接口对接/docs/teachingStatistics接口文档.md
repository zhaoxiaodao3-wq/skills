# 教学统计接口

## 接口信息

- **接口说明**：获取指定教师的宏观教学统计数据（上课总时长、教案数量、评价报告数量）
- **请求路径**：`/v2/teachingDiagnosis/teachingStatistics`
- **请求方式**：`GET`

---

## 请求参数

### Query 参数

| 参数名 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `tenantUserId` | `String` | 是 | 教师用户ID |

### 请求示例

```
GET /v2/teachingDiagnosis/teachingStatistics?tenantUserId=1234567890
```

---

## 响应数据

### 数据格式

```json
{
    "code": 200,
    "message": "操作成功",
    "data": {
        "totalClassDuration": 30, 
        "lessonPlanNum": 12,
        "postClassReportNum": 8
    }
}
```

### 通用响应字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `code` | `Integer` | 状态码，`200` 成功，`400` 参数错误 |
| `message` | `String` | 操作结果提示 |
| `data` | `Object` | 返回数据体，成功时有值，失败时为 `null` |

### data 字段说明

| 字段 | 类型 | 单位 | 说明 |
|---|---|---|---|
| `totalClassDuration` | `Integer` | 分钟 | 该教师所有已完成课堂的累计上课总时长 |
| `lessonPlanNum` | `Integer` | 份 | 该教师已完成的教案分析数量 |
| `postClassReportNum` | `Integer` | 份 | 该教师已完成的课后评价报告数量 |

### data 空值情况

教师无任何分析记录时，返回默认值：

```json
{
    "code": 200,
    "message": "操作成功",
    "data": {
        "totalClassDuration": 0,
        "lessonPlanNum": 0,
        "postClassReportNum": 0
    }
}
```

---

## 错误码

| code | 触发条件 | data |
|---|---|---|
| `400` | `tenantUserId` 为空或未传 | `null` |
| `200` | 正常（含教师无记录的情况） | 含三个统计字段，均为 `0` 或实际数值 |
