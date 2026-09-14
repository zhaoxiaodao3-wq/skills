# H5-A2 报告接口对齐 · 交付归档

**日期：** 2026-09-08  
**档位：** 标准  
**执行：** Inline

## 结论

H5 `analysisTeachingA2` 已对接真实分享接口报告体：外层沿用 H5 envelope（`status` / `basicInfo` / `reportContent`），内层按 Web `aReport`（PostClassReportA2VO）同构映射；样式未改；Empty Probe / 默认 FORCE_MOCK 已清理。

## 改动清单

### H5（`E:\code\H5`）

| 文件 | 说明 |
|------|------|
| `adapters/extractA2Report.ts` | 信封取数 + camelize / shape 识别 |
| `adapters/mapA2ToView.ts` | 真映射（对齐 Web 条件渲染与关键 helpers） |
| `constants/a2-report-messages.ts` | 空态文案常量 |
| `useA2ReportPage.ts` | 仅 `VITE_A2_FORCE_MOCK=1` 强制 mock；失败不静默整包 mock |
| `components/A2ClassroomSummaryPreview.vue` | 5.3 标题下 `notApplicableMessage` 一行文案 |
| `index.vue` | 移除 Empty Probe |
| `types/a2-report.ts` | 信封注释与 `aReport` 可选字段 |
| `components/A2ImportPreview.vue` / `A2NewKnowledgePreview.vue` | 修正 types 相对路径 |
| 删除 | `A2EmptyProbeToggle.vue`、`emptyProbe.ts`、`A2AtomPreview.vue` |

### frontend

| 文件 | 说明 |
|------|------|
| `classroom-content-report-registry.ts` | A2 `share.path` → `analysis-teaching-a2` |

## 一致性自检

| 规则 | 结果 |
|------|------|
| 不读 `renderFlags` | ✅ 仅字段启发式 |
| 3.4.2 `activityDesign` 空 →「【无实验/活动】」 | ✅ smoke |
| 3.6.2 问题链评价缺失 → 不适用 / hasChain=false | ✅ smoke |
| 5.0 `preJudgment` 仅值 + 否/无隐藏 5.1–5.3 | ✅ smoke |
| 5.3 `coreQuestionReturn` null/`[]` → 固定文案 | ✅ smoke + 模板绑定 |
| 10.1 系数/公式编入 `value`；等级拆 code/badge | ✅ smoke |
| 禁改样式 | ✅ 仅 5.3 复用已有 `__hint` 类 |

## 本地验证

1. 带分享 `code`：拉接口；`status===0` → 真数据映射；**缺字段/缺模块只出空态，绝不回退 mock**
2. 无 `code` / 接口失败：不渲染假数据（失效或不展示内容）
3. Web 分享 A2 应打开 `/analysis-teaching-a2`

## 残留

- ~~`mock/a2-mock.ts`~~：已删除，生产路径不再引用 mock
- G05 评分详情弹窗：不做（与 Web 一致）
- 真环境联调需至少覆盖：有总结 + 5.3 空、无实验/活动、无问题链各一条
