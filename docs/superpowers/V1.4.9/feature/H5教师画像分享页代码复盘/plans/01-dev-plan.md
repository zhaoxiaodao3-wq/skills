# H5教师画像分享页代码复盘 · 实施计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 复盘归档 + mockStatus 门禁 + useWxShare + 文档/jsApi 清理

---

### Task 1: mockStatus 环境门禁

**Files:** `E:\code\H5\src\pages\share\teacherProfile\share-meta.ts`、`useTeacherProfileShare.ts`

- [x] Step 1: 增加 `isShareDebugOverrideEnabled()`（dev / staging / test）
- [x] Step 2: 生产忽略 `mockStatus`

### Task 2: 抽取 useWxShare 并替换三页

**Files:**
- Create: `E:\code\H5\src\composables\useWxShare.ts`
- Modify: `teacherProfile/useTeacherProfileShare.ts`
- Modify: `analysisTeachingA/index.vue`、`analysisTeachingB/index.vue`

- [x] Step 1: 封装 initWxConfig + update/onMenu 分享
- [x] Step 2: 三处改用；文案/封面保持原值

### Task 3: closeWindow + 文档

- [x] Step 1: `useWx.ts` 移除或注释 `closeWindow`
- [x] Step 2: 更新 `H5新增类型分享页` archive 文件清单与关闭说明

### Task 4: 本模块交付

- [x] Step 1: 写本模块 archive（含复盘结论）
- [x] Step 2: `harness:check` → DELIVERED
