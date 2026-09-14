# H5 教师画像雷达图轮播切换 · 实施计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 0. Skill 路由标注（Mode A）

> 由 `node .agents/routing/router.mjs --annotate` 输出 + 人工复核。

| Task | Skill | 置信度 | 触发理由 | 风险 |
|---|---|---|---|---|
| T1 新增 `useSubtypeCarousel.ts` | （无） | — | 纯组合式 API 移植，逻辑直接照搬 web 端 | low |
| T2 改 `adapt-classroom-content-eval.ts` 类型 + 字段 | `api-ui-mapping` | 0.85 | 涉及接口字段 → VM 字段的精准映射 | low |
| T3 改 `adapt-classroom-content-eval.ts` 解析逻辑 | `api-ui-mapping` | 0.85 | 字段映射、兼容 `dimensionScoreBySubtype` 嵌套结构 | low |
| T4 改 `ClassroomContentEvalPanel.vue` 脚本 | `vue-skills` | 0.9 | Vue 3 `<script setup>`、computed/watch/Transition 模式 | low |
| T5 改 `ClassroomContentEvalPanel.vue` 模板 | `vue-skills` | 0.9 | Vue 3 template 条件渲染、key 切换 | low |
| T6 改 `ClassroomContentEvalPanel.vue` 样式 | `frontend-design`、`improve-animations` | 0.85 | 圆点 active 缩放 / 子类型标签 / CSS transition | low |
| T7 ECharts 雷达图 option 重构 | `echarts` | 0.9 | `MrEcharts` 响应式 option、ECharts 雷达图 fade-in 动画 | low |
| T8 校验 | `superpowers-harness` | 1.0 | `pnpm harness:check` 门禁 | low |

风险等级说明：本计划所有 Task 风险均为 `low`，无 `high`，不触发额外人工暂停。

## 1. 任务拆分

每个 Task 2~5 分钟，含具体文件路径与代码片段。

### T1. 新增 composable（5min）

**文件**：`E:/code/H5/src/pages/share/teacherProfile/composables/useSubtypeCarousel.ts`（**新建**）

**操作**：从 `E:/code/frontend/src/pages/school/teacher-portrait/composables/useSubtypeCarousel.ts` 移植 1:1，仅 import 路径改为 H5 的 `@/pages/.../composables`（H5 已有 `composables/` 目录，参见 `composables/useWxShare.ts` 风格）。

**片段**：

```ts
// composables/useSubtypeCarousel.ts
import { computed, onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

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

export function useSubtypeCarousel(
  options: UseSubtypeCarouselOptions,
): UseSubtypeCarouselReturn {
  // 全文 1:1 移植 web 端实现（115 行）
  // 行为契约：5s 自动 / hover pause 不重置 / goTo 规范化 / onScopeDispose 清理
  // （与 web 端文件同源代码，仅路径变化）
}
```

**校验**：

- TS 编译通过（`pnpm typecheck`）

---

### T2. 改 adapter 类型（3min）

**文件**：`E:/code/H5/src/pages/share/teacherProfile/adapters/adapt-classroom-content-eval.ts`（**改**）

**操作**：在文件顶部 `ContentEvalDimensionVm` 之后增加 3 个类型，并把 `ClassroomContentEvalVm` 增补 `dimensionSubtypesA` / `dimensionSubtypesB` 字段。

**片段**：

```ts
// 新增
export type ContentEvalSubtypeKey = 'A1' | 'A2' | 'B1' | 'B2'

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

// 改造 ClassroomContentEvalVm
export type ClassroomContentEvalVm = {
  // ... 现有字段保留 ...
  scoreTrend: { isEmpty: boolean, reports: ScoreTrendItemVm[] }
  // ⬇️ 新增
  dimensionSubtypesA: ContentEvalSubtypeVm[]
  dimensionSubtypesB: ContentEvalSubtypeVm[]
}
```

