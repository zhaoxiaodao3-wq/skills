# 组内即时关注组件 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-16
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `apps-development-platform`（分支 `dev/lianglinbin`）· **按用户规则未 commit，改动全部在工作区**

## 改动摘要

交付「组内即时关注」业务组件（`src/components/group-focus/`）：单组件数据驱动四态（待改进红/优秀绿/平稳灰+速览卡/空态），内嵌周次筛选（通用）+ 科目筛选（仅年级长，`showSubjectFilter` 开关），切换即重新请求（请求序号防竞态），表格可视区 3 行内部滚动，评分列状态着色，图标全部使用 Element Plus 内置图标（零图片资源）。抽取共享下拉样式 `src/styles/el-select-filter.scss`。接入三个页面。设计值全部来自 Figma REST API 精确提取（四态节点），四态截图归档于 `requirements/assets/`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/components/group-focus/{group-focus.vue, .model.ts, .data.ts, .scss, README.md}` |
| 增 | `src/styles/el-select-filter.scss`（共享下拉 mixin） |
| 改 | `src/api/overview.ts`（追加 #6/#7 mock 函数） |
| 改 | `src/constants/overview.ts`（追加 Focus 系列类型） |
| 改 | `src/components/overview-filters/overview-filters.scss`（改用共享 mixin，视觉不变） |
| 改 | `src/views/grade-overview.vue`（接入，showSubjectFilter=true） |
| 改 | `src/views/plan-lessons.vue`、`src/views/subject-overview-2.vue`（接入） |

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | empty/stable 由接口 status 区分（空=空态块、平稳=速览卡），组件不猜测；选项/数据未就绪整块不渲染（v-if ready/data） |
| 常量/mock/真数据 | 通过 | 组件只消费 `src/api/overview.ts` 函数；状态主题映射单点（`group-focus.data.ts`）；提示条文案/表格列/统计卡全数据驱动，组件零业务文案硬编码（仅骨架标题） |
| 多入口 | 通过 | 三页面同一组件同一数据流，仅 `showSubjectFilter` 差异；周次/科目为组件内部状态（P1 确认不读写 URL） |
| 失败/缺省 | 通过 | 请求序号防竞态（实测快速切换）；mock 非法 weekId 回退平稳态；加载中旧内容降透明度防闪跳 |

## 还原度自检

**适用**（Figma node 9913:46538 / 50100 / 50156 / 50196；截图 `requirements/assets/status-*.png`）。

- **对照方式**：REST API 提取 token → 实现 → 浏览器实测四态截图比对（红/绿/灰速览/灰空态四张截图全部比对）。
- **一致项**：标题行（蓝竖条 4x16 `#027AFF` + 20px/600 标题 + 16px `#555` 描述 + 周次下拉 200x30 `#F2F3F5`）、提示条三主题（底色/圆图标/文案 20px）、表格（表头 `#F3F9FF` h42、行底边 `#F2F3F5`、列 gap28、评分红 `#FF2A2A`/绿 `#00B42A` 16px/600）、速览 4 卡（`#F3F9FF`、label 16px `#555`、值 30px/600 + 单位）、空态（圆底白底灰图标 + 20px 文案）。
- **偏差清单**：
  1. 设计稿表头「授课教师」标注 14px/600（其余列 16px/600），实现统一 16px——判断为稿内笔误。
  2. 速览卡与空态块圆角设计稿未标注，按模块语言补 8px。
  3. 空态块底色设计稿未提取到填充值，按截图目测 `#F2F3F5`。
  4. 状态图标用 EP 内置图标（WarningFilled/CircleCheckFilled/InfoFilled/Promotion）替代设计稿矢量图标，形状略异、语义一致。
- **结论**：可交付。

## 验证记录

- vue-tsc 0 error；`pnpm build:data-board:develop` 构建成功。
- 浏览器实测（subject-overview-2 + grade-overview）：
  1. 第五周默认选中 → 待改进红态（红条 + 评分红 42/55/48…，表格 5 行可视 3 行滚动条可见）；
  2. 切第四周 → 优秀绿态（评分绿 93/95/91…）；
  3. 切第三周 → 平稳态（灰条 + 4 速览卡：7 份/80 分/85 分/75 分）；
  4. 切第二周 → 空态（灰条「暂无记录」+ 纸飞机空态块）；
  5. grade-overview 出现周次+科目双筛选（filterCount=2）；subject-overview-2 仅周次；
  6. 顶部筛选下拉（共享样式抽取后）外观无回归。

## 待办与后续接入

- **替换点 #6**：`getFocusFilterOptionsApi(showSubject)`（周次/科目列表，周次倒序由后端保证）
- **替换点 #7**：`getGroupFocusApi({ weekId, subjectId? })`（关注数据；签名已预留筛选入参）
- 均在 `src/api/overview.ts`，全局搜索 `TODO(1.7.1-接口替换):` 可见 #1~#7
- `principal-cockpit`（校长页）不使用本组件；同事接入时按 README 一行即可

## 交付后修订记录

- 2026-10-16（用户反馈）：表格形态由自研轻列表改为 **Element Plus `el-table` 二次定制**（样式与列宽按标准表格呈现，列满宽均分、表头固定、3 行可视滚动）。数据契约（columns/rows）不变，列插槽渲染；emphasis 列状态着色规则移至组件顶层选择器。技术要点：`group-focus__table` 类与 `.el-table` 根同元素（class 合并），CSS 变量须直接定义在本元素而非后代选择器。spec §3.1/§4 已同步修订。改动未提交。

## Harness 闭环

- [x] 模块目录四层齐全
- [x] requirements / spec / plan 链接正确
- [x] P1（5 点补充设计确认 + 表格滚动补充）/ P2（「确认」）/ P3（Inline）暂停点均获用户确认
- [x] spec 验收项已勾选（9/9）
- [x] 一致性自检已完成并写入本 archive
- [x] 还原度自检已完成（适用，偏差 4 项记录）
- [x] 本 archive 交付快照已写
- [x] 机械门禁不可用（frontend-local 无脚本），Agent 层手动等价执行
- [x] **未 commit（用户规则），改动全部在工作区**；未 push
