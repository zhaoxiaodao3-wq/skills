# A2 Mock 数据结构 · 工程化审查（Spike）

**模块：** `ui-style/课堂教学内容分析A2`  
**审查日期：** 2026-08-27  
**档位：** 轻量（只读探查，未改 `src/`）  
**Requirement 锚点：** [../requirements/课堂教学内容分析A2-需求.md](../requirements/课堂教学内容分析A2-需求.md)

---

## 1. 结论（TL;DR）

| 维度 | 判定 |
|------|------|
| **Phase 1 mock 是否可用** | ✅ **合格** — 可支撑 UI 开发、条件渲染、时间锚点白名单、结构单测 |
| **是否「工程化就绪」** | ⚠️ **基本符合，接口前需收敛 3 项技术债** |
| **是否可直接当 API 契约** | ❌ **尚不能** — mapper 仍为 stub；表格渲染双路径；部分 mock 文案跨课例拼接 |

**一句话：** 分层、类型、章节拆分、flags、单测都到位，属于**可维护的 mock 工程**；接入真实接口前建议统一表格路径、抽公共 builder、明确 API DTO 边界。

---

## 2. 当前结构（符合工程化的部分）

```
classroom-content-analysis-a2.mock.ts   ← Payload 入口 + TOC 构建
type-a2-chapters.ts                     ← sectionOne + chapters 聚合
a2-data/
  chapter-import.ts                     ← 二、新课导入
  chapter-new-knowledge.ts              ← 三、新知讲授
  chapter-practice.ts                   ← 四、练习
  chapter-classroom-summary.ts          ← 五、小结
  chapter-learning.ts                     ← 六、学情
  chapter-rest.ts                         ← 七～十
types/classroom-content-analysis-a2-report.ts  ← 独立类型树
mappers/classroom-content-analysis-a2.mapper.ts ← Phase 1 stub
mock/classroom-content-analysis-a2-structure.spec.ts ← 24 条结构断言
mock/A2-条件渲染对接说明.md              ← flags / block 契约文档
```

### 2.1 已达标项

| 项 | 说明 |
|----|------|
| **与 A1 解耦** | 独立 `TypeA2Report` / mock / mapper / View；不 extends A1 |
| **章节分文件** | 按章拆分 `a2-data/`，单文件可维护（最大 `chapter-new-knowledge.ts`） |
| **Block 驱动渲染** | `TypeA2ContentBlock` 联合类型 + `ReportA2BlockRenderer` 路由 |
| **条件渲染契约** | `TypeA2ReportFlags` + block/subSection 级 `requireFlag` / `showWhenFlagTrue` |
| **时间锚点白名单** | 字段级 `timeAnchor` / `timeAnchorProps` / 组件 opt-in（Rev05） |
| **TOC 同源** | `buildTypeA2Toc(report)` 从数据树推导，支持 `tocLevel: 3` |
| **空值规范** | 广泛使用 `mapRowWithDash` |
| **测试门禁** | 结构单测覆盖 TOC、flags、关键 block 类型、锚点白名单 |
| **对接文档** | `A2-条件渲染对接说明.md` 描述 mapper 接入步骤 |

---

## 3. 技术债与风险

### 3.1 【中】表格双渲染路径（`a2Table` 不一致）

**现象：**

- `ReportA2BlockRenderer` 仅当 `block.type === 'table' && block.a2Table` **或** `requireFlag`（自动补 `a2Table`）时走 `ReportA2DataTable`
- 其余 `type: 'table'` 落入 `ReportBlockRenderer` → A1 的 `ReportDataTable`

**影响范围（mock 中未标 `a2Table: true` 的表）：**

| 区域 | 示例 |
|------|------|
| 二章 2.1–2.6 | `chapter-import.ts` 全部 `analysisTable` |
| 五章 5.1–5.3 | `chapter-classroom-summary.ts` |
| 六章 6.1 | `chapter-learning.ts` |
| 七章～十章 | `chapter-rest.ts` 多数表 |
| 三章 3.4.1 / 3.4.3 | `chapter-new-knowledge.ts` |

**差异：**

| | `ReportA2DataTable` | `ReportDataTable`（A1） |
|--|---------------------|-------------------------|
| 默认 `timeAnchorProps` | `[]` | `['timestamp','basis']` |
| 补偿触发 pill | ✅ | ❌ |
| emptyNote（3.4.2） | ✅ | ❌ |

**风险：** 接口接入后若统一填 `timeAnchorProps: ['content']`，legacy 路径仍可能因默认 `timestamp/basis` 产生误开锚点；样式 subtle 差异。

