# 教师画像页面 — 真实 HTTP 接入与 VO 变更适配

> **背景**：01 预对接阶段已建立 `TeacherProfileRspVO` → aggregate slice 的 Adapter 链路，页面仍走本地 mock。后端接口已就绪，且两份 VO 结构发生变更，需在新需求中完成 HTTP 接入与 Adapter 升级。
>
> **前置交付**：[01-预对接部分字段.md](./01-预对接部分字段.md)（已归档）
>
> **变更依据**：
> - [ClassroomClarityVO变更说明.md](../docs/ClassroomClarityVO变更说明.md)（2026-07-08）
> - [SpeakingComprehensibilityVO变更说明.md](../docs/SpeakingComprehensibilityVO变更说明.md)（2026-07-09）
> - 接口路径：`GET /analysis/v2/teachingDiagnosis/getTeacherProfile`
> - 入参：`tenantUserId: string`（与页面 `activeTeacherId` 一致）

---

## 一、目标

1. 新增 `getTeacherProfile` HTTP 服务，**非 mock 态**下教师画像页 5 模块数据来自真实接口。
2. 按两份 VO 变更说明更新 TypeScript 类型、Adapter、API 形态 mock fixture。
3. **课堂结构清晰度**、**语言可理解度**汇总区优先展示接口下发的 `level` 与 `classroomFeature`；为 `null` 时回退现有 `grade-mapper` 查表。
4. 其余 aggregate 字段（教师画像卡片、提问类型、标签云等）**仍用现有 mock**，不在本次范围。

---

## 二、已确认产品决策

| 议题 | 决策 |
|------|------|
| 汇总区文案 | **A**：优先接口 `level` + `classroomFeature`；缺失时回退 `grade-mapper` |
| 请求参数 | `tenantUserId: string` |
| HTTP 范围 | **A**：一次请求覆盖 01 的 5 模块 |
| 调试 / 数据源 | **Mock 开关 ON** → 走本地 API 形态 mock（`getTeacherProfileApiMock` + Adapter）；**Mock 开关 OFF** → 走真实 HTTP。**关闭 mock 后**，`empty` 数据形态仅表示「已选教师但接口无数据」的展示态，不再注入本地 empty fixture |
| 方案选型 | **方案 A**：VO/Adapter 更新 + 数据层换 HTTP + slice 显式扩展 + 2 个 Container 微调 |

---

## 三、VO 变更摘要

### 3.1 ClassroomClarityVO

| 变更前 | 变更后 |
|--------|--------|
| `goalClarity: { maxScore, averageScore }` | `goalClarityScore: number` |
| `stageClarity: ClarityDetail` | `stageClarityScore: number` |
| `logicClarity` / `summaryClarity` 同上 | `logicClarityScore` / `summaryClarityScore` |
| — | 新增 `classroomFeature: string \| null` |
| `totalScore` / `level` 保留 | 不变 |

满分 25 不再返回，Adapter 按常量补全 `maxScore`。

### 3.2 SpeakingComprehensibilityVO

| 变更前 | 变更后 |
|--------|--------|
| `vocabulary` | `vocabularyScore`（BigDecimal，一位小数） |
| `syntax` | `syntaxScore` |
| `content` | `contentScore` |
| `total` | `totalScore` |
| — | 新增 `classroomFeature: string \| null` |
| `level` | 不变 |

满分 35/35/30 不再返回，Adapter 按常量补全。

---

## 四、Slice 契约变更（相对 01）

01 原则「Container 零改动」在 02 **局部调整**：仅扩展 2 个 slice 类型并微调对应 Container。

### 4.1 ClassroomStructureClaritySlice 新增

```ts
level?: string | null
classroomFeature?: string | null
```

### 4.2 LanguageComprehensibilitySlice 新增

```ts
level?: string | null
classroomFeature?: string | null
```

### 4.3 Container 派生规则（两模块统一）

```
gradeLabel   = slice.level ?? resolveGrade(computedTotal).label
gradeFeature = slice.classroomFeature ?? resolveGrade(computedTotal).feature|description
grade 样式色  = 仍由 resolveGrade(computedTotal) 查表（接口不下发样式）
```

- 课堂结构清晰度：综合得分仍由四维度 score 截断后求和（不用接口 `totalScore`）。
- 语言可理解度：综合得分仍用 slice.`totalScore`（来自接口 `totalScore`）。

---

## 五、数据流

```
activeTeacherId 变化
  → useTeacherPortraitData.fetchAggregate(tenantUserId)
       ├─ [Mock ON]  getTeacherProfileApiMock(tenantUserId)
       └─ [Mock OFF] getTeacherProfile({ tenantUserId })  // HTTP
  → adaptTeacherProfileSlices(vo)  // 5 模块
  → merge BASE_MOCK（myInfo / teacherPortrait / questionType …）
  → aggregate → Container → View
```

### 5.1 Mock 开关行为

| Mock 开关 | 数据形态 full | 数据形态 empty |
|-----------|---------------|----------------|
| **ON** | 本地 `FULL_TEACHER_PROFILE_API`（更新为新 VO）经 Adapter 注入 | 本地 `EMPTY_TEACHER_PROFILE_API` 或等价空 fixture 经 Adapter |
| **OFF** | HTTP 请求，正常渲染 | HTTP 请求；接口返回空/缺字段 → 模块空态（**不读本地 empty fixture**） |

### 5.2 HTTP 失败

- Toast 提示失败原因（或通用文案）
- 5 模块 slice 置 `null`，各模块走现有缺省态 UI

---

## 六、不在本次范围

- `questionType` 及教师画像卡片、标签云、教学风格等其余 aggregate slice 的 HTTP
- 修改 `TeacherProfileRspVO接口文档.md` 正文（可另开 docs chore）
- `PostClassReportVO` 结构（01 已适配裸分值）

---

## 七、验收标准（草案）

1. Mock **关闭**时，切换教师触发 `GET .../getTeacherProfile?tenantUserId=xxx`，5 模块展示接口数据。
2. Mock **开启**时，行为与改前 mock 联调一致（fixture 已更新为新 VO 形态）。
3. `ClassroomClarityVO` / `SpeakingComprehensibilityVO` Adapter 单测覆盖新字段名与小数分值。
4. 两模块汇总区：接口有 `level`/`classroomFeature` 时展示接口文案；为 `null` 时与改前 grade-mapper 一致。
5. HTTP 失败有 toast，模块空态不白屏。
6. `pnpm typecheck` 与 adapter 相关 vitest 通过。
7. 01 未改动的 3 个 Adapter 在 HTTP 联调下仍正常产出 slice。

---

## 八、引用文档

- [TeacherProfileRspVO接口文档.md](../docs/TeacherProfileRspVO接口文档.md)
- [PostClassReportVO变更说明.md](../docs/PostClassReportVO变更说明.md)（01 已处理）
- [ClassroomClarityVO变更说明.md](../docs/ClassroomClarityVO变更说明.md)
- [SpeakingComprehensibilityVO变更说明.md](../docs/SpeakingComprehensibilityVO变更说明.md)
