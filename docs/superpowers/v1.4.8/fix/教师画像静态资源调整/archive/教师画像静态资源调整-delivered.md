# 教师画像静态资源调整 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-07  
**版本：** v1.4.8  
**Requirement:** [../requirements/静态资源清单.md](../requirements/静态资源清单.md)

## 一、需求背景

教师画像页（`src/pages/school/teacher-portrait/`）部分空态插图与 SVG 图标原先通过 Vite `import` 打包在仓库内，体积较大且不利于 CDN/OSS 预缓存。需：

1. 梳理页面全部静态图片/图标资源；
2. 将仓库内 PNG/SVG 上传阿里云 OSS；
3. 前端改为 OSS URL 引用，并删除本地冗余文件。

## 二、最终调整方案

### 2.1 OSS 目录（实际上线）

| 项目 | 值 |
|------|-----|
| Bucket（dev） | `mirayai-iot-dev` |
| Object 前缀 | `image/aiClassroom/teacherProfile/` |
| 访问基址 | `https://mirayai-iot-dev.oss-cn-shenzhen.aliyuncs.com/image/aiClassroom/teacherProfile` |

> 初稿文档曾建议 `teacherPortrait`，实际上传与代码均使用 **`teacherProfile`**。

### 2.2 已上传 OSS 并切换引用的 4 个资源

| 常量 | OSS 文件名 | 使用组件 |
|------|------------|----------|
| `TEACHER_LIST_EMPTY_IMG` | `teacher-list-empty.png` | `TeacherListView.vue` |
| `TEACHING_GROUP_EMPTY_IMG` | `teaching-group-empty.png` | `TeachingGroupView.vue` |
| `TEACHER_PORTRAIT_EMPTY_IMG` | `teacher-portrait-empty.png` | `TeacherPortraitCardView.vue` |
| `MR_GENERAL_STATISTICS_ICON` | `mr-general-statistics.svg` | `ClassroomStructureClarityView.vue`、`LanguageComprehensibilityView.vue` |

### 2.3 代码改动

**新增：**

```
src/pages/school/teacher-portrait/constants/teacher-profile-assets.ts
```

统一导出 `TEACHER_PROFILE_ASSET_OSS_BASE` 及上述 4 个完整 URL 常量。

**修改（本地 import → OSS 常量）：**

| 文件 | 变更 |
|------|------|
| `components/teacher-list/TeacherListView.vue` | `TEACHER_LIST_EMPTY_IMG` |
| `components/teaching-group/TeachingGroupView.vue` | `TEACHING_GROUP_EMPTY_IMG` |
| `components/teacher-portrait-card/TeacherPortraitCardView.vue` | `TEACHER_PORTRAIT_EMPTY_IMG` |
| `components/classroom-structure-clarity/ClassroomStructureClarityView.vue` | `MR_GENERAL_STATISTICS_ICON` |
| `components/language-comprehensibility/LanguageComprehensibilityView.vue` | `MR_GENERAL_STATISTICS_ICON` |

**删除（仓库内不再保留）：**

```
src/pages/school/teacher-portrait/assets/teacher-list-empty.png
src/pages/school/teacher-portrait/assets/teaching-group-empty.png
src/pages/school/teacher-portrait/assets/teacher-portrait-empty.png
src/pages/school/teacher-portrait/components/classroom-structure-clarity/assets/mr-general-statistics.svg
src/pages/school/teacher-portrait/components/classroom-structure-clarity/assets/mr-class-trophy.svg  （未引用，一并删除）
```

空目录 `assets/`（模块根与 classroom-structure-clarity 下）已移除。

### 2.4 未改动部分

| 类别 | 说明 |
|------|------|
| 教师风格画像 20 张 | 原本已在 OSS：`image/aiClassroom/aiAutonomousAnalysis/`，由 `teacher-style-portrait.ts` 解析，**本次未改** |
| `@miray/icons` | `MrGeneralSearch`、`MrEditHalfCheckMark`、`MrClassTrophy` 仍为 npm 内联 SVG |
| Element Plus | `IconEpArrowLeftBold` 仍为依赖库组件 |
| 图表模块 | ECharts / CSS，无静态图 |
| 其他模块同名图标 | `analysis-web`、`public/report-assets` 等处的 `mr-*` 为**独立副本**，与本次无关 |

全项目检索确认：**无其他代码** import 已删除的 teacher-portrait 本地路径。

## 三、资源清单摘要（交付后）

| 类别 | 数量 | 状态 |
|------|------|------|
| A. 空态 PNG | 3 | ✅ OSS + 代码已切换 |
| B. 统计 SVG | 1 | ✅ OSS + 代码已切换 |
| C. 风格画像 PNG | 20 | ✅ 原本已在 OSS |
| D–F. 图标组件 / 无图模块 | — | 保持现状 |

完整审计清单见 [requirements/静态资源清单.md](../requirements/静态资源清单.md)（含 C 类 20 张 URL 对照表）。

## 四、验收要点

- [ ] 教师列表空态、教学小组空/成员空态、画像卡空态图片从 OSS 正常加载
- [ ] 课堂结构清晰度、语言可理解度「综合等级」旁统计图标从 OSS 正常加载
- [ ] 教师风格画像（有数据时）仍从 `aiAutonomousAnalysis` 路径加载
- [ ] 构建产物不再包含上述 3 张 PNG（bundle 体积相应减小）

## 五、归档说明

本文档为 **fix 阶段**交付归档，记录静态资源 OSS 化最终方案与代码映射。需求调研与全量资源审计以 `requirements/` 为准；后续若 prod bucket 或路径变更，仅需调整 `teacher-profile-assets.ts` 中的 `TEACHER_PROFILE_ASSET_OSS_BASE`。
