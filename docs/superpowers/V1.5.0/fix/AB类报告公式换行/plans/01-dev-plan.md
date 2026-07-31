# AB 类报告公式换行 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 为 AB 类报告计算过程正文增加 `word-wrap: break-word`，避免长公式撑破布局。

**Architecture:** 计算过程经 `CalcProcessDisclosureRow` → `ReportInfoCard` 渲染；在 `ReportInfoCard` 四个正文选择器统一加样式，A/B 自动覆盖。

**Tech Stack:** Vue 3 SFC、scoped SCSS

---

## 文件职责

| 路径 | 职责 |
|------|------|
| `src/.../ReportInfoCard.vue` | 唯一实现改动：正文 `word-wrap` |
| 本模块 archive | 交付快照 |

---

### Task 1: 为 ReportInfoCard 正文加 word-wrap

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportInfoCard.vue`

- [x] **Step 1:** 改 `src/` 前跑：

```bash
pnpm harness:status -- --match "AB类报告公式换行"
pnpm harness:check
```

- [x] **Step 2:** 在下列选择器中各增加一行 `word-wrap: break-word;`（保留现有 `white-space: pre-wrap` 等属性）：

```scss
.cca-info-card__field-value {
  // ...existing...
  white-space: pre-wrap;
  word-wrap: break-word;
}

.cca-info-card__list {
  // ...existing...
  word-wrap: break-word;
}

.cca-info-card__paragraph {
  // ...existing...
  white-space: pre-wrap;
  word-wrap: break-word;
}

.cca-info-card__plain-lines {
  // ...existing...
  word-wrap: break-word;
}
```

- [x] **Step 3:** 确认未改 template / script / 其他选择器
- [x] **Step 4:** 浏览器打开 `classroom-content-analysis`（A/B 各一）核对计算过程长文本可换行

---

### Task 2: 交付归档

**Files:**
- Modify: `specs/01-dev-spec.md`（勾选验收项）
- Create: `archive/AB类报告公式换行-delivered.md`

- [x] **Step 1:** A 一致性自检：空态/有数据 N/A；常量/mock N/A；多入口通过（A/B 共用 ReportInfoCard）；失败/缺省 N/A
- [x] **Step 2:** B 还原度自检写「不适用：无 Figma / 非 UI」
- [x] **Step 3:** 写 archive（含一致性自检、还原度自检）
- [x] **Step 4:** `pnpm harness:check` 与 `pnpm harness:status -- --match "AB类报告公式换行"`，确认可报 DELIVERED

---

## 执行注意

- 用户未要求时不要自动 commit
- 禁止扩大 scope（不改 mapper / 其他组件）
