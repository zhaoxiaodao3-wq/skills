# 概览顶部模块 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature（全量档） · **状态：** 待 P2 确认
**代码仓库：** `apps-development-platform/apps/data-board`
**设计稿：** [Figma node 9913-44565（校长）/ 9913-47751（年级）/ 9913-46441（备课）](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/%E6%98%8E%E7%9D%BF%E5%BC%80%E5%8F%91%E7%A8%BF-%C2%B7%E5%9B%A2%E9%98%9F%E7%89%88?node-id=9913-44565&m=dev)（已通过 Figma REST API 提取全部样式值；渲染对照图与插画资源见 `requirements/assets/`）

---

## 1. 现状（相关代码事实）

- 路由已有 `/grade-overview`（年级长概览）、`/plan-lessons`（备课组长概览），页面均为 `DataPermissionGuard` 包空白的占位；`/principal-cockpit` 占位未接守卫；`/subject-overview` 不存在（本期不建）
- 数据权限：`useDataPermissionStore`（mock，替换点 #1/#2）+ `useDataPermission` hook + `data-permission-guard` 组件已交付（01 归档）
- 数据权限类型 `DataPermissionType` 已含四种：`campus` / `campus-grade` / `campus-stage-subject` / `campus-grade-subject`
- 组件规范：标准目录结构（vue/model/util/data/scss）、BEM、**优先 Element Plus 二次定制**（用户再次确认）；vue/vue-router API 自动导入
- 无 `src/api/` 目录（接口调用目前都在共享包 `#/apis`）；本期新建 `src/api/overview.ts` 承载本模块接口（mock 实现）
- dev 菜单兜底已生效（替换点 #3），两页面可从菜单进入

## 2. 需求范围（含 P1 结论）

**做：**

1. 三个业务组件：`overview-filters`（筛选）、`overview-nav`（跳转按钮）、`overview-stat-cards`（统计卡片），放 `src/components/`，UI 按 §4 样式对照还原
2. 参数体系 hook `use-overview-query`（URL 参数 ↔ 筛选默认值 ↔ URL 同步 ↔ 跳转组装）
3. `src/api/overview.ts` mock 接口（筛选选项、卡片数据），签名即未来接口契约
4. 接入两个页面（grade-overview / plan-lessons），均在 `DataPermissionGuard` 内
5. 三组件各写 README.md（使用方式 + 完成情况 + 对接指引）
6. 1.7.1 文档仓库归档完成情况与对接说明

**P1 已确认结论：**

- 校长卡：不显示副标题、第一个指标不显示 label（数据驱动，字段为空不渲染）
- 「教师列表」按钮：预留路径 `/teacher-list`，直接 push（页面后续需求补上即通；当前会被 404 通配重定向回概览，可接受）
- `/subject-overview` 本期不建路由；跳转目标路由不存在时降级不跳转
- 筛选变化 `router.replace` 同步 URL query
- 标题卡紫边框是 **hover 态**；其余卡片 hover 设计稿未给，由本 spec 设计补齐（§4.5）
- 本期不实现卡片点击业务，预留 click emit

**不做：** 不建 `/subject-overview`、`/teacher-list` 页面；不接真实接口；不动按钮/菜单权限体系与路由守卫。

## 3. 设计方案

### 3.1 页面配置映射（`src/constants/overview.ts`）

两组映射，来源不同（**修正记录**：初版 spec 误把按钮显隐放进页面配置，按钮显隐按需求原文取决于**当前账号的数据权限**，非页面所需权限）：

```ts
/** 页面配置：由页面自身所需权限（路由 meta.dataPermission）决定筛选项与卡片变体。 */
export interface OverviewPageConfig {
  fields: FilterFieldKey[]
  variant: StatVariant
}
export const OVERVIEW_PAGE_CONFIGS: Record<DataPermissionType, OverviewPageConfig> = {
  'campus':                { fields: ['campus', 'semester'],                     variant: 'principal' },
  'campus-grade':          { fields: ['campus', 'semester', 'grade'],            variant: 'grade' },
  'campus-stage-subject':  { fields: ['campus', 'semester', 'stage', 'subject'], variant: 'subject' },
  'campus-grade-subject':  { fields: ['campus', 'semester', 'grade', 'subject'], variant: 'plan' },
}

/** 跳转按钮显隐：由当前账号的数据权限决定（需求原文：校区权限四按钮全显，其他仅教师列表）。 */
export const ACCOUNT_NAV_KEYS: Record<DataPermissionType, OverviewNavKey[]> = {
  'campus':                ['teacherList', 'gradeOverview', 'subjectOverview', 'planLessons'],
  'campus-grade':          ['teacherList'],
  'campus-stage-subject':  ['teacherList'],
  'campus-grade-subject':  ['teacherList'],
}
```

