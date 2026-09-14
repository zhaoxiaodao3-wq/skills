# H5-A2 报告接口对齐 · 开发 Spec

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**问题清单:** [archive/spike-禁改样式-对接问题清单.md](../archive/spike-禁改样式-对接问题清单.md)  
**对照 Web：** `api-adapter/A2报告接口字段对齐`  
**档位：** 标准  
**日期：** 2026-09-08

## 1. 目标

H5 A2 分享页从全 mock 改为消费真实分享数据；**映射规则跟 Web**；**禁止改 H5 样式**——只做取数 + adapter 填现有组件槽位；冲突先确认再改代码；清理联调死逻辑。

## 2. 范围

**做（确认硬问题后）：**

- 按真实 JSON 解析 `aReport`；重写 `mapA2ToView`（参考 Web 纯数据规则 → H5 现有 ViewModel）
- 条件渲染落到 H5 已有 `emptyMessage` / `hasChain` / `hasSummaryTeaching` 等
- 3.3 `parsePlanReferenceItems`、3.6.2 `string[]`、不读 `renderFlags`
- 清理 FORCE_MOCK / Empty Probe / 恒 mock

**禁止：**

- 改 SCSS、布局 class、视觉结构
- 未经确认改模板/组件结构
- G05；跨仓共享包；Web 半卡撑满 CSS

**须你确认后再动（硬问题）：** 见问题清单 —— **已于 2026-09-08 裁定**（5.3 加一行文案；外层 H5 根字段+内层同 Web；10.1 用 value 承载文案）。

## 3. 关键映射（数据层）

| 区 | 规则 |
|----|------|
| 取数 | 真实 envelope 中的 A2 VO；类型不读路由 |
| 表/卡 | adapter 重塑为 H5 FieldCard / 现有面板；不改展示组件样式 |
| 3.3 参考 | `parsePlanReferenceItems` → 现有 leadLabel/leadContent |
| 3.6.2 | 三段 `string[]`；null/`{}` 同构 |
| 5.x | preJudgment 仅值+固定标题；coreQuestionReturn 空态策略待硬问题 1 |
| 10.1 | 维表+摘要；hint/详情待硬问题 3 |

## 4. 验收

- [ ] 真 code + aReport → 非整包 mock
- [ ] 条件渲染与 Web 约定一致（在现有 H5 能力内）
- [ ] 视觉与对接前一致（未改样式）
- [ ] 生产无 Empty Probe / 无默认 FORCE_MOCK
- [ ] 硬问题均有你的书面选项记录

## 还原度自检

不适用：禁改样式，仅接口对接。
