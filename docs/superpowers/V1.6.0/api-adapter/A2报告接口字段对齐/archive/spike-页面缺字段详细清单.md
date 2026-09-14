# A2 报告 · 页面需要 / 接口缺失 · 详细清单

**日期：** 2026-09-07  
**用途：** 可直接转后端确认  
**对照：** 页面 mock（`TypeA2*`）↔ 预接口 `caseBasicInfo.aReport`（`A2-报告字段文档.md`）  
**说明：** 仅列「页面要、接口没有 / 语义不符 / 结构不够」；改名级转换不算缺字段（见转换分析另文）。

**优先级：**  
- **P0** 不补则无法按稿面还原或条件渲染不可靠  
- **P1** 可兜底但体验/稳定性差（拼接串拆、语义错位）  
- **P2** 文档矛盾或展示增强，可约定兜底  

---

## P0 · 硬缺口 / 语义冲突

### G01 · 1.2 亮点标题与正文拆分

| 项 | 内容 |
|----|------|
| 页面位置 | 一、1.2 亮点展示 · `highlightTable` |
| 页面需要 | `highlightLead`（标题/加粗）+ `highlightBody`（正文） |
| 接口现状 | `overallSummary.highlights[].description` **单字段** |
| 已有字段 | `seq` / `evidence` / `suggestion` 够用 |
| 建议补 | `descriptionLead` + `descriptionBody`（或 `title` + `description`） |
| 前端兜底 | 整段进 lead，body=`--`（样式会变） |

---

### G02 · 4.1 练习设计维度名与语义不一致

| 项 | 内容 |
|----|------|
| 页面位置 | 四、4.1 习题设计分析 · 四张 deficiency 卡 |
| 页面需要（Figma） | ①题目典型性 ②分层设计 ③**练习时机** ④**练习时长分配** |
| 接口现状 | ①题目典型性 ②分层设计 ③**与新知衔接** ④**学生独立练习时间** |
| 冲突说明 | 第 3、4 维**不是改名**，语义不同：时机≠衔接；时长分配≠独立练习时间 |
| 建议补 | 按稿面改维度名与分析口径；或书面确认「以接口为准」并改 Figma/页文案 |
| 前端兜底 | 按数组下标硬映射（**会错义**，不推荐无确认） |

---

### G03 · 3.6.2 问题链逻辑区结构化字段

| 项 | 内容 |
|----|------|
| 页面位置 | 三、3.6.2 · `a2ProblemChainStack` 逻辑分析区 |
| 页面需要 | 见下表 |
| 接口现状 | `logicAnalysis` 多为拼接 `String` / `String[]` |

**页面需要字段明细：**

| 页面字段 | 含义 | 接口现状 |
|----------|------|----------|
| `basicInfo.hasChain` | 是否存在问题链（「是/否」） | 埋在 `basicInfo` 拼接串里 |
| `basicInfo.totalCount` | 问题总数（如「5个」） | 同上 |
| `sections[0].items[]` | 认知递进：各问题独立行 | `cognitiveProgression.questions[]` 有列表，尚可 |
| `sections[0].nestedPanel` | 递进路径总结 + 合理性 | `cognitiveProgression.summary` 整段 |
| `sections[1].items[]` | 逻辑线索（类型/衔接/清晰度） | `logicalClue` **整段** |
| `sections[2].items[]` | 目标指向（目标/重难点/达成） | `goalOrientation` **整段** |
| `sections[3].items[]` | 闭环（起点/推进/收束/判断） | `closureAnalysis` **整段** |
| `overallEvaluation` | 整体评价（单独） | 常与优化建议混在 `overallEvaluation` 串 |
| `optimizationSuggestion` | 优化建议（单独） | **无独立字段** |

**建议补（示例结构）：**

```json
"logicAnalysis": {
  "basicInfo": { "hasChain": "是", "totalCount": "5个" },
  "cognitiveProgression": {
    "questions": ["..."],
    "summaryItems": ["..."],
    "reasonableness": "合理",
    "basis": "..."
  },
  "logicalClue": {
    "relationType": "递进",
    "connection": "...",
    "clarity": "清晰"
  },
  "goalOrientation": {
    "goal": "...",
    "keyPointRelation": "...",
    "effect": "有效"
  },
  "closureAnalysis": {
    "start": "...",
    "process": "...",
    "end": "...",
    "closed": "完整"
  },
  "overallEvaluation": "...",
  "optimizationSuggestion": "..."
}
```

**前端兜底：** 逻辑区整段渲染，放弃四节细分（偏离稿面）。

---

### G04 · 七个条件渲染布尔 flags

