# 教师画像页面 · HTTP 接入与 VO 变更交付归档

**归档类型：** api-adapter 正式对接交付快照  
**归档日期：** 2026-07-10（联调补充：同日傍晚）  
**版本：** v1.4.8  
**阶段：** 02 — 真实 HTTP 接入 + VO 变更适配 + 联调修复  
**Requirement:** [../requirements/02-真实HTTP接入与VO变更适配.md](../requirements/02-真实HTTP接入与VO变更适配.md)  
**Spec:** [../specs/02-dev-spec.md](../specs/02-dev-spec.md)  
**Plan:** [../plans/02-dev-plan.md](../plans/02-dev-plan.md)  
**前置归档:** [01-教师画像页面接口对接-pre-adaptor-delivered.md](./01-教师画像页面接口对接-pre-adaptor-delivered.md)

---

## 一、阶段说明

本归档标记 **「真实 HTTP 接入与 VO 变更适配」** 阶段交付完成。

在 01 预对接 Adapter 链路上，完成 `GET /analysis/v2/teachingDiagnosis/getTeacherProfile` 接入；按 `ClassroomClarityVO`、`SpeakingComprehensibilityVO` 变更说明升级类型与 Adapter；联调期间修复小数分值展示、`postClassReport` 字段名大小写等问题；并按产品纠正将 `questionType` 纳入同一 HTTP 链路（原 02 需求列为范围外，见 §二）。

**当前数据流：**

```
activeTeacherId 变化
  → useTeacherPortraitData.fetchAggregate(tenantUserId)
       ├─ [Mock ON]  getTeacherProfileApiMock(teacherId)
       └─ [Mock OFF] getTeacherProfile({ tenantUserId })
  → adaptTeacherProfileSlices(vo)   // 6 模块
  → mergeTeacherPortraitAggregate(adapted)
       ├─ 6 模块 slice ← Adapter
       └─ 其余 slice ← FULL_MOCK_BASE（myInfo / teacherPortrait / …）
  → aggregate → Container → View
```

---

## 二、相对 02 需求的范围变更

| 项 | 02 原文 | 实际交付 |
|----|---------|----------|
| HTTP 覆盖模块数 | 5 模块 | **6 模块**（补接 `questionType`） |
| `questionType` | 仍走 `FULL_MOCK_BASE` | 经 `adaptQuestionType` 从接口注入 |
| 语言可理解度小数 | spec 写「trunc → 整数」 | 联调改为 **保留一位小数** 展示 |
| 课堂结构清晰度综合分 | spec 写「四维度截断求和，丢弃 totalScore」 | 优先接口 `totalScore`，维度分不截断 |
| Mock 默认值 | spec 写 `ref(true)` | 联调默认 **`ref(false)`** |
| `tenantUserId` | 使用页面 `activeTeacherId` | 联调期 **临时硬编码** 固定 ID（见 §九） |
| `postClassReport` 子字段 | 文档 `aReport` / `bReport` | 联调实际为 **`areport` / `breport`**，Adapter 双写兼容（见 §四） |

---

## 三、交付范围（`TeacherProfileRspVO` 6/6）

| 接口字段 | aggregate slice | Adapter | Container |
|----------|-----------------|---------|-----------|
| `myLessonPlan` | `myLessonPlan` | `my-lesson-plan.adapter.ts` | `MyLessonPlanContainer` |
| `postClassReport` | `classroomContentEval` | `classroom-content-eval.adapter.ts` | `ClassroomContentEvalContainer` |
| `questionType` | `questionType` | `question-type.adapter.ts` | `QuestionTypeContainer` |
| `classroomClarity` | `classroomStructureClarity` | `classroom-structure-clarity.adapter.ts` | `ClassroomStructureClarityContainer` |
| `speakingBehavior` | `classroomLanguageBehavior` | `classroom-language-behavior.adapter.ts` | `ClassroomLanguageBehaviorContainer` |
| `speakingComprehensibility` | `languageComprehensibility` | `language-comprehensibility.adapter.ts` | `LanguageComprehensibilityContainer` |

### 3.1 VO 变更（本阶段处理）

