# 教师画像工程化重构 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-03
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

在 data-cockpit `mr-teacher-portrait-1` 完成工程化重构：领域类型迁入 `types/`，`adapters/portrait-data.ts` 作为组件唯一取数入口（仍转发 mock）；热力与风格分布 layout 外提为独立 `.layout.ts`；「数据态」预览开关仅 `import.meta.env.DEV` 可见。无视觉/交互 intentional 变更。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `.../mr-teacher-portrait-1/types/*.ts` |
| 增 | `.../mr-teacher-portrait-1/adapters/portrait-data.ts` |
| 增 | `.../subject-style-heatmap/subject-style-heatmap.layout.ts` |
| 增 | `.../style-distribution-panel/style-distribution-panel.layout.ts` |
| 改 | `mock/*.ts`（类型改从 types 引入并 re-export） |
| 改 | 各 panel / 壳层改 import 至 adapters；壳层 DEV-only 开关 |

工作根目录：`E:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait-1/`

## 验收结果

- [x] 组件经 `adapters/portrait-data` / `types` 取类型与 resolve，不再以 mock 为唯一契约源
- [x] heatmap / style-distribution 布局函数可独立引用（`.layout.ts`）
- [x] 生产构建无「数据态」开关 UI（`v-if="isDev"` + `import.meta.env.DEV`）
- [x] DEV 下空态/有数据切换逻辑保留

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 壳层 `isEmptyPreview` → 各 panel scenario |
| 常量/mock/真数据 | 通过 | adapters 仍转发 mock；未接真接口 |
| 多入口 | N/A | 单组合组件 |
| 失败/缺省 | N/A | 未改业务空态语义 |

## 还原度自检

不适用：纯工程化，无 Figma 新稿面

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
