# 教师画像页面 — 真实 HTTP 接入与 VO 变更适配 开发规格

**Requirement:** [requirements/02-真实HTTP接入与VO变更适配.md](../requirements/02-真实HTTP接入与VO变更适配.md)

**变更依据：**

- [docs/ClassroomClarityVO变更说明.md](../docs/ClassroomClarityVO变更说明.md)
- [docs/SpeakingComprehensibilityVO变更说明.md](../docs/SpeakingComprehensibilityVO变更说明.md)

---

## 1. 目标

在 01 Adapter 链路上：

1. 接入 `GET /analysis/v2/teachingDiagnosis/getTeacherProfile?tenantUserId=xxx`
2. 更新 `ClassroomClarityVO`、`SpeakingComprehensibilityVO` 类型与 Adapter
3. 扩展 2 个 slice + 微调 2 个 Container，实现接口 `level` / `classroomFeature` 优先展示
4. 保留 Mock 开关：开 → 本地 fixture；关 → HTTP

---

## 2. 方案（已定：方案 A）

单接口 + 5 Adapter 门面 + 数据层双轨（mock | http），不改动 01 的 3 个未变更 Adapter 逻辑。

---

## 3. 架构与数据流

```
RoleDebugBar
  ├─ useMockData: boolean          // 新增 Mock 开关
  └─ dataMode: 'full' | 'empty'    // 保留；语义见 §5

useTeacherPortraitData(activeTeacherId)
  → fetchTeacherPortraitAggregate(tenantUserId)
       ├─ resolveTeacherProfileVo(tenantUserId)
       │    ├─ mock ON  → getTeacherProfileApiMock(id, dataMode)
       │    └─ mock OFF → await getTeacherProfile({ tenantUserId })
       ├─ adaptTeacherProfileSlices(vo)
       └─ mergeAggregateWithBaseMock(adaptedSlices, tenantUserId)
  → aggregate
```

**merge 规则（与 01 一致）：**

- 5 模块 slice 来自 Adapter 产出
- `myInfo`、`teacherPortrait`、`questionType`、`personalTagCloud`、`teachingStyle*` 等仍从 `teacher-portrait-aggregate.mock.ts` 的 `FULL_MOCK_BASE` 合并

---

## 4. HTTP 服务

### 4.1 接口定义

| 项 | 值 |
|----|-----|
| Method | GET |
| Path | `/analysis/v2/teachingDiagnosis/getTeacherProfile` |
| Query | `tenantUserId: string` |
| Response | `TeacherProfileRspVO`（标准 `{ code, data }` 包装，按项目 request 惯例解包） |

### 4.2 文件位置

优先模块内自治（与 `teacher-list-api.ts` 一致）：

```
src/pages/school/teacher-portrait/api/get-teacher-profile.ts
```

使用项目 `defineService` + `request.get`；若团队惯例要求放 `src/service/analysisReport.ts`，实现时可二选一，**模块内优先**。

### 4.3 错误处理

- 网络/非 200：`useTeacherPortraitData` catch → `ElMessage.error`（或项目统一 toast）→ 5 slice 置空
- `data` 为 `null`/`undefined`：视为空 VO `{}`，各 adapter 返回对应 `null` slice

---

## 5. Mock 开关与数据形态

### 5.1 新增状态

`src/pages/school/teacher-portrait/composables/teacher-portrait-debug.ts`：

```ts
export const teacherPortraitUseMockData = ref(true)  // 开发默认 true，便于离线；联调时手动关

export function isTeacherPortraitMockEnabled(): boolean {
  return teacherPortraitUseMockData.value
}
```

`RoleDebugBar.vue` 增加一行 **Mock 开关**（`ElSwitch` 或 Radio）：开 / 关。

### 5.2 行为矩阵

| Mock | dataMode | 5 模块数据来源 |
|------|----------|----------------|
| ON | full | `FULL_TEACHER_PROFILE_API`（新 VO） |
| ON | empty | `EMPTY_TEACHER_PROFILE_API` 或 `{}` |
| OFF | full | HTTP |
| OFF | empty | HTTP（**不**注入本地 empty fixture；接口空则空态） |

`dataMode === 'empty'` 且 Mock OFF 时：仍发起 HTTP；若后端对该教师返回空对象，则展示缺省态——与产品定义「选中教师但接口无数据」一致。

### 5.3 fixture 更新

`mock/teacher-profile-api.mock.ts` 中 `classroomClarity`、`speakingComprehensibility` 改为变更后 JSON 形态，例如：

```json
"classroomClarity": {
  "goalClarityScore": 21,
  "stageClarityScore": 20,
  "logicClarityScore": 21,
  "summaryClarityScore": 19,
  "totalScore": 80,
  "level": "良好",
  "classroomFeature": "结构较清晰，偶尔有模糊之处"
},
"speakingComprehensibility": {
  "vocabularyScore": 28.5,
  "syntaxScore": 30.0,
  "contentScore": 22.0,
  "totalScore": 80.5,
  "level": "良好",
  "classroomFeature": "语言表达清晰，学生易于理解"
}
```

---

## 6. 类型更新

### 6.1 删除 / 废弃

- `ClarityDetailVO`（`teacher-profile-rsp.vo.ts`）— 删除

### 6.2 ClassroomClarityVO

```ts
export type ClassroomClarityVO = {
  goalClarityScore?: number
  stageClarityScore?: number
  logicClarityScore?: number
  summaryClarityScore?: number
  totalScore?: number
  level?: string | null
  classroomFeature?: string | null
}
```

