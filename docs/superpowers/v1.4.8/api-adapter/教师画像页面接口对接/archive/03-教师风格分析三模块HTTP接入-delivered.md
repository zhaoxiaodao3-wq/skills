# 教师画像页面 · 教师风格分析三模块 HTTP 接入交付归档

**归档类型：** api-adapter 正式对接交付快照  
**归档日期：** 2026-07-10  
**版本：** v1.4.8  
**阶段：** 03 — 教师风格分析三模块 HTTP 接入  
**Requirement:** [../requirements/03-教师风格分析三模块HTTP接入.md](../requirements/03-教师风格分析三模块HTTP接入.md)  
**Spec:** [../specs/03-dev-spec.md](../specs/03-dev-spec.md)  
**Plan:** [../plans/03-dev-plan.md](../plans/03-dev-plan.md)  
**前置归档:** [02-教师画像页面HTTP接入与VO变更-delivered.md](./02-教师画像页面HTTP接入与VO变更-delivered.md)

---

## 一、阶段说明

本归档标记 **「教师风格分析三模块 HTTP 接入」** 阶段交付完成。

在 02 已接入的 `GET /analysis/v2/teachingDiagnosis/getTeacherProfile` 链路上，扩展 `personalTagCloud`、`teachingStyleTrend`、`teachingStyleElasticity` 三个 VO 与 Adapter；`adaptTeacherProfileSlices` 由 6 模块扩展至 **9 模块**；三模块 Container 按 Mock 开关双轨展示；Mock ON 时三模块仍强制 `FULL_MOCK_BASE`，保持现网视觉与行为。

**当前数据流：**

```
activeTeacherId 变化
  → useTeacherPortraitData.fetchAggregate(tenantUserId)
       ├─ [Mock ON]  getTeacherProfileApiMock(teacherId)
       └─ [Mock OFF] getTeacherProfile({ tenantUserId })
  → adaptTeacherProfileSlices(vo)   // 9 模块
  → mergeTeacherPortraitAggregate(adapted, {}, { styleModulesFromBase })
       ├─ styleModulesFromBase: true  → 3 风格模块 ← FULL_MOCK_BASE
       ├─ styleModulesFromBase: false → 3 风格模块 ← HTTP Adapter
       ├─ 02 六模块 slice ← Adapter
       └─ myInfo / teacherPortrait ← FULL_MOCK_BASE
  → aggregate → Container（isTeacherPortraitMockEnabled 分支）→ View
```

---

## 二、交付范围（`TeacherProfileRspVO` 9/9 中本阶段新增 3/3）

| 接口字段 | aggregate slice | Adapter | Container |
|----------|-----------------|---------|-----------|
| `personalTagCloud` | `personalTagCloud` | `personal-tag-cloud.adapter.ts` | `PersonalTagCloudContainer` |
| `teachingStyleTrend` | `teachingStyleTrend` | `teaching-style-trend.adapter.ts` | `TeachingStyleTrendContainer` |
| `teachingStyleElasticity` | `teachingStyleFlexibility` | `teaching-style-flexibility.adapter.ts` | `TeachingStyleFlexibilityContainer` |

### 2.1 接口 → slice 映射要点

| 模块 | 关键映射 |
|------|----------|
| 个人标签云 | `tagCategories[].categoryType` → `discourse/emotion/power/subject`；`tagValue` → `label`；HTTP 模式直接渲染 `tags[]` |
| 教学风格趋势 | `trendPoints[].reportLabel` → `reports[].label`；`stylePosition` → `dominantPosition`；HTTP 纵轴用 `TEACHING_STYLE_Y_AXIS_API` |
| 教学风格与弹性 | `teachingStyleElasticity` → slice `teachingStyleFlexibility`；`sciLevel` + `elasticitySummary` + `situationStats` |

### 2.2 纵轴顺序差异（趋势图 HTTP 模式）

| 顺序来源 | 自下而上（position 0→4） |
|----------|--------------------------|
| Mock：`TEACHER_STYLE_ORDER` | 温暖引导型 → 理性启发型 → **激情讲授型** → **权威传授型** → 严厉规训型 |
| HTTP：`TEACHING_STYLE_Y_AXIS_API` | 温暖引导型 → 理性启发型 → **权威传授型** → **激情讲授型** → 严厉规训型 |

HTTP 模式必须以接口 `stylePosition` 为准，不可复用 Mock 纵轴常量。

### 2.3 Slice 扩展

