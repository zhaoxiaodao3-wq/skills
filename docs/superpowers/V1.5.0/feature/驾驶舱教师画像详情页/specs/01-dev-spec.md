# 驾驶舱教师画像详情页 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.5.0  
**类型：** feature（含 Figma 样式参考）  
**实现仓：** `E:/code/dataView/apps-development-platform/apps/data-cockpit`  
**参考仓：** `E:/code/frontend/src/pages/school/teacher-portrait/`  
**Figma：** [教师画像-新开窗口 `8030:30782`](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8030-30782)  
**辅助 skill：** `figma-long-page`、`frontend-design`（工程化边界，不另起视觉体系）

---

## 1. 目标

在驾驶舱侧新增教师画像**详情长页**：从组合件教师列表点击后 `window.open` 打开；页签标题「教师画像」；无左栏；整页模块对齐 frontend 右栏能力与交互；版式/边框按 Figma + 组合件三主题皮肤；数据本期固定请求指定 `tenantUserId`。

## 2. 非目标

- 不实现 frontend 左栏（教师列表/小组/我的信息）  
- 本期不做分享  
- 不做完整响应式断点（布局预留流式，窄屏可先滚动）  
- 不把详情与组合件揉进同一根 `.vue`  
- 不新建 npm 共享包（本期在 cockpit 内移植/适配 frontend 模块）

---

## 3. 信息架构与目录

```
apps/data-cockpit/src/views/preview/mr-teacher-portrait/
  mr-teacher-portrait.vue          # 现有组合件
  composables/tp-theme.ts          # 详情复用
  types/…                          # 扩展 TeacherListItem.tenantUserId
  components/teacher-card/…        # 增加点击跳转
  detail/                          # ★ 详情页根
    index.vue                      # 路由页：title / query / 布局编排
    api/get-teacher-profile.ts
    adapters/                      # 对齐 frontend adapters（可分期移植）
    composables/use-detail-profile.ts
    components/
      teacher-basic-info/          # ≈ TeacherPortraitCard
      my-lesson-plan/
      classroom-content-eval/
      teaching-style-flexibility/
      teaching-style-trend/
      classroom-structure-clarity/
      personal-tag-cloud/
      question-type/
      classroom-language-behavior/
      language-comprehensibility/
```

**路由（data-cockpit `router/index.ts`）：**

| path | 说明 |
|------|------|
| `/preview/teacher-portrait-detail` | `theme`、`tenantUserId` query；登录态与现有预览页惯例一致（同源 cookie/token） |

**document.title：** 进入页时设为 `教师画像`（`useTitle` / `document.title`）。

---

## 4. 跳转与主题

### 4.1 组合件点击

- `teacher-card`：`cursor:pointer`，点击 `window.open`  
- URL 示例：  
  `/preview/teacher-portrait-detail?theme=model-3&tenantUserId=1920356106422730753`  
- `theme` 取自 `useTpTheme()`（`model-1` \| `model-2` \| `model-3`）  
- `TeacherListItem` 增加 `tenantUserId?: string`；mock 一律填 `1920356106422730753`

### 4.2 详情页主题

- 读 `route.query.theme` → `normalizeChartTheme` → `provideTpTheme` + board CSS vars（**与组合件同一套** `board-chart.skin` / `--tp-*`）  
- 非法/缺失 theme → 默认 `model-1`

### 4.3 数据

- 读 `route.query.tenantUserId`（链路保留）  
- **本期请求写死：** `tenantUserId=1920356106422730753`  
- API：`GET /analysis/v2/teachingDiagnosis/getTeacherProfile`（base 对齐 cockpit 现有代理/环境，联调可用 test 域名）  
- 并行接口：对齐 frontend（如 `teachingStatistics`、`scoreTrend` 等模块自取），失败兜底与 frontend 语义一致（空 slice / 提示）

---

## 5. 布局与还原策略

- **流式：** 根容器 `width:100%`；内容区 `max-width:1920px; margin:0 auto`；纵向滚动  
- **无左栏：** 仅 Figma 内容区模块  
- **figma-long-page 流水线：**  
  1. Token（已取：字色 `#DBFAFF`、青 `#28DCD1`、紫 `#8B55FF` 等）  
  2. 按 metadata 大节拆帧（顶区基本信息+教案 → 中部分析行 → …）  
  3. 分段 `get_design_context`  
  4. 组装为 Vue+SCSS（禁止直接贴 MCP React/Tailwind）  
  5. 精修关  
- **数据不准：** 字段/交互以 frontend 已实现为准；Figma 定版式与边框

### 模块映射（frontend → detail）

