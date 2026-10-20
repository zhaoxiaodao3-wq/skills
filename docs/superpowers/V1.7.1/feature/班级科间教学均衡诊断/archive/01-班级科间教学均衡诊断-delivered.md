# 班级科间教学均衡诊断 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-16
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `apps-development-platform`（分支 `dev/lianglinbin`）· **按用户规则未 commit，改动全部在工作区**

## 改动摘要

交付年级长概览「班级科间教学均衡诊断」组件（`src/components/class-balance-diagnosis/`，5 文件 + README），补齐 `grade-overview__chart-row` 右列（此前留白位）：横向条形图按三档着色（红 `#FF2A2A` / 橙 `#FF6F00` / 绿 `#00B42A`，`level` 接口给）、极差降序同分按班级序号、条右端「最低科」标注、失衡线 markLine 取接口 `thresholds.warn`（**阈值对接通道**：文案/tooltip/线全插值，mock 写死 5/8）、**三态区分 hover tooltip**（边框与状态判定值按等级着色、固定文案 + 接口值分工）、**⚠ 全班性偏低行**（`lowSubjectCount >= 3` 显示、N 取实际计数）、动态高度、空图表口径、`requestSeq` 防竞态。mock 替换点 **#12**；`plugins/echarts.ts` **零改动**。

README 按用户要求含**组件说明**（用法/图表规则/三态 tooltip/固定文案 vs 接口值分工表）与**对接说明**（#12 入出参字段表、`thresholds` 通道、`level` 后端分档、精度与排序口径清单）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/components/class-balance-diagnosis/{class-balance-diagnosis.vue, .model.ts, .data.ts, .scss, README.md}` |
| 改 | `src/constants/overview.ts`（`BalanceLevel` / `BalanceDiagnosisItem` / `BalanceThresholds` / `BalanceDiagnosisData` 等） |
| 改 | `src/api/overview.ts`（`getBalanceDiagnosisApi`，替换点 #12） |
| 改 | `src/views/grade-overview/grade-overview.vue`（右列补 `__chart-card` + import，页面样式零改动） |
| 增 | 文档：`V1.7.1/feature/班级科间教学均衡诊断/{requirements,specs,plans}`（含渲染图 `requirements/assets/figma-balance-diagnosis@3x.png`） |

## 验收结果

- [x] spec §6 验收项 1~10 全部勾选（10/10）；自动化项（vue-tsc / eslint / stylelint / build / mock 分支与标记）由 Agent 验证，浏览器目测项由用户手动验证后指示归档（2026-10-16）。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `classes: []` → **空图表**（Y 轴占位单类目保轴线、X 轴 0~max、无柱、无空态块），沿用本版本已确认口径；数据未到不渲染（`v-if ready`）；无 mock 空分支时回退默认数据 |
| 常量 / mock / 真数据 | 通过 | 组件只消费 `api/overview.ts` 的 #12；三色/状态句/建议句/说明模板/label 单点于 `.data.ts`；文案与值分工明确（固定 vs 接口）；`thresholds` 全链路插值（说明/tooltip/markLine 同源），mock 写死即占位；`TODO(1.7.1-接口替换): [#12]` 标记就位 |
| 多入口 | 通过 | 仅 `grade-overview` 右列接入；页面 scss 与其它模块零改动；已交付组件零改动；`plugins/echarts.ts` 零新增注册；与左侧科目单选不联动（设计意图，spec §3.8） |
| 失败 / 缺省 | 通过 | `thresholds` 缺省兜底 `{5,8}`；数值化失败 `truncateOneDecimal` 原样返回；`lowSubjectCount < 3` 不渲染 ⚠ 行（mock 含 2 与 8 两组）；`requestSeq` 防竞态（首屏 + 三筛选切换）；非法筛选回退默认 mock |

## 还原度自检

**适用**（feature 含 Figma：node **9913:48438**；hover 三态以**用户原型截图**为权威，对话附件未落盘）。

