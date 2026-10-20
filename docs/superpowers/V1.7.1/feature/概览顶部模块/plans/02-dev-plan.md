# 临时预览页面 · 实施计划（标准档）

> **For engineer:** 按任务顺序执行；**禁止 git commit**（用户规则：改动留工作区由用户自行提交）。每 Task 做完验证再往下。

**Spec:** [../specs/02-dev-spec.md](../specs/02-dev-spec.md)
**Goal:** 新建 `/principal-cockpit-2`、`/subject-overview-2` 两个临时预览页接入顶部模块，DEV 兜底资源追加，全部带 `TODO(1.7.1-临时预览):` 标记。

---

## Task 1：两个预览页面

> **Skill:** — 无匹配（router.mjs --annotate 同批次输出无建议）

**Files:**

- Create: `apps/data-board/src/views/principal-cockpit-2/principal-cockpit-2.vue` + `.scss`
- Create: `apps/data-board/src/views/subject-overview-2/subject-overview-2.vue` + `.scss`

**Step 1：principal-cockpit-2.vue**（subject-overview-2 同构，替换常量/类名/守卫 required）

```vue
<!-- apps/data-board/src/views/principal-cockpit-2/principal-cockpit-2.vue -->
<template>
  <!-- TODO(1.7.1-临时预览): 同事接入 /principal-cockpit 时删除本页面、对应路由与兜底资源 -->
  <DataPermissionGuard required="campus">
    <div class="principal-cockpit-2">
      <div v-if="ready" class="principal-cockpit-2__top">
        <OverviewFilters v-model="query" :fields="config.fields" :options="options" />
        <OverviewNav :query="query" />
      </div>
      <OverviewStatCards :variant="config.variant" />
    </div>
  </DataPermissionGuard>
</template>

<script setup lang="ts">
import type { DataPermissionType } from '@/utils/data-permission.model'
import DataPermissionGuard from '@/components/data-permission-guard/data-permission-guard.vue'
import OverviewFilters from '@/components/overview-filters/overview-filters.vue'
import OverviewNav from '@/components/overview-nav/overview-nav.vue'
import OverviewStatCards from '@/components/overview-stat-cards/overview-stat-cards.vue'
import { OVERVIEW_PAGE_CONFIGS } from '@/constants/overview'
import { useOverviewQuery } from '@/hooks/use-overview-query'

const PAGE_PERMISSION: DataPermissionType = 'campus'
const config = OVERVIEW_PAGE_CONFIGS[PAGE_PERMISSION]
const { options, query, ready } = useOverviewQuery(config.fields)
</script>

<style scoped lang="scss">
@use './principal-cockpit-2';
</style>
```

**Step 2：样式（四份同构，容器 + 顶部行换行规则）**

```scss
// principal-cockpit-2.scss（subject-overview-2.scss 同构改类名）
.principal-cockpit-2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  min-height: 100%;

  &__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    row-gap: 16px;
  }
}
```

subject-overview-2.vue 差异：`required="campus-stage-subject"`、`PAGE_PERMISSION = 'campus-stage-subject'`、类名 `subject-overview-2`、TODO 文案「同事接入 /subject-overview 时删除」。

**Step 2：验证**

`npx vue-tsc -p tsconfig.app.json --noEmit`（Expected: 0 error）

---

## Task 2：路由注册 + DEV 兜底资源

> **Skill:** — 无匹配

**Files:**

- Modify: `apps/data-board/src/router/index.ts`
- Modify: `apps/data-board/src/constants/dev-menu-fallback.ts`

**Step 1：路由（children 内、plan-lessons 之后追加）**

```ts
// TODO(1.7.1-临时预览): 同事接入正式页面时删除以下两条路由
{
  path: 'principal-cockpit-2',
  name: 'PrincipalCockpit2',
  component: () => import('@/views/principal-cockpit-2/principal-cockpit-2.vue'),
  meta: { title: '校长驾驶舱', dataPermission: 'campus' },
},
{
  path: 'subject-overview-2',
  name: 'SubjectOverview2',
  component: () => import('@/views/subject-overview-2/subject-overview-2.vue'),
  meta: { title: '学科组长概览', dataPermission: 'campus-stage-subject' },
},
```

**Step 2：兜底资源追加**

```ts
// TODO(1.7.1-临时预览): 同事接入正式页面时删除以下两条
{ href: '/principal-cockpit-2', label: '数据看板', page: '校长驾驶舱', buttonList: [] },
{ href: '/subject-overview-2', label: '数据看板', page: '学科组长概览', buttonList: [] },
```

**Step 3：验证**

`npx vue-tsc -p tsconfig.app.json --noEmit`（Expected: 0 error）

---

## Task 3：验证 + 文档

> **Skill:** — 无匹配

**Step 1：浏览器实测（mock 权限切换，spec 演示表）**

1. `campus-grade`（当前 mock）：菜单 4 项；进两预览页显示「无数据权限」
2. mock 改 `campus`：principal-cockpit-2 → 2 筛选 + 4 按钮 + 校长卡（无副标题、指标1无 label）；subject-overview-2 → 4 筛选 + 4 按钮 + 学科组长卡
3. mock 改 `campus-stage-subject`：subject-overview-2 正常（仅教师列表）、principal-cockpit-2 无权限提示
4. mock 恢复 `campus-grade`；原 `/principal-cockpit` 占位不变

**Step 2：文档**

文档仓库模块 `requirements/02-preview-pages.md` 已含背景；交付时归档追加「删除清单」小节（两页面目录、路由两条、兜底资源两条、全局搜索 `TODO(1.7.1-临时预览):`）。
