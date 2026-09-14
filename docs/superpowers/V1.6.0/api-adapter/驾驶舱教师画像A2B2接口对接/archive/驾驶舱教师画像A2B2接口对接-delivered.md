# 驾驶舱教师画像A2B2接口对接 · 交付归档

**归档类型：** api-adapter 交付快照  
**归档日期：** 2026-09-04  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**实现仓：** `E:\code\dataView\apps-development-platform\apps\data-cockpit\`

## 改动摘要

驾驶舱详情评价维度雷达接入真实 `a2DimensionScore` / `b2DimensionScore`；key 对齐 `knowledgeMastery`；关假分注入；缺/空 2 类仍保留标签与轮播，雷达按子类型视觉空态（对齐校端选项 B）。

## 改动文件（data-cockpit）

| 操作 | 路径 |
|------|------|
| 改 | `.../detail/api/types/teacher-profile-rsp.vo.ts` |
| 改 | `.../detail/adapters/constants/content-eval-dimensions.ts` |
| 改 | `.../detail/adapters/classroom-content-eval.adapter.ts` |
| 改 | `.../detail/mock/content-eval-dimension-subtype.mock.ts` |
| 改 | `.../detail/types/classroom-content-eval.ts` |
| 改 | `.../detail/composables/use-detail-profile.ts` |
| 改 | `.../detail/components/classroom-content-eval/dimension-radar-panel.vue` |

## 验收结果

- [x] VO 含可空 a2/b2；key=`knowledgeMastery`
- [x] Adapter 优先真字段；`FILL_MISSING=false`；缺数据空 A2/B2
- [x] 雷达按 `activeSubtype.isEmpty`；整块空态含 A1+A2 / B1+B2
- [x] A1/B1 / levelStat / totalCount 路径未改语义
- [ ] 详情页真接口冒烟（需本地打开 preview 页人工确认）

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | mapSubtypes 按子类型 isEmpty；雷达用 radarEmpty |
| 常量/mock/真数据 | 通过 | CATEGORY_2 / MOCK / VO 均为 knowledgeMastery |
| 多入口 | N/A | 仅驾驶舱 detail；校端已另模块交付 |
| 失败/缺省 | 通过 | 可空字段；空占位不报错 |

## 还原度自检

不适用：无 Figma / 非本需求 UI 还原

## Harness 闭环

- [x] validate 开发前已跑（READY_TO_DEV）
- [x] archive 交付快照已写
- [x] validate 交付后已跑
