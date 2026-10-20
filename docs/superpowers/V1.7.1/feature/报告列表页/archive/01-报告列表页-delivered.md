# 归档：报告列表页（公共二级页）

- 状态：**DELIVERED**（2026-10-20）
- Requirement: [01-需求-报告列表页.md](../requirements/01-需求-报告列表页.md)
- Spec: [01-spec-报告列表页.md](../specs/01-spec-报告列表页.md)
- Plan: [01-dev-plan.md](../plans/01-dev-plan.md)
- 需求截图：[archive/需求截图/](.)（图一规则 / 图二标题样例 / 图三图四筛选规则）

## 交付范围

| 文件 | 说明 |
|---|---|
| `apps/data-board/src/constants/report-list.ts` | 新增：模式判定 `resolveReportMode`、模式配置 `REPORT_PAGE_MODES`（筛选矩阵+标题维度）、`buildReportTitle`、类型契约、`REPORT_LIST_PAGE_SIZE` |
| `apps/data-board/src/api/report-list.ts` | 新增：mock 接口 #19 筛选项 / #20 统计 / #21 分页（17 条行池、周次 18~34 日期跨月真实推算、防竞态在页面层） |
| `apps/data-board/src/components/report-stat-card/` | 新增公共组件（vue + scss + README）：四联统计卡同构卡片 |
| `apps/data-board/src/components/report-list-entry/` | **新增临时测试入口组件**（vue + scss，`TODO(1.7.1-临时预览)`）：右下角悬浮按钮，透传当前 URL 的维度参数跳转报告列表页 |
| `apps/data-board/src/views/principal-cockpit-2/grade-overview/plan-lessons/subject-overview-2`（4 个 .vue） | 各挂载一处 `<report-list-entry />`（带 TODO 注释，正式入口接入后随组件一起删除） |
| `apps/data-board/src/views/report-list/report-list.vue` | 新增页面：面包屑返回 + 标题、统计卡、蓝条区块标题、按模式裁剪的筛选区（draft/applied，查询/回车/重置）、12 列表格、居中分页、教师详情弹窗挂载 |
| `apps/data-board/src/views/report-list/report-list.scss` | 页面样式（一比一稿 9913:50990 / 9913:51447） |
| `apps/data-board/src/router/index.ts` | 新增 `/report-list` 路由（`secondaryPage: true`，不挂数据权限） |
| `apps/data-board/src/constants/overview.ts` | GRADE_COLORS / GRADE_BG 四色等级常量上提至此（新增段） |
| `apps/data-board/src/views/teacher-list/teacher-list.data.ts`、`src/components/class-subject-drill-dialog/class-subject-drill-dialog.data.ts` | 原重复色值定义改为 `export { ... } from '@/constants/overview'` re-export，两处调用方零改动 |

## 五态实测结果（浏览器逐一验证，2026-10-20）

| 态 | URL 参数 | 面包屑标题 | 筛选项 | 数据 |
|---|---|---|---|---|
| 默认 | 无 | 报告列表 | 姓名+年级+班级+科目+周次+报告类别+等级（7） | 共 17 条 |
| 1.1 校区+学期 | campusId, semesterId | 全校 · 课堂报告列表 | 同上（7） | 共 17 条 |
| 1.2 年级+科目 | +gradeId, subjectId | 三年级 · 物理 · 课堂报告列表 | 姓名+班级+周次+报告类别+等级（5） | 共 1 条 |
| 1.3 班级+科目 | +gradeId, classId, subjectId | 三年级 · 物理 · 3班 · 课堂报告列表 | 姓名+周次+报告类别+等级（4） | 共 1 条 |
| 1.4 学段+科目 | +stageId, subjectId | 初中 · 物理 · 课堂报告列表 | 姓名+年级+班级+周次+报告类别+等级（6） | 共 2 条 |
| 1.5 年级 | +gradeId | 二年级 · 课堂报告列表 | 姓名+班级+科目+周次+报告类别+等级（6） | 共 6 条 |

（mock 池 grade/subject 标签沿用平台 id 体系「一年级/物理」，故标题显示与需求示例「初三·物理」不同——属 mock 内容差异，非 UI 差异。）

