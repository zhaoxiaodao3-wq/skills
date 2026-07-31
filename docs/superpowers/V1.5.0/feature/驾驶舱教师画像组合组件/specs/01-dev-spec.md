# 驾驶舱教师画像组合组件 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 关联调研：[02-调研拆解.md](../requirements/02-调研拆解.md) · [03-补充需求收敛.md](../requirements/03-补充需求收敛.md)

## 1. 目标与范围

在 `apps-development-platform/apps/data-cockpit` 新增大屏组合组件：

| 项 | 值 |
|----|-----|
| identifier | `teacher-portrait-1` |
| 目录 | `src/views/preview/mr-teacher-portrait-1/` |
| 形态 | **一个**上架组件，内部由多个子组件拼接 |
| 本期主题 | model-1（风格一）；预留 model-2/3 切换（`theme` 统一下发） |
| 不含 | 驾驶舱顶栏 Tab、右上学年按钮（由模板其它 cmpnt 提供） |

**有数据 Figma：** [8048-37563](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8048-37563&m=dev)  
**空状态 Figma：** [8048-36733](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8048-36733&m=dev)

## 2. 架构

```
mr-teacher-portrait-1/
  mr-teacher-portrait-1.vue          # 壳：布局、theme、props 透传
  mr-teacher-portrait-1.scss
  mr-teacher-portrait-1.model.ts
  constants/                         # 20 风格、等级、标签枚举、科目
  utils/                             # 排序、占比截断、头像 URL
  mock/                              # 各子块独立 Mock + 空态场景
  components/
    kpi-strip/
    style-distribution-panel/        # ECharts
    teacher-list-panel/
    teacher-card/
    tag-panel/                       # 自定义条形+头像（非 ECharts）
    subject-style-heatmap/           # ECharts heatmap
    shared/
      panel-chrome/
      empty-state/
      teacher-avatar/
```

**适配（与项目图表样式规范一致）：**

- 根节点 `width/height: 100%`；外层 `restore-datav` 负责拖放宽高
- SCSS 用 **px**（构建转 rem）；禁止组件内整页 `transform:scale`、禁止 `vw/vh`
- 中三栏：**定高 + `min-height:0` + 各自内部滚动**
- ECharts：`ResizeObserver` → `resize()`；热力交互参考 HTML demo

**主题：** 壳接收 `theme`（`model-1|model-2|model-3`），向子组件下发；model-2/3 以 class / CSS 变量预留，本期视觉还原 model-1。

## 3. 子组件规格

### 3.1 数据汇总 `kpi-strip`

| 字段 | 说明 |
|------|------|
| 已分析教师总人数 | 数值色 `#0BAAFF` |
| 风格类型数 | `n/20`，主色 `#28DCD1`，分母 `#DBFAFF` |
| 男教师 | `#A3DC20` |
| 女教师 | `#FF714B` |
| 科目种类 | `#FAF616` |

- 图标：优先 SVG，否则本地资源
- 空态（整包无内容）：`--` / `-/20`（对齐空态稿）

### 3.2 风格类型分布 `style-distribution-panel`（ECharts）

- **20 种**「主导+辅助」组合全量展示
- **排序：** 人数降序 → 主导风格等级降序 → 辅助风格等级降序  
  等级高→低：严厉规训型 → 权威传授型 → 激情讲授型 → 理性启发型 → 温暖引导型
- 双色堆叠条：男 `#A3DC20`、女 `#FF714B`；轨道 `rgba(40,220,209,0.2)`
- Hover tooltip：风格类型、男、女、合计、占比（**一位小数截断**，非四舍五入）
- 有结构但人数为 0：仍展示 20 行（如 `0人`）
- 接口不返回任何内容：空态组件

### 3.3 教师列表 `teacher-list-panel`

**筛选（仅影响本列表）：**

| 条件 | 控件 | 默认 |
|------|------|------|
| 姓名 | `el-input`，占位「搜索姓名」 | 空 |
| 科目 | `el-select` 单选 | 全部；选项=主要科目 +「无」（Mock） |
| 性别 | `el-select` | 全部 / 男 / 女 |
| 风格类型 | 多选标签区 | 不选；选项=20 组合 |

- **重置**：恢复默认并刷新列表
- **查询**：仅请求/过滤教师列表 Mock；其它子块独立数据源
- 卡片：头像、姓名、性别、学科、主导+辅助；hover 略放大+边框置亮
- 头像：优先接口 URL；否则按 `resolveTeacherStylePortraitUrlFromFields` / OSS 规则（可移植逻辑到 data-cockpit `utils`，不跨仓库硬依赖）
- 查无结果 / 接口无内容：空态

### 3.4 个人标签 `tag-panel`（自定义，非 ECharts）

