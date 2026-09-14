# Spec：A2 PDF 中优三项补齐

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 行为

1. **Bloom 层级名**：展示前去掉开头的 `数字.`；合计卡不受影响。  
2. **评价列 joinEval**：`evaluation` 为数组时用换行拼接；字符串原样；空为 `-`。覆盖所有 `A2DimRowVO.evaluation` 表列及同类 badge。  
3. **序号补零**：板块二 `relationTypes`、板块三 `thinkingSpanEvaluation`、3.3 `planReference` 的序号为两位（`01`…）。

## 验收

- [x] `1.记忆` 显示为「记忆」  
- [x] 评价为 `["匹配","充分"]` 时单元格为两行而非 `[匹配, 充分]`  
- [x] 板块二/三与 3.3 序号为 `01` 起  
