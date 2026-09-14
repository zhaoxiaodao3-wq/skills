# H5 教师画像雷达图轮播切换 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标与背景

H5 端教师画像分享页（`teacher-profile`）的 A 类、B 类雷达图当前只展示单雷达图（基于教案与上课 / 基于教参与上课）。本次需求是把 web 端（`teacher-portrait`）已经实现的 A1/A2、B1/B2 子类型轮播切换 + 标签 + 圆点 + 动画能力，**适配到 H5 端**，保持 H5 竖排主要样式不变。

**核心成果：**

- A 类、B 类雷达图各支持子类型（A1↔A2 / B1↔B2）自动轮播切换
- 显示当前子类型标签（A1 / A2 / B1 / B2）
- 子类型 ≥2 时显示圆点指示器（dots），可点击或 hover 切换
- 切换过程有 crossfade 动画（淡入淡出）+ 圆点缩放动画
- hover 雷达图暂停轮播（PC）；移动端 touch 立即切换
- 接口字段与 web 端对齐：`a2DimensionScore` / `b2DimensionScore` / `dimensionScoreBySubtype.A2|B2`

## 2. 数据模型

### 2.1 新增类型（types）

```ts
// 新增子类型 key：A1/A2/B1/B2
export type ContentEvalSubtypeKey = 'A1' | 'A2' | 'B1' | 'B2'

// 子类型 ViewModel
export type ContentEvalSubtypeDimensionVm = {
  name: string
  score: number
  maxScore: number
  scoreText: string
}

export type ContentEvalSubtypeVm = {
  key: ContentEvalSubtypeKey
  label: string
  isEmpty: boolean
  dimensions: ContentEvalSubtypeDimensionVm[]
}
```

### 2.2 适配 `ClassroomContentEvalVm`

在 `ClassroomContentEvalVm` 上**新增**两个字段，**保留**原有 `categoryA.dimensions` / `categoryB.dimensions`（向后兼容）：

```ts
export type ClassroomContentEvalVm = {
  isEmpty: boolean
  reportCount: number
  categoryAReportCount: number
  categoryBReportCount: number
  categoryA: ContentEvalCategoryVm   // 现有
  categoryB: ContentEvalCategoryVm   // 现有
  gradeSummary: { ... }              // 现有
  scoreTrend: { ... }                // 现有
  // ⬇️ 新增
  dimensionSubtypesA: ContentEvalSubtypeVm[]
  dimensionSubtypesB: ContentEvalSubtypeVm[]
}
```

### 2.3 接口字段映射（与 web 端一致）

| 子类型 | H5 adapter 读取路径 | web 端对应字段（参考） |
|---|---|---|
| A1 | `aReport.dimensionScore` 或 `aReport.dimensionScoreBySubtype.A1` | `aggregate.classroomContentEval.dimensionScores.categoryA[0]` |
| A2 | `aReport.a2DimensionScore` 或 `aReport.dimensionScoreBySubtype.A2` | 同上第二个 |
| B1 | `bReport.dimensionScore` 或 `bReport.dimensionScoreBySubtype.B1` | ... |
| B2 | `bReport.b2DimensionScore` 或 `bReport.dimensionScoreBySubtype.B2` | ... |

子类型维度定义（与 web 端一致，复用）：

- **A1（基于教案与上课 6 维）**：`CATEGORY_A_DIMENSION_DEFS`
  - 思维启发度 25 / 节奏合理度 10 / 教案落实度 20 / 难点突破度 25 / 小结完整度 5 / 练习有效度 15
- **B1（基于教参与上课 6 维）**：`CATEGORY_B_DIMENSION_DEFS`
  - 思维启发度 20 / 节奏把控度 10 / 知识落实度 25 / 学生参与度 15 / 练习与反馈有效度 15 / 逻辑清晰度 15
- **A2 / B2（共用 5 维）**：`CATEGORY_2_DIMENSION_DEFS`
  - 知识掌握度 35 / 逻辑清晰度 25 / 导入设计 20 / 学生参与度 10 / 小结设计 10

### 2.4 标签文案

- 后端接口不返回 label，按本地 `ContentEvalSubtypeKey` 常量映射：
  - `A1` → "A1"
  - `A2` → "A2"
  - `B1` → "B1"
  - `B2` → "B2"
- 标签与 web 端保持一致；后续若需要中文长 label，可改由后端字段注入。

## 3. composable 设计（`useSubtypeCarousel`）

移植 web 端 `useSubtypeCarousel`，**API 与行为完全一致**，便于长期维护对位。

```ts
// src/pages/share/teacherProfile/composables/useSubtypeCarousel.ts
export type UseSubtypeCarouselOptions = {
  count: MaybeRefOrGetter<number>
  intervalMs?: number
}
export type UseSubtypeCarouselReturn = {
  index: Ref<number>
  pause: () => void
  resume: () => void
  goTo: (next: number) => void
  stop: () => void
}
```

