# 年级长下钻弹窗样式优化 · 交付归档

**归档类型：** ui-style 交付快照
**归档日期：** 2026-10-19
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `apps-development-platform` · **按用户规则未 commit，改动在工作区**

## 改动摘要

按 Figma REST 提取 token（node `9913:57744` / `9913:58229`）修正年级长下钻弹窗样式：等级分布浅底只包 label、报告等级 64×18 胶囊、分页居中且页码 8px 间距、趋势切换未选圆点去环并将箭头移出灰轨、分数/等级趋势折线颜色与平滑曲线、双轴实线正交网格。用户 P1 确认后明示「直接改」（宽松模式合并 P2/P3，仍落盘 spec/plan）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps/data-board/src/components/class-subject-drill-dialog/class-subject-drill-dialog.vue` |
| 改 | `apps/data-board/src/components/class-subject-drill-dialog/class-subject-drill-dialog.scss` |

## 验收结果

- [x] 1. 等级分布：等级字有浅底胶囊，数量无底
- [x] 2. 报告等级：64×18 r2 胶囊；报告评分仍为纯文本
- [x] 3. 分页水平居中，页码间约 8px 间距
- [x] 4. 切换器：未选点纯 `#80BCFF` 无环；箭头在灰轨外
- [x] 5. 分数趋势：粉线 `#FF55E3` 平滑 + 白底粉环点；等级趋势蓝线平滑；两轴实线正交网格
- [x] 6. 等级趋势类目轴与稿一致（待改进→优秀）
- [x] 7. `vue-tsc` 0 error；`stylelint` 0 error；`eslint` 无新增

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 纯样式改动；未改 loading/空数据分支 |
| 常量/mock/真数据 | 通过 | 仍复用 `GRADE_BG`/`GRADE_COLORS`/`GRADE_ORDER` 单点，无第二套色值 |
| 多入口 | 通过 | 仅改公共 `class-subject-drill-dialog`，调用方（weak-link-table 等）零改动 |
| 失败/缺省 | N/A | 未改请求/防竞态/分页边界逻辑 |

## 还原度自检

**适用**（主弹窗 `9913:57744` · 等级趋势 `9913:58229` · 分数趋势对照 `9913:58230`）。

- **Figma 节点：** `9913:57744`（等级分布/报告等级/分页/切换器/分数趋势）、`9913:58229`（等级趋势图）
- **对照方式：** Figma REST `/v1/files/.../nodes` 提取 token（`requirements/assets/figma-nodes-raw.json` + `extract-figma.mjs`/`extract-detail.mjs`/`extract-tabs.mjs`）→ 对照实现代码；浏览器端 `vue-tsc`/`stylelint` 验证。**Agent 侧未跑浏览器截图**（用户「直接改」；视觉目测可由用户手动完成）
- **偏差清单：**
  1. 「报告评分」设计稿为无底纯文本，**未**加底色；用户所指底色按「报告等级」胶囊处理（P1 已说明）
  2. eslint 12 error（kebab-case / import 排序 / if-newline）为组件既有，非本次引入
  3. stylelint --fix 顺带规范化了该 scss 属性顺序/色值简写（`#333333`→`#333` 等），不改变视觉
  4. 等级趋势点 symbolSize 4 为近似（稿中等级折线以路径为主，未强调点样式）
  5. 弹窗宽度 `52vw` 等容器适配沿用既有实现，非本次范围
- **结论：** 可交付（token 级对照通过；若浏览器目测仍有差请指出节点级差异）

## 验证记录

- `vue-tsc --noEmit -p apps/data-board/tsconfig.json` → exit 0
- `stylelint class-subject-drill-dialog.scss` → exit 0
- `eslint class-subject-drill-dialog.vue` → 12 error / 14 warning，与改动前同源（组件既存）
- 未执行 `pnpm build:data-board`（改动为单组件样式/option；类型检查已覆盖）

## 待办与后续接入

- 用户可在本地 `pnpm dev:data-board` 打开年级长页 → 薄弱教学环节「下钻」做视觉目测
- 替换点 #13~#16（真实接口）与教师详情内容仍属前序模块待办

## 交付后修订 · 二（2026-10-19 用户反馈：开关/虚线仍不对）

对照 Figma 官方 2x 渲染图（`requirements/assets/figma-9913-57744@2x.png` 等）+ `dashPattern` 全量提取后修正：

1. **趋势切换**：按渲染图与用户口径，胶囊内**仅文字**（选中蓝底白字 600、未选灰字 400），删除圆点装饰（节点树里有 Ellipse 但渲染不可见；模板与 scss 已去掉 `__tab-dot`）
2. **网格虚线**：Figma 全部网格 Vector `dashPattern=[4,4]` `#E5E6EB`——上次误改为实线已回退；`xAxis`/`yAxis` 的 `splitLine` 均为 `type:'dashed'`，轴线仍实线
3. **等级趋势纵轴**：Y 类目四条横向网格同为虚线（与上条同一 splitLine 配置）；类目顺序 待改进→优秀 不变
4. 验证：`vue-tsc` 0；`stylelint` 0

## 交付后修订 · 三（2026-10-19 用户反馈：箭头 / hover / 虚线再修）

| 问题 | 处理 |
|------|------|
| 开关最右不要箭头 | 删除模板 `el-icon ArrowDown`、import、`__tabs-arrow`/`__trend-switch` 样式；仅灰轨道两胶囊 |
| hover 按设计稿 | 取 node `9913:57952`（`figma-hover-raw.json` + `figma-9913-57952@2x.png`）：白底 r8 pad15；标题 14/600；点标白芯+线色粗描边；姓名 400 + 分数 600 +「分」400；axisPointer 虚线 `#555` 0.5 |
| 横纵虚线 | 双轴 `splitLine: dashed #E5E6EB`；`axisLine.show:false`（隐藏实线轴线，与稿一致） |

验证：`vue-tsc` 0；`stylelint` 0；组件内无 ArrowDown / tab-dot / tabs-arrow 残留。

## 文档

- 组件使用文档：`apps/data-board/src/components/class-subject-drill-dialog/README.md`（已按本轮样式/token 重写：open API、三区块、Figma token 表、接口替换点）

## 最终改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps/data-board/src/components/class-subject-drill-dialog/class-subject-drill-dialog.vue` |
| 改 | `apps/data-board/src/components/class-subject-drill-dialog/class-subject-drill-dialog.scss` |
| 改 | `apps/data-board/src/components/class-subject-drill-dialog/README.md` |

## Harness 闭环

- [x] 模块目录四层齐全（`V1.7.1/ui-style/年级长下钻弹窗样式优化/{requirements,specs,plans,archive}`）
- [x] requirements / spec / plan 链接正确
- [x] 机械门禁不可用（frontend-local 无 harness scripts），Agent 层手动等价执行；改实现前已落盘文档
- [x] spec 验收项已勾选
- [x] 一致性自检已完成并写入 archive
- [x] 还原度自检已完成（Figma REST token 对照）
- [x] archive 交付快照已写
- [x] 未 commit / 未 push（用户规则）
- [x] 用户 P1 确认 + 明示「直接改」→ 宽松模式合并 P2/P3（已警告并落盘短 spec/plan）
