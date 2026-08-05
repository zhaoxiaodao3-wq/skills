# 驾驶舱教师画像详情空状态 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.5.0  
**类型：** feature  
**实现仓：** `E:/code/dataView/apps-development-platform/apps/data-cockpit`  
**参考：** 校端 `E:/code/frontend/src/pages/school/teacher-portrait` 各面板「Figma 缺省态」；列表页 `tp-scenario-switch`

**P1 结论（已纠正）：** 对齐校端——**各组件内建空数据态**（图表骨架 / `--` / `暂无`），**不用**整卡 `TpEmptyState` 插画占位。

---

## 1. 目标

1. 详情页全部内容面板空数据时，展示与校端一致的**组件内建空态**（布局保留，图表为骨架缺省，文案为 `--` / `暂无` / `0`）。  
2. 开发态提供与列表页一致的 **「有数据 / 空状态」开关**，一键切换整页 empty builder。  
3. 生产构建不暴露开关。

## 2. 非目标

- 不改接口契约 / adapter 字段语义  
- 不做单卡独立空态开关  
- 不改列表页已有开关逻辑  
- **不以**共享插画 `TpEmptyState` 作为分析面板空态（分析面板禁止整卡换图）

---

## 3. 空态约定（对齐校端）

| 面板 | 空态表现 |
|------|----------|
| 教师基本信息 | 保留布局；头像占位；`--` / `暂无个人特征数据` |
| 我的教案 | 透明柱 + 轴网；总数可 `0`/`--` |
| A/B 环图 | 等分色环骨架；图例 `0` / `--` |
| 报告等级汇总 | 卡片数值 `0` |
| A/B 雷达 | 透明雷达 + 维度标签 `0` |
| 评分趋势 | 网格骨架，无线点 |
| 个人标签云 | 四模块标签行，进度条 `0%` |
| 教学风格与弹性 | 灰风格卡 + 透明雷达 + `暂无` |
| 教学风格趋势 | 缺省 X 轴 + 空折线 |
| 结构清晰度 | 透明柱 + `--`/`暂无` |
| 提问类型 | 等分色饼 + `0` |
| 语言行为 | 等分色环 + `--` |
| 语言可理解度 | gauge 仅轨道 + `--`/`暂无` |

---

## 4. DEV 数据态开关

### 4.1 UI

- 位置：`detail/index.vue` shell 顶部，**仅 `import.meta.env.DEV`**  
- 交互/样式：对齐列表页 `.tp-scenario-switch`  
- 默认：`有数据`（`forceEmptyPreview = false`）

### 4.2 行为

- `forceEmptyPreview === true`：`useDetailProfile` 各 computed 短路到 empty builder，使 `isEmpty` / `isDefaultEmpty` 为 true，**组件内建空态**生效  
- `false`：真实接口映射  
- 开关 true 时不依赖 `raw`：`v-else-if="raw || forceEmptyPreview"`

### 4.3 与 loading / error

- loading / error 在非 emptyPreview 时优先  
- emptyPreview 时可绕过 loading/error 直接渲染空态卡

---

## 5. 组件改造约定

1. **去掉**分析面板上的 `v-if + TpEmptyState` 插画分支（若已有则改回始终渲染内容区）。  
2. 空态时**仍初始化** ECharts（传入 `isEmpty` / `showEmptyChart`），渲染骨架，不要 dispose 后留白。  
3. empty builder 须给出可渲染的占位结构（如雷达维度名、标签云四模块），不能只给空数组导致无骨架。

---

## 6. 验收标准

- [ ] 切「空状态」后各内容卡为**组件内建空态**（可见轴/环/雷达骨架等），非整卡插画  
- [ ] 切「有数据」恢复接口数据  
- [ ] DEV 可见开关；生产不可见  
- [ ] 无控制台报错；列表页不受影响  

---

## 7. 实现落点

- `detail/composables/use-detail-profile.ts` — `forceEmptyPreview` + empty builders 补全占位  
- `detail/index.vue` — DEV 开关  
- 各 panel：去掉插画空态，空态仍走 chart-options / 布局占位  
