# H5 A2 无用逻辑清理 · Dev Spec

**模块：** `fix/H5-A2无用逻辑清理`  
**档位：** 标准  
**日期：** 2026-09-09  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

清理 H5 A2 分享页中已确认无用的文件与死字段/多余 export；**不改变**页面展示与接口映射语义（除去掉 UI 已不读的 overview 字段）。

## 2. 删除文件

| 路径 | 理由 |
|------|------|
| `analysisTeachingA2/styles/a2-text-wrap.scss` | 零引用；换行已在 `index.vue` `.a2-report-page` |
| `analysisTeachingA2/styles/`（若删后为空） | 一并移除空目录 |

## 3. Overview 死字段

`A2OverviewPanel` 仅展示：报告模板 / 课堂时长 / 科目 / 年级 / 教材章节。

从以下两处移除 `topic`、`totalScore`、`gradeCode`、`gradeLabel`：

- `types/a2-report.ts` → `A2OverviewMeta`
- `adapters/mapA2ToView.ts` → `mapCoverAndOverview` 的 `overview` 对象（及相关仅服务于这些字段的局部变量，如仅用于 overview 的 `level`/`gradeCode`）

封面 `cover.lessonName` 等**保留**（仍用 topic/analysisName 别名）。

## 4. 取消多余 export

`mapA2ToView.ts` 中下列符号若全仓无外部 import，改为非 export（文件内仍可调用）：

- `resolveEvaluationDimensionFullScore`
- `parseClassDurationMinutes`
- `buildDurationCoefficientHint`
- `mapEvaluationResultToScoringSection`
- 以及其它「仅本文件自用但仍 export」的 helper（如 `mapLogicSectionLines`、`parsePlanReferenceItems` 等）——**以改前 grep 无外部引用为准**

保留对外入口：`mapA2ToView`；`formatA2DurationDisplay` 若仅本文件用则一并取消 export。

## 5. 验收

1. 无 `a2-text-wrap.scss` / 空 `styles` 残留  
2. `A2OverviewMeta` 与 overview 映射无上述四字段；面板仍正常五列  
3. 取消 export 后 H5 构建/类型检查无「找不到导出」类错误  
4. 其它章节与 10.1 行为不变  

## 6. 实现落点

- `E:\code\H5\src\pages\share\analysisTeachingA2\styles\a2-text-wrap.scss`（删）
- `types/a2-report.ts`
- `adapters/mapA2ToView.ts`
