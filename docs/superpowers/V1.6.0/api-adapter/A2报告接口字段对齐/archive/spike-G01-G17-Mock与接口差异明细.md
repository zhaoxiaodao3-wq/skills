# A2 · G01～G17 逐项：页面 Mock vs 接口 差异明细

**日期：** 2026-09-07  
**对照源：**  
- 页面 mock：`classroom-diagnosis/mock/**` + `types/classroom-content-analysis-a2-report.ts`  
- 接口：`A2-报告字段文档.md` 零节 mock json + 字段表  

每条结构：**页面要什么 → Mock 示例 → 接口提供 → 差异结论**。

---

## G01 · 1.2 亮点 lead/body

### 页面要什么
`highlightLead`（加粗标题）+ `highlightBody`（正文）+ `evidence` + `suggestion` + `index`

### 页面 Mock
```ts
{
  index: '1',
  highlightLead: '生活化引入有效激活前概念',
  highlightBody: '：教师以"手掌压桌面"的亲身感受作为导入……',
  evidence: '【00:02:48-00:03:03】："直接把手放在桌上……"',
  suggestion: '建议在后续"牛顿第三定律"……继续采用……',
}
```
类型：`A2HighlightTableRow`（`highlightLead` / `highlightBody` 两个必填 string）

### 接口提供
```json
{
  "seq": 1,
  "description": "引入自然，从三次方程求根问题引出虚数单位，体现数系扩充的必要性。",
  "evidence": "0:14-0:38: 老师：因为数学家……",
  "suggestion": "可进一步让学生自主思考如何解决√-121……"
}
```
字段表 Highlight：`seq` · `description` · `evidence` · `suggestion`

### 差异结论
| 对比项 | Mock | 接口 |
|--------|------|------|
| 标题/正文 | 拆成 2 字段 | 仅 `description` 1 字段 |
| 序号 | `index: string` | `seq: number` |
| evidence/suggestion | 有 | 有（格式略异，可映射） |

**缺：`descriptionLead` / `descriptionBody`（或等价拆分）。**

---

## G02 · 4.1 练习四维名称与语义

### 页面要什么
四张卡 `title`：题目典型性 / 分层设计 / **练习时机** / **练习时长分配**；每卡 `badge` + fields（观察内容、理由）

### 页面 Mock
```ts
{ title: '题目典型性', badge: '不足', fields: [{ label: '观察内容', value: '...' }, { label: '理由', value: '...' }] }
{ title: '分层设计', badge: '不足', ... }
{ title: '练习时机', badge: '合理', fields: [{ label: '观察内容', value: '达标测评安排在所有例题讲解之后……' }] }
{ title: '练习时长分配', badge: '不足', fields: [{ label: '观察内容', value: '00:34:31布置练习……共约35秒。' }] }
```

### 接口提供
```json
[
  { "dimension": "题目典型性", "observation": "...", "evaluation": "典型", "reason": "..." },
  { "dimension": "分层设计", "observation": "...", "evaluation": "有分层", "reason": "..." },
  { "dimension": "与新知衔接", "observation": "练习紧密围绕新知……", "evaluation": "紧密", "reason": "..." },
  { "dimension": "学生独立练习时间", "observation": "学生有短暂动笔时间，但整体时间不足。", "evaluation": "一般", "reason": "..." }
]
```

### 差异结论
| 序号 | Mock 维度名 | 接口 dimension | 语义是否同一 |
|------|-------------|----------------|--------------|
| 1 | 题目典型性 | 题目典型性 | ✅ 同 |
| 2 | 分层设计 | 分层设计 | ✅ 同 |
| 3 | **练习时机** | **与新知衔接** | ❌ 不同（何时练 vs 与新知关系） |
| 4 | **练习时长分配** | **学生独立练习时间** | ❌ 相近但不等（总时长分配 vs 独立动笔时间） |
| 结构 | card.title + fields[] | flat observation/evaluation/reason | 需转换（非缺字段） |
| badge | 独立 `badge` | `evaluation` | 可映射 |

