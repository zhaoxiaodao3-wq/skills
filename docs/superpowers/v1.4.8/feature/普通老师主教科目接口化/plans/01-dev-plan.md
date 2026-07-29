# 普通老师主教科目接口化 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 普通老师身份下科目信息以 facultyList 接口为唯一可信源，页面级单次拉取、两处消费同步；「主要科目」文案全局改「主教科目」。

**Architecture:** 纯函数 `fetchMainSubjectByFacultyList` 放在 `teacher-profile-basic.ts`（复用教学小组的 `mapFacultyMember` / `normalizeFacultyListResponse`），页面入口 `index.vue` 在普通老师初始化时异步回填 `activeTeacherProfile.subject`，带对象同一性竞态守卫。

**Tech Stack:** Vue 3 + TypeScript + vitest

---

### Task 1: 数据层纯函数（TDD）

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teaching-group/teaching-group-api.ts:93`（`normalizeFacultyListResponse` 加 export）
- Modify: `src/pages/school/teacher-portrait/composables/teacher-profile-basic.ts`
- Test: `src/pages/school/teacher-portrait/composables/teacher-profile-basic.spec.ts`（新建）

- [ ] **Step 1: 写失败测试**（用例见 spec §5：命中匹配、`{list}` 形态、无匹配取首项、空科目 null、空 id 不发请求、`resolveWhoamiProfile.subject` 恒 null）
- [ ] **Step 2: 运行确认红**
  `npx vitest run src/pages/school/teacher-portrait/composables/teacher-profile-basic.spec.ts` → 预期 `fetchMainSubjectByFacultyList` 未定义 + subject 用例失败
- [ ] **Step 3: 最小实现**
  - `teaching-group-api.ts`：`function normalizeFacultyListResponse` → `export function`
  - `teacher-profile-basic.ts`：`resolveWhoamiProfile` 的 `subject` 改为 `null`；新增：

```ts
import { isTeacherPortraitDebugEmpty } from './teacher-portrait-debug'
import {
  mapFacultyMember,
  normalizeFacultyListResponse,
} from '../components/teaching-group/teaching-group-api'

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
): Promise<string | null> {
  const id = tenantUserId.trim()
  if (!id || !ctx.tenantId) return null
  if (isTeacherPortraitDebugEmpty()) return null

  const response = await ctx.facultyList({
    tenantId: ctx.tenantId,
    tenantUserIds: [id],
  })
  const members = normalizeFacultyListResponse(response)
    .map(mapFacultyMember)
    .filter((m): m is TeachingGroupMemberItem => m != null)

  const matched = members.find((m) => m.teacherId === id) ?? members[0]
  const subject = matched?.subject?.trim()
  return subject || null
}
```

- [ ] **Step 4: 运行确认绿**

### Task 2: 页面入口回填（index.vue）

**Files:**
- Modify: `src/pages/school/teacher-portrait/teacher-portrait/index.vue:63-69`

- [ ] **Step 1:** 顶部新增 `const service = useService()`、`const { userInfo } = useUserSession()`（auto-import）；import 块加入 `fetchMainSubjectByFacultyList`
- [ ] **Step 2:** 改造：

```ts
function initTeacherProfileForRole() {
  if (flags.value.isTeacher) {
    const profile = resolveWhoamiProfile()
    setActiveTeacherProfile(profile)
    void loadTeacherMainSubject(profile)
    return
  }
  setActiveTeacherProfile(null)
}

async function loadTeacherMainSubject(profile: ActiveTeacherProfile) {
  try {
    const subject = await fetchMainSubjectByFacultyList(
      String(userInfo.value?.tenantUserId ?? ''),
      {
        facultyList: service.quotaNew.facultyList,
        tenantId: userInfo.value?.tenantId ?? '',
      },
    )
    // 竞态守卫：角色切换 / debug 重置后 profile 已被替换，丢弃过期结果
    if (activeTeacherProfile.value !== profile) return
    setActiveTeacherProfile({ ...profile, subject })
  } catch {
    // 不兜底：subject 保持 null，两处显示 '-'
  }
}
```

### Task 3: 文案

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardView.vue:162`

- [ ] `主要科目：` → `主教科目：`

### Task 4: 验证与归档

- [ ] `npx vitest run src/pages/school/teacher-portrait` → 仅存量 2 个失败（`teacher-profile.adapter.spec.ts`、`classroom-structure-clarity/chart-options.spec.ts`），无新增失败
- [ ] `npx vue-tsc -b --pretty false` → EXIT=0
- [ ] `pnpm harness:check` → 本模块无警告
- [ ] 写 `archive/普通老师主教科目接口化-delivered.md`
- [ ] `git add` 暂存（提交须经用户确认）
- [ ] 说明：普通老师身份的浏览器验证依赖真实登录态，交由用户联调确认
