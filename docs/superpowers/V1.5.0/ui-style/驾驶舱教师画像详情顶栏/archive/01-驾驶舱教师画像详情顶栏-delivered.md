# 驾驶舱教师画像详情顶栏 · 交付快照

**模块：** ui-style/驾驶舱教师画像详情顶栏  
**实现仓：** data-cockpit `mr-teacher-portrait/detail`  
**Figma：** `8030:31830` / `8030:31831`

## 交付摘要

1. 新增 `detail/components/page-header/tp-page-header.vue`：中心牌 + 翼形 SVG + **左右贯通渐变横线**（对齐 `8030:31838`，左侧镜像），文案「教师画像大数据看板」。  
2. 资源落盘：`assets/images/teacher-portrait-detail/title-bar/*.svg`。  
3. `detail/index.vue` 在 `__shell` 顶部常驻挂载页头（加载/错误/空态均可见）；顶 padding 30、页头下间距 30。  
4. 贯通线用 CSS `linear-gradient(#28DCD1@70% → 透明)` 绝对铺满标题两侧，避免 SVG background 不渲染。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 页头在 loading/error/content 分支之外，始终渲染 |
| 常量/mock/真数据 | N/A | 文案写死，无接口 |
| 多入口 | N/A | 仅详情独立预览页 |
| 失败/缺省 | 通过 | 错误态仍显示页头 |

## 还原度自检

| 项 | 结果 | 说明 |
|----|------|------|
| 文案 / 字号色 | 通过 | 20 / Semibold / #fff，对齐 `8030:31837` |
| 中心牌 + 翼形 | 通过 | plate + chevron/accent，右翼 `rotate(180) scaleY(-1)` |
| 左右贯通线 | 通过 | `line.svg`，左线 `scaleX(-1)` |
| 页头占位 | 通过 | 高 50 + margin-bottom 30，对齐内容区起点量级 |

## 验收勾选

- [x] 详情页顶部可见「教师画像大数据看板」  
- [x] 对齐 Figma `8030:31830` 装饰结构  
- [x] 加载/错误/空态页头不消失  
