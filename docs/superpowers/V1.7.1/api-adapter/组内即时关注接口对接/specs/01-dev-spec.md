# 组内即时关注接口对接 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**类型:** api-adapter
**目标应用:** `apps/data-board`
**版本:** V1.7.1
**方案:** A（适配层 + mock 回退）· P1 已确认（2026-10-21）

---

## 1. 背景与目标

`group-focus` 组内即时关注组件 UI 已交付（Figma 四态），数据为 mock（`src/api/overview.ts` 替换点 `#6`/`#7`）。教学概览接口文档已给出 `immediate-focus` 字段契约，但 **后端 11 个接口均无业务查询实现**（方法体抛未实现异常，统一错误体 `code: 50000`）。

**目标：**

1. 按文档写好 `immediate-focus` 的 VO 类型、HTTP 请求、`ImmediateFocusResp` → `GroupFocusData` 映射
2. `getGroupFocusApi` 切真接口；接口未实现 / 失败时回退 mock，UI 可演示
3. 年级长标题为「级内即时关注」，其余页保持「组内即时关注」
4. 组件 README 记录对接进度与待联调项

**非目标（本期不做）：**

- 其余 10 个教学概览接口
- 周次/科目列表真接口（文档未提供）
- 后端实现、联调通过
- 四态 UI / Figma 样式改动

---

## 2. 架构（方案 A）

```
apps/data-board/src/api/teaching-overview.ts     ← 新增
  · ImmediateFocusResp / ImmediateFocusClassInfoResp 等 VO 类型（严格按文档）
  · getImmediateFocusApi(params) → request GET
  · mapImmediateFocusToGroupFocus(vo): GroupFocusData
  · deriveFocusStatus(vo): FocusStatus
        │
        ▼
apps/data-board/src/api/overview.ts              ← 改 #7
  · getGroupFocusApi()：调真接口 → 成功走映射；失败/50000 回退 mock
        │
        ▼
components/group-focus/group-focus.vue           ← 小改
  · title prop（默认「组内即时关注」）
  · 请求参数扩展（campusId / semesterId / gradeId / stageId / subjectName / weekNo）
        │
        ▼
views/grade-overview/grade-overview.vue          ← 传 title="级内即时关注"
```

**分层职责：**

| 层 | 文件 | 职责 | 改动 |
|----|------|------|------|
| API VO + 请求 + 映射 | `src/api/teaching-overview.ts` | 文档契约 → 前端契约 | **新增** |
| 入口封装 | `src/api/overview.ts` | `#7` 切真接口 + mock 回退 | **改** |
| 组件 | `src/components/group-focus/group-focus.vue` | title prop + 参数扩展 | **改** |
| 组件契约 | `src/components/group-focus/group-focus.model.ts` | Props 扩展 | **改** |
| 页面 | `src/views/grade-overview/grade-overview.vue` | 传标题 | **改** |
| 进度文档 | `src/components/group-focus/README.md` | 对接进度 | **改** |
| 常量 | `src/constants/overview.ts` | 不改契约（`GroupFocusData` 不变） | 不改 |

---

## 3. API 契约

### 3.1 请求

```ts
// src/api/teaching-overview.ts
import { request } from '@miray/utils'

/** 即时关注（教学概览） */
export function getImmediateFocusApi(params: {
  campusId: string
  baseSemesterId: string
  /** 与 gradeId 至少一项非空白 */
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

**路径：** `GET /classroom-dashboard/teaching-overview/immediate-focus`（服务上下文 `/classroom-dashboard` + 控制器前缀 `/teaching-overview`）

**Query 参数（全部走 Query，无请求体）：**

| 参数 | 类型 | 必填 | 映射来源 |
|------|------|------|----------|
| campusId | string | 是 | route.query.campusId / 页面筛选 |
| baseSemesterId | string | 是 | 页面学期筛选（semesterId → baseSemesterId） |
| stageId | string | 否 | route.query.stageId（与 gradeId 至少一项） |
| gradeId | string | 否 | route.query.gradeId |
| subjectName | string | 是 | 科目筛选 label（中文名，非 id） |
| weekNo | integer(int32) | 是 | weekId `'week-N'` → `N` |

### 3.2 响应 VO（严格按文档，不发明字段）

```ts
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

**文档约束（必须遵守）：**

- `status` 未定义固定枚举，不得推导后端枚举
- `classInfo` 无 `className`，仅有 `classId`
- `score` 等 number 字段不假设 0～100 或固定小数位
- `data` 可能为 `null`，需兼容
- 业务成功以 `code === 200` 为准

### 3.3 统一响应

```json
{ "code": 200, "msg": "ok", "data": { ... } }
```

错误（当前未实现）：

```json
{ "code": 50000, "msg": "系统繁忙，请稍后重试", "data": null }
```

---

## 4. VO → 前端契约映射

### 4.1 `mapImmediateFocusToGroupFocus(vo)`

输出：`GroupFocusData`（`src/constants/overview.ts`，**契约不变**）

| 前端字段 | 映射规则 |
|----------|----------|
| status | `deriveFocusStatus(vo)`（见 §4.2） |
| summary | `vo.conclusion`（为空时按 status 给兜底文案） |
| table（improve / excellent） | 由 `vo.classInfo` 生成：列固定 `班级/授课教师/评分`；行 `cells: { className, teacherName, score }`；`className` 暂用 `classId`（见 §4.3） |
| stats（stable） | 固定 4 项：`报告数→classCount`、`评分均分→averageScore`、`最高分→maxScore`、`最低分→minScore`，单位「分/份」 |
| empty | 无 table / stats |

评分列展示：`${score}分`（沿用现有 mock 格式）。

