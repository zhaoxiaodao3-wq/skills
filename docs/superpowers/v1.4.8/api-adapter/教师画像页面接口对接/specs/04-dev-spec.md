# 教师画像页面 — 教学统计与教师基本信息 HTTP 接入 开发规格

> **状态：已交付（2026-07-10）** — 见 [archive/04-教学统计与教师基本信息HTTP接入-delivered.md](../archive/04-教学统计与教师基本信息HTTP接入-delivered.md)

**Requirement:** [requirements/04-教学统计与教师基本信息HTTP接入.md](../requirements/04-教学统计与教师基本信息HTTP接入.md)

**变更依据：**

- [docs/teachingStatistics接口文档.md](../docs/teachingStatistics接口文档.md)

**前置交付：**

- [archive/03-教师风格分析三模块HTTP接入-delivered.md](../archive/03-教师风格分析三模块HTTP接入-delivered.md)

---

## 1. 目标

1. 新增 `getTeachingStatistics` HTTP 服务与 Adapter
2. 扩展页面 Context：`activeTeacherProfile` + `teachingStatistics`
3. 扩展列表/教研组映射含 `gender`
4. `MyInfoContainer`、`TeacherPortraitCardContainer` 按 §3 合并真实 profile + statistics
5. Mock 双轨：基本信息始终真实；统计随 Mock 开关

---

## 2. 方案（已定：方案 A）

- Context 存选中教师基本信息；`useTeacherPortraitData` 并行拉 statistics
- Container 层覆盖 aggregate mock 中的 profile/统计字段
- `getTeacherProfile` 九模块逻辑不变

---

## 3. 架构与数据流

```
activeTeacherId 变化
  ├─ activeTeacherProfile（选中时写入 / 普通教师 init 从 whoami）
  ├─ fetchTeacherPortraitAggregate（现有）
  └─ fetchTeachingStatistics(tenantUserId)
       ├─ Mock ON  → FULL_MOCK_BASE.myInfo 统计字段
       └─ Mock OFF → getTeachingStatistics HTTP → adaptTeachingStatistics
```

### 3.1 Context 扩展

```ts
export type ActiveTeacherProfile = {
  userName: string | null
  gender: string | null
  subject: string | null
}

export type TeachingStatisticsSlice = {
  courseDuration: number | null
  lessonPlanCount: number | null
  evaluationReportCount: number | null
}

export type TeacherPortraitContext = {
  // ...existing
  activeTeacherProfile: Ref<ActiveTeacherProfile | null>
  teachingStatistics: Ref<TeachingStatisticsSlice | null>
  setActiveTeacherProfile: (profile: ActiveTeacherProfile | null) => void
}
```

### 3.2 写入 profile 时机

| 入口 | 动作 |
|------|------|
| `index.vue` init（`isTeacher`） | `resolveWhoamiProfile()` → `setActiveTeacherProfile` |
| `handleTeacherSelect(id, item?)` | 从 `TeacherListItem` 写 profile |
| `handleMemberSelect(id, member?)` | 从 `TeachingGroupMemberItem` 写 profile |
| `listEmpty` / `id=null` | `setActiveTeacherProfile(null)` |

列表/教研组 emit 需扩展为传递完整 item（或 page 层根据 id 查缓存）。

---

## 4. HTTP 服务

### 4.1 接口定义

| 项 | 值 |
|----|-----|
| Method | GET |
| Path | `/analysis/v2/teachingDiagnosis/teachingStatistics` |
| Query | `tenantUserId: string` |
| Response | `TeachingStatisticsVO` |

### 4.2 VO 类型

文件：`api/types/teaching-statistics.vo.ts`

```ts
export type TeachingStatisticsVO = {
  totalClassDuration?: number
  lessonPlanNum?: number
  postClassReportNum?: number
}
```

### 4.3 文件位置

```
src/pages/school/teacher-portrait/api/get-teaching-statistics.ts
```

---

## 5. Adapter

文件：`adapters/teaching-statistics.adapter.ts`

```ts
export function adaptTeachingStatistics(
  vo: TeachingStatisticsVO | null | undefined,
): TeachingStatisticsSlice | null
```

| 规则 | 说明 |
|------|------|
| `totalClassDuration` | → `courseDuration`，`Math.trunc` |
| `lessonPlanNum` | → `lessonPlanCount` |
| `postClassReportNum` | → `evaluationReportCount` |
| 判空 | `vo` 为 null → `null`；接口全 0 仍产出 `{0,0,0}` |

---

## 6. 性别与 profile 工具

文件建议：`composables/teacher-profile-basic.ts` 或 `utils/whoami-gender.ts`

```ts
export function normalizeWhoamiGender(gender: unknown): string | null {
  if (gender === 'woman') return '女'
  if (gender === 'man') return '男'
  return null
}

export function resolveWhoamiProfile(): ActiveTeacherProfile
```

画像 URL 拼接：`TeacherPortraitCardContainer` 中 `gender` 优先用 context，传入 `normalizeTeacherPortraitGender`（`女`/`男` → 资产 slug）。

---

## 7. 列表 / 教研组映射扩展

### 7.1 TeacherListItem

```ts
export type TeacherListItem = {
  id: string
  name: string
  subject?: string | null
  gender?: string | null  // genderStr
  grade?: string | null
}
```

`mapTeacherListItem`：`gender: raw.genderStr ?? null`

### 7.2 TeachingGroupMemberItem

```ts
export type TeachingGroupMemberItem = {
  teacherId: string
  name: string
  subject?: string | null
  gender?: string | null
}
```

