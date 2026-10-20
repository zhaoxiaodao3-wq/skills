# 概览路由与数据权限 · 实施计划

> **For engineer:** 按任务顺序执行；每完成一个 Task 即 commit。**禁止**跳步 / 合并跳步。执行方式（Inline / Subagent-Driven）以 P3 用户确认为准。
> **业务上下文：** `apps-development-platform/apps/data-board`（数据看板 · port 8102 · base `/data-board-app/`）
> **注意：** vue / vue-router API 由 Vite Auto Import 自动导入，**禁止手动 import**（`computed`、`ref`、`useRoute` 等直接用）；业务组件放 `src/components` 并按标准目录结构。

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Goal:** 建立两个概览页路由（`/grade-overview` 已有、`/plan-lessons` 新增）与数据权限体系（四种权限偏序判断 + mock + hook + 守卫组件），页面内容本期空白，无权限时展示错误提示；所有 mock 点带 `TODO(1.7.1-接口替换)` 标记。

**Architecture:**

- 数据权限独立一套：`utils` 纯函数（偏序判断）→ `constants`（mock 常量，替换点 #1）→ `stores/modules/data-permission`（加载单点，替换点 #2）→ `hooks/use-data-permission`（组件侧唯一入口）→ `components/data-permission-guard`（页面级守卫，复用 `page-state` 显示错误提示）
- 不动按钮/菜单权限体系（`permission` store、`utils/permission.ts`、`directives/`）、路由守卫重定向逻辑、`principal-cockpit`
- 路由 meta 声明页面所需权限（声明点，非拦截点）

**Tech Stack:** Vue 3 + TypeScript + Pinia + Element Plus（`el-result`，经 `page-state` 复用）· 无新增依赖

**Mock/接口替换点总表：** 见 spec §4；代码中标记格式 `// TODO(1.7.1-接口替换):`（编号对应 spec 表格）。

---

## Task 1：数据权限类型与偏序判断纯函数

> **Skill:** — 无匹配 · 置信度 —
> **理由:**（人工测评）纯 TS 类型与纯函数，无 UI、无渲染、无图表；路由图 14 个 skill 均不适用

**Files:**

- Create: `apps/data-board/src/utils/data-permission.model.ts`
- Create: `apps/data-board/src/utils/data-permission.ts`

**Step 1：写类型定义**

```ts
// apps/data-board/src/utils/data-permission.model.ts

/** 数据权限类型：值与后端对齐前为前端约定（对齐时仅需改本文件与 mock 常量）。 */
export type DataPermissionType
  = 'campus' // 校区
  | 'campus-grade' // 校区+年级
  | 'campus-stage-subject' // 校区+学段+科目
  | 'campus-grade-subject' // 校区+年级+科目
```

**Step 2：写偏序判断函数**

```ts
// apps/data-board/src/utils/data-permission.ts

import type { DataPermissionType } from './data-permission.model'

/**
 * 「持有同权限或更高级权限」判断。
 * 偏序（高 → 低）：campus > campus-grade / campus-stage-subject > campus-grade-subject；
 * campus-grade 与 campus-stage-subject 互不覆盖。
 * current 为 null（未加载/加载失败）时一律不可见。
 */
export function hasDataPermission(
  current: DataPermissionType | null,
  required: DataPermissionType,
) {
  if (!current) {
    return false
  }
  if (current === required) {
    return true
  }
  if (current === 'campus') {
    return true
  }
  if (required === 'campus-grade-subject'
    && (current === 'campus-grade' || current === 'campus-stage-subject')) {
    return true
  }
  return false
}
```

**Step 3：commit**

```bash
git add apps/data-board/src/utils/data-permission.model.ts apps/data-board/src/utils/data-permission.ts
git commit -m "feat(data-board): 数据权限类型与偏序判断纯函数"
```

---

## Task 2：mock 常量（接口替换点 #1）

