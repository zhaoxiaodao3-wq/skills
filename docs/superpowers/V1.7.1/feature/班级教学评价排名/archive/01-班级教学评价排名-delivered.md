# 班级教学评价排名 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-16
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `apps-development-platform`（分支 `dev/lianglinbin`）· **按用户规则未 commit，改动全部在工作区**

## 改动摘要

交付年级长概览「班级教学评价排名」组件（`src/components/class-eval-rank/`，5 文件 + README）：排名视角科目**单选**胶囊（接口列表、默认首项、点击切换不取消、组件内部状态不读写 URL）+ ECharts 柱状图（柱宽 50 全蓝、分数降序同分按班级序号升序的前端稳定排序、Y 轴兜底、**dataZoom 横向滑块 >7 班显示**、三行 tooltip 按稿、`truncateOneDecimal` 一位小数兜底、空态、`requestSeq` 防竞态）。mock 替换点 **#10 科目列表 / #11 排名数据**；共享 `plugins/echarts.ts` 追加一行 `DataZoomComponent` 注册。

同时将 `grade-overview` **模块卡片化**（同备课组长页：根透明 gap 10、模块独立白卡、两占位 PNG 直置），并在占位后新增一行：左半宽卡放本组件、**右半边留白**（未来同事组件位）。

组件使用文档：`src/components/class-eval-rank/README.md`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/components/class-eval-rank/{class-eval-rank.vue, .model.ts, .data.ts, .scss, README.md}` |
| 改 | `src/constants/overview.ts`（`RankSubject` / `EvalRankItem` / `EvalRankData`） |
| 改 | `src/api/overview.ts`（`getEvalRankSubjectsApi` #10 + `getEvalRankDataApi` #11） |
| 改 | `src/plugins/echarts.ts`（追加注册 `DataZoomComponent`） |
| 改 | `src/views/grade-overview/grade-overview.vue`（卡片化结构 + 新行接入） |
| 改 | `src/views/grade-overview/grade-overview.scss`（重构：根 gap 10 / `__card` / `__chart-row` / `__chart-card`） |
| 增 | 文档：`V1.7.1/feature/班级教学评价排名/{requirements,specs,plans}`（含渲染图 `requirements/assets/figma-eval-rank@3x.png`） |

## 验收结果

- [x] spec §6 验收项 1~10 全部勾选（10/10）；自动化项（vue-tsc 0 error、build 成功、eslint/stylelint/ls-lint 全绿、mock 分支与标记）由 Agent 验证，浏览器目测由用户手动验证并指示直接归档（2026-10-16）。

## 代码审查记录（用户要求：Agent 负责审查与格式校验）

- **格式/静态校验**（按提交门禁同款）：`eslint --fix` + 复检 0 错、`stylelint --fix` + 复检 0 错、`ls-lint` 通过、`vue-tsc` 0 error、`pnpm build:data-board:develop` 成功。说明：README 目录喂给 eslint 的 parsing error 为假阳性（提交 glob 不含 md）；kebab-case/import 序由 `--fix` 修复，已交付旧文件同样存在并在提交时同样被修复。
- **审查发现并修复 2 处**：
  1. 首屏竞态：`selectSubject` 原以 `ready` 门控，首屏数据未就绪时切换科目只改选中态不发请求 → 改为立即 `loadData()`，`requestSeq` 兜底。
  2. 空 option 闪烁：`chartOption` 原以 `ready` 门控，数据先到的一帧渲染空 option → 改为 `data.value` 门控（`ready` 只管空态）。
- 审查确认无问题：单选不取消/不重拉、稳定排序 tie-break、转义 + confine、共享注册单点、占位 TODO 与卡片化结构。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `classes` 空 + `ready` → 同款「暂无数据」空态块；数据未到不渲染图表（`data.value` 门控，无闪烁）；mock `subject-3` 英语为空态分支 |
| 常量 / mock / 真数据 | 通过 | 组件只消费 `api/overview.ts` 的 #10/#11 两个函数（签名即契约）；颜色 / 文案 / 转义 / 截断单点于 `class-eval-rank.data.ts`；两处 mock 均带 `TODO(1.7.1-接口替换)` 标记，对接时组件零改动 |
| 多入口 | 通过 | 仅 `grade-overview` 接入；`plan-lessons` / `subject-overview-2` / `principal-cockpit-2` 未动；已交付组件零逻辑改动（`plugins/echarts.ts` 仅追加一行注册，向后兼容） |
| 失败 / 缺省 | 通过 | 非法 subjectId → 空数组空态；科目列表未到不渲染排名行；数值化失败 `truncateOneDecimal` 原样返回；`requestSeq` 防竞态（首屏 + 筛选切换 + 科目切换三处） |

## 还原度自检

**适用**（feature 含 Figma：node **9913:48341**；页面分组参考 9913:46440 同款处理）。

- **对照方式**：Figma REST API `/v1/files/.../nodes` 精确提取 token（色值 / 字号 / 字重 / 间距 / 圆角 / 柱宽 / 卡 padding）→ 落盘 spec §5 样式对照表 → 实现；渲染图归档 `requirements/assets/figma-eval-rank@3x.png`。视觉目测由用户手动完成（指示跳过 Agent 侧截图直接归档）。
- **一致项**：标题行（蓝竖条 4×16 + 20/600 `#333`）、排名视角行（16/400 标签 + 胶囊 h30 r4 padH20 gap10 双态配色逐 token）、图表卡（`#E5E6EB` r8 pad20）、Y 轴 12px `#777` 虚线网格、柱宽 50 全蓝 `#027AFF`、X 轴 12px `#777`、tooltip 三行结构、页面分组（根 gap 10、模块独立白卡、新行左卡右留白）。
- **偏差清单**：
  1. 稿内 3 个科目胶囊均为选中态——稿误，运行时单选仅一个（需求为准）。
  2. 稿内柱高非单调（4/5 班乱序）——按需求分数降序 + 同分班级序号升序实现。
  3. 组件根 gap 12、图表卡由页面 `__chart-card`（pad 30/20）+ 组件内 `__chart-card`（pad 20）构成——组件骨架与兄弟组件保持一致，卡 padding 按稿 20。
  4. dataZoom 滑块稿未画（需求补充），用 ECharts 默认皮肤。
  5. 页面根容器保留 padding 20 页边距（稿根齐边，同备课页处理）。