**缺/冲突：第 3、4 维名称与分析口径。**

---

## G03 · 3.6.2 问题链逻辑区结构

### 页面要什么
`A2ProblemChainStackData`：表格 + `basicInfo` 对象 + `sections[]`（四节）+ `overallEvaluation` + `optimizationSuggestion` 分字段

### 页面 Mock（逻辑区核心）
```ts
{
  basicInfo: { hasChain: '是', totalCount: '5个' },
  sections: [
    {
      title: '（一）认知递进路径分析',
      items: ['问题1（00:05:52-00:05:57）——…——【应用】…', /* … */],
      nestedPanel: {
        title: '递进路径总结',
        items: ['从方案选择 → …', '递进合理性判断：合理。', '依据：…'],
      },
    },
    { title: '（二）逻辑线索分析', items: ['逻辑关系类型：递进+归纳', '衔接方式：…', '线索清晰度：清晰。'] },
    { title: '（三）目标指向分析', items: ['目标指向：…', '与重难点的关联：…', '目标达成效果：有效。'] },
    { title: '（四）完整性与闭环分析', items: ['起点问题：…', '推进过程：…', '收束方式：…', '闭环判断：完整。'] },
  ],
  overallEvaluation: '池塘测量问题链设计完整、逻辑清晰……',
  optimizationSuggestion: '在学生提出绕绳方案后增加"你认为哪种方案最优？为什么？"……',
}
```

### 接口提供
```json
{
  "logicAnalysis": {
    "basicInfo": "【基本情况】是否存在问题链：是，问题总数：4个。",
    "cognitiveProgression": {
      "questions": ["问题1（2:50-2:54）——…——【理解】…", "…"],
      "summary": "递进路径总结：……递进合理性判断：合理。依据：……"
    },
    "logicalClue": "逻辑关系类型：递进。衔接方式：追问。线索清晰度：清晰。",
    "goalOrientation": "目标指向：理解复数的概念。与重难点的关联：直接指向重点。目标达成效果：有效。",
    "closureAnalysis": "起点问题：……推进过程：……收束方式：……闭环判断：完整。",
    "overallEvaluation": "整体评价：……。优化建议：可增加开放性问题……。"
  }
}
```
（`dimensions` 表格侧与页 tableRows 可对齐，此处不列。）

### 差异结论
| 页面字段 | Mock | 接口 | 差异 |
|----------|------|------|------|
| hasChain / totalCount | 独立字段 | 埋在 `basicInfo` 字符串 | 缺结构 |
| 问题列表 | `sections[0].items[]` | `questions[]` | ✅ 接近 |
| 递进总结 | `nestedPanel.items[]` 多条 | `summary` 一整段 | 结构不够 |
| 逻辑/目标/闭环 | `items[]` 多条 | 各 1 个拼接 String | 结构不够 |
| 整体评价 | 独立 | 与优化建议混在同一 string | 缺拆分 |
| 优化建议 | **独立字段** | **无独立字段** | **缺** |

---

## G04 · 七个条件渲染 flags

### 页面要什么
```ts
flags: {
  hasKnowledgeRelationTypes: boolean
  hasThinkingSpanEvaluation: boolean
  hasGradeCognitionFit: boolean
  hasExperimentActivity: boolean
  hasProblemChain: boolean
  hasSummaryTeaching: boolean
  importHasCoreQuestion: boolean
}
```
Mock 默认全 `true`；false 时展示固定空态文案（见 `A2_EMPTY_PANEL_MESSAGES`）。

### 接口提供
**无任何 boolean / flags 对象。** 相关数据仅为：
- `relationTypes` / `thinkingSpanEvaluation` / `cognitiveFit`：string[]（可能空）
- `activityDesign`：有行但 evaluation 可为「不完整」
- `logicAnalysis.basicInfo`：文案含「是否存在问题链」
- `preJudgment[0]`：文案含「是否存在总结性教学行为」
- `coreQuestion[].isProposed`：如「是（明确）」

