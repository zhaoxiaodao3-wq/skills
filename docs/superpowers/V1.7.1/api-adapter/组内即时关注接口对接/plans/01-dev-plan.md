# 组内即时关注接口对接 · 开发计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**类型:** api-adapter
**目标应用:** `E:\code\dataView\apps-development-platform\apps\data-board`
**版本:** V1.7.1
**执行方式:** Inline（P3 已确认 2026-10-21）

---

## 任务总览

| Task | 内容 | 预估 |
|------|------|------|
| 1 | 新增 `teaching-overview.ts`：VO 类型 + 请求 + status 派生 + 映射 | 5 min |
| 2 | 改 `overview.ts` #7：切真接口 + mock 回退 + 参数扩展 | 5 min |
| 3 | 组件 title prop + 请求参数扩展 | 4 min |
| 4 | `grade-overview` 传标题「级内即时关注」 | 1 min |
| 5 | README 对接进度表 | 3 min |
| 6 | 类型检查 + 四态走查 | 3 min |

---

## Task 1: 新增 teaching-overview.ts

**文件（新建）：**
`E:\code\dataView\apps-development-platform\apps\data-board\src\api\teaching-overview.ts`

> **Skill:** 无（纯 TS API 适配层，无匹配 skill · 置信度 &lt; 0.7）
> **理由:** 仅按接口文档写类型/请求/映射，不涉及 UI/图表/工作流。

### 1.1 VO 类型（严格按 spec §3.2）

```ts
/** 教学概览 · 即时关注 VO（字段与 teaching-overview-api.md 一一对应，不发明字段） */
export interface ImmediateFocusClassInfoResp {
  classId: string
  tenantUserId: string
  teacherName: string
  score: number
}

export interface ImmediateFocusResp {
  conclusion: string
  status: string
  classCount: number
  averageScore: number
  maxScore: number
  minScore: number
  classInfo: ImmediateFocusClassInfoResp[]
}
```

### 1.2 请求函数（spec §3.1）

```ts
import type { GroupFocusData } from '@/constants/overview'
import { request } from '@miray/utils'

export function getImmediateFocusApi(params: {
  campusId: string
  baseSemesterId: string
  stageId?: string
  gradeId?: string
  subjectName: string
  weekNo: number
}) {
  return request<{
    code: number
    msg: string
    data: ImmediateFocusResp | null
  }>({
    method: 'get',
    url: '/classroom-dashboard/teaching-overview/immediate-focus',
    params,
  })
}
```

### 1.3 status 派生（spec §4.2）

```ts
/** 仅在后端 status 不可识别时使用（P1 确认阈值） */
const STATUS_FALLBACK = { improveMinScore: 60, excellentAvg: 85, excellentMax: 90 }

const STATUS_TEXT_MAP: Record<string, FocusStatus> = {
  improve: 'improve',
  '待改进': 'improve',
  excellent: 'excellent',
  '优秀': 'excellent',
  stable: 'stable',
  '平稳': 'stable',
  empty: 'empty',
  '空': 'empty',
  '暂无': 'empty',
}

export function deriveFocusStatus(vo: ImmediateFocusResp): FocusStatus {
  const raw = (vo.status ?? '').trim()
  const byText = STATUS_TEXT_MAP[raw.toLowerCase()] ?? STATUS_TEXT_MAP[raw]
  if (byText)
    return byText
  if (!vo.classCount || !vo.classInfo?.length)
    return 'empty'
  if (vo.minScore < STATUS_FALLBACK.improveMinScore)
    return 'improve'
  if (vo.averageScore >= STATUS_FALLBACK.excellentAvg && vo.maxScore >= STATUS_FALLBACK.excellentMax)
    return 'excellent'
  return 'stable'
}
```

### 1.4 映射函数（spec §4.1）

```ts
const FOCUS_TABLE_COLUMNS = [
  { key: 'className', label: '班级' },
  { key: 'teacherName', label: '授课教师' },
  { key: 'score', label: '评分', emphasis: true },
]

export function mapImmediateFocusToGroupFocus(vo: ImmediateFocusResp): GroupFocusData {
  const status = deriveFocusStatus(vo)
  const summary = vo.conclusion?.trim() || STATUS_FALLBACK_SUMMARY[status]

  if (status === 'empty') {
    return { status, summary }
  }

  if (status === 'improve' || status === 'excellent') {
    // TODO(联调): classInfo 缺 className，确认后端补字段或约定 classId 展示
    const rows = (vo.classInfo ?? []).map((item, index) => ({
      key: `row-${index + 1}`,
      cells: {
        className: item.classId ?? '',
        teacherName: item.teacherName ?? '',
        score: `${item.score}分`,
      },
    }))
    return {
      status,
      summary,
      table: { columns: FOCUS_TABLE_COLUMNS, rows },
    }
  }

  // stable
  return {
    status,
    summary,
    stats: [
      { label: '报告数', value: String(vo.classCount ?? 0), unit: '份' },
      { label: '评分均分', value: String(vo.averageScore ?? 0), unit: '分' },
      { label: '最高分', value: String(vo.maxScore ?? 0), unit: '分' },
      { label: '最低分', value: String(vo.minScore ?? 0), unit: '分' },
    ],
  }
}
```

`STATUS_FALLBACK_SUMMARY` 按四态给一句兜底中文文案（conclusion 为空时用）。

**Task 1 完成标准：** 文件可编译；VO 字段与文档一致；映射覆盖四态。

---

## Task 2: overview.ts 切真接口 + mock 回退

**文件（改）：**
`E:\code\dataView\apps-development-platform\apps\data-board\src\api\overview.ts`

> **Skill:** 无（替换 mock 数据源 · 置信度 &lt; 0.7）

### 2.1 扩展 `getGroupFocusApi` 签名（spec §5.1）

