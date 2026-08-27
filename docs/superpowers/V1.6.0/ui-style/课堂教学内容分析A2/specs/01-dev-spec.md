# A2 底部温馨提示文案 · 开发规格

**Requirement:** [../requirements/课堂教学内容分析A2-需求.md](../requirements/课堂教学内容分析A2-需求.md) §8 Revision 06  
**模块:** `ui-style/课堂教学内容分析A2`  
**档位:** 标准  
**日期:** 2026-08-27

---

## 1. 目标

将 A2 报告页底 `report.tip` 更新为：

```
温馨提示：评分与等级仅供参考，不作为教师教学能力的评估依据。请聚焦于报告的分析内容。
```

---

## 2. 范围

| 纳入 | 排除 |
|------|------|
| `mock/classroom-content-analysis-a2.mock.ts` 中 `tip` | View 组件、样式 |
| 可选：结构单测断言 tip 文案 | A1/B1 mock |

---

## 3. 验收

- [ ] A2 `?reportSubType=A2` 页底为新文案
- [ ] A1/B1 tip 仍为「AI分析反馈意见仅供参考」

---

## 4. 样式对照（Figma）

不适用：纯文案替换。
