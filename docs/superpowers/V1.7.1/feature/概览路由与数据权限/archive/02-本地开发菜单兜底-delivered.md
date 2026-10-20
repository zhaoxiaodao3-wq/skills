# 本地开发菜单兜底 · 交付归档

**归档类型：** feature 交付快照（标准档增量，依附于 01 交付）
**归档日期：** 2026-10-16
**版本：** V1.7.1
**Requirement:** [../requirements/02-dev-menu-fallback.md](../requirements/02-dev-menu-fallback.md)
**Spec:** [../specs/02-dev-spec.md](../specs/02-dev-spec.md)
**代码仓库：** `apps-development-platform`（分支 `dev/lianglinbin`）

## 改动摘要

权限接口未就绪（后端未返回 data-board 菜单资源）期间，本地开发看不到任何页面。新增仅 `import.meta.env.DEV`（任意本地 dev 模式，含用户当前的 `dev:test`）且后端资源为空时生效的菜单兜底：菜单出现「数据看板」分组下两个概览页并可进入；构建产物零影响；后端配置资源后自动让位（资源非空不兜底）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `apps/data-board/src/constants/dev-menu-fallback.ts`（接口替换点 #3，`buttonList` 为空不发放按钮权限） |
| 改 | `apps/data-board/src/stores/modules/permission.ts`（`loadResources()` 解析成功后 DEV 且空资源时兜底） |

提交记录：

```
1e42459 feat(data-board): 本地开发菜单兜底（接口替换点 #3）
```

## 验收结果

- [x] 验收 1：浏览器实测（dev:test 模式）菜单「数据看板」分组下「年级长概览」「备课组长概览」可见、可点，点击跳转 `/grade-overview`、`/plan-lessons`，URL 停留不再被重定向
- [x] 验收 2：mock 临时改为 `campus-grade-subject` 时，年级长概览显示「无数据权限 / 当前账号数据权限不足以查看本页内容（所需：校区+年级）」，备课组长概览正常空白；验证后已恢复默认 `campus`
- [x] 验收 3：`pnpm build:data-board:develop` 构建成功（DEV=false 兜底不参与）
- [x] 验收 4：`principal-cockpit` 不在兜底资源中，行为不变；按钮权限体系未发放任何额外权限
- [x] 验收 5：vue-tsc 0 error

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 无业务数据路径；兜底仅影响菜单资源列表，页面内容与数据权限守卫逻辑未改动 |
| 常量/mock/真数据 | 通过 | 兜底常量单文件单点（`dev-menu-fallback.ts`），仅 store 一处消费；菜单与路由守卫同读 `store.resources`，不存在两套判断；带 `TODO(1.7.1-接口替换): [#3]` 标记与 spec 替换点表对应 |
| 多入口 | 通过 | 唯一入口 `loadResources()`；生产构建路径 `DEV=false` 分支不参与打包；后端资源非空时兜底自动让位 |
| 失败/缺省 | 通过 | `loadResources()` 失败路径（catch 清空 resources、loaded=false）未改动；兜底仅在成功解析且为空数组时追加，不掩盖接口失败状态 |

## 还原度自检

不适用：无 Figma / 非 UI（复用现有菜单与 `page-state` 组件，无新视觉）。

## 验证记录

1. vue-tsc 0 error；`pnpm build:data-board:develop` 构建成功。
2. 浏览器实测（用户运行中的 dev:test server，HMR 后整页刷新）：
   - 刷新 `/grade-overview`：URL 停留，菜单出现「数据看板」分组（两项）；
   - 点击「备课组长概览」：`waitForURL(/plan-lessons)` 通过；
   - mock=`campus-grade-subject`：`/grade-overview` main 区显示无权限提示（标题+所需权限中文），`/plan-lessons` main 空（有权限）；
   - mock 恢复 `campus`，工作区无 diff（`git status` 干净）。

## 后续接入

- 替换点 **#3**：后端在 `myAppResource` 为本应用配置 `/grade-overview`、`/plan-lessons` 资源后，删除 `dev-menu-fallback.ts` 与 `permission.ts` 内兜底分支（全局搜索 `TODO(1.7.1-接口替换)` 可见 #1/#2/#3 三处）。

## Harness 闭环

- [x] 标准档暂停点齐备：P1（方案选择）、P2（spec 确认「确认」）、P3（Inline）
- [x] spec 验收项已勾选（5/5）
- [x] 一致性自检已完成并写入本 archive
- [x] 还原度自检已注明不适用
- [x] 本 archive 交付快照已写
- [x] `pnpm harness:status` / `harness:check` 机械门禁不可用（frontend-local 无脚本），阶段由 Agent 层手动等价执行
- [x] 未 push（用户未要求）
