# 语言可理解度缺省态数值 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 语言可理解度三个 gauge 中心分数：缺省态显示 `0`；有数据时整数不补 `.0`，小数保留一位截断。

**Architecture:** 仅改 `ComprehensibilityGauge.vue` 的 `displayScore` 计算，复用已有 `formatStructureScore` 工具函数，与课堂结构清晰度分数展示规则对齐。不改动 Container、Adapter 或 ViewModel 结构。

**Tech Stack:** Vue 3 + TypeScript，Vitest（可选自检），教师画像模块 `number-format.ts`

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `ComprehensibilityGauge.vue` | 270° 弧 gauge；中心分数展示逻辑在此修改 |
| `utils/number-format.ts` | 已有 `formatStructureScore`，整数原样、小数一位截断 |

---

### Task 1: 更新 Gauge 分数格式化

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/language-comprehensibility/ComprehensibilityGauge.vue`

- [ ] **Step 1: 替换 import**

将：

```typescript
import { truncateToOneDecimal } from '../../utils/number-format'
```

改为：

```typescript
import { formatStructureScore } from '../../utils/number-format'
```

- [ ] **Step 2: 更新 displayScore 计算**

将：

```typescript
const displayScore = computed(
  () => truncateToOneDecimal(props.dimension.score) ?? '0.0',
)
```

改为：

```typescript
const displayScore = computed(
  () => formatStructureScore(props.dimension.score) ?? '0',
)
```

- [ ] **Step 3: 确认模板无需改动**

`{{ displayScore }}` 绑定保持不变；`score <= 0` 时不渲染进度弧的逻辑保持不变。

---

### Task 2: 自检

**Files:**
- Test (manual): 教师画像页语言可理解度模块

- [ ] **Step 1: Lint**

Run: `pnpm exec eslint src/pages/school/teacher-portrait/components/language-comprehensibility/ComprehensibilityGauge.vue`

Expected: 无新增 error

- [ ] **Step 2: 缺省态目视验收**

1. 打开教师画像页，不选教师（或选无 `languageComprehensibility` 数据的教师）
2. 确认三个 gauge 中心分数均为 `0`，不是 `0.0`

- [ ] **Step 3: 有数据态目视验收**

1. 选有语言可理解度数据的教师
2. 整数维度分（如 20）显示 `20` 而非 `20.0`
3. 若存在小数维度分，显示一位截断小数（如 `18.7`）
4. 弧动画、颜色、综合得分/等级区行为不变

---

## Spec 覆盖自检

| Spec 验收项 | 对应 Task |
|-------------|-----------|
| 未选教师显示 `0` | Task 1 + Task 2 Step 2 |
| 整数分无 `.0` | Task 1 + Task 2 Step 3 |
| 小数分一位截断 | Task 1（`formatStructureScore`） |
| 动画/等级区不变 | Task 1 仅改 displayScore |

## 不在范围（再次确认）

- `LanguageComprehensibilityContainer.vue` 的 `totalScoreDisplay` 不改
- 不新增 prop、不改 Adapter
