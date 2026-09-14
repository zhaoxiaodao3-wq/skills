# A2 报告 10.1「查看详情」弹窗 × evaluationResult 字段对接（Phase 5）

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

A2 报告第 10.1 节（"评分汇总表"）的"查看详情"按钮 → 打开弹窗 `ReportA2ScoreDetailDialog`，消费 `TypeA2Report.scoreDetail?: A2ScoreDetailDialog` 字段。

**当前状态**：弹窗数据用 `A2_SCORE_DETAIL_DIALOG_MOCK` 占位（mapper line 1572, 1591，注释「G05：评分详情弹窗暂用既有 mock」）。需要改为基于接口 `evaluationResult` 字段动态生成。

## 2. 弹窗 UI 结构（自上而下）

| # | UI 元素 | 数据来源 |
|---|---------|---------|
| 1 | 顶部标题「评分等级计算」 | 固定文案 |
| 2.1 | 维度标题行 | `dimensionCode` + `dimensionName` + `fullScore` + `weight` |
| 2.2 | 评分项表（4 列：编号/项/规则/得分）| `scoreItems[]` |
| 2.3 | 档位区间表（3 列：区间/档位/系数）| **前端常量**（按 `fullScore` 选） |
| 2.4 | 维度底部总结 3 行 | `scoreItems` + `subTotalScore` + `fullScore` + `finalGrade` + `weight` + `usedCoefficient` + `dimensionScore` |
| 3.1 | 补偿小计行 | 同 2.4 素材 |
| 3.2 | 4 列表头（条件/具体要求/检查结果/说明）| **前端常量**（与 conditionList 字段名映射）|
| 3.3 | 补偿条件行（3 条）| `compensationCheck.conditionList[]` |
| 3.4 | 判定行（"判定：✓ 补偿生效 档位自动升级为A"）| `compensationEffective` boolean + `finalGrade` |
| 3.5 | 补偿底部说明 2 行 | 同 2.4 素材 |
| 4.1 | 总分小计行 | `sumOfDimensionScore` + `dimensionList[].dimensionScore` |
| 4.2 | 课堂时长行 | `classDurationRaw` + `classDurationCoefficient` + `buildDurationCoefficientHint` |
| 4.3 | 最终总分行 | `finalTotalScore` + `classDurationCoefficient` |
| 4.4 | 对应等级行 | `overallGrade` + `overallGradeDesc` |

## 3. 接口字段映射

### 3.1 后端 `evaluationResult` 字段定义

```ts
{
  dimensionList: [
    {
      dimensionName: string,
      dimensionCode: number,
      fullScore: number,
      weight: number,
      scoreItems: [{ itemId, itemName, scoreRule, score }],
      subTotalScore: number,
      finalGrade: string,
      usedCoefficient: number,
      dimensionScore: number,
      compensationCheck?: {
        compensationEffective: boolean,
        conditionList: [{ conditionName, desc, pass, remark }],
      },
    },
  ],
  totalCalc: {
    sumOfDimensionScore: number,
    classDurationRaw: string,
    classDurationCoefficient: number,
    finalTotalScore: number,
    overallGrade: string,
    overallGradeDesc: string,
  },
}
```

### 3.2 字段映射表

| 弹窗字段 | 后端字段 | 状态 |
|----------|---------|------|
| `dimensions[].title` 完整文案 | `dimensionCode` + `dimensionName` + `fullScore` + `weight` | ⚠️ 前端拼 |
| `dimensions[].scoreRows[]` | `scoreItems[]` | ✅ 直接 |
| `dimensions[].tierRows[]` | **无** | ❌ 前端常量 |
| `dimensions[].summaryLines` | 素材：`scoreItems` + `subTotalScore` + `fullScore` + `finalGrade` + `weight` + `usedCoefficient` + `dimensionScore` | ⚠️ 前端拼 3 行 |
| `dimensions[].compensation` | `compensationCheck` 非空时存在 | ⚠️ 5 维度都判断 |
| `compensation.subtotalLine` | `subTotalScore` + `scoreItems` | ⚠️ 前端拼 |
| `compensation.headers` | conditionList 字段名映射 | ❌ 前端常量 |
| `compensation.rows[]` | `conditionList[]` | ✅ 直接 |
| `compensation.judgment.kind` | `compensationEffective` | ⚠️ boolean → 'pass'/'fail' |
| `compensation.judgment.label` | `compensationEffective` | ⚠️ 前端拼 "补偿生效" / "未达补偿条件" |
| `compensation.judgment.upgradeNote` | `finalGrade` | ⚠️ 前端拼 "档位自动升级为${finalGrade}" |
| `compensation.footerLines` | 素材：同 summaryLines | ⚠️ 前端拼 2 行 |
| `total.rows[0]`（总分小计）| `sumOfDimensionScore` + 各维 `dimensionScore` | ⚠️ 前端拼 |
| `total.rows[1]`（课堂时长）| `classDurationRaw` + `classDurationCoefficient` + `buildDurationCoefficientHint` | ⚠️ 前端拼 |
| `total.rows[2]`（最终总分）| `finalTotalScore` + `classDurationCoefficient` | ⚠️ 前端拼 |
| `total.rows[3]`（对应等级）| `overallGrade` + `overallGradeDesc` | ✅ 直接 |

## 4. 文案模板规则（5 个）

