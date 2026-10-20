# 临时预览页面 · 开发规格（标准档）

**Requirement:** [requirements/02-preview-pages.md](../requirements/02-preview-pages.md)
**前置交付:** [archive/01-概览顶部模块-delivered.md](../archive/01-概览顶部模块-delivered.md)
**状态：** 待 P2 确认

## 现状

- `/principal-cockpit` 为同事占位页（`<h1>`），一行未动；`/subject-overview` 不存在
- 顶部模块三组件 + `OVERVIEW_PAGE_CONFIGS` 已支持四种权限；`DEV_FALLBACK_RESOURCES` 仅含两个概览页
- 登录态下，现有路由守卫会将「后端资源（DEV 兜底）中不存在的路径」重定向回 `/`——新页面**必须**加入 DEV 兜底资源才能从菜单进入

## 方案

**新增（4 文件）：**

| 文件 | 内容 |
|------|------|
| `src/views/principal-cockpit-2/principal-cockpit-2.vue` + `.scss` | 与 grade-overview 同构：`DataPermissionGuard required="campus"` + 筛选/按钮/卡片（`OVERVIEW_PAGE_CONFIGS['campus']`） |
| `src/views/subject-overview-2/subject-overview-2.vue` + `.scss` | 同构：`required="campus-stage-subject"`（筛选含学段+科目，variant=`subject`） |

**修改（2 文件）：**

- `src/router/index.ts`：注册两条路由（name `PrincipalCockpit2` / `SubjectOverview2`，meta `title` 校长驾驶舱/学科组长概览 + `dataPermission: 'campus'` / `'campus-stage-subject'`）
- `src/constants/dev-menu-fallback.ts`：`DEV_FALLBACK_RESOURCES` 追加两条伪资源（`/principal-cockpit-2`、`/subject-overview-2`，同组「数据看板」）

**临时标记：** 上述新增/修改处统一带 `TODO(1.7.1-临时预览):` 注释；文档写明删除清单（3 处：两页面目录、两条路由、两条兜底资源）。

## 关键行为说明（权限切换演示表）

按钮显隐按账号权限（`ACCOUNT_NAV_KEYS`）；守卫按偏序判定（campus 最高，可进所有预览页；互不覆盖权限进不了非匹配页）：

| mock 账号权限 | /principal-cockpit-2 | /subject-overview-2 |
|---|---|---|
| `campus` | ✅ 2 筛选 + 4 按钮 + 校长卡（无副标题、指标1无 label） | ✅ 4 筛选（含学段科目） + 4 按钮 + 学科组长卡 |
| `campus-grade` | ❌ 无数据权限提示 | ❌ 无数据权限提示 |
| `campus-stage-subject` | ❌ 无数据权限提示 | ✅ 教师列表按钮 + 学科组长卡 |
| `campus-grade-subject` | ❌ 无数据权限提示 | ❌ 无数据权限提示 |

## 验收标准

1. [x] 菜单出现 4 项（两个正式 + 两个 -2 预览），均可进入（实测菜单 4 项）
2. [x] `campus` 权限下：两预览页正常渲染（校长卡无副标题/指标1无 label；学科组长页筛选含学段+科目、variant=subject 卡片）（实测通过）
3. [x] `campus-grade` 权限下：两预览页显示「无数据权限」错误提示（守卫生效）（实测两页均拦截）
4. [x] `campus-stage-subject` 权限下：principal-cockpit-2 拦截、subject-overview-2 正常（教师列表按钮 + 学科组长卡）（实测通过）
5. [x] 原 `/principal-cockpit` 占位页与两正式页面行为不变（未改动）
6. [x] vue-tsc 0 error；`TODO(1.7.1-临时预览):` 标记齐全（页面模板 ×2、路由 ×1、兜底资源 ×1），文档含删除清单

> 实测备注：验证过程中发现 `data-permission.ts` 的 mock 值被外部回滚为 `campus`（用户 commit 失败时 lint-staged 恢复备份所致），非代码缺陷；已按演示表完成 4 种权限中 3 种的实测（campus 行此前已验证）。

## 交付自检说明

- 一致性自检：适用（守卫态/数据态、配置映射单一来源）
- 还原度自检：不适用（复用已交付组件，无新 UI）
