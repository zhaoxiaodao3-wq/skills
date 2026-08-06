# 教师画像头像一倍四倍图 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 教师基本信息头像接入新 OSS 1k/4k 图片，默认 1x、4x 成功即替换。

**Architecture:** 在 `portrait-url.ts` 增加新 OSS base 的 1x/4x URL 解析；详情适配器优先返回 1x 新 URL；组件渲染 1x 后预加载 4x 并条件替换。

**Tech Stack:** Vue 3 + TypeScript + SCSS（data-cockpit）

## Global Constraints

- 只改 `apps/data-cockpit/src/views/preview/mr-teacher-portrait/` 下三个文件
- 不改 `PersonalFeatureSlice` 类型、接口契约与列表头像
- 4x 失败必须静默回退 1x

---

### Task 1：portrait-url.ts 增加 1k/4k 头像解析

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/utils/portrait-url.ts`

- [x] Step 1: 新增 `TEACHER_STYLE_AVATAR_OSS_BASE = 'https://mirayai-iot-dev.oss-cn-shenzhen.aliyuncs.com/image/cockpit/board/teacher-profile'`
- [x] Step 2: 新增 `resolveTeacherStyleAvatarUrls(primaryStyle, secondaryStyle, gender)`，复用 `buildTeacherStylePortraitFilename` 生成 `{ url1x, url4x }`

### Task 2：适配器优先返回新 1x URL

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/adapters/personal-feature.adapter.ts`

- [x] Step 1: `resolvePortraitUrl` 在有主导/辅助/性别时优先调用 `resolveTeacherStyleAvatarUrls(...).url1x`
- [x] Step 2: 风格字段缺失时保留 `stylePortraitUrl` 回退

### Task 3：teacher-basic-info 预加载 4x 并替换

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/components/teacher-basic-info/teacher-basic-info.vue`

- [x] Step 1: 模板 `:src` 改为响应式 `portraitSrc`
- [x] Step 2: watch `data.portraitUrl`：先置 1x，再 `new Image()` 预加载 4x，onload 且未过期才替换，onerror 静默
- [x] Step 3: 用递增 token 防止教师切换时旧 4x 覆盖新头像

### Task 3.5：空头像替换为 img-empty.png

**Files:**
- Create: `apps/data-cockpit/src/assets/images/teacher-portrait-detail/teacher-portrait-empty.png`
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/constants/teacher-profile-assets.ts`

- [x] Step 1: 复制 `C:\Users\YIL\Downloads\img-empty.png` 到上述资源路径
- [x] Step 2: `TEACHER_PORTRAIT_EMPTY_IMG` 改为 import 本地 PNG
- [x] Step 3: 空头像显示尺寸缩小为约 60% 并在头像区内居中

### Task 4：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教师画像头像一倍四倍图-delivered.md`

- [x] Step 1: `pnpm exec eslint` 四个改动文件通过
- [x] Step 2: 打开预览页（陈晨/物理），确认 1x 先显示、4x 替换；`4k` URL 加载失败时保留 1x
- [x] Step 3: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 4: `pnpm harness:check` + `harness:status` 显示 DELIVERED；不 commit