> **Skill:** — 无匹配 · 置信度 —
> **理由:**（人工测评）纯常量数据，无 UI；无适用 skill

**Files:**

- Create: `apps/data-board/src/constants/data-permission.ts`

**Step 1：写 mock 常量**

```ts
// apps/data-board/src/constants/data-permission.ts

import type { DataPermissionType } from '@/utils/data-permission.model'

/**
 * TODO(1.7.1-接口替换): [#1]
 * 当前账号数据权限 mock。四种值可改自测：
 * 'campus' | 'campus-grade' | 'campus-stage-subject' | 'campus-grade-subject'
 * 接口就绪后删除本常量，改由 data-permission store 从用户信息字段解析
 * （见 specs/01-dev-spec.md §4 替换点 #1/#2）。
 */
export const MOCK_DATA_PERMISSION: DataPermissionType = 'campus'
```

**Step 2：commit**

```bash
git add apps/data-board/src/constants/data-permission.ts
git commit -m "feat(data-board): 数据权限 mock 常量（接口替换点 #1）"
```

---

## Task 3：数据权限 store（接口替换点 #2）

> **Skill:** — 无匹配 · 置信度 —
> **理由:**（人工测评）Pinia store 样板逻辑，无 UI；无适用 skill

**Files:**

- Create: `apps/data-board/src/stores/modules/data-permission.ts`

**Step 1：写 store**

```ts
// apps/data-board/src/stores/modules/data-permission.ts

import type { DataPermissionType } from '@/utils/data-permission.model'
import { MOCK_DATA_PERMISSION } from '@/constants/data-permission'
import { defineStore } from 'pinia'

/**
 * 数据权限 store：与 usePermissionStore（按钮/菜单权限）来源不同，故分离。
 * 与用户信息的关系见 spec §1.5 / §4 替换点 #2。
 */
export const useDataPermissionStore = defineStore('data-board-data-permission', () => {
  const permissionType = ref<DataPermissionType | null>(null)
  const loaded = ref(false)

  /** TODO(1.7.1-接口替换): [#2] 本期同步读 mock；接口就绪后改为从用户信息返回的数据权限字段解析。 */
  function loadDataPermission() {
    permissionType.value = MOCK_DATA_PERMISSION
    loaded.value = true
  }

  return { permissionType, loaded, loadDataPermission }
})
```

**Step 2：commit**

```bash
git add apps/data-board/src/stores/modules/data-permission.ts
git commit -m "feat(data-board): 数据权限 store（mock 加载单点）"
```

---

## Task 4：useDataPermission hook（新建 `src/hooks/`）

> **Skill:** — 无匹配 · 置信度 —
> **理由:**（人工测评）Vue composable 样板；路由图无 composable 类 skill

**Files:**

- Create: `apps/data-board/src/hooks/use-data-permission.ts`

**Step 1：写 hook**

```ts
// apps/data-board/src/hooks/use-data-permission.ts

import type { DataPermissionType } from '@/utils/data-permission.model'
import { hasDataPermission } from '@/utils/data-permission'
import { useDataPermissionStore } from '@/stores/modules/data-permission'
import { tryOnMounted } from '@vueuse/core'

/**
 * 数据权限 hook：组件侧唯一权限入口，后续接口请求的权限判断/参数组装
 * 统一走本 hook，禁止直接 import mock 常量。
 */
export function useDataPermission(required?: DataPermissionType) {
  const store = useDataPermissionStore()

  tryOnMounted(() => {
    if (!store.loaded) {
      store.loadDataPermission()
    }
  })

  const permissionType = computed(() => store.permissionType)
  const loaded = computed(() => store.loaded)
  const hasPermission = computed(() =>
    required ? hasDataPermission(store.permissionType, required) : Boolean(store.permissionType),
  )

  return { permissionType, loaded, hasPermission }
}
```

