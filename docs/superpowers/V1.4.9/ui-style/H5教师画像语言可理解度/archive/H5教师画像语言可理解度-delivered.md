# H5教师画像语言可理解度 · 交付归档

**归档类型：** ui-style 交付快照  
**归档日期：** 2026-07-22  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

在 H5 教师画像分享页、课堂语言行为下方挂载「语言可理解度」：三 SVG 半环 gauge + 综合得分/等级 + 课堂特征，数据接 `speakingComprehensibility`，样式对齐 Figma `7485:15270`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `E:\code\H5\src\pages\share\teacherProfile\adapters\adapt-language-comprehensibility.ts` |
| 增 | `E:\code\H5\src\pages\share\teacherProfile\utils\gauge-arc.ts` |
| 增 | `E:\code\H5\src\pages\share\teacherProfile\components\ComprehensibilityGauge.vue` |
| 增 | `E:\code\H5\src\pages\share\teacherProfile\components\LanguageComprehensibilityPanel.vue` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\adapters\adapt-share-get-report.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\types\share-report.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\useTeacherProfileShare.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\index.vue` |

## 验收结果

- [x] 标题「语言可理解度」；三 gauge + 双卡 + 特征对齐 Figma  
- [x] 字段/色/满分正确；等级色按总分落档  
- [x] 空态 0 弧 / `--` / 暂无；分数截断规则正确  
- [x] 挂在语言行为下方；未做标签云  

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | adapter 空态同构；gauge score=0 不画进度弧 |
| 常量/mock/真数据 | 通过 | 维度色/满分/等级表对齐 PC |
| 多入口 | N/A | 仅分享页 |
| 失败/缺省 | 通过 | 缺块 → 空态 VM |

## 还原度自检

- Figma 节点：`7485:15270`
- 对照方式：`get_design_context` + `fixtures/figma-7485-15270.png` + Spec §4
- 偏差清单：双卡/特征圆角 8（非清晰度 4）；gauge 用 SVG 非 ECharts（与 PC 一致）
- 结论：可交付

## Harness 闭环

- [x] validate 开发前已跑  
- [x] archive 交付快照已写  
- [x] validate 交付后已跑  
