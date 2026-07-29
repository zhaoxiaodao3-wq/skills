# H5教师画像教学风格变化趋势 · 实施计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**目标仓库：** `E:\code\H5`  
**对照：** PC `teaching-style-trend/` + Figma `7485:15001`  
**日期：** 2026-07-22

## 范围

仅模块 5「教学风格变化趋势」；挂在教学风格弹性下方。不做 6～10。

---

### Task 1: Adapter

**Files (H5):**
- Create: `src/pages/share/teacherProfile/adapters/adapt-teaching-style-trend.ts`
- Modify: `types/share-report.ts` — `teachingStyleTrend?`
- Modify: `adapters/adapt-share-get-report.ts` — 接入 adapter

**规则：**
- 输入 `reportContent.teachingStyleTrend`
- `yAxisOrder`（下→上）：`温暖 → 理性 → 激情 → 权威 → 严厉`（Figma）
- 点位：`trendPoints` → `labels` / `dominantStyles` / `auxiliaryStyles`；index 由风格名映射，**不用** `stylePosition`
- 空态：`labels = A–Z`，`isEmpty: true`，positions 全 null

- [x] Adapter + 接入 getReport  
- [x] fixture 点位与风格名轴序一致  

---

### Task 2: Chart option

**Files (H5):**
- Create: `src/pages/share/teacherProfile/chart-options/teaching-style-trend-chart.ts`

对齐 PC 双折线：主导实线 `#027aff`、辅助虚线 `#00b42a`、`smooth`、网格虚线；字号/线宽走 `designPx`；点数 > 窗口时 inside dataZoom。

- [x] option + rem  

---

### Task 3: Panel + 挂载

**Files (H5):**
- Create: `components/TeachingStyleTrendPanel.vue`（标题+图例+155 高图框）
- Modify: `useTeacherProfileShare.ts`、`index.vue`（弹性下方）

- [x] UI 对齐 Spec §4  
- [x] 页面可见模块 5  

---

### Task 4: 交付

**Docs (frontend):**
- archive（一致性 + 还原度自检）
- Spec 验收勾选 + `pnpm harness:check -- --match "教学风格变化趋势"`

- [x] DELIVERED  

---

## Out of Scope

模块 6～10；改 PC；改 getReport / 分享壳。
