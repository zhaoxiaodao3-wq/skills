# Spec：报告列表页（公共二级页）

- Requirement: [01-需求-报告列表页.md](../requirements/01-需求-报告列表页.md)
- 版本：V1.7.1 ｜ 状态：P2 待确认
- 日期：2026-10-19
- 设计稿：Figma 9913:50990（全校态）/ 9913:51447（年级+科目态），一比一还原内容区（不含左侧菜单/顶栏应用外壳）

## 1. 路由与入口

- 路由 `/report-list`，name `report-list`，与 /grade-overview 平级的二级页面
- **不挂数据权限 guard**（权限由入口页保证，本页对所有带参/无参进入直接渲染）
- 从任何一级页面跳入，query 携带进入参数（见 §2）；点面包屑「返回」= `router.back()`

## 2. 参数契约与模式判定

进入参数（query，全部 string）：

| key | 含义 | 说明 |
|---|---|---|
| campusId | 校区 | 隐含必有（1.1~1.5 均隐含），但**不参与模式判定** |
| semesterId | 学期 | 同上 |
| gradeId | 年级 | 单独出现 → 模式 1.5；与 subjectId 同现 → 1.2；与 classId+subjectId 同现 → 1.3（班级必属于某年级，class 态需 gradeId 补标题） |
| subjectId | 科目 | 与 gradeId/classId/stageId 组合 |
| classId | 班级 | 与 subjectId 同现 → 1.3 |
| stageId | 学段 | 与 subjectId 同现 → 1.4 |

**模式判定优先级**（REPORT_PAGE_MODES 配置驱动，`src/constants/report-list.ts`）：

```
classId && subjectId        → class-subject   (1.3)
gradeId && subjectId        → grade-subject   (1.2)
stageId && subjectId        → stage-subject   (1.4)
gradeId                     → grade           (1.5)
其余（仅 campus/semester/无）→ all             (1.1/默认，无参默认态与其同构)
```

- 模式只影响**面包屑标题**与**筛选项集合**；表格 12 列、统计卡 4 张、区块标题「课堂报告列表」固定
- URL 筛选值**不同步**（1.7.1 决策；后续如需分享再加，届时筛选键与进入键命名空间隔离）

## 3. 标题规则（面包屑行）

格式：`XXXX · 课堂报告列表`，分隔符统一 ` · `（前后各一空格 + 间隔号）。
例外说明：学段+科目态用户原话无第二个 `·`，按统一格式处理（遗留确认项，见需求 §4.1）。

| 模式 | 面包屑标题 |
|---|---|
| all（校区+学期） | `全校 · 课堂报告列表` |
| all（无参数默认） | `报告列表` |
| grade-subject | `{年级名} · {科目名} · 课堂报告列表`（如 `初三 · 物理 · 课堂报告列表`） |
| class-subject | `{年级名} · {科目名} · {班级名} · 课堂报告列表`（如 `初三 · 物理 · 3班 · 课堂报告列表`） |
| stage-subject | `{学段名} · {科目名} · 课堂报告列表`（如 `初中 · 物理 · 课堂报告列表`） |
| grade | `{年级名} · 课堂报告列表`（如 `初三 · 课堂报告列表`） |

- 标题所需的名称（年级/科目/班级/学段名）由 filter-options 接口根据 id 反查（mock 内建 id→name 映射），后端接入后若提供名称冗余可直接用
- 蓝条区块标题恒为「课堂报告列表」，不随模式变

## 4. 筛选项矩阵

label 与控件（全部 200×30 #F2F3F5 r4；label 14px #333；下拉箭头 #777）：

| 筛选项 | 控件 | all | grade-subject | class-subject | stage-subject | grade |
|---|---|---|---|---|---|---|
| 姓名（规则中称教师名称，label 按设计稿「姓名」） | el-input，placeholder「输入姓名关键词」 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 年级 | el-select「全部」 | ✓ | ✗ | ✗ | ✓ | ✗ |
| 班级 | el-select「全部」 | ✓ | ✓ | ✗ | ✓ | ✓ |
| 科目 | el-select「全部」 | ✓ | ✗ | ✗ | ✗ | ✓ |
| 周次 | el-select「全部」 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 报告类别 | el-select「全部」 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 等级 | el-select「全部」 | ✓ | ✓ | ✓ | ✓ | ✓ |

