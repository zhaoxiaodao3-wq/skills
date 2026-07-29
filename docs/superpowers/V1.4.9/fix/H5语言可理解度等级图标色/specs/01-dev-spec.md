# H5语言可理解度等级图标色 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**日期：** 2026-07-22  
**方案：** A · 强制 path fill  
**目标仓库：** `E:\code\H5`  
**关联：** [ui-style/H5教师画像语言可理解度](../../ui-style/H5教师画像语言可理解度/)

## 1. 目标

语言可理解度面板中，综合等级与综合得分图标统一为 `#027AFF`。

## 2. 改动

**文件：** `components/LanguageComprehensibilityPanel.vue`

对齐清晰度：

```scss
.lc-panel__stat-icon :deep(svg path) {
  fill: #027aff;
}
```

（替换或补强现有仅 `svg { fill }` 规则。）

## 3. 验收

- [x] 综合得分 / 综合等级图标同为 `#027AFF`  
- [x] 其它样式与业务不变  

## Out of Scope

改图标库、改其它模块。
