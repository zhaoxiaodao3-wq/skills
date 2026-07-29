# H5教师画像立绘渐进加载 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

代码根目录：`E:\code\H5`

## Task 1：类型与 Adapter（约 3 分钟）

1. `types/share-report.ts`：`TeacherPortraitHeroViewModel` 增加 `portraitHdUrl: string | null`
2. `adapters/adapt-share-get-report.ts`：
   - import `resolveTeacherStylePortraitHdUrl`
   - `buildHero` 在解析标清同时赋值 `portraitHdUrl`；空态 / 缺条件为 `null`

## Task 2：Composable（约 3 分钟）

新建 `src/pages/share/teacherProfile/composables/useProgressivePortraitSrc.ts`

- 逻辑照搬 PC：`displayUrl = std` → 预加载 hd → onload 替换；token 防竞态；onerror 静默

## Task 3：Hero 接入（约 3 分钟）

`components/TeacherPortraitHero.vue`：

- 用 `toRef` / computed refs 传入 `portraitUrl`、`portraitHdUrl`
- `isEmpty` → empty 图；否则用 composable 的 `displayUrl`，空则回退 empty
- `<img :src>` 绑定渐进结果

## Task 4：自检与交付（约 2 分钟）

- 有立绘：先标清再切 HD；断网 HD 时仍标清
- 勾选 spec → archive → `pnpm harness:check`