### 差异结论
| Flag | Mock | 接口显式字段 | 差异 |
|------|------|--------------|------|
| 全部 7 个 | 明确 boolean | **无** | **整组缺失**；只能启发式猜 |

---

## G05 · 评分弹窗 upgradeNote

### 页面要什么
补偿判定区：`judgment.kind` + `judgment.label` + 可选 `upgradeNote`

### 页面 Mock
```ts
judgment: {
  kind: 'pass',
  label: '补偿生效',
  upgradeNote: '档位自动升级为A',
}
```
UI：`v-if="upgradeNote"` 另起一行展示。

### 接口提供
```json
"compensation": {
  "checkRows": [
    { "condition": "条件①", "requirement": "…", "result": "✅", "note": "…" },
    { "condition": "条件②", "…", "result": "✅", "note": "…" },
    { "condition": "条件③", "…", "result": "❌", "note": "…" }
  ],
  "verdict": "❌ 补偿不生效"
}
```
无 `upgradeNote`；生效时也只有 `verdict` 字符串。

### 差异结论
| 对比项 | Mock | 接口 |
|--------|------|------|
| 是否生效 | kind + label | `verdict` 含 ✅/❌ |
| 升级说明文案 | `upgradeNote` | **无** |
| 条件行 | resultKind pass/fail/neutral | result ✅/❌/— | 可映射 |
| 挂载位置 | 挂在「知识落实度」维度下 | `calculationProcess` 顶层 | 位置差（转换） |

**缺：`upgradeNote`。**

---

## G06 · 3.1 综合结论 bold parts

### 页面要什么
`summaryItems: Array<{ parts: Array<{ text, bold? }> }>`

### 页面 Mock
```ts
{
  parts: [
    { text: '音转文中共呈现【8】 个知识点', bold: true },
    { text: '（来自第一部分统计），讲解完整性分布：……' },
  ],
}
```

### 接口提供
```json
"comprehensiveConclusion": [
  "音转文中共呈现6个知识点（来自第一部分统计），讲解完整性分布：完整5个、部分1个、简略0个；讲解深度分布：深入3个、一般3个、浅尝0个。",
  "教案中共设计6个知识点……落实率为100%【计算公式：…】。",
  "知识落实综合判断：本课知识点讲解完整……"
]
```

### 差异结论
| 对比项 | Mock | 接口 |
|--------|------|------|
| 条数 | 3 条（结构同） | 3 条 string |
| 加粗 | 显式 `bold: true` 片段 | 整句 string，无 parts |
| 【】 | 作视觉强调 | 偶有【计算公式】，非统一加粗协议 |

**缺：结构化 `parts`（或书面【】加粗约定）。**

---

## G07 · 3.2 深度分析四板块结构

### 页面要什么
`a2NumberedPanel`：`title` + `items[{ index, title?, badge?, content?, basisContent?, leadLabel? }]` + `metaLine?` + `requireFlag?`

### 页面 Mock（板块一示例）
```ts
{
  title: '板块一 知识点关联性分析',
  items: [
    {
      index: '1.1',
      title: '本节课知识点之间是否存在内在逻辑关联？',
      badge: '是',
      basisContent: '本节课的知识体系呈现典型的“因果递进链”结构。……',
    },
    { index: '1.2', title: '…？', badge: '是', basisContent: '…' },
    { index: '1.3', title: '整体判断', content: '本节课知识呈现具有清晰的内在逻辑关联……' },
  ],
}
```
板块四还有 `metaLine: '学段与学年：…'`（mock 侧）。

### 接口提供
```json
"knowledgeRelationAnalysis": [
  "1.1 本节课知识点之间是否存在内在逻辑关联？是。依据：复数概念是基础……",
  "1.2 教师是否通过教学行为明确建立了这些联系？是。依据：……",
  "1.3 整体判断：本节课知识呈现具有清晰的内在逻辑关联。"
],
"relationTypes": ["复数概念与复数分类之间是包含关系——……依据：……", "…"],
"thinkingSpanEvaluation": ["复数概念 → 复数分类的思维跨度：合理。理由：……", "…"],
"cognitiveFit": [
  "基本信息：学段与年级：【高中】",
  "从呈现方式来看，……",
  "从抽象程度来看，……",
  "存在的问题或值得肯定的地方：……"
]
```

