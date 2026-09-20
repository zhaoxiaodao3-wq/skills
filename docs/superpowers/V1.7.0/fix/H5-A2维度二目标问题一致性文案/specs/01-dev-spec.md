# H5-A2维度二目标问题一致性文案 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

H5 A2「3.6 教师提问 → 分析结论三维诊断 → 维度二 目标-问题一致性」的 `goalCards` 字段标签与右上角匹配度 tag 文案不符合产品要求。

## 2. 改动

**文件：** `E:\code\H5\src\pages\share\analysisTeachingA2\adapters\mapA2ToView.ts`

在 `dimensionTwo.goalCards` 映射中：

| 项 | 现逻辑 | 目标 |
|----|--------|------|
| field | `应达层次` | `需要的认知层次` |
| field | `实际层次` | `实际问题的认知层次` |
| field | `诊断` | `诊断说明` |
| badge | `text(m.matchDegree)`（非 `--` 时） | `` `匹配度：${text(m.matchDegree)}` ``；`--` 仍不设 badge |

`A2FieldCard` 已直接展示 `card.badge` / `fields[].label`，组件层无需改。

## 3. 非目标

- `mapA2ToView` 内学情 `dimRows` 等其它「诊断」label
- Web / PDF / muban 模板

## 4. 验收标准

- [x] 维度二目标卡片三字段文案为：需要的认知层次 / 实际问题的认知层次 / 诊断说明
- [x] 有匹配度时右上角显示 `匹配度：xxx`；无有效匹配度时不显示 badge
- [x] 其它章节卡片文案未误改