| VO | 变更说明 | 处理 |
|----|----------|------|
| `ClassroomClarityVO` | `*Clarity` 嵌套 → `*Score`；新增 `classroomFeature` | Adapter + Container 优先接口 `level`/`classroomFeature` |
| `SpeakingComprehensibilityVO` | `*Score`/`totalScore`（一位小数）；新增 `classroomFeature` | Adapter + Container + Gauge 小数展示 |
| `PostClassReportVO` | `dimensionScore` 裸分值；联调 **`areport`/`breport` 小写** | `normalizePostClassReportVo` + 兼容旧 `DimensionDetail` |
| `QuestionTypeVO` | `fourQuestion` + `bloomTaxonomy` | 本阶段新增 Adapter（02 原范围外） |

### 3.2 Slice 扩展

```ts
// 课堂结构清晰度
ClassroomStructureClaritySlice += { totalScore?, level?, classroomFeature? }

// 语言可理解度
LanguageComprehensibilitySlice += { level?, classroomFeature? }
```

### 3.3 汇总区派生规则（清晰度 / 可理解度两模块）

```
gradeLabel   = slice.level?.trim() || resolveGrade(...).label
gradeFeature = slice.classroomFeature?.trim() || resolveGrade(...).feature|description
grade 样式色  = 仍由 resolveGrade(...) 查表
```

---

## 四、课堂教学内容评价联调要点（`postClassReport`）

### 4.1 字段名大小写（联调根因）

| 接口文档 | 联调实际 JSON | 前端处理 |
|----------|---------------|----------|
| `aReport` | `areport` | `vo.aReport ?? raw.areport` |
| `bReport` | `breport` | `vo.bReport ?? raw.breport` |
| `summary` | `summary` | 不变 |

**现象：** 接口 `summary` 有数据，但 A/B 类环形图、雷达维度全 0 或整模块空态。  
**根因：** JavaScript 区分大小写，`vo.aReport` 读不到 `areport`。  
**修复：** `classroom-content-eval.adapter.ts` → `normalizePostClassReportVo()`。

### 4.2 Adapter 其它兼容

| 能力 | 说明 |
|------|------|
| 旧 `DimensionDetail` | 自动读 `{ averageScore }` |
| 字符串数字 | `readCount` / `readDimensionScore` |
| `ratio` 单位 | `0~1` ×100；若 `>1 且 ≤100` 视为已是百分比 |
| 部分数据 | 仅 `aReport` 或仅 `summary` 时仍可产出 slice（缺侧为 0） |
| 缺 `summary` | 由 A/B `levelStat` 汇总合成 |

### 4.3 联调样例（已写入单测）

```json
{
  "summary": { "excellentCount": 5, "goodCount": 6, "satisfactoryCount": 2, "needImprovementCount": 1, "totalCount": 14 },
  "areport": {
    "totalCount": 7,
    "levelStat": { "excellentCount": 3, "excellentRatio": 0.429, "..." : "..." },
    "dimensionScore": {
      "lessonPlanFidelity": 85.5,
      "intellectualStimulation": 78.2,
      "difficultyBreakthrough": 82,
      "practiceEffectiveness": 76.8,
      "summaryCompleteness": 88.1,
      "pacingAppropriateness": 80.4
    }
  },
  "breport": { "..." : "..." }
}
```

**预期页面：** 14 份报告；A 类 7 份；等级汇总 5/6/2/1；雷达显示 85.5 等维度分。

### 4.4 维度满分尺度待确认

联调返回维度分为 **0~100**（如 `85.5`），前端 `content-eval-dimensions.ts` 常量 `maxScore` 为 **20/25/15** 等。雷达会显示 `85.5/20` 类超出满分的文案——**数据已接上**，展示尺度需与后端/产品确认后只改常量表。

---

## 五、提问类型字段映射（新增）

```
fourQuestion.how     → sihe.counts['如何']
fourQuestion.whatIs  → sihe.counts['是何']
fourQuestion.whatIf  → sihe.counts['若何']
fourQuestion.why     → sihe.counts['为何']
fourQuestion.subtotal → sihe.subtotal

bloomTaxonomy.memoryComprehensionCount  → bloom.counts['记忆/理解类']
bloomTaxonomy.applicationCount          → bloom.counts['应用类为']
bloomTaxonomy.analysisEvaluationCount   → bloom.counts['分析/评价/创造类']
bloomTaxonomy.subtotal                  → bloom.subtotal
```

