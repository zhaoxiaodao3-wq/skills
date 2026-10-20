# 等级数量明细 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-19
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `apps-development-platform`（分支 `dev/lianglinbin`）· **按用户规则未 commit，改动全部在工作区**

## 改动摘要

交付四页公共「等级数量明细」模块：每页页尾新增整卡模块 `__module`（白 r8 / pad 30,20），上半为同事「整体趋势与等级明细」区的**两张 Figma 渲染图截图占位**（gap 20 拼接），下半为通用表格组件 **`level-detail-table`**（6 文件 + README）——列与筛选字段按 `permission` 走 `LEVEL_DETAIL_PAGE_CONFIGS` 可配置（校长 13 列 / 年级长、学科、备课 12 列，首列表头「周期」）、el-select 共享样式筛选（默认「全部」哨兵 `all`）、el-table 二定制（表头 `#F3F9FF` h42、行 42、Δ 列按设计稿着色、表头 Δ 三角为 SVG 空心三角）、el-pagination **水平居中**按稿定制（30×30 r4、激活蓝底白字）、服务端分页 10 条/页、`periodType` 入参通道（默认周）、`requestSeq` 防竞态。同时将 `subject-overview-2` / `principal-cockpit-2` **模块卡片化**（与 grade/plan 同构）。mock 替换点 **#13 选项 / #14 分页数据**。

组件使用与对接文档：`src/components/level-detail-table/README.md`（props/各页配置表/着色规则/分页/**占位删除清单**/#13#14 对接口径）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/components/level-detail-table/{level-detail-table.vue, .model.ts, .data.ts, .scss, README.md}` |
| 改 | `src/constants/overview.ts`（`LevelDetail*` 类型 + `LEVEL_DETAIL_PAGE_CONFIGS`） |
| 改 | `src/api/overview.ts`（`getLevelDetailFilterOptionsApi` #13 + `getLevelDetailPageApi` #14） |
| 增 | `src/assets/placeholders/ph-trend-module-header@2x.png`、`ph-trend-section@2x.png`（自 requirements/assets 复制） |
| 改 | `src/views/{grade-overview, plan-lessons, subject-overview-2, principal-cockpit-2}` 的 `.vue` + `.scss`（页尾 `__module` 接入；subject/principal 同步卡片化重构） |
| 增 | 文档：`V1.7.1/feature/等级数量明细/{requirements,specs,plans}`（含占位渲染图与 Figma 提取） |

> 注：grade 页 `weak-link-table` 模块与 api 中 Drill 系列 mock 为**并行会话**改动，本需求未触碰（`weak-link` 模块之后追加 `__module`）。

## 验收结果

- [x] spec §6 验收项 1~10 全部勾选（10/10）；自动化项（vue-tsc / eslint / stylelint / ls-lint / build / mock 与标记）由 Agent 验证，浏览器目测由用户手动验证后指示归档（2026-10-19）。

## 实现期修订记录（均已先改文档再改代码）

1. **P1 决策批量确认**（12 点）：表头稿误（教师→周期）、`periodType` 默认周留入参、页尾追加、占位两图拼四页共用、**四页表头按用户四张截图可配置**、subject/principal 同步卡片化、10 条/页、Δ 字符串后端原样、周期升序、el-table 内置空态、**#11 着色按 Figma 稿**（+绿/-红/0 灰，原型反向着色不采用）、**#12 首列表头「周期」**。
2. **修订×2**（用户反馈）：① 分页器改**水平居中** + 按稿定制（30×30 r4、激活 `#027AFF` 白字、14px `#333`）；② Δ 表头 △ 字符 → **内联 SVG 空心三角**（12×10 描边 2，更大加粗），label 常量去 △、header 插槽渲染。
3. **修订×3**（用户反馈）：「全部」选项 `id=''` 导致 el-select 显示「请选择」→ 改**哨兵 id `'all'`**（默认选中、显示「全部」，请求时 `pick()` 过滤不传该维度）。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `list` 为空 → el-table 内置空态「暂无数据」（`COMPONENT_TEXTS.emptyText` 单点）；选项未到不渲染筛选行（`v-if options`）；数据未到 `is-refreshing` 透明度不闪 |
| 常量 / mock / 真数据 | 通过 | 组件只消费 `api/overview.ts` 的 #13/#14；列/筛选配置单点 `LEVEL_DETAIL_PAGE_CONFIGS`；表头/label/着色规则单点 `level-detail-table.data.ts`；两处 mock 带 `TODO(1.7.1-接口替换)` 标记，对接组件零改动 |
| 多入口 | 通过 | 四页同一组件同一配置体系，仅 `permission` prop 不同；卡片化仅 subject/principal（grade/plan 结构复用既有 `__card`）；已交付组件零改动；并行会话的 weak-link/Drill 改动无交叉 |
| 失败 / 缺省 | 通过 | 筛选值 `'all'`/空 → 该维度不传（mock 回退全量）；`row[field]` 缺省渲染 `-`；Δ 四态着色兜底灰；`periodType` 切换重置选项/筛选/页码；`requestSeq` 覆盖筛选/切页/顶部三键/周期切换四条链路 |

