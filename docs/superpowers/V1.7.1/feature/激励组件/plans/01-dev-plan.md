# 激励组件 · Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 预警行右半「激励」卡：标题映射 + 双 tab 分段器 + 列可配置表格（建议前端算）+ 同系列分页。

**Architecture:** 配置驱动（`INSPIRE_PAGE_TITLES`、列集合按 tab + 备课开关）；单接口 #17 带 `tab` 入参；`computeAdvice` 规则单点；截断兜底单点。

**Tech Stack:** Vue 3 `<script setup>` + TS、Element Plus（el-table/el-pagination）、SCSS。**无 ECharts**。

**仓库根：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**规则：** ❌ 禁止 git commit / push；每 Task 后 vue-tsc + eslint/stylelint。

---

### Task 1: 类型与标题映射（constants/overview.ts）

> **Skill:** 无需 skill · 人工复核：纯类型/常量

**Files:**
- Modify: `...\src\constants\overview.ts`（末尾，`DataPermissionType` 已有 import）

追加 spec §2：`InspireTab` / `InspireRow` / `InspirePageData` / `INSPIRE_PAGE_TITLES`（正向/年级/学科/本组激励榜）。**校验：** vue-tsc 0 error。

---

### Task 2: mock #17（api/overview.ts）

> **Skill:** 无需 skill · 人工复核：mock 构造

**Files:**
- Modify: `...\src\api\overview.ts`（type import + 末尾）

`getInspirePageApi({ tab, ..., page, pageSize })` 标 `[#17]`：
- 两 tab 各 5 条（设计稿同款数值），`grade` 始终带（初一…），`avgScore` 仅 benchmark 给（含 `'89.89'` 截断样例），`excellentRate` 含 `'96.7%'` 整数截断样例
- benchmark 优秀率分布覆盖 ≥50 与 <50（→优秀稳定）；potential 覆盖 ≥25（冲线在望）与 <25（定向培养）各至少 1 条
- `advice` **不返回**（验证前端算）；`total` 真实；按 `page/pageSize` 切片
- 注意 `noUncheckedIndexedAccess`

**校验：** vue-tsc 0 error。

---

### Task 3: 组件常量与规则（teacher-inspire-board.data.ts / .model.ts）

> **Skill:** 无需 skill · 人工复核：常量与纯函数

**Files:**
- Create: `...\src\components\teacher-inspire-board\{teacher-inspire-board.data.ts, teacher-inspire-board.model.ts}`

- `COLUMN_LABELS = { teacherName:'教师', grade:'年级', reportCount:'报告数', avgScore:'评分均分', excellentRate:'优秀率', advice:'建议' }`
- `COMPONENT_TEXTS = { emptyText:'暂无数据', tabs:{ benchmark:'标杆教师', potential:'潜力之星' } }`
- `INSPIRE_COLORS`（标题竖条/教师名 `#027AFF`、报告数 `#333`、评分均分 `#333`、优秀率 `#555`、tab 容器 `#F2F3F5`、选中 `#027AFF`/白、未选 `#777`/点 `#80BCFF`、点描边 `#E6F2FF`、胶囊标杆 `#F3FCF5`+`#00B42A`、潜力 `#F3F9FF`+`#027AFF`、行底边 `#F2F3F5`、表头 `#F3F9FF`/`#333`）
- `PAGE_SIZE = 10`
- **规则单点**：`computeAdvice(tab, rateStr)`（`truncateIntPercent` 先截断整数再比较：benchmark ≥50 / potential ≥25）+ `truncateIntPercent('96.7%')` + `truncateOneDecimal`
- `.model.ts`：`TeacherInspireBoardProps { permission }`

---

### Task 4: 主组件（teacher-inspire-board.vue / .scss）

> **Skill:** 无需 skill · 人工复核：el-table/el-pagination 同系列先例

**Files:**
- Create: `...\src\components\teacher-inspire-board\{teacher-inspire-board.vue, teacher-inspire-board.scss}`

