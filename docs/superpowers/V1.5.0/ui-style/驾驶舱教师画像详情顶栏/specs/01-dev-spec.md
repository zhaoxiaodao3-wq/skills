# 驾驶舱教师画像详情顶栏 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.5.0  
**类型：** ui-style  
**实现仓：** `E:/code/dataView/apps-development-platform/apps/data-cockpit`  
**Figma：** [顶部标签 `8030:31830`](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8030-31830&m=dev)  
**方案：** A（Figma SVG 拼页头，已确认）

---

## 1. 目标

在教师画像详情独立预览页顶部补齐「教师画像大数据看板」页顶标题栏，对齐 Figma `8030:31830`，不依赖看板壳 `kanban-title`。

## 2. 非目标

- 不改 `restore-datav` / 组合件列表页顶栏  
- 本期不做 model-2 / model-3 独立换皮（三主题共用模板 1 装饰）  
- 不改 `document.title`（仍为「教师画像」）  
- 不改各分析面板布局与数据逻辑  

---

## 3. 信息架构

```
detail/
  index.vue                          # 在 __shell 顶部插入页头
  components/
    page-header/
      tp-page-header.vue             # 页顶栏（装饰 + 文案）
assets/images/teacher-portrait-detail/title-bar/
  plate.svg / chevron-*.svg / accent-*.svg / line.svg
```

**挂载位置：** `mr-teacher-portrait-detail__shell` 内最上方（DEV 数据态开关之上）。

**文案：** 固定 `教师画像大数据看板`（与 Figma `8030:31837` 一致）。

---

## 4. 样式对照（Figma）

> 取值来源：Figma MCP `get_design_context` / `get_metadata`（节点 `8030:31830`、`8030:31831`、`8030:31837`、`8030:31838`）。稿面为模板 1。

### 4.1 外框与位置

| Token | Figma | 节点 / 说明 |
|-------|-------|-------------|
| 顶栏画板 | `1860×40`，相对整页约 `x=30,y=30` | `8030:31830`「顶部标签」 |
| 内容区起点 | 内容 frame 约 `y=100` | 页头 + 上下留白合计约 **70–76px**（含顶 padding） |
| 中心装饰组 | `360×50`，组内 `top: -5` | `8030:31831` |
| 右横线 | `740×0`（stroke 2），`top: 20` | `8030:31838`；左侧对称镜像 |

### 4.2 中心装饰拼装（相对 `8030:31831`）

| 件 | 尺寸 | 资源 | 说明 |
|----|------|------|------|
| 外翼左 | `26.4×50` | `chevron-l.svg` | `8030:31832` |
| 内翼左 | `26.4×50` | `accent-l.svg` | `8030:31834`，叠在外翼内侧 |
| 中心牌 | `309.6×50` | `plate.svg` | `8030:31836`，六边形渐变板 |
| 内翼右 | 镜像 | `accent-r.svg` | `8030:31835`，`rotate-180` + `-scale-y` |
| 外翼右 | 镜像 | `chevron-r.svg` | `8030:31833` |

### 4.3 文案

| Token | Figma | 实现 |
|-------|-------|------|
| 文案 | 教师画像大数据看板 | 写死，勿读接口 |
| 字体 | PingFang SC Semibold | `font-family` 与详情页一致 |
| 字号 / 字重 | **20** / **600** | WEB/大标题 |
| 色 | `#FFFFFF` | 灰度/白色 |
| 行高 | 100%（normal） | |
| 对齐 | 水平垂直居中于中心牌区 | `absolute` + `translateX(-50%)`，稿面 `top: 6` 相对组 |

### 4.4 左右贯通线

| Token | Figma | 实现 |
|-------|-------|------|
| 线宽 | stroke **2**，opacity **0.7** | `line.svg` 或等价 CSS |
| 色 | `#28DCD1` → 透明渐变 | 右线向右淡出；左线镜像向左淡出 |
| 布局 | 中心组两侧各拉满剩余宽度 | flex / absolute，垂直对齐中心牌中线 |

### 4.5 页级间距（落地）

| Token | 约定 |
|-------|------|
| 页根顶 padding | 详情根现 `24px`；页头占位后保证中心牌视觉接近稿面「顶约 30」 |
| 页头 → 首行内容 | 页头底到 `__top-row` 间距对齐稿面（约 **30–40px** 量级，以整页截图核对） |
| 最大内容宽 | 与现 `__shell` 一致，横线与内容同宽 |

---

## 5. 交互与主题

- 无交互、无点击  
- `theme=model-1|2|3`：页头装饰资源本期不变；字色保持白  
- 加载 / 错误 / 空态：页头始终展示（不随数据态隐藏）  

---

## 6. 验收

1. 独立预览页顶部可见「教师画像大数据看板」装饰标题。  
2. 与 Figma `8030:31830` 截图对照：中心牌、翼形、左右线、字号色基本一致。  
3. DEV 数据态开关、各面板布局不被顶栏挤乱；窄屏可横向裁切/`overflow-x: clip` 与现 shell 一致。  
4. `pnpm harness:check` 本模块无新增阻断项。  