- Tab：话语特色（9）/ 情感风格（5）/ 权力关系（5）；**无学科适配**
- 枚举与排序同「个人标签云」文档：数量↓ → 等级序号↑；**数量为 0 不隐藏该条**
- 每条：标题 + 进度条 + 数字 + **最多 3** 教师头像姓名
- 动画：入场进度 0→目标；数据变更时进度平滑过渡（约 400–600ms ease-out）；数字可同步计数
- 头像 hover：放大+描边
- **空态条件：** 仅当接口**不返回任何内容**；有结构含 0 值仍画条。Mock 必须覆盖这两种场景

### 3.5 学科风格类型人次分布 `subject-style-heatmap`（ECharts）

- 横轴：科目列表（Mock，顺序按「库中记录」约定）
- 纵轴：20 组合，**固定序=用户附图（图 1）**（按主导风格分组：严厉规训…温暖引导）
- 值为科目×风格组合人次；视觉对齐 Figma；交互参考 `teacher-style-dashboard.html`（tooltip、emphasis 光晕、visualMap）
- 有矩阵（可含 0）正常绘制；无内容 → 空态

## 4. 数据与 Mock

- 各子块**独立** Mock（KPI / 风格分布 / 列表 / 标签 / 热力）
- 列表查询与重置只刷新列表
- Mock 场景至少：`full`（有数据）、`empty`（整包无内容）、标签/分布的 `with-zeros`（结构在、值为 0）
- 接口路径本期可占位，字段名尽量贴近未来契约

## 5. 工程约束

- Vue 3 `<script setup lang="ts">` + SCSS scoped；Element Plus 优先
- `vue`/`vue-router` Auto Import；HTTP 用 `@miray/utils` `request`
- 画布默认尺寸：用 `sync-figma-canvas-size.mjs` 写入（整模块内容区外框，不含驾驶舱顶栏时以 KPI+中+底外框为准）
- 图标：能 SVG 则 SVG，否则下载到 `src/assets`

## 6. 验收标准

- [ ] `restore-datav` 可通过 identifier `teacher-portrait-1` 渲染组合件
- [ ] 五子块职责、空态/有数据（含 0 不隐藏）符合本规格与双 Figma
- [ ] 风格分布排序、tooltip 占比截断正确
- [ ] 教师列表筛选/重置/查询隔离正确；头像回退规则正确
- [ ] 标签面板：枚举条数正确、0 不隐藏、无内容时空态、进度动画丝滑
- [ ] 热力坐标与交互对齐稿 + HTML demo 意图
- [ ] 拖放改容器大小时布局不崩、ECharts 正常 resize
- [ ] `theme` 可切换 class（model-2/3 可先空样式）
- [ ] Mock 覆盖 full / empty / with-zeros

## 7. 样式对照（Figma）

> 取值来源：Figma MCP `get_design_context`（节点 `8048:37626` KPI、`8048:37661` 风格分布等）+ 空态稿 `8048:36733` 截图对照。本期 model-1。

| 类别 | Token / 规则 | 值 | Figma 节点 |
|------|--------------|-----|------------|
| 字色主 | 驾驶舱字色 | `#DBFAFF` | 8048:37632 等 |
| 面板标题 | 16px Semibold 白 | `#FFFFFF` / 16px / 600 | 8048:37664 |
| KPI 数值 | 30px Semibold | 各卡色见 §3.1 | 8048:37631… |
| KPI 标签 | 14px Regular | `#DBFAFF` | 8048:37632 |
| KPI 卡边 | 描边 | `#FAAD14`，圆角 6px，内衬 4px | 8048:37627 |
| KPI 卡高 | 内容区 | 约 90px 行高（外框 1860×90） | 8048:37626 |
| KPI 间距 | 卡间隙 | 20px | 8048:37626 gap |
| 辅助字 | 12px Regular | `#DBFAFF` | 8048:37671 |
| 男色 | class/草绿 | `#A3DC20` | 条/男 |
| 女色 | class/claude | `#FF714B` | 条/女 |
| 青强调 | class/青色 | `#28DCD1` | 占比、滚动条、进度 |
| 天蓝 | class/天蓝 | `#0BAAFF` | 合计、人数 KPI |
| 条轨道 | — | `rgba(40,220,209,0.2)`，条高 20px | 8048:37672 |
| 行间距 | — | 约 8px | 8048:37669 gap |
| Tooltip | 底/边 | `rgba(13,30,58,0.75)` / `rgba(40,220,209,0.2)`，圆角 8px，padding 10px | 8048:37824 |
| 中栏列宽 | 左/中/右 | 356 / 1108 / 356（总 1860，高 685） | 8048:37660 |
| 标题条高 | — | 32px | 8048:37662 |
| 空态 | — | 星球插画 +「暂无数据」 | 8048:36733 |

实现时以 Dev Mode 测量微调间距；色值以上表为准。