## 还原度自检

**适用**（feature 含 Figma：node `9913:48657` 的 48875 明细区；表头列配置以**用户四张原型截图**为权威）。

- **对照方式**：Figma REST API 节点提取（模块卡 pad 30,20 / section 标题 16/600 / 筛选 200×30 `#F2F3F5` / 表头 `#F3F9FF` h42 16/600 / 行 16/400 `#555` / Δ 三色 / 分页 h32）→ 落盘 spec §5 → 实现；占位为官方渲染图；视觉目测由用户手动完成。
- **一致项**：模块卡与占位拼接、标题+筛选同排、表头与行规格、Δ 着色（+绿 `-`红 0/`-` 灰）、待改进/合计常规字重、列宽（周期/日期范围 150、其余 100）、首列表头「周期」。
- **偏差清单**：
  1. 列布局用 el-table 满宽均分（稿为固定 100/150 + 列距 28）——视觉近似，长列自适应更稳。
  2. Δ 表头三角：稿为字符级 △，实现为 SVG 空心三角（**用户要求更大加粗**，修订×2）。
  3. 分页：稿内容水平居中（原右对齐已按用户反馈修正）；跳转区/页码采用 EP 结构 + 30×30 r4 定制近似稿。
  4. 行底边 `#F2F3F5` 沿用 group-focus 先例（稿内未见描边，通用表格可读性补充）。
  5. 行数据/表头差异按用户四截图（稿单版）；原型截图中的反向 Δ 着色、待改进恒红、合计加粗**按 #11 决定不采用**。
- **结论**：可交付。

## 验证记录

- `npx vue-tsc --noEmit -p apps/data-board/tsconfig.app.json` → **0 error**
- `npx eslint --fix` + 复检 → **0 错**；`npx stylelint --fix` + 复检 → **0 错**；`node ./lints/ls-lint/index.js` → 全过
- `pnpm build:data-board:develop` → 构建成功
- 浏览器目测：用户手动验证（四页接入 / 列与筛选差异 / 分页与着色 / 三轮修订反馈「OK，归档」）

## 待办与后续接入

- **替换点 #13 / #14**：函数签名不变，映射写在 `api/overview.ts`；口径见 README「接口对接指引」（periodType 周月、权限维度裁剪、服务端分页、周期升序、Δ 字符串、合计后端）
- **占位删除**：同事组件接入时按 README「占位删除清单」执行（删 `__placeholder-trend` 两 img + 两 png 资源）；其按周/按月真实状态接入后给组件传 `period-type`
- 非 preview 页面（`/subject-overview`、`/principal-cockpit` 正式版）落地时，本模块随 `subject-overview-2` / `principal-cockpit-2` 结构迁移

## Harness 闭环

- [x] 模块目录四层齐全（requirements / specs / plans / archive）
- [x] requirements / spec / plan 链接正确（头部互指）
- [x] 改 src/ 前 P1（12 点批量确认）/ P2（spec OK）/ P3（Inline）暂停点均获用户确认（2026-10-19）
- [x] Skill 路由：`echarts` 0.70 经人工复核**否决**（本模块无图表，关键词误报）；`riskLevel` 低；表格实现遵循 group-focus 先例
- [x] spec 验收项已勾选（10/10）
- [x] 一致性自检 4/4 通过并写入本 archive
- [x] 还原度自检已完成（适用；Figma 9913:48657 + 用户四截图，偏差 5 项记录）
- [x] archive 交付快照已写；组件 README（组件说明 + 对接说明 + 占位删除清单）已交付并同步三轮修订
- [x] `pnpm harness:status` / `harness:check` 机械门禁不可用（frontend-local 无脚本），Agent 层手动等价执行（NO_MODULE → … → READY_TO_DEV → DELIVERED）
- [x] **未 commit、未 push**（用户规则，改动全在工作区）
- 修订×4（2026-10-19 用户反馈）：分页器**「前往 X 页」移到右侧**（`layout="total, prev, pager, next, jumper"`，原 jumper 在左作废）；**未选中页码补底色 #F2F3F5**，并按稿精修 token：页码/按钮 32×32 **r2**（原 30×30 r4 作废）、前后箭头透明底图标 #777、跳转输入 40 宽底 #F2F3F5 r2、整体保持水平居中。spec §3.5 / README 同步；复检 eslint / stylelint / vue-tsc / build 全绿。- 修订×5（2026-10-19 用户反馈）：页码之间加 **8px 间隙**（`.el-pager li + li margin-left:8px`，稿 32 按钮/40 节距）；复检 stylelint / build 全绿。
