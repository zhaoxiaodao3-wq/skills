# 提问类型样式还原 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**方案：** 按 Figma 驾驶舱深色稿重排 group 布局 + 校正色值（同课堂结构清晰度精修路径）

## 1. 目标

| 项 | 稿面 | 现状 |
|----|------|------|
| 面板布局 | 纵向双卡 gap 20 | 横向并排 gap 10 |
| 卡片 | pad 20×14、底/边 20%、radius 8 | pad 12、底 8%、徽章顶置 |
| 标题行 | 左标题 16 / 右「小计 N 个」 | 徽章 pill + 底栏小计条 |
| 内容行 | 左饼 80 + 右图例 | 上饼下图例 |
| 四何色 | 天蓝/青/橙/草绿 | 紫/蓝/橙/绿（偏校端） |
| 布鲁姆色 | 青/草绿/橙 | 蓝/绿/黄 |
| 布鲁姆图例 | 2+1 分行 | wrap 单行 |

## 2. 落点

- `.../question-type/question-type-panel.vue`
- `.../question-type/question-type-group.vue`
- `.../question-type/chart-options.ts`（COCKPIT 色）
- `.../adapters/constants/question-type.ts`（bloom legendRows → rows）

## 3. 验收

- 双卡上下排列，视觉接近 Figma
- 小计在标题行右侧，数字 `#ff714b`
- 图例数量色与扇区一致；图例文字 `#dbfaff` 16/semibold
- 空态不报错
