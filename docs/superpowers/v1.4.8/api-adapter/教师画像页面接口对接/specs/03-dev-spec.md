# 教师画像页面 — 教师风格分析三模块 HTTP 接入 开发规格

**Requirement:** [requirements/03-教师风格分析三模块HTTP接入.md](../requirements/03-教师风格分析三模块HTTP接入.md)

**变更依据：**

- [docs/V1.4.8_教师画像_教师风格分析模块_接口字段设计.md](../docs/V1.4.8_教师画像_教师风格分析模块_接口字段设计.md)

**前置交付：**

- [archive/02-教师画像页面HTTP接入与VO变更-delivered.md](../archive/02-教师画像页面HTTP接入与VO变更-delivered.md)

---

## 1. 目标

在 02 已接入的 `getTeacherProfile` 链路上：

1. 扩展 `TeacherProfileRspVO` 与 `adaptTeacherProfileSlices` 至 **9 模块**
2. 新增 3 个 Adapter：`personalTagCloud`、`teachingStyleTrend`、`teachingStyleElasticity`
3. 扩展 3 个 slice 类型 + 微调 3 个 Container（**仅 HTTP 模式**走接口展示逻辑）
4. Mock 开关 ON 时，3 模块数据与展示 **与现网完全一致**

---

## 2. 方案（已定：方案 A — 延续 02 双轨）

- 单接口 `getTeacherProfile`，门面 `adaptTeacherProfileSlices` 扩展 3 路 Adapter
- `mergeTeacherPortraitAggregate`：Mock ON 时 3 风格模块 **强制使用 `FULL_MOCK_BASE`**，忽略 Adapter 产出
- Container 通过 `isTeacherPortraitMockEnabled()` 分支展示逻辑（非 slice 内 `dataSource` 字段）

---

## 3. 架构与数据流

```
useTeacherPortraitData(activeTeacherId)
  → resolve vo
       ├─ mock ON  → getTeacherProfileApiMock(teacherId)
       └─ mock OFF → getTeacherProfile({ tenantUserId })
  → adaptTeacherProfileSlices(vo)     // 9 模块
  → mergeTeacherPortraitAggregate(adapted, {
       styleModulesFromBase: isTeacherPortraitMockEnabled(),
     })
  → aggregate
```

### 3.1 merge 规则（相对 02 变更）

| 模块组 | Mock ON | Mock OFF |
|--------|---------|----------|
| 02 六模块 | Adapter 产出（API mock fixture） | HTTP Adapter |
| 03 三模块 | **`FULL_MOCK_BASE` 覆盖** | HTTP Adapter |
| myInfo / teacherPortrait | `FULL_MOCK_BASE` | `FULL_MOCK_BASE` |

`FULL_MOCK_BASE` 移除 `personalTagCloud`、`teachingStyleTrend`、`teachingStyleFlexibility` 常量引用后，仅在 `merge(..., { styleModulesFromBase: true })` 时注入。

`emptyAdaptedTeacherProfileSlices` / HTTP 失败：9 模块 slice 均为 `null`。

---

## 4. VO 类型扩展

文件：`api/types/teacher-profile-rsp.vo.ts`

```ts
export type TeacherProfileRspVO = {
  // ...02 已有 6 字段
  personalTagCloud?: PersonalTagCloudVO | null
  teachingStyleTrend?: TeachingStyleTrendVO | null
  teachingStyleElasticity?: TeachingStyleElasticityVO | null
}
```

### 4.1 PersonalTagCloudVO

```ts
export type TagItemVO = { tagValue?: string; count?: number; rank?: number }
export type TagCategoryVO = {
  categoryName?: string
  categoryType?: string  // speech | emotion | power | subject_math | ...
  tags?: TagItemVO[]
}
export type PersonalTagCloudVO = {
  totalReportCount?: number
  tagCategories?: TagCategoryVO[]
}
```

### 4.2 TeachingStyleTrendVO

```ts
export type StyleCountItemVO = {
  styleName?: string
  count?: number
  dominateCount?: number
  auxiliaryCount?: number
}
export type TrendPointVO = {
  reportLabel?: string
  reportTime?: number
  reportTopic?: string
  dominantStyle?: string
  auxiliaryStyle?: string
  stylePosition?: number  // 0-4
}
export type TeachingStyleTrendVO = {
  dominantStyle?: string
  auxiliaryStyle?: string
  styleCounts?: StyleCountItemVO[]
  trendPoints?: TrendPointVO[]
}
```

### 4.3 TeachingStyleElasticityVO

```ts
export type SituationStatVO = {
  situationName?: string
  strongCount?: number
  mediumCount?: number
  weakCount?: number
  dominantLevel?: string  // 强 | 中 | 弱
  summary?: string
  description?: string
}
export type TeachingStyleElasticityVO = {
  dominantStyle?: string
  auxiliaryStyle?: string
  sciAverage?: number
  sciLevel?: string
  styleCounts?: StyleCountItemVO[]
  situationStats?: SituationStatVO[]
  elasticitySummary?: string
}
```

