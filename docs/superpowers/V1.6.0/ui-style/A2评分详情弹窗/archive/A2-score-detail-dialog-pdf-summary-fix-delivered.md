# A2 评分详情弹窗 · PDF 总分行对齐 · 交付归档（轻量档）

**归档类型：** ui-style 补缺交付快照（PDF HTML 重生成 + mock 跨端一致性修复）
**归档日期：** 2026-09-10
**版本：** V1.6.0
**Figma 节点：** `8674:32751`（web 弹窗）/ `8674:33290`（PDF 弹窗）
**关联需求：** [../requirements/03-PDF-总分行对齐.md](../requirements/03-PDF-总分行对齐.md)
**关联 Spec：** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**P3：** 轻量档（用户已确认方案 A）

---

## 改动摘要

`ClassroomContentAnalysisReportA2.html` 是用旧版 mock 生成的过时产物，"总分小计"行 value 渲染为 `81.10（权重100%）`，而 web 端 mock 与 gen 脚本（`scripts/gen-ccar-a2-static-html.mts` 行 2164-2177 的 `renderScoreSummaryRow`）都只输出 `81.10`。本需求通过跑 `pnpm gen:ccar:a2` 重新生成 PDF HTML，让 mock 与 PDF HTML 保持一致。

## 改动文件

| 操作 | 路径 | 备注 |
|------|------|------|
| 重生成 | `src/report/report/A2/ClassroomContentAnalysisReportA2.html` | 183785 → 144417 bytes（删除过时"（权重100%）"后缀 + 重生成 R11 打印回归 CSS） |
| 重生成 | `src/report/report/A2/ClassroomContentAnalysisReportTocA.html` | 目录侧（44 项） |
| 新增 | `docs/superpowers/V1.6.0/ui-style/A2评分详情弹窗/requirements/03-PDF-总分行对齐.md` | 本次需求 |
| 新增 | `docs/superpowers/V1.6.0/ui-style/A2评分详情弹窗/archive/A2-score-detail-dialog-pdf-summary-fix-delivered.md` | 本归档 |

**未改动**：
- 任何 `.vue` / `.ts` / mock 数据 / gen 脚本 — 因为脚本本身正确，HTML 是过时产物

## 验收结果

### 差异清单 15 项（与 web 端 mock 对比）

| # | 类别 | 项目 | 一致 |
|---|---|---|---|
| 1 | 文案 | 5 维度表 表头 | ✅ |
| 2 | 文案 | 5 维度表 行数据 | ✅ |
| 3 | 文案 | "总分小计"行 value | ✅ 重生成后 = `81.10`（无"（权重100%）"） |
| 4 | 文案 | 课堂时长T | ✅ |
| 5 | 文案 | 时长系数 value + hint | ✅ |
| 6 | 文案 | 最终总分 value + sideNote | ✅ |
| 7 | 文案 | 等级 gradeCode + gradeBadge | ✅ |
| 8 | 文案 | 底部温馨提示 | ✅ |
| 9 | 条件渲染 | 等级行 gradeCode/gradeBadge | ✅ |
| 10 | 条件渲染 | 时长系数 hint | ✅ |
| 11 | 条件渲染 | 最终总分 sideNote | ✅ |
| 12 | 条件渲染 | "查看详情"按钮 | ✅（PDF 无，spec §2 明确） |
| 13 | 条件渲染 | 弹窗内详情（评分项/档位系数表/蓝底小计/补偿检查/判定/对错图标） | ✅（PDF 不嵌弹窗，spec §2 明确） |
| 14 | 顺序 | 5 维度表行顺序 | ✅ |
| 15 | 顺序 | 5 汇总行顺序 | ✅ |

### R11 静态检查（`pnpm check:ccar:a2` 第一步）

```
tocCount: 44
missingIds: []
hasPlaceholder: false
hasViewDetail: false          ← PDF 端无"查看详情"按钮（符合 spec §2）
hasTimeAnchorClass: false
hasPrintOverlapFix: true
hasPrintKeepCardGrid: true
hasPrintStackGrid: false
hasPrintFontLg: true
hasPrintCardHead: true
hasTitleSpacingStandard: true
hasProblemChainPrintBlock: true
hasPrintNoTrailingPageBreak: true
hasCardHeadPrintRadius: true
hasScoreSummaryPrintFlex: true
hasScoreSummaryThirdColRight: true
hasHardcoded18InBody: false
remainingHardcodedCardHead: false
hasTip: true                  ← 底部温馨提示存在
hasScoreSummary: true         ← 5 汇总行存在
hasCompensationBadge: true    ← 补偿触发徽章存在

R11 static checks PASSED
```

### vitest 单元测试（`pnpm check:ccar:a2` 第二步）

```
Test Files  1 passed (1)
     Tests  3 passed (3)
   Duration  396ms
```

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | PDF HTML 是固定 mock，无空态分支 |
| 常量 / mock / 真数据 | 通过 | mock `chapter-rest.ts` 行 237 value = `'81.10'`，gen 脚本 `renderScoreSummaryRow` 直接渲染，PDF HTML 重生成后一致 |
| 多入口 | N/A | PDF HTML 是单产物，无多入口 |
| 失败 / 缺省 | N/A | 无条件渲染错误 |

## 还原度自检

- **Figma 节点：** `8674:32751`（web 弹窗）/ `8674:33290`（PDF 弹窗）
- **对照方式：** 拉 mock 数据 + grep PDF HTML 关键文案，逐一对比
- **偏差清单：** 差异 #3 已修复（"总分小计" value 修后 = `81.10`）；其余 14 项原本就一致
- **结论：** 可交付

## Harness 闭环

- [x] validate 开发前已跑（`pnpm check:ccar:a2` R11 静态 + vitest 单元测试 PASSED）
- [x] archive 交付快照已写（本文）
- [x] 文档齐全：requirements/03- + archive/-pdf-summary-fix-delivered
- [x] 差异清单 15 项已逐一核对
- [x] 唯一差异 #3 已通过重生成 PDF HTML 修复
- [x] 重生成后无"权重100"字符串
- [x] 其余 14 项对齐点保持

## 交付后 validate

- [x] `pnpm harness:check` — 唯一警告 `skill-CCAR-PDF流水线`（模块历史遗留，与本需求无关，宽松模式不阻断）
- [x] `pnpm harness:status -- --match "A2评分详情弹窗"` — 阶段 `DELIVERED`
