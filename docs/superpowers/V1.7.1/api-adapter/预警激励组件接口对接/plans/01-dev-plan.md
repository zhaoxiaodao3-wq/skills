# 预警激励组件接口对接 · 开发计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**类型:** api-adapter（含列表去分页）
**目标应用:** `E:\code\dataView\apps-development-platform\apps\data-board`
**版本:** V1.7.1
**执行方式:** Inline（P3 已确认 2026-10-21）

---

## 任务总览

| Task | 内容 | 预估 |
|------|------|------|
| 1 | `teaching-overview.ts` 扩展 3 组 VO + 请求 + 映射 | 5 min |
| 2 | `constants/overview.ts` 契约去分页字段 | 2 min |
| 3 | `overview.ts` #27/#17 切真接口 + mock 回退 | 5 min |
| 4 | `teacher-warning-list` 去分页 + 滚动 | 4 min |
| 5 | `teacher-inspire-board` 去分页 + 滚动 | 4 min |
| 6 | 两组件 README 满足度 + 进度 | 3 min |
| 7 | lint + 验收走查 | 3 min |

---

## Task 1: 扩展 teaching-overview.ts

**文件（改）：**
`E:\code\dataView\apps-development-platform\apps\data-board\src\api\teaching-overview.ts`

> **Skill:** 无（纯 TS API 适配 · 置信度 &lt; 0.7）

### 1.1 VO（spec §4.2，不发明字段）

```ts
export interface WarningFocusResp {
  tenantUserId: string
  teacherName: string
  hint: string
  needsImprovementCount: number
  needsImprovementRate: number
}

export interface BenchmarkTeacherResp {
  tenantUserId: string
  teacherName: string
  /** 1 优秀稳定 / 2 示范课候选 —— 不消费，advice 由优秀率映射 */
  suggestion: number
  reportCount: number
  averageScore: number
  excellentRate: number
}

export interface RisingStarResp {
  tenantUserId: string
  teacherName: string
  /** 1 定向培养 / 2 冲线在望 —— 不消费 */
  suggestion: number
  reportCount: number
  excellentRate: number
}
```

### 1.2 请求（spec §4.1，仅 campusId + baseSemesterId）

```ts
export function getWarningFocusApi(params: { campusId: string, baseSemesterId: string }) {
  return request<{ code: number, msg: string, data: WarningFocusResp[] | null }>({
    method: 'get',
    url: '/classroom-dashboard/teaching-overview/warning-focus',
    params,
  })
}
// 同款：getBenchmarkTeachersApi → /benchmark-teachers
// 同款：getRisingStarsApi → /rising-stars
```

### 1.3 映射

```ts
/** 优秀率 0～1 → 整数 %（截断） */
function toPercent(rate: number) {
  return `${Math.trunc((rate ?? 0) * 100)}%`
}

/** 评分 1 位小数截断 */
function truncate1(value: number) {
  return (Math.floor((value ?? 0) * 10) / 10).toFixed(1)
}

/** 建议文案（spec §6.3，先整数截断再比较；不消费 suggestion） */
export function computeInspireAdvice(tab: 'benchmark' | 'potential', excellentRate: number) {
  const intRate = Math.trunc((excellentRate ?? 0) * 100)
  if (tab === 'benchmark')
    return intRate >= 50 ? '示范课候选' : '优秀稳定'
  return intRate >= 25 ? '冲线在望' : '定向培养'
}

export function mapWarningFocusToRows(list: WarningFocusResp[]): WarningRow[] { ... }
export function mapBenchmarkToRows(list: BenchmarkTeacherResp[]): InspireRow[] { ... }
export function mapRisingStarToRows(list: RisingStarResp[]): InspireRow[] { ... }
```

- 预警：`teacherId←tenantUserId`，`count←String(needsImprovementCount)`，`rate←toPercent`，`tip←hint`
- 激励：`grade: undefined`（接口无字段）；标杆 `avgScore←truncate1(averageScore)`；`advice←computeInspireAdvice`

**完成标准：** 可编译；三组映射齐；`suggestion` 不出现在映射输出。

---

## Task 2: 契约去分页

**文件（改）：**
`E:\code\dataView\apps-development-platform\apps\data-board\src\constants\overview.ts`

> **Skill:** 无

```ts
// WarningPageData { list, total } → WarningListData { list: WarningRow[] }
// InspirePageData { list, total } → InspireListData { list: InspireRow[] }
```