```ts
export function getGroupFocusApi(params: {
  weekId: string
  subjectId?: string
  campusId?: string
  semesterId?: string
  gradeId?: string
  stageId?: string
})
```

### 2.2 参数组装

| 前端 | 请求字段 | 规则 |
|------|----------|------|
| weekId `'week-N'` | weekNo | 解析 `N`，解析失败不发请求走 mock |
| subjectId | subjectName | 查 `FOCUS_SUBJECTS` / 现有列表 label（中文名） |
| semesterId | baseSemesterId | 直传 |
| campusId | campusId | 直传 |
| gradeId / stageId | gradeId / stageId | 至少一项非空 |

缺 `campusId` 或 `baseSemesterId` 或（gradeId/stageId 均空）或 `subjectName` 解析失败 → **不发请求，直接返回 mock**。

### 2.3 请求 + 回退

```ts
import { getImmediateFocusApi, mapImmediateFocusToGroupFocus } from './teaching-overview'

export async function getGroupFocusApi(params: { ... }) {
  const req = buildImmediateFocusParams(params) // 见 2.2；返回 null 表示参数不足
  if (req) {
    try {
      const res = await getImmediateFocusApi(req)
      if (res?.code === 200 && res.data) {
        return { code: 200 as const, data: mapImmediateFocusToGroupFocus(res.data) }
      }
    }
    catch {
      // fall through
    }
  }
  // TODO(1.7.1-联调): 后端实现后移除 mock 回退
  return delay({ code: 200 as const, data: FOCUS_DATA[params.weekId] ?? FOCUS_DATA_WEEK_3 })
}
```

**`#6` `getFocusFilterOptionsApi` 不动**（保留 mock）。

**Task 2 完成标准：** 50000/失败/参数不足时 UI 仍拿到 mock；成功路径走映射。

---

## Task 3: 组件 title + 参数扩展

**文件（改）：**
- `E:\code\dataView\apps-development-platform\apps\data-board\src\components\group-focus\group-focus.model.ts`
- `E:\code\dataView\apps-development-platform\apps\data-board\src\components\group-focus\group-focus.vue`

> **Skill:** 无（props/参数透传 · 置信度 &lt; 0.7）

### 3.1 Props（spec §6.1）

```ts
export interface GroupFocusProps {
  showSubjectFilter?: boolean
  /** 标题；默认「组内即时关注」；年级长传「级内即时关注」 */
  title?: string
}
```

模板标题：`{{ title ?? '组内即时关注' }}`

### 3.2 请求参数（spec §6.2）

`loadData` / `onMounted` 调用 `getGroupFocusApi` 时追加：

- `route.query.campusId` / `semesterId` / `gradeId` / `stageId`
- `subjectName`：由 `subjectId` 查当前 `subjects` 列表 `label`
- `weekId` 原样传（解析在 api 层）

四态 UI / 防竞态 / 筛选逻辑 **零改动**。

**Task 3 完成标准：** 组件可编译；标题可定制；请求参数含页面上下文。

---

## Task 4: 年级长页传标题

**文件（改）：**
`E:\code\dataView\apps-development-platform\apps\data-board\src\views\grade-overview\grade-overview.vue`

> **Skill:** 无（单行 prop）

```vue
<group-focus :show-subject-filter="true" title="级内即时关注" />
```

`plan-lessons.vue` / `subject-overview-2.vue` **不改**（默认标题）。

**Task 4 完成标准：** 年级长页标题为「级内即时关注」。

---

## Task 5: README 对接进度

**文件（改）：**
`E:\code\dataView\apps-development-platform\apps\data-board\src\components\group-focus\README.md`

> **Skill:** 无（文档）

新增「对接进度」表（spec §7）：

| 项 | 状态 | 说明 |
|----|------|------|
| VO 类型 / 请求 / 映射 | ✅ | `src/api/teaching-overview.ts` |
| #7 getGroupFocusApi 切真接口 | ✅ | 失败回退 mock |
| #6 周次/科目列表 | ⏳ 保留 mock | 文档无对应接口 |
| status 派生 | ✅ | 后端枚举确认后可简化 |
| className | ⚠️ 待联调 | classInfo 仅有 classId |
| 后端实现 | ❌ 未开始 | 11 接口均未实现 |
| 真实联调 | ❌ 未开始 | 后端实现后进行 |
| 标题「级内即时关注」 | ✅ | 年级长页 |

并更新「接口对接指引」：`#7` 标注为「已接线（带 mock 回退）」。

**Task 5 完成标准：** 进度表含待联调项。

---

## Task 6: 校验

> **Skill:** 无（lint/typecheck）

1. 对改动文件跑项目类型检查 / lint（`data-board` 可用脚本；无则 `vue-tsc`/`eslint` 目标文件）
2. 手动核对验收清单 spec §8 十项
3. 四态映射表走查（empty / improve / excellent / stable）——有条件则起 dev 看 `group-focus`，无后端时应走 mock 四态

**Task 6 完成标准：** 无新增 TS/lint 错误；验收十项自检通过。

---

## 依赖顺序

```
Task 1 (teaching-overview.ts)
   ↓
Task 2 (overview.ts #7)
   ↓
Task 3 (组件 title + 参数)  →  Task 4 (grade-overview 标题)
   ↓
Task 5 (README 进度)
   ↓
Task 6 (校验)
```

Task 4 依赖 Task 3；其余可按序执行。

---

## 风险提示

| 风险 | plan 处理 |
|------|-----------|
| 后端 status 语义未知 | Task 1 派生兜底 |
| classInfo 无 className | Task 1 用 classId + TODO 注释 |
| 无周次列表接口 | Task 2 #6 保留 mock |
| 后端未实现 | Task 2 mock 回退 |