### 4.4 字段名兼容

联调若出现与文档不一致的 key（参考 02 `areport`/`breport` 教训），在对应 Adapter 入口 `normalize*` 双读，单测覆盖。

---

## 5. Slice 契约扩展

### 5.1 PersonalTagCloudSlice

```ts
export type TagCloudTagSlice = { label: string; count: number; rank: number }

export type TagCloudModuleSlice = {
  type: TagCloudModuleType
  title: string
  /** HTTP：动态标签列表 */
  tags?: TagCloudTagSlice[]
  /** Mock：词表 count 映射（保留） */
  counts?: Record<string, number>
}

export type PersonalTagCloudSlice = {
  totalReportCount?: number
  modules: TagCloudModuleSlice[]
}
```

### 5.2 TeachingStyleTrendSlice

```ts
export type TeachingStyleTrendReportItem = {
  label?: string
  dominantStyle?: string | null
  auxiliaryStyle?: string | null
  dominantPosition?: number | null  // 0-4，HTTP
  scores?: Partial<Record<TeacherStyleName, number>>  // Mock 兼容
}

export type TeachingStyleTrendSlice = {
  reports: TeachingStyleTrendReportItem[]
}
```

### 5.3 TeachingStyleFlexibilitySlice

```ts
export type SituationItemSlice = {
  situationName: string
  summary: string
  level: 'strong' | 'medium' | 'weak'  // 由 dominantLevel 强/中/弱映射
}

export type TeachingStyleFlexibilitySlice = {
  dominantStyle: TeachingStyleType | null
  auxiliaryStyle: TeachingStyleType | null
  styleScores: Partial<Record<TeachingStyleType, number>> | null
  /** Mock */
  scenarios?: Partial<Record<TeachingScenarioKey, ScenarioLevel>> | null
  stability?: StabilityLevel | null
  /** HTTP */
  sciLevel?: string | null
  situations?: SituationItemSlice[] | null
  elasticitySummary?: string | null
}
```

---

## 6. Adapter 规格

### 6.1 adaptPersonalTagCloud

| 规则 | 说明 |
|------|------|
| categoryType 映射 | `speech`→`discourse`，`emotion`→`emotion`，`power`→`power`，`subject_*`→`subject` |
| 标签 | `tagValue`→`label`，保留 `count`、`rank` |
| 排序 | 写入 slice 后由 Container 按 count 降序、rank 升序（与现 `sortTagItems` 一致） |
| 判空 | 无 `tagCategories` 或全无 tags → `null` |

### 6.2 adaptTeachingStyleTrend

| 规则 | 说明 |
|------|------|
| 数据源 | 仅 `trendPoints[]`（忽略顶层 `styleCounts` 用于趋势图） |
| 映射 | 见 Requirement §3.2 |
| 风格名校验 | `normalizeTeacherStyleName`；无效则为 `null` |
| 判空 | `trendPoints` 为空 → `null` |

新增常量（建议 `teaching-style-trend/constants.ts`）：

```ts
export const TEACHING_STYLE_Y_AXIS_API = [
  '温暖引导型', '理性启发型', '权威传授型', '激情讲授型', '严厉规训型',
] as const
```

### 6.3 adaptTeachingStyleElasticity

文件建议：`adapters/teaching-style-flexibility.adapter.ts`（slice 名保持 `teachingStyleFlexibility`）

| 规则 | 说明 |
|------|------|
| VO 读取 | `vo.teachingStyleElasticity`（及别名兼容） |
| styleScores | `styleCounts[].styleName` + `.count` |
| situations | `situationStats` 映射；`dominantLevel` 强→`strong`，中→`medium`，弱→`weak` |
| 不填 | `scenarios`、`stability`（仅 Mock slice 使用） |
| 判空 | 无 `styleCounts` 且无 `situationStats` 且无 `sciLevel` → `null`（实现时可放宽：有任一核心字段即产出） |

### 6.4 adaptTeacherProfileSlices 门面

```ts
return {
  // ...02 六模块
  personalTagCloud: adaptPersonalTagCloud(vo.personalTagCloud),
  teachingStyleTrend: adaptTeachingStyleTrend(vo.teachingStyleTrend),
  teachingStyleFlexibility: adaptTeachingStyleElasticity(vo.teachingStyleElasticity),
}
```

---

## 7. Container 双轨展示

分支：`isTeacherPortraitMockEnabled()` from `teacher-portrait-debug.ts`。

### 7.1 PersonalTagCloudContainer

| Mock ON | Mock OFF |
|---------|----------|
| `buildModulesFromSlice` + 固定 `DISCOURSE_TAGS` 等 | `module.tags` 直接渲染，不经过词表过滤 |
| `isDefaultEmpty` 逻辑不变 | 无 tags → 空态 |

ViewModel 可增加 `useDynamicTags: boolean` 或在 Container 内分支构建。

### 7.2 TeachingStyleTrendContainer + trend-chart-options