### 4.2 `deriveFocusStatus(vo)` — P1 已确认

```
1. 识别后端 status 字符串（trim 后小写/原样）：
   improve / 待改进 → improve
   excellent / 优秀 → excellent
   stable / 平稳 → stable
   empty / 空 / 暂无 → empty
2. 无法识别 → 按数据派生：
   classCount === 0 或 classInfo 空/null → empty
   minScore < 60 → improve
   averageScore >= 85 且 maxScore >= 90 → excellent
   否则 → stable
```

阈值 60 / 85 / 90 为前端派生常量，集中定义在 `teaching-overview.ts`，注释标明「仅在后端 status 不可识别时使用」。

### 4.3 className

后端确认将返回 `className`（`classInfo` 元素扩展字段）。映射优先 `className`，缺省回退 `classId`。

```ts
className: item.className ?? item.classId ?? ''
```

---

## 5. mock 回退策略

`getGroupFocusApi`（`src/api/overview.ts`）：

```
1. 组装 params（含 campusId/baseSemesterId/gradeId|stageId/subjectName/weekNo）
2. 调 getImmediateFocusApi
3. 成功且 code === 200 且 data 非 null → mapImmediateFocusToGroupFocus
4. 其他情况（网络失败 / code 50000 / data null / 异常）→ 回退现有 FOCUS_DATA mock
```

- 回退分支注释：`TODO(1.7.1-联调): 后端实现后移除 mock 回退`
- `#6` `getFocusFilterOptionsApi` **保持 mock**（文档无周次/科目列表接口）
- 周次：保留 `FOCUS_WEEKS`（1..18 倒序），`id` 仍为 `'week-N'`，请求时解析 `weekNo`
- 科目：`subjectId` → 中文名映射沿用 `FOCUS_SUBJECTS` / 现有 subject 列表 label

### 5.1 参数扩展（`getGroupFocusApi`）

```ts
getGroupFocusApi(params: {
  weekId: string
  subjectId?: string
  campusId?: string
  semesterId?: string   // → baseSemesterId
  gradeId?: string
  stageId?: string
})
```

缺 `campusId` 或 `semesterId` 或（`gradeId`/`stageId` 均空）或 `subjectName` 无法解析时：直接走 mock（不发无效请求）。

---

## 6. 组件改动

### 6.1 Props

```ts
export interface GroupFocusProps {
  /** 年级长页面传 true：显示科目筛选。 */
  showSubjectFilter?: boolean
  /** 标题；默认「组内即时关注」；年级长传「级内即时关注」 */
  title?: string
}
```

- 标题渲染：`{{ title ?? '组内即时关注' }}`
- **不**按 `showSubjectFilter` 隐式改标题（由页面显式传，避免隐式耦合）

### 6.2 请求参数

组件内部周次/科目筛选逻辑不变；`loadData` 额外传入页面上下文：

- 读 `route.query`：`campusId` / `semesterId` / `gradeId` / `stageId`（与 `teacher-warning-list` 同模式）
- `subjectName`：由当前 `subjectId` 查 `subjects` 列表得到 label
- `weekId` → `weekNo`：解析 `'week-N'`

### 6.3 页面接入

| 页面 | 用法 |
|------|------|
| `grade-overview.vue` | `<group-focus :show-subject-filter="true" title="级内即时关注" />` |
| `plan-lessons.vue` | `<group-focus />`（标题默认） |
| `subject-overview-2.vue` | `<group-focus />`（标题默认） |

---

## 7. 进度记录（README）

在 `group-focus/README.md` 更新「当前完成情况 / 接口对接指引」，新增 **对接进度** 小节：

| 项 | 状态 | 说明 |
|----|------|------|
| VO 类型 / 请求 / 映射 | ✅ 已完成 | `src/api/teaching-overview.ts` |
| `#7` getGroupFocusApi 切真接口 | ✅ 已完成 | 失败回退 mock |
| `#6` 周次/科目列表 | ⏳ 保留 mock | 文档无对应接口 |
| status 派生 | ✅ 已完成 | 后端枚举确认后可简化 |
| className | ⚠️ 待联调 | classInfo 仅有 classId |
| 后端实现 | ❌ 未开始 | 11 接口均未实现 |
| 真实联调 | ❌ 未开始 | 后端实现后进行 |
| 标题「级内即时关注」 | ✅ 已完成 | 年级长页 |

---

## 8. 验收标准

- [ ] `teaching-overview.ts` VO 类型与文档字段一一对应（无发明字段）
- [ ] `getImmediateFocusApi` 为 GET + Query，路径正确
- [ ] `mapImmediateFocusToGroupFocus` 覆盖 empty / improve / excellent / stable 四态
- [ ] `deriveFocusStatus` 先识别字符串再派生，规则与 §4.2 一致
- [ ] mock 回退：code 50000 / 失败 / data null 时 UI 仍展示 mock 四态
- [ ] 参数：weekId→weekNo、subjectId→subjectName、semesterId→baseSemesterId
- [ ] 缺必填参数时不发无效请求，走 mock
- [ ] 年级长标题「级内即时关注」，其余「组内即时关注」
- [ ] README 含对接进度表（含待联调项）
- [ ] `GroupFocusData` 契约不变，组件四态 UI 零改动

---

## 9. 风险与待联调

| 风险 | 处理 |
|------|------|
| 后端 status 语义未知 | 派生规则兜底；联调后收紧 |
| classInfo 无 className | 暂用 classId；联调确认补字段 |
| 无周次列表接口 | 保留 mock 1..18；联调确认来源 |
| 后端未实现 | mock 回退保证 UI |
| subjectName 中文 URL 编码 | request 库自动编码（文档约定） |