交互实测：切第 2 页 7 条 ✓；姓名「徐」→ 3 条 ✓；重置还原 17 条 ✓；等级「优秀」+查询 → 7 条 ✓；上课教师点击打开教师详情弹窗（壳）✓；下拉选中不即时触发、点查询生效 ✓；姓名回车触发（模板绑定，未单独实测）。

**测试入口实测（2026-10-20）**：grade-overview（URL 带 gradeId）点入口 → 年级态「一年级 · 课堂报告列表」6 条 ✓；subject-overview-2（带 stageId+subjectId）点入口 → 学段+科目态「初中 · 语文 · 课堂报告列表」2 条 ✓（科目为页面自身同步后的当前选中值，透传行为正确）。

## 接口替换点

- `TODO(1.7.1-接口替换): [#19]` `getReportFilterOptionsApi(ctx)` — 筛选项集（后端按进入参数裁剪，如学段态年级只返回段内）
- `TODO(1.7.1-接口替换): [#20]` `getReportListStatsApi(ctx, filters)` — 统计卡（mock 口径：达标=评分≥60；等级阈值 ≥88 优秀 / ≥84 良好 / ≥78 合格，以後端为准）
- `TODO(1.7.1-接口替换): [#21]` `getReportListApi(ctx, filters, page, pageSize)` — 分页列表（周次升序由后端保证）
- `TODO(1.7.1-报告查看对接)` `openReport()` — 「查看」预留方法，当前空实现不跳转
- mock 排布注意：科目索引为显式数组 `SUBJECT_INDEXES`，保证「年级+科目」「班级+科目」组合有数据；后端接入后此文件整体可删

## 一致性自检（A）

1. **需求→spec 追溯**：图一 5 种参数组合 → spec §2 模式判定+§3 标题规则+§4 筛选矩阵，全部落地且浏览器实测通过（见上表）；用户澄清的 7 条决策（1.5=年级、筛选矩阵、标题样例、无参默认、查询触发、查看预留+教师弹窗、路由不挂权限）逐条对齐 ✓
2. **spec→实现追溯**：§5 页面结构五区块 / §6 表格 12 列规格 / §7 分页规格 / §8 数据契约 / §9 文件拆分 —— 实现与 spec 一致；spec 中 P2 阶段的接口编号 #17~#19 已修正为 #19~#21（#17/#18 在 spec 编写时已被教师列表模块占用，P3 发现后顺延并回写 spec/需求文档）✓
3. **改动面**：仅上述 8 项，未触碰其他模块逻辑；GRADE 色值上提为等价替换（值相同）✓
4. **回归**：`npx vue-tsc --noEmit -p apps/data-board/tsconfig.app.json` → **0 error**；新增/改动文件 eslint → **0 error 0 warning**；`pnpm build:data-board:develop` → 构建成功 ✓

**附带修复（P3 发现的既有问题，非本模块引入）**：工作区遗留的 `api/overview.ts` 从 `@/constants/overview` 导入 `TeacherListPageData/TeacherListRow`（实际定义在 `views/teacher-list/teacher-list.model.ts`，从未编译通过）→ 改为从 model 直接导入；`teacher-list.vue` 两处 el-table slot 传整行对象给强类型函数 → 补 `as TeacherListRow` 断言（与 weak-link/teacher-warning-list 既有写法一致）。修复前该工作区 vue-tsc 存在 4 个既有 error。

## 还原度自检（B）

对照 Figma 9913:50990 / 9913:51447（截图比对 + 数值提取）：

1. 面包屑（← 返回 #777 16/400 + 标题 16/600 #333）、白卡 r8、统计卡 402×87 #F3F9FF r8 + 白圆 icon + 12px/18px 文字层级 ✓
2. 蓝条 3×12 #027AFF + 区块标题 16/600 ✓；筛选 label 14 #333 + 控件 200×30 #F2F3F5 r4 + 重置/查询 68×30（灰底/蓝底白字 14/600，白色搜索 icon）✓
3. 表格：表头 #F3F9FF 16/600 #333 h42、行 16/400 #555 h42、上课教师/查看 #027AFF 16/600、等级 chip 64×22 r2 四色 ✓；分页居中、页码 32×32 r2、当前页 #027AFF 白字、跳页灰底 ✓

