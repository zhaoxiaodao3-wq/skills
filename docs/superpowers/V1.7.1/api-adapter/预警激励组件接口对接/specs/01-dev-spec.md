# 预警激励组件接口对接 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**类型:** api-adapter（含列表 UI：去分页改滚动）
**目标应用:** `apps/data-board`
**版本:** V1.7.1
**方案:** A（修订版）· P1 已确认（2026-10-21）

---

## 1. 背景与目标

`teacher-warning-list`（预警）与 `teacher-inspire-board`（激励榜）UI 已交付，数据为 mock（`#27` 预警分页、`#17` 激励榜分页）。教学概览文档已给出三个接口字段契约，后端均未实现（`code: 50000`）。

**目标：**

1. 按文档写好三个接口的 VO / 请求 / VO→前端契约映射
2. 切真接口 + mock 回退（同「组内即时关注」模式）
3. **取消分页**，固定可视区 + 内部滚动（后端返回全量数组）
4. 建议文案由**优秀率前端映射**（不消费接口 `suggestion`）
5. README 写清**接口满足度**与对接进度

**非目标：**

- 其余教学概览接口
- 组件自带年级/学段筛选（确认无筛选）
- 服务端分页
- 后端实现 / 联调通过
- Figma 样式重做

---

## 2. 接口满足度（P1 确认结论）

### 2.1 预警 `warning-focus`

| 页面需要 | 接口字段 | 满足 |
|----------|----------|------|
| teacherId | `tenantUserId` | ✅ |
| teacherName | `teacherName` | ✅ |
| count（待改进数量） | `needsImprovementCount` | ✅ |
| rate（待改进率） | `needsImprovementRate` 0～1 | ✅ 转 `%` |
| tip（提示） | `hint` | ✅ |
| 分页 | 无 | ✅ **不需要**（改滚动） |
| 筛选 | 无 | ✅ **不需要**（纯展示） |

### 2.2 标杆 `benchmark-teachers`

| 页面需要 | 接口字段 | 满足 |
|----------|----------|------|
| teacherName | `teacherName` | ✅ |
| reportCount | `reportCount` | ✅ |
| avgScore | `averageScore` | ✅ |
| excellentRate | `excellentRate` 0～1 | ✅ 转整数 `%` |
| advice | 无（`suggestion` 不消费） | ✅ 前端按优秀率映射 |
| grade（备课页列） | **无** | ❌ **缺字段** |
| 分页 / 筛选 | 无 | ✅ 不需要 |

### 2.3 潜力 `rising-stars`

| 页面需要 | 接口字段 | 满足 |
|----------|----------|------|
| teacherName | `teacherName` | ✅ |
| reportCount | `reportCount` | ✅ |
| excellentRate | `excellentRate` 0～1 | ✅ 转整数 `%` |
| advice | 无 | ✅ 前端映射 |
| avgScore | 无（文档明确无） | ✅ 潜力表本就不展示 |
| grade（备课页列） | **无** | ❌ **缺字段** |
| 分页 / 筛选 | 无 | ✅ 不需要 |

**风险：** `RisingStarResp` 缺 getter/`@Data`，序列化待后端完善。

### 2.4 总结论

> **主体展示字段满足；分页/筛选本就不需要；仅激励榜年级列缺 `grade` 字段。**

---

## 3. 架构

```
apps/data-board/src/api/teaching-overview.ts     ← 扩展 3 组 VO + 请求 + 映射
        │
        ▼
apps/data-board/src/api/overview.ts              ← #27/#17 切真接口 + mock 回退；纯列表
        │
        ├─→ teacher-warning-list   去分页 → 固定区 + 滚动
        └─→ teacher-inspire-board  去分页 → 固定区 + 滚动
```