> 注：若 `@vueuse/core` 未在该 app 依赖中，用 `onMounted`（Auto Import）替换 `tryOnMounted`，其余不变。

**Step 2：确认依赖**

```bash
grep -E '"@vueuse/core"' "E:\code\dataView\apps-development-platform\apps\data-board\package.json" || grep -E '"@vueuse/core"' "E:\code\dataView\apps-development-platform\packages\utils\package.json"
```

Expected: 有输出则用 `tryOnMounted`；无则用 `onMounted`。

**Step 3：commit**

```bash
git add apps/data-board/src/hooks/use-data-permission.ts
git commit -m "feat(data-board): useDataPermission hook"
```

---

## Task 5：守卫组件 data-permission-guard

> **Skill:** — 无匹配 · 置信度 —
> **理由:**（人工测评）Element Plus 经 page-state 间接复用，无 Figma、无样式还原诉求（页面空白期）；frontend-design 不适用（非视觉设计任务）

**Files:**

- Create: `apps/data-board/src/components/data-permission-guard/data-permission-guard.model.ts`
- Create: `apps/data-board/src/components/data-permission-guard/data-permission-guard.data.ts`
- Create: `apps/data-board/src/components/data-permission-guard/data-permission-guard.vue`
- Create: `apps/data-board/src/components/data-permission-guard/data-permission-guard.scss`

**Step 1：类型定义**

```ts
// apps/data-board/src/components/data-permission-guard/data-permission-guard.model.ts

import type { DataPermissionType } from '@/utils/data-permission.model'

export interface DataPermissionGuardProps {
  /** 页面/内容所需数据权限。 */
  required: DataPermissionType
}
```

**Step 2：静态数据（权限中文标签）**

```ts
// apps/data-board/src/components/data-permission-guard/data-permission-guard.data.ts

/** 数据权限类型的中文标签，用于错误提示文案。 */
export const DATA_PERMISSION_LABELS: Record<string, string> = {
  'campus': '校区',
  'campus-grade': '校区+年级',
  'campus-stage-subject': '校区+学段+科目',
  'campus-grade-subject': '校区+年级+科目',
}
```

**Step 3：组件主体**

```vue
<!-- apps/data-board/src/components/data-permission-guard/data-permission-guard.vue -->
<template>
  <slot v-if="hasPermission" />
  <div v-else-if="loaded" class="data-permission-guard">
    <page-state
      title="无数据权限"
      :description="`当前账号数据权限不足以查看本页内容（所需：${requiredLabel}）`"
    />
  </div>
</template>

<script setup lang="ts">
import type { DataPermissionGuardProps } from './data-permission-guard.model'
import PageState from '@/components/page-state/page-state.vue'
import { useDataPermission } from '@/hooks/use-data-permission'
import { DATA_PERMISSION_LABELS } from './data-permission-guard.data'

const props = defineProps<DataPermissionGuardProps>()

const { hasPermission, loaded } = useDataPermission(props.required)
const requiredLabel = computed(() => DATA_PERMISSION_LABELS[props.required] ?? '未知')
</script>

<style scoped lang="scss">
@use './data-permission-guard';
</style>
```

**Step 4：样式文件（占位，BEM）**

```scss
// apps/data-board/src/components/data-permission-guard/data-permission-guard.scss

.data-permission-guard {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}
```

**Step 5：commit**

```bash
git add apps/data-board/src/components/data-permission-guard
git commit -m "feat(data-board): 数据权限守卫组件"
```

---

## Task 6：路由 meta 声明与 plan-lessons 路由

> **Skill:** — 无匹配 · 置信度 —
> **理由:**（人工测评）vue-router 配置；无适用 skill

**Files:**

- Modify: `apps/data-board/src/router/index.ts`

**Step 1：扩展 RouteMeta 类型声明**