页面根据自身 `route.meta.dataPermission` 取 fields/variant；`overview-nav` 内部经 `useDataPermission` 读**账号权限**再查 `ACCOUNT_NAV_KEYS`——权限与 UI 解耦，同事后续接 `/subject-overview`、`/principal-cockpit` 零成本。

### 3.2 筛选组件 `overview-filters/`

- props：`fields: FilterFieldKey[]`、`modelValue: OverviewQuery`（v-model 受控）；可选 `options?: Partial<Record<FilterFieldKey, FilterOption[]>>` 覆盖接口数据
- 内部挂载时调 `getOverviewFilterOptionsApi(fields)` 拉选项（mock），emit `update:modelValue`
- 下拉用 **`el-select` 样式覆盖**（尺寸 200x30、灰底 `#F2F3F5`、圆角 4、无边框，详见 §4.2）；label 在左侧
- 受控值变化完全由父层（hook）决定，组件不含默认值逻辑

### 3.3 跳转按钮组件 `overview-nav/`

- props：`query: OverviewQuery`；按钮显隐内部经 `useDataPermission` 读**账号数据权限**查 `ACCOUNT_NAV_KEYS`（§3.1）
- 按钮用 **`el-button` 样式覆盖**（§4.3）
- 点击：`router.push({ path, query })`；`query` 直接透传当前 `OverviewQuery`
- 路由解析：`/grade-overview`、`/plan-lessons` 真实跳转；`/teacher-list` 预留路径直接 push；`/subject-overview` 等未注册路由**降级不跳转**（用 `router.getRoutes()` 判断注册与否）
- `OverviewNavKey → { label, path }` 映射放在组件 `.data.ts`

### 3.4 统计卡片组件 `overview-stat-cards/`

- props：`variant: StatVariant`；内部调 `getOverviewStatApi(variant)`（mock）拿数据
- 数据结构（接口契约，label/icon 全数据驱动，组件不写死文案）：

```ts
export interface StatMetric {
  value: string              // '91%'
  label: string              // '达标率'；校长第一个指标为 ''（不渲染 label）
  theme: StatCardTheme       // 'purple' | 'blue' | 'green' | 'yellow' | 'red'
  illustration: StatIllustrationKey  // 'grades' | 'task' | 'average' | 'people' | 'doc'
}
export interface OverviewStatData {
  title: string              // '初二'
  subtitle: string           // '全科目'；校长为 ''（不渲染）
  metrics: StatMetric[]      // 固定 3 项
}
```

- 布局：标题卡（文本列左、插画右下贴边）+ 3 指标卡；文本上下排列（数值 36px 上、label 16px 下）
- 插画资源：5 张 3x PNG 已从 Figma 导出（`requirements/assets/illustrations/`），plan 阶段复制到 `src/components/overview-stat-cards/assets/`；`illustration` 键 → 资源映射放 `.data.ts`
- hover（§4.5）+ 预留 `emit('titleClick')`

### 3.5 参数体系 hook `src/hooks/use-overview-query.ts`

```
useOverviewQuery(fields: FilterFieldKey[]): {
  query: Ref<OverviewQuery>          // 当前选中值
  options: Ref<Record<FilterFieldKey, FilterOption[]>>
  ready: Ref<boolean>                // 选项加载完成
}
```

1. 挂载拉选项 → 回填默认值：`route.query` 有对应参数且在选项中 → 用之；否则选**第一项**
2. `query` 变化 → `router.replace({ query })` 同步 URL（键：`campusId` / `semesterId` / `gradeId` / `subjectId` / `stageId`）
3. 供 `overview-nav` 的 `query` 直接引用

### 3.6 mock 接口 `src/api/overview.ts`

