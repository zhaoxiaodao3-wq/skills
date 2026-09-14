# 教师画像A2B2接口对接 · 交付归档

**归档类型：** api-adapter 交付快照  
**归档日期：** 2026-09-04  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

接入 `getTeacherProfile` 真实字段 `a2DimensionScore` / `b2DimensionScore`；五维 key 对齐 `knowledgeMastery`。缺/空 2 类数据时仍保留 A2/B2 标签与轮播，雷达按**子类型**走视觉空态（非整块 isEmpty）。关闭假分自动注入。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/api/types/teacher-profile-rsp.vo.ts` |
| 改 | `src/pages/school/teacher-portrait/adapters/constants/content-eval-dimensions.ts` |
| 改 | `src/pages/school/teacher-portrait/adapters/classroom-content-eval.adapter.ts` |
| 改 | `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts` |
| 改 | `src/pages/school/teacher-portrait/mock/content-eval-dimension-subtype.mock.ts` |
| 改 | `src/pages/school/teacher-portrait/mock/teacher-profile-api.mock.ts` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/types.ts` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalContainer.vue` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalView.vue` |

## 验收结果

- [x] VO 含可空 `a2DimensionScore` / `b2DimensionScore`
- [x] Adapter 优先新字段；`knowledgeMastery` 映射知识落实度
- [x] 缺/空 2 类 → A2/B2 标签 + 0 分；`FILL_MISSING_DIMENSION_SUBTYPE_2_MOCK=false`
- [x] A1/B1 legacy 行为保留
- [x] `teacher-profile.adapter.spec.ts` 31 passed
- [x] 真字段用例 + 空占位用例已覆盖

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 无 2 类字段 → 空 A2/B2（0）；有 `a2DimensionScore` → 真分；单测覆盖 |
| 常量/mock/真数据 | 通过 | `CATEGORY_2_DIMENSION_DEFS` / MOCK / VO 均用 `knowledgeMastery` |
| 多入口 | N/A | 仅校端教师画像 adapter；驾驶舱不在本需求 |
| 失败/缺省 | 通过 | 可空字段；缺省空占位不报错 |

## 还原度自检

不适用：无 Figma / 非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
