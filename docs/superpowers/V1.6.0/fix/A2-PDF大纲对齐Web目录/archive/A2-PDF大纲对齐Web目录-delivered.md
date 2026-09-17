# A2-PDF大纲对齐Web目录 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-17  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

治理 A2 PDF 模板标题层级，使 Playwright/Chromium 生成的 PDF 书签与 Web 报告 TOC（44 项）对齐；去掉封面/目录页/面板 h4 噪声；Hero 升为 h2；L3 小节改为 h4 以便嵌套。不改前端预览页。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/A/A2/ClassroomContentAnalysisReportA.html` |
| 改 | `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/A/A2/ClassroomContentAnalysisReportTocA.html` |
| 改 | `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/A/A2/coverA.html` |
| 改 | `src/report/report/A2/ClassroomContentAnalysisReportA.html` |
| 改 | `src/report/report/A2/ClassroomContentAnalysisReportTocA.html` |
| 改 | `src/report/report/A2/coverA.html` |

## 验收结果

- [x] 正文 heading 清单 44 项，与 Web TOC 文案一致（含 Hero；L3 为 h4）
- [x] 无非 TOC 的 h4；封面无 h1；Toc 页「目录」非 heading
- [x] muban 与本仓 heading 策略一致
- [ ] 重生 case_basic_info PDF 后，预览页点大纲验证滚动（需业务侧重生后人工验）

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 仅改标题标签，不改数据绑定 |
| 常量/mock/真数据 | N/A | 不改 Web mapper |
| 多入口 | 通过 | muban lessonTemplates 与 frontend src/report 双份已同步 |
| 失败/缺省 | N/A | 不涉及 |

## 还原度自检

不适用：无 Figma / 非 UI 视觉还原（标签语义治理）

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑

## 验证提醒

须重新生成课例基本情况 PDF（`case_basic_info_pdf_url`）后，在 `ai-teaching-analysis-report` 右侧大纲核对条目并点击跳转。旧 PDF 不会自动更新。