- `getOverviewFilterOptionsApi(fields)` → `Promise<{ code, data: Record<FilterFieldKey, FilterOption[]> }>`：内部 setTimeout(200ms) 返回 mock（每种字段 ≥2 项，验证「默认第一项」「指定选中」逻辑）
- `getOverviewStatApi(variant)` → `Promise<{ code, data: OverviewStatData }>`：四种 variant 全量 mock（文案按 §4.4 与设计稿）
- 函数签名即接口契约；两处均带 `TODO(1.7.1-接口替换): [#4/#5]` 标记；接接口时仅改函数体为共享 http 调用
- 替换点编号顺延：**#4 筛选选项接口、#5 卡片数据接口**（#1 数据权限 mock、#2 权限 store、#3 菜单兜底已被占用）

### 3.7 页面接入

`grade-overview.vue` / `plan-lessons.vue` 在 `DataPermissionGuard` 内：

```vue
<template v-if="config">
  <div class="overview-top">
    <OverviewFilters v-if="ready" v-model="query" :fields="config.fields" />
    <OverviewNav :query="query" />
    <OverviewStatCards :variant="config.variant" />
  </div>
</template>
```

（`config` 取自 `OVERVIEW_PAGE_CONFIGS[route.meta.dataPermission]`；筛选与按钮行的容器排版见 §4.1。）

## 4. 样式对照（Figma）

> 数据来源：Figma REST API 节点解析（非目测）；渲染对照图 `requirements/assets/figma-top-grade.png`（年级）。设计稿画布宽 1680（内容区 1640），实现按容器 100% 自适应、间距不变。

### 4.1 模块容器（node 9913:44565）

| 属性 | 值 |
|------|-----|
| 背景 | #FFFFFF，圆角 8，内边距 20，垂直布局，子元素间距 20 |
| 筛选行 | 高 36，左右两端对齐（左筛选组、右按钮组） |
| 卡片行 | 高 112，水平间距 20 |

### 4.2 筛选项（design: Frame 1940699021 等）

| 属性 | 值 |
|------|-----|
| 项结构 | label + 下拉框，水平间距 10；项与项间距 20 |
| label | 14px / 400 / #333333 |
| 下拉框（el-select 定制） | 200x30，bg #F2F3F5，圆角 4，无边框，内边距 L10/R10，文字 14px #333333，右侧箭头 14x14 #777777 |
| 筛选默认值文案（设计稿） | A校区 / 2026 - 2027 上学期 / 一年级 |

### 4.3 跳转按钮（design: Frame 1940699486~9489）

| 属性 | 值 |
|------|-----|
| 尺寸 | 高 36，左右 padding 20，按钮间间距 20（宽度随文案） |
| 文字 | 14px / 600 / #027AFF |
| 背景 | #F3F9FF，边框 1px #80BCFF，圆角 4 |
| 四按钮文案 | 教师列表 / 年级长概览 / 学科组长概览 / 备课组长概览 |

### 4.4 统计卡片（design: Frame 1940698674 等）

| 属性 | 值 |
|------|-----|
| 卡片 | 395x112，圆角 8，内边距 20，垂直文本列（间距 10）；插画 120x84 绝对定位右下贴边 |
| 主标题/数值 | 36px / 600 / 默认 #333333，行高 50.4 |
| 副标题/label | 16px / 400 / #777777，行高 22.4 |
| 标题卡 hover 渐变（设计稿唯一给出的 hover） | 线性渐变 #E0E2FF → #F5F5FE，边框 1px #8B55FF，投影 #8B55FF 5%，主标题变 #8B55FF |
| 指标卡渐变（常显） | 蓝 #D7E6FF→#EEF6FF（评分均分）、绿 #CFF5EE→#F1FAF9（达标率/task）、黄 #FFEFD7→#FFFBF6（覆盖教师数/people）、红 #FFE2E2→#FFF7F7（份报告/doc）、紫 #E0E2FF→#F5F5FE（标题卡 hover 同款） |
| 四种权限卡片文案 | 见 requirements 表格（校长卡无副标题、指标1无 label） |

### 4.5 hover 设计补齐（设计稿未给，本 spec 定义——**P2 需确认**；标题卡常态底色经用户反馈修正）

