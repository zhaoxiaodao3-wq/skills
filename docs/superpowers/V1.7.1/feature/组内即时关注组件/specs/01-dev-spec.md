# 组内即时关注组件 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature（全量档） · **状态：** 待 P2 确认
**代码仓库：** `apps-development-platform/apps/data-board`
**设计稿：** Figma node `9913:46538`（待改进）/ `9913:50100`（优秀）/ `9913:50156`（平稳）/ `9913:50196`（空）——样式值经 Figma REST API 精确提取；四态截图见 `requirements/assets/`

---

## 1. 现状（相关代码事实）

- 顶部模块已交付：`overview-filters` / `overview-nav` / `overview-stat-cards` + `use-overview-query` + mock api（替换点 #4/#5）
- 下拉定制样式（200x30 灰底 `#F2F3F5` 圆角 4）目前内联在 `overview-filters.scss`，本组件需要同款下拉 → 本次抽取为共享样式文件
- 页面：`grade-overview`（正式）、`plan-lessons`（正式）、`subject-overview-2`（临时预览）、`principal-cockpit-2`（临时预览，本组件**不接入**）
- 数据权限 mock 当前值为 `campus-grade`； Element Plus 图标库可用（`@element-plus/icons-vue`，随 element-plus 安装）
- 替换点已占用：#1~#5；本次顺延 **#6**（周次/科目列表）、**#7**（组内关注数据）

## 2. 需求范围（含 P1 结论）

**做：**

1. 新业务组件 `src/components/group-focus/`：单组件数据驱动四态（待改进/优秀/平稳/空），内嵌周次筛选（三页面通用）+ 科目筛选（仅年级长，`showSubjectFilter` 开关）
2. mock 接口两个（#6/#7）：周次 mock 倒序（最新周第一=默认选中）且**不同周返回不同状态**，切换周次即可演示四态；表格 mock 多于 3 行演示滚动
3. 抽取共享下拉样式 `src/styles/el-select-filter.scss`（与 `overview-filters` 同款，二者共用）
4. 接入三页面：`grade-overview`（showSubjectFilter=true）、`plan-lessons`、`subject-overview-2`
5. 组件 README（使用方式 + 完成情况 + 对接指引）

**P1 已确认结论：** 周次/科目纯组件内部状态（不读也不写 URL）；默认选第一项（最新周）；切换即重新请求（请求序号防竞态）；评分列颜色跟随状态；加载中防闪跳；**表格默认显示 3 行、超出内部滚动**。

**不做：** 不接校长页；不做关注/取关写操作；不做分页/排序；不同步 URL。

## 3. 设计方案

### 3.1 组件结构（`src/components/group-focus/`）

> **修订记录（2026-10-16 用户反馈）：** 表格形态由「自研轻列表」改为 **Element Plus `el-table` 二次定制**（用户要求：样式与列宽按标准表格呈现）。数据契约不变（columns/rows 数据驱动），列以插槽渲染、满宽均分。

```
group-focus/
  group-focus.vue          # 骨架：标题行（标题+描述+筛选）→ 提示条 → 正文
  group-focus.model.ts     # 类型与 props
  group-focus.data.ts      # status → 主题（提示条底色/图标色/EP 图标组件）映射
  group-focus.scss
  README.md
```

- props：`showSubjectFilter?: boolean`（默认 false；仅年级长传 true）
- 内部状态：`weeks` / `subjects` 选项、`weekId` / `subjectId`、`data`、`ready`
- **四态由接口 `status` 字段驱动**，组件不含任何「角色→状态」逻辑

### 3.2 类型（`src/constants/overview.ts` 追加）

```ts
export type FocusStatus = 'improve' | 'excellent' | 'stable' | 'empty'

export interface FocusTableColumn {
  key: string
  label: string
  /** 强调列（评分）：按状态主题色渲染（improve 红 / excellent 绿）。 */
  emphasis?: boolean
}
export interface FocusTableRow {
  key: string
  cells: Record<string, string>   // column.key → 单元格文本
}
export interface FocusStatItem {
  label: string   // 报告数
  value: string   // 7
  unit: string    // 份
}
export interface GroupFocusData {
  status: FocusStatus
  summary: string                                    // 提示条一句话
  table?: { columns: FocusTableColumn[]; rows: FocusTableRow[] }  // improve/excellent
  stats?: FocusStatItem[]                            // stable（预期 4 项）
}
export interface FocusFilterOption { id: string; label: string }
```

### 3.3 mock 接口（`src/api/overview.ts` 追加，签名即契约）

- `getFocusFilterOptionsApi(showSubject: boolean)` → `{ code, data: { weeks: FocusFilterOption[], subjects: FocusFilterOption[] } }`；**#6**：周次 mock 倒序（第五周…第一周），subjects 仅 showSubject=true 时返回非空
- `getGroupFocusApi(params: { weekId: string, subjectId?: string })` → `{ code, data: GroupFocusData }`；**#7**：week-1→improve（表格 5 行，评分红）、week-2→excellent（表格 4 行，评分绿）、week-3→stable（速览 4 卡：报告数 7 份/评分均分 80 分/最高分 85 分/最低分 75 分）、week-4→empty、week-5→stable
- 接口就绪后仅改函数体为共享 http 调用

### 3.4 渲染逻辑

```
status:
  improve | excellent → 「优秀课堂」标题 + 轻列表（columns/rows 数据驱动；emphasis 列按状态着色；可视区 3 行，超出滚动）
  stable              → 「本周课堂速览」标题 + stats 卡片网格（4 列）
  empty               → 「本周课堂速览」标题 + 空态块（图标 + 文案）
提示条主题映射（group-focus.data.ts）:
  improve   → bg #FFF5F5 / icon-bg #FF2A2A / icon WarningFilled
  excellent → bg #F3FCF5 / icon-bg #00B42A / icon CircleCheckFilled
  stable|empty → bg #F2F3F5 / icon-bg #AAAAAA / icon InfoFilled
```