`fourQuestion` 与 `bloomTaxonomy` 缺一 → Adapter 返回 `null` → 模块空态。

---

## 六、实现文件映射

### 6.1 API 与数据层

| 路径 | 说明 |
|------|------|
| `api/get-teacher-profile.ts` | HTTP 服务；联调期 `TEMP_FIXED_TENANT_USER_ID` |
| `api/merge-teacher-portrait-aggregate.ts` | HTTP 失败时 6 slice 置空 |
| `api/types/teacher-profile-rsp.vo.ts` | 6 顶层字段；`PostClassReportVORaw`（`areport`/`breport`） |
| `composables/useTeacherPortraitData.ts` | Mock / HTTP 双轨 |
| `composables/teacher-portrait-debug.ts` | `teacherPortraitUseMockData` 默认 `false` |
| `mock/teacher-profile-api.mock.ts` | 含 6 模块新 VO fixture |
| `mock/teacher-portrait-aggregate.mock.ts` | `mergeTeacherPortraitAggregate`；`questionType` 不再写死 |

### 6.2 Adapter

| 路径 | 说明 |
|------|------|
| `adapters/index.ts` | 门面 `adaptTeacherProfileSlices`（6 模块） |
| `adapters/question-type.adapter.ts` | **新建** |
| `adapters/classroom-content-eval.adapter.ts` | **`normalizePostClassReportVo`**、裸分/旧嵌套/ratio/部分数据 |
| `adapters/classroom-structure-clarity.adapter.ts` | `*Score` + `readScore` + `totalScore` |
| `adapters/language-comprehensibility.adapter.ts` | `*Score` + `readScore` 保留小数 |
| `adapters/my-lesson-plan.adapter.ts` | 01 逻辑，HTTP 回归 |
| `adapters/classroom-language-behavior.adapter.ts` | 01 逻辑，HTTP 回归 |
| `adapters/teacher-profile.adapter.spec.ts` | **18 项**单测（含 `areport`/`breport` 样例） |

### 6.3 Container / 展示层（本阶段有改动）

| 路径 | 说明 |
|------|------|
| `components/classroom-structure-clarity/ClassroomStructureClarityContainer.vue` | 维度分不截断；综合分优先 `totalScore` |
| `components/classroom-structure-clarity/chart-options.ts` | 小数标签 `formatStructureScore` |
| `components/language-comprehensibility/LanguageComprehensibilityContainer.vue` | 综合分一位小数；接口 level/feature |
| `components/language-comprehensibility/ComprehensibilityGauge.vue` | `displayScore` 一位小数；补 `ref`/`watch` |
| `components/RoleDebugBar.vue` | Mock 开关单行布局 |
| `utils/number-format.ts` | 新增 `formatStructureScore` |
| `teacher-portrait/index.vue` | 绑定 `v-model:use-mock` |

---

## 七、联调期缺陷修复

| 问题 | 根因 | 修复 |
|------|------|------|
| **课堂教学内容评价全空/全 0** | 接口 `areport`/`breport`，前端读 `aReport`/`bReport` | `normalizePostClassReportVo` |
| 语言可理解度小数不显示 | `Math.trunc(0.3)` → `0`，gauge 不画弧 | `truncateToOneDecimal` |
| 课堂结构清晰度小数变 0 | `truncateToInteger` | 保留小数 + `formatStructureScore` |
| Gauge 运行时异常 | `ComprehensibilityGauge` 缺 `ref`/`watch` | 补全 import |
| 内容评价仅 summary 有数 | 旧逻辑要求三者齐全才非 null | 放宽判空 + 合成 summary |

---

## 八、Mock 开关行为（交付态）

| Mock | 6 模块数据来源 | 其余 slice |
|------|----------------|------------|
| **ON** | `getTeacherProfileApiMock` → Adapter | `FULL_MOCK_BASE` |
| **OFF** | `getTeacherProfile` HTTP → Adapter | `FULL_MOCK_BASE` |
| **OFF + 接口缺字段** | 对应 slice `null`，模块空态 | 仍 mock |
| **HTTP 失败** | toast + 6 slice 全 `null` | 仍 mock |

---

## 九、已知遗留（联调后需清理）

