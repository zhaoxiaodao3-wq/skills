# V1.4.9 发版门禁全量解除 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**版本：** V1.4.9  
**类型：** feature  
**分类：** 发版门禁解除（注释恢复，无新功能开发）

---

## 1. 目标

一次性解除 V1.4.9 发版前通过 `TODO(1.4.9 发版门禁)` 注释隐藏的全部已完成功能，使用户可见、可用。

## 2. 范围

### 2.1 在范围内

| ID | 能力 | 文件 |
|----|------|------|
| G1 | 教师画像 · 评分趋势图表展示 | `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalView.vue` |
| G2 | 教师画像 · 评分趋势接口请求 | `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalContainer.vue` |
| G3 | 教师画像 · 分享按钮 | `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardView.vue` |
| G4 | AB 类报告 Header · 分享按钮 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportHeroHeader.vue` |
| G5 | AB 类报告 · 时间锚点点击弹窗播放 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/TimeAnchorText.vue` |
| G6 | 自主分析列表 · 排序方式筛选 + sortType 传参 | `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue` |
| G7 | 自主分析列表 · B 类教材匹配失败报告类型标红 | 同上 |

### 2.2 不在范围内

- `src/config/feature-page-access.ts`（`FEATURE_PAGE_CONTROL_LIST` 已为空）
- 路由、菜单结构变更
- 接口定义、adapter 逻辑变更（仅恢复已有调用）
- 新增 feature flag 或环境变量
- 删除 `FeaturePageAccessGate` 组件本身

## 3. 实现细节

### G1 · 评分趋势图表（View）

**文件：** `ClassroomContentEvalView.vue`

1. 取消注释 `import ScoreTrendPanel from './ScoreTrendPanel.vue'`
2. 取消注释模板 `<ScoreTrendPanel :data="data.scoreTrend" />`
3. 删除对应 `TODO(1.4.9 发版门禁)` 注释

### G2 · 评分趋势接口（Container）

**文件：** `ClassroomContentEvalContainer.vue`

1. 取消注释 `watch(activeTeacherId, ...)` 块（含 `immediate: true`）
2. 删除门禁占位代码：
   - `// 门禁期间保持空态，且不触发 fetchScoreTrend`
   - `void fetchScoreTrend`
   - `void activeTeacherId`
3. 删除 `fetchScoreTrend` 函数上的门禁 TODO 注释（函数体保留）

### G3 · 教师画像分享按钮

**文件：** `TeacherPortraitCardView.vue`

1. 取消注释 `import { AppShareLink } from '@/components/AppShareLink'`
2. 取消注释模板内 `<AppShareLink variant="solid" ... />`
3. 删除对应 TODO 注释

### G4 · AB 报告 Header 分享按钮

**文件：** `ReportHeroHeader.vue`

1. 取消注释 `import { AppShareLink } from '@/components/AppShareLink'`
2. 取消注释模板内 `<AppShareLink variant="ghost" ... />`
3. 删除对应 TODO 注释

### G5 · 时间锚点点击播放

**文件：** `TimeAnchorText.vue`

1. `handleTimeClick` 内恢复 `api?.openAt(seekSeconds)`，删除空实现与 `void handleTimeClick`
2. 模板：将 `<template v-else>{{ part.text }}</template>` 替换为可点 `<button class="time-anchor">` 版本（取消 HTML 注释）
3. 取消注释 `.time-anchor` 样式块
4. 删除模板中「门禁：有 inject 时也按纯文本展示」的 bypass 逻辑——恢复为：无 inject 时纯文本，有 inject 时可点时间段
5. 删除所有 `TODO(1.4.9 发版门禁)` 注释

### G6 · 自主分析排序筛选

**文件：** `ai-autonomous-analysis/index.vue`

1. 取消注释 `SORT_TYPE_OPTIONS` 常量
2. 取消注释筛选表单「排序方式」`ElFormItem`
3. `listPaging.filter` 恢复 `sortType: 'default'`
4. `getRecords` 的 `params` 恢复 `sortType: filter?.sortType || 'default'`
5. 删除对应 TODO 注释

### G7 · B 类教材匹配失败标红

**文件：** `ai-autonomous-analysis/index.vue`

1. 模板报告类型列：恢复 `'report-type--danger': isReportTypeHighlightRed(row) && getReportTypeDisplay(row) !== '-'`
2. 取消注释 `.report-type--danger { color: #f53f3f; }` 样式
3. 删除 `void isReportTypeHighlightRed` 占位
4. 删除对应 TODO 注释

## 4. 非功能要求

- 改动仅限上述 6 个文件，不顺手重构
- 恢复后代码应与门禁前交付态一致（以注释内原始代码为准）
- 改 `src/` 前后各跑一次 `pnpm harness:check`

## 5. 风险与依赖

| 项 | 说明 |
|----|------|
| 评分趋势 | 依赖 `getScoreTrend` 接口已在生产可用 |
| 分享 | 依赖 `AppShareLink` + 父级传入的 `resolveShareUrl`（已有接入） |
| 时间锚点播放 | 依赖 `REPORT_TIME_VIDEO_KEY` inject 与 `openAt`（已有 composable） |
| 排序 | 依赖 `teachingDiagnosisPage` 接口 `sortType` 字段（V1.4.9 已对接） |

## 6. 验收标准

- [x] G1：`ClassroomContentEvalView` 渲染 `ScoreTrendPanel`，有数据时展示趋势图
- [x] G2：切换教师时 `fetchScoreTrend` 被调用，空态/有数据态正常
- [x] G3：教师画像卡片右上角显示分享按钮
- [x] G4：AB 类报告 Hero 区显示分享按钮
- [x] G5：报告内时间文本可点击，触发视频弹窗 seek
- [x] G6：自主分析列表筛选项含「排序方式」，请求携带 `sortType`
- [x] G7：B 类且 `textbookAsrMatchStatus === 3` 时报告类型文案标红
- [x] 全项目无残留 `TODO(1.4.9 发版门禁)` 注释（本需求涉及文件）
- [x] 上述 6 个文件 lint 无新增错误
- [x] `pnpm harness:check` 通过（本模块相关警告已处理）