1. 模板：
   - 头部行 `__header`：左竖条+标题（`INSPIRE_PAGE_TITLES[permission]`）；右 **tab 分段器**（容器 `#F2F3F5` r6 h36；两 tab 按钮 96×30 r4：`:class is-active`；每 tab 内 圆点 span + 文案；**无 chevron**）
   - `el-table`：列由 `columnKeys` computed 驱动——基准 `['teacherName','reportCount','avgScore'(仅benchmark),'excellentRate','advice']`，`permission==='campus-grade-subject'` 时在 `teacherName` 后插 `'grade'`；表头 16/600 `#F3F9FF` h42、行 h50 底边 `#F2F3F5`（scss `:deep td` border-bottom）
   - cell 渲染：教师名 600 `#027AFF`（不可点）；报告数 `#333`；评分均分 600 `#333`（`truncateOneDecimal` 展示）；优秀率 `#555`（`truncateIntPercent` 展示）；**建议 slot → 胶囊 span**（族色按 `tab`；内容 `row.advice || computeAdvice(tab, row.excellentRate)`）
   - 分页：`layout="total, prev, pager, next, jumper"` + 同系列全部定制 token（32 r2 / 未选 `#F2F3F5` / 激活 `#027AFF` / 间隙 8 / 居中 / jumper 输入 40 `#F2F3F5` r2）——**逐 token 复制** level-detail-table
2. 脚本：`tab = ref<InspireTab>('benchmark')`、`pageMap = reactive<Record<InspireTab, number>>({ benchmark:1, potential:1 })`、`page` computed get/set 指向 tab（或直接 `pageMap[tab]`）；`list/total/refreshing/ready/requestSeq`
   - `switchTab(next)`：`if (next===tab) return; tab=next; pageMap[next]=1; loadData()`
   - `loadData()`：#17 带 `tab` + `pageMap[tab]` + route 三键
   - `watch route 三键` → 当前 tab 页码=1 重拉
3. `<style scoped lang="scss">@use './teacher-inspire-board';</style>`

**校验：** vue-tsc 0 error。

---

### Task 5: 四页 `__warn-row` 补右卡

**Files:**
- Modify: 四页 `.vue`（grade-overview / plan-lessons / subject-overview-2 / principal-cockpit-2）

在既有 `__warn-row` 内追加：

```html
<div class="{page}__warn-card">
  <teacher-inspire-board :permission="PAGE_PERMISSION" />
</div>
```

（kebab 标签；scss **零改动**——复用 `__warn-card`）+ import。

**校验：** vue-tsc 0 error。

---

### Task 6: 组件 README

**Files:**
- Create: `...\src\components\teacher-inspire-board\README.md`

用途 / 用法（props、标题映射表）/ **tab 与列差异表**（标杆5列、潜力4列、备课+年级）/ **建议规则与四分支**（截断口径、advice 覆盖通道）/ 分页与竞态 / 数据契约 / 替换点 #17 对接指引（tab 入参、截断后端、排序后端、advice 可选）/ P2 五裁决记录（标杆教师文案、chevron 不实现、教师名不点、稿样例冲突按规则、胶囊族色）。

---

### Task 7: 验证（spec §6 验收 1~10）

1. vue-tsc / eslint --fix+复检 / stylelint --fix+复检 / ls-lint。
2. `pnpm build:data-board:develop`。
3. 浏览器自检：四页标题与右卡、tab 切换（页码重拉）、列差异（备课+年级、潜力无均分）、建议四分支、截断两样例、分页规格、空态/竞态、预警卡零回归。
4. 与 `requirements/assets/figma-inspire-{benchmark,potential}@3x.png` 对照（还原度素材）。

**⚠️ 全程不 commit；完成后 Step E：A 一致性 → B 还原度 → archive → validate。**

---

## Skill 路由汇总（router.mjs --annotate + 人工复核）

- CLI：`node E:\code\frontend-local\.agents\routing\router.mjs --annotate <本 plan>`（2026-10-19）→ `echarts` 0.70 命中
- 人工复核：**全部否决**——本模块**无图表**（关键词误报，Tech Stack 已注明「无 ECharts」）；Task 1~7 为类型/mock/常量纯函数/el-table/el-pagination/布局/文档
- `riskLevel`：低；先例：分页与表格定制**逐 token 复制** `level-detail-table`，tab 分段器为新样式按稿实现