| 元素 | 默认态 | hover 态 |
|------|--------|----------|
| 标题卡 | **浅紫渐变底常显**（#E0E2FF→#F5F5FE）、无边框、主标题 #333333（2026-10-16 用户反馈修正：常态补底色，hover 仅多边框） | 仅加边框 1px #8B55FF，主标题变 #8B55FF |
| 指标卡 | 各色渐变常显 | 边框 1px 同主题色（蓝 #80BCFF / 绿 #38DCBE / 黄 #FFC43C / 红 #FF9A9A）+ 投影同主题色 8%，数值不变 |
| 过渡 | — | background-color / border-color / box-shadow 0.2s ease（el-select/el-button 同步 hover 规范） |

## 5. 类型定义（`src/components/overview-*/…model.ts` + `src/api/overview.model.ts` 集中放 `src/constants/overview.ts` 或 api model，plan 定）

- `FilterFieldKey = 'campus' | 'semester' | 'grade' | 'subject' | 'stage'`
- `OverviewQuery = Partial<Record<FilterFieldKey, string>>`（值为选项 id）
- `FilterOption = { id: string, label: string }`
- `OverviewNavKey = 'teacherList' | 'gradeOverview' | 'subjectOverview' | 'planLessons'`
- `StatVariant = 'principal' | 'grade' | 'subject' | 'plan'`；`StatCardTheme` / `StatIllustrationKey` / `StatMetric` / `OverviewStatData` 见 §3.4

## 6. 影响文件清单

**新增：** `src/api/overview.ts`（mock）、`src/constants/overview.ts`（页面配置 + 类型）、`src/hooks/use-overview-query.ts`、`src/components/overview-filters/*`、`src/components/overview-nav/*`、`src/components/overview-stat-cards/*`（含 `assets/*.png` 插画 + 各 README.md）、`src/views/subject-overview/`（**不建**）

**修改：** `src/views/grade-overview/grade-overview.vue`、`src/views/plan-lessons/plan-lessons.vue`（接入顶部模块）

**不动：** 路由守卫、`principal-cockpit`、数据权限体系、菜单兜底

## 7. 验收标准

1. [x] 两页面显示顶部模块：筛选行 + 跳转按钮行 + 卡片行，样式对照 §4（截图与 Figma 渲染图 figma-top-grade.png 比对通过）
2. [x] 直进页面（无参数）：各下拉自动选中选项第一项，URL 被 `replace` 同步为选中参数（实测 `?campusId=campus-1&semesterId=semester-1&gradeId=grade-1`）
3. [x] 带参进入（`?gradeId=grade-2`）：年级下拉选中「二年级」；非法参数回退第一项（URL 键清洗由 hook 统一处理）
4. [x] 修改筛选 → URL 更新；年级长页选「三年级」点「备课组长概览」→ 携带 query 跳转且备课页年级=三年级（曾发现参数键名 bug 已修复，见归档）
5. [x] mock `campus` 权限账号：任何概览页四按钮全显；其他权限仅「教师列表」；「教师列表」push 预留路径（404 重定向回概览属预期）；「学科组长概览」降级不跳转（实测 URL 不变）
6. [x] 四种 variant 卡片 mock 渲染正确：校长无副标题且指标1无 label（数据驱动，校长 variant 页面未接入由数据结构保证）；grade/plan 实测渲染正确；各卡渐变/插画按 §4.4
7. [x] hover 态：标题卡紫渐变+紫边框+标题变紫（截图验证）；指标卡同主题色边框；0.2s 过渡
8. [x] 三组件 README 齐备；`TODO(1.7.1-接口替换):` #4/#5 与归档替换点表对应
9. [x] vue-tsc 0 error；`pnpm build:data-board:develop` 成功
10. [x] `principal-cockpit`、数据权限守卫、菜单兜底行为不变（未改动相关文件）

## 8. 交付自检说明

- **一致性自检**：适用（空态：选项未加载不渲染筛选、卡片数据未到不渲染卡片区；mock/真数据同源：组件只消费 api 函数；多入口：两页面同一配置映射；失败/缺省：接口失败保留空态、参数非法回退默认）
- **还原度自检**：适用（Figma：node 9913-44565 / 47751 / 46441；对照方式：REST API 提取 token + 渲染图比对 + 页面截图走查；偏差清单逐项记录）