| 项 | 内容 |
|----|------|
| 页面位置 | 全报告条件显隐（见 `A2-条件渲染对接说明.md`） |
| 页面需要 | `TypeA2ReportFlags` 七个 `boolean` |
| 接口现状 | **无**；只能启发式猜 |

| Flag | 页面用途（false 时） | 能否从现有字段稳推 |
|------|----------------------|-------------------|
| `hasKnowledgeRelationTypes` | 3.2 板块二 →「无明确关系类型」 | 弱（`relationTypes` 空） |
| `hasThinkingSpanEvaluation` | 3.2 板块三 →「暂无足够依据…」 | 弱 |
| `hasGradeCognitionFit` | 3.2 板块四 →「暂无足够依据…」 | 弱 |
| `hasExperimentActivity` | 3.4.2 →「【无实验/活动】」 | **难**（「不完整」≠无实验） |
| `hasProblemChain` | 3.6.2 逻辑区不适用 | 弱（解析文案） |
| `hasSummaryTeaching` | 隐藏 5.1～5.3，章末提示 | 较可（`preJudgment`） |
| `importHasCoreQuestion` | 5.3 不适用 | 较可（`isProposed`） |

**建议补：** 在 `aReport` 根或各模块下增加 `flags` / 各模块 `applicable: boolean`。  
**前端兜底：** 默认全 `true`（与现 mock 一致），空数组再关——`hasExperimentActivity` 仍不可靠。

---

### G05 · 评分详情补偿升级说明 `upgradeNote`

| 项 | 内容 |
|----|------|
| 页面位置 | 评分详情弹窗 · 知识落实度补偿区 |
| 页面需要 | `judgment.upgradeNote`（如「档位自动升级为A」） |
| 接口现状 | 仅 `compensation.verdict`（如 `"✅ 补偿生效"`） |
| 建议补 | `compensation.upgradeNote: string \| null`（不生效时 null） |
| 前端兜底 | 不展示升级说明行 |

---

## P1 · 结构不够（有数据但不够支撑稿面）

### G06 · 3.1 综合结论加粗分段

| 项 | 内容 |
|----|------|
| 页面需要 | `summaryItems[].parts[]` 含 `bold` 片段 |
| 接口现状 | `comprehensiveConclusion: string[]` 整句（常含【】） |
| 建议 | 后端下发 `parts`；或约定【】由前端解析加粗 |
| 说明 | 不算「没字段」，但**无约定则 bold 丢失** |

---

### G07 · 3.2 深度分析四板块结构化

| 项 | 内容 |
|----|------|
| 页面需要 | `a2NumberedPanel`：index / title / badge / content / basisContent / metaLine |
| 接口现状 | `deepAnalysis.*` 为 `string[]` 已拼好行 |
| 建议 | 对象数组；或约定行内固定前缀供解析 |
| 影响 | 缺 badge/title 拆分时只能整行 content |

---

### G08 · 3.3 教案重难点参考拆条

| 项 | 内容 |
|----|------|
| 页面需要 | 两条：`leadLabel`「教案中标注的教学重点/难点：」+ `leadContent` |
| 接口现状 | `planReference: string[]` 整行含前缀 |
| 建议 | `{ type: "重点"\|"难点", content }`；或固定两条顺序 |

---

### G09 · 3.5 案例整体评价加粗数量

| 项 | 内容 |
|----|------|
| 页面需要 | 「案例/例题总数量：**N** 个…」parts 加粗 |
| 接口现状 | `overallEvaluation: string[]` |
| 建议 | 独立 `totalCount` + 评价文案；或【】约定 |

---

### G10 · 3.6.1 高低阶结构三条结构化

| 项 | 内容 |
|----|------|
| 页面需要 | `dimensionThree.items[{index,title,content}]` |
| 接口现状 | `highLowOrderStructure: string[]`（约 3 行整句） |
| 建议 | 对象数组；否则整句进 content、title 用固定「01/02/03」 |

---

### G11 · 时长展示格式统一

| 项 | 内容 |
|----|------|
| 页面需要 | Hero：`36分01秒` 类展示串 |
| 接口现状 | mock 示例 `"00:40:17"`；字段说明又写「39分26秒」 |
| 建议 | **统一**为「X分Y秒」展示串；或另给 `durationSeconds` |
| 说明 | 有字段但格式不稳，属契约缺口 |

---

### G12 · 10.1 / 弹窗等级与分数字符串形态

