# AB 报告 Header 时长与分享 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：只改共用 `ReportHeroHeader.vue`；分享用 `AppShareLink` ghost 样式；本期 Mock 拉取即可，不强制接真实分享接口。

## 1. 目标

A/B 课堂教学内容分析顶栏：

1. 去掉课堂时长图标；时长移到 meta 行末尾  
2. 原时长位置放置分享按钮（`AppShareLink variant="ghost"`）

## 2. 改动

**文件：** `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportHeroHeader.vue`

### 2.1 标题行右侧

```vue
<div class="cca-hero__top">
  <div class="cca-hero__title-row">...</div>
  <AppShareLink variant="ghost" />
</div>
```

- 删除 `cca-hero__duration` 块及 `iconSchedule` 引用

### 2.2 Meta 行末尾

在教材章节之后追加：

```vue
<span class="cca-hero__meta-divider">|</span>
<span>课堂时长：{{ header.durationDisplay }}</span>
```

（无图标）

### 2.3 样式

- 去掉 `&__duration` / `&__duration-icon`（或保留未用则删除）
- 分享按钮区域可加 `flex-shrink: 0` 对齐原时长位置

## 3. 非目标

- 不改 A/B View 其它逻辑  
- 本期不传 `resolveShareUrl`（走组件内置 Mock）  
- 不改评分卡片布局  

## 4. 验收

- [x] A/B 报告顶栏标题右侧为「分享链接」ghost 按钮  
- [x] 无时长图标；科目行末尾有「课堂时长：…」  
- [x] 点击分享可打开弹窗（Mock 链接流程）  
