# 教师对比弹窗 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-19
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

教师列表勾选对比原先只有空壳 `el-dialog`，本次按 Figma `9913:52667` 落地公共组件 `teacher-compare-dialog`（周趋势多折线 + 核心指标对比表），对齐 `teacher-detail-dialog` 三件套模式，供全站对比入口复用。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps/data-board/src/constants/overview.ts`（CompareTeacher / 趋势 / 指标类型） |
| 改 | `apps/data-board/src/api/overview.ts`（#23/#24 mock） |
| 增 | `apps/data-board/src/components/teacher-compare-dialog/teacher-compare-dialog.vue` |
| 增 | `apps/data-board/src/components/teacher-compare-dialog/teacher-compare-dialog.scss` |
| 增 | `apps/data-board/src/components/teacher-compare-dialog/teacher-compare-dialog.model.ts` |
| 增 | `apps/data-board/src/components/teacher-compare-dialog/teacher-compare-dialog.data.ts` |
| 增 | `apps/data-board/src/components/teacher-compare-dialog/teacher-compare-dialog.util.ts` |
| 增 | `apps/data-board/src/components/teacher-compare-dialog/README.md`（组件使用文档） |
| 改 | `apps/data-board/src/views/teacher-list/teacher-list.vue`（空壳→公共组件） |
| 改 | `apps/data-board/src/views/teacher-list/teacher-list.scss`（删空壳样式） |
| 改 | `apps/data-board/src/views/teacher-list/README.md` |

## 验收结果

- [x] 标题展示所选学期 `教师对比（…）`
- [x] 对比对象=姓名+年级+学科，≤10，勾选顺序
- [x] 每人一条曲线；横轴 1..总周数；纵轴分数
- [x] 75 分绿虚线，label「良好」
- [x] 点分数 1 位小数截断不四舍五入
- [x] tooltip=该周全部有数据教师
- [x] 有几周画几周，缺周不补
- [x] 指标表跟稿：教师行 + 指标列 + 等级徽章
- [x] 姓名列固定，列溢出横滑
- [x] 公共组件五件套 + teacher-list 接线
- [x] 空态/缺省合理
- [x] mock #23/#24 + TODO
- [x] 弹窗宽 52.08vw min 800（用户 2026-10-19 确认比例）

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 图卡无 series → 「暂无数据」；el-table `empty-text`；与有数据路径共用组件 |
| 常量/mock/真数据 | 通过 | 分数同源 `truncateOneDecimal`；等级色 `GRADE_COLORS/GRADE_BG`；色板 `SERIES_COLORS` 单源 |
| 多入口 | N/A | 当前仅 teacher-list 一处调用；组件已公共化（`open()` + README） |
| 失败/缺省 | 通过 | 缺周 `null`+`connectNulls:false`；徽章计数缺省 `0`；`requestSeq` 防竞态；`@closed` 清态 |

## 还原度自检

- **Figma 节点：** `9913:52667`（渲染图 `../requirements/assets/figma-9913-52667@2x.png`，outline/JSON 同目录）
- **对照方式：** Figma REST `nodes?depth=50` + 2x PNG → spec §5 样式表 → SCSS / ECharts option 逐项落地
- **偏差清单：**
  1. 稿末列表头重复「待改进率」→ 实现为「等级分布」（稿笔误）
  2. 原需求 4.1「列横滑展示更多教师」与稿「教师=行」冲突 → P1 用户裁定**跟稿**；姓名列仍 `fixed` 保留「第一列不动」
  3. 弹窗宽 1000px 定宽 → 用户确认改为 `52.08vw` min 800（比例还原 1920 稿）
- **结论：** 可交付（token 级对齐；浏览器实机走查建议开发服自测一轮）

## Harness 闭环

- [x] validate 开发前已跑（机械层不可用，Agent 手工核验 READY_TO_DEV）
- [x] archive 交付快照已写
- [x] validate 交付后已跑（vue-tsc EXIT 0 / eslint EXIT 0；机械 harness:check 不可用）
- [x] 组件使用文档已写（`teacher-compare-dialog/README.md`）

## 状态

**DELIVERED** · 代码在工作区，未 commit（按约定留给用户提交）