### 3.5 数据联动

- 挂载：拉选项（#6）→ `weekId`=weeks[0]、`subjectId`=subjects[0]（若有）→ 拉数据（#7）
- `watch [weekId, subjectId]` → 重新拉数据；**请求序号防竞态**（仅采纳最后一次）
- 加载态：`ready=false` 整块不渲染；数据刷新中保留旧内容 + 降低透明度（防闪跳）

### 3.6 页面接入（一行）

```vue
<GroupFocus :show-subject-filter="true" />   <!-- 仅 grade-overview -->
<GroupFocus />                                <!-- plan-lessons / subject-overview-2 -->
```

## 4. 样式对照（Figma）

> 提取自 node 9913:46538 / 50100 / 50156 / 50196；四态截图见 requirements/assets/。容器与顶部模块一致：白底 r8 pad20 gap20 垂直，内容宽 1640。

| 元素 | 设计值 |
|------|--------|
| 标题行（h30，左右两端对齐） | 左组 gap20：竖条 4x16 `#027AFF` + gap4 + 「组内即时关注」20px/600 `#333333`；描述「基于所选教学周的组内课堂，一句话提示该周需关注事项」16px/400 `#555555` |
| 筛选（头部右侧） | label（周次/科目）14px/400 `#333` + gap10 + 下拉 200x30 `#F2F3F5` r4（与顶部同款，抽共享样式） |
| 提示条（1640x70，r8，gap10） | 图标容器 30x30 圆形 + 白色 20px 图标；文案 20px/400 `#333333`；主题：待改进 bg `#FFF5F5`/icon `#FF2A2A`；优秀 bg `#F3FCF5`/icon `#00B42A`；平稳/空 bg `#F2F3F5`/icon `#AAAAAA` |
| 表格形态（improve/excellent，**el-table 二次定制**） | 区块标题「优秀课堂」16px/600 `#333`（与上方 gap20、与表格 gap10）；表头 h42 bg `#F3F9FF`、文字 16px/600 `#333`；数据行 h42、文字 16px/400 `#555`、行线 `#F2F3F5`；列满宽均分；评分（emphasis）列 16px/600：待改进 `#FF2A2A`/优秀 `#00B42A`；**el-table max-height 168（表头 42 + 3 行），超出内部滚动、表头固定** |
| 速览形态（stable） | 标题「本周课堂速览」16px/600；4 卡网格（395 自适应 ×109，gap20）bg `#F3F9FF` r8（设计稿未标圆角，按模块 8px 补齐备注）；卡内 label 16px/400 `#555` + 值 30px/600 `#333` + 单位 16px/400 `#555`（值与单位 gap5） |
| 空态形态（empty） | 标题同上；空态块 1640x109 bg `#F2F3F5` r8（截图目测补充）居中：图标容器 30x30 圆 `#F2F3F5` + `#777777` 纸飞机图标（EP `Promotion`）+ 「本周暂无课堂记录」20px/400 `#333` |

## 5. 影响文件清单

**新增：** `src/components/group-focus/*`（5 文件 + README）、`src/styles/el-select-filter.scss`
**修改：** `src/api/overview.ts`（追加 #6/#7 两个函数）、`src/constants/overview.ts`（追加类型）、`src/components/overview-filters/overview-filters.scss`（下拉样式改为 @use 共享文件，视觉不变）、三页面（`grade-overview.vue`、`plan-lessons.vue`、`subject-overview-2.vue` 追加一行组件）
**不动：** 路由、数据权限、顶部模块组件、`principal-cockpit-2`

## 6. 验收标准

1. [x] 三页面渲染组件：年级长页出现周次+科目两个下拉，其余两页仅周次（实测 grade-overview 2 筛选、subject-overview-2 仅周次；plan-lessons 同构）
2. [x] 默认选中第一项（第五周=最新周）；切换周次/科目 → 数据重新请求（四态实测：第五周待改进红 / 第四周优秀绿 / 第三周平稳速览 / 第二周空态，截图归档）
3. [x] 提示条三主题（红/绿/灰）与图标按 §4 对照（截图比对通过）
4. [x] 表格形态：可视区 3 行、超出滚动（mock 5 行，滚动条实测）；emphasis 列（评分）颜色随状态（红/绿实测）
5. [x] 速览形态：4 卡渲染（报告数 7 份/评分均分 80 分/最高分 85 分/最低分 75 分）；空态形态：纸飞机图标 + 文案（实测通过）
6. [x] 快速连续切换周次不出现旧数据覆盖新数据（请求序号防竞态实现并验证）
7. [x] README 齐备；`TODO(1.7.1-接口替换):` #6/#7 与归档对应
8. [x] vue-tsc 0 error；`pnpm build:data-board:develop` 成功
9. [x] 顶部模块筛选下拉样式不变（共享样式抽取无回归，浏览器确认）；校长页无此组件

> 实测备注：开发中发现两处类型严格性问题（元组解构/索引访问 undefined）已即时修复；mock 数据非法 weekId 回退平稳态。

## 7. 交付自检说明

- **一致性自检**：适用（四态切换下提示条/正文/加载态一致；mock 与真数据同源单点；三页面同组件；空态/平稳由 status 区分）
- **还原度自检**：适用（Figma 四节点 token 提取 + 截图比对；偏差逐项记录）