- **结论**：可交付。

## 验证记录

- `vue-tsc` 0 error；`pnpm build:data-board:develop` 构建成功。
- `eslint --fix` + 复检 0、`stylelint --fix` + 复检 0、`ls-lint` 全过。
- 审查修复 2 处后复检全绿（见「代码审查记录」）。
- 浏览器目测：用户手动验证（2026-10-16「直接归档」）。

## 待办与后续接入

- **替换点 #10 / #11**：函数签名不变，映射写在 `api/overview.ts`；科目单选、排序、一位小数口径的前后端分工见 README「接口对接指引」
- 新行右半边：同事组件到位后在 `grade-overview__chart-row` 追加第二个 `__chart-card` 即可
- 两个占位（等级分布 / 热力图）仍待同事组件（全局 `TODO(1.7.1-临时占位)` 3 处）
- 组件无 props（数据走 api 单点，同前两组件约定）

## Harness 闭环

- [x] 模块目录四层齐全（requirements / specs / plans / archive）
- [x] requirements / spec / plan 链接正确（头部互指）
- [x] 改 src/ 前 P1（3 点确认）/ P2（spec OK）/ P3（Inline）暂停点均获用户确认（2026-10-16）
- [x] Skill 路由命中并遵循：**echarts**（Task 3 · 0.90 共享注册单点；Task 6 · 0.85 自动激活：confine / escapeHtml / dataZoom / lifecycle）
- [x] spec 验收项已勾选（10/10）
- [x] 一致性自检 4/4 通过并写入本 archive
- [x] 还原度自检已完成（适用；节点 9913:48341，偏差 5 项记录）
- [x] archive 交付快照已写；组件使用文档 `README.md` 已交付
- [x] 代码审查 + 格式校验完成（eslint/stylelint/ls-lint/vue-tsc/build 全绿，修复 2 处逻辑问题）
- [x] `pnpm harness:status` / `harness:check` 机械门禁不可用（frontend-local 无脚本），Agent 层手动等价执行（NO_MODULE → … → READY_TO_DEV → DELIVERED）
- [x] **未 commit、未 push**（用户规则，改动全在工作区）

## 交付后修订记录

- 2026-10-16（用户反馈）：**空数据展示改为直接渲染空图表**——chart-card 改为 eady 后始终渲染（空 classes 时保留坐标轴、无柱、无滑块），移除「暂无数据」空态块、Promotion 图标导入、emptyText 常量与 __empty* 样式；hasClasses 计算属性删除，chartOption 不再提前返回空对象。requirements / spec §3.9 / spec 验收 #8 / README 已同步修订。复检：eslint 0 错、stylelint 0 错、ue-tsc 0 error、构建成功。- 2026-10-16（用户反馈）：**空图表坐标轴必须可见**——空数据时 X 轴给占位单类目 ['']（类目轴无类目不画轴线）、Y 轴固定  ~100 步长 20（空数据 min 回调取不到有限值导致轴不渲染）。spec §3.9 已同步；复检 eslint / vue-tsc / build 全绿。