| 项 | 位置 | 说明 |
|----|------|------|
| 固定 `tenantUserId` | `api/get-teacher-profile.ts` | `TEMP_FIXED_TENANT_USER_ID = '1920356106422730753'`；联调完成后改回入参 |
| 后端 JSON 字段名 | `postClassReport` | 建议后端统一为 `aReport`/`bReport`；前端已双写兼容 |
| 维度满分尺度 | `content-eval-dimensions.ts` | 联调分值为 0~100，常量 maxScore 为 20/25；待产品确认 |
| 布鲁姆标签文案 | `question-type/constants.ts` | UI 常量 `应用类为`（疑似笔误） |
| 接口文档滞后 | `docs/TeacherProfileRspVO接口文档.md` | §三/§八 仍含旧 `DimensionDetail`、旧 `classroomClarity` 嵌套；**未记录 `areport`/`breport` 实际形态** |

---

## 十、验收结果（2026-07-10）

| 检查项 | 结果 |
|--------|------|
| `vitest` `teacher-profile.adapter.spec.ts` | ✅ **18 passed** |
| `pnpm typecheck` | ✅ PASS |
| Mock OFF → HTTP 6 模块可渲染 | ✅ 联调验证 |
| `postClassReport` `areport`/`breport` 样例 | ✅ 单测 + 联调 |
| 语言/清晰度小数分值展示 | ✅ 联调修复 |
| `questionType` HTTP 注入 | ✅ 本阶段补接 |

---

## 十一、仍未对接（02 归档时点；03/04 已部分交付）

> **更新（2026-07-10）：** `personalTagCloud`、`teachingStyleTrend`、`teachingStyleFlexibility` 已由 [03-教师风格分析三模块HTTP接入-delivered.md](./03-教师风格分析三模块HTTP接入-delivered.md) 交付。
>
> **更新（2026-07-10）：** `myInfo` 与教师画像卡片 **基本信息 + 教学统计** 已由 [04-教学统计与教师基本信息HTTP接入-delivered.md](./04-教学统计与教师基本信息HTTP接入-delivered.md) 交付（Context + `teachingStatistics`）；`teacherPortrait` **风格/标签/画像** 仍待对接。

以下 aggregate slice **在 02 时点仍仅来自** `FULL_MOCK_BASE`：

| slice | 页面模块 | 04 交付态 |
|-------|----------|-----------|
| `myInfo` | 我的信息 | profile+统计已真实；HTTP 路径 merge 为 `null`，Container 合并 context |
| `teacherPortrait` | 教师画像卡片 | 头部 profile+时长已真实；风格/标签仍空态 |

---

## 十二、引用文档

| 文件 | 说明 |
|------|------|
| [TeacherProfileRspVO接口文档.md](../docs/TeacherProfileRspVO接口文档.md) | 顶层 6 字段契约（部分示例滞后） |
| [PostClassReportVO变更说明.md](../docs/PostClassReportVO变更说明.md) | dimensionScore 裸分值 |
| [ClassroomClarityVO变更说明.md](../docs/ClassroomClarityVO变更说明.md) | 02 已处理 |
| [SpeakingComprehensibilityVO变更说明.md](../docs/SpeakingComprehensibilityVO变更说明.md) | 02 已处理 |
| [V1.4.8_教师画像_教师风格分析模块_接口字段设计.md](../docs/V1.4.8_教师画像_教师风格分析模块_接口字段设计.md) | 教师风格等待对接字段设计 |

---

## 十三、归档说明

- `requirements/02`、`specs/02`、`plans/02` 保留为阶段依据；**§二、§四联调结论以本归档为准**。
- `requirements/`、`specs/`、`plans/` 下 02 文档 **不再作为活跃开发入口**。
- 后续工作建议：
  1. 删除 `TEMP_FIXED_TENANT_USER_ID`，恢复 `activeTeacherId` 传参；
  2. 同步更新 `TeacherProfileRspVO接口文档.md`：新 VO 示例 + **`areport`/`breport` 实际字段名**；
  3. 与后端确认 `postClassReport.dimensionScore` 满分尺度，更新 `content-eval-dimensions.ts`；
  4. 另开需求对接 `teacherPortrait` **风格/标签**（profile+统计已由 04 交付；三风格模块已由 03 交付）；
  5. 核对 `应用类为` 与后端 `applicationCount` 文案是否一致。
