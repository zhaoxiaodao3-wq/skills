# 教师详情公共弹窗 · Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 三件套公共弹窗（详情填桩 / 趋势公共图 / 画像弹窗）+ 下钻引用改造 + 预警入口接线 + mock #19~#22。

**Architecture:** `open()` 桩签名不变原地填内容；趋势 option 从 drill 平移进 `report-trend-chart` 双端共用；枚举常量复用 drill（`GRADE_COLORS/GRADE_BG/REPORT_*/ALL_OPTION`）；列表 10 行整页不内滚。

**Tech Stack:** Vue 3 `<script setup>` + TS、Element Plus（el-dialog/el-table/el-select/el-pagination）、vue-echarts（复用已注册 Bar 不够——趋势是 **Line**！`plugins/echarts.ts` 需**追加 LineChart 注册**）、SCSS。

**仓库根：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**规则：** ❌ 禁止 git commit / push；每 Task 后 vue-tsc + eslint/stylelint。

---

### Task 1: 类型与 mock #19~#22

> **Skill:** 无需 skill · 人工复核：类型/mock

**Files:**
- Modify: `...\src\constants\overview.ts`（末尾，`DataPermissionType` 已有）
- Modify: `...\src\api\overview.ts`（type import + 末尾）

- 类型按 spec §2 全套（`TeacherDetailSummary/TeacherComboItem/TeacherReportRow/TeacherReportPageData`；趋势点结构若与 `DrillTrendPoint` 完全一致则直接复用该类型，实现期以 drill 定义为准，避免重复）。
- mock：#19 按稿数值（王辉/男/2025-2026 下学期/30/40小时30分钟/86.4/100%/totalWeeks18）；#20 两组合含四等级计数；#21 18 周点（分数波动 70~100、等级 1~4 序数，结构对齐 drill point）；#22 11 条稿同款（周次/日期范围/生成时间/班级/科目/类别 A B/40分钟/评分/等级/`reportUrl` 占位），真实切片 10/页；#22 过滤：combo/week/category/grade 空=全部。
- 索引访问兜底；标 `TODO #19/#20/#21/#22`。

**校验：** vue-tsc 0 error。

---

### Task 2: echarts 注册 Line（plugins/echarts.ts）

> **Skill:** echarts · 置信度 0.90 · **自动激活**
> **执行前必读:** echarts skill——共享注册模块**追加** `LineChart`（趋势折线；drill 若此前用的什么注册方式先看它是否已引入 Line——**以 drill 实际所需为准**，可能已有 Line 注册，避免重复 use）

**Files:**
- Modify: `...\src\plugins/echarts.ts`（若 Line 未注册则加 `LineChart`）

**校验：** vue-tsc + build 片段。

---

### Task 3: 公共图表 `report-trend-chart`（vue/scss/data/model）

> **Skill:** echarts · 置信度 0.85 · **自动激活**
> **执行前必读:** echarts skill（option 平移、tooltip confine/转义、autoresize、notMerge）

**Files:**
- Create: `...\src\components\report-trend-chart\{report-trend-chart.vue, .scss, .data.ts, .model.ts}`

- `.data.ts`：从 drill **迁入** `TREND_TABS`/`TrendTab`（drill.data 改为 re-export 兼容，见 Task 6）；option 构建所需色 token（分数线 `#FF55E3`、等级线 `#027AFF`、点样式、轴 `#777` 等——**逐项对照 drill 现实现平移**）。
- `.vue`：`section 标题`（prop `title='报告评价变化趋势'` 16/600 `#333` 带同款竖条或 drill 同款结构——**以 drill 现有 section-title DOM 为准**）+ 右 tabs（选中 14/600 `#333` / 未选 14/400 `#777`，按 drill tabs 样式）；`<slot />`（查看范围行）；图卡（边 `#E5E6EB` r8 pad20，图高 prop 默认 230）内 `VChart`（`:option` 由 `points+tab` 构建，**从 drill `trendOption` 平移**，含分数/等级双态、点样式、轴、tooltip）。
- Props：`points`、`tab`（`defineModel<'分数趋势'|'等级趋势'>`）、`title?`、`height?`。

