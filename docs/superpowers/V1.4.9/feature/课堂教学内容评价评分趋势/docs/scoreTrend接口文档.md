# scoreTrend 接口对接文档

## 接口概述

获取指定教师的历史评分趋势列表，用于教师画像模块中展示评分变化趋势。

---

## 基本信息

| 项目 | 说明 |
|------|------|
| **接口路径** | `GET /analysis/v2/teachingDiagnosis/scoreTrend` |
| **请求方式** | GET |
| **认证方式** | 需登录，通过 Token/Session 获取当前用户信息 |
| **返回格式** | JSON |

---

## 请求参数

### Query 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `tenantUserId` | String | **是** | 租户用户ID（教师唯一标识） |

### 请求示例

```
GET /analysis/v2/teachingDiagnosis/scoreTrend?tenantUserId=123456789
```

---

## 响应格式

### 外层包装

```json
{
  "code": 200,
  "message": "success",
  "data": [ ... ]
}
```

### 错误返回

| code | 说明 |
|------|------|
| `400` | `tenantUserId` 为空 |
| 其他 | 业务异常，参见 `message` 字段 |

---

### data 字段 (List\<ScoreTrendVO\>)

| 字段名 | 类型 | 可空 | 说明 |
|--------|------|------|------|
| `id` | Long | 否 | 课例基本信息记录ID（`t_self_analysis_case_basic_info.id`） |
| `name` | String | 否 | 分析名称（来自诊断任务名称） |
| `scoreLevel` | String | 能 | 评分等级（如 "EXCELLENT"、"GOOD"、"QUALIFIED"、"NEED_IMPROVEMENT"） |
| `score` | BigDecimal | 能 | 报告总分 |
| `reportType` | String | 否 | 报告类型：`A` = A类报告, `B` = B类报告 |
| `genTime` | String | 否 | 生成时间（格式取决于数据库返回值，通常为 `yyyy-MM-dd HH:mm:ss`） |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 10001,
      "name": "高中语文-《师说》教学诊断",
      "scoreLevel": "EXCELLENT",
      "score": 85.50,
      "reportType": "A",
      "genTime": "2026-07-18 14:30:00"
    },
    {
      "id": 10002,
      "name": "高中语文-《劝学》教学诊断",
      "scoreLevel": "GOOD",
      "score": 72.00,
      "reportType": "B",
      "genTime": "2026-07-15 10:20:00"
    },
    {
      "id": 10003,
      "name": "高中语文-《赤壁赋》教学诊断",
      "scoreLevel": "QUALIFIED",
      "score": 58.50,
      "reportType": "A",
      "genTime": "2026-07-10 16:45:00"
    }
  ]
}
```

---

## 数据逻辑说明

### 数据来源
- 主表：`t_self_analysis_case_basic_info`（课例基本情况&课堂教学内容分析结果表）
- 关联表：`t_self_teaching_diagnosis`（教学诊断主表，用于获取分析名称）

### 过滤规则
仅返回**已完成分析**的记录，条件如下：
- 软删除标记 `deleted = 0`
- 由指定教师创建（`create_by = tenantUserId`）
- **A 类报告**：关键知识点对比完成（`key_points_cmp_a_status = 7`）**且** A 类课后报告完成（`post_class_report_a_status = 7`）
- **B 类报告**：关键知识点对比完成（`key_points_cmp_b_status = 7`）**且** B 类课后报告完成（`post_class_report_b_status = 7`）

### 评分取值逻辑
- **A 类报告**：从 `a_report_json` 中提取 `$.contents.scoring.totalScore`
- **B 类报告**：从 `b_report_json` 中提取 `$.contents.scoring.totalScore`

### 排序规则
- 按 `update_time` **降序**排列（最新生成的记录排在前面）

---

## 前端使用建议

1. **趋势图**：按 `genTime` 倒序排列后绘制折线/柱状图，X 轴为时间、Y 轴为 `score`
2. **报告类型区分**：可通过 `reportType` 字段在列表/图表中区分 AB 类报告的数据点
3. **评分等级**：`scoreLevel` 为 AI 分析给出的等级评定，可直接展示或用于着色
4. **跳转详情**：点击列表项时使用 `id` 跳转到对应的课例分析详情页

---

## 注意事项

- 该接口返回的列表可能为空（`data: []`），前端需处理空状态展示
- `score` 类型为 `BigDecimal`，序列化后为数字类型，支持小数
- 同一诊断任务可能产生 A 类和 B 类两份报告，会作为两条记录分别返回
- 该接口无分页参数，返回该教师所有已完成的分析记录
