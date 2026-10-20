# 临时占位页面块 · 开发规格（标准档）

**Requirement:** [requirements/03-placeholder-blocks.md](../requirements/03-placeholder-blocks.md)
**前置交付:** [archive/01-概览顶部模块-delivered.md](../archive/01-概览顶部模块-delivered.md)
**状态：** 待 P2 确认

## 现状与需求

- 三个页面还各有一块由**同事负责**的组件区域（等级分布 / 热力图），组件未开发。用户要求先用**设计稿截图占位**，保持设计稿大小，后续同事组件就绪后整体替换。
- 占位块（Figma node → 截图已导出至 `src/assets/placeholders/`，文档仓库留档 `requirements/assets/placeholders/`）：

| 页面 | 占位块 | Figma node | 截图资源 | 设计稿尺寸 |
|------|--------|-----------|----------|-----------|
| 备课组长 plan-lessons | 等级分布（内含**本组等级分布** + **班级等级分布**两个子组件，同事负责） | `9913:46587` | `ph-distribution-plan.png` | 1680x824 |
| 年级长 grade-overview | 等级分布（内含**本组等级分布** + **等级构成对比**） | `9913:47970` | `ph-distribution-grade.png` | 1680x830 |
| 年级长 grade-overview | 年级 × 科目热力图 | `9913:48178` | `ph-heatmap-grade.png` | 1680x503 |

- 页面内顺序（按设计稿页面流）：顶部模块 → 组内即时关注 → 等级分布占位 →（年级长）热力图占位。

## 方案

1. 截图资源放 `src/assets/placeholders/`，页面以 `<img>` 满宽引用（`width: 100%; display: block`），随容器自适应缩放
2. 每处带 `TODO(1.7.1-临时占位):` 注释（同事组件就绪后：删 img 与 import、替换为组件）
3. 学科组长预览页（subject-overview-2）本次不加（用户未要求；同事组件就绪时该页一并处理）
4. 文档：本 spec + 归档「占位说明与删除清单」

## 验收标准

1. [x] `plan-lessons` 渲染等级分布占位截图（组内即时关注下方）（实测 count=1，满宽清晰）
2. [x] `grade-overview` 渲染等级分布占位 + 热力图占位（顺序正确）（实测 count=2）
3. [x] 占位宽度 100% 自适应、不变形（高度按图片比例）
4. [x] `subject-overview-2`、`principal-cockpit-2` 无占位块；既有组件无回归
5. [x] vue-tsc 0 error；`TODO(1.7.1-临时占位):` 标记 3 处齐全
6. [x] **对接文档写明：同事组件接入后，占位 img 与截图资源文件（`ph-*.png`）必须一并从项目删除**（归档「占位说明与删除清单」）

## 交付自检说明

- 一致性自检：适用（仅静态图片占位，无数据路径；三页面入口检查）
- 还原度自检：不适用（占位即设计稿截图本身，天然一致）
