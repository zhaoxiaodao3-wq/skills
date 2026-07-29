# H5教师画像课中教学风格弹性 · 实施计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**目标仓库：** `E:\code\H5`  
**对照：** PC `src/pages/school/teacher-portrait/components/teaching-style-flexibility/`  
**日期：** 2026-07-22

## 范围

仅模块 4「教学风格与弹性特征」；挂在头图 + 教案 + 课堂评价下方。不做模块 5～10。

---

### Task 1: 常量 + Adapter

**Files (H5):**
- Create: `src/pages/share/teacherProfile/constants/teaching-style-flexibility.ts`  
  （从 PC `constants.ts` 拷齐：`TEACHING_STYLE_TYPES`、`STYLE_SELECTED_STYLES`、`SCENARIO_LEVEL_STYLES`、`STABILITY_*`、`RADAR_AXIS_ORDER`、`mapStabilityLabelToLevel` 等）
- Create: `src/pages/share/teacherProfile/adapters/adapt-teaching-style-flexibility.ts`
- Modify: `types/share-report.ts` — `ShareReportContent` 增加 `teachingStyleElasticity?`
- Modify: `adapters/adapt-share-get-report.ts` — 调用 adapter，返回 VM

**Adapter 规则：**
- 输入：`reportContent.teachingStyleElasticity`
- `styleScores`：按五风格从 `styleCounts[].count` 填齐，缺省 0
- `dominantStyle` / `auxiliaryStyle`：校验是否在五风格内
- `situations`：`situationStats` → `{ situationName, summary, level }`；`dominantLevel`「强|中|弱」→ `strong|medium|weak`
- `stability`：`mapStabilityLabelToLevel(stability)`
- `stabilityTitle` / `stabilityDescription`：吃接口文案（`useApiCopy: true`）
- `isEmpty`：无对象或五分皆 0

- [x] 常量落地  
- [x] Adapter + 接入 `adaptShareGetReport`  
- [x] 用 fixture `teachingStyleElasticity` 手测映射（主导辅助/分数/情境色档）

---

### Task 2: 雷达 chart-option

**Files (H5):**
- Create: `src/pages/share/teacherProfile/chart-options/teaching-style-radar.ts`  
  （对齐 PC `buildTeachingStyleRadarOption`：斑马底、蓝线/面积、顶点圆点；`symbolSize` / `lineWidth` / `center`/`radius` 凡像素走 `designPx()`）

- [x] option 可被 `MrEcharts` 消费  
- [x] rem 缩放正常  

---

### Task 3: 面板 UI

**Files (H5):**
- Create: `src/pages/share/teacherProfile/components/TeachingStyleFlexibilityPanel.vue`

**布局（Figma `7485:14905`）：**
1. 白卡 + 蓝条标题「教学风格与弹性特征」
2. 分卡 3+2：未选中灰；选中五色 + 胶囊「主导/辅助」；未选中徽标占位等高
3. 雷达框：外围标签五位（顶暖 / 左理 / 右严 / 左下激 / 右下权）+ `MrEcharts`
4. 稳定性条：三档配色 + 标题底部分隔线
5. 教学情境：接口文案；标签圆角 4；末行无底边

样式 token 以 Spec §4 为准；间距/字号用项目 rem 习惯（与教案/课堂评价面板一致）。

- [x] Panel 视觉对齐 Spec / Figma 截图  
- [x] 空态：灰卡、空雷达、暂无文案  

---

### Task 4: 挂载 + 交付

**Files (H5):**
- Modify: `useTeacherProfileShare.ts` — 暴露 `teachingStyleFlexibility`
- Modify: `index.vue` — 在 `ClassroomContentEvalPanel` 下挂载 Panel

**Docs (frontend):**
- Create: `docs/superpowers/V1.4.9/ui-style/H5教师画像课中教学风格弹性/archive/…-delivered.md`  
  （含「一致性自检」「还原度自检」）
- Spec 验收勾选

- [x] 页面可滚动看到模块 4  
- [x] archive + `pnpm harness:check -- --match "课中教学风格弹性"`  

---

## Out of Scope

教学风格趋势、清晰度、题型、语言行为、可理解度、标签云；改 PC；改 getReport / 分享壳。