`mapFacultyMember`：`gender: raw.tenantUser?.genderStr ?? null`

### 7.3 选中事件

`TeacherListContainer` emit：`select: [item: TeacherListItem]`  
`TeachingGroupContainer` emit：`selectMember: [member: TeachingGroupMemberItem | null]`

---

## 8. Container 合并规则

### 8.1 MyInfoContainer

```ts
const profile = activeTeacherProfile.value
const stats = isTeacherPortraitMockEnabled()
  ? mockStatsFromAggregate(aggregate)  // FULL_MOCK_BASE 路径
  : teachingStatistics.value

return {
  userName: profile?.userName ?? null,
  subject: profile?.subject ?? null,
  gender: profile?.gender ?? null,
  courseDuration: truncateToInteger(stats?.courseDuration ?? null),
  lessonPlanCount: stats?.lessonPlanCount ?? null,
  evaluationReportCount: stats?.evaluationReportCount ?? null,
}
```

移除对 `aggregate.myInfo` 与 whoami fallback 的混合逻辑（profile 统一由 context 提供）。

### 8.2 TeacherPortraitCardContainer

```ts
// 展示用 profile
userName / gender / subject ← activeTeacherProfile
courseDuration ← teachingStatistics（Mock 分支同 MyInfo）

// 画像/风格仍从 aggregate.teacherPortrait
dominantStyle / secondaryStyle / featureTags ← slice

// 画像 URL gender 优先 context.gender
resolveTeacherStylePortraitUrlFromFields({
  ...fieldInput,
  gender: normalizeTeacherPortraitGender(activeTeacherProfile?.gender ?? slice.gender),
})
```

---

## 9. useTeacherPortraitData 扩展

```ts
export function useTeacherPortraitData(activeTeacherId: Ref<string | null>) {
  const teachingStatistics = ref<TeachingStatisticsSlice | null>(null)

  async function fetchTeachingStatistics(teacherId: string) {
    if (isTeacherPortraitMockEnabled()) {
      teachingStatistics.value = readMockStatistics()  // from FULL_MOCK_BASE.myInfo
      return
    }
    try {
      const vo = await getTeachingStatistics({ tenantUserId: teacherId })
      teachingStatistics.value = adaptTeachingStatistics(vo) ?? emptyStats()
    } catch {
      ElMessage.error('教学统计数据加载失败')
      teachingStatistics.value = emptyStats()
    }
  }

  // watch activeTeacherId：并行 fetchAggregate + fetchTeachingStatistics
  return { loading, aggregate, teachingStatistics }
}
```

`index.vue` provide context 时注入 `teachingStatistics` 与 `activeTeacherProfile`。

---

## 10. Mock fixture

`mock/teacher-portrait-aggregate.mock.ts`：

- 导出 `readMockTeachingStatistics()` 从 `FULL_MY_INFO` 读取三统计字段
- Mock ON 时 `useTeacherPortraitData` 调用

可选：`mock/teaching-statistics-api.mock.ts` 供单测。

---

## 11. 文件清单

| 操作 | 路径 |
|------|------|
| 新建 | `api/get-teaching-statistics.ts` |
| 新建 | `api/types/teaching-statistics.vo.ts` |
| 新建 | `adapters/teaching-statistics.adapter.ts` |
| 新建 | `adapters/teaching-statistics.adapter.spec.ts`（或并入现有 spec） |
| 新建 | `composables/teacher-profile-basic.ts` |
| 改 | `composables/useTeacherPortraitContext.ts` |
| 改 | `composables/useTeacherPortraitData.ts` |
| 改 | `teacher-portrait/index.vue` |
| 改 | `components/teacher-list/types.ts`、`teacher-list-api.ts`、`TeacherListContainer.vue` |
| 改 | `components/teaching-group/types.ts`、`teaching-group-api.ts`、`TeachingGroupContainer.vue` |
| 改 | `components/my-info/MyInfoContainer.vue` |
| 改 | `components/teacher-portrait-card/TeacherPortraitCardContainer.vue` |

**不改动**：`getTeacherProfile` 九模块 Adapter、风格分析三模块 Container。

---

## 12. 错误与边界

| 场景 | 行为 |
|------|------|
| `activeTeacherId == null` | statistics `null`；卡片空态 |
| statistics HTTP 失败 | toast；统计置 0 |
| `getTeacherProfile` 失败 | 保持 03 逻辑，不影响 profile/statistics |
| 翻页后选中 id 不在当前页 | profile 保持选中时写入的值 |
| whoami `gender` 非 woman/man | `null` → 展示 `-` |
| `dataMode=empty` + Mock ON | 统计走 empty mock |

---

## 13. 测试策略

**vitest：**

1. `adaptTeachingStatistics` — 文档 JSON → slice
2. `normalizeWhoamiGender` — woman/man/其它
3. `mapTeacherListItem` — `genderStr`
4. `mapFacultyMember` — `tenantUser.genderStr`

**手工：** 对齐 Requirement §六。

---

## 14. 验收标准

- [ ] Context profile + statistics 双轨按 §3 工作
- [ ] 三角色基本信息来源正确
- [ ] MyInfo / 画像卡片统计 Mock OFF 来自 HTTP
- [ ] Mock ON 统计回退 mock，基本信息仍真实
- [ ] 画像风格/标签无回归
- [ ] 单测与 typecheck 通过

---

## 15. 不在范围

- 画像卡片风格/标签 HTTP
- merge 层完全移除 myInfo/teacherPortrait
- 趋势 Tooltip 等 03 遗留增强
