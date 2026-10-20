# 预警组件 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-19
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `apps-development-platform`（分支 `dev/lianglinbin`）· **按用户规则未 commit，改动全部在工作区**

## 改动摘要

交付四页公共「预警」组件（`src/components/teacher-warning-list/`，主组件 + `teacher-warning-dialog` 弹窗子件 + README）：标题按 `permission` 走 `WARN_PAGE_TITLES` 单点映射（预警聚焦 / 本年级预警 / 学科预警 / 本组预警）；el-table 二定制（表头 `#F3F9FF` h42、行 h50、教师名 16/600 `#027AFF` 可点、数量 `#FF2A2A`、率 `#555`、提示 `#FFF5F5` 胶囊红字 14px）；分页复用「等级数量明细」规格（10 条/页、32×32 r2、未选中 `#F2F3F5`、激活蓝底、居中、jumper 右、页码间隙 8px）；点击教师名开 **el-dialog 640 r8「教师详情」** 弹窗（#16 数据驱动键值行 + classes/remark 占位扩展字段，seq 防连点串数据）。四页页尾 `__warn-row`：左预警卡（pad 30/20 白卡）**右半留白**（激励榜等同事组件位），≤1280 塌单列。mock 替换点 **#15 列表 / #16 教师详情**。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/components/teacher-warning-list/{teacher-warning-list.vue, .model.ts, .data.ts, .scss, teacher-warning-dialog.vue, teacher-warning-dialog.scss, README.md}` |
| 改 | `src/constants/overview.ts`（`WarningRow` / `WarningPageData` / `WarningTeacherDetail` / `WARN_PAGE_TITLES`） |
| 改 | `src/api/overview.ts`（`getWarningPageApi` #15 + `getWarningTeacherDetailApi` #16） |
| 改 | `src/views/{grade-overview, plan-lessons, subject-overview-2, principal-cockpit-2}` 的 `.vue` + `.scss`（页尾 `__warn-row` 接入） |
| 增 | 文档：`V1.7.1/feature/预警组件/{requirements,specs,plans}`（含渲染图 `requirements/assets/figma-teacher-warning@3x.png`） |

## 验收结果

- [x] spec §6 验收项 1~10 全部勾选（10/10）；自动化项（vue-tsc / eslint / stylelint / ls-lint / build / mock 与标记）由 Agent 验证，浏览器目测由用户手动验证后指示归档（2026-10-19）。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `list` 空 → el-table 内置「暂无数据」；弹窗无 `teacherId` 不发请求、关闭清空；加载中 `is-refreshing` 降透明度 |
| 常量 / mock / 真数据 | 通过 | 组件只消费 `api/overview.ts` 的 #15/#16；标题单点 `WARN_PAGE_TITLES`；列文案/颜色/`PAGE_SIZE` 单点 `.data.ts`；mock 带 `TODO(1.7.1-接口替换)` 标记，对接组件零改动 |
| 多入口 | 通过 | 四页同组件，仅 `permission` prop 不同；右半列统一留白；已交付组件零改动；并行会话（weak-link/Drill）无交叉 |
| 失败 / 缺省 | 通过 | #16 查不到 id 回退第一条；`classes/remark` 缺省不渲染该行；`requestSeq` 覆盖列表与弹窗两条链路（含连点不同教师）；route 三键变化回第 1 页 |

## 还原度自检

**适用**（feature 含 Figma：node `9913:49238`，年级长版渲染）。

- **对照方式**：Figma REST API 节点提取（卡 pad 30,20 / 标题竖条 4×16 + 20/600 / 表头 `#F3F9FF` h42 16/600 列距 28 / 行 h50 / 教师名 `#027AFF` 600 / 数量 `#FF2A2A` / 率 `#555` / 提示胶囊 `#FFF5F5` r4 h30 padH10 14/400 `#FF2A2A` / 分页 32 r2 未选中 `#F2F3F5` 激活 `#027AFF`）→ 落盘 spec §5 → 实现；渲染图归档；视觉目测由用户手动完成。
- **一致项**：标题行、表格四列规格与三色、提示胶囊、分页全套 token、数量降序样例。
- **偏差清单**：
  1. 标题按权限四版本（稿仅「本年级预警」）——需求指定。
  2. 弹窗稿未画 → el-dialog 640 r8 通用骨架（数据驱动键值行 + 占位扩展字段），有稿再精修。
  3. 列布局 el-table 满宽均分（稿固定 100/100/100/150 + 列距 28）——视觉近似。
  4. 右半列稿未给 → 留白（同事组件位）。
  5. 行高/表头等与「等级数量明细」共用 EP 定制体系（行 50 为本稿专属）。
- **结论**：可交付。

## 验证记录

- `npx vue-tsc --noEmit -p apps/data-board/tsconfig.app.json` → **0 error**
- `npx eslint --fix` + 复检（代码文件）→ **0 错**（README 目录喂 eslint 的解析错为已知假阳性，提交 glob 不含 md）；`stylelint --fix` + 复检 → **0 错**；`ls-lint` 全过
- `pnpm build:data-board:develop` → 构建成功
- 浏览器目测：用户手动验证后指示归档

## 待办与后续接入

- **替换点 #15 / #16**：函数签名不变，映射写在 `api/overview.ts`；口径见 README（数量降序后端、tip 后端文案、弹窗扩展字段后端定稿后同步弹窗键列表）
- **右半列**：「激励榜」等同事组件接入时在 `__warn-row` 追加第二个 `__warn-card`
- **弹窗精修**：拿到教师详情设计稿后按稿调整（当前通用骨架）

## Harness 闭环

- [x] 模块目录四层齐全（requirements / specs / plans / archive）
- [x] requirements / spec / plan 链接正确（头部互指）
- [x] 改 src/ 前 P1（8 点「按建议」）/ P2（spec OK）/ P3（Inline）暂停点均获用户确认（2026-10-19）
- [x] Skill 路由：`echarts` 0.70 误报人工**全部否决**（无图表）；`riskLevel` 低；分页/表格先例复用 level-detail-table / group-focus
- [x] spec 验收项已勾选（10/10）
- [x] 一致性自检 4/4 通过并写入本 archive
- [x] 还原度自检已完成（适用；节点 9913:49238，偏差 5 项记录）
- [x] archive 交付快照已写；组件 README（组件说明 + 对接说明）已交付
- [x] `pnpm harness:status` / `harness:check` 机械门禁不可用（frontend-local 无脚本），Agent 层手动等价执行（NO_MODULE → … → READY_TO_DEV → DELIVERED）
- [x] **未 commit、未 push**（用户规则，改动全在工作区）
