# 教师画像页面 — 预对接部分字段 开发规格

**Requirement:** [requirements/01-预对接部分字段.md](../requirements/01-预对接部分字段.md)

**接口参考：**

- [docs/TeacherProfileRspVO接口文档.md](../docs/TeacherProfileRspVO接口文档.md)（2026-07-03）
- [docs/PostClassReportVO变更说明.md](../docs/PostClassReportVO变更说明.md)（2026-07-07，`dimensionScore` 裸分值）

---

## 1. 目标

在真实 HTTP 未就绪前，为教师画像页 5 个模块建立 **API 原始响应 → aggregate slice** 的 Adapter 链路：

| 接口字段 | aggregate slice |
|----------|-----------------|
| `myLessonPlan` | `myLessonPlan` |
| `postClassReport` | `classroomContentEval` |
| `classroomClarity` | `classroomStructureClarity` |
| `speakingBehavior` | `classroomLanguageBehavior` |
| `speakingComprehensibility` | `languageComprehensibility` |

**硬约束（来自需求 §核心原则）：**

1. **mock / slice 为最终契约** — `types/aggregate.ts` + 现有 Container normalize 逻辑不变
2. **Adapter 负责全部结构/命名/单位换算**；Container / View **零改动**
3. **Adapter 不截断、不四舍五入**；展示精度由 Container 的 `number-format.ts` 处理
4. **课堂特征、综合等级**仍由 Container 查表派生，**丢弃**接口 `level` / 无特征字段

---

## 2. 方案对比与选型

### 方案 A：单文件巨型 Adapter（不推荐）

`adapters/teacher-profile.adapter.ts` 内集中 66 项转换。

| 优点 | 缺点 |
|------|------|
| 入口单一 | 单文件 >500 行，难维护、难单测 |
| | 5 模块耦合，改一模块影响全文件 |

### 方案 B：5 个独立 Adapter + 门面合并（推荐）

```
api/types/teacher-profile-rsp.vo.ts     # 接口原始类型（仅本次 5 字段）
adapters/
  my-lesson-plan.adapter.ts
  classroom-content-eval.adapter.ts
  classroom-structure-clarity.adapter.ts
  classroom-language-behavior.adapter.ts
  language-comprehensibility.adapter.ts
  constants/                            # 维度顺序、maxScore、label 映射
  index.ts                              # adaptTeacherProfileSlices(vo) → 5 slices
```

| 优点 | 缺点 |
|------|------|
| 与需求 §5 分节一一对应，单测可按模块拆分 | 需维护 constants 与组件侧 defs 对齐 |
| 后续 HTTP 接入只换 fetch，Adapter 不动 | |
| 符合项目 mapper/adapter 分散文件惯例 | |

### 方案 C：在 Container 内 inline 转换（禁止）

违反「Container 零改动」与 slice 契约原则，**不采用**。

**结论：采用方案 B。**

---

## 3. 架构与数据流

```
teacher-profile-api.mock.ts          # 后端形态 JSON（仅 5 顶层字段）
        ↓
adaptTeacherProfileSlices(vo)        # adapters/index.ts
        ↓
{ myLessonPlan, classroomContentEval, … }   # 与 FULL_* slice 同构
        ↓
fetchTeacherPortraitAggregateMock()  # 与其余 slice（myInfo 等）合并
        ↓
useTeacherPortraitData → aggregate
        ↓
各 Container normalize（不变）→ ViewModel → View
```

**Mock 分层策略：**

- **新增** `mock/teacher-profile-api.mock.ts`：存放 `TeacherProfileRspVO` 形态的原始 JSON（full / partial / empty 场景）
- **保留** `mock/teacher-portrait-aggregate.mock.ts` 中非本次范围的 slice 常量（`FULL_MY_INFO`、`FULL_TEACHER_PORTRAIT` 等）
- **改造** `fetchTeacherPortraitAggregateMock`：先取 base aggregate，再 `Object.assign` 5 个 adapter 产出 slice（partial 场景对应字段为 `null` 时不覆盖或显式置 `null`）

**常量复用原则：**

- `label` / `title` / 维度中文名：Adapter **import 组件侧已有常量**（如 `MY_LESSON_PLAN_LEVEL_DEFS`、`CLASSROOM_CONTENT_EVAL_LEVEL_DEFS`、`STRUCTURE_CLARITY_DIMENSIONS`、`COMPREHENSIBILITY_DIMENSIONS`），避免重复定义
- **课堂教学内容评价 maxScore**：接口已移除，在 `adapters/constants/content-eval-dimensions.ts` 集中维护（对齐需求 §3.2.1），Adapter 专用

---

## 4. 文件布局