| 层 | 文件 | 改动 |
|----|------|------|
| API VO+请求+映射 | `src/api/teaching-overview.ts` | **扩展** |
| 入口封装 | `src/api/overview.ts` | **改** #27/#17 |
| 契约常量 | `src/constants/overview.ts` | **改** 列表契约去分页字段 |
| 预警组件 | `src/components/teacher-warning-list/*` | **改** 去分页 + 滚动 |
| 激励组件 | `src/components/teacher-inspire-board/*` | **改** 去分页 + 滚动 |
| README ×2 | 两组件 README | **改** 满足度 + 进度 |
| 样式 | 各 `.scss` | **改** 固定高 + overflow |

---

## 4. API 契约

### 4.1 请求（均为 GET + Query）

```ts
// 预警聚焦
getWarningFocusApi(params: { campusId: string, baseSemesterId: string })
// GET /classroom-dashboard/teaching-overview/warning-focus

// 标杆教师
getBenchmarkTeachersApi(params: { campusId: string, baseSemesterId: string })
// GET /classroom-dashboard/teaching-overview/benchmark-teachers

// 潜力之星
getRisingStarsApi(params: { campusId: string, baseSemesterId: string })
// GET /classroom-dashboard/teaching-overview/rising-stars
```

**请求参数：仅 `campusId` + `baseSemesterId`。** 无年级/学段/科目参数。

### 4.2 VO（严格按文档）

```ts
export interface WarningFocusResp {
  tenantUserId: string
  teacherName: string
  hint: string
  needsImprovementCount: number
  needsImprovementRate: number  // 0～1
}

export interface BenchmarkTeacherResp {
  tenantUserId: string
  teacherName: string
  suggestion: number  // 1 优秀稳定 / 2 示范课候选 —— 不消费
  reportCount: number
  averageScore: number
  excellentRate: number  // 0～1
}

export interface RisingStarResp {
  tenantUserId: string
  teacherName: string
  suggestion: number  // 1 定向培养 / 2 冲线在望 —— 不消费
  reportCount: number
  excellentRate: number  // 0～1
  // 文档明确无 averageScore
}
```

**统一响应：** `{ code: 200, msg: 'ok', data: [...] }`；未实现时 `code: 50000, data: null`。

---

## 5. 前端契约变更（去分页）

### 5.1 `constants/overview.ts`

```ts
// 旧：WarningPageData { list, total }
// 新：
export interface WarningListData {
  list: WarningRow[]
}

// 旧：InspirePageData { list, total }
// 新：
export interface InspireListData {
  list: InspireRow[]
}
```

`WarningRow` / `InspireRow` **字段不变**。

### 5.2 API 函数签名

```ts
// 旧：getWarningPageApi({ ..., page, pageSize }) → { list, total }
// 新：
getWarningListApi(params: { campusId?, semesterId? }) → { code, data: WarningRow[] }

// 旧：getInspirePageApi({ tab, ..., page, pageSize }) → { list, total }
// 新：
getInspireListApi(params: { tab: InspireTab, campusId?, semesterId? }) → { code, data: InspireRow[] }
```

> 函数名随语义从 Page→List 调整；组件内调用点同步。`getWarningTeacherDetailApi` 保留不动（已由公共详情弹窗替代，不在本期）。

---

## 6. 映射规则

### 6.1 预警 `mapWarningFocusToRow`

| 前端 | VO | 规则 |
|------|-----|------|
| key | — | `warn-${index}` |
| teacherId | tenantUserId | 直传 |
| teacherName | teacherName | 直传 |
| count | needsImprovementCount | `String(n)` |
| rate | needsImprovementRate | `${Math.trunc(r * 100)}%` |
| tip | hint | 直传 |

### 6.2 激励 `mapBenchmar/RisingToRow`

| 前端 | 标杆 VO | 潜力 VO | 规则 |
|------|---------|---------|------|
| key | — | — | `${tab}-${index}` |
| teacherName | teacherName | teacherName | 直传 |
| grade | **无** | **无** | `undefined`（备课页显示空） |
| reportCount | reportCount | reportCount | `String(n)` |
| avgScore | averageScore | — | `truncate1(score)`（仅标杆） |
| excellentRate | excellentRate | excellentRate | `${Math.trunc(r * 100)}%` |
| advice | — | — | `computeAdvice(tab, rate)`（**不用 suggestion**） |