### 差异结论
| 对比项 | Mock | 接口 |
|--------|------|------|
| title / badge / basis 分离 | 独立字段 | 全部挤在一行 string |
| 板块标题 | 前端固定「板块一…」 | 无（前端可写死） |
| metaLine | 独立 | 埋在 `cognitiveFit[0]` |
| 空态 flag | `requireFlag` | 无 boolean，只能看数组空否 |

**缺：对象化条目；有数据但结构不够。**

---

## G08 · 3.3 教案重难点参考拆条

### 页面要什么
两条 numbered：`leadLabel` + `leadContent`

### 页面 Mock
```ts
{
  index: '01',
  leadLabel: '教案中标注的教学重点：',
  leadContent: '①摩擦力的产生条件及方向判断；②……',
},
{
  index: '02',
  leadLabel: '教案中标注的教学难点：',
  leadContent: '①静摩擦力方向的判断……；②……',
}
```

### 接口提供
```json
"planReference": [
  "教案中标注的教学重点：①复数的概念；②复数的代数形式；③复数相等的条件；④复数的几何意义。",
  "教案中标注的教学难点：①虚数单位i的引入及i²=-1的理解；②复数的几何意义；③复数模的概念。"
]
```

### 差异结论
| 对比项 | Mock | 接口 |
|--------|------|------|
| 条数 | 2 | 2（可对） |
| label/content | 拆开 | 前缀+正文同一 string |
| 类型 | 结构化 | `string[]` |

**缺：拆字段（可用固定前缀解析兜底）。**

---

## G09 · 3.5 案例总评数量加粗

### 页面要什么
`a2BulletList`：`parts` 中数量加粗；案例卡 `stats[{label,value}]`

### 页面 Mock
```ts
// 卡
{ title: '手掌压桌面感知摩擦力', knowledgePoint: '…', stats: [
  { label: '教案一致性', value: '是' },
  { label: '来源', value: '教材' },
  { label: '典型性', value: '典型' },
  { label: '讲解质量', value: '清晰' },
]}
// 总评
parts: [
  { text: '案例/例题总数量：' },
  { text: '9', bold: true },
  { text: '个（均为讲解中的辅助案例，无独立习题）' },
]
```

### 接口提供
```json
{
  "items": [{
    "caseName": "例1：1+5i乘以i",
    "knowledgePoint": "复数的概念",
    "planConsistent": "无参照",
    "source": "教师自编",
    "typicality": "典型",
    "teachingQuality": "清晰"
  }],
  "overallEvaluation": [
    "案例/例题总数量：5个",
    "评价：例题设计典型，覆盖本课核心知识点，讲解清晰……"
  ]
}
```

### 差异结论
| 对比项 | Mock | 接口 |
|--------|------|------|
| 单卡四属性 | `stats[]` | 平铺四字段 | 转换即可 |
| 总数量 | 独立 bold 数字 | 埋在第一句 string | **缺独立 totalCount / parts** |
| 评价句 | 可拆 parts | 第二句整段 | 可直出 |

---

## G10 · 3.6.1 维度三高低阶结构

### 页面要什么
`dimensionThree.items: [{ index, title, content }]`

### 页面 Mock
```ts
items: [
  { index: '01', title: '低阶思维（记忆+理解+应用）占比', content: '占89.1%，高阶思维……占10.9%。' },
  { index: '02', title: '结构判断', content: '偏低。低阶思维占比接近90%……' },
  { index: '03', title: '核心发现', content: '课堂提问结构以记忆和理解为主导……' },
]
```

