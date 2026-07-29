# 课堂语言行为单位修改 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

统一课堂语言行为组件的 count 单位为「个」（与底部小计一致）。

## 2. 改动

| 文件 | 行号 | 改动 |
|------|------|------|
| `ClassroomLanguageBehaviorView.vue` | 58 | `{{ item.count }}份` → `{{ item.count }}个` |

## 3. 不在范围

- 不影响底部小计行（已是「个」）
- 不影响数据层、Container、chart-options
