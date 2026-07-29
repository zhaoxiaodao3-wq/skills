# 教师画像页面 — 弹性字段替换与画像卡片补全 开发规格

**Requirement:** [requirements/05-教师风格分析VO变更r2r3.md](../requirements/05-教师风格分析VO变更r2r3.md)

**变更依据：**

- [docs/V1.4.8_教师画像_教师风格分析模块_字段变更记录.md](../docs/V1.4.8_教师画像_教师风格分析模块_字段变更记录.md)（r2）
- [docs/V1.4.8_教师画像_教师风格分析模块_接口字段设计(1).md](../docs/V1.4.8_教师画像_教师风格分析模块_接口字段设计(1).md)（r2 + r3）

**前置交付：**

- [archive/03-教师风格分析三模块HTTP接入-delivered.md](../archive/03-教师风格分析三模块HTTP接入-delivered.md)
- [archive/04-教学统计与教师基本信息HTTP接入-delivered.md](../archive/04-教学统计与教师基本信息HTTP接入-delivered.md)

---

## 1. 目标

两条**独立链路**，一次交付：

| 链路 | 目的 | 影响组件 |
|------|------|----------|
| **A** | `teachingStyleElasticity` 字段替换（r2） | `TeachingStyleFlexibilityContainer` |
| **B** | `personalFeature` 补全画像卡片缺口（r3） | `TeacherPortraitCardContainer` |

**不改动**：`personalTagCloud`、`teachingStyleTrend`、我的信息、教学统计、Mock ON 全页 mock。

---

## 2. 链路 A — 弹性模块字段替换

### 2.1 VO 变更

`TeachingStyleElasticityVO`：

| 操作 | 字段 |
|------|------|
| 删除 | `sciLevel`、`elasticitySummary` |
| 新增 | `stability`、`stabilityDescription` |

其余字段（`dominantStyle`、`auxiliaryStyle`、`sciAverage`、`styleCounts`、`situationStats`）不变。

### 2.2 Adapter

`adaptTeachingStyleElasticity`：

- 输出 slice 字段：`stability`（原值字符串）、`stabilityDescription`（原值字符串）
- 删除：`sciLevel`、`elasticitySummary` 映射
- 空值判定：无 `styleCounts`/`situationStats` 时，若 `stability` 或 `stabilityDescription` 有值仍可产出 slice

### 2.3 Container（HTTP / `useApiCopy` 分支）

| 展示 | 规则 |
|------|------|
| 标题 | `课中教学稳定性：{stability}` |
| 描述 | 直出 `stabilityDescription` |
| 背景色 | `stability` → `StabilityLevel`：`高稳定性`→high，`中等稳定性`→medium，`低稳定性`→low |
| 情境行 | 不变（仍用 `situations[]`） |
| 雷达图 | 不变 |

Mock 分支（`stability` + `getStabilityTitle`/`getStabilityDescription`）**不变**。

### 2.4 清理

- 删除 `mapSciLevelToStability`（或替换为 `mapStabilityLabelToLevel(stability: string)`）
- slice / ViewModel 类型删除 `sciLevel`、`elasticitySummary`（HTTP 专用字段）

---

## 3. 链路 B — 画像卡片补全

### 3.1 VO 新增

```ts
export type PersonalFeatureVO = {
  speechFeature?: string
  emotionFeature?: string
  powerFeature?: string
  subjectFeature?: string
  dominantStyle?: string
  auxiliaryStyle?: string
}

// TeacherProfileRspVO 顶层新增
personalFeature?: PersonalFeatureVO | null
```

### 3.2 Adapter

新建 `adaptPersonalFeature(vo) → TeacherPortraitSlice | null`（**仅风格/标签字段**）：

| 接口 | slice |
|------|-------|
| `dominantStyle` | `dominantStyle` |
| `auxiliaryStyle` | `secondaryStyle` |
| `speechFeature` | `discourseStyleTags: [speechFeature]`（有值时） |
| `emotionFeature` | `emotionalStyleTags: [emotionFeature]` |
| `powerFeature` | `powerRelationTags: [powerFeature]` |
| `subjectFeature` | 简化为单标签：可用 `discourseStyleTags` 之外的第 4 项，或扩展 slice；**推荐** HTTP 模式卡片直接读 `featureTags` 数组，由 adapter 产出 `featureTags?: string[]` 附加字段，或 Container 从上述 tags 数组拼装 |

