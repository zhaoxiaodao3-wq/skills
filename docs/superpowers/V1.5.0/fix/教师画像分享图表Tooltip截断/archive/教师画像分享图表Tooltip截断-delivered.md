# 教师画像分享图表 Tooltip 截断 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-31
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

仅对提问类型「布鲁姆分类」饼图开启 tooltip 挂 body / 取消 confine，避免长分类名在小图槽内被裁切；四何与其它图表不动。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:\code\H5\src\pages\share\teacherProfile\chart-options\question-type-chart.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\components\QuestionTypePanel.vue` |

## 验收结果

- [x] 布鲁姆 escapeContainer 已接
- [x] 四何不开启 escapeContainer
- [x] 未改 CHART_TOOLTIP_BASE / MrEcharts / 其它图

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | tooltip 仍 `show: !showEmptyChart` |
| 常量/mock/真数据 | N/A | 无接口映射变更 |
| 多入口 | 通过 | 仅 bloom 标题匹配开启 |
| 失败/缺省 | N/A | 无分享失败态变更 |

## 还原度自检

不适用：无 Figma / 非 UI 样式对照。

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
