# H5教师画像提问类型 · 交付归档

**归档类型：** ui-style 交付快照  
**归档日期：** 2026-07-22  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

在 H5 教师画像分享页、课堂结构清晰度下方挂载「提问类型」：四何问题 + 布鲁姆分类双卡（饼图/图例/小计），数据接 `questionType`，样式对齐 Figma `7485:15161`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `E:\code\H5\src\pages\share\teacherProfile\adapters\adapt-question-type.ts` |
| 增 | `E:\code\H5\src\pages\share\teacherProfile\chart-options\question-type-chart.ts` |
| 增 | `E:\code\H5\src\pages\share\teacherProfile\components\QuestionTypePanel.vue` |
| 增 | `E:\code\H5\src\pages\share\teacherProfile\components\QuestionTypeSection.vue` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\adapters\adapt-share-get-report.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\types\share-report.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\useTeacherProfileShare.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\index.vue` |

## 验收结果

- [x] 标题「提问类型」+ 双卡纵向，对齐 Figma  
- [x] 四何 / 布鲁姆字段、色、图例文案正确（应用类无「为」）  
- [x] 小计用接口 subtotal；饼图 rem 正常  
- [x] 空态等分色饼 + 0 个 / 小计 0  
- [x] 未做后续模块  

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `adapt-question-type.ts` 空态与有数据同构；饼图 empty 等分 |
| 常量/mock/真数据 | 通过 | SIHE/BLOOM 色与文案对齐 PC constants |
| 多入口 | N/A | 仅分享页单一挂载 |
| 失败/缺省 | 通过 | 缺组 → 空态双卡 |

## 还原度自检

- Figma 节点：`7485:15161`
- 对照方式：`get_design_context` + `fixtures/figma-7485-15161.png` + Spec §4
- 偏差清单：图例「应用类」不用稿面笔误「应用类为」；双卡纵向（非 PC 大屏并排）
- 结论：可交付

## Harness 闭环

- [x] validate 开发前已跑  
- [x] archive 交付快照已写  
- [x] validate 交付后已跑  