**校验：** vue-tsc 0 error。

---

### Task 4: 详情弹窗填桩 `teacher-detail-dialog`

> **Skill:** 无需 skill · 人工复核（内含小图表=引用公共件，option 不在本件）

**Files:**
- Modify: `...\src\components\teacher-detail-dialog\{teacher-detail-dialog.vue, .model.ts, .scss, README.md}`

按 spec §3 六段：
1. el-dialog `width 1000`、`:show-close="false"`、`append-to-body`、custom class `border-radius:8px`；**自定义 header**（pad20 底边 `#F2F3F5`：`{name} 的教师详情` 16/600 + 右组【查看教师画像】124×36 `#027AFF`/边 `#80BCFF` r4 白 14/600 → `portraitRef.open({teacherId, teacherName})` + X 16 `#777` 关闭）。
2. body（`max-height:85vh; overflow:auto;` 内层 pad：`padding: 20px 40px 40px; gap20`）：
   - meta（label 16/400 `#777` 值 16/600 `#333`）+ 4 统计卡（222×87 `#F3F9FF` r8 padH20 gap10；图标盒 40×40 白 r8；label 12/400 `#777` 值 18/600 `#027AFF`；图标先查 `@miray/icons` 四个 mr-* 名，可用即用，不可用 EP `Document/Schedule/Trophy/Aim`——README 记偏差）
   - 任教组合：section 标题 + el-table（外框 `#F3F9FF` r8、表头 h42 底 `#F3F9FF`、行 h42 底 `#F2F3F5`、列 min 100/80×5/300、等级组 4 段 label 12/500 `GRADE_COLORS` + 计数 16/600 `#333`）
   - 趋势段：`<report-trend-chart v-model:tab="trendTab" :points="trendPoints">` + slot 内**查看范围行**（查看范围 16/400 + chips 选中 16/600 `#333`/未选 16/400 `#777`，默认第一组合，切换 → seq 链重拉 #21）
   - 课堂报告列表：标题 + 4 el-select 筛选（共享 mixin；选项：#20 组合、`1..totalWeeks`、`REPORT_CATEGORIES`、`REPORT_GRADES`，默认「全部」，切换回第 1 页重拉 #22）+ el-table **10 行整页不内滚**（表头 h40 `#F3F9FF`、10 列 min 宽按稿 64/120/150/64×7、行 h40 底 `#F2F3F5`、等级胶囊 `GRADE_BG/GRADE_COLORS` 12/500、查看按钮 `#F3F9FF` r2 蓝字 `window.open(row.reportUrl,'_blank')`）+ 分页同系列规格（10/页，jumper 右、居中、间隙 8、32 r2）
3. 脚本：`open()` 保持暴露（params 增 `teacherId`——**model 加 teacherId 必填**；三处调用方若未传 teacherId 则以 teacherName 兜底查询？**不行**：调用方现状只传 name(+campus/semester) → **model 加 `teacherId?: string`，mock 按 name 匹配、无 id 时用 name 派生占位 id**，README 注明调用方补 id 是对接事项）；链路：open → `Promise.all(#19,#20)` → 组合默认首项 → `Promise.all(#21,#22)`；三组 `requestSeq`；关闭清数据。
4. README 重写（组件说明/六段结构/接口 #19~#22/画像接入/调用方补 teacherId 事项）。

**校验：** vue-tsc 0 error。

---

### Task 5: 画像弹窗 `teacher-portrait-dialog`（新）

> **Skill:** 无需 skill · 人工复核：el-dialog 占位件

**Files:**
- Create: `...\src\components\teacher-portrait-dialog\{teacher-portrait-dialog.vue, .scss, .data.ts, README.md}`

