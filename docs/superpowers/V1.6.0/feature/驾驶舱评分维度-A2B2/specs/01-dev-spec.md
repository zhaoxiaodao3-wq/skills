# 驾驶舱评分维度 A2B2 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**对齐校端 Spec：** [../../评价维度得分-A2B2/specs/01-dev-spec.md](../../评价维度得分-A2B2/specs/01-dev-spec.md)  
**实现根目录（外链）：** `e:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/`  
**Figma：** 交互/指示条参考校端 `8785:61536`；雷达舞台参考驾驶舱 `8030:31034`

## 1. 目标

驾驶舱教师画像详情 S3：`tp-dimension-radar-panel`（A / B 各一）支持 A1/A2、B1/B2 子类型轮播；类型标签 + 可点指示条；A2/B2 五维五边形；缺 2 类时仅补雷达 mock。

**非目标：** S2 环图/等级汇总、评分趋势、其它 section；不改校端 `frontend` 业务代码（本需求只改 data-cockpit）。

## 2. 数据与适配

### 2.1 维度常量

| 子类型 | 轴数 | 来源 |
|--------|------|------|
| A1 | 6 | 现有 `adapters/constants/content-eval-dimensions.ts` → `CATEGORY_A_DIMENSION_DEFS` |
| B1 | 6 | 同上 `CATEGORY_B_DIMENSION_DEFS` |
| A2/B2 | 5 | 新增 `CATEGORY_2_DIMENSION_DEFS`（与校端五维表一致） |

A2/B2：知识落实度 35 / 逻辑清晰度 25 / 导入设计 20 / 学生参与度 10 / 小结设计 10  
建议 key：`knowledgeImplementation` / `logicalClarity` / `introductionDesign` / `studentEngagement` / `summaryDesign`

### 2.2 VO / Slice

- 扩展 `PostClassReportDetailVO`：`dimensionScoreBySubtype?: { A1?, A2?, B1?, B2? }`；保留旧 `dimensionScore` → 视为 A1/B1
- `ClassroomContentEvalSlice.dimensionScores.categoryA/B` 改为子类型列表：

```ts
{ key: 'A1'|'A2'|'B1'|'B2'; label: string; dimensions: { name; score; maxScore }[] }[]
```

- ViewModel：`dimensionSubtypesA/B`；面板 props 改为接收 `subtypes`（或 Container 层拆当前子类型）
- **Mock 策略：** `FILL_MISSING_DIMENSION_SUBTYPE_2_MOCK = true`；仅当该大类已有真实 1 类分且缺 2 类时注入 A2/B2（对齐校端），不打开全局 profile mock

## 3. 交互与轮播

- 抽 `useSubtypeCarousel`（可移植校端逻辑或驾驶舱内新建同行为 composable）：`intervalMs=5000`；pause 不重置累计；`goTo` 清零；`count<=1` 不轮播、隐藏指示条
- A、B 面板各一实例（panel 内自管或 detail 层注入）
- Hover 命中：雷达 stage（图表+标签）；指示条点击立即切换

### 动画

- 优先新增 `gsap`（data-cockpit 当前无此依赖）；指示条 20×4 ↔ 10×4 水滴 morph；切换 crossfade ~300–450ms
- `prefers-reduced-motion`：瞬时切换
- 可与现有 `tp-chart-animation` 入场动画共存，互不抢 dispose

## 4. UI 结构

每个 `tp-dimension-radar-panel`：

```
panel-chrome 标题区旁或标题行内：[类型标签] + 原 title（A类评分维度得分 / B类…）
[雷达 stage：图 + 轴标签]  ← hover 暂停；轴数 6 或 5
[指示条 dots]  ← subtypeCount > 1
```

- A 标签色系跟驾驶舱 A 强调色（现有雷达线色）；B 同理
- 指示条：选中品牌色长条、未选 `#E5E6EB` 短条、gap 4；对齐校端 Figma 尺寸

## 5. 样式对照（Figma）

| 类别 | 规则 | 值 / 来源 |
|------|------|-----------|
| 面板标题 | 既有 panel-chrome | 不改标题字号体系；增量类型标签 |
| 类型标签 | 高 / pad / 圆角 / 字 | `24px` / 水平 `10px` / `4px` / Medium 12px（校端 8785:61542） |
| A 标签色 | 底 / 字 | 贴近驾驶舱 A 强调（实现时读现有 CSS 变量或雷达线色；校端参考 `#F3F9FF`/`#027AFF`，驾驶舱可用 `#0BAAFF` 体系若与面板一致） |
| B 标签色 | 底 / 字 | 同理用 B 强调色 |
| 指示条选中 | 尺寸 | `20×4`，圆角 `20` |
| 指示条未选 | 尺寸 / 色 | `10×4`，`#E5E6EB` |
| 指示条 gap | | `4px` |
| 雷达舞台 | | 保持 `8030:31034` 比例与既有 `tp-dimension-radar` 缩放逻辑 |
| 维度名/分 | | 沿用既有 label 样式；五维时换 5 套定位 class |

**稿差：** 驾驶舱无单独 A2B2 稿；交互/指示条以校端 `8785:61536` 为准，面板壳以驾驶舱为准。

## 6. 验收标准

- [x] A1/B1 六维名、满分、六边形与改前一致，并显示类型标签
- [x] A2/B2 五维五边形，维度与满分符合 §2.1
- [x] 未 hover 累计 5s 自动切；hover 暂停续计；A/B 互不影响
- [x] 指示条可点 + 三态 + 丝滑宽度过渡
- [x] 单子类型不轮播、隐藏指示条
- [x] 真实 HTTP 下仅雷达补 A2/B2 mock，其它模块仍走接口
- [x] S2 环图、等级汇总、评分趋势无回归

## 7. 主要改动面（外链 data-cockpit）

| 区域 | 路径（相对 detail/） |
|------|----------------------|
| 常量 / VO / mock | `adapters/constants/content-eval-dimensions.ts`、`api/types/teacher-profile-rsp.vo.ts`、新建 subtype mock |
| adapter / types | `adapters/classroom-content-eval.adapter.ts`、`types/classroom-content-eval.ts` |
| 轮播 | 新建 `composables/use-subtype-carousel.ts`（或等价） |
| 雷达 option | `components/classroom-content-eval/chart-options.ts`（5/6 轴） |
| 面板 | `components/classroom-content-eval/dimension-radar-panel.vue` |
| 接线 | `composables/use-detail-profile.ts`、必要时 `detail/index.vue` |
| 依赖 | `apps/data-cockpit/package.json` 增加 `gsap` |

## 8. 风险

- 驾驶舱主题色与校端蓝/青不完全一致：标签/指示条选中色跟 **本面板 variant**，勿硬套校端 hex 若冲突
- 五维标签定位需在驾驶舱舞台坐标系下目测微调
- 真接口字段对齐后关 `FILL_MISSING_DIMENSION_SUBTYPE_2_MOCK`
