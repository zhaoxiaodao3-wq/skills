# 课堂语言行为样式还原 · 交付快照

**模块：** `ui-style/课堂语言行为样式还原`  
**对照 Figma：** `8030:31715`

## 变更摘要

- 单卡玻璃底 20%；顶栏小计「N 个」；去掉底栏橙条
- 环图视觉 150 + canvas 158（hover 不裁切）；tooltip `appendToBody`
- 图例：分类色标签 16、计数「N份」、占比半透明；色序天蓝/青/绿/草绿/黄

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 空态等分保留分类色；`silent` + 关 scale |
| 常量/mock/真数据 | 通过 | `COCKPIT_LANGUAGE_BEHAVIOR_COLORS` 覆盖 viewModel |
| 多入口 | N/A | 仅详情 S6 |
| 失败/缺省 | 通过 | `buildDefaultLanguageBehaviorViewModel` |

## 还原度自检

- **节点：** `8030:31715`
- **对照方式：** Figma MCP design context + token 对照
- **偏差清单：** panel-chrome 标题条沿用共享组件；环图扇区角度未做像素级对齐
- **结论：** 主布局与色值已对齐，可交付
