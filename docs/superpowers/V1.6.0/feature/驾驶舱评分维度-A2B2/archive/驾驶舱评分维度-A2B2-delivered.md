# 驾驶舱评分维度-A2B2 · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-08-28  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

驾驶舱教师画像详情 A/B「评分维度得分」对齐校端：子类型列表 + 缺 2 类时仅补雷达 A2/B2 mock；面板内独立累计 5s 轮播、类型标签、GSAP 指示条；五维五边形雷达。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `data-cockpit/.../detail/adapters/constants/content-eval-dimensions.ts` |
| 改 | `data-cockpit/.../detail/api/types/teacher-profile-rsp.vo.ts` |
| 改 | `data-cockpit/.../detail/adapters/classroom-content-eval.adapter.ts` |
| 改 | `data-cockpit/.../detail/types/classroom-content-eval.ts` |
| 新 | `data-cockpit/.../detail/mock/content-eval-dimension-subtype.mock.ts` |
| 新 | `data-cockpit/.../detail/composables/use-subtype-carousel.ts` |
| 改 | `data-cockpit/.../detail/components/classroom-content-eval/chart-options.ts` |
| 改 | `data-cockpit/.../detail/components/classroom-content-eval/dimension-radar-panel.vue` |
| 改 | `data-cockpit/.../detail/composables/use-detail-profile.ts` |
| 改 | `data-cockpit/.../detail/index.vue` |
| 改 | `apps/data-cockpit/package.json`（gsap） |

## 验收结果

- [x] A1/B1 六维与改前一致，显示类型标签
- [x] A2/B2 五维五边形
- [x] 累计 5s / hover 暂停续计 / A·B 独立
- [x] 指示条可点 + 三态 + GSAP 宽度过渡
- [x] 单子类型不轮播
- [x] 仅雷达补 A2/B2 mock
- [x] S2/趋势未改

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | `buildEmptyClassroomContentEval` 含 subtypes；有数据 `mapSubtypes` |
| 常量/mock/真数据 | 通过 | `CATEGORY_*` + `FILL_MISSING_*` mock；legacy dimensionScore→A1/B1 |
| 多入口 | 通过 | 仅 S3 两雷达面板 |
| 失败/缺省 | 通过 | 无 1 类真分不加 2 类；count≤1 隐藏 dots |

## 还原度自检

- Figma 节点：交互参考校端 `8785:61536`；舞台 `8030:31034`
- 对照方式：spec 样式表 + 驾驶舱主题色 `#0BAAFF` / `#28DCD1`
- 偏差清单：指示条未选色用驾驶舱半透明白，非校端灰底（深色主题适配）
- 结论：可交付

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
