# 评价维度得分-A2B2 · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-08-28  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师画像「评价维度得分」支持 A1/A2、B1/B2 子类型：适配层输出子类型列表并 mock A2/B2 五维；A/B 独立累计式 5s 轮播（hover 暂停不重置）；类型标签 + GSAP 指示条水滴切换与图表 crossfade。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/adapters/constants/content-eval-dimensions.ts` |
| 改 | `src/pages/school/teacher-portrait/api/types/teacher-profile-rsp.vo.ts` |
| 改 | `src/pages/school/teacher-portrait/types/aggregate.ts` |
| 改 | `src/pages/school/teacher-portrait/adapters/classroom-content-eval.adapter.ts` |
| 改 | `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts` |
| 改 | `src/pages/school/teacher-portrait/mock/teacher-profile-api.mock.ts` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/types.ts` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/chart-options.ts` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/chart-options.spec.ts` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalContainer.vue` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalView.vue` |
| 新 | `src/pages/school/teacher-portrait/composables/useSubtypeCarousel.ts` |
| 新 | `src/pages/school/teacher-portrait/composables/useSubtypeCarousel.spec.ts` |
| 改 | `package.json` / lockfile（新增 `gsap`） |

## 验收结果

- [x] A1/B1 维度名、满分、六边形样式与改前一致，且显示类型标签
- [x] A2/B2 为五维五边形，维度与满分符合 spec §2.1
- [x] 未 hover 累计 5s 自动切子类型；hover 暂停累计、移出后续计；A/B 计时互不影响
- [x] 点击指示条可切换，活动条有丝滑宽度过渡（GSAP）
- [x] 指示条具备选中 / 未选中 / hover 可区分状态
- [x] 仅一侧或缺子类型时不错误轮播；单子类型隐藏指示条
- [x] mock 可同时演示 A1↔A2、B1↔B2
- [x] 环形图、等级汇总、得分趋势无回归（未改相关逻辑）

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | Container `buildEmptyViewModel` 用 A1/B1 常量维；有数据走 `dimensionSubtypes*`；`isSliceWithoutData` 扫子类型 dimensions |
| 常量/mock/真数据 | 通过 | `CATEGORY_*_DIMENSION_DEFS` / `CATEGORY_2_DIMENSION_DEFS`；mock `dimensionScoreBySubtype`；adapter 兼容旧 `dimensionScore` |
| 多入口 | 通过 | 仅评价维度雷达区；环形图/趋势未改 |
| 失败/缺省 | 通过 | 无子类型分时 adapter 回落 A1/B1 零分占位；`count<=1` 不轮播、隐藏 dots |

## 还原度自检

- Figma 节点：`8785:61536`
- 对照方式：spec 样式表 + 实现 CSS（类型标签 24px / 底色 / 指示条 20×4·10×4·gap4）
- 偏差清单：A2/B2 按需求五维五边形（稿面六维占位不跟）；B 标题保留「基于教材」；指示条 hover 态由实现补齐
- 结论：可交付

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