### 6.3 建议文案 `computeAdvice`（规则锁定，P1 确认）

| tab | 规则 | 文案 |
|-----|------|------|
| benchmark | 整数优秀率 **≥50** | 示范课候选 |
| benchmark | &lt;50 | 优秀稳定 |
| potential | 整数优秀率 **≥25** | 冲线在望 |
| potential | &lt;25 | 定向培养 |

口径：**先整数截断再比较**（`'96.7%' → 96`）。

### 6.4 截断

- 优秀率：整数百分比，截断不四舍五入
- 评分均分：1 位小数，截断不四舍五入

---

## 7. 组件 UI：去分页 → 滚动

### 7.1 预警 `teacher-warning-list`

- **删除** el-pagination（含相关状态 `page/pageSize/total`）
- 表格外包固定可视区：与现表格等效约 **5 行**（表头 42 + 5×50）或沿用现高度；`max-height` + `overflow-y: auto`
- 空态仍用 el-table「暂无数据」
- 标题 / 筛选上下文 / 点击开详情弹窗：**不变**

### 7.2 激励 `teacher-inspire-board`

- **删除** el-pagination
- 双 tab 切换逻辑不变（不再重置页码，仅重拉）
- 表格固定可视区 + 内部滚动（同预警）
- 列配置（标杆有均分 / 潜力无均分 / 备课+年级）：**不变**
- 建议列胶囊：**不变**（仍走 `computeAdvice`）

### 7.3 固定区高度

两个组件统一：表头 + **5 行数据**可滚动（与原分页 10 条/页相比更矮或接近；以 scss 中 `max-height` 定常量，注释标明）。

---

## 8. mock 回退

```
buildParams(campusId, semesterId) → 仅这两项
  缺任一 → 不发请求，返回 mock 列表

调 getWarningFocusApi / getBenchmarkTeachersApi / getRisingStarsApi
  code===200 && Array.isArray(data) → map*
  否则 / 异常 → 现有 mock 数组

// TODO(1.7.1-联调): 后端实现后移除 mock 回退
```

mock 返回**全量数组**（不再切片），与「去分页」一致。

---

## 9. 进度记录（两组件 README 各写一份）

| 项 | 状态 | 说明 |
|----|------|------|
| VO / 请求 / 映射 | ✅ | `teaching-overview.ts` |
| #27/#17 切真接口 | ✅ | 失败回退 mock |
| 分页→滚动 | ✅ | P1 确认取消分页 |
| suggestion 消费 | ✅ 不消费 | 建议文案由优秀率映射 |
| grade 字段 | ❌ 缺 | 接口无；备课页年级列空 |
| 后端实现 | ❌ | 11 接口均未实现 |
| 真实联调 | ❌ | 后端实现后 |
| RisingStar 序列化 | ⚠️ | 后端缺 getter，待完善 |

---

## 10. 验收标准

- [ ] 三个请求 GET+Query，仅 `campusId`/`baseSemesterId`
- [ ] VO 字段与文档一一对应；`suggestion` 定义但**不消费**
- [ ] 预警映射：rate 0～1→`%`、tip←hint、id←tenantUserId
- [ ] 激励映射：优秀率整数截断、均分 1 位截断、`advice←computeAdvice`
- [ ] `computeAdvice`：标杆 ≥50 示范课候选；潜力 ≥25 冲线在望
- [ ] 分页组件已删除；固定区 + 滚动；空态保留
- [ ] mock 回退：50000/失败/参数不足仍展示列表
- [ ] 函数签名改为 List 语义；组件可编译
- [ ] 两 README 含接口满足度表 + 对接进度表
- [ ] 样式不回退（标题/列/胶囊/点击行为不变）

---

## 11. 风险

| 风险 | 处理 |
|------|------|
| RisingStar 序列化缺陷 | VO 按文档写；联调验证 |
| 无 grade 字段 | 年级列空；进度表记录 |
| 后端未实现 | mock 回退 |
| 去分页后行数很多 | 固定区滚动（P1 确认） |