---

### T3. 改 adapter 解析逻辑（8min）

**文件**：`E:/code/H5/src/pages/share/teacherProfile/adapters/adapt-classroom-content-eval.ts`（**改**）

**操作**：

1. 新增常量 `CATEGORY_2_DIMENSION_DEFS`（5 维：知识掌握度 35 / 逻辑清晰度 25 / 导入设计 20 / 学生参与度 10 / 小结设计 10）
2. 抽取 `CATEGORY_A_DIMENSION_DEFS` / `CATEGORY_B_DIMENSION_DEFS` 为顶层导出（当前是模块内 const），方便复用
3. 新增辅助函数：
   - `hasAnyDimensionScore(raw: unknown): boolean` - 判断对象是否至少有一个非空字段
   - `buildSubtype(key, dimensionScore, defs): ContentEvalSubtypeVm` - 构造一个子类型
   - `buildEmptySubtype(key, defs): ContentEvalSubtypeVm` - 构造空态子类型
   - `adaptCategorySubtypes(category, aReportOrBReport, dimensionScore, dimensionScoreBySubtype, type2FromApi): ContentEvalSubtypeVm[]`
4. 在 `adaptClassroomContentEval` 主函数返回前调 `adaptCategorySubtypes` 把 subtypes 装入 `dimensionSubtypesA` / `dimensionSubtypesB`
5. 空态分支同样返回 4 个子类型占位（[A1, A2, B1, B2] 全 0 维度）

**片段**：

```ts
const CATEGORY_2_DIMENSION_DEFS = [
  { key: 'knowledgeMastery', name: '知识掌握度', maxScore: 35 },
  { key: 'logicalClarity', name: '逻辑清晰度', maxScore: 25 },
  { key: 'introductionDesign', name: '导入设计', maxScore: 20 },
  { key: 'studentEngagement', name: '学生参与度', maxScore: 10 },
  { key: 'summaryDesign', name: '小结设计', maxScore: 10 },
] as const

// 字段读取（与 web 端对齐）
function readSubtypeScore(
  category: 'A' | 'B',
  report: PostClassReportDetail | undefined,
  subtypeKey: 'A1' | 'A2' | 'B1' | 'B2',
): Record<string, unknown> | null {
  if (!report) return null
  const bySubtype = (report as any).dimensionScoreBySubtype
  if (bySubtype && typeof bySubtype === 'object') {
    const v = bySubtype[subtypeKey]
    if (v && typeof v === 'object') return v as Record<string, unknown>
  }
  if (subtypeKey === 'A1') return (report as any).dimensionScore ?? null
  if (subtypeKey === 'B1') return (report as any).dimensionScore ?? null
  if (subtypeKey === 'A2') return (report as any).a2DimensionScore ?? null
  if (subtypeKey === 'B2') return (report as any).b2DimensionScore ?? null
  return null
}

function adaptCategorySubtypes(
  category: 'A' | 'B',
  report: PostClassReportDetail | undefined,
  isPanelEmpty: boolean,
): ContentEvalSubtypeVm[] {
  const type1Key: ContentEvalSubtypeKey = category === 'A' ? 'A1' : 'B1'
  const type2Key: ContentEvalSubtypeKey = category === 'A' ? 'A2' : 'B2'
  const type1Defs = category === 'A' ? CATEGORY_A_DIMENSION_DEFS : CATEGORY_B_DIMENSION_DEFS

  const type1Score = readSubtypeScore(category, report, type1Key)
  const type1 = buildSubtype(type1Key, type1Score, type1Defs, isPanelEmpty)

  const type2Score = readSubtypeScore(category, report, type2Key)
  const type2 = buildSubtype(type2Key, type2Score, CATEGORY_2_DIMENSION_DEFS, isPanelEmpty)

  // 容错：若 type1 缺失（接口完全无字段），用现有 dimensions 降级
  const fallback = type1 ?? buildSubtype(
    type1Key,
    isPanelEmpty ? null : ((report as any)?.dimensionScore ?? null),
    type1Defs,
    isPanelEmpty,
  )

  return [fallback, type2]
}
```

