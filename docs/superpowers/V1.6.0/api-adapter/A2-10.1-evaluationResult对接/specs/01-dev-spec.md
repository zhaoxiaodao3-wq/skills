# A2 Web 10.1 对接 evaluationResult · Dev Spec

**模块：** `api-adapter/A2-10.1-evaluationResult对接`  
**档位：** 标准  
**日期：** 2026-09-09  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

Web A2 10.1 改为消费 `aReport.evaluationResult`；删除旧 `scoring.summaryTable` 10.1 映射。

## 2. 数据源

```text
caseBasicInfo.aReport.evaluationResult
  ├── dimensionList[]
  └── totalCalc
```

样例结构见企业微信文档 `课堂评估-final.json`（含注释，解析时需去注释）。

## 3. 维度表映射

| 列 | 取值 |
|----|------|
| 维度 | `dimensionName` |
| 档位 | `finalGrade` |
| 补偿标记 | 存在 `compensationCheck` 且 `compensationEffective === true` →「补偿触发」；否则空/`--` |
| 得分 | `` `${dimensionScore}/${fullScore}` `` |
| 核心依据 | `coreBasis`；缺/空 → `--` |

### 满分 `fullScore` 规则

| 维度名 | 满分 |
|--------|------|
| 小结设计 | **固定 10**（忽略接口 `weight`） |
| 其它维度 | `round(Number(weight) * 100)`（如 `0.35` → `35`） |

图一对照（非硬编码表，仅验收参考）：知识 35 / 逻辑 25 / 导入 20 / 学生 10 / 小结 10。

## 4. 底部汇总（`totalCalc`）

| 行 | 字段 | 展示 |
|----|------|------|
| 总分小计 | `sumOfDimensionScore` | 数值直出（不加权重后缀） |
| 课堂时长T | `classDurationRaw` | 直出；若需统一分秒可复用现有 duration 格式化 |
| 时长系数 | `classDurationCoefficient` | value = 系数；**右侧 hint 动态**（见下） |
| 最终总分 | `finalTotalScore` | 数值；公式文案可保留「总分小计×时长系数」类提示（与现 UI 槽位兼容） |
| 等级 | `overallGrade` + `overallGradeDesc` | `gradeCode` / `gradeBadge` |

### 时长系数 hint（图二，按 T 分钟）

从 `classDurationRaw` 解析出分钟数 T（已是「X分Y秒」则取分钟部分）：

| 条件 | 系数（验收对照） | hint 文案建议 |
|------|------------------|---------------|
| T ≥ 30 | 1.00 | `T ≥ 30 → 1.00` |
| 20 ≤ T < 30 | 0.80 | `20 ≤ T < 30 → 0.80` |
| 10 ≤ T < 20 | 0.70 | `10 ≤ T < 20 → 0.70` |
| T < 10 | 0.50 | `T < 10 → 0.50` |

展示以接口 `classDurationCoefficient` 为 value；hint 按上表由 T 生成（不反推改写 value）。

## 5. 删除范围（旧 10.1）

仅移除/停用与 `scoring.summaryTable` → 10.1 相关的：

- `mapScoreSummaryTailRows`、`SUMMARY_TAIL_*`、`pickDurationCoeffHint`（若仅服务 10.1）
- `mapRestChapters` 内 scoring 段改为读 `evaluationResult`
- 相关单测期望、`chapter-rest` 中 10.1 mock 可改为新结构或最小桩

**禁止波及：** 章二～九映射、`buildScore` / 封面总分、`formatA2DurationDisplay`（若仍被 header 用）、G05 `scoreDetail` 弹窗数据源。

## 6. VO

在 `PostClassReportA2VO` 增加 `evaluationResult?`，含：

- `dimensionList[]`：`dimensionName`, `finalGrade`, `dimensionScore`, `weight`, `compensationCheck?`, `coreBasis?` 等
- `totalCalc`：`sumOfDimensionScore`, `classDurationRaw`, `classDurationCoefficient`, `finalTotalScore`, `overallGrade`, `overallGradeDesc`

旧 `scoring` 类型可保留但 10.1 不再读取。

## 7. 验收

1. 有 `evaluationResult` 时 10.1 出表 + 底栏五选行  
2. 得分形如 `29.4/35`；小结设计分母恒为 10  
3. 补偿仅 `compensationEffective===true` 显示「补偿触发」  
4. `coreBasis` 空 → `--`  
5. 时长系数右侧 hint 随 T 变化  
6. 无 `evaluationResult` → 10.1 空表/空汇总，不回退旧 summaryTable  
7. 其它章节回归正常  

## 8. 实现落点

- `mappers/classroom-content-analysis-a2.mapper.ts`
- `types/teaching-diagnosis-a2-report-vo.ts`
- `mappers/classroom-content-analysis-a2.mapper.spec.ts`
- 按需：`mock/a2-data/chapter-rest.ts`
