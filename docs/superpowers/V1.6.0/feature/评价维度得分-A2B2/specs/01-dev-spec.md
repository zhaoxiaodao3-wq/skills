# 评价维度得分 A2B2 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Figma 节点：** `8785:61536`（评价维度得分面板）  
**关联路径：** `src/pages/school/teacher-portrait/components/classroom-content-eval/`

## 1. 目标

在教师画像「评价维度得分」双雷达区支持 A1/A2、B1/B2 子类型：数据一并适配，大类内轮播展示，类型标签 + 可点指示条，切换动画丝滑；A2/B2 为五维五边形；接口未就绪时用 mock。

**非目标：** 环形图等级卡、各等级汇总、得分趋势面板逻辑与样式变更。

## 2. 数据与适配

### 2.1 子类型与维度常量

| 子类型 | 轴数 | 维度来源 |
|--------|------|----------|
| A1 | 6 | 现有 `CATEGORY_A_DIMENSION_DEFS`（不变） |
| B1 | 6 | 现有 `CATEGORY_B_DIMENSION_DEFS`（不变） |
| A2 / B2 | 5 | 新常量 `CATEGORY_2_DIMENSION_DEFS`（A2/B2 共用） |

A2/B2 五维（名称 → 建议 API key → 满分）：

| 名称 | key（建议） | maxScore |
|------|-------------|----------|
| 知识落实度 | `knowledgeImplementation` | 35 |
| 逻辑清晰度 | `logicalClarity` | 25 |
| 导入设计 | `introductionDesign` | 20 |
| 学生参与度 | `studentEngagement` | 10 |
| 小结设计 | `summaryDesign` | 10 |

> 真接口字段名若不同，仅改常量 key / VO，不改展示名与满分。

### 2.2 VO / Slice 形状（工程约定）

- 大类 `aReport` / `bReport` 的 `levelStat`、`totalCount` **不随子类型轮播**（仍按大类汇总）。
- 维度得分扩展为「子类型列表」，推荐适配产物：

```ts
type DimensionSubtypeKey = 'A1' | 'A2' | 'B1' | 'B2'

type DimensionSubtypeSlice = {
  key: DimensionSubtypeKey
  label: string // 'A1' | 'A2' | …
  dimensions: ClassroomContentEvalDimensionItem[]
}

// slice.dimensionScores
{
  categoryA: DimensionSubtypeSlice[] // 按可用性排序，如有则 [A1, A2]
  categoryB: DimensionSubtypeSlice[]
}
```

- **兼容：** 若仅有旧字段 `dimensionScore`（无子类型），映射为单元素 `[A1]` / `[B1]`。
- **Mock：** 在 `teacher-profile-api.mock.ts` 的 `postClassReport` 中同时提供 A1+A2、B1+B2（A2/B2 用五维假分，分值拉开便于辨认五边形）。

### 2.3 ViewModel

Container 将 slice 转为 View 所需：每侧 `subtypes[]`、当前索引由轮播 composable 驱动；标题文案：

- A：`A类【基于教案与上课】` + 标签色 `#027AFF` / 标签底 `#F3F9FF`
- B：`B类【基于教材与上课】`（完整「基于」，不跟稿缺字）+ 标签色 `#00BCBC` / 标签底 `#EFFCFC`

## 3. 交互与轮播

### 3.1 `useSubtypeCarousel`（或等价 composable）

输入：`subtypeCount`、`intervalMs = 5000`、可选 `paused`（hover）。

规则：

1. `subtypeCount ≤ 1`：不启动计时、不渲染指示条（或隐藏）。
2. 仅在 **未 pause** 时累计已停留时间；pause 不重置累计。
3. 累计 ≥ `intervalMs` → `index = (index + 1) % count`，累计清零，触发切换回调。
4. 用户点击指示条：立即切到目标 index，累计清零后重新计时（仍受 pause 约束）。
5. A、B **各 new 一实例**，禁止共用同一 timer。

Hover 命中区：该侧雷达图包裹层（含轴标签区域），与指示条分离——点指示条不算「图表 hover 暂停」的永久占用（点击瞬间切页即可）。

### 3.2 动画

- 依赖：新增 `gsap`（项目当前未安装）。
- **图表区：** 子类型切换时内容 crossfade（约 300–450ms，ease 偏 out）；雷达 `setOption` 可配合短暂 opacity。
- **指示条水滴：** 选中条宽 20×高 4、未选 10×4、圆角 20；切换时用 GSAP 对「活动滑块」做 width/x morph（水滴感），颜色随大类（A `#027AFF` / B `#00BCBC`）。
- **指示条 hover（未选中）：** 宽度略增（如 10→14）或亮度加深，过渡短（≤200ms）；选中态 hover 可保持或轻微亮度变化。
- `prefers-reduced-motion`：缩短/关闭 morph，瞬时切页。

