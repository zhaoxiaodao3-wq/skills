# 教师画像页面 — 弹性字段替换与画像卡片补全 实施计划

**Spec:** [specs/05-dev-spec.md](../specs/05-dev-spec.md)

**Goal:** 链路 A 替换 `teachingStyleElasticity` 字段；链路 B 用 `personalFeature` 补全教师画像卡片 HTTP 缺口。

---

## Task 1: VO 类型扩展

- [x] `TeachingStyleElasticityVO`：删 `sciLevel`/`elasticitySummary`，增 `stability`/`stabilityDescription`
- [x] 新增 `PersonalFeatureVO`（6 字段）
- [x] `TeacherProfileRspVO` 增 `personalFeature?`；注释改为 10 模块

---

## Task 2: 链路 A — 弹性 Adapter + constants

- [x] `teaching-style-flexibility.adapter.ts` 映射新字段
- [x] `types.ts` slice 字段替换
- [x] `mapStabilityLabelToLevel` 替换 `mapSciLevelToStability`

---

## Task 3: 链路 A — 弹性 Container

- [x] `normalizeApiSlice` 使用 `stabilityLabel`/`stabilityDescription`
- [x] Mock 分支不变

---

## Task 4: 链路 B — personalFeature Adapter + merge

- [x] 新建 `personal-feature.adapter.ts`
- [x] `useTeacherPortraitData` merge 注入 `teacherPortrait`

---

## Task 5: 链路 B — 卡片 Container

- [x] HTTP `buildApiFeatureTags`；Mock 仍用 `selectPersonalFeatureTags`
- [x] `normalizeSlice` 保留空 subject 的 subjectAdaptations

---

## Task 6: Mock + 单测

- [x] mock fixture 更新 stability + personalFeature
- [x] adapter spec 26 passed

---

## Task 7: 校验与归档

- [x] harness 开发前/后校验
- [x] typecheck 通过
- [x] spec 验收项勾选
- [x] archive 交付快照
