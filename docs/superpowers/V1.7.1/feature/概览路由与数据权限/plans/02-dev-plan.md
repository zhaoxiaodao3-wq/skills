# 本地开发菜单兜底 · 实施计划（标准档）

> **For engineer:** 按任务顺序执行；每完成一个 Task 即 commit。执行方式（Inline / SDD）以 P3 确认为准。
> **业务上下文：** `apps-development-platform/apps/data-board`（port 8102）；vue/vue-router API 自动导入，禁止手动 import。

**Spec:** [../specs/02-dev-spec.md](../specs/02-dev-spec.md)
**Goal:** 本地 dev（任意 mode）且后端菜单资源为空时，菜单与路由守卫使用两条本地兜底资源，让 `/grade-overview`、`/plan-lessons` 可见可进；构建产物零影响。

**Architecture:** 兜底常量放 `src/constants/dev-menu-fallback.ts`；`permission` store 的 `loadResources()` 在解析成功后按 `import.meta.env.DEV && resources.length === 0` 接线——菜单与守卫同读 `store.resources`，单一改动点。

---

## Task 1：兜底常量 + store 接线

> **Skill:** — 无匹配 · 置信度 —
> **理由:**（人工测评）静态常量 + store 一行条件；路由图无适用 skill（router.mjs --annotate 同样输出无需 skill）

**Files:**

- Create: `apps/data-board/src/constants/dev-menu-fallback.ts`
- Modify: `apps/data-board/src/stores/modules/permission.ts`

**Step 1：兜底常量**

```ts
// apps/data-board/src/constants/dev-menu-fallback.ts

import type { ApplicationResource } from '@/utils/permission.model'

/**
 * TODO(1.7.1-接口替换): [#3]
 * 本地开发菜单兜底：仅在 import.meta.env.DEV（任意本地 dev 模式）且后端
 * myAppResource 返回资源为空时生效，构建产物不参与。
 * 后端配置本应用菜单资源后删除本文件与 permission store 内引用。
 * buttonList 保持为空，不通过兜底发放任何按钮权限。
 */
export const DEV_FALLBACK_RESOURCES: ApplicationResource[] = [
  { href: '/grade-overview', label: '数据看板', page: '年级长概览', buttonList: [] },
  { href: '/plan-lessons', label: '数据看板', page: '备课组长概览', buttonList: [] },
]
```

**Step 2：store 接线**（`loadResources()` 成功赋值后追加）

```ts
// apps/data-board/src/stores/modules/permission.ts
// 顶部新增：
import { DEV_FALLBACK_RESOURCES } from '@/constants/dev-menu-fallback'

// loadResources() 内，resources.value = parseApplicationResources(result.data) 之后：
// TODO(1.7.1-接口替换): [#3] 仅本地开发且后端资源为空时兜底菜单；后端配置后自动让位。
if (import.meta.env.DEV && resources.value.length === 0) {
  resources.value = DEV_FALLBACK_RESOURCES
}
```

**Step 3：commit**

```bash
git add apps/data-board/src/constants/dev-menu-fallback.ts apps/data-board/src/stores/modules/permission.ts
git commit -m "feat(data-board): 本地开发菜单兜底（接口替换点 #3）"
```

---

## Task 2：验证 + 收尾

> **Skill:** — 无匹配 · 置信度 —

**Step 1：本地验证（用户当前 dev:test server 已在跑，HMR 生效；必要时刷新页面）**

- 菜单出现「数据看板」分组下「年级长概览」「备课组长概览」两项，可点击进入
- 访问 `/` 自动跳转 `/grade-overview`
- 进入页面：mock=`campus` → 空白内容区；把 `constants/data-permission.ts` 的 `MOCK_DATA_PERMISSION` 改为 `campus-grade-subject` → 年级长概览显示「无数据权限」错误提示
- `/principal-cockpit` 不在菜单，直接访问仍被守卫重定向

**Step 2：类型检查与构建**

```bash
pnpm -C apps/data-board exec vue-tsc -p tsconfig.app.json --noEmit
pnpm build:data-board:develop
```

Expected: 0 error；构建成功。

**Step 3：交付自检（一致性适用 / 还原度不适用）→ 追加写 02 归档快照**
