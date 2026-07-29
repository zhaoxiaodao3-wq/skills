# 教师列表组件 — 接口适配开发规格

**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)

**UI 规格：** [../../ui-style/教师列表组件/specs/原始需求-dev-spec.md](../../ui-style/教师列表组件/specs/原始需求-dev-spec.md)

**状态：** ✅ 已对接完成（2026-07-07）

---

## 1. 目标

将教师画像页左栏「教师列表」组件（`TeacherListContainer`）的数据源从 Mock 切换为真实接口 `POST /backstage/schoolGroup/schoolUserPage`，保持 UI 与交互不变，继续驱动 `activeTeacherId` 与右侧聚合数据联动。

## 2. 范围

### 2.1 本阶段做

- 新增 `teacher-list-api.ts` 适配层
- 修改 `TeacherListContainer.vue` 接入真实接口
- 服务端分页 + 服务端姓名搜索（`userName`）
- `debugDataMode === 'empty'` 短路逻辑

### 2.2 本阶段不做

- `TeacherListView.vue` 视觉与交互改动
- 教师画像页权限、布局、聚合接口对接
- 删除 Mock 文件（保留供调试）

## 3. 架构

```
components/teacher-list/
├── teacher-list-api.ts      # 新增：querySchoolUserPage + 字段映射
├── TeacherListContainer.vue # 修改：Mock → api
├── TeacherListView.vue      # 不变
└── types.ts                 # 不变
```

对齐已完成模块：[教学小组 api-adapter](../../教学小组组件/requirements/原始需求.md) 的「Container + api 层」模式。

## 4. 接口契约

### 4.1 请求

| 项 | 值 |
|----|-----|
| 封装 | `service.schoolNew.querySchoolUserPage` |
| 路径 | `POST /backstage/schoolGroup/schoolUserPage` |

**参数：**

| 参数 | 来源 | 必传 | 说明 |
|------|------|------|------|
| `page` | `page` ref | 是 | 从 1 开始 |
| `size` | `TEACHER_LIST_PAGE_SIZE`（10） | 是 | 固定 |
| `tenantId` | `userInfo.tenantId` | 是 | 当前单位 ID |
| `userName` | `appliedKeyword` | 否 | 有 trim 后内容才传 |

**明确不传：** `facultyType`、`identityId`、`groupId`、`schoolId` 等额外筛选。

### 4.2 响应映射

接口：`{ list: Record<string, any>[], total: number }`

| `TeacherListItem` | 接口字段 | 规则 |
|-------------------|----------|------|
| `id` | `id` | `String(id).trim()`，空则丢弃 |
| `name` | `userName` | `String(userName).trim()` |
| `subject` | `mainSubjectName` | 空串 / null → `null` |
| `grade` | — | 不映射 |

输出：`{ records: TeacherListItem[], total: number }`

## 5. 适配层 API 设计

### 5.1 `TeacherListFetchContext`

```ts
{
  querySchoolUserPage: (params: {
    page: number
    size: number
    tenantId: string
    userName?: string
  }) => Promise<{ list?: Record<string, any>[]; total?: number }>
  tenantId: string
}
```

### 5.2 导出函数

| 函数 | 职责 |
|------|------|
| `mapTeacherListItem(raw)` | 单条映射，无效 id 返回 null |
| `mapTeacherListPageResponse(response)` | list → records + total |
| `fetchTeacherListPageData(query, ctx)` | 组装请求、debug 短路、调用接口 |

`query` 沿用现有 `TeacherListQuery`：`{ page, pageSize, keyword? }`；`keyword` 映射为请求参数 `userName`。

### 5.3 Debug 短路

`isTeacherPortraitDebugEmpty()` 为 true 时：

```ts
return { records: [], total: 0 }
```

不调用 `querySchoolUserPage`。

## 6. Container 改动

### 6.1 依赖注入

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

### 6.2 `loadList` 逻辑

1. `loading = true`
2. 调用 `fetchTeacherListPageData({ page, pageSize, keyword: appliedKeyword || undefined }, ctx)`
3. 赋值 `items`、`total`
4. `total === 0` → `emit('listEmpty')`
5. 有数据且 `(selectFirst || !selectedTeacherId)` → `emit('select', records[0].id)`
6. `catch` → `items = []`、`total = 0`、`emit('listEmpty')`
7. `finally` → `loading = false`

### 6.3 保留不变的行为

| 行为 | 触发 |
|------|------|
| 搜索 | `handleSearch`：trim → `appliedKeyword`，`page = 1`，`loadList()` |
| 重置 | `handleReset`：清空 keyword/appliedKeyword，`page = 1`，`loadList({ selectFirst: true })` |
| 翻页 | `handlePageChange`：更新 page，`loadList()`（保留 appliedKeyword） |
| debug 切换 | `watch(debugDataMode)`：重置搜索与页码，`loadList()` |

### 6.4 移除

- `TeacherListContainer.vue` 对 `fetchTeacherListMock` 的 import 与调用

## 7. 数据流

```
挂载 / 搜索 / 重置 / 翻页
  └─ fetchTeacherListPageData
       ├─ debug empty → { records: [], total: 0 }
       └─ querySchoolUserPage(page, size, tenantId, userName?)
            └─ map → items + total
                 ├─ total > 0 且需选首条 → emit('select', firstId)
                 └─ total === 0 → emit('listEmpty')
```

## 8. 错误与边界

| 场景 | 处理 |
|------|------|
| 接口失败 | 空列表 + `listEmpty`，request 层 toast |
| 单条缺字段 | 映射兜底，跳过无 id 项 |
| 空搜索 | 不传 `userName` |
| 姓名/科目空 | View 层 `formatEmptyDisplay` → `--` |

## 9. 参考文件

| 用途 | 路径 |
|------|------|
| 接口封装 | `src/service/schoolNew.ts` |
| 调用示例 | `src/pages/school/components/SelectTenantUserDialog.vue` |
| 同模块 api 参考 | `src/pages/school/teacher-portrait/components/teaching-group/teaching-group-api.ts` |
| 当前 Container | `src/pages/school/teacher-portrait/components/teacher-list/TeacherListContainer.vue` |
| Mock（保留） | `src/pages/school/teacher-portrait/mock/teacher-list.mock.ts` |

## 10. 验收标准

- [x] 校级管理员 / 管理员左栏展示真实教师列表（姓名 `userName`、科目 `mainSubjectName`）
- [x] 服务端分页：每页 10 条，分页器与 `total` 一致
- [x] 姓名搜索：`userName` 传参；空关键词恢复全量
- [x] 重置：清空搜索、回第一页、选中首条
- [x] 空列表：「查无此人」+ `listEmpty`，右侧不请求聚合
- [x] 有数据：默认 / 重置后选中首条，点击切换选中
- [x] `debugDataMode === 'empty'`：不请求接口，展示空态
- [x] `TeacherListView.vue` 无改动
