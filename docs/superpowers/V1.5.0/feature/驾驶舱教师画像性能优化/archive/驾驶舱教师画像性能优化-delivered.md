# 驾驶舱教师画像性能优化 · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-08-04  
**版本：** V1.5.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

按方案 A（不改视觉）完成教师画像组合件性能优化：ECharts resize debounce + merge、热力图双通道去重、头像 lazy、mock 缓存。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps/data-cockpit/.../mr-teacher-portrait/mock/heatmap.mock.ts` |
| 改 | `apps/data-cockpit/.../mr-teacher-portrait/mock/teacher-list.mock.ts` |
| 改 | `apps/data-cockpit/.../mr-teacher-portrait/components/teacher-card/teacher-card.vue` |
| 改 | `apps/data-cockpit/.../mr-teacher-portrait/components/tag-panel/tag-row.vue` |
| 改 | `apps/data-cockpit/.../mr-teacher-portrait/components/style-distribution-panel/style-distribution-panel.vue` |
| 改 | `apps/data-cockpit/.../mr-teacher-portrait/components/subject-style-heatmap/subject-style-heatmap.vue` |

（实现仓：`apps-development-platform` / data-cockpit）

## 验收结果

- [x] 两图 resize debounce；resize 路径 merge / 仅必要时更新 option，无 notMerge 风暴  
- [x] 热力图 watch 不再监听 `hostContentHeight`，单次宽度变化不双通道 `renderChart`  
- [x] 教师卡、标签行头像 `loading="lazy"` + `decoding="async"`  
- [x] `resolveHeatmap` / `resolveTeacherList` 缓存或稳定引用  
- [x] 筛选逻辑未改；视觉方案 A 不改毛玻璃与装饰  

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | scenario empty/full 路径仍由 resolve* 分支；仅加缓存 |
| 常量/mock/真数据 | 通过 | mock 形状未变；adapter 仍 re-export |
| 多入口 | 通过 | 单组件三主题，未改入口映射 |
| 失败/缺省 | N/A | 本次不涉及缺省态文案/数值 |

## 还原度自检

不适用：无 Figma / 非 UI（方案 A 明确不改视觉）

## Harness 闭环

- [x] validate 开发前已跑  
- [x] archive 交付快照已写  
- [x] validate 交付后已跑  
