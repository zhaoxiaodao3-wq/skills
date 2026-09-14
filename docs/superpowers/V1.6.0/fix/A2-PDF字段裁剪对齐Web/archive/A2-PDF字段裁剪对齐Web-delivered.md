# A2-PDF字段裁剪对齐Web · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-14  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

A2 PDF 模板对逻辑深度分析、3.3 重难点、维度三、问题链总结/评价、10.1 得分与时长/最终分的展示，按 Web mapper 主路径做了裁剪与格式对齐；本地预览脚本同步支持嵌套 `#strings.replace` 并修正模板路径。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/report/report/A2/ClassroomContentAnalysisReportA.html` |
| 改 | `scripts/preview-a2-thymeleaf-pdf.mjs` |
| 改 | `scripts/fixtures/a2-mock-full.json`（补 `weight`、优化建议拆分样例） |

## 验收结果

- [x] 板块一：依据/整体判断去前缀
- [x] 板块四：学段与学年规范化；正文去标题与前置标点
- [x] 3.3：leadContent 去教案前缀
- [x] 维度三：内容去固定标题前缀
- [x] 递进路径总结：去前缀并按句拆分
- [x] 整体评价/优化建议：去「整体评价：」并拆分优化建议
- [x] 10.1：`得分/满分`（依赖接口 `weight`；小结设计满分 10）
- [x] Hero / 10.1 时长格式
- [x] 最终得分后缀 `（=总分小计×时长系数）`
- [x] 本地 `--with-cover` PDF 抽查通过（`a2-merged.full.mu0ostbb.pdf`）

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 空字段仍走 `-` /「暂无数据」分支 |
| 常量/mock/真数据 | 通过 | 裁剪规则对齐 `classroom-content-analysis-a2.mapper.ts`；fixture 补 weight |
| 多入口 | N/A | 仅 PDF 模板轨，未改 Web/H5 |
| 失败/缺省 | 通过 | weight 缺失时满分可为 0（与 round 规则一致）；真实接口带 weight |

## 还原度自检

不适用：无 Figma / 非 UI 样式任务（字段裁剪对齐 Web）

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
