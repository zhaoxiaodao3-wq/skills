# H5教师画像分享页图表三处对齐 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-23
**版本：** V1.4.9
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

H5 教师画像分享页：评分趋势常显数据点以支持 hover；课堂结构清晰度有数据时按分排序对齐 PC；提问类型饼图 hover 放大不再被裁切，且静止态直径保持 80px。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:/code/H5/src/pages/share/teacherProfile/chart-options/score-trend-chart.ts` |
| 改 | `E:/code/H5/src/pages/share/teacherProfile/chart-options/classroom-clarity-chart.ts` |
| 改 | `E:/code/H5/src/pages/share/teacherProfile/chart-options/question-type-chart.ts` |
| 改 | `E:/code/H5/src/pages/share/teacherProfile/components/QuestionTypeSection.vue` |
| 改 | `E:/code/H5/src/pages/share/teacherProfile/components/QuestionTypePanel.vue` |

## 验收结果

- [x] 评分趋势 `showSymbol: true`
- [x] 结构清晰度有数据按分升序 / 空态稿序 reverse
- [x] 提问类型 overflow visible + canvas 外扩 + radius 补偿，静止直径 80
- [x] 未改 PC

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 清晰度 `isEmpty` 走 empty reverse；有数据走按分排序 |
| 常量/mock/真数据 | N/A | 未改维度常量与接口字段 |
| 多入口 | 通过 | 仅 H5 分享页三处；PC 未动 |
| 失败/缺省 | 通过 | 空态排序与 PC empty 规则一致 |

## 还原度自检

不适用：无 Figma / 非 UI 新稿；对齐既有 PC 行为

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
