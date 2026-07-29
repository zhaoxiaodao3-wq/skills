# 教师列表组件 — 接口适配实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 将教师列表组件从 Mock 切换为 `querySchoolUserPage` 真实接口，保持 UI 与交互不变。

**Architecture:** 新增 `teacher-list-api.ts` 封装请求与字段映射；`TeacherListContainer.vue` 替换 Mock 调用，保留搜索/分页/重置/选首条逻辑。

**Tech Stack:** Vue 3 + TypeScript + `service.schoolNew.querySchoolUserPage`

**前置依赖：** ui-style 阶段已交付 `TeacherListContainer` / `TeacherListView`（Mock 联调完成）

---

## 文件变更一览

| 操作 | 路径 |
|------|------|
| 新建 | `src/pages/school/teacher-portrait/components/teacher-list/teacher-list-api.ts` |
| 修改 | `src/pages/school/teacher-portrait/components/teacher-list/TeacherListContainer.vue` |
| 不变 | `TeacherListView.vue`、`types.ts`、`mock/teacher-list.mock.ts` |

---

### Task 1: 新增 teacher-list-api.ts

**Files:**
- Create: `src/pages/school/teacher-portrait/components/teacher-list/teacher-list-api.ts`

- [x] **Step 1: 创建适配层文件**

```ts
import type {
  TeacherListItem,
  TeacherListQuery,
  TeacherListResult,
} from './types'
import { isTeacherPortraitDebugEmpty } from '../../composables/teacher-portrait-debug'

export type TeacherListFetchContext = {
  querySchoolUserPage: (params: {
    page: number
    size: number
    tenantId: string
    userName?: string
  }) => Promise<{ list?: Record<string, any>[]; total?: number }>
  tenantId: string
}

export function mapTeacherListItem(
  raw: Record<string, any>,
): TeacherListItem | null {
  const id = String(raw.id ?? '').trim()
  if (!id) return null

  const name = raw.userName ?? ''
  const subject = raw.mainSubjectName ?? null

  return {
    id,
    name: String(name).trim(),
    subject: subject == null || subject === '' ? null : String(subject),
  }
}

export function mapTeacherListPageResponse(
  response: { list?: Record<string, any>[]; total?: number } | null | undefined,
): TeacherListResult {
  const list = response?.list ?? []
  const records = list
    .map(mapTeacherListItem)
    .filter((item): item is TeacherListItem => item != null)

  return {
    records,
    total: response?.total ?? 0,
  }
}

export async function fetchTeacherListPageData(
  query: TeacherListQuery,
  ctx: TeacherListFetchContext,
): Promise<TeacherListResult> {
  if (isTeacherPortraitDebugEmpty()) {
    return { records: [], total: 0 }
  }

  const keyword = query.keyword?.trim()
  const response = await ctx.querySchoolUserPage({
    page: query.page,
    size: query.pageSize,
    tenantId: ctx.tenantId,
    ...(keyword ? { userName: keyword } : {}),
  })

  return mapTeacherListPageResponse(response)
}
```

- [x] **Step 2: 运行 typecheck 确认新文件无类型错误**

Run: `pnpm exec vue-tsc -b --pretty false 2>&1 | Select-String -Pattern "teacher-list-api"`

Expected: 无匹配输出（或仅有无关错误）

---

### Task 2: 修改 TeacherListContainer.vue

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teacher-list/TeacherListContainer.vue`

- [x] **Step 1: 替换 import 并注入 service / userSession**

将 `<script setup>` 顶部 Mock import 替换为：

```ts
import { fetchTeacherListPageData } from './teacher-list-api'
import TeacherListView from './TeacherListView.vue'
import type { TeacherListItem } from './types'
import { TEACHER_LIST_PAGE_SIZE } from './types'
import { useTeacherPortraitContext } from '../../composables/useTeacherPortraitContext'
```

在 `const { debugDataMode } = useTeacherPortraitContext()` 之后添加：

```ts
const service = useService()
const { userInfo } = useUserSession()

function getFetchContext() {
  return {
    querySchoolUserPage: service.schoolNew.querySchoolUserPage,
    tenantId: userInfo.value?.tenantId ?? '',
  }
}
```

- [x] **Step 2: 改写 loadList 并补充 catch**

将整个 `loadList` 函数替换为：

```ts
async function loadList(options?: { selectFirst?: boolean }) {
  loading.value = true
  try {
    const result = await fetchTeacherListPageData(
      {
        page: page.value,
        pageSize: TEACHER_LIST_PAGE_SIZE,
        keyword: appliedKeyword.value || undefined,
      },
      getFetchContext(),
    )
    items.value = result.records
    total.value = result.total

    if (result.total === 0) {
      emit('listEmpty')
      return
    }

    if (
      (options?.selectFirst || !props.selectedTeacherId) &&
      result.records.length > 0
    ) {
      emit('select', result.records[0].id)
    }
  } catch {
    items.value = []
    total.value = 0
    emit('listEmpty')
  } finally {
    loading.value = false
  }
}
```

- [x] **Step 3: 确认其余 handler 不变**

以下函数保持现有实现，无需修改：
- `handleSearch`
- `handleReset`
- `handlePageChange`
- `handleSelect`
- `onMounted(() => loadList())`
- `watch(debugDataMode, ...)`

- [x] **Step 4: 运行 typecheck**

Run: `pnpm exec vue-tsc -b --pretty false 2>&1 | Select-String -Pattern "teacher-list|TeacherList"`

Expected: 无 type error

---

### Task 3: 联调验收

**Files:** 无代码变更

- [ ] **Step 1: 启动 dev 环境**

Run: `pnpm dev:test`（或项目常用 test 环境）

- [ ] **Step 2: 以校级管理员 / 管理员身份进入教师画像页**

路径：`/classroom-app/school/teacher-portrait/teacher-portrait`

验证：
- 左栏展示真实教师列表（姓名、科目）
- 默认选中首条，右侧有数据

- [ ] **Step 3: 验证搜索**

- 输入姓名 → 查询 → Network 出现 `schoolUserPage` 且带 `userName`
- 空关键词查询 → 不带 `userName`，回第一页

- [ ] **Step 4: 验证分页**

- 总数 > 10 时分页器可用
- 翻页重新请求 `schoolUserPage`，`page` 递增

- [ ] **Step 5: 验证重置与空态**

- 重置 → 搜索框清空、回第一页、选中首条
- `RoleDebugBar` 切「缺省数据」→ 空态「查无此人」，无接口请求

- [x] **Step 6: 更新 requirements 验收标准（交付时）**

将 `requirements/原始需求.md` §八 勾选 `[x]`，spec §10 同步勾选。

---

## Plan Self-Review

| Spec 章节 | 对应 Task |
|-----------|-----------|
| §4 接口契约 | Task 1 |
| §5 适配层 API | Task 1 |
| §6 Container 改动 | Task 2 |
| §8 错误与边界 | Task 2 catch + Task 1 debug 短路 |
| §10 验收标准 | Task 3 |

无 TBD / 占位符；类型与 spec 一致。

---

## 执行方式

Plan 已保存至 `docs/superpowers/v1.4.8/api-adapter/教师列表组件/plans/01-dev-plan.md`。

**两种执行选项：**

1. **Subagent-Driven（推荐）** — 每个 Task 派发独立子代理，逐步 review
2. **Inline Execution** — 当前会话按 Task 1 → 2 → 3 直接实现

请选择执行方式，或回复「开始实现」由我 inline 执行。
