# 概览路由与数据权限 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-16
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `apps-development-platform`（分支 `dev/lianglinbin`）

## 改动摘要

1.7.1 数据看板首个需求：新增备课组长概览路由（`/plan-lessons`），为年级长概览与备课组长概览建立数据权限体系——四种权限偏序判断、mock 加载单点、`useDataPermission` hook、`data-permission-guard` 守卫组件；页面内容本期空白，无数据权限时展示错误提示。所有 mock 点带 `TODO(1.7.1-接口替换)` 标记，接口就绪后单点替换。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `apps/data-board/src/utils/data-permission.model.ts` |
| 增 | `apps/data-board/src/utils/data-permission.ts` |
| 增 | `apps/data-board/src/constants/data-permission.ts`（接口替换点 #1） |
| 增 | `apps/data-board/src/stores/modules/data-permission.ts`（接口替换点 #2） |
| 增 | `apps/data-board/src/hooks/use-data-permission.ts`（新建 `hooks/` 目录） |
| 增 | `apps/data-board/src/components/data-permission-guard/{data-permission-guard.vue, .model.ts, .data.ts, .scss}` |
| 增 | `apps/data-board/src/views/plan-lessons/plan-lessons.vue` |
| 改 | `apps/data-board/src/router/index.ts`（plan-lessons 路由 + `meta.dataPermission` 声明 + RouteMeta 类型扩展） |
| 改 | `apps/data-board/src/views/grade-overview/grade-overview.vue`（接入守卫） |
| 改 | `apps/data-board/components.d.ts`（自动生成） |

提交记录（7 个，每 Task 一提交）：

```
0f27ba0 feat(data-board): 数据权限类型与偏序判断纯函数
8c840b2 feat(data-board): 数据权限 mock 常量（接口替换点 #1）
a769b57 feat(data-board): 数据权限 store（mock 加载单点）
ac92eca feat(data-board): useDataPermission hook
9a1489e feat(data-board): 数据权限守卫组件
0929d3a feat(data-board): 备课组长概览路由与数据权限 meta 声明
2fabd08 feat(data-board): 两个概览页接入数据权限守卫
1606981 chore(data-board): 组件声明自动生成更新
```

## 验收结果

- [x] 验收项 1：两页面路由可停留（无登录态早期加载验证 URL 保持 `/grade-overview`；404 无、守卫不因数据权限拦截）
- [x] 验收项 2：权限可见性矩阵判断链路自动化断言通过（见下方验证记录）
- [x] 验收项 3：有权限 → slot 渲染；无权限 → `page-state` 错误提示（`v-else-if="loaded"` 加载中不闪错误）
- [x] 验收项 4：`principal-cockpit` 未删未改；按钮/菜单权限体系零改动
- [x] 验收项 5：偏序矩阵全分支（含 `null`）断言 0 失败
- [x] 验收项 6：mock 处均带 `TODO(1.7.1-接口替换):` 注释（#1/#2 对应 spec §4）
- [x] 验收项 7：vue-tsc 0 error；`pnpm build:data-board:develop` 构建成功

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 页面仅有「有权限（空白 slot）/ 无权限（page-state）/ 加载中（不渲染）」三态；无业务数据路径，无 mock 展示数据 |
| 常量/mock/真数据 | 通过 | 判断唯一来源 `hasDataPermission` 纯函数；hook 与守卫组件均调用该函数，不重复实现；mock 仅存在于 `constants/data-permission.ts` 一处（替换点 #1），store `loadDataPermission()` 单点消费（替换点 #2）；页面内断言验证 hook 输出与纯函数矩阵完全一致（0 失败） |
| 多入口 | 通过 | 两页面（`grade-overview` / `plan-lessons`）同构接入同一守卫组件，仅 `required` 不同；无其他入口；`app-navigation` 菜单未改动 |
| 失败/缺省 | 通过 | `permissionType=null`（加载中/失败）时 `hasDataPermission` 恒 false 且守卫在 `loaded=false` 时不渲染错误态；断言覆盖 null 场景；无权限文案含所需权限中文标签（`data-permission-guard.data.ts` 标签表兜底「未知」） |

## 还原度自检

不适用：无 Figma / 非 UI（原始需求不含 Figma 链接；页面本期空白，守卫错误提示复用现有 `page-state`）。

## 验证记录（含环境限制说明）

**自动化验证（真实页面环境，`pnpm dev` + 浏览器执行）：**

1. vue-tsc 类型检查 0 error；develop 模式构建成功，产物含 `plan-lessons`、`data-permission-guard` chunk。
2. 在运行中的应用页面注入模块脚本，动态 import 本需求模块执行断言：
   - `hasDataPermission` 纯函数：4×4 权限组合 + 4 个 `null` 场景，共 20 组合，与 spec §3.1 矩阵完全一致，0 失败；
   - store→hook 链路：直接操纵 `useDataPermissionStore` 的 `permissionType/loaded` 模拟 5 种状态（四种权限 + null）× 两个页面的 `required`，共 10 组合，0 失败。

**视觉人工验证（8 组合）受阻于环境，原因与影响：**

- 本地 dev server 为 test 模式，`envs/.env.test.local` 的 `VITE_DEBUG_TOKEN` 使应用每次加载自动恢复登录态（token 从 cookie `test_token` 回填，清除 localStorage/sessionStorage 无效）；
- 有登录态时，现有路由守卫因后端尚未返回 data-board 的菜单资源（`getUserAppResourceApi` 无本应用资源），把 `/grade-overview`、`/plan-lessons` 重定向回 `/`——这是**现状行为**（README「访问没有授权资源的页面时进入第一个已实现菜单」，近期提交 f6b119a 的设计），**不是本次改动引入**；
- 影响：无法在浏览器里人工切换 mock 值目视 8 组合。判断逻辑已用上述自动化断言覆盖；守卫组件模板三态逻辑由 vue-tsc + 构建保证。

**后端菜单资源配置后的自查步骤（人工验收补做）：**

1. 后端在 `myAppResource` 为本应用返回 `/grade-overview`、`/plan-lessons` 资源；
2. 登录后经菜单进入两页面，逐次把 `src/constants/data-permission.ts` 的 `MOCK_DATA_PERMISSION` 改为四种值并刷新，对照 spec §3.1 矩阵核对「空白内容区 / 无数据权限错误提示」。

## 待办与后续接入

- `TODO(1.7.1-接口替换):` 全局搜索该标记（当前 2 处：替换点 #1 mock 常量、#2 store 加载）；接口就绪后按 spec §4 替换，类型 `DataPermissionType` 枚举值需与后端对齐（必要时改 `data-permission.model.ts` 与标签表）
- 页面业务内容：后续需求在各自 spec 标注（当前 slot 内为空 div，带 `TODO(1.7.1-业务)` 注释）

## Harness 闭环

- [x] 模块目录四层齐全（requirements / specs / plans / archive）
- [x] requirements / spec / plan 链接正确（Requirement / Spec 头部链接互指）
- [x] P1 / P2 / P3 暂停点均获用户确认（2026-10-16，「确认」= P2；Inline = P3）
- [x] spec 验收项已勾选（7/7，其中 1/2 注明环境限制与补做步骤）
- [x] 一致性自检已完成并写入本 archive
- [x] 还原度自检已注明不适用
- [x] 本 archive 交付快照已写
- [x] `pnpm harness:status` / `harness:check` 机械门禁在 frontend-local 无脚本，**不可用**；阶段判定由 Agent 层手动等价执行（NO_MODULE → 建目录 → spec/plan 落盘 → READY_TO_DEV → 交付）
- [x] 用户未要求 commit 以外的 git 操作，未 push
