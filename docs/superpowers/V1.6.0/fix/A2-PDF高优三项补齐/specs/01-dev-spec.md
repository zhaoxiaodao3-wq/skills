# Spec：A2 PDF 高优三项补齐

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 行为

1. **基本情况**：从 `logicAnalysis.basicInfo` 解析展示为「是否存在问题链：{x}」「问题总数：{y}」；解析失败时对应项为 `--`，勿整段原文堆在「基本情况」后。  
2. **3.3 有效性总结**：当 `keyPointsBreakthrough.effectivenessSummary` 非空时，在重难点卡片后增加标题为「教学行为有效性总结」的内容卡（对齐 Web）。  
3. **时长系数 hint**：按 `parseClassDurationMinutes` 同等规则取 T，再按档输出 Web 文案；T 不可解析时 hint 可空或保留占位但不写死「T≥30」。

## 验收

- [x] 基本情况为两段标签文案，非整串 API  
- [x] effectivenessSummary 有数据时可见总结卡  
- [x] 时长 &lt;30 时 hint 不是「T ≥ 30…」  