## 4. UI 结构（相对现状增量）

每侧雷达块：

```
[类型标签 A1/A2] 大类标题
[雷达 + 轴标签]  ← hover 暂停区；轴数随当前子类型 6 或 5
[指示条 dots]   ← 可点；仅 subtypeCount > 1 显示
```

雷达构建：复用/扩展 `buildClassroomContentEvalRadarOption`，按当前 `dimensions.length` 生成轴（5 或 6），颜色仍按 A/B 主题。

## 5. 样式对照（Figma）

**节点：** `8785:61536`（含 A 侧 `8785:61540`、B 侧 `8785:61585`）  
**取值方式：** Figma MCP `get_design_context` + 节点元数据

| 类别 | Token / 规则 | 值 |
|------|----------------|-----|
| 面板边框 | border | `1px solid #E5E6EB`，圆角 `8px` |
| 面板内边距 | padding | 水平 `16px`，底 `16px`；标题条与内容 gap ≈ `10px` |
| 标题条 | 背景 / 字 | 底 `#F2F3F5`，顶边 `#E5E6EB`，高 `30px`，字 14px Semibold `#333`，左右 pad `20px`，底圆角 `8px` |
| A 类型标签 | 底 / 字 / 高 / 圆角 / 水平 pad | `#F3F9FF` / `#027AFF` Medium 12px / `24px` / `4px` / `10px` |
| A 大类标题 | 字 | 14px Semibold `#027AFF`；与标签 gap `10px` |
| B 类型标签 | 底 / 字 | `#EFFCFC` / `#00BCBC`（其余同 A 标签尺寸） |
| B 大类标题 | 字 | 14px Semibold `#00BCBC`；文案用「基于教材」 |
| 维度名 | 字 | 12px Regular `#777` |
| 得分 | 字 | 14px Semibold `#333` + `/max` Regular `#777` 14px；名与分 gap `4px` |
| 雷达区 | 示意尺寸 | 图约 `112×130`；标签列宽约 `60`（沿用现有布局比例可微调） |
| 指示条选中 | 尺寸 / 色 | `20×4`，圆角 `20`；A `#027AFF` / B `#00BCBC` |
| 指示条未选中 | 尺寸 / 色 | `10×4`，圆角 `20`，`#E5E6EB` |
| 指示条间距 | gap | `4px` |
| 左右栏 | gap | `10px`；栏内标题→图→指示垂直 gap `15px` |

**稿差说明：** 稿面两侧雷达维度文案仍为六维占位；**实现以需求五维为准**（A2/B2 五边形）。指示条 hover 态稿中未单独出框，按 §3.2 补齐。

## 6. 验收标准

- [x] A1/B1 维度名、满分、六边形样式与改前一致，且显示类型标签
- [x] A2/B2 为五维五边形，维度与满分符合 §2.1
- [x] 未 hover 累计 5s 自动切子类型；hover 暂停累计、移出后续计；A/B 计时互不影响
- [x] 点击指示条可切换，活动条有丝滑宽度/位置过渡（水滴感）
- [x] 指示条具备选中 / 未选中 / hover 可区分状态
- [x] 仅一侧或缺子类型时不错误轮播；单子类型隐藏指示条
- [x] mock 可同时演示 A1↔A2、B1↔B2
- [x] 环形图、等级汇总、得分趋势无回归

## 7. 主要改动面（实现阶段）

| 区域 | 路径（预期） |
|------|----------------|
| VO / mock | `api/types/teacher-profile-rsp.vo.ts`、`mock/teacher-profile-api.mock.ts` |
| 常量 / adapter / slice | `adapters/constants/content-eval-dimensions.ts`、`classroom-content-eval.adapter.ts`、`types/aggregate.ts` |
| 轮播 | 新 composable（如 `composables/useSubtypeCarousel.ts`） |
| UI / 图 | `ClassroomContentEvalView.vue`、`Container.vue`、`types.ts`、`chart-options.ts` |
| 动画依赖 | `package.json` 增加 `gsap` |

## 8. 风险与依赖

- 真接口子类型字段名未定：mock + 适配层兼容旧 `dimensionScore`；字段对齐时只改 VO/adapter。
- GSAP 体积：仅本面板指示条与切换使用，按需 import。
- ECharts 五轴与六轴标签定位：现有绝对定位类按 index 绑定，五维时需校验/调整标签 class 映射。