**实现约定（推荐）**：adapter 产出标准 `TeacherPortraitSlice` 子集；卡片 HTTP 模式用专用 helper：

```ts
function buildFeatureTagsFromPersonalFeature(slice): string[] {
  return [speech, emotion, power, subject].filter(Boolean)
}
```

不在 HTTP 模式复用 mock 的 `subjectAdaptations` 复杂选取逻辑。

### 3.3 merge 规则

```ts
// HTTP 路径（styleModulesFromBase: false）
teacherPortrait: adaptPersonalFeature(vo.personalFeature)

// Mock ON 路径（styleModulesFromBase: true）
teacherPortrait: FULL_MOCK_BASE.teacherPortrait  // 不变
```

### 3.4 卡片 Container

| 字段 | Mock OFF | Mock ON |
|------|----------|---------|
| 姓名/性别/科目 | Context `activeTeacherProfile` | Context + mock slice 回退 |
| 上课时长 | `teachingStatistics` | mock 统计 |
| 主导/辅助风格 | `teacherPortrait` slice（来自 personalFeature） | mock slice |
| 画像 URL | 由 slice 风格 + Context 性别计算 | 同左 |
| 特征标签 | personalFeature 四字段 | `selectPersonalFeatureTags(mock slice)` |

**空态**：`!dominantStyle || !secondaryStyle` → `isEmpty: true`（与现逻辑一致）；标签可部分缺失。

### 3.5 与链路 A 隔离

- 卡片**不读取** `teachingStyleElasticity`
- 弹性模块**不读取** `personalFeature`

---

## 4. 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `api/types/teacher-profile-rsp.vo.ts` |
| 改 | `adapters/teaching-style-flexibility.adapter.ts` |
| 新增 | `adapters/personal-feature.adapter.ts` |
| 改 | `adapters/index.ts` |
| 改 | `components/teaching-style-flexibility/types.ts` |
| 改 | `components/teaching-style-flexibility/constants.ts` |
| 改 | `components/teaching-style-flexibility/TeachingStyleFlexibilityContainer.vue` |
| 改 | `components/teacher-portrait-card/TeacherPortraitCardContainer.vue` |
| 改 | `mock/teacher-profile-api.mock.ts` |
| 改 | `mock/teacher-portrait-aggregate.mock.ts` |
| 改 | `adapters/teacher-profile.adapter.spec.ts` |

---

## 5. 非目标

- 趋势图 Tooltip（`reportTopic`/`reportTime`）
- `situationStats[].description` 展示
- 从 `personalTagCloud`/`teachingStyleTrend` 前端二次聚合 personalFeature

---

## 6. 验收标准

### 链路 A（弹性）

- [x] HTTP mock fixture 使用 `stability`/`stabilityDescription`，无 `sciLevel`/`elasticitySummary`
- [x] Mock OFF：标题为 `课中教学稳定性：高稳定性` 等；描述为接口固定话术
- [x] Mock ON：展示逻辑与改前一致
- [x] 雷达图、情境行回归正常

### 链路 B（画像卡片）

- [x] HTTP 路径 `teacherPortrait` 来自 `personalFeature` adapter
- [x] Mock OFF：卡片展示主导/辅助风格、画像图、最多 4 个特征标签
- [x] Mock OFF：姓名/性别/科目/时长仍来自 04 链路，不被 personalFeature 覆盖
- [x] Mock ON：卡片仍用 `FULL_MOCK_BASE.teacherPortrait`
- [x] `personalFeature` 缺主导或辅助风格时卡片空态

### 回归

- [x] `vitest` adapter spec 全通过
- [x] `pnpm typecheck` 通过
- [x] 标签云、趋势模块 Mock OFF 展示不变