### 接口提供
```json
"highLowOrderStructure": [
  "低阶思维（记忆+理解+应用）占比：92%，高阶思维（分析+评价+创造）占比：8%。",
  "结构判断：偏低。依据：记忆和理解层问题占比约75%……",
  "核心发现：课堂提问以低阶认知为主，高阶思维训练不足……"
]
```

### 差异结论
| 对比项 | Mock | 接口 |
|--------|------|------|
| 条数 | 3 | 3 |
| title/content | 分离 | 整句（「标题：正文」拼在一起） |
| index | `01/02/03` | 无 |

**缺：对象结构（可按冒号拆兜底）。**

---

## G11 · Hero 时长格式

### 页面要什么
`header.durationDisplay`：稿面「分秒」可读串

### 页面 Mock
```ts
MOCK_A2_HERO = { durationDisplay: '36分01秒', … }
```

### 接口提供
零节 mock json：
```json
"duration": "00:40:17"
```
字段表说明示例：`"39分26秒"`

### 差异结论
| 对比项 | Mock | 接口 json | 接口字段表 |
|--------|------|-----------|------------|
| 格式 | `36分01秒` | `00:40:17` | 写「分秒」 |
| 一致性 | 稳定 | **与字段表矛盾** | — |

**缺：统一展示契约（或另给秒数）。**

---

## G12 · 十分 / 等级展示形态

### 页面要什么
10.1 表行示例：
```ts
{ dimension: '知识落实度', tier: 'A', mark: '补偿触发', score: '29.40/35', basis: '…' }
```
底部摘要：
```ts
{ label: '最终总分', value: '81.10（=总分小计×时长系数）', showDetailButton: true }
{ label: '等级', value: '', gradeCode: 'B', gradeBadge: '良好' }
```
弹窗 `summaryLines` 含 `{ text, emphasis?: true }` 片段。

### 接口提供
`summaryTable` 行示例字段：
`dimension, weight, scorePoint, tier, tierCoefficient, compensationMark, hundredScore, basis`  
其中 `hundredScore: "32.20"`（纯分），`weight: "35%"`，等级在末行：
```json
{ "dimension": "等级", "hundredScore": "B级（良好）", …其余 "—" }
```
`scoreLines`：纯 string 三行，无 emphasis 标记。  
`finalLevel`: `"B级（良好）"` 整串。

### 差异结论
| 对比项 | Mock | 接口 |
|--------|------|------|
| 得分列 | `"29.40/35"`（含权重分母） | `hundredScore` 仅 `"32.20"`，分母在 `weight` |
| 补偿标记文案 | 「补偿触发」 | `compensationMark: "-"` / 需自推 |
| 等级 | code + badge 分离 | `"B级（良好）"` 整串 |
| 弹窗强调色 | `emphasis: true` | 无，需前端解析【】或公式段 |

**缺：展示口径书面约定（非完全无字段）。**

---

## G13 · 八章练习/活动合并行

### 页面要什么
对比表 **一行**：`dimension: '练习/活动设计'`

### 页面 Mock
```ts
{
  dimension: '练习/活动设计',
  plan: '教案设计了例1……共6个练习',
  actual: '音转文实际呈现了……共7个内容……',
  conclusion: '基本一致（变式一详细程度不足，无达标检测）',
}
```

### 接口提供
```json
{ "dimension": "练习", "planPreset": "教案设计了3个练习……", "actualClass": "教师自编了多个例题……", "conclusion": "存在差异" },
{ "dimension": "活动设计", "planPreset": "教案未明确设计活动。", "actualClass": "课堂无活动。", "conclusion": "一致" }
```

### 差异结论
| 对比项 | Mock | 接口 |
|--------|------|------|
| 行数 | 1 行合并 | **2 行拆分** |
| 列名 | plan / actual | planPreset / actualClass | 转换 |

**缺：合并维度（或合并规则书面确认）。**

---

## G14 · studentDiagnosis.dimensions 类型（文档 vs json）

### 页面要什么
表三列：`dimension` / `content` / `diagnosis`

### 页面 Mock
```ts
{ dimension: '学生已掌握的知识', content: '①导入阶段——…', diagnosis: '学生对基本判定定理……' }
```