| Figma / 区块 | frontend 参考 |
|--------------|---------------|
| 教师基本信息 | `teacher-portrait-card` |
| 我的教案 | `my-lesson-plan` |
| 课堂教学内容评价 | `classroom-content-eval`（含评分趋势） |
| 教学风格弹性 | `teaching-style-flexibility` |
| 教学风格趋势 | `teaching-style-trend` |
| 课堂结构清晰度 | `classroom-structure-clarity` |
| 个人标签云 | `personal-tag-cloud` |
| 提问类型 | `question-type` |
| 课堂语言行为 | `classroom-language-behavior` |
| 语言可理解度 | `language-comprehensibility` |

（若 Figma 某节命名不同，以结构位置为准做映射；缺节不硬造分享等非目标能力。）

---

## 6. 样式对照（Figma）

**节点：** `8030:30782` 整页；取样节 `8030:30789` 教师基本信息（MCP `get_design_context` + `get_variable_defs`）。

| 类别 | Token / 规则 | 来源 |
|------|----------------|------|
| 主字色 | `#DBFAFF`（驾驶舱字色） | variables / 稿 |
| 弱字色 | `rgba(219,250,255,0.5)` | 基本信息标签 |
| 强调青 | `#28DCD1` | class/青色；model-1 accent |
| 草绿 | `#A3DC20` | 性别等 |
| 天蓝 | `#0BAAFF` | A 类报告数字 |
| 黄 | `#FAF616` | 评价报告数字 |
| 紫描边标签 | `#8B55FF` / `rgba(139,85,255,0.2)` | 主导风格 pill |
| 姓名 | PingFang SC Semibold **30** | WEB/超级大标题 |
| 面板标题 | Semibold **16**，字色 `#DBFAFF` | 标题条「教师基本信息」 |
| 正文 | Regular **14** / Semibold **14** | WEB/正文 |
| 辅助 | Regular **12** | WEB/辅助文字 |
| 卡片圆角 | **8px**（`--web-modal-radius`） | 指标卡、标签区 |
| 标签 pill | height **30**，`border-radius: 999` | 风格标签 |
| 内容区宽 | 设计 **1860**（页边约 30）；实现用 max-width 1920 流式 | 帧宽 1920 |
| 面板标题条高 | **32** | 基本信息标题 |
| 头像区 | **352×352** | 基本信息左 |
| 主题边框 | model-1/2/3 与 `mr-teacher-portrait` / board 皮肤一致（青/蓝/紫边） | 组合件逻辑，非另起 token |

**原则：** 样式一二三只换边框/accent/board 底，**布局骨架相同**。

---

## 7. 工程约束

- Vue 3 + TS + SCSS；图表沿用 ECharts（与 frontend/cockpit 一致）  
- 模块：Container（数据）/ View（展示）边界对齐 frontend  
- 主题：字符串 InjectionKey `tpThemeId`（与组合件相同，防 HMR 失效）  
- 资源：Figma MCP 图下载到本地 assets，勿长期依赖 7 天过期 URL  
- lint / ls-lint：文件名 kebab-case；详情子路径遵守 cockpit 规范  

---

## 8. 验收标准

- [ ] 组合件点击教师 → 新标签打开详情；`document.title === '教师画像'`  
- [ ] URL 含 `theme` 与 `tenantUserId`；三主题边框/accent 与组合件一致  
- [ ] 无左栏；整页模块齐全（映射表内）；交互对齐 frontend 对应模块  
- [ ] 本期 profile 请求使用固定 `1920356106422730753`  
- [ ] 流式布局可纵向滚动；宽屏接近 Figma 结构  
- [ ] 无分享入口  
- [ ] figma-long-page 分段还原 + 精修完成（允许注明未像素级对齐的节）  
- [ ] `pnpm harness:check` 本模块文档闭环  

---

## 9. 风险

| 风险 | 缓解 |
|------|------|
| frontend 与 Figma 字段不一致 | 数据以 frontend/接口为准 |
| 模块多、工期长 | 按大节拆 Task；T0 先通跳转与空壳 |
| API 跨域/代理 | 复用 cockpit 现有 analysis 代理配置 |
| 长页性能 | 图表按需 init；复用画像性能优化经验 |

---

## 10. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 对齐 frontend 空 slice / empty-state 语义 |
| 常量/mock/真数据 | mock 仅列表跳转；详情走真 HTTP（固定 ID） |
| 多入口 | 仅组合件卡片点击；路由可直开 |
| 失败/缺省 | 请求失败提示 + 空模块兜底 |

## 11. 还原度

适用：交付 archive 须含还原度自检（对照 `8030:30782` 与关键节；方式：MCP 截图 + figma-long-page 精修清单）。