```
src/pages/school/teacher-portrait/
├── api/
│   └── types/
│       └── teacher-profile-rsp.vo.ts       # 新建：5 模块接口类型
├── adapters/
│   ├── constants/
│   │   └── content-eval-dimensions.ts    # A/B 类 6 维度 key → name + maxScore
│   ├── my-lesson-plan.adapter.ts
│   ├── classroom-content-eval.adapter.ts
│   ├── classroom-structure-clarity.adapter.ts
│   ├── classroom-language-behavior.adapter.ts
│   ├── language-comprehensibility.adapter.ts
│   ├── index.ts
│   └── teacher-profile.adapter.spec.ts     # vitest
├── mock/
│   ├── teacher-profile-api.mock.ts         # 新建：API 形态 mock
│   └── teacher-portrait-aggregate.mock.ts  # 改造：经 adapter 注入 5 slice
└── composables/
    └── useTeacherPortraitData.ts           # 不改逻辑，仍调 mock fetch
```

**不改动：**

- `types/aggregate.ts`
- 5 个 `*Container.vue` / `*View.vue`
- `utils/number-format.ts`

---

## 5. 各 Adapter 要点（摘要）

> 完整字段表见需求 [§五](../requirements/01-预对接部分字段.md#五adapter-转换明细清单)。

### 5.1 我的教案

- 10 个 flat 字段 → `levels[5]` 数组
- key 映射：`outstanding→excellent`、`excellent→great`、`unsatisfactory→unqualified`
- `ratio = apiRatio × 100`（不 trunc）
- 丢弃 `totalCount`

### 5.2 课堂教学内容评价

- `summary.totalCount → reportCount`；A/B `totalCount → category*ReportCount`
- `levelStat` 对象 → 4 档 `levels[]`；`satisfactory → pass`；ratio ×100
- **`dimensionScore.<key>` 裸 number → score**；maxScore 查 §3.2.1 常量表
- category title 复用 Container 常量字符串

### 5.3 课堂结构清晰度

- 4 个 `*Clarity` 嵌套对象 → `dimensions[]`
- `stageClarity → segmentClarity`
- score ← `averageScore`；maxScore 直接映射
- 丢弃 `totalScore`、`level`

### 5.4 课堂语言行为

- `total → subtotal`；5 count 字段 → `items[5]`
- `ratio = count/total×100`（total=0 时为 `null`）

### 5.5 语言可理解度

- `total → totalScore`
- 裸 `vocabulary/syntax/content` → `{ score, maxScore }`；maxScore 35/35/30
- 丢弃 `level`

---

## 6. 精度与边界

| 场景 | Adapter 行为 |
|------|-------------|
| 接口字段缺失 / `null` | 对应 slice 返回 `null`（由 mock 层决定是否整页缺省） |
| ratio 小数 | ×100 后原样写入，如 `0.08649 → 8.649` |
| count 为小数 | `Math.trunc` 后写入 slice |
| dimensionScore 缺 key | 该维度 score=0 或整 slice null（与 Container empty 行为一致，实现时以 full mock 对齐为准） |
| `speakingBehavior.total=0` | items ratio 全为 `null` |

---

## 7. 测试策略

**框架：** vitest（项目已有 `*.spec.ts` 惯例）

**文件：** `adapters/teacher-profile.adapter.spec.ts`

**覆盖：**

1. 各 adapter 单测 + `adaptTeacherProfileSlices` 集成测
2. 精度链路透传：`ratio 0.08649 → slice 8.649`（Container 截断在 spec 中断言 slice 值即可）
3. `postClassReport.dimensionScore` 裸分值 + maxScore 常量补全
4. key 语义映射（outstanding/excellent 等）
5. 丢弃字段：adapter 输出不含 `totalCount`、不含接口 level

**类型检查：** `pnpm typecheck` 必须通过（pre-commit hook）

---

## 8. 验收标准

对齐需求 [§八](../requirements/01-预对接部分字段.md#八验收标准草案)：

- [ ] `TeacherProfileRspVO` 类型覆盖 5 模块（含 PostClassReport 裸分值形态）
- [ ] 5 个 adapter + 门面函数，输出与 `FULL_*` mock slice 同构
- [ ] API 形态 mock 经 adapter 注入后，5 组件视觉与改前一致
- [ ] Container / View / `aggregate.ts` 零 diff
- [ ] vitest 通过；`pnpm typecheck` 通过
- [ ] 课堂特征 / 综合等级仍由 Container 派生，不读接口 `level`

---

## 9. 不在范围

- 真实 HTTP 请求与错误态 UI
- `questionType` 及其余 aggregate slice
- 修改 `TeacherProfileRspVO接口文档.md`（可另开 docs chore）
- 课堂教学内容评价 maxScore 与产品最终确认（当前按 §3.2.1 常量表）