| 项 | 内容 |
|----|------|
| 页面需要 | 如 `score: "29.40/35"`、`gradeCode: "B"` + `gradeBadge: "良好"`；弹窗 summary 带 emphasis 片段 |
| 接口现状 | `hundredScore` 多为纯分数字符；`finalLevel` 为 `"B级（良好）"` 整串；`scoreLines` 纯 string |
| 建议 | 分开展示字段，或书面约定前端拼接规则（权重分母、拆等级） |
| 说明 | 可前端拼，但需**书面口径**，否则算契约不清 |

---

### G13 · 八章「练习/活动」合并行

| 项 | 内容 |
|----|------|
| 页面需要 | 对比维度一行：**练习/活动设计** |
| 接口现状 | `items` 分两行：`练习`、`活动设计` |
| 建议 | 合并为一行；或确认前端合并拼接规则 |

---

## P2 · 文档矛盾 / 需书面确认（否则对接踩坑）

### G14 · `studentDiagnosis.dimensions` 类型写错

| 文档写 | mock json 实际 | 页面需要 |
|--------|----------------|----------|
| `List<String>` | `{ dimension, observation, diagnosis }[]` | 三列表（observation→content） |

**请后端改文档为对象数组**；若真下发 String，页面无法直接填表。

---

### G15 · `aidAnalysis.evaluation` 类型

| 文档写 | mock json | 页面 |
|--------|-----------|------|
| String | `string[]`（多行评价） | 单元格内多行文案 |

**请统一**：数组则前端 `join('\n')`；单 string 则直出。

---

### G16 · `overallSummary.scoreAndLevel`

| 文档 | mock json | 页面 |
|------|-----------|------|
| 有字段「固定文案块·本堂课评分与等级」 | **无** | Hero 已用 totalScore/scoreLevel/levelName，**未单独块** |

**请确认：** 废弃 / 补发 / 仅内部用。非页面硬依赖。

---

### G17 · Bloom「合计」行

| 接口 | 页面 |
|------|------|
| `bloomLevels` 含 `level: "合计"` | 合计在 `totalCount`/`totalRatio`，卡片不含合计 |

**请确认：** 继续带合计行（前端过滤）或去掉。不算缺，属约定。

---

## 明确不算「接口缺」（纯前端 / 可映射）

| 页面项 | 说明 |
|--------|------|
| `tip` 温馨提示 | 前端常量 |
| TOC | 由章节结构生成 |
| `heroTitle` / `reportTag` | 前端 |
| `templateStyle: 'A2'` | 用 `reportVersion` / query |
| 二章～部分表列改名 | 有字段，mapper 改名即可 |
| 1.1 / 1.3 / 2.x / 3.4 主体 / 4.2 / 5.x / 6 / 7 / 9 主体 | 字段覆盖，仅转换 |
| `scoring.dimensions` 数值行 | 与 summaryTable 双轨；页可不单独用 |

---

## 汇总表（给后端一眼版）

| ID | 优先级 | 页面位置 | 缺什么 | 建议 |
|----|--------|----------|--------|------|
| G01 | P0 | 1.2 亮点 | lead/body 拆分 | 补两字段 |
| G02 | P0 | 4.1 练习 | 维度③④名与语义 | 对齐稿面或改稿 |
| G03 | P0 | 3.6.2 | 逻辑区结构化 + 独立优化建议 | 补对象结构 |
| G04 | P0 | 全报告 | 7 个 boolean flags | 显式下发 |
| G05 | P0 | 评分弹窗 | upgradeNote | 补字段或可空 |
| G06 | P1 | 3.1 结论 | bold parts | 结构或【】约定 |
| G07 | P1 | 3.2 深度 | panel 结构 | 对象化或约定 |
| G08 | P1 | 3.3 参考 | 重点/难点拆条 | 结构化 |
| G09 | P1 | 3.5 总评 | 数量加粗 | totalCount |
| G10 | P1 | 3.6.1 维三 | index/title/content | 对象数组 |
| G11 | P1 | Hero 时长 | 格式统一 | 约定展示串 |
| G12 | P1 | 十分/等级 | 展示形态口径 | 书面规则 |
| G13 | P1 | 八章 | 练习/活动合并 | 合并或规则 |
| G14 | P2 | 6.1 | dimensions 类型文档 | 改文档 |
| G15 | P2 | 3.4.3 | evaluation 类型 | 统一 |
| G16 | P2 | 整体 | scoreAndLevel | 确认废弃否 |
| G17 | P2 | 3.6.1 | 合计行 | 过滤约定 |

---

## 建议回复后端的一句话

> 主干章节字段已覆盖；请优先确认 **G01～G05（P0）**：亮点拆分、4.1 维度语义、问题链逻辑区结构、7 个适用性 flags、补偿 upgradeNote。其余 P1/P2 可书面约定前端转换规则。