- 排列顺序固定：姓名、年级、班级、科目、周次、报告类别、等级，flex wrap，横向/纵向 gap 20px；不够一行自动换行（年级+科目态 5 项 + 按钮一行放下，与 51447 稿一致）
- 按钮：重置（68×30 #F2F3F5 r4，字 14/400 #555，带白色搜索 icon）、查询（68×30 #027AFF r4，字 14/600 #FFF，带白色搜索 icon），跟在筛选器后
- 触发：点「查询」生效；姓名框回车 = 查询；「重置」清空全部筛选（含姓名）并重新查询；下拉选中**不**立即触发（统一查询触发）
- 筛选值不写 URL

## 5. 页面结构（自上而下）

页面背景透明（沿用模块卡片页布局），内容区：

1. **面包屑**（白卡上方，与白卡左对齐）：`← 返回`（icon 20×20 #777 + 16px/400 #777，可点 router.back()）+ 标题 16px/600 #333，间距按稿（icon-文字 5px，返回-标题 15px）
2. **白卡** 1680×963 r8 #FFFFFF，padding 20：
   a. **统计卡 4 张**：402×87 r8 #F3F9FF，横排 gap 10；内：40×40 r8 白底 icon 容器（内 24px 蓝色 icon）+ 右侧文字块（label 12px #777；值 18px/600 #027AFF）
      - 报告数（值如 `30`）｜达标率（`100%`）｜评分均分（`86.4`）｜覆盖教师（`81人`）
      - icon：mr-general-doc / mr-class-aim / mr-class-trophy / mr-general-teacher（@miray/icons 现有命名，落地时按实际导出名核对）
   b. **区块标题**（间距 20）：3×12 #027AFF 蓝条 + 「课堂报告列表」16px/600 #333
   c. **筛选区**（间距 20）：见 §4
   d. **表格**（间距 20）：el-table 二次定制，见 §6
   e. **分页**（间距 20）：分页簇水平居中，见 §7

## 6. 表格规格（12 列，列不随模式变化）

- 表头：高 42，bg #F3F9FF（`--el-table-header-bg-color`），文字 16px/600 #333（稿内「日期范围」一列 14/600 为设计噪音，统一 16/600）
- 数据行：高 42，文字 16px/400 #555，无斑马纹，行下边框浅色（#EBEDF0 系，沿用 weak-link-table 口径）
- 列（min-width 按稿比例）：周次 100｜日期范围 150｜报告生成时间 200｜年级 100｜班级 100｜科目 100｜上课教师 100｜报告类别 100｜上课时长 100｜报告评分 100｜报告等级 90｜操作（尾部，右留白）
- 上课教师：16px/600 #027AFF，可点 → 打开教师详情弹窗（teacher-detail-dialog.open({ teacherName, campusId, semesterId })，弹窗内容 1.7.1 仍为预留壳）
- 报告等级：chip 64×22 r2，14px/600；色值 GRADE_COLORS/GRADE_BG 已上提至 `src/constants/overview.ts`（教师列表/下钻弹窗原重复定义改为 re-export）：优秀 #F3FCF5/#00B42A｜良好 #F3F9FF/#027AFF｜合格 #FFFBEE/#FF6F00｜待改进 #FFF5F5/#FF2A2A
- 操作：`查看` 16px/600 #027AFF，点击调用预留方法 `openReport(row)`，方法体 `TODO(1.7.1-报告查看对接)` 占位（不跳转）
- 空数据：el-table 默认空态（「暂无数据」）

## 7. 分页规格

- 居中布局：`共17条`（14px #333）+ 上一页/下一页（32×32 r2 透明底，箭头 12×12 #777，禁用 #AAA）+ 页码方块（32×32 r2；当前页 #027AFF 底白字，其余 #F2F3F5 底 #333 字）+ `前往 [30×30 #F2F3F5 r2 输入框] 页`（回车跳页）
- 页容量 10；total 来自接口；切页滚回表格顶部（页面级）
- 实现沿用手写下钻弹窗的分页样式模式（该处为蓝色当前页、32px 方块，样式口径一致；本页差异：簇居中 + 跳页输入框）