`WarningRow` / `InspireRow` **不动**。同步删除/更新引用 `WarningPageData`/`InspirePageData` 的类型导入。

**完成标准：** 无 `total`/`page` 字段残留于这两个契约。

---

## Task 3: overview.ts 切真接口

**文件（改）：**
`E:\code\dataView\apps-development-platform\apps\data-board\src\api\overview.ts`

> **Skill:** 无

### 3.1 签名（spec §5.2）

```ts
export async function getWarningListApi(params: { campusId?: string, semesterId?: string })
export async function getInspireListApi(params: { tab: InspireTab, campusId?: string, semesterId?: string })
```

### 3.2 回退（spec §8）

```
缺 campusId 或 semesterId → 直接 mock 数组
try 真接口
  code===200 && Array.isArray(data) → map*
  else → mock
catch → mock
// TODO(1.7.1-联调): 后端实现后移除 mock 回退
```

mock 源：`WARNING_ROWS` / `INSPIRE_ROWS` 改为返回**全量数组**（不再 slice）。

旧函数名 `getWarningPageApi` / `getInspirePageApi` **删除**（调用点在 Task 4/5 改）。

**完成标准：** 失败/参数不足仍拿到全量 mock 列表。

---

## Task 4: 预警去分页 + 滚动

**文件（改）：**
- `E:\code\dataView\apps-development-platform\apps\data-board\src\components\teacher-warning-list\teacher-warning-list.vue`
- `E:\code\dataView\apps-development-platform\apps\data-board\src\components\teacher-warning-list\teacher-warning-list.scss`

> **Skill:** 无（列表布局调整）

1. 调用点 `getWarningPageApi` → `getWarningListApi`；去掉 `page/pageSize` 状态
2. **删除** `<el-pagination>` 及相关样式
3. 表格：`max-height` 定高（表头 42 + 5×50 = **292px**），`overflow-y: auto`（el-table 自身滚动即可）
4. 标题 / 教师点击开详情 / 竞态防护：**不变**

**完成标准：** 无分页 UI；列表固定区滚动；点击弹窗仍可用。

---

## Task 5: 激励去分页 + 滚动

**文件（改）：**
- `E:\code\dataView\apps-development-platform\apps\data-board\src\components\teacher-inspire-board\teacher-inspire-board.vue`
- `E:\code\dataView\apps-development-platform\apps\data-board\src\components\teacher-inspire-board\teacher-inspire-board.scss`

> **Skill:** 无

1. `getInspirePageApi` → `getInspireListApi`；去 `page/pageSize`/`total`
2. **删除** `<el-pagination>`
3. 表格同款 `max-height: 292px` 滚动
4. tab 切换仍重拉（不再「重置页码」）；列配置 / `computeAdvice` / 截断：**不变**

**完成标准：** 双 tab + 列差异 + 建议胶囊不变；无分页。

---

## Task 6: README ×2

**文件（改）：**
- `E:\code\dataView\apps-development-platform\apps\data-board\src\components\teacher-warning-list\README.md`
- `E:\code\dataView\apps-development-platform\apps\data-board\src\components\teacher-inspire-board\README.md`

> **Skill:** 无（文档）

各补两表：

1. **接口满足度**（spec §2 摘录）——写清「是否满足」
2. **对接进度**（spec §9）

并更新「接口对接指引」：函数名 Page→List、去分页、`suggestion` 不消费、`computeAdvice` 规则。

**完成标准：** 两 README 均含「是否满足」结论与进度表。

---

## Task 7: 校验

> **Skill:** 无

1. eslint 改动文件
2. 核对 spec §10 验收 10 项
3. 有条件则 dev 走查：预警 5 行滚动、激励双 tab、建议四分支、空态

**完成标准：** lint 0 error；验收自检通过。

---

## 依赖顺序

```
Task 1 (VO+映射) → Task 2 (契约) → Task 3 (api 切换)
                                      ↓
                         Task 4 (预警 UI) + Task 5 (激励 UI)
                                      ↓
                              Task 6 (README) → Task 7 (校验)
```

---

## 风险

| 风险 | 处理 |
|------|------|
| RisingStar 序列化 | VO 按文档；联调验证 |
| 无 grade | 年级列空 + 进度表 |
| 后端未实现 | mock 回退 |
| 行数很多 | 固定区滚动（P1 确认） |
