# 临时占位页面块 · 交付归档

**归档类型：** feature 交付快照（标准档）
**归档日期：** 2026-10-16
**版本：** V1.7.1
**Requirement:** [../requirements/03-placeholder-blocks.md](../requirements/03-placeholder-blocks.md)
**Spec:** [../specs/03-dev-spec.md](../specs/03-dev-spec.md)
**代码仓库：** `apps-development-platform`（分支 `dev/lianglinbin`）· **按用户规则未 commit**

## 改动摘要

三个页面接入设计稿截图占位（同事负责的组件区域），保持设计稿大小、满宽自适应：

- **备课组长页**：等级分布块（node 9913:46587，内含**本组等级分布** + **班级等级分布**两个同事组件）
- **年级长页**：等级分布块（node 9913:47970，内含**本组等级分布** + **等级构成对比**）+ **年级 × 科目热力图**（node 9913:48178）

页面顺序（按设计稿页面流）：顶部模块 → 组内即时关注 → 等级分布占位 →（年级长）热力图占位。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/assets/placeholders/{ph-distribution-plan, ph-distribution-grade, ph-heatmap-grade}.png`（Figma 渲染 1x 截图） |
| 改 | `src/views/plan-lessons/{plan-lessons.vue, .scss}`（追加占位 img + 样式） |
| 改 | `src/views/grade-overview/{grade-overview.vue, .scss}`（追加两张占位 img + 样式） |

## 占位说明与删除清单（同事组件对接时执行）

> **用户明确要求：对接同事组件后，占位 img 与截图资源文件必须一并从项目删除。**
> 定位方式：全局搜索 `TODO(1.7.1-临时占位):`，共 3 处。

| 占位块 | 页面 | 删除内容 |
|--------|------|---------|
| 等级分布（本组等级分布 / 班级等级分布） | `plan-lessons.vue` | img 标签（含 TODO 注释）+ `ph-distribution-plan.png` |
| 等级分布（本组等级分布 / 等级构成对比） | `grade-overview.vue` | img 标签（含 TODO 注释）+ `ph-distribution-grade.png` |
| 年级 × 科目热力图 | `grade-overview.vue` | img 标签（含 TODO 注释）+ `ph-heatmap-grade.png` |

给同事的交接信息：等级分布块内部为两个组件（**本组等级分布**：环形图+达标率+四等级卡；**班级等级分布/等级构成对比**：堆积条形图+报告类别/等级对比切换），热力图为「年级 × 科目」矩阵+0~100 色阶图例；设计稿节点 9913:46587 / 9913:47970 / 9913:48178。

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 纯静态图片占位，无数据路径 |
| 常量/mock/真数据 | N/A | 无数据；资源单点存放 `src/assets/placeholders/` |
| 多入口 | 通过 | 三处占位分属两页面，互不影响；subject-overview-2 / principal-cockpit-2 未加（按需求） |
| 失败/缺省 | 通过 | img 带 alt 文案；资源随仓库提交，不存在 404 |

## 还原度自检

不适用（占位物即设计稿官方渲染截图，天然一致；满宽缩放为唯一偏差，属自适应预期）。

## 验证记录

- vue-tsc 0 error
- 浏览器实测：`grade-overview` 两张占位（`.grade-overview__placeholder` count=2，等级分布+热力图顺序正确）；`plan-lessons` 一张占位（count=1）；均满宽不变形；其他页面无占位块、无组件回归

## Harness 闭环

- [x] 标准档暂停点齐备：P1（截图占位方案 + subject 页不加）/ P2（「确认」+ 附加要求）/ P3（Inline）
- [x] spec 验收项已勾选（5/5）
- [x] 一致性自检已完成；还原度自检注明不适用
- [x] 占位说明与删除清单已写入本 archive（含用户附加要求：截图资源须随组件对接删除）
- [x] 机械门禁不可用，Agent 层手动等价执行
- [x] 未 commit、未 push（用户规则）
