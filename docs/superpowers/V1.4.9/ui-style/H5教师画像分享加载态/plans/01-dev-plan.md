# H5教师画像分享加载态 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 组件化全屏 Loading 替换分享页「加载中…」  
**Architecture:** `TeacherProfileLoading.vue` + `index.vue` 挂载；原型 `loading.html` 不进运行时  
**Tech Stack:** Vue 3、scoped SCSS、pxtorem  
**目标仓库：** `E:\code\H5`  
**日期：** 2026-07-22

## 文件地图

| 路径（H5） | 操作 |
|------------|------|
| `components/TeacherProfileLoading.vue` | 新建 |
| `index.vue` | 替换加载态 |
| `loading.html` | 保留参考或移至 fixtures（不引用） |

---

### Task 1: Loading 组件

**Create:** `src/pages/share/teacherProfile/components/TeacherProfileLoading.vue`

- 结构：环 bg + progress + book-icon + 文案 + 三点动画  
- props：`text?: string`，默认「正在加载报告」  
- 样式自 `loading.html` 迁入 scoped；去掉 setTimeout 关闭逻辑  
- `defineOptions({ name: 'TeacherProfileLoading' })`

- [x] 组件可独立渲染

---

### Task 2: 页面接入

**Modify:** `index.vue`

- `v-if="loading"` 使用 `<TeacherProfileLoading />`（可选 `Transition` 淡出）  
- 删除「加载中…」与无用 `.teacher-profile-page__loading`  
- 无效态 / 内容逻辑不动

- [x] 真加载链路显隐正确

---

### Task 3: 交付

- archive + Spec 勾选 + `pnpm harness:check -- --match "分享加载态"`

- [x] DELIVERED

---

## Out of Scope

mini-loader、iframe、改 getReport / 业务模块。
