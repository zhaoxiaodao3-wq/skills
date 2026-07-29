# H5分享封面图不显示 · 实施计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 画像分享 desc + 封面可展示

---

### Task 1: desc + 封面常量

**Files:**  
- `E:\code\H5\src\pages\share\teacherProfile\useTeacherProfileShare.ts`  
- `E:\code\H5\src\pages\share\teacherProfile\share-meta.ts`
- `E:\code\H5\public\share\teacher-profile.jpg`

- [x] Step 1: `desc` 改为 `教师画像分析报告`
- [x] Step 2: 封面改为同域 JPG（`resolveTeacherProfileShareCover`）

### Task 2: useWxShare 失败日志

**Files:** `E:\code\H5\src\composables\useWxShare.ts`

- [x] Step 1: share / timeline / checkJsApi 的 fail 回调 `console.warn`
- [x] Step 2: 确认 A/B 调用处文案未变

### Task 3: 交付

- [x] Step 1: archive + `harness:check`