- **对照方式**：Figma REST API `/v1/files/.../nodes` 精确提取 token → 落盘 spec §5 样式对照表 → 实现；渲染图归档 `requirements/assets/figma-balance-diagnosis@3x.png`；tooltip 三态对照用户截图逐行实现，视觉目测由用户手动完成。
- **一致项**：标题行（蓝竖条 4×16 + 20/600 `#333`）、说明长文 16/400 `#555`（逐字按稿、阈值插值）、图表卡边框 `#E5E6EB` r8 pad20、Y 轴班级名 16px `#777`、X 轴 12px `#AAAAAA` + 网格 `#F2F3F5`、条高 16、条右「最低科 xx ±x」14px `#777`、失衡线 `#FF2A2A`@0.5 dash4,4 + 底部 label、tooltip 行结构（label 14/400 `#555`、值 14/600 `#333`、pad15 r8）。
- **偏差清单**：
  1. 稿内 6 条同为橙色 `#FF6F00`（占位）——实现按 `level` 三色（用户指定色板），色板本身即稿内橙 + 需求红绿。
  2. 稿内 tooltip 状态判定值 `#333`、无边框色——按**用户截图**改为三态着色（边框 + 状态值），记入 spec §5。
  3. 稿内仅画失衡线 5 单线——按稿实现（红线只在 tooltip 文案），阈值改由 `thresholds` 字段渲染。
  4. 组件骨架根 gap 12、说明与卡间距按兄弟组件节奏（稿根 gap 20/pad30-20 由页面 `__chart-card` 承担）。
  5. X 轴上限动态对齐 10 倍数（稿固定 0~40）。
- **结论**：可交付。

## 验证记录

- `npx vue-tsc --noEmit -p apps/data-board/tsconfig.app.json` → **0 error**
- `npx eslint --fix` + 复检 → **0 错**；`npx stylelint --fix` + 复检 → **0 错**；`ls-lint` 命名通过（同系列）
- `pnpm build:data-board:develop` → 构建成功
- 浏览器目测：用户手动验证后指示归档（2026-10-16）

## 待办与后续接入

- **替换点 #12**：`getBalanceDiagnosisApi({ campusId, semesterId, gradeId })`；后端 VO → `BalanceDiagnosisData` 映射写在 `api/overview.ts`；`level` 分档、`lowSubjectCount`、`thresholds`、1 位小数口径均由后端保证，组件零改动（详见 README「接口对接指引」）
- 后端下发 `thresholds` 后，说明文案 / tooltip / 失衡线自动跟随，前端无需改
- 两个占位（等级分布 / 热力图）仍待同事组件（全局 `TODO(1.7.1-临时占位)` 3 处）

## Harness 闭环

- [x] 模块目录四层齐全（requirements / specs / plans / archive）
- [x] requirements / spec / plan 链接正确（头部互指）
- [x] 改 src/ 前 P1（5 点逐条答复）/ P2（spec OK）/ P3（Inline）暂停点均获用户确认（2026-10-16）
- [x] Skill 路由命中并遵循：**echarts**（Task 5 · 0.85 自动激活：横向 bar/markLine/label/confine/动态高度；`plugins/echarts.ts` 零改动）
- [x] spec 验收项已勾选（10/10）
- [x] 一致性自检 4/4 通过并写入本 archive
- [x] 还原度自检已完成（适用；节点 9913:48438 + 用户截图，偏差 5 项记录）
- [x] archive 交付快照已写；README 组件说明 + 对接说明已交付
- [x] `pnpm harness:status` / `harness:check` 机械门禁不可用（frontend-local 无脚本），Agent 层手动等价执行（NO_MODULE → … → READY_TO_DEV → DELIVERED）
- [x] **未 commit、未 push**（用户规则，改动全在工作区）

## 交付后修订记录（样式优化，2026-10-16 用户反馈）

