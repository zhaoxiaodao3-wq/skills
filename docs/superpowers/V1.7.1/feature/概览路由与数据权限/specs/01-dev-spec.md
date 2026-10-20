# 概览路由与数据权限 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1
**类型：** feature（全量档）
**状态：** 待 P2 确认
**代码仓库：** `apps-development-platform`（路径别名 `@/` → `apps/data-board/src/`）

---

## 1. 现状（截至 2026-10-16 的代码事实）

以下均基于 `apps/data-board` 当前代码逐文件核实，作为「实现前基线」，交付归档时据此对比。

### 1.1 应用骨架

- 独立 Vue 3 + TypeScript 应用 `@miray-apps/data-board`，端口 8102，基础路径 `/data-board-app/`
- `src/` 下现有目录：`components/`、`directives/`、`router/`、`stores/`、`styles/`、`utils/`、`views/`
- **没有** `hooks/`（或 composables）目录，本次为首次建立该惯例
- vue / vue-router API 由 Vite Auto Import 自动导入，**禁止手动 import**

### 1.2 路由现状（`src/router/index.ts`）

- 根路由 `/` 挂 `app-layout.vue`，children 两个占位页面：
  - `principal-cockpit`（校长驾驶舱，6 行占位 `<h1>`）
  - `grade-overview`（年级长概览，6 行占位 `<h1>`）
- 404 通配 `/:pathMatch(.*)*` 重定向到 `/`
- 全局守卫 `beforeEach`：
  1. 有登录态且未加载时调 `permissionStore.loadResources()`（失败不拦截）
  2. 资源已加载时：访问 `/` 或目标路径不在后端资源中 → 重定向到资源顺序中第一个已实现菜单（`getDefaultPermissionPath`）
- **现状结论**：路由守卫只管「菜单/路由资源」（按钮权限体系），**完全没有数据权限概念**

### 1.3 权限现状（按钮/菜单权限，与本次新增的数据权限是两套）

- `stores/modules/permission.ts`：`usePermissionStore`，持 `resources` / `loaded`，`loadResources()` 调共享接口 `getUserAppResourceApi()`（`/auth/user/myAppResource`），`canUseButton(path, key)` 判按钮
- `utils/permission.ts`：`parseApplicationResources`（只认 `href` 开头为 `/` 的资源）、`findPermissionResource`（详情页继承最近父级）、`hasButtonPermission`（满足任一）、`getDefaultPermissionPath`
- `utils/permission.model.ts`：`ApplicationResource { href, label?, page?, icon?, buttonList }`
- 按钮指令：`directives/permission.ts` 注册 `v-application-permission`
- **该体系本期不动**

### 1.4 菜单现状（`app-layout.vue` + `app-navigation.*`）

- `app-layout.vue` 从 `router.getRoutes()` 过滤有 `name` + `meta.title` 的路由生成 `navigationPages`，连同 `permissionStore.resources` 传给 `app-navigation`
- `app-navigation.util.ts` 的 `buildNavigationGroups`：**菜单只渲染后端返回的资源**（按资源 `label` 分组），本地路由仅用于补 `page` 标题与激活态；后端没返回的资源不出现在菜单
- **现状结论**：写死路由后，菜单是否显示取决于后端资源返回，前端无需（也不应）为菜单做兜底（与近期提交 f6b119a「菜单改为只接受后端加载」一致）

### 1.5 用户信息现状（数据权限的宿主）

- `stores/modules/application.ts`：`useApplicationStore.loadInfo()` 并行拉 `getAppInfoByKeyApi`（应用名）与 `getMyInfoApi`（用户信息），后者结果存 `sessionStorage.USER_INFO`
- `utils/application-info.ts`：`parseApplicationUser` 目前只解析 `tenantName / userName / userAvatar / identityName` 四个字段
- **现状结论**：用户信息接口已有调用链；后端规划将数据权限放进用户信息返回，但本期接口未就绪 → mock 放在独立的数据权限 store 的加载函数里，未来从用户信息字段读取（见 §4 替换点）

### 1.6 错误/空态提示现状

- `components/page-state/page-state.vue`：`el-result icon="info"` + `title` / `subTitle`，标准目录结构（vue + model + scss），可直接复用为「无数据权限」错误提示

## 2. 需求范围

**做：**

1. 新增路由 `/plan-lessons` 备课组长概览（`grade-overview` 已存在，保留）
2. 建立数据权限类型模型与偏序判断
3. 封装 `useDataPermission` hook + `data-permission-guard` 守卫组件
4. 数据权限 store（mock 加载，单点替换）
5. 两个概览页面用守卫组件包裹：有权限 → 空白内容区；无权限 → `page-state` 错误提示
6. 路由 meta 声明页面所需数据权限

