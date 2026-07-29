# 课中教学风格弹性标题文案 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：有数据 Container 与 View fallback 统一为「课中教学风格弹性」，与 `getStabilityTitle` 对齐。

## 1. 目标

「教学风格与弹性特征」右侧标题统一为「课中教学风格弹性」（有等级时追加 `：{等级}`）。

## 2. 改动

| 文件 | 改动 |
|------|------|
| `TeachingStyleFlexibilityContainer.vue` | `课中教学稳定性` → `课中教学风格弹性`（含带等级拼接） |
| `TeachingStyleFlexibilityView.vue` | fallback `课中教学稳定性` → `课中教学风格弹性` |

**不改：** 等级枚举文案（高/中/低稳定性）、描述文案、布局样式。

## 3. 一致性

| 路径 | 期望标题前缀 |
|------|----------------|
| 有数据 `stabilityTitle` | `课中教学风格弹性` |
| View API fallback | `课中教学风格弹性` |
| `getStabilityTitle`（已正确） | `课中教学风格弹性：…` |

## 4. 验收

- [x] 有数据标题为「课中教学风格弹性」或「课中教学风格弹性：…」
- [x] 无数据路径仍正确
- [x] 仓库内无残留「课中教学稳定性」标题字符串（本组件范围内）