`PostClassReportDetail` 类型扩展（adapter 内部）：

```ts
type PostClassReportDetail = {
  totalCount?: number
  levelStat?: LevelStat
  dimensionScore?: Record<string, unknown>
  dimensionScoreBySubtype?: { A1?: any; A2?: any; B1?: any; B2?: any }
  a2DimensionScore?: Record<string, unknown> | null
  b2DimensionScore?: Record<string, unknown> | null
}
```

---

### T4. 改 panel 脚本部分（5min）

**文件**：`E:/code/H5/src/pages/share/teacherProfile/components/ClassroomContentEvalPanel.vue`（**改**）

**操作**：

1. import 新增的 `useSubtypeCarousel` 和 `ContentEvalSubtypeVm` 等类型
2. 提取 `data` 的 `dimensionSubtypesA` / `dimensionSubtypesB` 为 computed
3. 实例化 `carouselA` / `carouselB`
4. 计算 `activeSubtypeA` / `activeSubtypeB`、`activeDimensionsA` / `activeDimensionsB`
5. `radarAOption` / `radarBOption` 改用 `activeDimensions*`（关联到 `activeSubtype.key` 自动响应）
6. 增加 `watch` 触发 dots 状态切换（用 class 而非 gsap）

**片段**：

```ts
import { useSubtypeCarousel } from '../composables/useSubtypeCarousel'

const subtypesA = computed(() => props.data.dimensionSubtypesA ?? [])
const subtypesB = computed(() => props.data.dimensionSubtypesB ?? [])
const countA = computed(() => subtypesA.value.length)
const countB = computed(() => subtypesB.value.length)

const carouselA = useSubtypeCarousel({ count: countA, intervalMs: 5000 })
const carouselB = useSubtypeCarousel({ count: countB, intervalMs: 5000 })

const activeSubtypeA = computed(() => subtypesA.value[carouselA.index.value] ?? subtypesA.value[0] ?? null)
const activeSubtypeB = computed(() => subtypesB.value[carouselB.index.value] ?? subtypesB.value[0] ?? null)

const activeDimensionsA = computed(() => activeSubtypeA.value?.dimensions ?? props.data.categoryA.dimensions)
const activeDimensionsB = computed(() => activeSubtypeB.value?.dimensions ?? props.data.categoryB.dimensions)

const radarAOption = computed(() =>
  buildClassroomContentEvalRadarOption(
    activeDimensionsA.value,
    '#027AFF', 'rgba(2,122,255,0.2)',
    activeSubtypeA.value?.isEmpty ?? props.data.isEmpty,
    RADAR_ZEBRA_A, remScale.value,
  ),
)
// radarBOption 同理
```

---

### T5. 改 panel 模板部分（8min）

**文件**：`E:/code/H5/src/pages/share/teacherProfile/components/ClassroomContentEvalPanel.vue`（**改**）

**操作**：在两个 radar-block 内：

1. `radar-title` 之上加 `type-tag`（`v-if="activeSubtype"`）
2. `radar-wrap` 内的 `radar-chart-slot` 和 `radar-label` 套 `<Transition name="tp-radar-fade" mode="out-in">`，key 绑定到 `activeSubtype.key + dimension.name`
3. `radar-block` 底部加 `dots` 圆点（`v-if="count > 1"`），每点 `:class="{...is-active...}"`，点击调 `goTo`
4. `radar-wrap` 加 `@mouseenter` / `@mouseleave` 触发 `pause` / `resume`