行为契约：

- 默认 `intervalMs = 5000`
- `count <= 1` 时不轮播，`index` 固定为 0
- `pause` 不重置已累计时间；`resume` 不丢累积
- `goTo` 规范化 `next`（负数取模 / 超界回卷），并重置累计
- `watch(count, ..., { immediate: true })`：count 变化时若 index 越界则归零
- `onScopeDispose` 清理 timer

差异点（H5 适配）：

- 不依赖 `gsap`，纯 `setInterval` / `Date.now()`（与 web 端实现保持一致：web 端也只用 `setInterval`，gsap 只用于动画层）
- H5 端 `radarAWrapRef` / `radarBWrapRef` 使用 CSS transition 而非 gsap

## 4. 组件改造设计（`ClassroomContentEvalPanel.vue`）

### 4.1 模板结构（伪代码，差异段）

每个 radar-block 内部：

```vue
<div class="content-eval-panel__radar-block">
  <div class="content-eval-panel__radar-title-row">
    <span
      v-if="activeSubtypeA"
      class="content-eval-panel__type-tag content-eval-panel__type-tag--a"
    >{{ activeSubtypeA.label }}</span>
    <p class="content-eval-panel__radar-title content-eval-panel__radar-title--a">
      A类（基于教案与上课）
    </p>
  </div>
  <div
    ref="radarAWrapRef"
    class="content-eval-panel__radar-wrap"
    @mouseenter="carouselA.pause()"
    @mouseleave="carouselA.resume()"
  >
    <Transition name="tp-radar-fade" mode="out-in">
      <div
        :key="`a-${activeSubtypeA?.key}`"
        class="content-eval-panel__radar-chart-slot"
      >
        <MrEcharts :options="radarAOption" ... />
      </div>
    </Transition>
    <Transition name="tp-radar-fade" mode="out-in">
      <div
        v-for="(dimension, index) in activeDimensionsA"
        :key="`a-${activeSubtypeA?.key}-${dimension.name}`"
        class="content-eval-panel__radar-label"
        :class="radarLabelClass(index, activeDimensionsA.length)"
      >
        <p class="content-eval-panel__radar-dim-name">{{ dimension.name }}</p>
        <p class="content-eval-panel__radar-dim-score">...</p>
      </div>
    </Transition>
  </div>
  <div
    v-if="countA > 1"
    ref="dotsARef"
    class="content-eval-panel__dots"
    role="tablist"
    aria-label="A类子类型"
  >
    <button
      v-for="(subtype, index) in subtypesA"
      :key="subtype.key"
      type="button"
      data-dot
      class="content-eval-panel__dot"
      :class="{ 'content-eval-panel__dot--active': index === carouselA.index.value }"
      :aria-label="`切换到 ${subtype.label}`"
      :aria-selected="index === carouselA.index.value"
      @click="carouselA.goTo(index)"
    />
  </div>
</div>
```

### 4.2 行为

- `useSubtypeCarousel({ count: computed(() => subtypesA.length), intervalMs: 5000 })` 同理 A/B 两个
- `activeSubtypeA = computed(() => subtypesA[carouselA.index.value] ?? subtypesA[0] ?? null)`
- `activeDimensionsA = computed(() => activeSubtypeA.value?.dimensions ?? data.categoryA.dimensions)`
- `radarAOption` 用 `activeDimensionsA` 计算（已是 computed，关联到 `activeSubtypeA.key`）
- `watch(carouselA.index, ...)` 触发 `animateDots()`（CSS class 切换即可，不必 gsap）

### 4.3 空态 / 边界

- `countA === 0`：`activeSubtypeA = null`，不渲染 label/tag/dots；保留 radar-block 容器，避免布局跳动（用 skeleton 占位）
- `countA === 1`：渲染当前子类型；不渲染 dots
- `isEmpty === true`：标签仍显示（用户可感知"当前是空态"），但 dot/label 内容为 0
- 后端 `dimensionScores` 全部为空时（subtypes 均为空）：落到现有 `dimensionsA` 旧字段降级（与 web 端 `normalizeDimensionSubtypes` 行为一致）

## 5. 样式对照（Figma）

> Figma 原始节点 8785-61536（web 端，含切换动效）需 Figma 登录；本次取数依据：
> 1. web 端已实现 `ClassroomContentEvalView.vue`（Figma 节点 6696:12987 / 6696:20326）
> 2. H5 端现有 `ClassroomContentEvalPanel.vue`（Figma 节点 7485:14625 / 14642 / 14681 / 14743）
> 3. 颜色与 web 端一致：`#027AFF`（A 类蓝）/`#00BCBC`（B 类青）

### 5.1 子类型标签 `type-tag`