```ts
// 个人标签云
PersonalTagCloudSlice += { totalReportCount?, modules[].tags? }
TagCloudModuleSlice.counts 改为可选（Mock 用 counts，HTTP 用 tags）

// 教学风格趋势
TeachingStyleTrendReportItem += { label?, dominantPosition? }
TeachingStyleTrendViewModel += { useApiMode, yAxisOrder, dominantPositions, auxiliaryPositions }

// 教学风格与弹性
TeachingStyleFlexibilitySlice += { sciLevel?, situations?, elasticitySummary? }
scenarios / stability 改为可选（仅 Mock slice 填充）
TeachingStyleFlexibilityViewModel += { useApiCopy, stabilityTitle?, stabilityDescription?, situations? }
```

---

## 三、Container 双轨展示规则

分支依据：`isTeacherPortraitMockEnabled()`（`teacher-portrait-debug.ts`）。

| 模块 | Mock ON | Mock OFF（HTTP） |
|------|---------|------------------|
| **个人标签云** | `buildModulesFromSlice` + 固定 `DISCOURSE_TAGS` 等词表 | `buildModulesFromApiTags`，直接渲染 `module.tags` |
| **教学风格趋势** | `buildReportLabel(idx)` + `TEACHER_STYLE_ORDER` | `report.label` + `TEACHING_STYLE_Y_AXIS_API` + position 数值 |
| **弹性特征标题** | `getStabilityTitle(stability)` | `课中教学稳定性：{sciLevel}` |
| **弹性特征描述** | `getStabilityDescription(stability)` | `elasticitySummary` |
| **弹性特征情境** | `TEACHING_SCENARIO_KEYS` + `getScenarioLabel` | `situations[]` 动态行，`summary` 作标签文案 |
| **弹性标题区样式** | `stability` → `STABILITY_LEVEL_STYLES` | `mapSciLevelToStability(sciLevel)` 映射背景色 |

---

## 四、merge 双轨规则（相对 02 变更）

```ts
mergeTeacherPortraitAggregate(adapted, overrides, { styleModulesFromBase })
```

| 调用方 | `styleModulesFromBase` | 3 风格模块来源 |
|--------|------------------------|----------------|
| `buildAggregateFromApi`（Mock ON 路径） | `true` | `FULL_MOCK_BASE` |
| `useTeacherPortraitData`（HTTP 路径） | `false` | Adapter 产出 |
| HTTP 失败 `emptyAdaptedTeacherProfileSlices` | — | 9 模块全 `null` |

---

## 五、实现文件映射

### 5.1 API 与数据层

| 路径 | 说明 |
|------|------|
| `api/types/teacher-profile-rsp.vo.ts` | 扩展 3 VO + 顶层 3 字段；注释改为 9 模块 |
| `composables/useTeacherPortraitData.ts` | HTTP merge 传 `styleModulesFromBase: false` |
| `mock/teacher-profile-api.mock.ts` | `FULL_TEACHER_PROFILE_API` 补 3 模块文档 JSON |
| `mock/teacher-portrait-aggregate.mock.ts` | `MergeTeacherPortraitOptions`；`emptyAdapted` 扩展 3 字段 |

### 5.2 Adapter（新建）

| 路径 | 说明 |
|------|------|
| `adapters/personal-tag-cloud.adapter.ts` | `categoryType` 映射；`tagValue`→`label` |
| `adapters/teaching-style-trend.adapter.ts` | `trendPoints`→`reports`；`stylePosition`→`dominantPosition` |
| `adapters/teaching-style-flexibility.adapter.ts` | `teachingStyleElasticity`→`teachingStyleFlexibility` slice |
| `adapters/index.ts` | 门面扩展至 9 模块 |
| `adapters/teacher-profile.adapter.spec.ts` | **24 项**单测（+6 项三模块） |

### 5.3 Container / 展示层

| 路径 | 说明 |
|------|------|
| `components/personal-tag-cloud/types.ts` | slice 扩展 `tags` |
| `components/personal-tag-cloud/PersonalTagCloudContainer.vue` | Mock/HTTP 分支构建 modules |
| `components/teaching-style-trend/types.ts` | ViewModel 扩展 position 字段 |
| `components/teaching-style-trend/constants.ts` | 新增 `TEACHING_STYLE_Y_AXIS_API` |
| `components/teaching-style-trend/trend-chart-options.ts` | `usePositionData` + 可配置纵轴 |
| `components/teaching-style-trend/TeachingStyleTrendContainer.vue` | 双轨 labels / positions |
| `components/teaching-style-trend/TeachingStyleTrendView.vue` | 传入 chart 新参数 |
| `components/teaching-style-flexibility/types.ts` | slice / ViewModel 扩展 HTTP 字段 |
| `components/teaching-style-flexibility/constants.ts` | 新增 `mapSciLevelToStability` |
| `components/teaching-style-flexibility/TeachingStyleFlexibilityContainer.vue` | `useApiCopy` 分支 |
| `components/teaching-style-flexibility/TeachingStyleFlexibilityView.vue` | 动态情境 + API 文案 |

