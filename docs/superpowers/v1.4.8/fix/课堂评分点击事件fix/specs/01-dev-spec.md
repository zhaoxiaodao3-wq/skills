# 课堂评分点击事件 fix — 开发规格

**Requirement:** [requirements/原始需求.md](../requirements/原始需求.md)

---

## 1. 问题

`ai-autonomous-analysis/index.vue` 第 115–121 行「课堂评分」列使用 `ElLink` + `@click="handleShowBcti"`，点击打开 `BctiScoreDialog`。产品要求该列改为只读展示，不再响应点击。

## 2. 方案对比

### 方案 A：保留 ElLink，移除 @click（不推荐）

链接样式仍在，用户易误以为可点击，且需额外改 `type`/样式以去链接感。

### 方案 B：改为 span 纯文本展示 + 清理死代码（推荐）

与「课堂等级」列只读标签一致；移除本页专用的 `BctiScoreDialog`、`handleShowBcti` 及相关 ref，避免无用依赖。

### 方案 C：disabled ElLink（不推荐）

语义仍像链接，disabled 态样式与表格不协调。

**结论：采用方案 B。**

## 3. 改动清单

| 位置 | 改动 |
|------|------|
| 模板「课堂评分」列 | `ElLink` → `span`；保留 `v-if="row.bcti && row.state?.toLowerCase() === 'success'"` 与 `v-else -` |
| 模板底部 | 删除 `<BctiScoreDialog … />` |
| script | 删除 `BctiScoreDialog` import、`bctiUseV2Api`、`bctiDialogVisible`、`bctiDialogData`、`handleShowBcti` |

## 4. 验收

- [ ] 成功态有 `bcti` 时显示分数，无则 `-`
- [ ] 点击分数无弹窗
- [ ] 无 ESLint / TS 未使用变量报错
- [ ] 其他列表页 BCTI 点击行为未改动