| 属性 | H5 端取值 | web 端取值 | 来源 |
|---|---|---|---|
| 字号 | 12px | 12px | 对齐 web（取 Figma 6696:12987 标题字号 12） |
| 字重 | 500 | 500 | Medium 标签订位 |
| 行高 | 16px | 16px | 与 12px 文字统一 4 倍网格 |
| 颜色（A 类） | #027AFF | #027AFF | 与类别色一致 |
| 颜色（B 类） | #00BCBC | #00BCBC | 同上 |
| 背景 | #fff | rgba(255,255,255,0.9) | H5 实色更稳定，避免移动端半透明叠加难辨 |
| 边框 | 1px solid 当前类色 | 1px solid 当前类色 | 一致 |
| 圆角 | 4px | 4px | 一致 |
| 内边距 | 2px 6px | 2px 8px | H5 收紧，避免文字过宽影响竖排 |
| 位置 | 雷达图标题行左上方 | 雷达图标题行左侧 | 一致 |

### 5.2 圆点指示器 `dots`

| 属性 | H5 端取值 | web 端取值 | 来源 |
|---|---|---|---|
| 容器高度 | 16px | 16px | Figma 6696:12987 dots 高度 |
| 圆点尺寸（静态） | 8×8 px | 10×10 px | H5 端 rem 缩放下偏小更精致 |
| 圆点尺寸（active） | 16×8 px（横长条） | 20×10 px | web 用 GSAP 动画；H5 用 CSS transition，缩放更轻 |
| 圆点颜色（静态） | #e5e6eb | #e5e6eb | 一致 |
| 圆点颜色（active A） | #027AFF | #027AFF | 一致 |
| 圆点颜色（active B） | #00BCBC | #00BCBC | 一致 |
| 圆点间距 | 6px | 6px | Figma 6696:12987 间距 |
| 容器位置 | 雷达图下方居中 | 雷达图下方居中 | 一致 |
| 容器 padding | 6px 0 | 0 | H5 加 padding 增大可点击热区 |

### 5.3 雷达图切换动画

| 属性 | H5 端取值 | web 端取值 | 来源 |
|---|---|---|---|
| 动画类型 | CSS `opacity` transition | GSAP `fromTo opacity 0.35→1` | 轻量化方案 |
| 动画时长 | 320ms | 380ms | 移动端略快 |
| 缓动 | `ease` | `power2.out` | 标准 ease 即可 |
| 触发条件 | Vue `<Transition mode="out-in">` key 变化 | gsap `nextTick` 后调用 | H5 用 Vue 声明式更稳 |
| dots 动画 | CSS `width` + `background-color` transition 220ms | GSAP `power2.inOut` 450ms | H5 略快 |

### 5.4 保留的 H5 端关键尺寸（不改变）

- 雷达图坐标系：`278px × 252px`，图区 `138px × 160px @ (70,46)`（Figma 7485:14743）
- 类别卡圆角：4px（外）/ 8px（标题底）（Figma 7485:14642/14681）
- 类别色：A 类 `#027AFF` / B 类 `#00BCBC`（含 hover 衍生色 `#80bcff` / `#80e8e8`）
- donut 图 100×100（移动端略小于 web 的 120×120）

## 6. 验收项

- [ ] `adapt-classroom-content-eval.ts` 输出包含 `dimensionSubtypesA: ContentEvalSubtypeVm[]` 和 `dimensionSubtypesB: ContentEvalSubtypeVm[]`
- [ ] A1/A2、B1/B2 子类型能从接口 `aReport.dimensionScoreBySubtype` 或 `a2DimensionScore` 正确解析
- [ ] 旧字段 `categoryA.dimensions` / `categoryB.dimensions` 仍保留（向后兼容，不删除）
- [ ] `useSubtypeCarousel` composable 文件存在，导出 API 与 web 端一致
- [ ] `ClassroomContentEvalPanel.vue` 显示子类型标签（A1/A2/B1/B2）
- [ ] `ClassroomContentEvalPanel.vue` 在子类型 ≥2 时显示圆点指示器
- [ ] 圆点 active 态高亮 A 类蓝 / B 类青
- [ ] 5s 自动切换；hover 雷达图区域暂停；离开恢复
- [ ] 点击圆点立即切换
- [ ] 切换有淡入淡出动画（≤400ms）
- [ ] 移动端 touch 行为不依赖 hover
- [ ] 单一子类型（count === 1）不显示圆点
- [ ] 空数据态（isEmpty === true）不崩，雷达图正常显示 0 值
- [ ] H5 端面板整体样式不改变：竖排布局、donut、legend、grade-card、score-trend 完全保持
- [ ] 不引入新依赖
- [ ] TypeScript `pnpm typecheck` 通过
- [ ] `pnpm harness:check` 无本模块警告
