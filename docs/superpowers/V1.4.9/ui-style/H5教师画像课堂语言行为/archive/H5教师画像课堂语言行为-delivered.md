# H5教师画像课堂语言行为 · 交付归档

**归档类型：** ui-style 交付快照  
**归档日期：** 2026-07-22  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

在 H5 教师画像分享页、提问类型下方挂载「课堂语言行为」：环形图 + 五类图例（份/%）+ 小计（个），数据接 `speakingBehavior`，样式对齐 Figma `7485:15217`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `E:\code\H5\src\pages\share\teacherProfile\adapters\adapt-speaking-behavior.ts` |
| 增 | `E:\code\H5\src\pages\share\teacherProfile\chart-options\speaking-behavior-chart.ts` |
| 增 | `E:\code\H5\src\pages\share\teacherProfile\components\SpeakingBehaviorPanel.vue` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\adapters\adapt-share-get-report.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\types\share-report.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\useTeacherProfileShare.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\index.vue` |

## 验收结果

- [x] 标题「课堂语言行为」；环图+五类图例+小计对齐 Figma  
- [x] 字段/色正确；图例「份」、小计「个」  
- [x] 占比 1 位截断；空态等分环 + `--%`  
- [x] rem 下环宽正常；未做后续模块  

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `adapt-speaking-behavior.ts` 空态同构；chart 等分 value=1 |
| 常量/mock/真数据 | 通过 | 五色/文案对齐 PC LANGUAGE_BEHAVIOR；total 优先 |
| 多入口 | N/A | 仅分享页单一挂载 |
| 失败/缺省 | 通过 | 缺块 → 空态 VM；status≠0 不挂载 |

## 还原度自检

- Figma 节点：`7485:15217`
- 对照方式：`fixtures/figma-7485-15217.png` + Spec §4
- 偏差清单：无实质性偏差（环半径按 PC `52%/88%`）
- 结论：可交付

## Harness 闭环

- [x] validate 开发前已跑  
- [x] archive 交付快照已写  
- [x] validate 交付后已跑  