```ts
declare module 'vue-router' {
  interface RouteMeta {
    /** 详情页的按钮权限可显式绑定所属菜单的资源路径。 */
    permissionPath?: string
    /** 页面所需数据权限（声明点；拦截在页面守卫组件，不做路由重定向）。 */
    dataPermission?: DataPermissionType
  }
}
```

（顶部补 `import type { DataPermissionType } from '@/utils/data-permission.model'`）

**Step 2：新增路由 + 现有路由补 meta**

```ts
{
  path: 'grade-overview',
  name: 'GradeOverview',
  component: () => import('@/views/grade-overview/grade-overview.vue'),
  meta: { title: '年级长概览', dataPermission: 'campus-grade' },
},
{
  path: 'plan-lessons',
  name: 'PlanLessons',
  component: () => import('@/views/plan-lessons/plan-lessons.vue'),
  meta: { title: '备课组长概览', dataPermission: 'campus-grade-subject' },
},
```

`principal-cockpit` 路由**一行不动**。

**Step 3：commit**

```bash
git add apps/data-board/src/router/index.ts
git commit -m "feat(data-board): 备课组长概览路由与数据权限 meta 声明"
```

---

## Task 7：两个概览页面接入守卫

> **Skill:** — 无匹配 · 置信度 —
> **理由:**（人工测评）占位页面样板；无适用 skill

**Files:**

- Modify: `apps/data-board/src/views/grade-overview/grade-overview.vue`
- Create: `apps/data-board/src/views/plan-lessons/plan-lessons.vue`

**Step 1：grade-overview.vue**

```vue
<!-- apps/data-board/src/views/grade-overview/grade-overview.vue -->
<template>
  <DataPermissionGuard required="campus-grade">
    <!-- TODO(1.7.1-业务): 页面业务内容后续需求实现，本期空白。 -->
    <div class="grade-overview" />
  </DataPermissionGuard>
</template>

<script setup lang="ts">
import DataPermissionGuard from '@/components/data-permission-guard/data-permission-guard.vue'
</script>
```

**Step 2：plan-lessons.vue**（同构，`required="campus-grade-subject"`，类名 `plan-lessons`）

**Step 3：commit**

```bash
git add apps/data-board/src/views/grade-overview/grade-overview.vue apps/data-board/src/views/plan-lessons/plan-lessons.vue
git commit -m "feat(data-board): 两个概览页接入数据权限守卫"
```

---

## Task 8：自测矩阵验证 + 编译校验收尾

> **Skill:** — 无匹配 · 置信度 —
> **理由:**（人工测评）验证收尾；无适用 skill

**Step 1：启动开发服务**

```bash
pnpm dev:data-board
```

Expected: http://localhost:8102/data-board-app/ 可打开。

**Step 2：权限矩阵人工验证（spec §3.1 矩阵 8 组合）**

逐次修改 `constants/data-permission.ts` 的 `MOCK_DATA_PERMISSION` 并刷新验证：

| mock 值 | /grade-overview | /plan-lessons |
|---|---|---|
| campus | 正常空白页 | 正常空白页 |
| campus-grade | 正常空白页 | 错误提示 |
| campus-stage-subject | 错误提示 | 正常空白页 |
| campus-grade-subject | 错误提示 | 正常空白页 |

另验证：`principal-cockpit` 行为不变；菜单仍只渲染后端返回资源（本地新路由不出现在菜单）。

**Step 3：类型检查与构建**

```bash
pnpm -C apps/data-board exec vue-tsc -p tsconfig.app.json --noEmit
pnpm build:data-board:develop
```

Expected: 类型检查 0 error（仅统计本需求新增文件相关；存量错误先记录再判断是否顺手修复需请示）、构建成功。

**Step 4：commit 收尾（如有遗留文件）+ 进入交付自检（spec §7：一致性自检适用 / 还原度自检不适用）**

```bash
git add -A apps/data-board
git commit -m "feat(data-board): 概览路由与数据权限收尾"
```

> 用户未要求时不自动 push。