**不做：**

- 不删任何现有内容（`principal-cockpit` 原样保留）
- 不做菜单兜底（菜单仍只来自后端资源）
- 不改按钮权限体系、路由守卫的重定向逻辑
- 不实现任何页面业务内容（页面空白）
- 不接任何真实数据权限接口（mock，见 §4）

## 3. 设计方案

### 3.1 数据权限类型与偏序（`src/utils/data-permission.model.ts` + `src/utils/data-permission.ts`）

```ts
/** 四种数据权限，值即后续与后端对齐的枚举候选 */
export type DataPermissionType
  = 'campus'                // 校区
  | 'campus-grade'          // 校区+年级
  | 'campus-stage-subject'  // 校区+学段+科目
  | 'campus-grade-subject'  // 校区+年级+科目
```

偏序关系（用户确认）——「持有页面所需权限或比它高级的权限」才可见：

| 持有 ↓ 可看 → | campus（校区） | campus-grade | campus-stage-subject | campus-grade-subject |
|---|---|---|---|---|
| campus | ✅ | ✅ | ✅ | ✅ |
| campus-grade | ❌ | ✅ | ❌ | ✅ |
| campus-stage-subject | ❌ | ❌ | ✅ | ✅ |
| campus-grade-subject | ❌ | ❌ | ❌ | ✅ |

实现为纯函数 `hasDataPermission(current: DataPermissionType | null, required: DataPermissionType): boolean`：

- `current === required` → `true`
- `current === 'campus'` → `true`（校区最高）
- `current === 'campus-grade'` 且 `required === 'campus-grade-subject'` → `true`
- `current === 'campus-stage-subject'` 且 `required === 'campus-grade-subject'` → `true`
- 其余（含 `current` 为 `null`/加载中/加载失败）→ `false`

`campus-grade` 与 `campus-stage-subject` **互不覆盖**（用户已确认）。

### 3.2 数据权限 store（`src/stores/modules/data-permission.ts`）

- `useDataPermissionStore`，与现有 `usePermissionStore`（按钮/菜单权限）**分离**，来源不同
- 状态：`permissionType: Ref<DataPermissionType | null>`、`loaded: Ref<boolean>`
- `loadDataPermission()`：本期**同步返回 mock 常量**（见 §4），结构上预留异步，接口就绪后仅改函数体
- 与用户信息的关系：本期不从 `USER_INFO` 读；接口就绪后改为从用户信息返回的数据权限字段读取（后端字段名待定，届时在替换点对齐）

### 3.3 Hook（`src/hooks/use-data-permission.ts`，本次新建 `src/hooks/` 目录）

```ts
export function useDataPermission(required?: DataPermissionType): {
  permissionType: ComputedRef<DataPermissionType | null>  // 当前账号权限
  hasPermission: ComputedRef<boolean>                     // required 传入时：同权限或更高级
  loaded: ComputedRef<boolean>                            // 权限是否已加载
}
```

- 组件挂载时若 store 未加载则触发 `loadDataPermission()`
- `required` 未传时仅暴露当前权限（供后续接口请求组装校区/年级/科目参数等场景）
- 后续所有需要权限判断的接口请求统一走本 hook 或 store，**禁止直接 import mock 常量**

### 3.4 守卫组件（`src/components/data-permission-guard/`，标准目录结构）

```
data-permission-guard/
  data-permission-guard.vue        # <script setup>；template → script → style
  data-permission-guard.model.ts   # DataPermissionGuardProps { required: DataPermissionType }
  data-permission-guard.scss       # BEM：.data-permission-guard
```

- props：`required: DataPermissionType`（必填）
- 内部调用 `useDataPermission(required)`
- 有权限 → 渲染默认 slot；无权限 → 渲染复用的 `page-state`（`title="无数据权限"`，`description` 说明当前权限与所需权限，文案实现时定稿）；加载中不闪错误提示（`loaded` 为 false 时不渲染错误态）

### 3.5 路由与页面

- `router/index.ts`：新增

```ts
{ path: 'plan-lessons', name: 'PlanLessons', component: () => import('@/views/plan-lessons/plan-lessons.vue'), meta: { title: '备课组长概览' } }
```

- 两个路由 `meta` 增加 `dataPermission: 'campus-grade' | 'campus-grade-subject'`（类型扩展进 `declare module 'vue-router'`），meta 是「页面所需权限」的声明点；**守卫逻辑不放路由守卫**（需求要求进页面显示错误提示而非跳转）
- `grade-overview.vue` / `plan-lessons.vue`：`<DataPermissionGuard :required="...">` 包一个空白占位内容区；`principal-cockpit.vue` **一行不动**

