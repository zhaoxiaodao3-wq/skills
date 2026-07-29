# A类B类报告模板5.1和5.2同步 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

将「5.1 核心问题行 / 5.2 has+详情拼接 / 空值不占位」同步到后端 lessonTemplates（仅该目录），与已交付的 Vue 展示契约对齐。

## 2. 已确认方案

**方案 B：** 只改  

`E:\code\muban\analysis-service\src\main\resources\lessonTemplates\`  

下的 A/B 报告正文模板。**不改** 本仓 `src/report/**`、不改 Vue mapper（已交付）。

## 3. 改动文件

| 路径 |
|------|
| `.../lessonTemplates/A/ClassroomContentAnalysisReportA.html` |
| `.../lessonTemplates/B/ClassroomContentAnalysisReportB.html` |

TOC / cover 无表体内容，可不改。

## 4. 行为契约（与 Vue 一致）

### 4.1 空值

- `#strings.isEmpty(...)` 时 **输出空字符串**，禁止 `'-'` / `'无'` 占位（本任务涉及的 5.1 / 5.2 表体单元格）。

### 4.2 5.1 导入分析

行顺序：

1. 导入时长 ← `duration`  
2. 教案设计的导入方式 ← `plannedMethod`  
3. 实际使用的导入方式 ← `actualMethod`  
4. **是否提出核心问题** ← 非空片段拼接 `hasCoreQuestion` + `，` + `coreQuestionContent`（皆空则为空）  
5. 导入与新课的衔接 ← `connectionToNewLesson`  
6. 教学方法合理性评估 ← `reasonableness`  
7. 改进建议 ← `improvementSuggestion`  

- **A 模板：必须新增第 4 行**（当前缺失）  
- **B 模板：保留该行，简化 SpEL，去掉双空时的 `-`**

### 4.3 5.2 新知教学

三行改为拼接（有值才拼进，不补占位）：

| 行 | 表达式意图 |
|----|------------|
| 问题链设计 | `hasQuestionChain` + `。` + `questionChainDetail` |
| 案例使用 | `hasCases` + `，` + `caseDetails` |
| 探究活动设计 | `hasInquiryActivity` + `，` + `activityDetails` |

其余行仍绑单字段，空则空串。

Thymeleaf 可用与「非空才参与拼接」等价的 SpEL（避免引用不存在的 Java 属性）。

## 5. 非目标

- 不改本仓 `src/report`、`template-thymeleaf`、Vue mapper  
- 不改正文章节其它模块（5.3+）空值策略（除非同表误伤，保持最小 diff）

## 6. 验收标准

- [x] A 模板 5.1 含「是否提出核心问题」，顺序正确  
- [x] A/B 5.2 三行含 has 字段拼接逻辑  
- [x] 5.1/5.2 本表空值不再回落 `-`/`无`  
- [x] 本仓 `src/` 无因本需求改动  
