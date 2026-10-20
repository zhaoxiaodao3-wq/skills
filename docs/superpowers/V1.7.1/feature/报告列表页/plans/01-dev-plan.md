# 报告列表页 · 实施计划

> **For engineer:** 按任务顺序执行；**禁止 git commit**（用户规则）。每 Task 做完验证（vue-tsc 0 error）再往下。
> **业务上下文：** `apps-development-platform/apps/data-board`；el-table/el-pagination/el-select 经 unplugin 自动声明；筛选下拉共享样式 `styles/el-select-filter.scss`（mixin）；等级四色常量在本模块上提至 `constants/overview.ts`；本页为公共二级页（`secondaryPage: true`），不挂数据权限。

**Spec:** [../specs/01-spec-报告列表页.md](../specs/01-spec-报告列表页.md)
**Goal:** 交付 `/report-list` 公共二级页（五态标题+筛选矩阵，一比一稿 9913:50990 / 9913:51447）+ report-stat-card 公共组件 + report-list-entry 临时测试入口 + mock #19~#21 + 页面使用 README。

**执行方式：** P3 Inline（用户确认），实际按以下顺序一次完成；2026-10-20 交付后按用户验收做了修订 1（见 archive §交付后修订记录）。

---

## Task 1：常量层（模式配置 + 类型契约）

**Files:**

- Create: `apps/data-board/src/constants/report-list.ts`

要点：

- `REPORT_PAGE_MODES`：五态 → `{ filters: 筛选项集合, titleDims: 标题维度 }` 配置表（需求 §2.1 矩阵的唯一事实源）
- `resolveReportMode(query)`：判定优先级 classId+subjectId > gradeId+subjectId > stageId+subjectId > gradeId > all
- `buildReportTitle(mode, names, hasEntryParams)`：`XXXX · 课堂报告列表`；all+无参 → `报告列表`，all+参 → `全校 · …`
- 类型：`ReportRow` / `ReportListStats` / `ReportFilterOptionsData` / `ReportListFilters` / `ReportEntryQuery`
- `GRADE_COLORS` / `GRADE_BG` 上提至 `constants/overview.ts`，teacher-list.data.ts 与 class-subject-drill-dialog.data.ts 改 re-export（消除三处重复）

**验证** vue-tsc 0 error。

## Task 2：mock 接口（#19~#21）

**Files:**

- Create: `apps/data-board/src/api/report-list.ts`

要点：

- 17 条行池（第 18~34 周，日期跨月真实推算，生成时间含秒）；科目索引用显式数组 `SUBJECT_INDEXES`，保证「年级+科目」「班级+科目」组合有数据（模运算相位会死锁，已实测踩坑）
- 筛选=进入参数锁定 + 筛选值过滤；统计由过滤后行集实时算（达标=评分≥60）
- `TODO(1.7.1-接口替换): [#19]/[#20]/[#21]` 标记（#17/#18 已被教师列表占用）

**验证** vue-tsc 0 error。

## Task 3：report-stat-card 公共组件

**Files:**

- Create: `apps/data-board/src/components/report-stat-card/{report-stat-card.vue, report-stat-card.scss, README.md}`

要点：props `label`/`value` + icon 插槽（@miray/icons 组件）；`fill` 为 presentation attribute，CSS 覆盖为 #027AFF；容器 font-size 控制图标 24px。

**验证** vue-tsc 0 error。

## Task 4：页面 + 路由

**Files:**

- Create: `apps/data-board/src/views/report-list/{report-list.vue, report-list.scss}`
- Modify: `apps/data-board/src/router/index.ts`（`/report-list`，`secondaryPage: true`，不挂 dataPermission）

要点：

- 结构：面包屑返回+标题 → 白卡（统计卡 ×4 → 蓝条区块标题 → 筛选区 → 12 列表格 → 居中分页）→ 教师详情弹窗挂载
- 筛选：draft/applied 两份状态，查询/回车生效、重置清空、下拉不即时触发；`visibleFields` 由模式配置驱动（v-for + `SELECT_MODEL` 映射）
- 表格：CSS 变量挂根元素（同元素坑）；教师 el-link、等级四色 chip、操作 `openReport` 预留 `TODO(1.7.1-报告查看对接)`
- 数据：`Promise.all` 拉统计+列表，`optionsSeq`/`dataSeq` 防竞态；`watch(entryQuery)` 同页变参重载
- 分页：el-pagination 二次定制（居中、32 方块 r2、当前页 #027AFF），沿 teacher-list 手法

**验证** vue-tsc 0 error + eslint 0。

## Task 5：临时测试入口 + 页面挂载

**Files:**

- Create: `apps/data-board/src/components/report-list-entry/{report-list-entry.vue, report-list-entry.scss}`（`TODO(1.7.1-临时预览)`）
- Modify: `principal-cockpit-2` / `grade-overview` / `plan-lessons` / `subject-overview-2` 四页（挂载 + import）

要点：透传当前 URL 已携带的维度参数跳转（不做权限过滤——mock 权限为 campus 时按权限取字段会丢 gradeId，已实测修正）；追加 `from: route.path` 保持来源菜单高亮（复用 app-navigation 的 `query.from` 约定）。

**验证** vue-tsc 0 error + eslint 0。

## Task 6：端到端实测 + 文档 + 归档

1. 浏览器五态（默认/全校/年级+科目/班级+科目/学段+科目/年级）标题+筛选矩阵+数据逐项验证；交互（分页/姓名/等级/重置/教师弹窗）验证；截图与稿比对
2. `pnpm build:data-board:develop` 成功
3. 文档：`views/report-list/README.md`（接入方使用文档）+ report-stat-card README + 需求/spec 回写（编号修正 #19~#21）
4. 自检（A 一致性 + B 还原度）→ archive → 闭环清单

## 交付后修订 1（2026-10-20，用户验收 4 点）

1. 返回图标改用 `@/assets/icons/arrow-left.svg`（与教师列表同资源）
2. 入口跳转追加 `from` 参数（来源菜单保持高亮）
3. 操作列 80 → 120（「查看」不再截断）
4. cell 双 padding 收敛：td/th 仅垂直 `8px 0`，水平 20px 统一放 `.cell`（EP td 与 .cell padding 天然叠加的坑）
