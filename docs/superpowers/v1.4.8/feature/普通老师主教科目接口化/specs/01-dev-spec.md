# 普通老师主教科目接口化 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

普通老师身份下，科目信息以 `backstage/schoolUser/facultyList` 接口为**唯一可信源**，页面入口一次拉取、「我的信息」与教师画像卡两处同步消费；「主要科目」文案全局改为「主教科目」。

## 2. 方案：页面入口统一异步补齐 subject（已确认方案 A）

### 2.1 `composables/teacher-profile-basic.ts`

1. `resolveWhoamiProfile()`：`subject` 恒返回 `null`，删除对 whoami `subject`/`subjectName`/`mainSubjectName` 的读取（接口是唯一可信源，不允许本地回退路径）
2. 新增：

```ts
export type FacultyListFetchContext = {
  facultyList: (params: {
    tenantId: string
    tenantUserIds: string[]
  }) => Promise<Record<string, any>[] | { list?: Record<string, any>[] }>
  tenantId: string
}

export async function fetchMainSubjectByFacultyList(
  tenantUserId: string,
  ctx: FacultyListFetchContext,
): Promise<string | null>
```

行为：
- `tenantUserId` 或 `ctx.tenantId` 为空 → 直接返回 `null`，**不发请求**
- debug 空态（`isTeacherPortraitDebugEmpty()`）→ 返回 `null`（与其他 fetcher 一致）
- 调 `ctx.facultyList({ tenantId, tenantUserIds: [tenantUserId] })`
- 响应兼容数组 / `{ list }` 两种形态；复用 `mapFacultyMember`（教学小组已有映射，`subject` 即 `mainSubjectName`）
- 取 `teacherId === tenantUserId` 的项的 `subject`；无精确匹配时取首项（仅请求了一个 id）；仍无或为空 → `null`
- 不在函数内 catch，由调用方处理

### 2.2 `teacher-portrait/index.vue`

1. 新增 `useService()` 与 `useUserSession()`（页面级，取 `userInfo.tenantUserId` / `tenantId`，与教学小组同源）
2. `initTeacherProfileForRole()`（isTeacher 分支）：先 `setActiveTeacherProfile(resolveWhoamiProfile())`（姓名/性别即时可见），再触发 `void loadTeacherMainSubject(profile)`
3. 新增 `loadTeacherMainSubject(profile)`：
   - `await fetchMainSubjectByFacultyList(...)`
   - **竞态守卫**：回填前校验 `activeTeacherProfile.value === profile`（对象同一性），角色切换 / debug 重置后过期结果直接丢弃
   - 成功 → `setActiveTeacherProfile({ ...profile, subject })`
   - 失败 → 静默吞掉，subject 保持 `null`（两处显示 `-`）

### 2.3 文案

`TeacherPortraitCardView.vue` 「主要科目：」→「主教科目：」（全局唯一出现处，src 内无其他「主要科目」）。

## 3. 数据流（闭环说明）

```
role → isTeacher
  └─ initTeacherProfileForRole
       ├─ resolveWhoamiProfile()          → userName/gender（subject=null）
       └─ loadTeacherMainSubject()        → facultyList 接口 → mainSubjectName
            └─ setActiveTeacherProfile    → 单一数据源
                 ├─ MyInfoContainer       → 我的信息 · 科目
                 └─ TeacherPortraitCard   → 主教科目
```

科目不存在第二条获取路径；两个消费方共享同一 `activeTeacherProfile`，不可能不同步。

## 4. 不变的行为

| 行为 | 说明 |
|------|------|
| 管理员 / 组管理员科目来源 | 仍来自 `profileFromTeacherListItem` / `profileFromTeachingGroupMember` |
| 姓名 / 性别来源 | 仍来自 whoami |
| `resolveProfileField` mock 回退 | 卡片 mock 逻辑不动 |
| debug 模式重置 | `initActiveTeacherIdForRole` 触发链路不变 |

## 5. 测试（TDD）

新增 `composables/teacher-profile-basic.spec.ts`：

1. `fetchMainSubjectByFacultyList`：命中 `tenantUserId` 返回 `mainSubjectName`；请求参数为 `{ tenantId, tenantUserIds: [id] }`
2. 响应为 `{ list }` 形态同样可取
3. 列表无匹配项 / `mainSubjectName` 为空 → `null`
4. `tenantUserId` 为空 → 返回 `null` 且不调接口
5. `resolveWhoamiProfile`：whoami 含 `subject` 字段时返回的 `subject` 仍为 `null`（mock `getCurrentWhoami`）

## 6. 验收标准

- [ ] 新测试全绿（TDD 先红后绿）
- [ ] 普通老师身份两处科目均来自接口且同步
- [ ] 接口失败 / 空数据显示 `-`
- [ ] 文案「主教科目」
- [ ] 现有测试无回归、`vue-tsc` 通过、`pnpm harness:check` 无本模块警告
