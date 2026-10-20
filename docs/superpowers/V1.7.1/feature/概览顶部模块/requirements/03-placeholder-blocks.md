# 原始需求：临时占位页面块（等级分布 / 热力图）

> 来源：用户口述 + Figma 设计稿（2026-10-16）
> 关联：[02-preview-pages.md](02-preview-pages.md)（临时预览页面）

三个页面各有一块**同事负责**的组件区域，组件未开发，先占位看整页效果：

1. **备课组长页**（plan-lessons）：[9913-46587](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/%E6%98%8E%E7%9D%BF%E5%BC%80%E5%8F%91%E7%A8%BF-%C2%B7%E5%9B%A2%E9%98%9F%E7%89%88?node-id=9913-46587&m=dev) 等级分布块（1680x824，内含**本组等级分布** + **班级等级分布**两个组件）——用 Element Plus 占位或截图占位均可
2. **年级长页**（grade-overview）：[9913-47970](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/%E6%98%8E%E7%9D%BF%E5%BC%80%E5%8F%91%E7%A8%BF-%C2%B7%E5%9B%A2%E9%98%9F%E7%89%88?node-id=9913-47970&m=dev) 等级分布块（1680x830，内含本组等级分布 + 等级构成对比）——占位 + 写好占位说明文档
3. **年级长页**（grade-overview）：[9913-48178](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/%E6%98%8E%E7%9D%BF%E5%BC%80%E5%8F%91%E7%A8%BF-%C2%B7%E5%9B%A2%E9%98%9F%E7%89%88?node-id=9913-48178&m=dev) 热力图（1680x503，标题「年级 × 科目热力图」）——**大小跟设计稿保持一致**

## P1 结论（2026-10-16）

采用**截图占位**：三块从 Figma 渲染 PNG（1x）放 `src/assets/placeholders/`，页面 `<img>` 满宽引用，带 `TODO(1.7.1-临时占位):` 标记；同事组件就绪后删除 img 替换为组件。subject-overview-2 本次不加。
