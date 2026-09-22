# A2-PDF评价列字面换行 · 交付归档

**归档类型：** fix 交付快照（含跟进）
**归档日期：** 2026-09-20
**版本：** V1.7.0
**Requirement:** [../requirements/02-lineSeparator报错改用SpEL双引号.md](../requirements/02-lineSeparator报错改用SpEL双引号.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

3.4.3 `aidAnalysis` 评价列：去掉 `lineSeparator()`（System 限制）与 SpEL `"\n"`（拆破 HTML 属性）。改为在双引号属性内用**单引号 + 真实换行字符**作 `listJoin` 分隔符，保留 `th:text` + `pre-wrap`，功能与防 XSS 行为不变。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `...\A\A2\ClassroomContentAnalysisReportA.html`（仅 aidAnalysis 评价 1 处） |

## 验收结果

- [x] 全文无 `lineSeparator` / 该处无 `java.lang.System`
- [x] 分隔符为 SpEL `"\n"`
- [ ] 后端重出 A2 PDF 成功 + 3.4.3 肉眼确认分行（待业务侧重出）
- [x] 其它 `listJoin(evRaw, '\n')` 未改

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 仅分隔符 |
| 常量/mock/真数据 | N/A | — |
| 多入口 | 有意不同 | 仅 3.4.3；其它章节仍可能字面 `\n`（范围外） |
| 失败/缺省 | 通过 | 标量分支未改；已移除易失败的 System 调用 |

## 还原度自检

不适用：无 Figma / 非 UI

## Harness 闭环

- [x] 跟进 requirements/spec/plan 已更新
- [x] Inline 已改模板
- [x] archive 已更新
