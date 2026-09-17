# A2学段年级文案 · Dev Spec

**模块：** `fix/A2学段年级文案`  
**档位：** 标准  
**日期：** 2026-09-15  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

板块四「与学段认知规律的符合度」meta 行统一展示为 **「学段与年级：…」**，消除「学段与学年」展示与「年级→学年」强制替换。

## 2. 行为细则

| # | 项 | 约定 |
|---|-----|------|
| 1 | 展示前缀 | 固定 `学段与年级：`（中文冒号） |
| 2 | 入参识别 | 继续匹配 `学段与年级` **或** `学段与学年`（含 `【】` / 纯文本两种形态） |
| 3 | 规范化输出 | bracket / plain 命中后输出 ``学段与年级：${core}``；fallback 去掉「基本信息：」后，将「学段与学年」替换为「学段与年级」（方向与现状相反） |
| 4 | PDF Thymeleaf | 不再 `replace(学段与年级 → 学段与学年)`；`metaDisp` 前缀与静态占位改为「学段与年级」；仍可识别含「学年/年级/学段」的行 |
| 5 | 一致性 | Web mapper、H5 adapter、muban 模板、本仓 PDF 模板四处展示语义一致 |

## 3. 改动面

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a2.mapper.ts`（`normalizeCognitiveFitMetaLine`） |
| 改 | 对应 `*.mapper.spec.ts` 断言 |
| 改 | mock / 类型注释中仍写「学段与学年」的示例（如 `mock/a2-data/...`、`classroom-content-analysis-a2-report.ts`） |
| 改 | `E:\code\H5\...\adapters\mapA2ToView.ts`（及注释若写「学年」） |
| 改 | `E:\code\muban\analysis-service\...\lessonTemplates\A\A2\ClassroomContentAnalysisReportA.html` |
| 改 | `src/report/report/A2/ClassroomContentAnalysisReportA.html` |

**不做：** 板块四其它文案、接口契约、无关样式。

## 4. 约束

- 只改展示层规范化与模板文案，不改 VO / 接口字段名  
- 外链 H5、muban 与本仓 PDF **同回合同步**，避免三端不一致  
- 不整文件 Prettier 格式化 A2 HTML（`pre-wrap` / 紧凑结构风险）

## 5. 验收

- [x] Web 板块四 meta 为「学段与年级：…」  
- [x] H5 同上  
- [x] muban PDF 模板 `metaDisp` / 占位为「学段与年级」  
- [x] 本仓 PDF 模板同源一致  
- [x] mapper 单测通过；mock/注释无「学段与学年」展示示例残留（入参兼容「学年」的匹配可保留）

## 6. 实现备注

1. Web：`normalizeCognitiveFitMetaLine` 两处返回值与 final `replace` 方向翻转。  
2. H5：复制同一逻辑。  
3. PDF：`meta2` 的 replace 改为学年→年级（或删除该 replace，仅改 `metaDisp` 前缀与占位）；`th:text` 占位同步。  
4. 跑相关 vitest；PDF 可用现有预览脚本抽查板块四。