---

## 六、Mock 开关行为（交付态）

> **04 更新：** profile+统计见 [04 归档](./04-教学统计与教师基本信息HTTP接入-delivered.md)；下表为 03 交付时点快照。

| Mock | 02 六模块 | 03 三模块 | myInfo / teacherPortrait（03 时点） |
|------|-----------|-----------|-------------------------------------|
| **ON** | API mock → Adapter | **`FULL_MOCK_BASE` 覆盖** | `FULL_MOCK_BASE` |
| **OFF** | HTTP → Adapter | HTTP → Adapter | `FULL_MOCK_BASE` |
| **OFF + 缺字段** | 对应 slice `null` | 对应 slice `null`，**不回落 mock** | 仍 mock |
| **HTTP 失败** | 9 slice 全 `null` | 同上 | 仍 mock |

---

## 七、验收结果（2026-07-10）

| 检查项 | 结果 |
|--------|------|
| `vitest` `teacher-profile.adapter.spec.ts` | ✅ **24 passed** |
| `pnpm typecheck` | ✅ PASS |
| 9 模块 Adapter 门面 | ✅ |
| merge `styleModulesFromBase` 双轨 | ✅ |
| 3 Container HTTP/Mock 分支 | ✅ |
| API mock fixture 含 3 模块 | ✅ |

---

## 八、已知遗留

> **更新（2026-07-10）：** `myInfo` / 教师画像卡片 **基本信息与统计** 已由 [04-教学统计与教师基本信息HTTP接入-delivered.md](./04-教学统计与教师基本信息HTTP接入-delivered.md) 交付；卡片**风格/标签**仍待对接。

| 项 | 说明 |
|----|------|
| 教师画像卡片风格/标签 | 04 仅接 profile+统计；风格区 HTTP 路径为空态 |
| 趋势图 Tooltip | 本阶段未展示 `reportTopic` / `reportTime` |
| 弹性 `situationStats[].description` | 接口有字段，本阶段未展示 |
| 字段名联调兼容 | 本阶段未遇别名问题；若联调出现小写 key，参考 02 `normalize*` 模式补兼容 |
| `postClassReport` 维度满分尺度 | 02 遗留，待产品确认 |
| `TeacherProfileRspVO接口文档.md` | 需同步补充 3 新模块字段说明 |

---

## 九、仍未对接（03 归档时点；04 已交付 profile+统计）

> **更新（2026-07-10）：** 见 [04-教学统计与教师基本信息HTTP接入-delivered.md](./04-教学统计与教师基本信息HTTP接入-delivered.md)。

| slice / 模块 | 页面 | 状态 |
|--------------|------|------|
| 教师画像卡片 — 主导/辅助风格、特征标签 | 教师画像卡片 | 待 HTTP |

---

## 十、引用文档

| 文件 | 说明 |
|------|------|
| [V1.4.8_教师画像_教师风格分析模块_接口字段设计.md](../docs/V1.4.8_教师画像_教师风格分析模块_接口字段设计.md) | 本阶段字段设计依据 |
| [02-教师画像页面HTTP接入与VO变更-delivered.md](./02-教师画像页面HTTP接入与VO变更-delivered.md) | 前置 6 模块 HTTP 交付 |
| [ui-style/教学风格与弹性特征组件/requirements/原始需求.md](../../ui-style/教学风格与弹性特征组件/requirements/原始需求.md) | Mock 态 UI 规则来源 |

---

## 十一、归档说明

- `requirements/03`、`specs/03`、`plans/03` 保留为阶段依据；**交付结论以本归档为准**。
- `requirements/`、`specs/`、`plans/` 下 03 文档 **不再作为活跃开发入口**。
- 后续工作建议：
  1. 联调验证 Mock OFF 三模块真实 JSON 展示；
  2. 另开需求对接教师画像卡片**风格/标签**（04 已交付 profile+统计）；
  3. 同步更新 `TeacherProfileRspVO接口文档.md` 补充 3 新模块；
  4. 可选增强：趋势 Tooltip 展示 `reportTopic`/`reportTime`。
