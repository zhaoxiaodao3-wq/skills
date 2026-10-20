# 年级长下钻弹窗样式优化 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库根：** `E:\code\dataView\apps-development-platform`
**组件目录：** `apps\data-board\src\components\class-subject-drill-dialog\`
**执行方式：** Inline（用户 P1 明示「直接改」，P2/P3 按宽松模式合并放行）

---

### Task 1: 等级分布底色只包 label

> **Skill:** — 无匹配 · 置信度 — · 人工复核：纯 CSS/模板绑定，无 figma-MCP/echarts 专属步骤
> **文件:** `class-subject-drill-dialog.vue` + `class-subject-drill-dialog.scss`
> **步骤:**
> 1. 模板：`backgroundColor: GRADE_BG[dist.grade]` 从 `__grade` 移到 `__grade-label`
> 2. scss：`__grade-label` 增加 `border-radius:2px; padding:0 5px; line-height:18px;` 保持 12/500
> 3. `__grade` 保持 inline-flex + gap 4，去掉不再需要的底色逻辑

### Task 2: 报告等级胶囊 64×18 r2

> **Skill:** — 无匹配 · 置信度 —
> **文件:** `class-subject-drill-dialog.scss` `__report-grade`
> **步骤:** 定 `display:inline-block; width:64px; height:18px; line-height:17px; border-radius:2px; text-align:center;` 保持 12/500 + 色绑定

### Task 3: 分页居中 + 页码 8px 间距

> **Skill:** — 无匹配 · 置信度 — · Element Plus 二次定制
> **文件:** `class-subject-drill-dialog.scss` `__pagination`
> **步骤:**
> 1. `justify-content: flex-start` → `center`
> 2. `.el-pager li`、`.btn-prev`、`.btn-next` 相邻间距：`margin: 0 4px`（净 8px）；必要时 `.el-pagination__ jumper/total` 保持默认间距

### Task 4: 趋势切换器（未选圆点 + 箭头外移）

> **Skill:** — 无匹配 · 置信度 —
> **文件:** `class-subject-drill-dialog.vue` + `.scss`
> **步骤:**
> 1. 模板：`el-icon` 移出 `__tabs`，与轨道并列（外层 `__trend-switch` 或 `__trend-head` 右侧包裹）
> 2. scss：默认 `.tab-dot` = 5×5 `#80BCFF` 无 border；`.tab.is-active .tab-dot` = 10×10 box-border、border 2.5 `#E6F2FF`、bg `#027AFF`
> 3. 箭头 margin 对齐轨道外侧约 6px

### Task 5: 图表 option（网格/颜色/平滑/点）

> **Skill:** echarts · 置信度 high · [人工复核] 折线 series + 双轴 splitLine
> **文件:** `class-subject-drill-dialog.vue` `trendOption`
> **步骤:**
> 1. `xAxis.splitLine: { lineStyle: { color:'#E5E6EB', type:'solid' } }`；`yAxis.splitLine` 由 dashed 改 solid 同色
> 2. `series.smooth: true`
> 3. 分数趋势：`lineStyle.color='#FF55E3'`，`itemStyle={ color:'#FFFFFF', borderColor:'#FF55E3', borderWidth:2 }`，`symbolSize:8`
> 4. 等级趋势：`lineStyle.color='#027AFF'`，`itemStyle.color='#027AFF'`，`symbolSize:4`（或与稿一致不显点可保持小点）
> 5. 保留 dataZoom inside、tooltip formatter

### Task 6: 验证

> **Skill:** — 无匹配
> **步骤:**
> 1. 目标应用 `pnpm` 相关 lint/typecheck（vue-tsc）
> 2. 开发服目视对照 Figma token 表（还原度自检底稿）
> 3. 不顺手改其他组件