1. **失衡线文案**：由竖排/贴线改为**水平放置（otate: 0）并下移到 x 轴刻度行下方**（position: start + distance: 16 + lign: center），与设计稿一致。
2. **⚠ 警示图标**：由纯文本 ⚠ 改为**黄底徽章**（#FAAD14 圆角小方块 + 白色 ⚠，inline-block）+ 红色文案；lowOverallTemplate 去掉文本前缀 ⚠（由徽章承载）。
3. **tooltip 溢出**：容器由 max-width: 420px 改为**定宽 width: 360px + word-break: break-word + white-space: normal**，警示长文案弹窗内自动换行不溢出；⚠ 行独立成块（<div>）。
- spec §3.4/§3.5、README 同步修订；复检：eslint（代码文件）0 错、vue-tsc 0 error、构建成功。- 修订×2（2026-10-16 用户提供图标截图）：⚠ 徽章由「黄底方块+字符」改为**黄色三角警示图标**（内联 SVG：圆角三角 #FFD426 + 深色 #1A1A1A 感叹号，17×15），spec §3.5 / README 同步；eslint / vue-tsc / build 复检全绿。- 修订×3（2026-10-16）：**说明文案中的 ⚠ 同步替换为同款黄色三角警示图标**——SVG 抽为共享常量 WARN_ICON_SVG（.data.ts 单点，tooltip 与说明共用），说明文案改 -html 渲染（阈值 Number 化后插值，无注入面）；spec §3.2 / README 同步；复检 eslint / vue-tsc / build 全绿。
- 修订×4（2026-10-16）：三角图标描边 2.6 → 1，圆角收敛、**三个角更锐利**（贴合用户提供的图标截图）。- 修订×5（2026-10-16 用户反馈）：**图表视窗固定最多显示 6 行**——外层 __chart-scroll（overflow-y: auto）max-height = min(count, 6)*27+36，内容高仍为 count*27+36；≤6 行无滚动条，>6 行卡内纵向滚动。spec §3.4 / README 同步；复检 eslint / stylelint / vue-tsc / build 全绿。- 修订×6（2026-10-16 用户反馈）：滚动改为 **ECharts 自带 dataZoom**（非 CSS overflow）——图表固定 6 行视窗高度，>6 班启用 yAxisIndex: 0 纵向 dataZoom（右侧滑块 orient: vertical + inside 拖拽/滚轮，初始 end = 6/count），≤6 班无滑块；回滚外层滚动容器。plugins/echarts.ts 的 DataZoomComponent 已在「班级教学评价排名」注册，零新增。spec §3.4 / README 同步；复检 eslint / stylelint / vue-tsc / build 全绿。- 修订×7（2026-10-19 用户反馈 dataZoom 未限窗）：类目轴 + inverse: true 下百分比窗口（start/end）不可靠 → 改为**类目下标显式窗口** startValue: 0 / endValue: 5（固定前 6 行）；chartHeight 维持 6 行视窗。复检 eslint / vue-tsc / build 全绿。- 修订×8（2026-10-19 用户反馈失衡线文案不可见）：inverse: true 类目轴翻转了 markLine label 的 start/end 端点，position: 'start' + distance: 16 被推出画布裁剪 → 改为 position: 'insideEndBottom' + distance: 6 + otate: 0（锚定线底部内侧、水平、贴 x 轴、必在画布内）。复检 eslint / vue-tsc / build 全绿。- 修订×9（2026-10-19 用户反馈同排两卡高度不一致）：grade-overview__chart-row 去掉 lign-items: start（grid 默认 stretch），左右两卡视觉等高（对齐到较高者，矮卡底部留白消化差值）。两个模块 spec §4 均已同步；复检 stylelint / build 全绿。- 修订×10（2026-10-19 用户要求，且反馈「决策点须一次性列全批量确认」——已写入全局记忆规则）：**矮卡图表区弹性撑满，不留整块空白在卡底**——flex 链：页卡 __chart-card（flex column）→ 组件根 height:100% → 内部图表卡 lex:1 → 图表 height:100% + min-height 兜底（评价排名 280 / 本组件 198，dataZoom 窗口仍固定 6 行）；移除本组件图表高度的 px 内联绑定。两个模块 spec、README 同步；复检 eslint / stylelint / vue-tsc / build 全绿。