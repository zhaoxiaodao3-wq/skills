# A2表格列间隙 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-15  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

A2 PDF 表格单元格增加左右内边距，提取为 `--ccar-table-cell-pad-x`（默认 `var(--ccar-space-md)`）；屏显与打印共用，print 随 space-md 缩放。已同步 gen 脚本。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/report/report/A2/ClassroomContentAnalysisReportA.html` |
| 改 | `scripts/gen-ccar-a2-static-html.mts` |

## 验收结果

- [x] 全局变量 `--ccar-table-cell-pad-x`
- [x] `.ccar-table` + 亮点表应用
- [x] print 无第二套硬编码左右 padding
- [x] gen 脚本已同步

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 仅 CSS，不影响空表结构 |
| 常量/mock/真数据 | N/A | 未改数据 |
| 多入口 | 通过 | HTML 模板 + gen 脚本双端同源 |
| 失败/缺省 | N/A | 纯样式 |

## 还原度自检

不适用：无 Figma / 非对照还原任务（列间隙体验 fix）

## Harness 闭环

- [x] validate 开发前已跑（READY_TO_DEV）
- [x] archive 交付快照已写
- [x] validate 交付后已跑
