# 教师画像页面接口对接 · 预对接阶段交付归档

**归档类型：** api-adapter 预对接交付快照  
**归档日期：** 2026-07-08  
**版本：** v1.4.8  
**阶段：** 预对接（Pre-adapter）— 真实 HTTP 未接入  
**Requirement:** [../requirements/01-预对接部分字段.md](../requirements/01-预对接部分字段.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 一、阶段说明

本归档标记 **「预对接部分字段」** 阶段结束。当时依据后端初稿字段约定（非正式 OpenAPI）建立 `TeacherProfileRspVO` → aggregate slice 的 Adapter 链路，并通过 API 形态 mock 注入页面。

**下一阶段（待后端提供正式接口文档后另开需求）：**

- 接入真实 HTTP（替换 `getTeacherProfileApiMock`）
- 对照正式文档复核/修订 `teacher-profile-rsp.vo.ts` 与各 adapter
- 处理本次未覆盖的 aggregate 字段（见 §六）

---

## 二、交付范围（5 模块）

| 接口字段 | aggregate slice | Adapter | Container |
|----------|-----------------|---------|-----------|
| `myLessonPlan` | `myLessonPlan` | `my-lesson-plan.adapter.ts` | `MyLessonPlanContainer` |
| `postClassReport` | `classroomContentEval` | `classroom-content-eval.adapter.ts` | `ClassroomContentEvalContainer` |
| `classroomClarity` | `classroomStructureClarity` | `classroom-structure-clarity.adapter.ts` | `ClassroomStructureClarityContainer` |
| `speakingBehavior` | `classroomLanguageBehavior` | `classroom-language-behavior.adapter.ts` | `ClassroomLanguageBehaviorContainer` |
| `speakingComprehensibility` | `languageComprehensibility` | `language-comprehensibility.adapter.ts` | `LanguageComprehensibilityContainer` |

**硬约束（已遵守）：**

- `types/aggregate.ts` 与各 Container normalize 逻辑 **未改**
- Adapter 承担结构/命名/单位换算；展示精度仍由 Container `number-format.ts` 处理
- 课堂特征、综合等级等 UI 派生字段仍由 Container 查表，**丢弃**接口 `level`

---

## 三、实现文件映射

### 3.1 类型与 Adapter

| 路径 | 说明 |
|------|------|
| `src/pages/school/teacher-portrait/api/types/teacher-profile-rsp.vo.ts` | 预对接 API 响应类型（仅 5 顶层字段） |
| `src/pages/school/teacher-portrait/adapters/index.ts` | 门面 `adaptTeacherProfileSlices` |
| `src/pages/school/teacher-portrait/adapters/my-lesson-plan.adapter.ts` | 我的教案 |
| `src/pages/school/teacher-portrait/adapters/classroom-content-eval.adapter.ts` | 课堂教学内容评价 |
| `src/pages/school/teacher-portrait/adapters/classroom-structure-clarity.adapter.ts` | 课堂结构清晰度 |
| `src/pages/school/teacher-portrait/adapters/classroom-language-behavior.adapter.ts` | 课堂语言行为 |
| `src/pages/school/teacher-portrait/adapters/language-comprehensibility.adapter.ts` | 语言可理解度 |
| `src/pages/school/teacher-portrait/adapters/constants/content-eval-dimensions.ts` | A/B 类雷达维度顺序、`maxScore` 常量 |

### 3.2 Mock 注入链路

| 路径 | 说明 |
|------|------|
| `src/pages/school/teacher-portrait/mock/teacher-profile-api.mock.ts` | API 形态 JSON（`FULL_TEACHER_PROFILE_API` 等） |
| `src/pages/school/teacher-portrait/mock/teacher-portrait-aggregate.mock.ts` | `fetchTeacherPortraitAggregateMock` 经 adapter 合并 5 slice |

数据流：

```
getTeacherProfileApiMock(teacherId)
  → adaptTeacherProfileSlices(vo)
  → 覆盖 aggregate 中 5 个 slice
  → Container normalize（不变）→ View
```

### 3.3 单测

| 路径 | 用例 |
|------|------|
| `adapters/teacher-profile.adapter.spec.ts` | 10 项 adapter 单测 |
| `components/classroom-content-eval/chart-options.spec.ts` | 雷达轴与外围标签对齐（2 项） |
| `components/teaching-style-flexibility/chart-options.spec.ts` | 雷达轴与外围标签对齐（3 项） |

### 3.4 预对接期接口文档快照（本模块 `docs/`）

| 文件 | 说明 |
|------|------|
| [docs/TeacherProfileRspVO接口文档.md](../docs/TeacherProfileRspVO接口文档.md) | 2026-07-03 初稿 |
| [docs/PostClassReportVO变更说明.md](../docs/PostClassReportVO变更说明.md) | 2026-07-07 `dimensionScore` 裸分值变更 |

> 以上为预对接依据；正式接口文档到位后应新建需求比对差异，**勿直接视为最终契约**。

---

## 四、关键转换约定（备忘）

| 模块 | 约定 |
|------|------|
| 我的教案 | API `outstanding*` → slice `excellent`；ratio `0~1` → slice `0~100` |
| 课堂教学内容评价 | `dimensionScore.<key>` 为裸分值；`maxScore` 由 adapter 常量补全；A/B 维度**展示顺序**见 `content-eval-dimensions.ts`（非 API key 顺序） |
| 课堂结构清晰度 | `stageClarity` → slice `segmentClarity` |
| 课堂语言行为 | 五项 count + `total`；ratio 由 adapter 按 count/total 计算 |
| 语言可理解度 | `maxScore` 35/35/30 来自组件常量；丢弃接口 `level` |

---

## 五、验收结果（2026-07-08）

| 检查项 | 结果 |
|--------|------|
| `vitest` adapter + 雷达对齐单测 | ✅ 15 passed |
| `pnpm typecheck` | ✅ PASS |
| 5 个 Container/View 零改动（预对接约束） | ✅ |
| Mock 页 5 模块有数据/缺省态可渲染 | ✅ 人工冒烟 |

---

## 六、交付期附带修复

预对接联调中发现 ECharts 5 雷达轴为 **从 12 点起逆时针** 排布，与外围 HTML 标签假设的顺时针不一致，已修复：

| 组件 | 修复 |
|------|------|
| 课堂教学内容评价 | `chart-options.ts`：`RADAR_AXIS_DIMENSION_INDEX = [2, 0, 3, 5, 4, 1]` |
| 教学风格与弹性特征 | `constants.ts`：`RADAR_AXIS_ORDER` 改为逆时针顺序 |

---

## 七、未纳入本阶段

| 项 | 说明 |
|----|------|
| 真实 HTTP 请求 | 仍走 `fetchTeacherPortraitAggregateMock` |
| `TeacherProfileRspVO` 其余字段 | 如教师信息、标签云、教学风格趋势等 slice |
| `useTeacherPortraitData.ts` 改造 | 留待正式接口对接需求 |
| OpenAPI / 代码生成 | 未使用 |

---

## 八、后续需求建议（正式接口文档到位后）

1. 新建 `api-adapter` 模块（如「教师画像正式接口对接」），引用本归档与新版接口文档做 diff。
2. 优先核对：`postClassReport.dimensionScore` 形态、ratio 精度、字段命名是否与预对接一致。
3. 在 `useTeacherPortraitData`（或等价数据层）调用 HTTP → `adaptTeacherProfileSlices` → aggregate，mock 保留为 fallback/单测 fixture。
4. 若正式文档变更 aggregate 契约，**仍优先改 adapter**，避免动 Container（除非产品明确要求改 UI 契约）。

---

## 九、归档说明

- `requirements/`、`specs/`、`plans/` 保留为预对接阶段历史依据，**当前不再作为活跃开发入口**。
- 下一阶段请使用 `create-demand` 新建模块目录，勿在本目录直接追加正式对接 spec（避免预对接与正式对接混档）。