- `open({teacherId, teacherName?})` + `defineExpose`；宽 800 r8、标题 `{name} 的教师画像`、X 关闭、body 85vh 滚。
- 内容 mock：基本信息行 + 4 统计卡（复用样式语言，常量 `.data.ts` 单点）+ `画像数据待接口接入（teacherId: xxx）` 提示块；**不跳转**。
- 由详情 header 按钮引用（Task 4）。

**校验：** vue-tsc 0 error。

---

### Task 6: 下钻改造为引用公共图表

**Files:**
- Modify: `...\src\components\class-subject-drill-dialog\{class-subject-drill-dialog.vue, .data.ts}`

- `class-subject-drill-dialog.data.ts`：`TREND_TABS/TrendTab` 改为 `export ... from '@/components/report-trend-chart/...'`（或本地 type re-export），**外部引用不破**。
- `.vue`：移除内联 trend-head/tabs/chart-card/VChart/`trendOption`/点样式代码，替换为：
  ```vue
  <report-trend-chart v-model:tab="activeTab" :points="points">
    <!-- 查看范围行按 drill 现有 DOM 平移进 slot（若 drill 原有） -->
  </report-trend-chart>
  ```
  删除不再使用的 VChart import（若 drill 其它处仍用图则保留——**以实际引用为准**）；`activeTab`/`points` 逻辑保留。
- **行为/视觉不变**为验收基线。

**校验：** vue-tsc 0 error。

---

### Task 7: 预警入口接线 + 删旧弹窗

**Files:**
- Modify: `...\src\components\teacher-warning-list\{teacher-warning-list.vue, .scss, README.md}`
- Delete: `...\src\components\teacher-warning-list\teacher-warning-dialog.vue` + `teacher-warning-dialog.scss`

- 教师名 span：`cursor:pointer`（原蓝色保留），`@click="openDetail(row)"` → 新增 `teacherDetailRef`（`<TeacherDetailDialog ref>`）`open({ teacherName: row.teacherName, teacherId: row.teacherId, semesterId: route.query.semesterId })`。
- 删除旧 `teacher-warning-dialog` 引用与文件；README 更新（教师名点击 → 公共详情弹窗）。
- 检查 `route` 在 warning 组件已有 ✓。

**校验：** vue-tsc 0 error。

---

### Task 8: 验证（spec §6 验收 1~10）

1. `vue-tsc` 0 error；`eslint --fix`+复检（本模块全部文件）；`stylelint --fix`+复检；`ls-lint`。
2. `pnpm build:data-board:develop`。
3. 浏览器自检：三入口开弹窗（weak-link/drill/teacher-list 零改动）→ 六段渲染/画像按钮开画像 mock/X 关闭；趋势公共件双端（详情 tabs + 查看范围切、下钻改造后与改前一致）；列表 4 筛选 + 10 行整页 + 11 条 2 页 + 查看新窗口；预警教师名点击开弹窗、旧弹窗已删；竞态。
4. 与 `requirements/assets/figma-teacher-detail-dialog@2x.png` 1:1 对照（还原度素材）。

**⚠️ 全程不 commit；完成后 Step E：A 一致性 → B 还原度 → archive → validate。**

---

## Skill 路由汇总（router.mjs --annotate + 人工复核）

- CLI：`node E:\code\frontend-local\.agents\routing\router.mjs --annotate <本 plan>`（2026-10-19）→ `echarts` 0.70
- 人工复核：**本次命中有效**（趋势折线图）——**Task 2 = echarts 0.90**（共享注册追加 LineChart，先核 drill 是否已注册避免重复 use）、**Task 3 = echarts 0.85 自动激活**（option 从 drill 平移：双态线/点样式/轴/tooltip confine 转义/生命周期）；Task 8 验证参照；其余任务否决（类型/mock/dialog 装配/接线）
- `riskLevel`：低；**drill 改造前后视觉行为一致**为硬验收
