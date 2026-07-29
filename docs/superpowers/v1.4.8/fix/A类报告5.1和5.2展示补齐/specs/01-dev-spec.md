# A类报告5.1和5.2展示补齐 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

补齐 / 修正 A、B 类课后报告 5.1 导入分析与 5.2 新知教学过程分析的展示逻辑；空值按接口原样展示，不加占位符。

## 2. 已确认方案

- 范围：**A + B**
- B 类字段已在 `V1.4.7_B类课后报告_前端接口文档.md` §7.1 / §7.2 核对齐全
- 5.1「是否提出核心问题」：A 为 Vue mapper **漏接**（HTML 已有）；B 已接，需对齐空值规则
- 5.2：共用 `buildNewKnowledgeTableRows`，改为 `has*` + 详情拼接

## 3. 行为契约

### 3.1 空值（强制）

- 字段缺失 / 空字符串 / 仅空白：**展示空字符串**，**禁止**用 `-`、`无` 等占位
- 固定行始终保留，**禁止**因内容空而 `filter` 掉行
- 拼接字段：有值拼有值；仅一侧有值则只展示该侧；两侧皆空 → 空字符串

### 3.2 5.1 导入分析

固定行顺序（A/B 一致）：

1. 导入时长 ← `duration`
2. 教案设计的导入方式 ← `plannedMethod`（B 可兼容旧名）
3. 实际使用的导入方式 ← `actualMethod`
4. **是否提出核心问题** ← `hasCoreQuestion` + `coreQuestionContent`  
   - 推荐拼接：有 `has` 且有 content → `是，「content」` 或 `${has}，${content}`（与现有 B `formatIntroCoreQuestion` 对齐并收敛到「无占位」）  
   - **A 必须新增此行**
5. 导入与新课的衔接 ← `connectionToNewLesson`（已有，保留）
6. 教学方法合理性评估 ← `reasonableness`
7. 改进建议 ← `improvementSuggestion`（空则空，不用「无」）

A 类另：`calculationProcess` 有 trim 非空才出「计算过程公示」块（保持现逻辑即可）。

### 3.3 5.2 新知教学过程分析

行顺序不变；三行内容改为：

| 可观测项 | 拼接 |
|----------|------|
| 问题链设计 | `hasQuestionChain` + `。` + `questionChainDetail` |
| 案例使用 | `hasCases` + `，` + `caseDetails` |
| 探究活动设计 | `hasInquiryActivity` + `，` + `activityDetails` |

其余行（知识讲解逻辑、教学语言特点、匹配度、改进建议）仍绑原单字段，空则空串。

实现落点：`utils/report-display-format.ts` 的 `buildNewKnowledgeTableRows`（A/B 共用）。

## 4. 涉及文件（预期）

| 路径 | 改动 |
|------|------|
| `mappers/classroom-content-analysis-a.mapper.ts` | 补核心问题行；去 filter；空值原样 |
| `mappers/classroom-content-analysis-b.mapper.ts` | 去 filter；空值原样；核心问题拼接对齐 |
| `utils/report-display-format.ts` | 5.2 拼接 + 空串 |
| `classroom-diagnosis/mock/type-a-chapters.ts`（及 B mock 若需） | 5.1 补核心问题示例行 |
| 可选：抽公共 `joinHasAndDetail` / `formatIntroCoreQuestion` 避免 A/B 分叉 |

Thymeleaf HTML 若已有「是否提出核心问题」行，运行时 Vue 对齐即可；不强制改静态 demo 以外文案。

## 5. 非目标

- 不改接口契约 / VO 命名
- 不改 5.3+ 其它小节逻辑（除非共用 helper 副作用，需保持行为符合本 spec）
- 不恢复「空显示 `-`」旧约定

## 6. 验收标准

- [x] A 类 5.1 有「是否提出核心问题」，顺序在实际导入方式与衔接之间
- [x] A/B 5.1 空字段显示为空，行不消失；不用「无」/「-」占位
- [x] A/B 5.2 问题链 / 案例 / 探究为 has+详情拼接；缺段不补占位
- [x] B 类既有核心问题行行为与空值规则一致
- [x] 相关单测（若有）按新契约更新
