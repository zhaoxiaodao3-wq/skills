# PDF 报告模板字段展示 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 样式对照

| 项 | 值 |
|----|-----|
| color | `var(--web-semantic-white, #fff)` |
| font-family | `"PingFang SC"` |
| font-size | 16px |
| font-weight | 600 |
| 布局 | meta 左右分栏；右侧顶对齐 |

## 行为

```html
报告模板：<span th:text="${#strings.isEmpty(reportSubType) ? '--' : reportSubType}">--</span>
```

后端日后在 Thymeleaf Context 注入 `reportSubType` 即可显示真实值；未注入时为 `--`。

## 验收

- [x] A/B 模板 meta 右侧有「报告模板」
- [x] 无变量时兜底 `--`
- [x] 未改 Java / cover / toc