**建议（接口前）：** mock 全部 `table` 显式 `a2Table: true`，或 Renderer 默认 A2 表走 `ReportA2DataTable`。

---

### 3.2 【低】`analysisTable` 辅助函数重复

`chapter-import.ts` / `chapter-practice.ts` / `chapter-classroom-summary.ts` 各复制一份相同 `analysisTable()`（约 10 行）。

**建议：** 抽到 `mock/a2-data/_helpers.ts` 或 `utils/a2-mock-table.ts`。

---

### 3.3 【低】类型联合含 A1 遗留 block

`TypeA2ContentBlock` 含 `evidenceExcerpts` / `calcProcessRow` / `equalHeightCards` / `scoreDimensions` 等，**A2 mock 未使用**，仅通过 `ReportBlockRenderer` fallback 保留扩展性。

**影响：** API mapper 文档需明确「A2 合法 block 子集」，避免后端按 A1 全量字段建模。

**建议：** spec 或 types 注释列出 **A2 实际使用的 block 清单**（structure spec 已部分覆盖）。

---

### 3.4 【数据质量 · 非结构】跨课例文案拼接

mock 正文来自多份 Figma 样例，存在学科/主题不一致，例如：

- Hero：`高中地理` / 大气环流向
- 1.1 总结：加速度、物理向
- 1.2–1.3 / 二章：摩擦力向
- 三章部分：大气环流向

**影响：** 不影响类型与渲染工程化，但**不宜作为产品验收或对外演示**的最终文案源。

**建议：** 接口前统一一门课例的 mock 正文，或标注「仅结构/布局样例」。

---

### 3.5 【预期】Mapper Phase 1 局限

```ts
// classroom-content-analysis-a2.mapper.ts
export function hasA2ReportData() { return true }  // 恒 true
// 仅 overlay header 四字段，report 全量来自 mock
```

**接口接入待办：**

1. DTO → `TypeA2Report` 映射（含 `flags`）
2. `hasA2ReportData` 对齐 A1 思路
3. 关闭 `showFlagProbes`

---

## 4. 与 A1 Mock 对比

| 维度 | A1 | A2 |
|------|----|----|
| 报告树 | `summaryBlocks` + `chapters` | `sectionOne` + `chapters` |
| 章节文件 | `type-a-chapters.ts` 单文件 | `type-a2-chapters.ts` + `a2-data/*` 分章 |
| 条件渲染 | 较少 | 7 flags + block 契约 |
| 专用组件 block | 复用 A1 原子为主 | 15+ `a2*` block 类型 |
| 特别声明 | 有 | 无（设计稿无） |
| 结构单测 | 有 compat 回归 | Dedicated 24 tests |

A2 在**拆分粒度、类型专用度、条件契约**上优于 A1 mock，工程化程度**不低于** A1。

---

## 5. API 接入就绪清单

| # | 项 | 现状 | 接口前 |
|---|-----|------|--------|
| 1 | 独立 DTO 类型 | ✅ `TypeA2Report` | 与后端 OpenAPI 对齐字段名 |
| 2 | flags 映射 | ⚠️ mock only | mapper 写入 |
| 3 | 表格统一路径 | ⚠️ 双路径 | 全部 `a2Table` 或 Renderer 默认 A2 |
| 4 | timeAnchor 白名单 | ✅ 组件+mock | API 按列/字段透传 |
| 5 | hasReportData | ❌ 恒 true | 实现校验 |
| 6 | 探针关闭 | ⚠️ 默认开 | `showFlagProbes=false` |
| 7 | 文案一致性 | ⚠️ 跨课例 | 统一或接口真数据 |

---

## 6. 建议优先级（不要求本 spike 实现）

| 优先级 | 动作 | 工作量 |
|--------|------|--------|
| P0 | 接口 mapper + flags + hasA2ReportData | 中（依赖后端） |
| P1 | 统一 `table` → `ReportA2DataTable` | 小（mock + 可选 Renderer 默认） |
| P2 | 抽 `analysisTable` helper | 极小 |
| P3 | 统一 mock 课例文案 | 中（内容编辑） |
| P4 | 类型注释 / 文档列 A2 block 白名单 | 极小 |

---

## 7. 审查签字

| 问题 | 答案 |
|------|------|
| 当前 mock 结构是否符合工程化？ | **基本符合**（Phase 1 合格，有收敛项） |
| 能否继续在此基础上做 UI/API？ | **可以** |
| 本 spike 是否改代码？ | **否** |