### 4.1 行 1：小计

```
${dimensionName}积分小计：${itemId1}【${score1}】 + ${itemId2}【${score2}】+ ... + ${itemIdN}【${scoreN}】= 【${subTotalScore}】/${fullScore}分
```

参考 mock：`"小结设计积分小计：S1【0.1】 + S2【0】+ S3【0】+ S4【0.35】= 【0.45】/4分"`

注意：`+` 之间的空格规则（mock 显示" +"前无空格，"+"后有空格）

### 4.2 行 2：档位

```
${dimensionName}档位：【${finalGrade}】
```

参考 mock：`"小结设计档位：【F】"`

### 4.3 行 3：维度得分

```
${dimensionName}维度得分：100 × ${weight*100}% × ${usedCoefficient} = ${dimensionScore.toFixed(2)}
```

参考 mock：
- `"小结设计维度得分：100 × 10% × 0 = 0"`（`usedCoefficient=0`、`dimensionScore=0`）
- `"知识落实度维度得分：100 × 35% × 0.84 = 29.40"`（`usedCoefficient=0.84`、`dimensionScore=29.40`）
- `"学生参与度维度得分：100 × 10% × 0.97 = 9.80"`

**format 规则**：
- `weight * 100` 取整（如 `0.35 → 35`）
- `usedCoefficient` 原值显示（`0.84`、`0.97`），不强制 toFixed（mock 显示 `0` 不显示 `0.00`）
- `dimensionScore` 保留 2 位小数（`toFixed(2)`）

### 4.4 判定行

```
判定：${icon} ${label} ${upgradeNote}
```

- `icon`：`compensationEffective ? '✓' : '✗'`
- `label`：`compensationEffective ? '补偿生效' : '未达补偿条件'`
- `upgradeNote`：当 `compensationEffective === true` 时显示 `档位自动升级为${finalGrade}`，否则不显示

参考 mock：`"判定：✓ 补偿生效 档位自动升级为A"`

### 4.5 补偿底部说明 2 行

```
${dimensionName}档位：【${finalGrade}】
${dimensionName}维度得分：100 × ${weight*100}% × ${usedCoefficient} = ${dimensionScore.toFixed(2)}
```

与 4.2 + 4.3 相同（行 1 末段 footer + 行 2 末段 footer）。

## 5. 总分与等级（4 行）

```ts
// 行 1：总分小计
{ label: '总分小计 = ', value: '29.40 + 24.50 + 14.40 + 7.20 + 3.00 = 78.50分' }
// 拼接：${dimScores.join(' + ')} = ${sumOfDimensionScore}分

// 行 2：课堂时长
{ label: '课堂时长T = ', value: '39分26秒', hint: 'T ≥ 30 → 1.00' }
// 用 formatA2DurationDisplay(classDurationRaw) + classDurationCoefficient + buildDurationCoefficientHint

// 行 3：最终总分
{ label: '最终总分 = ', value: '78.50 × 1.00 = 78.50分' }
// 拼接：${sumOfDimensionScore} × ${classDurationCoefficient} = ${finalTotalScore}分

// 行 4：对应等级
{ label: '对应等级', value: '', gradeCode: 'B', gradeBadge: '良好' }
```

## 6. 档位区间表（前端常量，复用 mock）

复用 `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/a2-data/score-detail-dialog.ts` 中三套常量：

- `TIER_ROWS_4PT`：4 分制（小结设计、逻辑清晰度、导入设计等）
- `TIER_ROWS_3PT`：3 分制（学生参与度）
- `TIER_ROWS_KNOWLEDGE`：知识落实度（4 分制特殊档位）

按 `fullScore` 选哪套（4→4PT 或 KNOWLEDGE，3→3PT）。知识落实度按 `dimensionCode === 1` 选 KNOWLEDGE。

## 7. 实施

### 7.1 改动文件

| 操作 | 文件 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportA2ScoreDetailDialog.vue`（不改结构，仅 type 校验）|

### 7.2 mapper 改动

新增导出函数：

```ts
export function mapEvaluationResultToScoreDetail(
  er?: A2EvaluationResultVO | null
): A2ScoreDetailDialog
```

并在 `mapA2ReportToClassroomContentPayload` 的两处（line 1572、1591）把：

```ts
scoreDetail: A2_SCORE_DETAIL_DIALOG_MOCK,
```

改为：

```ts
scoreDetail: mapEvaluationResultToScoreDetail(vo.evaluationResult),
```

### 7.3 不动

- mock `A2_SCORE_DETAIL_DIALOG_MOCK`（保留作为 `evaluationResult` 为 null 时的 fallback）
- 弹窗组件结构
- 后端
- 路由
- 样式

## 8. 验收

- [ ] 新增 `mapEvaluationResultToScoreDetail(er: A2EvaluationResultVO | null): A2ScoreDetailDialog` mapper
- [ ] 5 个文案模板规则在 mapper 内实现
- [ ] 5 个维度都判断 `compensationCheck` 是否非空
- [ ] `scoreDetail` 切换为 mapper 输出
- [ ] `evaluationResult` 为 null 时仍 fallback 到 mock
- [ ] `pnpm exec tsc --noEmit` 通过
- [ ] 既有 `classroom-content-analysis-a2.mapper.spec.ts` 通过
- [ ] archive 追加 Phase 5 段
