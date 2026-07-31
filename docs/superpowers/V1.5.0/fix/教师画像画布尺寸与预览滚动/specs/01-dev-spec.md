# 教师画像画布尺寸与预览滚动 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 补充：[02-补充收敛.md](../requirements/02-补充收敛.md)  
> 关联 feature：`驾驶舱教师画像组合组件`（identifier `teacher-portrait-1`）

## 1. 目标

修正 `teacher-portrait-1` 在模板编辑页拖入尺寸/位置，以及预览页被压进一屏的问题。

| 场景 | 目标 |
|------|------|
| 编辑拖入 | 按设计稿 **1920** 宽自动铺满一页（左右约 30 边距 → 宽 1860）；位置吸附，不跟鼠标乱漂 |
| 预览 | 按内容设计高度占位，页面可纵向滚动，禁止用视口 ry 压扁整卡 |

## 2. 尺寸约定

| 量 | 设计稿 px | 说明 |
|----|-----------|------|
| 页宽 | 1920 | 换算基准（已有 `CANVAS_DESIGN_WIDTH`） |
| 页高（编辑一页） | 1080 | 已有 `CANVAS_FIGMA_DESIGN_HEIGHT` |
| 组件宽 | 1860 | ≈ 1920 − 30×2 |
| 组件高（编辑一页） | 904 | ≈ 1080 − 146 − 30（顶偏移后铺满一页） |
| 组件高（预览内容） | 1454 | KPI+中三栏+底热力（范围 B）；实现时可用常量，允许 ±2% 微调 |
| 默认 left / top（编辑） | 30 / **146** | left=边距；top=KPI 起点（不含顶栏标题/Tab） |

## 3. 改动面（data-cockpit）

### 3.1 `src/constants/canvas-design.ts`

- `COMPONENT_FIXED_SIZE` 增加：
  - `'teacher-portrait-1': { w: 1860, h: 1020 }`（编辑一页用；预览高度见 3.3）
- 可选：导出常量 `TEACHER_PORTRAIT_CONTENT_HEIGHT = 1454`、`TEACHER_PORTRAIT_MARGIN = 30`，避免魔法数。

### 3.2 `canvas-editor.vue` · handleDrop

- 对 `teacher-portrait-1`（normalize 后）：
  1. 尺寸走 `calcFixedSizeOnCanvas`（fixed 表优先，已存在链路）。
  2. **强制** `left/top` 为设计边距换算值（约 30×scale），不使用鼠标落点。
- 删除或注释 `COMPONENT_DEFAULT_SIZE_RATIO['teacher-portrait-1']`，避免与 fixed 双源。

### 3.3 `restore-datav.vue` · 预览

- 识别 `teacher-portrait-1`（含实例后缀 normalize）：
  - **高度**：按内容高 `1454 * (displayWidth/1920)`（或等价：先按设计宽比算高，再映射），**不要**用 `c.height * ry` 压成视口高。
  - **宽度 / left / top**：仍可按 rx 与保存的编辑坐标缩放；若编辑已按 30 边距保存，预览应对齐。
- 页面容器：当 cmpntList 含该组件时，允许纵向滚动（例如根或内容层 `overflow-y: auto`，内容区高度 ≥ 组件底边），保证热力可滚入视口。
- 内部 `--cmpnt-scale`：本组件保持与壳一致填满即可；不引入二次整页 scale。

### 3.4 组件本体 `mr-teacher-portrait-1`

- 根节点继续 `width/height: 100%`；壳变高后 flex 自然展开。
- 本 fix **不要求**改子面板视觉；若一页高 1020 下内部过挤，以预览 1454 为准验收滚动，编辑页允许内部滚动。

## 隔离约束（用户强调）

- **只**特殊处理 `teacher-portrait-1`（含 normalize 后的实例 id）。
- 不得改变其它组件的默认尺寸、落点、内部 scale、预览缩放与滚动。
- 实现上：**不**把本组件写入会连带改变 `resolveCmpntInternalScale` 的 `COMPONENT_FIXED_SIZE`；用独立常量/helper + 显式 if 分支。
- 预览滚动 class **仅**在存在本组件时启用。

## 5. 验收

- [x] 编辑页拖入：宽高约为画布上「一页 − 边距」，left/top 贴边距，无明显四周大留白
- [x] 编辑页：组件仍可手动拖拽/缩放（行为与其它 cmpnt 一致）
- [x] 预览页：整卡高度按内容展开，出现页面纵向滚动，底热力可滚到
- [x] 预览页：不被压成「一屏塞下全部」的扁态
- [x] 其它图表拖入/预览无回归

## 6. 风险与注意

- 已保存模板若旧尺寸错误，需重新拖入或手动改尺寸；本 fix 主要修**新建拖入默认值**与**预览渲染**。
- 预览改 overflow 时注意 Tab 底栏不被挡住（保留现有 bottom offset）。