## 8. 数据契约（全部 mock，`src/api/report-list.ts`）

```ts
// 模式上下文（由页面从 route.query 归一）
interface ReportListContext {
  mode: 'all' | 'grade-subject' | 'class-subject' | 'stage-subject' | 'grade'
  campusId?: string; semesterId?: string
  gradeId?: string; subjectId?: string; classId?: string; stageId?: string
}
interface ReportFilterOptionsData {   // #19
  grades: FilterOption[]; classes: FilterOption[]; subjects: FilterOption[]
  weeks: FilterOption[]           // 第18周...
  categories: FilterOption[]      // A类/B类
  levels: FilterOption[]          // 优秀/良好/合格/待改进
  stages: FilterOption[]          // 初中/高中（标题名称反查 = 各池 id→label）
}
interface ReportListStats { reportCount: number; passRate: number /*0-100*/; scoreAvg: number; teacherCount: number }  // #20
interface ReportRow {   // #21 返回 items 元素
  weekLabel: string; dateRange: string; generatedAt: string
  gradeName: string; className: string; subjectName: string
  teacherName: string; category: 'A类' | 'B类'
  durationText: string; score: number; level: '优秀'|'良好'|'合格'|'待改进'
}
```

- `getReportFilterOptionsApi(ctx)` `TODO(1.7.1-接口替换): [#19]`：选项集（标题名称反查 = 各池 id→label）
- `getReportListStatsApi(ctx, filters)` `[#20]`
- `getReportListApi(ctx, filters, page, pageSize)` `[#21]`：`{ items: ReportRow[]; total: number }`
- mock 数据：total 17、每页 10 行；行数据风格按稿（第18周起、日期范围真实推算跨月、生成时间含秒、评分 76~92、等级四色分布）；按模式过滤年级/班级/科目取值范围（如 grade-subject 态数据全部锁定初三+物理）
- 达标率口径（mock）：报告评分 ≥60 占比；覆盖教师 = 去重教师数
- 防竞态：requestSeq 计数器，仅采纳最新响应（沿用概览页模式）

## 9. 文件与组件拆分

```
apps/data-board/src/
├─ constants/report-list.ts        # REPORT_PAGE_MODES（模式→标题模板+筛选字段集+判定）、复用类型
├─ api/report-list.ts              # #19~#21 mock + TODO 标记
├─ components/report-stat-card/    # 统计卡（props: label/value/icon）——公共组件，四卡同构
└─ views/report-list/report-list.vue  # 页面：面包屑+筛选+表格+分页+教师弹窗挂载
```

- 路由注册 `src/router/`（与现有二级页同层）
- el-select 定制沿用 `src/styles/el-select-filter.scss`；el-table 沿用 CSS 变量方案（变量挂根元素、`:deep(.cell)`）
- 分页为手写结构（EP 分页器结构差异大，二次定制成本高于手写，且下钻弹窗已有同风格实现可对齐）

## 10. 验收清单

- [ ] 路由 /report-list 可达，无参进入：标题「报告列表」+ 7 筛选器全集
- [ ] 五种参数态：标题按 §3、筛选项按 §4 矩阵正确增减（含 class-subject 三段标题）
- [ ] UI 与 Figma 9913:50990 / 51447 一比一：统计卡、蓝条标题、筛选控件、12 列表格、四色等级 chip、居中分页（蓝色当前页）
- [ ] 筛选点查询生效、回车触发、重置清空并重查；下拉选择不即时触发
- [ ] 上课教师点击打开教师详情弹窗（壳）；「查看」预留 TODO 不跳转
- [ ] 分页：切页/跳页正确，mock 17 条 2 页
- [ ] 接口全部 mock，#19~#21 标记齐全；防竞态生效
- [ ] `npx vue-tsc --noEmit` 0 error；不 commit

## 11. 明确不做（1.7.1）

- 报告查看详情（预留方法 + TODO）
- 教师详情弹窗内容（同事负责，壳已有）
- 筛选值 URL 同步
- 数据权限 guard 挂载
- 应用外壳（左侧菜单/顶栏）——页面只渲染内容区
