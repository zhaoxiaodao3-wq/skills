# 教师画像头像一倍四倍图 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

教师基本信息头像替换为新的 OSS 头像：默认加载 1x（`teacher-profile/1k/`），动态预加载 4x（`teacher-profile/4k/`，文件名带 `@4x`），4x 加载成功则替换显示，失败保持 1x。

## 2. 非目标

- 不改接口契约与 `PersonalFeatureSlice` 类型
- 不改教师列表 / 教师卡片头像（沿用旧 OSS 解析）
- 不改空头像缺省图与布局样式

## 3. 现状

| 文件 | 现状 |
|------|------|
| `utils/portrait-url.ts` | 已有旧 base（`aiClassroom/aiAutonomousAnalysis`）的 1x 解析；无新 1k/4k 头像解析 |
| `detail/adapters/personal-feature.adapter.ts` | `portraitUrl` 优先用接口 `stylePortraitUrl`，否则用旧 base 计算 |
| `detail/components/teacher-basic-info/teacher-basic-info.vue` | 直接渲染 `data.portraitUrl`（1x） |

## 4. OSS 路径（用户已确认）

- 1x：`https://mirayai-iot-dev.oss-cn-shenzhen.aliyuncs.com/image/cockpit/board/teacher-profile/1k/{slug1}__{slug2}__{gender}.png`
- 4x：`https://mirayai-iot-dev.oss-cn-shenzhen.aliyuncs.com/image/cockpit/board/teacher-profile/4k/{slug1}__{slug2}__{gender}@4x.png`

## 5. 方案（已确认 A）

- `portrait-url.ts`：新增 `resolveTeacherStyleAvatarUrls`（返回 `{ url1x, url4x } | null`），复用现有文件名归一化逻辑，指向新 OSS base。
- `personal-feature.adapter.ts`：详情头像有风格字段时优先用新 1x URL；风格字段缺失再回退 `stylePortraitUrl`。
- `teacher-basic-info.vue`：先渲染 1x，再用 `new Image()` 预加载 4x；onload 成功后替换 `src`，onerror 保留 1x；切换教师时取消过期预加载。
- 空头像：`img-empty.png` 拷入 `src/assets/images/teacher-portrait-detail/teacher-portrait-empty.png`，`TEACHER_PORTRAIT_EMPTY_IMG` 改为引用本地资源。

## 6. 验收标准

- [x] `portraitUrl` 指向 `teacher-profile/1k/` 新路径
- [x] 页面先显示 1x，4x 加载成功后 `src` 切换为 `teacher-profile/4k/...@4x.png`
- [x] 4x 加载失败时保留 1x 不闪烁、不报错
- [x] 空头像缺省图与旧列表头像不受影响
- [x] 空头像显示 `img-empty.png` 内容且尺寸约 60% 居中

## 7. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空头像仍走 `TEACHER_PORTRAIT_EMPTY_IMG` |
| 常量/mock/真数据 | 新 OSS base 收进常量；mock 走同一解析 |
| 多入口 | 只改详情页教师基本信息；列表/卡片不动 |
| 失败/缺省 | 4x 失败静默回退 1x；风格缺失回退接口 URL |