### 3.6 自测方式

mock 常量改一处值 → 四种权限 × 两页面共 8 种组合人工验证（矩阵见 §3.1）。

## 4. Mock 与接口替换点（本期文档核心要求）

> 代码中所有 mock 处必须带注释标记 `// TODO(1.7.1-接口替换):`，与下表一一对应；后续接接口时全局搜索该标记。

| # | 内容 | 本期做法（mock） | 接口替换点（将来做什么） |
|---|------|-----------------|------------------------|
| 1 | 当前账号数据权限值 | `src/constants/data-permission.ts` 导出 mock 常量（默认 `campus`，可手动改四种值自测） | 数据权限随用户信息接口返回后：删常量，`data-permission.ts` store 的 `loadDataPermission()` 改为从用户信息字段解析（字段名与后端对齐），类型仍为本 spec 的 `DataPermissionType` |
| 2 | 数据权限加载时机 | store `loadDataPermission()` 同步赋值 mock | 与用户信息加载合并（`applicationStore.loadInfo()` 之后再读），或后端提供独立接口时改为独立请求 |
| 3 | 菜单/路由资源 | **非 mock**：真实接口 `getUserAppResourceApi`（现状沿用，不改动） | 无 |
| 4 | 页面业务数据 | 本期页面空白，无 mock 数据 | 后续需求在各自 spec 中标注 |

## 5. 影响文件清单

**新增：**

| 文件 | 说明 |
|------|------|
| `src/utils/data-permission.model.ts` | `DataPermissionType` 类型 |
| `src/utils/data-permission.ts` | `hasDataPermission` 偏序判断纯函数 |
| `src/constants/data-permission.ts` | mock 常量（替换点 #1） |
| `src/stores/modules/data-permission.ts` | 数据权限 store（替换点 #2） |
| `src/hooks/use-data-permission.ts` | 权限 hook（新建 `hooks/` 目录） |
| `src/components/data-permission-guard/{data-permission-guard.vue, .model.ts, .scss}` | 守卫组件（标准目录结构） |
| `src/views/plan-lessons/plan-lessons.vue` | 备课组长概览占位页 |

**修改：**

| 文件 | 说明 |
|------|------|
| `src/router/index.ts` | 新增 `plan-lessons` 路由；meta 增加 `dataPermission` 声明（含类型扩展） |
| `src/views/grade-overview/grade-overview.vue` | 内容区用守卫组件包裹 |

**不动：** `principal-cockpit.vue`、按钮权限体系（`permission` store / `utils/permission.ts` / `directives/`）、`app-navigation`、`page-state`、`app-layout`

## 6. 验收标准

1. [x] 访问 `/grade-overview` 与 `/plan-lessons` 正常进入对应页面（不 404、不重定向）——部分受环境限制，见 archive「验证记录」：路由可停留（无登录态早期加载验证），登录态下因后端菜单资源未配置被现有守卫重定向回 `/`（现状行为，非本次引入）
2. [x] mock 常量分别为四种权限值时，两页面的可见/错误提示结果与 §3.1 矩阵完全一致——视觉 8 组合受同上环境限制；判断链路（纯函数 20 组合 + store→hook 10 组合）已在真实页面环境自动化断言 0 失败
3. [x] 有权限时页面显示空白内容区；无权限时显示 `page-state` 错误提示；权限加载中不闪错误提示（`v-else-if="loaded"` 保证；模板逻辑 vue-tsc + 构建校验通过）
4. [x] `principal-cockpit` 页面与其余现有功能行为不变（未删未改，diff 仅涉及 spec §5 清单）
5. [x] 偏序判断 `hasDataPermission` 覆盖 §3.1 矩阵全部分支（含 `current` 为 `null`）——页面内自动化断言 20 组合 0 失败
6. [x] 代码中 mock 处均带 `TODO(1.7.1-接口替换):` 注释，与 §4 表格编号对应（`constants/data-permission.ts` #1、`stores/modules/data-permission.ts` #2）
7. [x] vue-tsc 类型检查 0 error；`pnpm build:data-board:develop` 构建成功（plan-lessons / data-permission-guard chunk 正常产出）

## 7. 交付自检说明

- **一致性自检**：适用。重点：mock 常量切换后两页面行为一致；hook 与 store 判断同源（hook 不重复实现偏序）；加载中/失败态不误显示内容
- **还原度自检**：不适用：无 Figma（原始需求不含 Figma 链接）
