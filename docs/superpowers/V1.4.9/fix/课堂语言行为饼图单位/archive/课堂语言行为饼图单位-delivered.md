# 课堂语言行为饼图单位 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-28  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

课堂语言行为饼图 hover（及 H5 图例）单位由「份」改为「个」，与 PC 图例及提问类型一致。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/components/classroom-language-behavior/chart-options.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\chart-options\speaking-behavior-chart.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\components\SpeakingBehaviorPanel.vue` |

## 验收结果

- [x] PC：hover tooltip 单位为「个」
- [x] H5：hover + 图例单位为「个」
- [x] 其它模块单位未误改

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 仅改 tooltip/图例文案单位，空态不展示 tooltip |
| 常量/mock/真数据 | 通过 | PC 图例本就为「个」；tooltip 与图例对齐 |
| 多入口 | 通过 | PC + H5 两处均已改 |
| 失败/缺省 | N/A | 无数据逻辑变更 |

## 还原度自检

不适用：无 Figma / 非 UI 还原（文案单位修正）

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
