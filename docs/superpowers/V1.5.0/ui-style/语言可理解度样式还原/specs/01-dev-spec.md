# 语言可理解度样式还原 · 开发规格

**方案：** 按 Figma 驾驶舱深色稿精修（同语言行为路径）

## 对照

| 项 | 稿面 | 现状 |
|----|------|------|
| 外层间距 | 上 20 / 下 52 · gap 20 | pad 20 · gap 12 |
| Gauge | 120×93 · 分数 20 · 标签 14 | 80×62 · 16 / 12 |
| 轨道底 | 白 10% | 白 15% |
| 统计卡 | 标签 #dbfaff · gap 5 | 标签 80% · gap 4 |

## 落点

- `language-comprehensibility-panel.vue`
- `comprehensibility-gauge.vue` / `gauge-arc.ts`
- `use-detail-profile.ts` 轨道色（若需）