### 6.3 SpeakingComprehensibilityVO

```ts
export type SpeakingComprehensibilityVO = {
  vocabularyScore?: number
  syntaxScore?: number
  contentScore?: number
  totalScore?: number
  level?: string | null
  classroomFeature?: string | null
}
```

### 6.4 aggregate slice 扩展

`types/aggregate.ts`：

```ts
export type ClassroomStructureClaritySlice = {
  dimensions: StructureDimensionSlice[]
  level?: string | null
  classroomFeature?: string | null
}

export type LanguageComprehensibilitySlice = {
  totalScore: number
  dimensions: { ... }
  level?: string | null
  classroomFeature?: string | null
}
```

---

## 7. Adapter 变更

### 7.1 classroom-structure-clarity.adapter.ts

| 接口字段 | slice 字段 |
|----------|------------|
| `goalClarityScore` | `dimensions[goalClarity].score` |
| `stageClarityScore` | `dimensions[segmentClarity].score` |
| `logicClarityScore` | `dimensions[logicClarity].score` |
| `summaryClarityScore` | `dimensions[summaryClarity].score` |
| — | `maxScore` 常量 25 |
| `level` | `slice.level` |
| `classroomFeature` | `slice.classroomFeature` |
| `totalScore` | **丢弃**（Container 自行求和） |

score 原样写入 slice，不在 Adapter 内 trunc。

### 7.2 language-comprehensibility.adapter.ts

| 接口字段 | slice 字段 |
|----------|------------|
| `vocabularyScore` | `dimensions.vocabulary.score` |
| `syntaxScore` | `dimensions.syntax.score` |
| `contentScore` | `dimensions.content.score` |
| `totalScore` | `slice.totalScore` |
| `level` | `slice.level` |
| `classroomFeature` | `slice.classroomFeature` |
| — | maxScore 35/35/30 常量补全 |

### 7.3 其余 Adapter

`my-lesson-plan`、`classroom-content-eval`、`classroom-language-behavior` — **逻辑不变**，单测 + 联调回归。

---

## 8. Container 变更

### 8.1 ClassroomStructureClarityContainer.vue

```ts
const grade = resolveClarityGrade(totalScore)
return {
  ...
  gradeLabel: slice.level?.trim() || grade.label,
  gradeFeature: slice.classroomFeature?.trim() || grade.description,
  gradeColor: grade.color,  // 样式仍来自查表
  ...
}
```

### 8.2 LanguageComprehensibilityContainer.vue

```ts
const grade = resolveComprehensibilityGrade(slice.totalScore)
return {
  ...
  gradeLabel: slice.level?.trim() || grade.label,
  gradeFeature: slice.classroomFeature?.trim() || grade.feature,
  ...
}
```

---

## 9. 数值精度

沿用 01 §四：**Adapter 不截断**；Container 展示层 `trunc` / `truncateToOneDecimal`。

语言可理解度接口一位小数（如 `28.5`）→ slice 存 `28.5` → gauge/总分展示 `Math.trunc` → `28`（与 01 行为一致，除非产品另行要求一位小数展示）。

---

## 10. 文件清单

| 操作 | 路径 |
|------|------|
| 新建 | `api/get-teacher-profile.ts` |
| 改 | `api/types/teacher-profile-rsp.vo.ts` |
| 改 | `adapters/classroom-structure-clarity.adapter.ts` |
| 改 | `adapters/language-comprehensibility.adapter.ts` |
| 改 | `adapters/teacher-profile.adapter.spec.ts` |
| 改 | `types/aggregate.ts` |
| 改 | `composables/teacher-portrait-debug.ts` |
| 改 | `composables/useTeacherPortraitData.ts` |
| 改 | `mock/teacher-profile-api.mock.ts` |
| 改 | `mock/teacher-portrait-aggregate.mock.ts`（抽取 merge 逻辑，mock/http 共用） |
| 改 | `components/RoleDebugBar.vue`（Mock 开关 UI + hint 文案） |
| 改 | `ClassroomStructureClarityContainer.vue` |
| 改 | `LanguageComprehensibilityContainer.vue` |

---

## 11. 测试策略

**vitest：**

1. `classroom-structure-clarity.adapter` — 新 VO JSON → slice dimensions + level/feature
2. `language-comprehensibility.adapter` — `*Score` 字段 + 小数 + level/feature
3. `adaptTeacherProfileSlices` 集成 — 全量新 fixture
4. Container 可选单测：slice 有 level 时用接口值；无则 fallback

**手工：**

1. Mock ON + full → 5 模块与改前视觉一致（汇总区可展示 fixture 文案）
2. Mock OFF + 选真实教师 → 网络请求正确、数据展示
3. Mock OFF + 无数据教师 → 空态
4. 断网 / 500 → toast + 空态

---

## 12. 验收标准

对齐 [requirements/02 §七](../requirements/02-真实HTTP接入与VO变更适配.md#七验收标准草案)：

- [ ] HTTP 服务 + mock 双轨按 §5 行为矩阵工作
- [ ] 2 个 VO + 2 个 Adapter + 2 个 slice + 2 个 Container 更新完成
- [ ] API mock fixture 为新 VO 形态
- [ ] 单测与 typecheck 通过
- [ ] 01 三 Adapter 无回归

---

## 13. 不在范围

- 其余 aggregate 模块 HTTP
- 接口文档 MD 同步（chore）
- 语言可理解度改为一为小数展示（需单独立项）