**片段**：

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
      <div :key="`a-${activeSubtypeA?.key}-chart`" class="content-eval-panel__radar-chart-slot">
        <MrEcharts
          class="content-eval-panel__chart-fill"
          :options="radarAOption"
          :clip-content="false"
          width="100%"
          height="100%"
        />
      </div>
    </Transition>
    <Transition name="tp-radar-fade" mode="out-in">
      <div
        v-for="(dimension, index) in activeDimensionsA"
        :key="`a-${activeSubtypeA?.key}-${dimension.name}`"
        class="content-eval-panel__radar-label"
        :class="getRadarLabelClass(index, activeDimensionsA.length)"
      >
        <p class="content-eval-panel__radar-dim-name">{{ dimension.name }}</p>
        <p class="content-eval-panel__radar-dim-score">
          <span class="content-eval-panel__radar-score">{{ dimension.scoreText }}</span>
          <span class="content-eval-panel__radar-max">/{{ dimension.maxScore }}</span>
        </p>
      </div>
    </Transition>
  </div>
  <div
    v-if="countA > 1"
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

**新增 5 维 / 6 维双套 label class 工具**（panel 已有 6 维的 RADAR_LABEL_CLASSES，新增 5 维分支）：

```ts
const RADAR_LABEL_CLASSES_6 = RADAR_LABEL_CLASSES // 现有 6 维

const RADAR_LABEL_CLASSES_5 = [
  'content-eval-panel__radar-label--center-top',
  'content-eval-panel__radar-label--right-top',
  'content-eval-panel__radar-label--right-bottom',
  'content-eval-panel__radar-label--left-bottom',
  'content-eval-panel__radar-label--left-top',
] as const

function getRadarLabelClass(index: number, axisCount: number) {
  const classes = axisCount === 5 ? RADAR_LABEL_CLASSES_5 : RADAR_LABEL_CLASSES_6
  return classes[index] ?? classes[Math.floor(classes.length / 2)]
}
```

---

### T6. 改 panel 样式（5min）

**文件**：`E:/code/H5/src/pages/share/teacherProfile/components/ClassroomContentEvalPanel.vue`（**改** style 段）

**操作**：

1. 新增 `.content-eval-panel__radar-title-row`（flex 容器，tag + title 同行）
2. 新增 `.content-eval-panel__type-tag` / `--a` / `--b`（圆角 4px、内边距 2px 6px、字号 12px / 500、1px 边框）
3. 新增 `.content-eval-panel__dots`（flex 居中、padding 6px 0、gap 6px）
4. 新增 `.content-eval-panel__dot`（默认 8×8、active 16×8、颜色 #e5e6eb，active A=蓝 active B=青，过渡 220ms ease）
5. 新增 `.tp-radar-fade-enter-active` / `.tp-radar-fade-leave-active`（opacity 1→0→1，320ms）
6. 标题与 dots 间距微调（保持原有视觉密度）

**片段**：

```scss
.content-eval-panel__radar-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.content-eval-panel__type-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  background: #fff;
  border: 1px solid;
  border-radius: 4px;
  flex-shrink: 0;
}

.content-eval-panel__type-tag--a {
  color: #027aff;
  border-color: #80bcff;
}

.content-eval-panel__type-tag--b {
  color: #00bcbc;
  border-color: #80e8e8;
}

.content-eval-panel__dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 6px 0 0;
}

.content-eval-panel__dot {
  display: block;
  width: 8px;
  height: 8px;
  padding: 0;
  background: #e5e6eb;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  transition: width 220ms ease, background-color 220ms ease;
}

.content-eval-panel__dot--active {
  width: 16px;
}

.content-eval-panel__dot--active.content-eval-panel__type-tag--a,
.content-eval-panel__radar-block--a .content-eval-panel__dot--active {
  background: #027aff;
}
.content-eval-panel__dot--active.content-eval-panel__type-tag--b,
.content-eval-panel__radar-block--b .content-eval-panel__dot--active {
  background: #00bcbc;
}

.tp-radar-fade-enter-active,
.tp-radar-fade-leave-active {
  transition: opacity 320ms ease;
}
.tp-radar-fade-enter-from,
.tp-radar-fade-leave-to {
  opacity: 0;
}
```