### 接口：字段表 vs mock json
| 来源 | 内容 |
|------|------|
| **字段表** | `dimensions: List<String>`（写「后端已拼成三列」） |
| **零节 json** | `{ dimension, observation, diagnosis }[]` ← 与页一致（observation→content） |

### 差异结论
**实现以 json 对象为准则够用；文档类型写错。**  
若真下发 `string[]`，页面缺可绑定结构 → 须改文档或改下发。

---

## G15 · aidAnalysis.evaluation 类型

### 页面要什么
表格单元格内可多行评价文案，如：
```ts
evaluation: '情境/案例：典型\n类比/比喻：可优化'
```

### 接口 mock json
```json
"evaluation": [
  "情境/案例：典型",
  "类比/比喻：恰当"
]
```
字段表写：String。

### 差异结论
| 来源 | 类型 |
|------|------|
| 字段表 | String |
| json | `string[]` |
| 页面 | 单 string（可含换行） |

**缺：类型统一声明**（数组则前端 join；不算业务字段缺失）。

---

## G16 · overallSummary.scoreAndLevel

### 页面要什么
Hero 用：`totalScore` / `scoreLevel` / `levelName`；**无单独「评分与等级文案块」**。

### 页面 Mock
```ts
score: { totalScore: 85.69, gradeCode: 'B级', gradeLabel: '良好' }
```
无 `scoreAndLevel` 字段消费。

### 接口
| 来源 | 内容 |
|------|------|
| 字段表 | 有 `scoreAndLevel: String`「固定文案块」 |
| 零节 json | **无此字段** |

### 差异结论
文档有、json 无、页不用 → **确认废弃或补发**；非页面硬缺口。

---

## G17 · Bloom「合计」行

### 页面要什么
`levelCards` 仅 1～6 层；合计在 `totalCount` / `totalRatio`：
```ts
levelCards: [ { level: '记忆', count: '21', ratio: '38.2%', … }, /* 6 层 */ ]
totalCount: '55'
totalRatio: '100%'
```

### 接口提供
`bloomLevels` 含 6 层 +：
```json
{ "level": "合计", "description": "-", "keywords": "-", "count": 26, "ratio": "100%", "example": "-" }
```
且 level 带前缀 `"1.记忆"`；`count` 为 number。

### 差异结论
| 对比项 | Mock | 接口 |
|--------|------|------|
| 合计 | 独立 total 字段 | 混在数组最后一行 |
| level 文案 | `记忆` | `1.记忆` |
| count 类型 | string | number |

**缺：无；需约定前端过滤合计 + 去前缀。** 属契约约定项。

---

## 总览速查

| ID | 核心差异一句话 |
|----|----------------|
| G01 | Mock 两字段 lead/body；接口一个 description |
| G02 | 第 3/4 维名与语义双双不一致 |
| G03 | Mock 对象树；接口拼接串；缺独立优化建议 |
| G04 | Mock 7 boolean；接口零 flags |
| G05 | Mock 有 upgradeNote；接口仅 verdict |
| G06 | Mock parts+bold；接口整句 string[] |
| G07 | Mock panel 字段分离；接口一行拼完 |
| G08 | Mock leadLabel/Content；接口整行 string |
| G09 | Mock 数量 bold；接口埋在评价句 |
| G10 | Mock index/title/content；接口整句 |
| G11 | Mock 分秒；json 时分秒且与字段表矛盾 |
| G12 | Mock 分母/等级拆分/emphasis；接口需自拼 |
| G13 | Mock 1 行合并；接口 2 行 |
| G14 | 文档 List\<String\> vs json 对象（页要对象） |
| G15 | 文档 String vs json string[] |
| G16 | 文档有 scoreAndLevel；json/页皆无 |
| G17 | 接口多合计行；页要过滤 |

文件路径：`docs/superpowers/V1.6.0/api-adapter/A2报告接口字段对齐/archive/spike-G01-G17-Mock与接口差异明细.md`