| Mock ON | Mock OFF |
|---------|----------|
| `buildReportLabel(idx)` | `report.label` |
| yAxis: `TEACHER_STYLE_ORDER` | yAxis: `TEACHING_STYLE_Y_AXIS_API` |
| series data: 风格名（现有） | 主导：`dominantPosition`；辅助：风格名→API 纵轴 index |

`buildTeachingStyleTrendChartOption` 增加参数 `yAxisOrder: readonly string[]` 与 `usePositionData: boolean`。

折线 series 在 category yAxis 下需传 **数值索引**（非风格名字符串），HTTP 模式统一用 position/index。

### 7.3 TeachingStyleFlexibilityContainer + View

| Mock ON | Mock OFF |
|---------|----------|
| `getStabilityTitle(stability)` | 标题：`'课中教学稳定性'` + `slice.sciLevel` |
| `getStabilityDescription(stability)` | `slice.elasticitySummary` |
| `TEACHING_SCENARIO_KEYS` 固定行 | `slice.situations` 动态行 |
| `getScenarioLabel(key, level)` | `situation.summary` 作标签文案 |
| 标签样式 `getScenarioLevelStyle(level)` | 同函数，level 来自 mapped `dominantLevel` |

新增 `sciLevel` → `StabilityLevel` 映射（仅用于 **标题区背景样式**）：

```ts
高弹性 → high | 中等弹性 → medium | 低弹性 → low
```

标题**文案**用 `sciLevel` 原值，不用 `STABILITY_LEVEL_LABELS`。

ViewModel 扩展建议：

```ts
type TeachingStyleFlexibilityViewModel = {
  isEmpty: boolean
  useApiCopy: boolean  // 或 Container 内分支，不暴露给 View
  // ...existing fields
  sciLevel?: string | null
  elasticitySummary?: string | null
  situations?: SituationItemViewModel[]
}
```

---

## 8. Mock fixture

`mock/teacher-profile-api.mock.ts`：

- `FULL_TEACHER_PROFILE_API` 增加 §五 JSON 中 3 模块（便于 Mock ON 时六模块联调；三模块仍被 merge 覆盖为 `FULL_MOCK_BASE`）
- 可选 `PARTIAL` / 空 fixture 用于单测

`mock/teacher-portrait-aggregate.mock.ts`：

- `FULL_MOCK_BASE` 保留三模块 mock 常量（仅 merge 注入用）
- `mergeTeacherPortraitAggregate` 增加 `styleModulesFromBase` 选项

---

## 9. 文件清单

| 操作 | 路径 |
|------|------|
| 改 | `api/types/teacher-profile-rsp.vo.ts` |
| 新建 | `adapters/personal-tag-cloud.adapter.ts` |
| 新建 | `adapters/teaching-style-trend.adapter.ts` |
| 新建 | `adapters/teaching-style-flexibility.adapter.ts` |
| 改 | `adapters/index.ts` |
| 改 | `adapters/teacher-profile.adapter.spec.ts` |
| 改 | `types/aggregate.ts` + 各组件 `types.ts` |
| 改 | `mock/teacher-profile-api.mock.ts` |
| 改 | `mock/teacher-portrait-aggregate.mock.ts` |
| 改 | `api/merge-teacher-portrait-aggregate.ts`（若 merge 签名变更） |
| 改 | `PersonalTagCloudContainer.vue` |
| 改 | `TeachingStyleTrendContainer.vue` + `trend-chart-options.ts` |
| 改 | `TeachingStyleFlexibilityContainer.vue` + `TeachingStyleFlexibilityView.vue` |
| 改 | `teaching-style-flexibility/constants.ts`（`sciLevel` 映射） |
| 改 | `teaching-style-trend/constants.ts`（`TEACHING_STYLE_Y_AXIS_API`） |

**不改动**：`myInfo`、`TeacherPortraitCard` 相关文件。

---

## 10. 测试策略

**vitest：**

1. `adaptPersonalTagCloud` — 文档 JSON → modules/tags
2. `adaptTeachingStyleTrend` — trendPoints → reports + position
3. `adaptTeachingStyleElasticity` — situationStats + elasticitySummary
4. `adaptTeacherProfileSlices` — 全量 9 模块 fixture
5. 判空与字段别名（若有）

**手工：**

1. Mock ON → 三模块与改前视觉一致
2. Mock OFF → 联调真实 JSON，标签云动态、趋势纵轴顺序、弹性文案
3. Mock OFF + 缺字段 → 空态
4. 断网 → toast + 九模块空态

---

## 11. 验收标准

对齐 [requirements/03 §六](../requirements/03-教师风格分析三模块HTTP接入.md#六验收标准草案)：

- [ ] 9 模块 Adapter 门面与 merge 双轨按 §3.1 工作
- [ ] 3 个 Container HTTP 分支符合 §7
- [ ] Mock ON 三模块行为回归通过
- [ ] API mock fixture 含 3 模块
- [ ] 单测与 typecheck 通过

---

## 12. 不在范围

- 教师画像卡片 / 我的信息 HTTP
- 趋势 Tooltip 增强（topic/time）
- 弹性模块 `description` 字段展示（接口有，本阶段不用）