注：scoped CSS 不支持子代 `.content-eval-panel__radar-block--a`（当前无此 class），用 `:has` 替代或简化为按"上下文"取色。更稳的写法：

```scss
.content-eval-panel__radar-block:has(.content-eval-panel__radar-title--a) .content-eval-panel__dot--active {
  background: #027aff;
}
.content-eval-panel__radar-block:has(.content-eval-panel__radar-title--b) .content-eval-panel__dot--active {
  background: #00bcbc;
}
```

`:has` 在移动端 WebView 兼容性需 ≥ iOS 15.4 / Android Chrome 105+；H5 端目标用户为 8989 端口（内嵌 WebView 较新），可接受。若回退更稳可改用 `data-cat="a"|"b"` 属性选择器。

---

### T7. ECharts option 与子类型 key 关联（3min）

**文件**：`E:/code/H5/src/pages/share/teacherProfile/components/ClassroomContentEvalPanel.vue`（**改**）

**操作**：

- `radarAOption` / `radarBOption` 的 dimensions 参数已在 T4 改为 `activeDimensionsA/B`，ECharts 会自动响应
- 雷达图 `indicator` 来自 dimensions，名称 / maxScore 自动跟随子类型切换
- 雷达图数据 series 来自 dimensions 的 score，已在 adapter 中按子类型填充
- 不需要额外 ECharts 配置修改

**校验**：

- 切换子类型时：雷达图 indicator 数量（5/6 维）变化，shape 自然变化
- 雷达图无数据时不报错（`isEmpty=true` 走空态 option）

---

### T8. 校验（5min）

**操作**：

```bash
# 1. harness 门禁
cd E:/code/frontend
pnpm harness:check

# 2. H5 项目类型检查
cd E:/code/H5
pnpm typecheck
```

预期：

- `harness:check` 无本模块相关 warning
- H5 `typecheck` 通过
- 现有 H5 端不引入新依赖（`package.json` 无 diff）
- 现有 A1/B1 数据不丢失（向后兼容保留 `categoryA.dimensions`）

---

## 2. 任务汇总

| Task | 文件 | 类型 | 估时 | 风险 |
|---|---|---|---|---|
| T1 | H5/.../composables/useSubtypeCarousel.ts | 新增 | 5min | low |
| T2 | H5/.../adapters/adapt-classroom-content-eval.ts | 改 | 3min | low |
| T3 | H5/.../adapters/adapt-classroom-content-eval.ts | 改 | 8min | low |
| T4 | H5/.../components/ClassroomContentEvalPanel.vue (script) | 改 | 5min | low |
| T5 | H5/.../components/ClassroomContentEvalPanel.vue (template) | 改 | 8min | low |
| T6 | H5/.../components/ClassroomContentEvalPanel.vue (style) | 改 | 5min | low |
| T7 | H5/.../components/ClassroomContentEvalPanel.vue (echarts) | 改 | 3min | low |
| T8 | 校验 | - | 5min | low |

总计：~42min。

## 3. 不可合并/不可跳过项

- T1 必须独立完成（composable 是其他任务的依赖）
- T2 → T3 顺序：先定义类型，再写解析
- T4 → T5 顺序：先写脚本逻辑，再加模板
- T6 依赖 T5（模板结构先有 class 名）
- T8 必须在所有实现后

## 4. 后续（E 阶段）

按 superpowers-harness-run Step E：

- E.1 一致性自检（空态、mock/真数据、多入口、失败/缺省）
- E.2 还原度自检（与 spec 5. 样式对照表对照）
- E.3 写 `archive/H5教师画像雷达图轮播切换-delivered.md` + `pnpm harness:check` + `pnpm harness:status` 确认 `DELIVERED`
