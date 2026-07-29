# 教师画像页面 — 教师风格分析三模块 HTTP 接入

> **背景**：02 阶段已完成 `getTeacherProfile` 接入及 6 个业务模块 Adapter；`personalTagCloud`、`teachingStyleTrend`、`teachingStyleFlexibility` 仍从 `FULL_MOCK_BASE` 注入。后端在 `TeacherProfileRspVO` 顶层新增 3 个字段，需在本需求完成对接。
>
> **前置交付**：[archive/02-教师画像页面HTTP接入与VO变更-delivered.md](../archive/02-教师画像页面HTTP接入与VO变更-delivered.md)
>
> **变更依据**：[V1.4.8_教师画像_教师风格分析模块_接口字段设计.md](../docs/V1.4.8_教师画像_教师风格分析模块_接口字段设计.md)（2026-07-09）
>
> **接口路径**：`GET /analysis/v2/teachingDiagnosis/getTeacherProfile`（与 02 相同，一次请求扩展为 9 模块）

---

## 一、目标

1. `TeacherProfileRspVO` 新增 `personalTagCloud`、`teachingStyleTrend`、`teachingStyleElasticity` 类型与 3 个 Adapter。
2. **Mock 开关 OFF** 时，上述 3 模块数据来自 HTTP；**Mock 开关 ON** 时，3 模块 **仍用现有 `FULL_MOCK_BASE`**，展示逻辑与现网一致。
3. **Mock OFF** 时，3 个 Container 按接口字段展示（见 §三）；**Mock ON** 时 Container 保持现有固定词表/查表逻辑。
4. `myInfo`、`teacherPortrait`（教师画像卡片）**不在本次范围**，继续 mock。

---

## 二、已确认产品决策

| 议题 | 决策 |
|------|------|
| 对接范围 | **A**：仅文档 3 模块；卡片与我的信息继续 mock |
| 总体方案 | **A**：延续 02 双轨（Adapter + Container 按 Mock 开关分支） |
| 个人标签云（HTTP） | **A**：完全动态渲染 `tagCategories[].tags`，不用固定词表过滤 |
| 个人标签云（Mock） | 保留 `DISCOURSE_TAGS` 等固定词表逻辑 |
| 趋势图（HTTP） | **A**：最小接入 — 横轴 `reportLabel`；纵轴按接口 position 排序；暂不展示 `reportTime`/`reportTopic` |
| 趋势图（Mock） | 保留 `buildReportLabel(idx)` + `TEACHER_STYLE_ORDER` |
| 弹性特征标题（HTTP） | 固定前缀「**课中教学稳定性**」+ 接口 `sciLevel`（如「高弹性」） |
| 弹性特征情境（HTTP） | `situationStats`：`situationName` 左标题、`summary` 右标签；样式按 `dominantLevel`（强/中/弱） |
| 弹性特征底部（HTTP） | 直接展示 `elasticitySummary` |
| 弹性特征（Mock） | 保留 `stability` + `getStabilityTitle`/`getStabilityDescription` + 固定情境查表 |

---

## 三、接口字段与页面映射摘要

### 3.1 个人标签云 `personalTagCloud`

| 接口 | 前端 slice |
|------|------------|
| `totalReportCount` | `totalReportCount` |
| `tagCategories[].categoryType` | `modules[].type`（speech→discourse 等） |
| `tagCategories[].categoryName` | `modules[].title` |
| `tagCategories[].tags[]` | `modules[].tags[]`（label/count/rank） |

### 3.2 教学风格变化趋势 `teachingStyleTrend`

| 接口 | 前端 slice |
|------|------------|
| `trendPoints[].reportLabel` | `reports[].label` |
| `trendPoints[].dominantStyle` | `reports[].dominantStyle` |
| `trendPoints[].auxiliaryStyle` | `reports[].auxiliaryStyle` |
| `trendPoints[].stylePosition` | `reports[].dominantPosition`（0–4） |

纵轴顺序（HTTP，自下而上 position 0→4）：

```
温暖引导型 → 理性启发型 → 权威传授型 → 激情讲授型 → 严厉规训型
```

> 与当前 `TEACHER_STYLE_ORDER` 不同：**权威传授型**与**激情讲授型**位置对调，HTTP 模式必须以接口为准。

### 3.3 教学风格与弹性 `teachingStyleElasticity` → slice `teachingStyleFlexibility`

| 接口 | 前端 slice |
|------|------------|
| `dominantStyle` / `auxiliaryStyle` | 同名 |
| `styleCounts[].count` | `styleScores[styleName]` |
| `sciLevel` | `sciLevel`（原文字符串） |
| `situationStats[]` | `situations[]` |
| `elasticitySummary` | `elasticitySummary` |

本阶段 **不入 slice**：`sciAverage`、`situationStats[].description`、强/中/弱次数。

---

## 四、数据流

```
activeTeacherId 变化
  → useTeacherPortraitData.fetchAggregate(tenantUserId)
       ├─ [Mock ON]  getTeacherProfileApiMock → adapt（6+3 模块 VO）
       │             merge 时 3 风格模块 **覆盖为 FULL_MOCK_BASE**
       └─ [Mock OFF] getTeacherProfile HTTP → adapt（9 模块）
  → aggregate → Container（isTeacherPortraitMockEnabled() 分支展示）
```

---

## 五、不在本次范围

- `myInfo`、`teacherPortrait` 卡片 HTTP 对接
- 趋势图 Tooltip 展示 `reportTopic` / `reportTime`（可另开增强）
- `postClassReport` 维度满分尺度确认（02 遗留）
- 修改 `V1.4.8_教师画像_教师风格分析模块_接口字段设计.md` 正文

---

## 六、验收标准（草案）

1. Mock **OFF** + 真实接口有数据：标签云动态标签、趋势图横轴为 `A1` 等、弹性模块展示 `sciLevel` + `elasticitySummary` + 接口情境文案。
2. Mock **ON**：3 模块视觉与行为与改前一致（固定词表、查表文案、自生成横轴）。
3. Mock **OFF** + 接口缺字段：对应模块空态，不回落 `FULL_MOCK_BASE` 写死数据。
4. HTTP 失败：9 模块 slice 置空（与 02 扩展一致）。
5. Adapter 单测覆盖文档 §五 JSON 样例；`pnpm typecheck` 通过。

---

## 七、引用文档

- [V1.4.8_教师画像_教师风格分析模块_接口字段设计.md](../docs/V1.4.8_教师画像_教师风格分析模块_接口字段设计.md)
- [archive/02-教师画像页面HTTP接入与VO变更-delivered.md](../archive/02-教师画像页面HTTP接入与VO变更-delivered.md)
- [ui-style/教学风格与弹性特征组件/requirements/原始需求.md](../../ui-style/教学风格与弹性特征组件/requirements/原始需求.md)（Mock 态 UI 规则来源）
