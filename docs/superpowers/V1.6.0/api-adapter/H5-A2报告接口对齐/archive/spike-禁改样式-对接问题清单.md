# H5-A2 对接 · 问题清单（已确认）

**日期：** 2026-09-08  
**原则：** H5 **禁止改样式**；只对接接口内容；映射参考 Web；冲突先确认。

---

## 硬问题裁定（用户 2026-09-08）

### 1. 5.3 → **字段空则展示固定文案**（已纠正表述）

- **条件（跟 Web）：** `classSummary.coreQuestionReturn` 为 `null` 或 `[]`
- **有数据：** 出卡片列表
- **空：** 标题下加一行固定文案（Web 文案为「导入环节未提出核心问题，本模块不适用」——「不适用」是文案用词，**不是**额外业务状态）
- **前提：** 仅当 5.0 判定有总结性教学时才会进入 5.1～5.3；无总结时整段 5.1～5.3 隐藏（与 5.3 空字段文案是两层逻辑）
- 实现：允许 H5 模板绑一行文案（不改样式）

### 2. 数据路径 → **沿用 H5 原分享接口外层；模块字段与 Web 同构**

- 外层：继续用 H5 分享接口根结构（如 `status` / `basicInfo` / `reportContent` 等既有根字段，以 H5 现网约定为准）
- 内层各模块字段：**与 Web `aReport`（PostClassReportA2VO）一致**
- adapter：从既有外层取出与 Web 同构的报告体再映射；**不要**强行改成 Web 页面的 `caseBasicInfo.aReport` 路径名

### 3. 10.1 槽位 → **够用；先前误判**

- H5 `A2ScoreSummary` 已有 `label` / `value` / `gradeCode` / `gradeBadge`
- mock 已把时长系数说明、最终总分公式写进 **`value` 字符串**（如 `1.00（T ≥ 30 → 1.00）`）
- Web 侧 `hint`/`sideNote` 是展示辅助字段；对齐时在 adapter 把同等文案编入 `value`（及等级两字段）即可
- 「查看详情」/ G05：H5 无此按钮、本期不做

---

## 允许 / 禁止（不变）

| 允许 | 禁止 |
|------|------|
| adapter / types / hook 取数映射 | 改 SCSS、布局、视觉结构 |
| 5.3 模板加一行 `notApplicableMessage` 文案绑定 | 半卡撑满等 Web CSS 移植 |
| 删 mock / Empty Probe / FORCE_MOCK | G05 弹窗 |

---

## 下一步

硬问题已闭合 → 等 **P3：`Inline` / `SDD`** 后改 `E:\code\H5` 实现。