**已知偏差（5 项，均已记录）**：

1. mock 内容用平台统一 id 体系（一年级/1班/语文/徐芳），非设计稿示例文案（初三/6班/徐芳重叠纯属巧合）——mock 数据不属于 UI 还原范畴
2. 表头「日期范围」设计稿为 14/600，其余列 16/600（设计噪音），按 spec 归一为 16/600
3. 分页「前往」输入框为 el-pagination jumper 原生结构（宽约 40~48px），与稿 40×32 基本一致但非逐像素
4. 表格未做固定表头（稿为静态 963px 卡内滚动不明确），数据超 10 行由页面自然滚动，分页每页 10 条
5. 学段+科目态标题按统一格式 `初中 · 物理 · 课堂报告列表`（用户原话「初中 · 物理 课堂报告列表」物理后为空格，P2 遗留确认项，用户未提出异议）

## 交付后修订记录

### 修订 1（2026-10-20，用户验收反馈 4 点）

1. **返回图标与教师列表一致**：el-icon ArrowLeft → 复用同一 svg 资源 `@/assets/icons/arrow-left.svg`（img 16×12，样式对齐 teacher-list）
2. **来源菜单保持高亮**：测试入口组件跳转时追加 `from: route.path`，复用 app-navigation 既有的二级页 `query.from` 约定（同教师列表）；实测 grade-overview 进入后左侧「年级长概览」保持选中
3. **操作列加宽**：80 → 120，「查看」不再截断（实测 offsetWidth 120、无溢出）
4. **cell 双 padding 收敛**：本页表格非公共组件（页面内 el-table 二次定制，同 teacher-list/weak-link-table 模式）；EP 的 td padding 与 `.cell` padding 天然叠加（之前 td 0 20px + .cell 默认 0 12px = 32px），已改为 td/th 仅 `8px 0` 垂直、水平 20px 统一收敛到 `.cell`（实测 td=8px 0、cell=0 20px）。注：teacher-list / weak-link-table 存在同款叠加（20+12=32px），未动，如需统一另行处理

修订后 vue-tsc / eslint 复验 0 error，浏览器截图比对通过。

## Harness 闭环

- [x] 模块目录四层齐全（requirements / specs / plans / archive）
- [x] P1（方案+7 项开放问题）获用户逐条确认（2026-10-19）；P2（spec）获「确认」（2026-10-19）；P3 Inline 执行（2026-10-19~20）
- [x] spec 验收项已全部验证（含浏览器实测 + 截图比对）
- [x] 一致性自检（§A，4/4 通过）与还原度自检（§B，偏差 5 项记录）已完成
- [x] 组件文档：report-stat-card/README.md 已交付
- [x] `pnpm harness:status` 机械门禁不可用（frontend-local 无脚本），阶段由 Agent 层手动等价执行（NO_MODULE → P1 → P2 → P3 → DELIVERED）
- [x] **未 commit、未 push**（用户规则，全部改动留在工作区；注意：工作区存在先前会话遗留的已暂存改动，与本次改动混在一起，用户提交时自行甄别）

## 遗留与后续接入

- 报告查看（openReport）待对接方案（外部链接 / 弹窗 / 路由页未定）
- 教师详情弹窗内容为预留壳（同事负责，替换点见教师详情模块）
- 入口页面接入：任何一级页 `router.push({ path: '/report-list', query: { campusId, semesterId, gradeId?, subjectId?, classId?, stageId? } })` 即可；模式判定与标题/筛选裁剪全由本页配置驱动，入口无需感知
- **接入方使用文档**：`apps/data-board/src/views/report-list/README.md`（参数表、模式判定、标题规则、筛选矩阵、接口替换点、mock 验证 URL）
- **删除清单（临时预览）**：正式入口接入后删除 ① `src/components/report-list-entry/` 整目录 ② 4 个页面（principal-cockpit-2 / grade-overview / plan-lessons / subject-overview-2）中的 `<report-list-entry />` 挂载与 import（均带 `TODO(1.7.1-临时预览)` 注释可全局搜索）
- 本地手动验证路径：`http://localhost:8102/data-board-app/report-list`（五态 URL 见上表与 README 第六节）
